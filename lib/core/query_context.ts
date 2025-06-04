import { DocuifyNode } from "../base/types";
import isMatch from "lodash/isMatch";

// DeepPartial for recursive partial type matching on objects
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export class QueryContext {
  private readonly flatNodes: ReadonlyArray<DocuifyNode>;

  constructor(flatNodes: DocuifyNode[]) {
    this.flatNodes = flatNodes;
  }

  /**
   * Filters nodes by a deep partial `where` clause.
   * Returns a new array of matching nodes (immutable).
   */
  findMany(where?: DeepPartial<DocuifyNode>): ReadonlyArray<DocuifyNode> {
    if (!where) return this.flatNodes;
    return this.flatNodes.filter((node) => isMatch(node, where));
  }

  /**
   * Finds the first node matching `where`.
   * Returns undefined if none found.
   */
  findFirst(where?: DeepPartial<DocuifyNode>): DocuifyNode | undefined {
    if (!where) return this.flatNodes[0];
    return this.flatNodes.find((node) => isMatch(node, where));
  }

  /**
   * Loads content from a given node if possible.
   * Throws if the node has no loadContent action or is not a file.
   * Returns loaded content as string.
   */
  async loadContent(node: DocuifyNode): Promise<string> {
    if (node.type !== "file") {
      throw new Error("loadContent only supported for file nodes");
    }
    if (!node.actions?.loadContent) {
      throw new Error(`Node at ${node.fullPath} has no content loader`);
    }
    return await node.actions.loadContent();
  }
}
