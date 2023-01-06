import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";

import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
const dependencies = Object.keys(pkg.dependencies)
  .map((dependency) =>
    JSON.parse(
      readFileSync(`node_modules/${dependency}/package.json`, {
        encoding: "utf8",
      })
    )
  )
  .map(({ name, version, license, homepage }) => ({
    name,
    version,
    license,
    homepage,
  }));
process.env.VUE_APP_DEPENDENCIES = JSON.stringify(dependencies);

// https://astro.build/config
export default defineConfig({
  // Enable Vue to support Vue components.
  integrations: [vue(), mdx()],
});
