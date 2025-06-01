import { BaseSource } from "../base/baseSource";
import { SourceFileData, SourceFile } from "../base/types";

interface GithubSourceConfig {
  token: string;
  branch: string;
  repoFullName: string; // like "owner/repo"
  path: string;
  github_api_version?: string;
  metadataFields?: string[]; // new optional list of fields to include in metadata
}

export class Github extends BaseSource {
  override name = "_Github";

  config: GithubSourceConfig;

  constructor(config: GithubSourceConfig) {
    super();
    // Validate the configuration like a TSA agent on a caffeine rush
    if (
      !config.token ||
      !config.branch ||
      !config.repoFullName ||
      !config.path
    ) {
      throw new Error("Invalid config passed to Github source.");
    }

    this.config = config;
  }

  override async fetch(): Promise<SourceFileData> {
    // Step 1: Grab the entire file tree from GitHub
    //
    console.log("soruce is fetching...");
    const data = await this.request();

    // Step 2: Parse that chaotic mess into something actually usable
    const parsedData = await this.parse(data.tree);

    console.log("Done fetching", parsedData);
    return { source: "github", items: parsedData };
  }

  private get requestHeaders() {
    return {
      Authorization: `Bearer ${this.config.token}`,
      "X-GitHub-Api-Version": this.config.github_api_version ?? "2022-11-28",
    };
  }

  private async parse(data: any[]): Promise<SourceFile[]> {
    const fields = this.config.metadataFields || ["sha"];

    return await Promise.all(
      data
        .filter((item) => item.path?.startsWith(this.config.path))
        .map(async (item) => {
          const isFolder = item.type === "tree";

          // Pick only specified fields into metadata
          const metadata: Record<string, any> = {};

          for (const field of fields) {
            if (field in item) {
              metadata[field] = item[field];
            }
          }
          const base: SourceFile = {
            path: item.path,
            type: isFolder ? "folder" : "file",
            metadata,
          };

          if (isFolder) {
            return base;
          }

          try {
            const content = await this.fetchFileContent(item.path);
            return { ...base, content };
          } catch (err) {
            // File failed to load? Panic! 🔥
            throw new Error(
              `Failed to fetch content for ${item.path}: ${(err as Error).message}`,
            );
          }
        }),
    );
  }

  private async fetchFileContent(path: string): Promise<string> {
    const url = `https://raw.githubusercontent.com/${this.config.repoFullName}/${this.config.branch}/${path}`;
    const res = await fetch(url, { headers: this.requestHeaders });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch file content from GitHub: ${res.status} ${res.statusText}`,
      );
    }

    return await res.text();
  }

  private async request(): Promise<any> {
    const url = `https://api.github.com/repos/${this.config.repoFullName}/git/trees/${this.config.branch}?recursive=1`;
    const res = await fetch(url, { headers: this.requestHeaders });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch data from GitHub: ${res.status} ${res.statusText}`,
      );
    }

    return await res.json();
  }
}
