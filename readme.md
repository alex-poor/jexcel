# incident reporting

in this project we want to build an easy automated way to ingest poor quality data from excel and turn into reliable reporting.


## example
example report is available at Notify-11-76-226.xlsx

one row == one incident report

### Key fields
- incident involved. denotes the person the incident relates to, and categorises them. One value per incident. CRITICAL.
- summary. free text narrative describing incident. This should be used to derive category of incident as comparator to that entered by user.
- incident status. current status of the icnident. closed = abandoned. if completed or closed then use last modified date as proxy for 'date completed'/closed.
- date of incident. date the incident occurred. this is produced for some god forsaken reason as DD-MM-YYYY but it should be conformed to ISO 9601.
- Department/Area. Location of the incident. See below (## department grouping) for grouping process for this item.
- date modified. use this as proxy for date of completion/closed if status is completed/closed. note previous comment about date format.
- created on. date the incident was reported.  note previous comment about date format.
- result in harm? bool
- near miss? bool
- type of incident. exclude values not in ('hazard','occ health/safety').
- incident type. indicates nature of incident.

### solution
produce aggregated reporting/trend analysis from above data points, encompassing quantitative measures in below example:



THEATRE INCIDENTS REPORT

Analysis of Theatre‑Related Health & Safety Events

Reporting Years: 2024, 2025, 2026

1. Overview of Theatre Incident Volumes (2024–2026)

Theatre‑related incidents were filtered by Department/Area fields containing the term "theatre", and grouped by incident year.

Total Theatre Incidents per Year

Year
	

Number of Incidents

2024
	

46

2025
	

39

2026
	

6

Key Insight:
2024 had the highest Theatre incident volume, while 2026 is notably lower (likely reflecting an incomplete reporting year).

2. Incident Type Distribution (% Within Year)

This section shows how Theatre incidents were distributed across the high‑level categories Occ Health & Safety and Hazards, limited to 2024–2026.

High‑Level Breakdown

Year
	

Occ Health/Safety
	

Hazards

2024
	

40 (86.96%)
	

6 (13.04%)

2025
	

35 (89.74%)
	

4 (10.26%)

2026
	

5 (83.33%)
	

1 (16.67%)

Key Insight:
Across all years, Occ Health/Safety incidents dominate Theatre reporting (>83% each year).

3. Detailed Breakdown of Theatre Incident Sub‑Categories

This expands the Occ Health/Safety category into its core types such as Sharps, Manual Handling, Exposure, Psychological, Slips/Trips, Falls and Superficial Injuries.

All percentages = % of Theatre incidents within that year.

3.1 Theatre Sub‑Category Breakdown – 2024

(46 total incidents)

Sub‑Category
	

Count
	

% of 2024

Sharps Injury
	

17
	

36.96%

Exposure
	

5
	

10.87%

Manual Handling
	

4
	

8.70%

Patient Related Manual Handling
	

4
	

8.70%

Fall
	

3
	

6.52%

Superficial Injury (bruise/cut
	

3
	

6.52%

Slip / Trip (Same Level)
	

2
	

4.35%

Electric Shock
	

1
	

2.17%

Psychological
	

1
	

2.17%

Foreign Body (dust)
	

1
	

2.17%

Key Highlights for 2024:

    Sharps‑related events were the most frequent (nearly 37%).
    Manual Handling (including patient‑related) contributed to ~17% combined.
    Slips/Trips and Falls combined ~11%.

3.2 Theatre Sub‑Category Breakdown – 2025

(39 total incidents)

Sub‑Category
	

Count
	

% of 2025

Sharps Injury
	

16
	

41.03%

Manual Handling
	

5
	

12.82%

Struck By / Bump Object
	

5
	

12.82%

Exposure
	

3
	

7.69%

Patient Related Manual Handling
	

2
	

5.13%

Foreign Body
	

1
	

2.56%

Slip / Trip
	

1
	

2.56%

Superficial Injury
	

1
	

2.56%

Ergonomic Hazard
	

1
	

2.56%

Key Highlights for 2025:

    Sharps injuries increased to 41%, the highest of any year.
    "Struck By/Bump Object" emerged prominently (12.82%).
    Overall manual‑handling‑related categories remain significant (~18%).

3.3 Theatre Sub‑Category Breakdown – 2026

(6 total incidents)

Sub‑Category
	

Count
	

% of 2026

Sharps Injury
	

1
	

16.67%

Exposure
	

1
	

16.67%

Manual Handling
	

1
	

16.67%

Patient Related Manual Handling
	

1
	

16.67%

Superficial Injury
	

1
	

16.67%

Key Highlights for 2026:

    Lower volumes mean each sub‑category contributes equally (16.67%).
    Early indicators show fewer sharps‑related incidents.

4. Timeframe Analysis (Average Event Durations)

This section presents the average number of days between:

    AM: Incident Occurred → Incident Reported
    AL: Incident Reported → Incident Closed

Limited to Theatre incidents only (2024–2026).

Year
	

Avg Days (Occurred → Reported)
	

Avg Days (Reported → Closed)

2024
	

8.54 days
	

76.61 days

2025
	

1.41 days
	

61.38 days

2026
	

8.00 days
	

14.83 days

Interpretation

    Reporting Lag:

        2025 showed dramatically improved reporting time (1.41 days average).
        2024 and 2026 averaged ~8 days.

    Closure Durations:

        2024 experienced very long closure times (76.6 days).
        2026 shows a major improvement with 14.8 days, though incident volume is low.

5. Overall Conclusions & Insights

Sharps remain the greatest clinical risk

Sharps injuries consistently dominate Theatre safety events, reaching 41% in 2025. Their frequency suggests the value of:

    Enhanced sharps handling protocols
    Double‑gloving compliance audits
    Simulation-based training for suturing and passing instruments

Manual Handling is a persistent contributor

Combined Manual Handling + Patient‑related Manual Handling contributes:

    17% in 2024
    ~18% in 2025
    33% in 2026 (small dataset)

Opportunities:

    Role‑specific ergonomics refreshers
    Theatre equipment reviews (table height, positioning aids)

Reporting and closure times improved significantly in 2025–2026

    Reporting lag dropped sharply (1.41 days in 2025).
    Closure durations improved dramatically in 2026.

Potential contributors:

    Increased compliance focus
    Stronger reporting culture
    Improved workflow between Theatre leadership and Risk/Quality teams

 

 

🎭 Theatre Incidents Resulting in Harm

Percentage of "Yes" responses per year

Year
	

% of Theatre Incidents Resulting in Harm

2024
	

58.70%

2025
	

61.54%

2026
	

66.67%

 

 

🎭 Theatre – Near Miss ("Yes") Percentages by Year

(Column AB: "Near Miss?")

Year
	

% of Theatre Incidents That Were Near Misses

2024
	

19.57%

2025
	

25.64%

2026
	

33.33%

📌 Interpretation

✔ Near miss reporting is increasing year‑on‑year

There is a clear upward trend:

    2024 → 2025: Increase of ~6 percentage points
    2025 → 2026: Increase of ~8 percentage points

✔ 2026 has the highest percentage of near misses

Despite lower total incident volumes in 2026, a higher proportion of Theatre events are being correctly recognised and logged as near misses.

✔ This may reflect:

    Better safety culture around proactive reporting
    Stronger staff awareness of near miss definitions
    Improved training or onboarding in clinical areas

## solution
this will ultimately be a tauri app which will ingest new excel data and produce above output. for now, I want you to build the rules engine in an appropriate language/framework which can parse the example file and produce the required reporting in terminal for sense checking.

use venv/myenv for python calls

## department grouping

reporting to be split by department, but this field should be grouped according to this mapping:

``` format=csv
"original","new"
Administration,Administration
Board room,Administration
Cafe,Commercial: Hospitality
Cancer Care,Cancer Care
Cardiac Day Ward,Patient services: Cardiac Day Ward
Carpark,Commercial: Facilities: Car park
Clinical Write Up Room,Patient services: clinical write up room
CSSD,Theatre: CSSD
Endoscopy,Patient Services: Endoscopy
Finance House,Administration
Grounds,Commercial:  Facilities
Hospital Wide,Commercial: Facilities
Housekeeping and Facilities,Commercial: Housekeeping and facilities
Kea Ward,Patient Services: Kea
Kitchen,Commercial: Hospitality
Laundry,Commercial: Laundry
MCVS,MCVS
Medical Records Room,Commercial: Medical records
Off Site,Off Site
PACU,Patient Services: PACU
Plant Room,Commercial: facilities
Pre-Admission ,Patient Services: Pre-Admission
Reception,Commercial: reception
SCU,Patient Services: SCU
Senior Leadership Corridor,Administration
Service Corridors,Commercial: hospitality
Staff Carpark,Commercial: staff caprark
Stairwells,Commercial: facilities
Stores,Commercial: stores
Theatre Change Room,Theatre: Theatre change room
Theatre Services,Theatre: Theatre services
Theatre Suite,Theatre: Theatre suite
Theatre Tea Room,Theatre: Theatre tea room
Tui Ward,Patient Services: Tui Ward
Upstairs Courtyard,Commercial: facilities
Upstairs Tea Room,Commercial: facilities
Ward Change Room,Patient Services: ward change room
Ward: Day-Stay Ward,Patient services: day-stay ward
Ward: In-Patient Ward,Patient Services: In-patient Ward
```

the mapping breaks department into two levels. the first higher level is the first text value in the second field.

where there is a ":" and a following string this denotes a second level.

map department values accordingly.