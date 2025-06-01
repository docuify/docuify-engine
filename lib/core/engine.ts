import { BasePlugin } from "../base/basePlugin";
import { BaseSource } from "../base/baseSource";
import { buildTree } from "../utils/buildtree";
import { DocuifyNode } from "../base/types";
import { walkTreeWithPlugins } from "../utils/walk_tree_with_plugins";

export interface DocuifyEngineConfig {
  source: BaseSource;
  plugins?: BasePlugin[];
}

export class DocuifyEngine {
  private config: DocuifyEngineConfig;
  private tree!: DocuifyNode;

  constructor(config: DocuifyEngineConfig) {
    if (!config.source) {
      throw new Error("DocuifyEngine requires a source.");
    }

    this.config = {
      source: config.source,
      plugins: config.plugins || [],
    };
  }

  async buildTree(): Promise<DocuifyNode> {
    const sourceFileData = await this.config.source.fetch();
    this.tree = buildTree(sourceFileData.items);
    return this.tree;
  }

  async applyPlugins(): Promise<DocuifyNode> {
    this.tree = await walkTreeWithPlugins(this.tree, this.config.plugins!);
    return this.tree;
  }

  getTree(): DocuifyNode {
    return this.tree;
  }
  /** Convenience method: builds the tree and applies all plugins in order */
  async build(): Promise<DocuifyNode> {
    await this.buildTree();
    await this.applyPlugins();
    return this.tree;
  }
}
