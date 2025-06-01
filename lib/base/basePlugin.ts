import { DocuifyNode } from "./types";

export interface TraversalContext {
  parent?: DocuifyNode;
  ancestors: DocuifyNode[];
  index?: number;
  visit(child: DocuifyNode, ctx: TraversalContext): void;
  state: Record<string, any>;
}

export abstract class BasePlugin {
  /**
   * Runs before the tree traversal starts.
   * Can return a new root node or nothing.
   */
  applyBefore?(
    root: DocuifyNode,
    state: Record<string, any>,
  ): DocuifyNode | void | Promise<DocuifyNode | void>;

  /**
   * Runs on every node during traversal.
   */
  abstract onVisit(
    node: DocuifyNode,
    context: TraversalContext,
  ): void | Promise<void>;

  /**
   * Runs after the tree traversal completes.
   * Can return a new root node or nothing.
   */
  applyAfter?(
    root: DocuifyNode,
    state: Record<string, any>,
  ): DocuifyNode | void | Promise<DocuifyNode | void>;
}
