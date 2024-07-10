import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// function FullReloadPlugin() {
//   return {
//     name: "full-reload",
//     configureServer(server: {
//       watcher: { on: (x: string, cb: (path: string) => void) => {} };
//       ws: { send: (x: { type: string }) => void };
//     }) {
//       server.watcher.on("change", (path: string) => {
//         if (
//           path.endsWith(".js") ||
//           path.endsWith(".tsx") ||
//           path.endsWith(".css") ||
//           path.endsWith(".html")
//         ) {
//           console.log(`File ${path} changed, triggering full reload.`);
//           server.ws.send({ type: "full-reload" });
//         }
//       });
//     },
//   };
// }
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/ergodic-drawdown/",
});
