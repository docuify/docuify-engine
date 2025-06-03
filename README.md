# Docuify Engine

[![npm version](https://img.shields.io/npm/v/@docuify/engine)](https://www.npmjs.com/package/@docuify/engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A flexible, pluggable engine for building and transforming documentation content from source files.

## Overview

Docuify Engine is a TypeScript-first library that simplifies working with documentation structures. It fetches content from various sources, organizes it into a structured tree, and allows plugin-based transformations to enhance or modify the content.

This is a **headless** solution by design — Docuify Engine handles the content organization and transformation pipeline, while leaving the rendering entirely up to you.

## Features

- 📁 **Source Adapters** — Fetch content from various sources (GitHub supported, more coming)
- 🌲 **Tree Builder** — Automatically converts flat file lists into hierarchical tree structures
- 🔌 **Plugin System** — Transform content with a flexible plugin architecture
- 🧠 **Metadata Preservation** — Maintain context and metadata throughout the pipeline
- 🚀 **TypeScript First** — Built with TypeScript, providing fully typed APIs and excellent IDE integration
- 📦 **Module Support** — Compatible with both ESM and CommonJS

## Installation

```bash
npm install @docuify/engine
```

## Quick Start

```typescript
const { Github } = require("@docuify/engine/source");         
const { DocuifyEngine } = require("@docuify/engine");         
const { FrontMatterPlugin } = require("@docuify/engine/plugins");
const { inspect } = require("util");                          
require("dotenv").config();                                   

// Initialize DocuifyEngine with a source and plugins
const engine = new DocuifyEngine({
  source: new Github({
    branch: "main",                        
    repoFullName: "username/repository",   
    token: process.env.GITHUB_TOKEN,       
  }),
  plugins: [
    new FrontMatterPlugin(),               
  ],
  filter: (file) => file.startsWith('docs'),
});

// Build and process the content tree
(async () => {
  try {
    const result = await engine.build();
    console.log(inspect(result, { depth: null, colors: true }));
  } catch (error) {
    console.error("Error:", error);
  }
})();
```

## Architecture

Docuify Engine is built around three core concepts:

### Core Components

1. **Sources** — Adapters that fetch content from different locations
2. **Tree Builder** — Converts flat file lists into hierarchical structures  
3. **Plugins** — Transform or enhance content within the tree

### Content Flow

```
Source → Tree Builder → Plugins → Final Tree Structure
```

## Available Components

### Sources

| Source | Description | Status |
|--------|-------------|--------|
| **GitHub** | Fetch content from GitHub repositories | ✅ Available |
| **Local Files** | Read from local filesystem | 🔄 Planned |
| **GitLab** | Fetch from GitLab repositories | 🔄 Planned |
| **Bitbucket** | Fetch from Bitbucket repositories | 🔄 Planned |

### Plugins

| Plugin | Description | Status |
|--------|-------------|--------|
| **FrontMatter** | Extract YAML frontmatter from markdown files | ✅ Available |

## API Reference

### DocuifyEngine

The main class that orchestrates the content pipeline.

```typescript
new DocuifyEngine({
  source: BaseSource,                    // Required: content source
  plugins?: BasePlugin[],                // Optional: transformation plugins
  filter?: (file, index) => boolean      // Optional: filter source files
})
```

#### Methods

| Method | Description |
|--------|-------------|
| `buildTree()` | Fetches content and builds the tree structure |
| `applyPlugins()` | Runs all plugins on the tree |
| `getTree()` | Returns the current tree |
| `build()` | Convenience method that runs buildTree and applyPlugins |

### BaseSource

Abstract class for content sources. Extend this to create new sources.

### BasePlugin  

Abstract class for plugins. Extend this to create custom transformations.

## Module Support

Docuify Engine supports both ESM and CommonJS import styles:

### ESM (ES Modules)

```typescript
import { DocuifyEngine } from '@docuify/engine';
import { Github } from '@docuify/engine/source';
import { FrontMatterPlugin } from '@docuify/engine/plugins';
```

### CommonJS

```typescript
const { DocuifyEngine } = require('@docuify/engine');
const { Github } = require('@docuify/engine/source');
const { FrontMatterPlugin } = require('@docuify/engine/plugins');
```

## Creating Custom Components

### Plugin System Deep Dive

Plugins are called after the tree is built via the `applyPlugins()` method. The system walks through the entire tree and applies all plugins through a sophisticated three-phase lifecycle:

1. **`applyBefore`** — Runs before tree traversal starts, can transform the entire tree
2. **`onVisit`** — Runs on every node during traversal, allows per-node transformations  
3. **`applyAfter`** — Runs after traversal completes, can perform final tree-wide operations

The plugin system maintains shared state across all phases and supports both synchronous and asynchronous operations.

#### Plugin Execution Flow

```
Source → buildTree() → applyPlugins() → [applyBefore → Tree Traversal + onVisit → applyAfter] → Final Tree
```

### BasePlugin Interface

```typescript
export abstract class BasePlugin {
  abstract name: string;
  
  // Optional: Transform entire tree before traversal
  applyBefore?(
    root: DocuifyNode,
    state: Record<string, any>,
  ): DocuifyNode | void | Promise<DocuifyNode | void>;
  
  // Required: Process individual nodes during traversal
  abstract onVisit(
    node: DocuifyNode,
    context: TraversalContext,
  ): void | Promise<void>;
  
  // Optional: Transform entire tree after traversal
  applyAfter?(
    root: DocuifyNode,
    state: Record<string, any>,
  ): DocuifyNode | void | Promise<DocuifyNode | void>;
}
```

### TraversalContext

Each `onVisit` call receives a context object with navigation and state information:

```typescript
export interface TraversalContext {
  parent?: DocuifyNode;           // Direct parent node
  ancestors: DocuifyNode[];       // All ancestor nodes
  index?: number;                 // Position in parent's children array
  visit(child: DocuifyNode, ctx: TraversalContext): void;  // Manual traversal control
  state: Record<string, any>;     // Shared state across all plugins
}
```

### Custom Plugin Example

```typescript
import { BasePlugin, DocuifyNode, TraversalContext } from "@docuify/engine";
import matter from "gray-matter";

export class FrontMatterPlugin extends BasePlugin {
  override name = "_FrontMatterPlugin";

  constructor() {
    super();
  }

  override onVisit(node: DocuifyNode, context: TraversalContext): void | Promise<void> {
    if (node.type === "file" && node.content) {
      try {
        const { content, data } = matter(node.content);
        node.content = content;
        node.frontmatter = data;
      } catch (err) {
        throw new Error(`[${this.name}] Failed to parse frontmatter in "${node.fullPath}"\n\n${err}"`);
      }
    }
  }
}
```

### Advanced Plugin Example

```typescript
export class TableOfContentsPlugin extends BasePlugin {
  override name = "_TableOfContentsPlugin";

  // Initialize shared state before traversal
  applyBefore(root: DocuifyNode, state: Record<string, any>): void {
    state.tocItems = [];
  }

  // Collect TOC items during traversal
  onVisit(node: DocuifyNode, context: TraversalContext): void {
    if (node.type === "file" && node.extension === ".md") {
      const headings = this.extractHeadings(node.content);
      context.state.tocItems.push(...headings);
    }
  }

  // Generate final TOC after traversal
  applyAfter(root: DocuifyNode, state: Record<string, any>): void {
    const tocContent = this.generateTOC(state.tocItems);
    // Add TOC as a new node or metadata
    root.metadata = { ...root.metadata, tableOfContents: tocContent };
  }

  private extractHeadings(content: string): any[] {
    // Implementation details...
    return [];
  }

  private generateTOC(items: any[]): string {
    // Implementation details...
    return "";
  }
}
```

### Custom Source Example

To create a new source, extend the BaseSource class. How you fetch the content is up to you, as long as you return the data in the expected format.

```typescript
import { BaseSource, SourceFile } from "@docuify/engine";

export class Github extends BaseSource {
  override name = "_Github";

  override async fetch(): Promise<SourceFile[]> {
    // Your fetching logic here
    return []; // Return array of SourceFile objects
  }
}
```

### SourceFile Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `path` | `string` | ✅ | File or folder path |
| `type` | `"folder" \| "file"` | ✅ | Type of the source item |
| `content` | `string` | ❌ | File content (undefined for folders, only files have content) |
| `extension` | `string \| null` | ❌ | File extension string, null if extension cannot be resolved for a file, undefined for folders |
| `metadata` | `Record<string, any>` | ❌ | Additional metadata object |

## Use Cases

- Custom documentation platforms
- Markdown-based content management systems
- Knowledge base applications
- Learning management systems
- Static site generators
- Any project requiring structured content organization

## Background & Motivation

I created Docuify Engine as both a learning experience and a foundational component for a larger project I'm working on. It started as a way to understand how to cleanly fetch, organize, and transform content from repositories, especially from GitHub.

The resulting tool turned out to be surprisingly powerful and flexible — it's not limited to documentation but can parse and organize any folder and file structure with the appropriate source adapter, making it useful beyond its original scope.

## Roadmap

- 🔄 Content diff and change tracking
- 🎨 Improved debug logging  
- ⚙️ Plugin presets for common workflows
- 🌍 Additional source adapters (local files, GitLab, Bitbucket, etc.)
- 📦 More plugins for content transformation

## Contributing

Contributions are welcome! Feel free to open issues, submit pull requests, or join discussions.

## License

[MIT](https://opensource.org/licenses/MIT) — See LICENSE file for details.

## Author

Created by Imani Brown — [GitHub](https://github.com/itszavier)

---

© 2025 Docuify Engine — made with ❤️ and a pinch of curiosity.
