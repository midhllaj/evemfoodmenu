# Evam Catering Quotation App

Android-first React Native/Expo app for creating premium catering menu quotations and sharing branded PDFs.

## Brand Theme

The attached bill pad is used only for the palette:

- Deep green: `#073F35`
- Warm gold: `#D6A51E`
- Ivory background: `#F9F7F0`
- Soft cream surfaces: `#FFFDF7`

The PDF layout is intentionally proposal-style, not an invoice copy.

## Features

- Dashboard with New Menu, Templates, PDF History, Food Database, Customers, and Settings.
- Customer and event details capture.
- Searchable menu builder with global search and per-heading search.
- Heading management with show/hide and instant heading creation.
- Food category chips with multi-select.
- Kerala Sadya auto-selects traditional items.
- Dish checkboxes with optional quantity and remarks.
- Add dishes locally from mobile.
- Long-press dish actions for favorite, duplicate, delete, and moving from database.
- Offline persistence using local device storage.
- Premium A4 PDF generation and Android share sheet for WhatsApp/download/print flows.
- Light/dark mode using the Evam palette.

## Run

```bash
npm install
npm run start
```

Then open on Android through Expo Go or run:

```bash
npm run android
```
