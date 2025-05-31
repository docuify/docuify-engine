interface GithubSourceConfig {
  token: string;
  branch: string;
  repoFullName: string; // repo along with owner so like this owner/repo
  path: string;
  github_api_version?: string;
}

export class Github {
  config: GithubSourceConfig;

  constructor(config: GithubSourceConfig) {
    // Initialize the source
    if (
      !config.token ||
      !config.branch ||
      !config.repoFullName ||
      !config.path
    ) {
      throw new Error("Invalid config");
    }

    this.config = config;
  }

  async fetch() {
    // Fetch data from GitHub
    const data = await this.request();
    const parsedData = await this.parse(data.tree);

    return parsedData;
  }

  private get requestHeaders() {
    return {
      Authorization: `Bearer ${this.config.token}`,
      "X-GitHub-Api-Version": this.config.github_api_version ?? "2022-11-28",
    };
  }

  private async parse(data: any) {
    const parsedData: {
      path: string;
      sha: string;
      type: "folder" | "file";
      content?: string;
    }[] = [];

    for (const item of [...data]) {
      if (!item.path || !item.sha || !item.type) {
        continue;
      }

      if (!item.path.startsWith(this.config.path)) {
        continue;
      }

      if (item.type === "folder") {
        parsedData.push({
          path: item.path,
          sha: item.sha,
          type: "folder",
        });
      } else {
        // fetch the content of the file
        const content = await this.fetchFileContent(item.sha);
        parsedData.push({
          path: item.path,
          sha: item.sha,
          type: "file",
          content,
        });
      }
    }
    return parsedData;
  }

  async fetchFileContent(path: string): Promise<string> {
    const res = await fetch(
      `https://raw.githubusercontent.com/${this.config.repoFullName}/${this.config.branch}/${path}`,
      { headers: this.requestHeaders },
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch file content from GitHub: ${res.status} ${res.statusText}`,
      );
    }

    const content = await res.text();

    return content;
  }

  private async request() {
    const res = await fetch(
      `https://api.github.com/repos/${this.config.repoFullName}/git/trees/${this.config.branch}?recursive=1`,
      { headers: this.requestHeaders },
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch data from GitHub: ${res.status} ${res.statusText}`,
      );
    }

    const data = await res.json();

    return data;
  }
}
