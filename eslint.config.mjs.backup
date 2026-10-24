import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
  {
    ignores: ["scratch/**", "scripts/**"],
  },
];

export default eslintConfig;
