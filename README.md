# Skyestone TV Calendar

A free, browser-based digital signage display designed for Skyestone HOA Fire TV devices.

## Displays
The same website can be used on:
- HOA Business
- Fitness
- Social
- Conference Room Reservation
- Fitness Room Reservations

Change `CONFIG.display` in `calendar.js` for each TV if you want a different display name.

## GitHub Pages
1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, and `calendar.js`.
3. Enable GitHub Pages from Settings > Pages.
4. Select the `main` branch and `/ (root)`.
5. Open the generated GitHub Pages address in Amazon Silk on each Fire Stick.

## Updating the calendar
Edit the `ACTIVITIES` array in `calendar.js`.
Each item has:
- date: YYYY-MM-DD
- time: 24-hour HH:MM
- title
- location

Activities that have already passed are automatically hidden. Past days are therefore removed from the active display automatically.

## Notes
This version is intentionally serverless. It uses only static files and browser JavaScript, so there is no database or paid service.
