# 🔴 LiveStream Studio

## Quick Start

```bash
npm install
npm run dev
```

Open **https://localhost:5173** (note **https**, not http).

> **First time only:** Your browser will show a certificate warning.
> Click **Advanced → Proceed to localhost** once — never again after that.

---

## Why HTTPS?

`getUserMedia` (camera/mic) only works in a secure context.
`@vitejs/plugin-basic-ssl` auto-generates a self-signed cert so:

- ✅ `https://localhost:5173` — same device
- ✅ `https://192.168.x.x:5173` — other devices on your Wi-Fi

---

## Joining from another device

1. Both devices on the same Wi-Fi
2. Run `npm run dev`, find the **Network** URL in the terminal:
   ```
   ➜  Network: https://192.168.1.42:5173/
   ```
3. Open that URL on the other device, accept the cert warning once

---

## Features
- 🎥 Face-to-Face video call / 📡 Live Stream broadcast
- 💬 Live chat saved to Google Sheets
- 🎙 Mic & 📷 Camera toggle
- 👁 Viewer count · ⏱ Stream timer · 🟢 Sheets sync

## Google Sheets Setup
Paste `GoogleAppsScript_Backend.js` into Apps Script, deploy as Web App
(Execute as: Me, Access: Anyone). URL is already set in `src/services/sheetsApi.js`.
