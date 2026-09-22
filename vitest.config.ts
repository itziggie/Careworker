import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // The suite shares one SQLite file across test files; running them in
    // separate processes/threads causes concurrent-write lock errors.
    fileParallelism: false,
  },
});
