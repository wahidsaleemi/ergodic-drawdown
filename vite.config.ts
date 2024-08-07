import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import svgrPlugin from "vite-plugin-svgr";

const options = {
  remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mdx(options), svgrPlugin()],
});
