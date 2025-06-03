import { SourceFile } from "./types";

// Base class every source should implement. No freeloaders allowed.
export abstract class BaseSource {
  abstract name: string;
  abstract fetch(): SourceFile[] | Promise<SourceFile[]>;
}
