import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

function asArray(config) {
  return Array.isArray(config) ? config : [config];
}

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },
  ...asArray(coreWebVitals),
  ...asArray(typescript),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
