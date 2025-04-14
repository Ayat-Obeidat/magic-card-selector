import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier"; // إضافة Prettier

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: [
      "js/recommended",
      "plugin:prettier/recommended", // إضافة Prettier
      eslintConfigPrettier, // تعطيل القواعد التي تتعارض مع Prettier
    ],
  },
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "script" },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.browser },
  },
]);
