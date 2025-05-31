interface GithubSourceConfig {
  token: string;
  branch: string;
  repoFullName: string; // like "owner/repo"
  path: string;
  github_api_version?: string;
}

export type ParsedSourceItem = {
  path: string;
  sha: string;
  type: "folder" | "file";
  content?: string;
};

export class Github {
  config: GithubSourceConfig;

  constructor(config: GithubSourceConfig) {
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

  async fetch(): Promise<ParsedSourceItem[]> {
    // Step 1: Grab the entire file tree from GitHub
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

  private async parse(data: any[]): Promise<ParsedSourceItem[]> {
    return await Promise.all(
      data
        .filter((item) => item.path?.startsWith(this.config.path))
        .map(async (item) => {
          const isFolder = item.type === "tree";
          const base: ParsedSourceItem = {
            path: item.path,
            sha: item.sha,
            type: isFolder ? "folder" : "file",
          };

          if (isFolder) {
            return base;
          }

          try {
            const content = await this.fetchFileContent(item.path);
            return { ...base, content };
          } catch (err) {
            // File failed to load? Still return the base info. Nobody's perfect.
            return base;
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
