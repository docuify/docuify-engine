import { BasePlugin, DocuifyNode, TraversalContext } from "../base";
import matter from "gray-matter";

export class FrontMatterPlugin extends BasePlugin {
  override name = "FrontMatterPlugin";

  constructor() {
    super();
  }

  override onVisit(
    node: DocuifyNode,
    context: TraversalContext,
  ): void | Promise<void> {
 
    if (node.type === "file") {
      try {
        node.actions!.useTransform!(async function (content) {
          
          const matterData = matter(content);
         
          node.frontmatter = matterData.data;
         
          return matterData.content;
        });
      } catch (err) {
        console.warn(
          `[${this.name}] Failed to parse frontmatter in "${node.fullPath}"`,
          err,
        );
      }
    }
  }
}
