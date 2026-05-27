import http from "http";

const data = JSON.stringify({
  name: "Test Template",
  format: "4x6",
  renderer: "template",
  units: "mm",
  width: 101.6,
  height: 152.4,
  orientation: "portrait",
  pageSize: "label",
  thermalMode: true,
  elements: []
});

const req = http.request(
  {
    hostname: "localhost",
    port: 3000,
    path: "/api/v1/templates",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
      "Authorization": "Bearer test-token"
    }
  },
  (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Body: ${body}`);
    });
  }
);

req.on("error", (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
