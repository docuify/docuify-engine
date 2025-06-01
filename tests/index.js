const { Github } = require("@docuify/engine/source");
const { DocuifyEngine } = require("@docuify/engine");
const { FrontMatterPlugin } = require("@docuify/engine/plugins");
const { inspect } = require("util");
require("dotenv").config();

const engine = new DocuifyEngine({
  source: new Github({
    branch: "main",
    repoFullName: "itszavier/typemark-test-doc",
    path: "docs",
    token: process.env.token, // fixed typo here
  }),

  plugins: [new FrontMatterPlugin()],
});

(async () => {
  try {
    const tree = await engine.build();

    console.log(inspect(tree, { depth: null, colors: true }));
  } catch (error) {
    console.error("Error fetching data from GitHub source:", error);
  }
})();
