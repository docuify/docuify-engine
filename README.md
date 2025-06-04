# @docuify/engine 🚂

A flexible, pluggable engine for building and transforming documentation content from source files. Fetch from GitHub, local files, or custom sources, then process through an extensible plugin system to build queryable documentation trees.

## Features

- **Multiple Sources**: GitHub repositories, local files, and extensible source system
- **Plugin Architecture**: Transform content with a flexible plugin system
- **Tree & Flat Structures**: Build hierarchical trees or flat lists for different use cases
- **Lazy Loading**: Efficient content loading with transformation pipelines
- **Query System**: Built-in querying capabilities for processed documentation
- **Content Transformation**: Chain multiple content transformers (markdown, frontmatter, etc.)
- **Modular Exports**: Import only what you need with granular exports
- **TypeScript First**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @docuify/engine
```

## Quick Start

```javascript
import { DocuifyEngine } from '@docuify/engine';
import { Github } from '@docuify/engine/source';
import { FrontMatterPlugin } from '@docuify/engine/plugins';

// Configure your documentation source
const engine = new DocuifyEngine({
  source: new Github({
    token: 'your-github-token',
    branch: 'main',
    repoFullName: 'owner/repo'
  }),
  plugins: [
    new FrontMatterPlugin()
  ]
});

// Build documentation tree
const result = await engine.buildTree();
console.log(result.tree);

// Or get flat structure for querying
const flatResult = await engine.buildFlat();
console.log(flatResult.nodes);
```

## Import Patterns

The package provides modular exports for optimal bundle size:

```javascript
// Main engine
import { DocuifyEngine } from '@docuify/engine';

// Core types and base classes
import { BasePlugin, BaseSource, DocuifyNode } from '@docuify/engine/core';

// Sources
import { Github, LocalFile } from '@docuify/engine/source';

// Plugins
import { FrontMatterPlugin } from '@docuify/engine/plugins';

// Everything (not recommended for production)
import * as Docuify from '@docuify/engine';
```

## Core Concepts

### Sources

Sources fetch documentation files from various locations:

#### GitHub Source
```javascript
import { Github } from '@docuify/engine/source';

const githubSource = new Github({
  token: 'your-github-token',
  branch: 'main',
  repoFullName: 'owner/repo',
  github_api_version: '2022-11-28', // optional
  metadataFields: ['sha', 'size'] // optional metadata to include
});
```

#### Local File Source
```javascript
import { LocalFile } from '@docuify/engine/source';

const localSource = new LocalFile('./docs');
```

### Plugins

Plugins process nodes during tree traversal:

#### Built-in FrontMatter Plugin
```javascript
import { FrontMatterPlugin } from '@docuify/engine/plugins';

const frontmatterPlugin = new FrontMatterPlugin();
```

#### Custom Plugin
```javascript
import { BasePlugin } from '@docuify/engine/core';

class MyCustomPlugin extends BasePlugin {
  name = 'MyCustomPlugin';

  // Optional: runs before traversal
  async applyBefore(root, state) {
    // Transform the entire tree before processing
    return root;
  }

  // Required: runs on each node
  async onVisit(node, context) {
    if (node.type === 'file') {
      // Add custom transformations
      node.actions?.useTransform?.(async (content) => {
        // Process content here
        return content.toUpperCase();
      });
      
      // Add custom metadata
      node.customData = { processed: true };
    }
  }

  // Optional: runs after traversal
  async applyAfter(root, state) {
    // Final tree modifications
    return root;
  }
}
```

## API Reference

### DocuifyEngine

The main engine class that orchestrates the entire documentation processing pipeline.

#### Constructor
```javascript
new DocuifyEngine(config)
```

**Config Options:**
- `source: BaseSource` - Required. The source to fetch files from
- `plugins?: BasePlugin[]` - Optional array of plugins to apply
- `filter?: (file, index) => boolean` - Optional filter function for source files
- `disableContentPreload?: boolean` - Skip content preloading for performance

#### Methods

##### `buildTree()`
Builds a hierarchical documentation tree.

```javascript
const result = await engine.buildTree();
// Returns: { head: {}, tree: DocuifyNode, foot: { source, pluginNames } }
```

##### `buildFlat()`
Builds a flat array of file nodes (folders excluded).

```javascript
const result = await engine.buildFlat();
// Returns: { head: {}, nodes: DocuifyNode[], foot: { source, pluginNames } }
```

##### `query()`
Returns a QueryContext for advanced querying.

```javascript
const queryContext = await engine.query();
```

##### `use(plugin)`
Add a plugin or change the source.

```javascript
engine.use(new MyCustomPlugin());
engine.use(new Github({...}));
```

##### `getTree()`
Get the current tree (may be undefined before building).

```javascript
const tree = engine.getTree();
```

### DocuifyNode

Represents a node in the documentation tree.

#### Properties
- `id: string` - Unique node identifier
- `fullPath: string` - Complete file path
- `name: string` - File or folder name
- `type: 'file' | 'folder'` - Node type
- `parentId?: string` - Parent node ID
- `metadata?: Record<string, any>` - Custom metadata
- `extension?: string | null` - File extension
- `children?: DocuifyNode[]` - Child nodes (folders only)

#### File Node Actions
File nodes have special `actions` for content processing:

```javascript
// Add content transformation
node.actions?.useTransform?.((content) => {
  return content.replace(/old/g, 'new');
});

// Load and transform content
const processedContent = await node.actions?.loadContent?.();

// Transform existing content
const transformed = await node.actions?.transformContent?.(rawContent);
```

### Sources

#### BaseSource (Abstract)
Base class for all sources.

```javascript
class MySource extends BaseSource {
  name = 'MySource';
  
  async fetch() {
    // Return SourceFile[]
    return [{
      path: 'example.md',
      type: 'file',
      extension: 'md',
      metadata: { custom: 'data' },
      loadContent: async () => 'file content'
    }];
  }
}
```

#### SourceFile Type
```javascript
type SourceFile = {
  path: string;                    // Relative path
  type: 'folder' | 'file';        // File type
  extension?: string | null;       // File extension
  metadata?: Record<string, any>;  // Custom metadata
  loadContent?: () => string | Promise<string>; // Lazy content loader
}
```

### Plugins

#### BasePlugin (Abstract)
Base class for all plugins.

```javascript
abstract class BasePlugin {
  abstract name: string;
  
  // Optional lifecycle hooks
  applyBefore?(root: DocuifyNode, state: Record<string, any>): DocuifyNode | void | Promise<DocuifyNode | void>;
  abstract onVisit(node: DocuifyNode, context: TraversalContext): void | Promise<void>;
  applyAfter?(root: DocuifyNode, state: Record<string, any>): DocuifyNode | void | Promise<void>;
}
```

#### TraversalContext
Context object passed to plugin `onVisit` methods:

```javascript
interface TraversalContext {
  parent?: DocuifyNode;           // Parent node
  ancestors: DocuifyNode[];       // Array of ancestor nodes
  index?: number;                 // Index in parent's children
  visit(child: DocuifyNode, ctx: TraversalContext): void; // Recursive visitor
  state: Record<string, any>;     // Shared state between plugins
}
```

## Advanced Usage

### Custom Content Transformations

```javascript
// Chain multiple transformations
node.actions?.useTransform?.(async (content) => {
  // First transformation: process frontmatter
  const { data, content: body } = matter(content);
  node.frontmatter = data;
  return body;
});

node.actions?.useTransform?.(async (content) => {
  // Second transformation: convert markdown to HTML
  return markdownToHtml(content);
});

node.actions?.useTransform?.(async (content) => {
  // Third transformation: syntax highlighting
  return highlightCode(content);
});
```

### Filtering Source Files

```javascript
const engine = new DocuifyEngine({
  source: new Github({...}),
  filter: (file) => {
    // Only include markdown files
    return file.extension === 'md';
  }
});
```

### Performance Optimization

```javascript
const engine = new DocuifyEngine({
  source: new Github({...}),
  disableContentPreload: true, // Skip preloading for faster builds
});

// Manual content loading when needed
const result = await engine.buildFlat();
for (const node of result.nodes) {
  if (needsContent(node)) {
    const content = await node.actions?.loadContent?.();
  }
}
```

### Plugin State Sharing

```javascript
class AnalyticsPlugin extends BasePlugin {
  name = 'AnalyticsPlugin';
  
  async applyBefore(root, state) {
    state.fileCount = 0;
    state.totalSize = 0;
  }
  
  async onVisit(node, context) {
    if (node.type === 'file') {
      context.state.fileCount++;
      const content = await node.actions?.loadContent?.();
      context.state.totalSize += content.length;
    }
  }
  
  async applyAfter(root, state) {
    console.log(`Processed ${state.fileCount} files (${state.totalSize} bytes)`);
  }
}
```

## Error Handling

```javascript
try {
  const result = await engine.buildTree();
} catch (error) {
  if (error.message.includes('GitHub')) {
    console.error('GitHub API error:', error);
  } else if (error.message.includes('content')) {
    console.error('Content loading error:', error);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## TypeScript Support

@docuify/engine is written in TypeScript and provides full type definitions:

```typescript
import { 
  DocuifyEngine, 
  DocuifyNode, 
  BasePlugin, 
  TraversalContext,
  SourceFile 
} from '@docuify/engine';

// Modular imports with full typing
import { Github } from '@docuify/engine/source';
import { FrontMatterPlugin } from '@docuify/engine/plugins';

// All types are fully typed and provide excellent IntelliSense
```
## Keywords

`docuify`, `documentation`, `engine`, `plugin-system`, `static-docs`, `markdown`, `tree-parser`, `developer-tools`, `open-source`, `typescript`

## Dependencies

- **gray-matter**: YAML frontmatter parsing
- **lodash**: Utility functions for data manipulation
- **@types/lodash**: TypeScript definitions for lodash

## Contributing

When creating custom sources or plugins:

1. **Sources**: Extend `BaseSource` and implement the `fetch()` method
2. **Plugins**: Extend `BasePlugin` and implement the `onVisit()` method
3. **Content Transformers**: Use the `useTransform` API for content processing
4. **Metadata**: Attach custom data to nodes via the extensible `[key: string]: any` property

## Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/docuify/docuify-engine/issues)
- **Repository**: [GitHub Repository](https://github.com/docuify/docuify-engine)

## License

MIT License - see the [LICENSE](https://github.com/docuify/docuify-engine/blob/main/LICENSE) file for details.