const server = Bun.serve({
  port: 8000,
  async fetch(req) {
    const url = new URL(req.url);
    let filepath = url.pathname === "/" ? "/index.html" : url.pathname;
    
    if (filepath.includes("..")) {
      return new Response("Forbidden", { status: 403 });
    }

    try {
      const file = Bun.file("." + filepath);
      
      const exists = await file.exists();
      if (!exists) {
        return new Response("Not Found", { status: 404 });
      }

      let contentType = "text/plain";
      if (filepath.endsWith(".html")) contentType = "text/html";
      else if (filepath.endsWith(".js")) contentType = "application/javascript";
      else if (filepath.endsWith(".json")) contentType = "application/json";

      return new Response(file, {
        headers: {
          "Content-Type": contentType,
        },
      });
    } catch (error) {
      console.error(`Error serving ${filepath}:`, error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}`);
