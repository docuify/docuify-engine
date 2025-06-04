import { DocuifyNode } from "../base/types";

/**
 * Flattens a Docuify tree into a list of nodes.
 * Think of it like turning your majestic tree into a chainsawed list of lumber — useful, portable, and JSON-friendly.
 *
 * 🚫 Removes `.children` from all nodes to reduce bloat.
 * ✅ Preserves all other properties.
 */
export function flattenTree(tree: DocuifyNode): DocuifyNode[] {
  const flat: DocuifyNode[] = [];

  const walk = (node: DocuifyNode) => {
    // This cast is safe because we intentionally drop `children`
    flat.push(node);

    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }

    delete node.children;
  };

  walk(tree);
  return flat;
}
