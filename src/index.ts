import { Plugin } from "siyuan";
import {
  getBlockAttrs,
  getBlockById,
  setBlockAttrs,
} from "../../siyuanPlugin-common/siyuan-api";
export default class PluginHotkey extends Plugin {
  private blockId: BlockId;
  private rootId: BlockId;
  private onclickEditorContentThis = this.onclickEditorContent.bind(this);
  async onload() {}

  onLayoutReady() {
    this.eventBus.on("click-editorcontent", this.onclickEditorContentThis);
    this.addCommand({
      langKey: "设置命名",
      hotkey: "⌘1",
      callback: async () => {
        const id = this.blockId;
        const block = await getBlockById(id);
        let attrs = await getBlockAttrs(id);
        console.log("原有属性为", attrs); //备份原有属性
        await setBlockAttrs(id, {
          name: block.content,
        });
      },
    });
    this.addCommand({
      langKey: "设置法条命名",
      hotkey: "⌘2",
      callback: async () => {
        //组合命名
        let id = this.blockId;
        const block = await getBlockById(id);
        const content = this.ChineseToNumber(block.content);
        const itemName = content.match(/第[0-9]{1,7}条/);
        if (!itemName) {
          return;
        }
        const root = await getBlockById(this.rootId);
        const name = `《${root.content}》${itemName}`;
        //确定在自身还是上级超级块写入
        const parent = await getBlockById(block.parent_id);
        if (parent.type == "s") {
          id = parent.id;
        }
        let attrs = await getBlockAttrs(id);
        console.log("原有属性为", attrs); //备份原有属性
        await setBlockAttrs(id, {
          name: name,
        });
      },
    });
  }

  onunload() {
    this.eventBus.off("click-editorcontent", this.onclickEditorContentThis);
  }
  onclickEditorContent({ detail }) {
    this.blockId = detail.protyle.breadcrumb?.id;
    this.rootId = detail.protyle.block?.rootID;
  }
  ChineseToNumber(str: string) {
    let charList = str.split(""); //输入字符分割为数组
    let chnUnit = {
      十: 10,
      百: 100,
      千: 1000,
      万: 10000,
      亿: 100000000,
    };
    let chnNumChar = {
      零: 0,
      一: 1,
      二: 2,
      两: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
    };
    let count = 0; //总数
    let subCount = 0; //当前阶段总数（未乘以单位）
    let result = ""; //结果
    let lastUnit = Infinity; //上一个单位（数字）
    let lastNum = 0;
    for (let char of charList) {
      let num = chnNumChar[char]; //当前数字
      let unit = chnUnit[char];
      //非数字,非单位
      if (num == undefined && unit == undefined) {
        完成数字结果();
        result += char;
        continue;
      }
      //处理数字
      if (num != undefined) {
        lastNum = num;
        continue;
      }
      //处理单位
      if (unit != undefined) {
        if (lastUnit > unit) {
          //可能出现“一千零十三”等情况，十需要单独处理
          if (unit == 10 && lastNum == 0) {
            lastNum = 1;
          }
          subCount += lastNum * unit;
        } else {
          //上个单位比现有单位小，说明subCount结束了
          subCount += lastNum;
          count += subCount * unit;
          subCount = 0;
        }
        lastUnit = unit;
        lastNum = 0;
      }
      console.log();
    }
    完成数字结果();
    return result;
    function 完成数字结果() {
      //数字处理完成有两种情况，一是遇到非数字和单位，二是运行到字符串结尾
      if (count == 0 && subCount == 0 && lastNum == 0) {
        return;
      }
      count += subCount + lastNum;
      result += String(count);
      count = 0;
      subCount = 0;
      lastNum = 0;
    }
  }
}
