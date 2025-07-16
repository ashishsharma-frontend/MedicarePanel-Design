// vite.config.js
import path from "path";
import react from "file:///C:/Users/USER/Desktop/Medicare-projects/medicare-upcoming-v2/medicare-v2-admin/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///C:/Users/USER/Desktop/Medicare-projects/medicare-upcoming-v2/medicare-v2-admin/node_modules/vite/dist/node/index.js";
import { VitePWA } from "file:///C:/Users/USER/Desktop/Medicare-projects/medicare-upcoming-v2/medicare-v2-admin/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\USER\\Desktop\\Medicare-projects\\medicare-upcoming-v2\\medicare-v2-admin";
var vite_config_default = defineConfig({
  plugins: [
    react()
    // VitePWA({
    //   manifest: {
    //    "name": "Medicare - Admin",
    // "short_name": "Medicare",
    // "description": "A fast and modern Vite React app.",
    // "start_url": "/admin",
    // "display": "standalone",
    // "background_color": "#ffffff",
    // "theme_color": "#317EFB",
    // "orientation": "portrait",
    // "icons": [
    //   {
    //     "src": "/admin/192x192.png",
    //     "sizes": "192x192",
    //     "type": "image/png"
    //   },
    //   {
    //     "src": "/admin/512.png",
    //     "sizes": "512x512",
    //     "type": "image/png"
    //   },
    //   {
    //     "src": "/admin/512x512.png",
    //     "sizes": "512x512",
    //     "type": "image/png",
    //     "purpose": "maskable"
    //   }
    // ]
    //   },
    //   registerType: "autoUpdate",
    //   includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
    // }),
  ],
  define: {
    "process.env": process.env
    // Ensure this is included
  },
  base: "/admin",
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERlc2t0b3BcXFxcTWVkaWNhcmUtcHJvamVjdHNcXFxcbWVkaWNhcmUtdXBjb21pbmctdjJcXFxcbWVkaWNhcmUtdjItYWRtaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVTRVJcXFxcRGVza3RvcFxcXFxNZWRpY2FyZS1wcm9qZWN0c1xcXFxtZWRpY2FyZS11cGNvbWluZy12MlxcXFxtZWRpY2FyZS12Mi1hZG1pblxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvVVNFUi9EZXNrdG9wL01lZGljYXJlLXByb2plY3RzL21lZGljYXJlLXVwY29taW5nLXYyL21lZGljYXJlLXYyLWFkbWluL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSBcInZpdGUtcGx1Z2luLXB3YVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgXHJcbiAgICAvLyBWaXRlUFdBKHtcclxuICAgIC8vICAgbWFuaWZlc3Q6IHtcclxuICAgIC8vICAgIFwibmFtZVwiOiBcIk1lZGljYXJlIC0gQWRtaW5cIixcclxuICAgIC8vIFwic2hvcnRfbmFtZVwiOiBcIk1lZGljYXJlXCIsXHJcbiAgICAvLyBcImRlc2NyaXB0aW9uXCI6IFwiQSBmYXN0IGFuZCBtb2Rlcm4gVml0ZSBSZWFjdCBhcHAuXCIsXHJcbiAgICAvLyBcInN0YXJ0X3VybFwiOiBcIi9hZG1pblwiLFxyXG4gICAgLy8gXCJkaXNwbGF5XCI6IFwic3RhbmRhbG9uZVwiLFxyXG4gICAgLy8gXCJiYWNrZ3JvdW5kX2NvbG9yXCI6IFwiI2ZmZmZmZlwiLFxyXG4gICAgLy8gXCJ0aGVtZV9jb2xvclwiOiBcIiMzMTdFRkJcIixcclxuICAgIC8vIFwib3JpZW50YXRpb25cIjogXCJwb3J0cmFpdFwiLFxyXG4gICAgLy8gXCJpY29uc1wiOiBbXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICBcInNyY1wiOiBcIi9hZG1pbi8xOTJ4MTkyLnBuZ1wiLFxyXG4gICAgLy8gICAgIFwic2l6ZXNcIjogXCIxOTJ4MTkyXCIsXHJcbiAgICAvLyAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCJcclxuICAgIC8vICAgfSxcclxuICAgIC8vICAge1xyXG4gICAgLy8gICAgIFwic3JjXCI6IFwiL2FkbWluLzUxMi5wbmdcIixcclxuICAgIC8vICAgICBcInNpemVzXCI6IFwiNTEyeDUxMlwiLFxyXG4gICAgLy8gICAgIFwidHlwZVwiOiBcImltYWdlL3BuZ1wiXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICBcInNyY1wiOiBcIi9hZG1pbi81MTJ4NTEyLnBuZ1wiLFxyXG4gICAgLy8gICAgIFwic2l6ZXNcIjogXCI1MTJ4NTEyXCIsXHJcbiAgICAvLyAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAvLyAgICAgXCJwdXJwb3NlXCI6IFwibWFza2FibGVcIlxyXG4gICAgLy8gICB9XHJcbiAgICAvLyBdXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXHJcbiAgICAvLyAgIGluY2x1ZGVBc3NldHM6IFtcImZhdmljb24uaWNvXCIsIFwicm9ib3RzLnR4dFwiLCBcImFwcGxlLXRvdWNoLWljb24ucG5nXCJdLFxyXG4gICAgLy8gfSksXHJcbiAgXSxcclxuICBkZWZpbmU6IHtcclxuICAgICdwcm9jZXNzLmVudic6IHByb2Nlc3MuZW52LCAvLyBFbnN1cmUgdGhpcyBpcyBpbmNsdWRlZFxyXG4gIH0sXHJcbiAgYmFzZTogXCIvYWRtaW5cIixcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBhLE9BQU8sVUFBVTtBQUMzYixPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxlQUFlO0FBSHhCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFrQ1I7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLGVBQWUsUUFBUTtBQUFBO0FBQUEsRUFDekI7QUFBQSxFQUNBLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQTtBQUFBLE1BRUwsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
