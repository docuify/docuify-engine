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
