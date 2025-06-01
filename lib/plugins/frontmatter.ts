import { BasePlugin, DocuifyNode, TraversalContext } from "../base";
import matter from "gray-matter";

export class FrontMatterPlugin extends BasePlugin {
  override name = "_FrontMatterPlugin";
 
  constructor() {
    super();
    console.log("running", this.name);
  }

  override onVisit(node: DocuifyNode, context: TraversalContext): void | Promise<void> {
    if (node.type === "file" && node.content) {
      try {
        const { content, data } = matter(node.content);
        node.content = content;
        node.frontmatter = data;
      } catch (err) {
        console.warn(`[${this.name}] Failed to parse frontmatter in "${node.fullPath}"`, err);
      }
    }
  }
}
