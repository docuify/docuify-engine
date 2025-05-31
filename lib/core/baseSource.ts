export type ParsedSourceFile = {
  path: string;
  sha: string;
  type: "folder" | "file";
  content?: string;
  metadata?: Record<string, any>; // Metadata is now standard; include {} if unused
};

export type SourceFile = {
  source: string; // e.g. "github", "gitlab", "bitbucket", "gdrive", "neuralNet-vault9000"
  items: ParsedSourceFile[];
};

// Base class every source should implement. No freeloaders allowed.
export abstract class BaseSource {
  abstract fetch(): Promise<SourceFile>;
}
