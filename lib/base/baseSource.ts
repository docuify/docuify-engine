import { SourceFileData } from "./types";


// Base class every source should implement. No freeloaders allowed.
export abstract class BaseSource {
  abstract fetch(): Promise<SourceFileData>;
}
