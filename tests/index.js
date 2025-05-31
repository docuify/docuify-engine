const { Github } = require("@docuify/engine/source");
require("dotenv").config();

const githubSource = new Github({
  branch: "main",
  repoFullName: "itszavier/typemark-test-doc",
  path: "docs",
  token: process.env.token, // fixed typo here
});

(async () => {
  try {
    console.log("Starting fetch from GitHub source...");
    const data = await githubSource.fetch();
    console.log("Fetch complete! Here is the data:");
    console.dir(data, { depth: 3 });
  } catch (error) {
    console.error("Error fetching data from GitHub source:", error);
  }
})();
