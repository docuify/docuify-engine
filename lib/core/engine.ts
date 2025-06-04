import { BasePlugin } from "../base/basePlugin";
import { BaseSource } from "../base/baseSource";
import { buildTree } from "../utils/build_tree";
import { flattenTree } from "../utils/flatten_tree";
import { DocuifyNode, SourceFile } from "../base/types";
import { walkTreeWithPlugins } from "../utils/walk_tree_with_plugins";
import { QueryContext } from "./query_context";
import { preloadTreeContent, preloadFlatNodesContent } from "../utils/preload";

export interface DocuifyEngineConfig {
  source: BaseSource;
  plugins?: BasePlugin[];
  filter?: (file: SourceFile, index?: number) => boolean;
  disableContentPreload?: boolean; // Optional supercharge mode
}

/**
 * 🚂 DocuifyEngine — The central powerhouse of Docuify.
 * Connect a source, run through plugins, flatten into gold.
 */
export class DocuifyEngine {
  private config: DocuifyEngineConfig;
  private tree!: DocuifyNode;

  constructor(config: DocuifyEngineConfig) {
    if (!config.source) {
      throw new Error("DocuifyEngine requires a source. It's the whole point.");
    }

    this.config = {
      ...config,
      plugins: config.plugins || [], // If no plugins are passed, we still dance alone.
    };
  }

  private get buildResult() {
    const pluginNames = this.config.plugins!.map((p) => p.name);

    return {
      head: {}, // Reserved for future lore: commit hashes, timestamps, secrets...
      tree: this.tree,
      foot: {
        source: this.config.source.name,
        pluginNames,
      },
    };
  }

  /**
   * Builds the Docuify tree from the source.
   * Filters are applied here. Lazy loading is respected.
   */
  private async treeBuilder(): Promise<DocuifyNode> {
    const rawFiles = await this.config.source.fetch();
    const filteredFiles = this.config.filter
      ? rawFiles.filter(this.config.filter)
      : rawFiles;

    this.tree = buildTree(filteredFiles);
    return this.tree;
  }

  /**
   * Applies plugins to the tree. Plugins may mutate nodes, extract metadata, or summon demons.
   */
  async applyPlugins(): Promise<DocuifyNode> {
    this.tree = await walkTreeWithPlugins(this.tree, this.config.plugins!);
    return this.tree;
  }

  /**
   * Returns the current Docuify tree.
   * Caution: this may return undefined if `buildTree` hasn’t run.
   */
  getTree(): DocuifyNode {
    return this.tree;
  }

  /**
   * One-click build: fetches source, builds tree, runs plugins.
   * Think of it like `npm run build`, but for trees.
   */
  async buildTree() {
    await this.treeBuilder();
    await this.applyPlugins();

    if (!this.config.disableContentPreload) {
      await preloadTreeContent(this.tree);
    }

    return this.buildResult;
  }

  /**
   * Flattens the tree and returns only file nodes.
   * Ideal for querying, indexing, or just skipping the forest to find your leaf.
   */
  async buildFlat() {
    await this.treeBuilder(); // Don’t assume – trees don’t grow on assumptions
    await this.applyPlugins();

    const flatNodes = flattenTree(this.tree).filter(
      (node) => node.type === "file",
    );

    // Optional metadata preload step
    if (!this.config.disableContentPreload) {
      await preloadFlatNodesContent(flatNodes);
    }

    return {
      head: {},
      nodes: flatNodes,
      foot: {
        source: this.config.source.name,
        pluginNames: this.config.plugins!.map((p) => p.name),
      },
    };
  }

  use(base: BasePlugin | BaseSource) {
    if (base && base instanceof BasePlugin) {
      this.config.plugins!.push(base);
    }

    if (base && base instanceof BaseSource) {
      this.config.source = base;
    }
  }

   async query() {
    const { nodes } = await this.buildFlat();
    return new QueryContext(nodes);
  }
}
