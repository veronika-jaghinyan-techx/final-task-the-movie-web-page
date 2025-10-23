# 🎬 The Movie Web Page Clone

A front-end project to clone the design and core functionality of **The Movie Database (TMDb)** popular movies section. This application fetches and displays dynamic movie data using the official **TMDb API**.

## ✨ Features

* **Popular Movies Listing:** Dynamically fetches and displays a list of currently **Popular Movies** from the TMDb API.
* **Filters & Sorting:** Implement complex UI components to sort and filter movies by:
  * **Genres**
  * **Release Dates**
  * **Sort By** (e.g., Popularity, Vote Average)
* **Responsive Design:** A modern, mobile-first interface meticulously designed to replicate the original TMDb website look and feel.
* **Modular Codebase:** Organized structure for CSS and TypeScript files for clear separation of UI components and logic.

---

## 💻 Tech Stack

| Technology | Role |
| :--- | :--- |
| **TypeScript** | The main language used for all client-side logic, ensuring a robust and maintainable application. |
| **HTML5** | Project structure and semantic markup. |
| **CSS3** | All styling, utilizing a modular approach with separate files for variables, layouts, components, and utilities. |
| **TMDb API** | The primary data source for all movie information. |

---

## 📁 Project Structure

The project maintains a clean separation between source files, compiled output, and assets.

```
├── assets/                # Icons and images 
├── css/                   # All source CSS files 
│   ├── main.css           # Main style entry point 
│   ├── variables.css 
│   ├── base.css 
│   ├── layout.css
│   ├── header.css
│   ├── footer.css
│   ├── buttons.css
│   ├── input.css
│   ├── tooltip.css
│   ├── loader.css
│   ├── customSelect.css
│   ├── sortFilterCards.css
│   ├── releaseDates.css
│   ├── slider.css
│   ├── searchInput.css
│   ├── movieCard.css
│   └── helper.css
├── ts/                    # All source TypeScript files
│   ├── main.ts            # Application entry point and initialization 
│   ├── constants.ts 
│   ├── customSelect.ts 
│   ├── env.ts
│   ├── filterTracker.ts
│   ├── header.ts
│   ├── movies.ts
│   ├── releaseDates.ts
│   ├── searchInput.ts
│   ├── slider.ts
│   ├── tooltip.ts
│   ├── types.ts
│   └── utils.ts
├── js/                    # Compiled JavaScript files (output from 'tsc') 
├── .gitignore             # Ignores the sensitive .env file (API keys)
├── index.html             # Main entry page 
└── tsconfig.json          # TypeScript compiler configuration
```

---

## 🚀 Getting Started

To run this project locally, you need **Node.js** and **TypeScript** installed globally.

### Prerequisites

* **Node.js** (includes npm)
* **TypeScript** (`npm install -g typescript`)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone [Your Repository URL]
   cd [your-project-directory]
   ```

2. **Compile TypeScript:**
   Use the TypeScript compiler (`tsc`) to convert the `.ts` files into executable `.js` files. This step must be run before viewing the project.
   ```bash
   tsc
   ```

3. **Run with Live Server:**
   Use a local development server (like the VS Code Live Server extension or `npx http-server`) to serve the `index.html` file.
   * **Example:** If using VS Code's Live Server, right-click `index.html` and select **"Open with Live Server."**

---

## 🌐 Live Demo

The project is deployed and available for live preview:

👉 [**View Live Demo on Vercel**](https://final-task-the-movie-web-page.vercel.app/)
