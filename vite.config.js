import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 *
 */
function FullReloadPlugin() {
  return {
    configureServer(server) {
      server.watcher.on("change", (path) => {
        if (
          path.endsWith(".js") ||
          path.endsWith(".tsx") ||
          path.endsWith(".css") ||
          path.endsWith(".html")
        ) {
          console.log(
            "File ".concat(path, " changed, triggering full reload."),
          );
          server.ws.send({ type: "full-reload" });
        }
      });
    },
    name: "full-reload",
  };
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), FullReloadPlugin()],
});
