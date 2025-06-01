# Docuify Engine

[![npm version](https://img.shields.io/npm/v/@docuify/engine)](https://www.npmjs.com/package/@docuify/engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A flexible, pluggable engine for building and transforming documentation content from source files.

## Overview

Docuify Engine is a TypeScript-first library that simplifies working with documentation structures. It fetches content from various sources, organizes it into a structured tree, and allows plugin-based transformations to enhance or modify the content.

This is a **headless** solution by design - Docuify Engine handles the content organization and transformation pipeline, while leaving the rendering entirely up to you.

## Features

- 📁 **Source Adapters**: Fetch content from various sources (currently supports GitHub, more coming)
- 🌲 **Tree Builder**: Automatically converts flat file lists into hierarchical tree structures
- 🔌 **Plugin System**: Transform content with a flexible plugin architecture
- 🧠 **Metadata Preservation**: Maintain context and metadata throughout the pipeline
- 🚀 **TypeScript First**: Built with TypeScript, providing fully typed APIs and excellent IDE integration
- 📦 **Module Support**: Compatible with both ESM and CommonJS

## Installation

```bash
npm install @docuify/engine
```

## Quick Example

```typescript
const { Github } = require("@docuify/engine/source");         // Source adapter for GitHub
const { DocuifyEngine } = require("@docuify/engine");         // Core engine
const { FrontMatterPlugin } = require("@docuify/engine/plugins"); // Process frontmatter in markdown
const { inspect } = require("util");                          // For pretty console output
require("dotenv").config();                                   // Load environment variables

// Initialize DocuifyEngine with a source and plugins
const engine = new DocuifyEngine({
  source: new Github({
    branch: "main",                        // Branch to fetch from
    repoFullName: "username/repository",   // GitHub repository
    path: "docs",                          // Path inside the repo
    token: process.env.GITHUB_TOKEN,       // GitHub access token
  }),
  plugins: [
    new FrontMatterPlugin(),               // Extract YAML frontmatter
  ],
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

1. **Sources**: Adapters that fetch content from different locations
2. **Tree Builder**: Converts flat file lists into hierarchical structures
3. **Plugins**: Transform or enhance content within the tree

### Content Flow

```
Source → Tree Builder → Plugins → Final Tree Structure
```

### Available Sources

- **GitHub**: Fetch content from GitHub repositories

### Available Plugins

- **FrontMatter**: Extract YAML frontmatter from markdown files

## API Reference

### DocuifyEngine

The main class that orchestrates the content pipeline.

```typescript
new DocuifyEngine({
  source: BaseSource,           // Required: content source
  plugins?: BasePlugin[],       // Optional: transformation plugins
  filter?: (file, index) => boolean // Optional: filter source files
})
```

#### Methods

- `buildTree()`: Fetches content and builds the tree structure
- `applyPlugins()`: Runs all plugins on the tree
- `getTree()`: Returns the current tree
- `build()`: Convenience method that runs buildTree and applyPlugins

### BaseSource

Abstract class for content sources. Implement this to create new sources.

### BasePlugin

Abstract class for plugins. Extend this to create custom transformations.

## Use Cases

- Custom documentation platforms
- Markdown-based content management
- Knowledge base applications
- Learning management systems
- Static site generators
- Any project that needs structured content organization

## Why I Built This

I created Docuify Engine as a learning experience to understand how to cleanly fetch, organize, and transform content from repositories, especially from GitHub.

The resulting tool turned out to be surprisingly powerful and flexible - it's not limited to documentation but can parse and organize any folder and file structure with the appropriate source adapter.

## TypeScript Support

Docuify Engine is built with TypeScript and provides full type definitions for all its APIs. This enables:

- Intelligent code completion in your IDE
- Type checking to catch errors at compile time
- Better documentation through type annotations
- Improved developer experience with autocompletion


## Module Support

Docuify Engine supports both ESM (ECMAScript Modules) and CJS (CommonJS) import styles:

### ESM (ES Modules)

```typescript
import { DocuifyEngine } from '@docuify/engine';
import { Github } from '@docuify/engine/source';
import { FrontMatterPlugin } from '@docuify/engine/plugins';
```

### CJS (CommonJS)

```typescript
const { DocuifyEngine } = require('@docuify/engine');
const { Github } = require('@docuify/engine/source');
const { FrontMatterPlugin } = require('@docuify/engine/plugins');
```

## Roadmap

- 🔄 Content diff and change tracking
- 🎨 Improved debug logging
- ⚙️ Plugin presets for common workflows
- 🌍 Additional source adapters (local files, GitLab, Bitbucket, etc.)
- 📦 More plugins for content transformation

## Contributing

Contributions are welcome! Feel free to open issues, submit PRs, or join discussions.

## License

[MIT](https://opensource.org/licenses/MIT) - See LICENSE file for details.

---

© 2025 Docuify Engine — made with ❤️ and a pinch of curiosity.