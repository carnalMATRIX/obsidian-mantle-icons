# Mantle Icons

> [!NOTE]
> **Status: Beta (v1.0.0)**  
> Mantle Icons is currently in public Beta. Updates focus on expanding the built-in icon collection and optimizing rendering pathways.

Mantle Icons brings visual iconography into your Obsidian notes, sidebars, and folders. Developed as a companion plugin for the **Project Mantle** ecosystem, it integrates icons into your workspace structure to make navigation faster and notes more visually appealing.

---

## 🎨 Cohesive Styling

Mantle Icons is designed to pair with the **Zenith theme**, matching its accent colors, drop shadows, and visual balance. It leverages custom CSS targets, enabling you to style specific icon categories globally.

---

## ✨ Key Features

* **Rich Icon Set:** Integrates Lucide-based icons directly into headers, note properties, and folder lists.
* **Inline Markdown Support:** Insert icons inside your notes using simple inline syntax (e.g. `::icon-id::`).
* **Visual File Manager:** Easily attach icons to files and folders in your sidebar to organize directories visually.
* **Zero Resource Bloat:** Bundles and packages SVG definitions directly inside the code to guarantee instantaneous loading times.

---

## 📥 Installation

### Method A: Via Obsidian Community Directory (Recommended once approved)
1. Go to **Settings** > **Community plugins** > **Browse**.
2. Search for **Mantle Icons**.
3. Click **Install**, then click **Enable**.

### Method B: Via BRAT (Beta Reviewer's Auto-update Tester)
1. Install the **BRAT** plugin from Obsidian's community store.
2. In BRAT settings, click **Add Beta plugin** and enter:
   `https://github.com/carnalMATRIX/obsidian-mantle-icons`
3. Click **Add Plugin** to download and auto-update.

### Method C: Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest [GitHub Release](https://github.com/carnalMATRIX/obsidian-mantle-icons/releases).
2. Inside your vault, navigate to `.obsidian/plugins/`.
3. Create a folder named `mantle-icons` and paste the three downloaded files inside.
4. Restart Obsidian, go to **Settings** > **Community plugins**, and enable **Mantle Icons**.

---

## 🔍 Troubleshooting

### Icons are not rendering or show as boxes
* **Theme Support:** Some vintage or custom themes do not support dynamic SVG rendering. Switch to the **Zenith theme** or the default Obsidian theme to check if the icons display.
* **Data Refresh:** Force-reload your Obsidian workspace (`Cmd+R` or `Ctrl+R`) to refresh SVG icon maps.

### Inline syntax is displaying as plain text
* **Plugin State:** Ensure **Mantle Icons** is enabled under **Settings** > **Community plugins**.
* **Correct Syntax:** Make sure you are using the correct shortcode format defined in your settings (e.g., `::icon-name::` or `:icon-name:`).

---

## 🛠️ Development

If you wish to modify or add icons to this plugin locally:
1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the compiler in watch mode:
   ```bash
   npm run dev
   ```
4. Build minified production code:
   ```bash
   npm run build
   ```

---

## 📄 License

Copyright (c) 2026 Ryan Bakker. Released under a **Personal Use License**. Non-commercial, personal use only. Redistribution or modification for distribution is strictly prohibited. See the `LICENSE` file for full terms.
