# Lang Builder

A browser-based editor for creating and editing Minecraft Bedrock `.lang` files, with a simple interface for managing translation entries and Minecraft text formatting.

**[Try Lang Builder](https://ph4nt0m37x.github.io/minecraft-lang-editor/)**

## Features

- **Import `.lang` files** — Load an existing language file and automatically populate the editor.
- **Edit translations** — Manage translation keys, titles, comments, and additional text.
- **Minecraft formatting** — Apply color codes, bold, and italic formatting without manually writing formatting codes.
- **Live previews** — Preview text styling while editing.
- **Export `.lang` files** — Generate and download your edited language file.
- **Custom filenames** — Choose the filename for your exported language file.
- **Client-side processing** — Files are processed locally in your browser; no backend or account is required.

## Getting Started

### Use the online editor

Visit [Lang Builder](https://ph4nt0m37x.github.io/minecraft-lang-editor/) to start creating or editing language files.

### Run locally

Requirements:
- [Node.js](https://nodejs.org/)
- npm

1. Clone the repository:

   ```bash
   git clone https://github.com/ph4nt0m37x/minecraft-lang-editor.git
   ```

2. Enter the project directory:

   ```bash
   cd minecraft-lang-editor
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal, usually `http://localhost:5173/`.

## How to Use

1. Open the editor.
2. Import an existing `.lang` file or start with a new translation.
3. Enter a translation key and its text.
4. Add extra text lines and customize their formatting.
5. Preview your changes.
6. Choose an output filename and generate your `.lang` file.

## Built With

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- CSS
- GitHub Actions
- GitHub Pages

## CI/CD

The project uses GitHub Actions to build the application and deploy it to GitHub Pages when changes are pushed to the `main` branch. The workflow can also be triggered manually.

## Disclaimer

Lang Builder is an independent community project and is not affiliated with, endorsed by, or associated with Mojang Studios or Microsoft. Minecraft is a trademark of Microsoft Corporation.
