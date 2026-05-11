git # Blue Node Frontend

Frontend website for Blue Node Foundation, built with React and Vite.

The site currently includes:
- Separate hash-based pages for `Home`, `About`, `Programs`, `Impact`, `Contact`, and `Socials`
- A mobile hamburger navigation for smaller screens
- Program gallery pages connected to Google Drive folders
- Program thumbnails sourced from selected Google Drive images
- A landing-page footer with social links, copyright, and developer credit

## Tech Stack

- React 18
- Vite 5
- Plain CSS

## Project Structure

```text
src/
  App.jsx        Main app layout, page routing, program/gallery data
  main.jsx       React entry point
  styles.css     Global styling and responsive layout rules

public/
  assets/images/ Static assets such as the foundation logo
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Routing

This project uses lightweight hash-based routing instead of `react-router`.

Examples:
- `#home`
- `#about`
- `#programs`
- `#impact`
- `#contact`
- `#socials`
- `#program/<program-slug>`

This keeps deployment simple while still allowing separate views for each page and each program gallery.

## Program Galleries

Each program card links to a dedicated gallery view that embeds the matching public Google Drive folder.

Current program categories:
- School Outreach
- Healthcare Outreach
- Skills Empowerment
- Food Outreach
- Wears Outreach
- Environmental Cleanup

If gallery folders or thumbnails need to be changed, update the `programs` array in [src/App.jsx](./src/App.jsx).

## Content Notes

- Program thumbnails currently use Google Drive thumbnail URLs generated from selected public file IDs.
- Social links are defined in `src/App.jsx`.
- The landing-page footer includes the current copyright line and developer credit.

## Deployment

Because the app uses Vite and hash-based routing, it can be deployed easily to most static hosts, including:
- Netlify
- Vercel
- GitHub Pages
- Shared/static hosting environments

## Developer

Developed by Airis.
