# HalalServices 🌙

A comprehensive, community-maintained directory of **halal businesses and services** across **Glasgow**, built as a static web application.

## 📂 Categories

| # | Category | Sub-categories |
|---|---|---|
| 1 | 🏗️ **Events & Milestones** | Marriage Halls · Catering & Decor · Funeral Services |
| 2 | 🕋 **Faith & Education** | Mosques · Madrasas · Islamic Tutors · New to Islam |
| 3 | 💰 **Finance & Professional** | Islamic Finance · Legal & Solicitors · Accountants |
| 4 | 🤝 **Community & Youth** | Youth Programs · Charities · Women's Circles |
| 5 | 🌿 **Health & Wellness** | Counseling · Hijama Clinics · Muslim-Friendly Gyms |
| 6 | 🌍 **Global & Online Services** | Hajj & Umrah · E-Bazaar |

## 🏗️ Project Structure

```
HalalServices/
├── index.html          # Main single-page application
├── css/
│   └── styles.css      # Custom styles (Bootstrap 5 base)
├── js/
│   └── app.js          # Search, filtering, and rendering logic
└── data/
    └── services.json   # All service listings by category
```

## 🚀 Usage

Open `index.html` in any modern browser — no build step required.

To serve locally:

```bash
# Python 3
python -m http.server 8080
# Then visit http://localhost:8080
```

## ✏️ Adding / Updating Listings

All service data lives in [`data/services.json`](data/services.json). Each entry follows this shape:

```json
{
  "name": "Business Name",
  "address": "Street, Glasgow GXX",
  "phone": "0141 000 0000",
  "website": "https://example.com",
  "notes": "Brief description of the service."
}
```

To add a new listing, edit the relevant subcategory in `services.json` and open a pull request.

## 🤝 Contributing

1. Fork the repository
2. Add or correct a listing in `data/services.json`
3. Open a pull request with a clear description

> ⚠️ Always verify contact details before submitting. Listings are community-contributed and may change.

## 📜 Licence

MIT — free to use, share, and adapt.

