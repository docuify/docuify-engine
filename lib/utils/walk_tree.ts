import { DocuifyNode } from "../base/types";

/**
 * Recursively walks a DocuifyNode tree and applies a callback to each node.
 * 
 * @param node - The root node to start from
 * @param visitor - The callback to run on each node
 */
export function walkTree(
  node: DocuifyNode,
  visitor: (node: DocuifyNode) => void
): void {
  visitor(node);

  if (node.type === "folder" && node.children?.length) {
    for (const child of node.children) {
      walkTree(child, visitor);
    }
  }
}
