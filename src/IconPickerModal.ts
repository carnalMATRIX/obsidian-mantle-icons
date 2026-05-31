import { App, FuzzySuggestModal, FuzzyMatch, TFile, TFolder, TAbstractFile } from "obsidian";
import { icons, createElement } from "lucide";
import MantleIcons from "./main";

const ALL_ICONS = Object.keys(icons);

export class IconPickerModal extends FuzzySuggestModal<string> {
  file: TAbstractFile;
  plugin: MantleIcons;

  constructor(app: App, file: TAbstractFile, plugin: MantleIcons) {
    super(app);
    this.file = file;
    this.plugin = plugin;
    this.setPlaceholder("Search for an icon...");
  }

  getItems(): string[] {
    return ALL_ICONS;
  }

  getItemText(item: string): string {
    // Convert PascalCase (AlertCircle) to kebab-case (alert-circle)
    return item.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }

  renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement) {
    el.addClass("mantle-icon-suggestion");

    const iconDiv = el.createDiv({ cls: "suggestion-icon" });
    // @ts-ignore
    const svgElement = createElement(icons[item.item]);
    iconDiv.appendChild(svgElement);

    el.createDiv({ text: this.getItemText(item.item), cls: "suggestion-text" });
  }

  async onChooseItem(item: string, evt: MouseEvent | KeyboardEvent) {
    const iconName = this.getItemText(item);

    if (this.file instanceof TFile) {
      // This safely writes `icon: name` to the file's YAML frontmatter
      await this.app.fileManager.processFrontMatter(this.file, (frontmatter) => {
        frontmatter["icon"] = iconName;
      });
    } else if (this.file instanceof TFolder) {
      this.plugin.settings.folderIcons[this.file.path] = iconName;
      await this.plugin.saveSettings();
      this.plugin.updateFileExplorerIcons();
    }
  }
}
