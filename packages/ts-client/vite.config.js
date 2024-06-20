import { resolve } from "path";

import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

export default defineConfig({
  build: {
    target: "es2022",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ts-client",
      fileName: "ts-client",
    },
    // rollupOptions: {
    //   external: Object.keys(pkg.dependencies || {}),
    //   output: {
    //     globals: {
    //       events: "EventEmitter",
    //       uuid: "uuid",
    //     },
    //   },
    // },
  },
  // test: {
  //   exclude: [...configDefaults.exclude, "e2e"],
  //   coverage: {
  //     include: ["src"],
  //   },
  // },
  plugins: [dts({include: "./src/**/*", rollupTypes: true})],
});
