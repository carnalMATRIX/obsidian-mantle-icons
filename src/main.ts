import { Plugin, setIcon, TFile, TFolder, MarkdownView, TAbstractFile } from "obsidian";
import { icons, createElement } from "lucide";
import { IconSuggester } from "./IconSuggester";
import { IconPickerModal } from "./IconPickerModal";

// Helper to convert typed text like 'alert-circle' back to 'AlertCircle'
function toPascalCase(str: string) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

interface MantleIconsSettings {
  folderIcons: Record<string, string>;
}

const DEFAULT_SETTINGS: MantleIconsSettings = {
  folderIcons: {}
};

export default class MantleIcons extends Plugin {
  settings!: MantleIconsSettings;

  // The onload method fires when the plugin is enabled in Obsidian
  async onload() {
    await this.loadSettings();

    // 1. REGISTER: Inline Typing Menu (Disabled suggestion menu when typing ':')
    // this.registerEditorSuggest(new IconSuggester(this.app));

    // 2. EVENT: Context Menu "Change Icon"
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        menu.addItem((item) => {
          item
            .setTitle("Change icon")
            .setIcon("lucide-image")
            .onClick(() => {
              new IconPickerModal(this.app, file, this).open();
            });
        });
      })
    );

    // 3. COMMAND: Change active page icon
    this.addCommand({
      id: "change-page-icon",
      name: "Change page icon",
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (file) {
          if (!checking) {
            new IconPickerModal(this.app, file, this).open();
          }
          return true;
        }
        return false;
      },
    });

    // 4. EVENT: Update icons when a file is opened
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        if (file) this.injectPageIconUI(file);
      }),
    );

    // 3. EVENT: Update icons when frontmatter changes
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (file === this.app.workspace.getActiveFile()) {
          this.injectPageIconUI(file);
        }
        this.updateFileExplorerIcons();
      }),
    );

    // 4. EVENT: Initial injection when Obsidian fully loads
    this.app.workspace.onLayoutReady(() => {
      this.updateFileExplorerIcons();
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile) this.injectPageIconUI(activeFile);
    });

    // 5. REGISTER: Inline Markdown renderer
    this.registerMarkdownPostProcessor((element, context) => {
      const regex = /:([a-zA-Z0-9-]+):/g;

      element.innerHTML = element.innerHTML.replace(
        regex,
        (match, iconName) => {
          const temp = document.createElement("span");
          temp.addClass("mantle-inline-icon");

          const pascalKey = toPascalCase(iconName);

          // @ts-ignore
          const lucideIcon = icons[pascalKey];

          if (lucideIcon) {
            // It's in the full Lucide library
            const svg = createElement(lucideIcon);
            temp.appendChild(svg);
          } else {
            // Fallback to native Obsidian icons just in case
            setIcon(temp, iconName);
          }

          return temp.outerHTML;
        },
      );
    });

    // 7. EVENT: Default icons for new items
    this.registerEvent(
      this.app.vault.on("create", async (file) => {
        // Wait a bit to ensure metadata is processed or content is written
        setTimeout(async () => {
          if (file instanceof TFolder) {
            // Only set default if not already in settings
            if (!this.settings.folderIcons[file.path]) {
              this.settings.folderIcons[file.path] = "folder";
              await this.saveSettings();
            }
          } else if (file instanceof TFile && file.extension === "md") {
            const cache = this.app.metadataCache.getFileCache(file);
            // Only set if no icon already exists in frontmatter
            if (!cache?.frontmatter?.icon) {
              // Read content to check for kanban-plugin: basic
              const content = await this.app.vault.read(file);
              const isKanban = content.includes("kanban-plugin: basic");
              
              if (!isKanban) {
                await this.app.fileManager.processFrontMatter(file, (fm) => {
                  fm["icon"] = "file";
                });
              }
            }
          }
        }, 200); // Slightly longer delay to be safe
      })
    );

    // 8. EVENT: Sync folder icons on rename/delete
    this.registerEvent(
      this.app.vault.on("rename", async (file, oldPath) => {
        if (file instanceof TFolder && this.settings.folderIcons[oldPath]) {
          this.settings.folderIcons[file.path] = this.settings.folderIcons[oldPath];
          delete this.settings.folderIcons[oldPath];
          await this.saveSettings();
        }
      })
    );

    this.registerEvent(
      this.app.vault.on("delete", async (file) => {
        if (file instanceof TFolder && this.settings.folderIcons[file.path]) {
          delete this.settings.folderIcons[file.path];
          await this.saveSettings();
        }
      })
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload() {
  }

  // --- FEATURE: NOTION-STYLE PAGE UI ---
  injectPageIconUI(file: TFile) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;

    // Use a slight timeout to ensure Obsidian has rendered the DOM
    setTimeout(() => {
      const container = view.containerEl;
      const inlineTitle = container.querySelector(".inline-title");
      if (!inlineTitle) return;

      // Remove existing UI to prevent duplicates
      container.querySelector(".mantle-page-icon-wrapper")?.remove();

      // Read the current icon from YAML
      const cache = this.app.metadataCache.getFileCache(file);
      const currentIcon = cache?.frontmatter?.icon;

      // Create our wrapper and place it directly BEFORE the title
      const wrapper = document.createElement("div");
      wrapper.addClass("mantle-page-icon-wrapper");

      if (currentIcon) {
        // RENDER THE ACTIVE ICON
        const iconEl = wrapper.createDiv({ cls: "mantle-page-icon active" });
        const pascalKey = toPascalCase(currentIcon);

        // @ts-ignore
        const lucideIcon = icons[pascalKey];
        if (lucideIcon) {
          const svg = createElement(lucideIcon);
          // Force Obsidian's native class
          svg.classList.add("svg-icon");
          // Fallback dimensions to guarantee visibility
          svg.style.width = "38px";
          svg.style.height = "38px";
          iconEl.appendChild(svg);
        } else {
          setIcon(iconEl, currentIcon);
        }

        // Click the icon to change it
        iconEl.onclick = () => new IconPickerModal(this.app, file, this).open();

        // Add a small "remove" button on hover
        const removeBtn = wrapper.createDiv({ cls: "mantle-page-icon-remove" });
        setIcon(removeBtn, "x");
        removeBtn.onclick = async () => {
          await this.app.fileManager.processFrontMatter(file, (fm) => {
            delete fm["icon"];
          });
        };
      } else {
        // RENDER THE "ADD ICON" BUTTON
        const addBtn = wrapper.createDiv({ cls: "mantle-page-icon-add" });
        setIcon(addBtn, "plus-circle");
        addBtn.createSpan({ text: " Add Icon" });

        // Click to open the picker
        addBtn.onclick = () => new IconPickerModal(this.app, file, this).open();
      }

      inlineTitle.parentNode?.insertBefore(wrapper, inlineTitle);
    }, 50);
  }

  private refreshTimer: number | null = null;

  // --- FEATURE: FILE EXPLORER ICONS ---
  updateFileExplorerIcons() {
    const fileExplorers = this.app.workspace.getLeavesOfType("file-explorer");
    if (fileExplorers.length === 0) return;

    for (const fileExplorer of fileExplorers) {
      const container = fileExplorer.view.containerEl.querySelector(
        ".nav-files-container",
      );
      if (!container) continue;

      this.refreshTreeIcons(fileExplorer);

      if (!(fileExplorer as any).iconObserver) {
        (fileExplorer as any).iconObserver = new MutationObserver(() => {
          if (this.refreshTimer) window.cancelAnimationFrame(this.refreshTimer);
          this.refreshTimer = window.requestAnimationFrame(() => {
            this.refreshTreeIcons(fileExplorer);
          });
        });

        (fileExplorer as any).iconObserver.observe(container, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class", "data-path"]
        });
      }
    }
  }

  refreshTreeIcons(fileExplorer: any) {
    const fileItems = fileExplorer.view.fileItems;
    const observer = (fileExplorer as any).iconObserver;

    if (observer) observer.disconnect();

    for (const path in fileItems) {
      const item = fileItems[path];
      const file = item.file;
      if (!file || file instanceof TFolder) continue; // Skip folders, they are handled by CSS

      const cache = this.app.metadataCache.getFileCache(file);
      const iconName = cache?.frontmatter?.icon || "file"; // Default to 'file' icon

      const titleEl = (item.titleEl ?? item.selfEl) as HTMLElement;
      const titleInnerEl = (item.titleInnerEl ?? item.innerEl) as HTMLElement;
      if (!titleEl || !titleInnerEl) continue;

      const existingIcon = titleEl.querySelector(".mantle-tree-icon");
      const currentIconName = existingIcon ? existingIcon.getAttribute("data-mantle-icon") : undefined;

      if (currentIconName === iconName) continue;
      if (existingIcon) existingIcon.remove();

      const pascalKey = toPascalCase(iconName);
      // @ts-ignore
      const lucideIcon = icons[pascalKey];

      if (lucideIcon) {
        const iconNode = document.createElement("div");
        iconNode.setAttribute("data-mantle-icon", iconName);
        iconNode.classList.add("mantle-tree-icon");

        const svg = createElement(lucideIcon);
        svg.classList.add("svg-icon");
        iconNode.appendChild(svg);

        titleEl.insertBefore(iconNode, titleInnerEl);
      }
    }

    if (observer) {
      const container = fileExplorer.view.containerEl.querySelector(".nav-files-container");
      if (container) {
        observer.observe(container, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class", "data-path"]
        });
      }
    }
  }
}
