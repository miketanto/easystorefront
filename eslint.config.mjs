import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Ignore generated Prisma client code (contains intentional patterns like any, unused vars, CommonJS requires)
// to keep lint signal focused on hand-written source.
const eslintConfig = [
  { ignores: ["src/generated/prisma/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
