import {
  App,
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
} from "obsidian";
import { icons, createElement } from "lucide";

// Map the entire Lucide library into a searchable format
// Converts PascalCase (AlertCircle) to kebab-case (alert-circle) for typing
const ALL_ICONS = Object.keys(icons).map((key) => ({
  key,
  name: key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
}));

export class IconSuggester extends EditorSuggest<string> {
  constructor(app: App) {
    super(app);
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
  ): EditorSuggestTriggerInfo | null {
    const line = editor.getLine(cursor.line);
    const subString = line.substring(0, cursor.ch);
    const match = subString.match(/:([a-zA-Z0-9-]*)$/);

    if (match && match.index !== undefined) {
      return {
        start: { line: cursor.line, ch: match.index },
        end: cursor,
        query: match[1],
      };
    }
    return null;
  }

  getSuggestions(context: EditorSuggestContext): string[] {
    const query = context.query.toLowerCase();

    // Filter the full 1,400+ list by what you type
    const results = ALL_ICONS.filter((icon) => icon.name.includes(query)).map(
      (icon) => icon.key,
    );

    // We still slice the output to ~150 to prevent the DOM from freezing
    // when you first press ":" and it tries to render 1,400 SVGs at once.
    return results.slice(0, 150);
  }

  renderSuggestion(iconKey: string, el: HTMLElement) {
    el.addClass("mantle-icon-suggestion");

    const iconDiv = el.createDiv({ cls: "suggestion-icon" });

    // Generate the SVG directly from the Lucide library
    // @ts-ignore - bypassing strict TypeScript checks on the icons object
    const svgElement = createElement(icons[iconKey]);
    iconDiv.appendChild(svgElement);

    const displayName = iconKey
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase();
    el.createDiv({ text: displayName, cls: "suggestion-text" });
  }

  selectSuggestion(iconKey: string, evt: MouseEvent | KeyboardEvent) {
    if (this.context) {
      const displayName = iconKey
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
      this.context.editor.replaceRange(
        `:${displayName}: `,
        this.context.start,
        this.context.end,
      );
    }
  }
}
