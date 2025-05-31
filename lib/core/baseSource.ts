export type ParsedSourceItem = {
  path: string;
  sha: string;
  type: "folder" | "file";
  content?: string;
  metadata?: Record<string, any>; // Metadata is now standard; include {} if unused
};

export type SourceData = {
  source: string; // e.g. "github", "gitlab", "bitbucket", "gdrive", "neuralNet-vault9000"
  items: ParsedSourceItem[];
};

// Base class every source should implement. No freeloaders allowed.
export abstract class BaseSource {
  abstract fetch(): Promise<SourceData>;
}
