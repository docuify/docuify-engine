import { DocuifyNode } from "../base/types";
import { walkTree } from "./walk_tree";

// Shared logic for preloading a list of files
async function preloadFiles(
  files: DocuifyNode[],
  concurrency = 10,
  keepContent = false,
): Promise<void> {
  const fileList = files.filter(
    (f) => f.type === "file" && typeof f.actions?.loadContent === "function",
  );

  let index = 0;

  const worker = async () => {
    while (index < fileList.length) {
      const currentIndex = index++;
      const file = fileList[currentIndex];

      try {
        await file.actions?.loadContent?.();
      } catch (err) {
        console.warn(
          `[docuify] Failed to preload content for: ${file.path}`,
          err,
        );
      }
    }
  };

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
}

// Preload for flat list
export async function preloadFlatNodesContent(
  nodes: DocuifyNode[],
  concurrency = 10,
  keepContent = false,
): Promise<void> {
  await preloadFiles(nodes, concurrency, keepContent);
}

// Preload for full tree
export async function preloadTreeContent(
  tree: DocuifyNode,
  concurrency = 10,
  keepContent = false,
): Promise<void> {
  const files: DocuifyNode[] = [];
  walkTree(tree, (node) => {
    if (node.type === "file") {
      files.push(node);
    }
  });

  await preloadFiles(files, concurrency, keepContent);
}
