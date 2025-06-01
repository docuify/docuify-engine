
# Docuify Engine

[![npm version](https://img.shields.io/npm/v/docuify-engine.svg)](https://www.npmjs.com/package/docuify-engine)
[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/docuify-engine/ci.yml?branch=main)](https://github.com/docuify/docuify-engine/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


> A flexible, pluggable engine for building and transforming documentation content from source files.



## Why I’m Building This

This started as a **learning experience** — I wanted to figure out how to fetch, organize, and transform content from repositories cleanly, especially from GitHub.

To my surprise, what I built turned out to be pretty powerful and flexible! It’s not just for documentation — with the right source, Docuify Engine can parse and organize *any* folder and file structure.

Right now, it’s a standalone package (not yet plugged into my main project), but I wanted to open source it early for others who might find it useful or want to contribute.

Docuify Engine is designed to be reusable and pluggable, giving developers full control over content architecture without locking them into any specific platform or stack.

Think of it as a Swiss Army knife for your file trees — sharp, versatile, and ready for anything (except opening actual bottles, for now).



## What Docuify Engine Does

- 📁 Converts source files into a neat tree structure
- 🔌 Lets you transform the tree with plugins (because who doesn’t love plugins?)
- 🧠 Keeps metadata and context intact
- 🚫 Leaves rendering up to you — it’s all about content, not style



## Use Cases

- Custom docs platforms
- Markdown engines
- Learning tools
- Static site generators
- Knowledge base apps
- Any project that needs to wrangle structured content with ease


## Quick Example

```ts
/**
 * This script:
 * 1. Connects to a GitHub repository and fetches files from a specified path and branch.
 * 2. Builds a tree structure representing the folder and file hierarchy of the source.
 * 3. Applies plugins (like FrontMatterPlugin) to transform or extract metadata from files.
 * 4. Returns a structured object that contains the processed content tree.
 * 5. Prints the complete tree with colors for easier inspection.
 */

const { Github } = require("@docuify/engine/source");         // GitHub source implementation to fetch files
const { DocuifyEngine } = require("@docuify/engine");         // Core engine that builds and processes the tree
const { FrontMatterPlugin } = require("@docuify/engine/plugins"); // Plugin to parse YAML frontmatter in files
const { inspect } = require("util");                           // Node util for pretty console output
require("dotenv").config();                                    // Load environment variables from .env

// Initialize DocuifyEngine with GitHub source and FrontMatter plugin
const engine = new DocuifyEngine({
  source: new Github({
    branch: "main",                      // Which branch to fetch files from
    repoFullName: "itszavier/typemark-test-doc", // GitHub repo to read files from
    path: "docs",                       // Path inside the repo to scan files
    token: process.env.token,           // GitHub access token for authentication (required for private repos or higher rate limits)
  }),
  plugins: [
    new FrontMatterPlugin(),            // This plugin extracts YAML frontmatter metadata from markdown files
  ],
});

(async () => {
  try {
    // Step 1 & 2: Fetch files from GitHub and build a hierarchical tree structure representing folders and files.
    // Step 3: Walk through the tree applying each plugin, transforming or augmenting the nodes.
    // Step 4: Return an object containing the final processed tree, source info, and applied plugin names.
    const result = await engine.build();

    // Step 5: Log the entire processed tree to the console in a readable, colorized format.
    console.log(inspect(result, { depth: null, colors: true }));
  } catch (error) {
    // Catch and log errors that occur during fetching, building, or plugin application.
    console.error("Error fetching or processing data from GitHub source:", error);
  }
})();

````

## What’s Next?

* 🎨 Pretty, colorful debug logs — because debugging should be fun, not sad
* 🔍 Snapshot & diff utilities for smarter change tracking
* ⚙️ Plugin presets to save time
* 🌍 More source types (local files, ZIP archives, APIs)



Docuify Engine is **headless by design**, ready for contributions, and eager to help you build better docs — or just organize your files — one node at a time.



Feel free to open issues, submit PRs, or just hang out in discussions.



© 2025 Docuify Engine — made with ❤️ and a pinch of curiosity.



