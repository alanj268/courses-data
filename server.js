const server = Bun.serve({
  port: 8000,
  async fetch(req) {
    const url = new URL(req.url);
    let filepath = url.pathname === "/" ? "/index.html" : url.pathname;
    
    if (filepath.includes("..")) {
      return new Response("Forbidden", { status: 403 });
    }

    try {
      if (filepath === "/index.html" || filepath.endsWith(".json")) {
        const file = Bun.file("." + filepath);
        const exists = await file.exists();
        
        if (!exists) {
          return new Response("Not Found", { status: 404 });
        }

        let contentType = "text/plain";
        if (filepath.endsWith(".html")) contentType = "text/html";
        else if (filepath.endsWith(".json")) contentType = "application/json";

        return new Response(file, {
          headers: {
            "Content-Type": contentType,
          },
        });
      }
      
      if (filepath === "/search" && req.method === "POST") {
        const { query } = await req.json();
        
        const coursesFile = Bun.file("./courses.json");
        const data = await coursesFile.json();
        
        const coursesData = Object.values(data).map(course => ({
          id: course.courseID,
          name: course.name,
          desc: course.desc,
          department: course.department,
          units: course.units,
          prereqString: course.prereqString || 'None'
        }));
        
        const results = coursesData.filter(course => {
          const searchTerm = query.toLowerCase();
          return (
            course.id.toLowerCase().includes(searchTerm) ||
            course.name.toLowerCase().includes(searchTerm) ||
            course.desc.toLowerCase().includes(searchTerm) ||
            course.department.toLowerCase().includes(searchTerm)
          );
        }).slice(0, 10);
        
        return new Response(JSON.stringify(results), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      
      return new Response("Not Found", { status: 404 });
    } catch (error) {
      console.error(`Error serving ${filepath}:`, error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}`);
