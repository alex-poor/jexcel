// Settings screen

function SettingsScreen({ theme, density }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, fontFamily: theme.sansFont }}>
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${theme.border}`,
        background: theme.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, color: theme.ink3, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Settings</div>
          <div style={{ fontFamily: theme.numFont, fontSize: 22, fontWeight: 500, color: theme.ink, letterSpacing: '-0.01em', marginTop: 2 }}>Preferences</div>
        </div>
        <Button theme={theme}>Close</Button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', background: theme.bg, padding: 24 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

          <SettingGroup theme={theme} title="Updates" subtitle="The app checks GitHub for a new release. No auto-update.">
            <SettingRow theme={theme} label="Check on launch" control={<Toggle theme={theme} on />} />
            <SettingRow theme={theme} label="Manual check" control={<Button theme={theme}>Check now</Button>} />
            <div style={{ fontSize: 12, color: theme.ink3, padding: '8px 4px 0', borderTop: `1px solid ${theme.border}`, marginTop: 4 }}>
              Current version <span style={{ color: theme.ink, fontFamily: theme.monoFont }}>v1.2.0</span> · Last checked 22 Apr 2026, 09:14 — <span style={{ color: theme.accent }}>up to date</span>
            </div>
          </SettingGroup>

          <SettingGroup theme={theme} title="Department mapping" subtitle="CSV that maps raw department strings to the two-level hierarchy.">
            <SettingRow theme={theme} label="Mapping file"
                        value={<code style={{ fontFamily: theme.monoFont, fontSize: 12, color: theme.ink2 }}>departments.csv · 284 rows</code>}
                        control={<Button theme={theme}>Open mapping</Button>} />
            <SettingRow theme={theme} label="Reset to shipped defaults" control={<Button theme={theme}>Reset</Button>} />
          </SettingGroup>

          <SettingGroup theme={theme} title="Data" subtitle="Nothing ever leaves this machine.">
            <SettingRow theme={theme} label="Current file"
                        value={<code style={{ fontFamily: theme.monoFont, fontSize: 12, color: theme.ink2 }}>Notify-11-76-226.xlsx</code>} />
            <SettingRow theme={theme} label="Default year window"
                        control={<select style={{ padding: '6px 10px', fontSize: 13, fontFamily: theme.sansFont, border: `1px solid ${theme.border}`, borderRadius: 6, background: theme.surface, color: theme.ink }}><option>Last 5 calendar years (rolling)</option><option>Last 3 years</option><option>All available</option></select>} />
            <SettingRow theme={theme} label="Clear loaded data" control={<Button theme={theme}>Unload</Button>} />
          </SettingGroup>

          <SettingGroup theme={theme} title="About" subtitle="">
            <div style={{ padding: '6px 4px', fontSize: 13, color: theme.ink2, lineHeight: 1.55 }}>
              Incident Reporting is a desktop-only tool for hospital H&S teams. It runs offline, stores no data outside the file you load, and makes no network calls except optional release checks to GitHub.
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: theme.accent, marginTop: 8 }}>
              <span>Release notes</span>
              <span>Technical appendix</span>
              <span>Licences</span>
            </div>
          </SettingGroup>

        </div>
      </div>
      <UpdateFooter theme={theme} state="uptodate" />
    </div>
  );
}

function SettingGroup({ theme, title, subtitle, children }) {
  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 22 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: theme.numFont, fontSize: 16, fontWeight: 600, color: theme.ink }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: theme.ink3, marginTop: 3 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}
function SettingRow({ theme, label, value, control }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 4px',
      borderTop: `1px solid ${theme.border}`,
      gap: 12,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 13, color: theme.ink }}>{label}</div>
        {value && <div>{value}</div>}
      </div>
      <div>{control}</div>
    </div>
  );
}
function Toggle({ theme, on }) {
  return (
    <div style={{
      width: 34, height: 20, borderRadius: 10,
      background: on ? theme.accent : theme.borderStrong,
      position: 'relative', transition: 'background .15s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 16 : 2,
        width: 16, height: 16, borderRadius: 8, background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        transition: 'left .15s',
      }} />
    </div>
  );
}

Object.assign(window, { SettingsScreen });
