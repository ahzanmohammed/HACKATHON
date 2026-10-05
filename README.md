# CURA-X — ASTRA 2026 Prototype

A simple, local healthcare AI cybersecurity gateway for a hackathon demonstration.

## What it demonstrates

1. Prompt injection detection and blocking
2. Synthetic patient data protection
3. Sensitive-data detection/masking
4. Risk scoring
5. High-risk AI output routed to human review
6. Security audit logging

## Safety

This project is designed for a controlled demonstration.

- Uses only synthetic patient data.
- Does not connect to real hospitals.
- Does not scan networks.
- Does not access medical devices.
- Does not access real patient records.
- Does not attack third-party services.
- Attack scenarios are simulated locally.

## Run

### Windows

Open PowerShell in this folder:

```powershell
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Then open:

http://127.0.0.1:5000

### Demo accounts

| Username | Password | Access |
| --- | --- | --- |
| `doctor` | `doctor123` | Patient analysis and human review |
| `admin` | `admin123` | Security metrics and audit log |

Set `MEDSHIELD_SECRET_KEY`, `MEDSHIELD_DOCTOR_PASSWORD`, and
`MEDSHIELD_ADMIN_PASSWORD` to override the local demo values. The built-in
credentials and in-memory audit log are for local demonstrations only.

### Linux / WSL

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then open:

http://127.0.0.1:5000

## Demo sequence

1. Click "Safe Demo"
2. Click "Attack Demo"
3. Click "High-Risk Demo"
4. Show the audit log
5. Explain that all data is synthetic

## Important

The current AI response is simulated locally so the prototype works without an external API.

For a later version, the `simulate_ai_response()` function in `app.py`
can be replaced with a real AI API call. Keep the security gateway and
human-review controls around the model.
