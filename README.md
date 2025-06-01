
# Docuify Engine

[![npm version](https://img.shields.io/npm/v/docuify-engine.svg)](https://www.npmjs.com/package/docuify-engine)
[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/docuify-engine/ci.yml?branch=main)](https://github.com/docuify/docuify-engine/actions)
[![License](https://img.shields.io/npm/l/docuify-engine.svg)](https://opensource.org/licenses/MIT)

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
import { DocuifyEngine } from "docuify-engine";
import { GitHubSource } from "docuify-source-github";
import { FrontmatterPlugin } from "docuify-plugin-frontmatter";
import { SidebarIndexPlugin } from "docuify-plugin-sidebar-index";

const engine = new DocuifyEngine({
  source: new GitHubSource({ repo: "user/repo" }),
  plugins: [
    new FrontmatterPlugin(),
    new SidebarIndexPlugin(),
  ],
});

const { tree, foot } = await engine.build();

console.log("Tree built with plugins:", tree);
console.log("Used plugins:", foot.pluginNames);
````



## What’s Next?

* 🎨 Pretty, colorful debug logs — because debugging should be fun, not sad
* 🔍 Snapshot & diff utilities for smarter change tracking
* ⚙️ Plugin presets to save time
* 🌍 More source types (local files, ZIP archives, APIs)



Docuify Engine is **headless by design**, ready for contributions, and eager to help you build better docs — or just organize your files — one node at a time.



Feel free to open issues, submit PRs, or just hang out in discussions. Let’s build something awesome together!



© 2025 Docuify Engine — made with ❤️ and a pinch of curiosity.



