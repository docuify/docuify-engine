import { BasePlugin } from "../base/basePlugin";
import { BaseSource } from "../base/baseSource";
import { buildTree } from "../utils/build_tree";
import { flattenTree } from "../utils/flatten_tree";
import { DocuifyNode, SourceFile } from "../base/types";
import { walkTreeWithPlugins } from "../utils/walk_tree_with_plugins";

export interface DocuifyEngineConfig {
  source: BaseSource;
  plugins?: BasePlugin[];
  filter?: (file: SourceFile, index?: number) => boolean;
}

export class DocuifyEngine {
  private config: DocuifyEngineConfig;
  private tree!: DocuifyNode;

  constructor(config: DocuifyEngineConfig) {
    if (!config.source) {
      // Like making cereal without milk — you technically can, but should you?
      throw new Error("DocuifyEngine requires a source.");
    }

    this.config = {
      ...config,
      plugins: config.plugins || [], // If no plugins are passed, we roll solo.
    };
  }

  private get fetchBuild() {
    const pluginNames = this.config.plugins!.map((plugin) => plugin.name);

    return {
      // "head" is for fancy metadata like commit hashes, timestamps, and other lore.
      // It's empty now — like your brain at 3am debugging a tree traversal bug.
      head: {},

      // The sacred tree of knowledge — built from your source files, probably way too nested.
      tree: this.tree,

      // "foot" is the outro track. It tells you where the tree came from and what plugins danced on it.
      foot: {
        source: this.config.source.name,
        pluginNames: pluginNames,
      },
    };
  }

  async buildTree(): Promise<DocuifyNode> {
    const sourceFiles = await this.config.source.fetch();

    let items = sourceFiles;

    if (this.config.filter) {
      items = items.filter((file, index) => this.config.filter!(file, index));
    }
    // Fetches the files and constructs a glorious tree — like Minecraft but less cubes, more TypeScript.
    this.tree = buildTree(items);

    return this.tree;
  }

  async applyPlugins(): Promise<DocuifyNode> {
    // Walk the tree like a peaceful monk... except the plugins are allowed to mutate it like a mad scientist.
    this.tree = await walkTreeWithPlugins(this.tree, this.config.plugins!);
    return this.tree;
  }

  getTree(): DocuifyNode {
    // Grab the tree like you're checking in on your Tamagotchi.
    return this.tree;
  }

  /**
   * Convenience method: builds the tree and applies all plugins in order.
   * It's like making coffee and also adding creamer automatically — one command, good vibes.
   */
  async build() {
    await this.buildTree();
    await this.applyPlugins();
    return this.fetchBuild;
  }

  async flatBuild() {
    if (!this.tree) {
      await this.buildTree(); // Get the initial tree
    }

    await this.applyPlugins(); // Let plugins do their weird magic

    const flatNodes = flattenTree(this.tree).filter(
      (node) => node.type !== "folder",
    );
    
    const pluginNames = this.config.plugins!.map((plugin) => plugin.name);

    return {
      head: {}, // One day... maybe commit hashes, timestamps, or snacks
      nodes: flatNodes,
      foot: {
        source: this.config.source.name,
        pluginNames: pluginNames,
      },
    };
  }
}
