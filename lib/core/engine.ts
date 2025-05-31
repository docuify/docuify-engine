import { Github } from "../sources";
import { BasePlugin } from "./basePlugins";
import { BaseSource } from "./baseSource";

export interface DocuifyEngineConfig {
  source: BaseSource;
  plugins: BasePlugin;
}

export default class DocuifyEngine {
  config: DocuifyEngineConfig;

  constructor(config: DocuifyEngineConfig) {
    // Initialize the engine
    this.config = config;
  }
}
