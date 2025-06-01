// Example: Using Docuify Engine with GitHub source and FrontMatter plugin

const { Github } = require("@docuify/engine/source");
const { DocuifyEngine } = require("@docuify/engine");
const { FrontMatterPlugin } = require("@docuify/engine/plugins");
const { inspect } = require("util");
require("dotenv").config(); // Loads .env file where your GitHub token should be stored

// Create a new DocuifyEngine instance with GitHub as the source
const engine = new DocuifyEngine({
  source: new Github({
    branch: "main",                 // Git branch to fetch files from
    repoFullName: "itszavier/typemark-test-doc", // GitHub repo full name: owner/repo
    path: "docs",                  // Folder path inside the repo to read files from
    token: process.env.token,      // GitHub personal access token from environment variable
  }),
  plugins: [
    new FrontMatterPlugin(),       // Plugin to parse YAML frontmatter in markdown files
  ],
});

(async () => {
  try {
    // Build the tree from the source and apply plugins
    const result = await engine.build();

    // Pretty-print the full result tree with colors and unlimited depth
    console.log(inspect(result, { depth: null, colors: true }));
  } catch (error) {
    console.error("Error fetching data from GitHub source:", error);
  }
})();
