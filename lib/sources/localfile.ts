import { BaseSource } from "../base/baseSource";
import { SourceFile } from "../base/types";
import fs from "fs/promises";
import path from "path";

export class LocalFile extends BaseSource {
  override name = "local-file-source";

  constructor(private rootDir: string) {
    super();
    this.rootDir = path.resolve(process.cwd(), rootDir);
  }

  // Recursively fetch files from the local directory
  override async fetch(): Promise<SourceFile[]> {
    const files: SourceFile[] = [];
    await this._readDirRecursive(this.rootDir, files);
    return files;
  }

  private async _readDirRecursive(
    dir: string,
    files: SourceFile[],
    parentPath = "",
  ) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
  
    for (const entry of entries) {
      
      const fullPath = path.join(dir, entry.name);
      const relativePath = parentPath
        ? `${parentPath}/${entry.name}`
        : entry.name;

      if (entry.isDirectory()) {
        // Add folder node info only if you want, but generally folders aren't SourceFiles
        await this._readDirRecursive(fullPath, files, relativePath);
      } else if (entry.isFile()) {
        files.push({
          path: relativePath,
          type: "file",
          extension: path.extname(entry.name).slice(1), // remove dot
          loadContent: async () => {
            return fs.readFile(fullPath, "utf-8");
          },
        });
      }
    }
  }
}
