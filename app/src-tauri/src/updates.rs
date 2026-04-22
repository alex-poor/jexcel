//! GitHub release polling for the update widget.
//!
//! Hits the public releases API, compares the latest tag against the
//! compile-time `CARGO_PKG_VERSION`, and reports one of three states.
//! Network failures collapse to `Offline` — the frontend must never see a
//! hard error and never show a blocking modal (per the design brief).
//!
//! To wire the check to a real repo, set the `repository` field in
//! `Cargo.toml` to `https://github.com/OWNER/REPO`. Until that's done, or
//! whenever the repo is unreachable, the widget reports `Offline`.

use std::time::Duration;

use serde::{Deserialize, Serialize};

const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");
const REPO_URL: Option<&str> = option_env!("CARGO_PKG_REPOSITORY");

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "state")]
pub enum UpdateStatus {
    UpToDate {
        current_version: String,
    },
    Available {
        current_version: String,
        latest_version: String,
        release_url: String,
    },
    Offline {
        current_version: String,
    },
}

#[derive(Debug, Deserialize)]
struct Release {
    tag_name: String,
    html_url: String,
}

/// Parse an `https://github.com/OWNER/REPO(.git)?` URL → `(owner, repo)`.
fn parse_repo_url(url: &str) -> Option<(String, String)> {
    let rest = url.strip_prefix("https://github.com/").or_else(|| url.strip_prefix("http://github.com/"))?;
    let rest = rest.trim_end_matches('/').trim_end_matches(".git");
    let mut parts = rest.splitn(2, '/');
    let owner = parts.next()?.to_string();
    let repo = parts.next()?.to_string();
    if owner.is_empty() || repo.is_empty() || owner == "OWNER" || repo == "REPO" {
        return None;
    }
    Some((owner, repo))
}

pub async fn check() -> UpdateStatus {
    let current = CURRENT_VERSION.to_string();

    let Some((owner, repo)) = REPO_URL.and_then(parse_repo_url) else {
        // No real repo configured yet — surface as offline so the UI shows
        // a neutral message rather than a fake "up to date".
        return UpdateStatus::Offline {
            current_version: current,
        };
    };

    let url = format!("https://api.github.com/repos/{owner}/{repo}/releases/latest");
    let client = match reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .user_agent(format!("incident-reporting/{CURRENT_VERSION}"))
        .build()
    {
        Ok(c) => c,
        Err(_) => return UpdateStatus::Offline { current_version: current },
    };

    let Ok(resp) = client.get(&url).send().await else {
        return UpdateStatus::Offline { current_version: current };
    };
    if !resp.status().is_success() {
        return UpdateStatus::Offline { current_version: current };
    }
    let Ok(release) = resp.json::<Release>().await else {
        return UpdateStatus::Offline { current_version: current };
    };

    let latest_raw = release.tag_name.trim_start_matches('v').to_string();
    match (semver::Version::parse(&current), semver::Version::parse(&latest_raw)) {
        (Ok(a), Ok(b)) if b > a => UpdateStatus::Available {
            current_version: current,
            latest_version: latest_raw,
            release_url: release.html_url,
        },
        (Ok(_), Ok(_)) => UpdateStatus::UpToDate {
            current_version: current,
        },
        // Unparseable version → treat as offline rather than guessing.
        _ => UpdateStatus::Offline { current_version: current },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_repo_urls() {
        assert_eq!(
            parse_repo_url("https://github.com/foo/bar"),
            Some(("foo".to_string(), "bar".to_string()))
        );
        assert_eq!(
            parse_repo_url("https://github.com/foo/bar.git"),
            Some(("foo".to_string(), "bar".to_string()))
        );
        assert_eq!(
            parse_repo_url("https://github.com/foo/bar/"),
            Some(("foo".to_string(), "bar".to_string()))
        );
        assert_eq!(parse_repo_url("https://github.com/OWNER/REPO"), None);
        assert_eq!(parse_repo_url("not a url"), None);
    }
}
