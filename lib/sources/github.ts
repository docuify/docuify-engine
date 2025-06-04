import { BaseSource } from "../base/baseSource";
import { SourceFileData, SourceFile } from "../base/types";
import getFileExtension from "../utils/extract_file_ext";
interface GithubSourceConfig {
  token: string;
  branch: string;
  repoFullName: string; // like "owner/repo"
  github_api_version?: string;
  metadataFields?: string[]; // new optional list of fields to include in metadata
}

export class Github extends BaseSource {
  override name = "Github";

  config: GithubSourceConfig;

  constructor(config: GithubSourceConfig) {
    super();
    // Validate the configuration like a TSA agent on a caffeine rush
    if (!config.token || !config.branch || !config.repoFullName) {
      throw new Error("Invalid config passed to Github source.");
    }

    this.config = config;
  }

  override async fetch(): Promise<SourceFile[]> {
    // Step 1: Grab the entire file tree from GitHub
    //
    const data = await this.request();

    // Step 2: Parse that chaotic mess into something actually usable
    const parsedData = await this.parse(data.tree);

    return parsedData;
  }

  private get requestHeaders() {
    return {
      Authorization: `Bearer ${this.config.token}`,
      "X-GitHub-Api-Version": this.config.github_api_version ?? "2022-11-28",
    };
  }

  private async parse(data: any[]): Promise<SourceFile[]> {
    const fields = this.config.metadataFields || ["sha"];

    return data.map((item): SourceFile => {
      const isFolder = item.type === "tree";

      const metadata: Record<string, any> = {};
      for (const field of fields) {
        if (field in item) {
          metadata[field] = item[field];
        }
      }

      const file: SourceFile = {
        path: item.path,
        type: isFolder ? "folder" : "file",
        metadata,
        extension: isFolder ? null : getFileExtension(item.path),
        loadContent: isFolder
          ? undefined
          : async () => this.fetchFileContent(item.path),
      };

      return file;
    });
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
