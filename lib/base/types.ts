// Represents the return type of file content — can be synchronous or async
export type GetContentReturnType = string | Promise<string>;

// A transformer modifies raw string content (e.g., markdown → HTML)
export type TransformerFunction = (content: string) => Promise<string> | string;

// A source file fetched from a remote or local source
export type SourceFile = {
  path: string; // Relative file path (e.g., "docs/index.md")
  type: "folder" | "file";

  content?: string; // Inline content (deprecated, replaced by lazy loading)

  extension?: string | null; // File extension (e.g., "md", "ts")
  metadata?: Record<string, any>; // Custom file metadata (e.g., git info, frontmatter)

  // Function to lazily load file content (preferred over `content`)
  loadContent?: () => string | Promise<string>;
};

/**
 * @deprecated
 * Old shape for grouped file source entries. Not needed in the new system.
 */
export type SourceFileData = {
  source: string; // e.g. "github", "gitlab", "gdrive"
  items: SourceFile[];
};

// Represents a node in the documentation tree (either a file or folder)
export interface DocuifyNode {
  id: string; // Unique node ID
  fullPath: string; // Complete path (e.g., "docs/intro.md")
  name: string; // Name of the file or folder
  type: "folder" | "file"; // Node type
  parentId?: string; // ID of parent node
  metadata?: Record<string, any>; // Optional metadata for the node
  extension?: string | null; // File extension for files
  children?: DocuifyNode[]; // Only present on folders

  // Internal transform queue — used to stage content transformations
  _contentTransformQueue?: TransformerFunction[];

  /**
   * Public content actions exposed to plugins or consumers.
   * Includes ability to register transforms, apply them, and load content.
   */
  action?: {
    /**
     * Adds a content transformation function to the internal queue.
     * These will be applied in the order they are added.
     */
    useTransform?: (fn: TransformerFunction) => void;

    /**
     * Applies all registered transformations to raw content.
     * Useful when you already have content and just want to process it.
     */
    transformContent?: (rawContent: string) => Promise<string>;

    /**
     * Loads and transforms the file content via `getContent`.
     * Throws if no loader is defined.
     */
    loadContent?(): Promise<string>;
  };

  /**
   * Extensibility hook for plugins.
   * Arbitrary keys can be attached to the node.
   * Example: node.myPluginData = { ... }
   */
  [key: string]: any;
}
