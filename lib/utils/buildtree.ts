import { SourceFile, DocuifyNode } from "../base/types";

let idCounter = 0;

function generateId(): string {
  return `node-${idCounter++}`;
}

export function buildTree(sourceFiles: SourceFile[]): DocuifyNode {
  const root: DocuifyNode = {
    id: generateId(),
    name: "root", // Root node
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

      let found = current.children.find((child) => child.name === part);

      if (!found) {
        found = {
          id: generateId(),
          name: part,
          fullPath: parts.slice(0, i + 1).join("/"),
          type: !isLast ? "folder" : file.type,
          parentId: current.id,
          // We only attach metadata to files, not folders. Why? Because folders on GitHub can have metadata like SHAs,
          // but that info can get tricky and cause inaccuracies when building the tree structure.
          // So for now, we keep it simple and clean by only assigning metadata to actual files.
          // We'll handle the folder metadata drama later — nobody likes messy data!
          metadata:
            isLast && file.type === "file" && file.metadata
              ? { ...file.metadata }
              : undefined,
        };

        if (!isLast || found.type === "folder") {
          found.children = [];
        } else {
          found.content = file.content;
        }

        current.children.push(found);
      }

      current = found;
    }
  }

  return root;
}
