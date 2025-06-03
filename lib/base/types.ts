export type SourceFile = {
  path: string;
  type: "folder" | "file";
  content?: string;
  extension?: string | null;
  metadata?: Record<string, any>; // Metadata is now standard; include {} if unused
};

/** @deprecated
 * @description no longer needed
 */
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
  metadata?: Record<string, any>;
  extension?: string | null;
  [key: string]: any;
}
