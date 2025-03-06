import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // This enables jsx in .js files
      include: "**/*.{jsx,js,tsx,ts}",
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  // If you were using process.env in your code, you might need this
  define: {
    // This allows "process.env.VITE_API_BASE_URL" to work in your code
    "process.env": {},
  },
});
