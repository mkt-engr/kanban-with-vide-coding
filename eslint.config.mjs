import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from "eslint-plugin-unused-imports";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // 未使用変数・import関連
      "@typescript-eslint/no-unused-vars": "error",
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // function禁止・arrow関数強制
      "prefer-arrow-callback": "error",
      "func-style": ["error", "expression", { allowArrowFunctions: true }],
      "@typescript-eslint/prefer-function-type": "error",

      // 変数・関数の命名規則
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "property",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          filter: {
            regex:
              "^(text-|bg-|border-|font-|px-|py-|m-|p-|w-|h-|flex-|grid-|rounded-|shadow-|hover:|focus:|active:|group-hover:|sm:|md:|lg:|xl:|2xl:)",
            match: false,
          },
        },
        {
          selector: "property",
          format: null,
          filter: {
            regex:
              "^(text-|bg-|border-|font-|px-|py-|m-|p-|w-|h-|flex-|grid-|rounded-|shadow-|hover:|focus:|active:|group-hover:|sm:|md:|lg:|xl:|2xl:)",
            match: true,
          },
        },
        {
          selector: "method",
          format: ["camelCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^I[A-Z]",
            match: false,
          },
        },
      ],

      // コード品質向上
      "no-var": "error", // var禁止、let/constを使用
      "prefer-const": "error", // 再代入しない変数はconstを使用
      "object-shorthand": "error", // オブジェクトの省略記法を強制 {name: name} → {name}
      "prefer-template": "error", // 文字列結合よりテンプレートリテラルを推奨
      "no-useless-concat": "error", // 不要な文字列結合を禁止 "a" + "b" → "ab"

      // React/Next.js固有
      "react/jsx-pascal-case": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
