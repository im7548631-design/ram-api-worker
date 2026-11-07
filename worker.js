export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const searchParams = url.searchParams;

    const jsonHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    const htmlHeaders = {
      "Content-Type": "text/html;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: jsonHeaders });
    }

    // 1. GET / -> HTML Dashboard with Google Fonts
    if (path === "/") {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RAM API Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .container { max-width: 600px; width: 100%; background: #1e293b; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); border: 1px solid #334155; }
    h1 { font-size: 24px; margin-bottom: 8px; color: #38bdf8; }
    p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    .endpoints { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    a.endpoint { display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 14px 18px; border-radius: 8px; color: #e2e8f0; text-decoration: none; border: 1px solid #334155; transition: all 0.2s; }
    a.endpoint:hover { border-color: #38bdf8; background: #111827; }
    .method { background: #0369a1; color: #e0f2fe; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .footer { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px; }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>RAM API Dashboard</h1>
    <p>Cloudflare Worker running live endpoints with zero-dependency responses.</p>
    <div class="endpoints">
      <a class="endpoint" href="/api/get-ram" target="_blank">
        <span>Get RAM Info</span>
        <span class="method">GET /api/get-ram</span>
      </a>
      <a class="endpoint" href="/api/version" target="_blank">
        <span>Generate Version</span>
        <span class="method">GET /api/version</span>
      </a>
      <a class="endpoint" href="/api/test/sleep?ms=1000" target="_blank">
        <span>Test Async Sleep</span>
        <span class="method">GET /api/test/sleep</span>
      </a>
    </div>
    <div class="footer">
      <span>Status: <strong style="color: #4ade80">Online</strong></span>
      <div>
        <a href="/docs" target="_blank">Swagger Docs</a> &bull; 
        <a href="/openapi.json" target="_blank">OpenAPI JSON</a>
      </div>
    </div>
  </div>
</body>
</html>`;
      return new Response(html, { headers: htmlHeaders });
    }

    // 2. GET /api/ -> Root API index overview
    if (path === "/api" || path === "/api/") {
      return new Response(JSON.stringify({
        status: "success",
        message: "RAM API Root",
        endpoints: {
          get_ram: "/api/get-ram",
          version: "/api/version",
          sleep_test: "/api/test/sleep?ms=N",
          openapi_spec: "/openapi.json",
          swagger_docs: "/docs"
        }
      }, null, 2), { headers: jsonHeaders });
    }

    // 3. GET /openapi.json -> OpenAPI Specification
    if (path === "/openapi.json") {
      const openApiSpec = {
        openapi: "3.0.0",
        info: {
          title: "RAM API",
          version: "1.0.0",
          description: "Cloudflare Worker JSON API endpoints"
        },
        paths: {
          "/api/get-ram": {
            get: {
              summary: "Get RAM Information",
              responses: {
                "200": { description: "Successful response with ram_mb" }
              }
            }
          },
          "/api/version": {
            get: {
              summary: "Generate random version number",
              responses: {
                "200": { description: "Successful response with version string" }
              }
            }
          },
          "/api/test/sleep": {
            get: {
              summary: "Asynchronous sleep test",
              parameters: [
                {
                  name: "ms",
                  in: "query",
                  description: "Milliseconds to sleep",
                  required: false,
                  schema: { type: "integer", default: 500 }
                }
              ],
              responses: {
                "200": { description: "Sleep confirmation response" }
              }
            }
          }
        }
      };
      return new Response(JSON.stringify(openApiSpec, null, 2), { headers: jsonHeaders });
    }

    // 4. GET /docs -> Swagger UI Viewer
    if (path === "/docs") {
      const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RAM API - Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
      });
    };
  </script>
</body>
</html>`;
      return new Response(swaggerHtml, { headers: htmlHeaders });
    }

    // 5. GET /api/get-ram
    if (path === "/api/get-ram") {
      return new Response(JSON.stringify({
        status: "success",
        ram_mb: 1024,
        timestamp: new Date().toISOString()
      }, null, 2), { headers: jsonHeaders });
    }

    // 6. GET /api/version
    if (path === "/api/version") {
      const major = Math.floor(Math.random() * 3) + 1;
      const minor = Math.floor(Math.random() * 10);
      const patch = Math.floor(Math.random() * 20);
      return new Response(JSON.stringify({
        status: "success",
        version: `${major}.${minor}.${patch}`
      }, null, 2), { headers: jsonHeaders });
    }

    // 7. GET /api/test/sleep?ms=X
    if (path.startsWith("/api/test/sleep")) {
      const msParam = searchParams.get("ms");
      const sleepTime = msParam ? Math.min(parseInt(msParam, 10) || 500, 10000) : 500;
      
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, sleepTime));
      const duration = Date.now() - start;

      return new Response(JSON.stringify({
        status: "success",
        message: "Slept successfully",
        requested_ms: sleepTime,
        actual_slept_ms: duration
      }, null, 2), { headers: jsonHeaders });
    }

    return new Response(JSON.stringify({
      error: "Not Found",
      endpoints: ["/", "/api", "/docs", "/openapi.json", "/api/get-ram", "/api/version", "/api/test/sleep?ms=N"]
    }, null, 2), { status: 404, headers: jsonHeaders });
  }
};
