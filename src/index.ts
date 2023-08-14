import { Plugin } from "siyuan";
import { getBlockAttrs } from "../../siyuanPlugin-common/siyuan-api";
export default class PluginHotkey extends Plugin {
  private blockId: BlockId;
  private setBlockIdThis = this.setBlockId.bind(this);
  async onload() {}

  onLayoutReady() {
    this.eventBus.on("click-editorcontent", this.setBlockIdThis);
    this.addCommand({
      langKey: "设置命名",
      hotkey: "⌘1",
      callback: async () => {
        const id = this.blockId;
        let attrs = await getBlockAttrs(id);
        const content=
        console.log(attrs);
      },
    });
  }

  onunload() {
    this.eventBus.off("click-editorcontent", this.setBlockIdThis);
  }
  setBlockId({ detail }) {
    this.blockId = detail.protyle.breadcrumb?.id;
  }
}
