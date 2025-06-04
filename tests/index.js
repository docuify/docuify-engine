// Example: Using Docuify Engine with GitHub source and FrontMatter plugin

const { Github } = require("@docuify/engine/source");
const { DocuifyEngine } = require("@docuify/engine");
const { FrontMatterPlugin } = require("@docuify/engine/plugins");
const { inspect } = require("util");
require("dotenv").config(); // Loads .env file where your GitHub token should be stored

const engine = new DocuifyEngine({
  source: new Github({
    branch: "main", // Git branch to fetch files from
    repoFullName: "itszavier/typemark-test-doc", // GitHub repo full name: owner/repo                  // Folder path inside the repo to read files from
    token: process.env.token, // GitHub personal access token from environment variable
  }),

  plugins: [
    new FrontMatterPlugin(), // Plugin to parse YAML frontmatter in markdown files
  ],

  filter: (file) => file.path.startsWith("docs"),
});

(async () => {
  try {
    // Build the tree from the source and apply plugins
    const result = await engine.flatBuild();

    console.log(inspect(result, { depth: null, colors: true }));

    const data = await Promise.all(
      result.nodes
        .filter((node) => node.type === "file")
        .map(async (node) => {
          const content = await node.action?.loadContent();
          return {
            ...node,
            content: content,
            frontmatter: node.frontmatter ?? null,
          };
        }),
    );

    // Pretty-print the full result tree with colors and unlimited depth
    console.log(inspect(data, { depth: null, colors: true }));
  } catch (error) {
    console.error("Error fetching data from GitHub source:", error);
  }
})();
