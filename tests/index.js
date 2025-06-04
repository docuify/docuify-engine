// Example: Using Docuify Engine with GitHub source and FrontMatter plugin

const { LocalFile } = require("@docuify/engine/source");
const { DocuifyEngine } = require("@docuify/engine");
const { FrontMatterPlugin } = require("@docuify/engine/plugins");
const { inspect } = require("util");
require("dotenv").config(); // Loads .env file where your GitHub token should be stored

async function run() {
  const engine = new DocuifyEngine({
    source: new LocalFile("./tests/docs"),

    plugins: [
      new FrontMatterPlugin(), // Plugin to parse YAML frontmatter in markdown files
    ],

    disableContentPreload: false,
  });

  const results = await engine.buildTree();

  console.log(
    inspect(results, {
      colors: true,
      depth: null,
    }),
  );
}

/*
new Github({
  branch: "main", // Git branch to fetch files from
  repoFullName: "itszavier/typemark-test-doc", // GitHub repo full name: owner/repo                  // Folder path inside the repo to read files from
  token: process.env.token, // GitHub personal access token from environment variable
}),*/

run();
