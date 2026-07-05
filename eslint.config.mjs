import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([{
    ignores: [
        ".checkpoint_*/**",
        ".next/**",
        "node_modules/**",
        "outputs/**",
    ],
    extends: [...nextCoreWebVitals],
    settings: {
        react: {
            version: "19.2.1",
            defaultVersion: "19.2.1",
        },
    },
    rules: {
         "react/display-name": "off",
         "react-hooks/set-state-in-effect": "off",
         "react-hooks/use-memo": "off",
         "react-hooks/exhaustive-deps": "warn",
         "react/no-unescaped-entities": "off"
    }
}]);
