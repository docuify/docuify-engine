import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["lib/**/*.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  minify: false,
  outDir: "dist",
  target: "node18",
  splitting: false,
  
});
