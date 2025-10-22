# Final Task — Movie Web Page

A small, responsive movie web page implemented with plain HTML, CSS and JavaScript. Intended as a final assignment demonstrating layout, responsive design, accessibility and basic client-side interactivity.

Demo

- Live demo (replace with your URL): https://your-username.github.io/final-task-the-movie-web-page/

Folder / file structure

```
final-task-the-movie-web-page/
├── README.md
├── index.html
├── .gitignore
├── src/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── data/
│       └── movies.json
├── assets/
│   ├── images/
│   │   └── poster-*.jpg
│   └── icons/
├── dist/                   # build output (if any)
└── tests/                  # optional unit / integration tests
  └── ...
```

General overview

- Single-page layout showcasing movies, details and trailers.
- Responsive grid/list view for movie cards.
- Accessible markup (semantic HTML, proper alt text, focus states).
- Client-side filtering/sorting and a modal for details/trailer playback.
- Static JSON or API-driven data source (src/data/movies.json).

How to run locally

- Prerequisites: Node.js + npm.
- Install TypeScript (globally or as dev dependency) and compile:
  - Globally: `npm install -g typescript`
  - Or dev dependency: `npm install --save-dev typescript`
  - Compile: `npx tsc` or `tsc` (will emit JS to configured outDir)
- Serve with Live Server:
  - VS Code: install the Live Server extension and click "Open with Live Server" on index.html.
  - Or CLI: `npx live-server` (or `npx http-server`) then open the provided URL (e.g., http://127.0.0.1:8080).
- Notes:
  - Ensure compiled JS output from TypeScript is placed where index.html expects it (update script src if needed).
  - For quick testing you can open index.html directly, but some features (fetching JSON) may require a server.

Customization

- Replace assets/images and src/data/movies.json with your own content.
- Update the demo link to point to your GitHub Pages or deployed site.
