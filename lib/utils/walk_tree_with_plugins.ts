// walkTreeWithPlugins.ts
import { BasePlugin, TraversalContext } from "../base/basePlugin";
import { DocuifyNode } from "../base/types";

export async function walkTreeWithPlugins(
  root: DocuifyNode,
  plugins: BasePlugin[],
): Promise<DocuifyNode> {
  const state: Record<string, any> = {};

  // Run all applyBefore hooks sequentially, update root if returned
  let currentRoot = root;
  for (const plugin of plugins) {
    if (plugin.applyBefore) {
      const result = await plugin.applyBefore(currentRoot, state);
      if (result) currentRoot = result;
    }
  }

  // Recursive traversal function supporting async onVisit
  async function walk(
    node: DocuifyNode,
    ancestors: DocuifyNode[] = [],
    index?: number,
  ): Promise<void> {
    const context: TraversalContext = {
      parent: ancestors[ancestors.length - 1],
      ancestors,
      index,
      visit: (child, ctx) => walk(child, ctx.ancestors, ctx.index),
      state,
    };

    // Call all plugin onVisit hooks sequentially and await if async
    for (const plugin of plugins) {
      if (plugin.onVisit) {
        await plugin.onVisit(node, context);
      }
    }

    if (node.children) {
      // Walk children sequentially and await each
      for (let i = 0; i < node.children.length; i++) {
        await walk(node.children[i], [...ancestors, node], i);
      }
    }
  }

  await walk(currentRoot);

  // Run all applyAfter hooks sequentially, update root if returned
  for (const plugin of plugins) {
    if (plugin.applyAfter) {
      const result = await plugin.applyAfter(currentRoot, state);
      if (result) currentRoot = result;
    }
  }

  return currentRoot;
}
