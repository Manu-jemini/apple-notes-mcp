import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import type { Linter } from "eslint";

const config: Linter.Config[] = [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin as Record<string, unknown>,
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs?.["recommended"]?.rules,

      // Enforce stderr-only logging (stdout corrupts JSON-RPC channel)
      "no-console": ["error", { allow: ["error"] }],

      // Keep code predictable
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
];

export default config;
