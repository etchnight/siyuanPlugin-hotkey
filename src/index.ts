import { Plugin } from "siyuan";

export default class PluginHotkey extends Plugin {
  async onload() {
    this.addCommand({
      langKey: "showDialog",
      hotkey: "⇧⌘M",
      callback: () => {
        this.showDialog();
      },
    });
  }

  onLayoutReady() {}

  onunload() {}
}
