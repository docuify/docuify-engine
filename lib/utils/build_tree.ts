import {
  SourceFile,
  DocuifyNode,
  TransformerFunction,
  GetContentReturnType,
} from "../base/types";

let idCounter = 0;

// Generates a unique ID for each node. Simple, predictable, and safe... unless you build a million files.
function generateId(): string {
  return `node-${idCounter++}`;
}

// Creates a folder node — no content, just vibes (and children).
function createFolderNode(
  name: string,
  fullPath: string,
  parentId: string,
): DocuifyNode {
  return {
    id: generateId(),
    name,
    fullPath,
    type: "folder",
    parentId,
    children: [],
  };
}

// Creates a file node with support for lazy content loading and transformation.
// This is where the real magic happens.
function createFileNode(
  file: SourceFile,
  name: string,
  fullPath: string,
  parentId: string,
): DocuifyNode {
  const nodeId = generateId();
  const transformQueue: TransformerFunction[] = [];

  const getRawContent = file.loadContent;

  // Applies all registered content transforms in order.
  async function transformContent(rawContent: string) {
    let result: string | Promise<string> = rawContent;
    console.log("called");
    for (const transformFunction of transformQueue) {
      result = await transformFunction(result); // Let each plugin have its moment of glory.
    }

    return result;
  }

  // Loads the raw content (lazy) and applies transformations.
  async function loadContent() {
    if (!getRawContent) {
      throw new Error(`No content getter for ${file.path}`);
    }
    const raw = await getRawContent();
    return transformContent(raw);
  }

  // Adds a transformation function to the queue.

  return {
    id: nodeId,
    name,
    fullPath,
    type: "file",
    parentId,
    extension: file.extension,
    metadata: file.metadata ? { ...file.metadata } : undefined,

    // For inspection or debugging purposes — it's like peeking under the hood.
    _contentTransformQueue: transformQueue,

    // All the file's special powers are grouped here. Transform, load, mutate!
    action: {
      useTransform: (fn: TransformerFunction) => {
        transformQueue.push(fn);
        console.log(`[TransformQueue] Added transform to ${file.path}`);
      },
      transformContent,
      loadContent,
    },
  };
}

// Builds a glorious tree from a list of flat file paths.
// Like a bonsai gardener, but with TypeScript and no soil.
export function buildTree(sourceFiles: SourceFile[]): DocuifyNode {
  const root: DocuifyNode = {
    id: generateId(),
    name: "root", // Root node — the top of the tree. No parents. Just responsibilities.
    fullPath: ".",
    type: "folder",
    children: [],
  };

  for (const file of sourceFiles) {
    const parts = file.path.split("/");

    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current.children) {
        current.children = [];
      }

      // Look for an existing child node with the same name.
      let found = current.children.find((child) => child.name === part);

      if (!found) {
        const fullPath = parts.slice(0, i + 1).join("/");

        // Decide what kind of node we’re adding to the tree.
        const newNode =
          isLast && file.type === "file"
            ? createFileNode(file, part, fullPath, current.id)
            : createFolderNode(part, fullPath, current.id);

        current.children.push(newNode);
        found = newNode;
      }

      current = found;
    }
  }

  return root;
}
