import { BasePlugin, DocuifyNode, TraversalContext } from "../base";
import matter from "gray-matter";

export class FrontMatterPlugin extends BasePlugin {
  override name = "_FrontMatterPlugin";

  constructor() {
    super();
  }

  override onVisit(
    node: DocuifyNode,
    context: TraversalContext,
  ): void | Promise<void> {
    console.log("visted");
    if (node.type === "file") {
      try {
        node.action!.useTransform!(async function (content) {
          const matterData = matter(content);
          console.log("setting frontmatter to node");
          node.frontmatter = matterData.data;
          console.log("setting frontmatter to node", node.frontmatter);
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
