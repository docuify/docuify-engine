import { BasePlugin, DocuifyNode, TraversalContext } from "../base";
import matter from "gray-matter";

export class FrontMatterPlugin implements BasePlugin {
  onVisit(node: DocuifyNode, context: TraversalContext): void | Promise<void> {
    if (node.file === "file" && node.content) {
      const { content, data } = matter("");
      node.content = content;
      node.frontmatter = data;
    }
  }
}
