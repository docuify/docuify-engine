export interface DocuifyEngineConfig {
  token: string;
}

export default class DocuifyEngine {
  config: DocuifyEngineConfig;

  constructor(config: DocuifyEngineConfig) {
    // Initialize the engine
    this.config = config;
  }
}
