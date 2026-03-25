# QR Attendance System v5

Upload 4 files → deploy to GitHub Pages → done.

---

## All 8 changes implemented

| # | Change | How it works |
|---|--------|-------------|
| 1 | **Unique IDs instead of OTP** | Admin generates IDs in format `LEC-XXXXXXXXXX` from a pool of **1.1 trillion** (32^10). Each ID is issued once and claimed on signup. |
| 2 | **One super admin, restricted co-admins** | First visit to Admin creates the super admin (one time only). Co-admins can only view their department's data, assign IDs, revoke IDs. They cannot see the super admin panel or other departments. |
| 3 | **Lecturer signup/session syncs live** | On signup and on session start, data is written to Firebase and a BroadcastChannel message is sent. Super admin and co-admins see updates immediately. |
| 4 | **Location fence ON by default** | `A.locOn = true` on init. The toggle starts in the ON position. Lecturers can turn it off if needed. |
| 5 | **Excel files per course per lecturer** | Two Excel sheets per course: (1) Full attendance list across all sessions, (2) Frequency table — how many times each student ID signed in, with percentage. |
| 6 | **Overall database for admins** | Super admin sees all sessions across all institutions. Co-admin sees only their institution+department. Both can export Master Excel filtered by institution/course. |
| 7 | **Co-admin sees their dept only** | Co-admins sign up with institution + department. All their views (lecturers, sessions, database) are filtered to matching institution+department. |
| 8 | **Co-admin signup with super admin approval** | Co-admins apply via a signup form. Super admin sees a notification dot on the Co-Admins tab and must click Approve or Reject. Approved co-admins can log in; rejected ones are deleted. |

---

## Deploy to GitHub Pages

1. Upload all 4 files (`index.html`, `sw.js`, `manifest.json`, `README.md`) to a GitHub repo root
2. Settings → Pages → Deploy from branch → main / root → Save
3. Live at `https://<username>.github.io/<repo>/`

---

## First-time setup

1. Open the app → click **Admin**
2. You'll see a **"Create Super Admin"** form (shown only once, ever)
3. Fill in name, institution, email, password → **Create super admin account**
4. Sign in with those credentials
5. Go to **Unique IDs** → Generate IDs for each lecturer → copy and send to them
6. Lecturers visit the site → **Lecturer → Register with your Unique ID**
7. Students only scan the QR code — no login needed

---

## Firebase Setup (10 min) — required for real cross-device sync

1. https://console.firebase.google.com → Add project
2. Build → **Realtime Database** → Create → test mode
3. Project Settings → Your Apps → Web `</>` → copy config
4. Paste into `index.html` replacing the `FB_CFG` block

**Database rules:**
```json
{
  "rules": {
    "superAdmin": { ".read": "auth != null", ".write": "auth != null" },
    "coAdmins":   { ".read": "auth != null", ".write": "auth != null" },
    "lecturers":  { ".read": true, ".write": "auth != null" },
    "sessions":   { ".read": true, "$id": { ".write": true } },
    "uids":       { ".read": "auth != null", ".write": "auth != null" },
    "backup":     { ".read": "auth != null", ".write": "auth != null" }
  }
}
```

---

## Unique ID pool: 999 billion+

Format: `LEC-` + 10 characters from 32-char alphabet (A-Z, 2-9, no confusing chars O/0/I/1)

32^10 = **1,099,511,627,776** (over 1 trillion possible IDs)

IDs are generated on demand (not pre-generated) so there is no startup cost. Uniqueness is checked before issuing.

---

## How real-time student check-in works

```
Student scans QR
  ↓
Session data decoded from URL (base64) — works offline, no network needed
  ↓
Student submits check-in
  ↓ DB.pushRecord() writes to:
     • localStorage (always)
     • Firebase /sessions/ID/records (when online)
     • BroadcastChannel message (same browser fallback)
  ↓
Firebase .on('value') fires on ALL connected clients
  ↓
Lecturer's renderLiveAtt() updates — student appears within ~200ms
```
