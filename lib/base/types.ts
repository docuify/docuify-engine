export type SourceFile = {
  path: string;
  sha: string;
  type: "folder" | "file";
  content?: string;
  metadata?: Record<string, any>; // Metadata is now standard; include {} if unused
};

export type SourceFileData = {
  source: string; // e.g. "github", "gitlab", "bitbucket", "gdrive", "neuralNet-vault9000"
  items: SourceFile[];
};

export interface DocuifyNode {
  id: string;
  fullPath: string;
  name: string;
  type: "folder" | "file";
  children?: DocuifyNode[];
  content?: string;
  parentId?: string;
  [key: string]: any;
}
