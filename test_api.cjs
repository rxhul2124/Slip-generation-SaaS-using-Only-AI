const fs = require('fs');

async function testApi() {
  try {
    // Create a dummy image file
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/png' });
    formData.append('image', blob, 'test.png');

    console.log("Sending request to http://localhost:5000/api/v1/templates/analyze-image...");
    
    const response = await fetch('http://localhost:5000/api/v1/templates/analyze-image', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer demo-local-session',
        'x-company-id': 'demo-company'
      },
      body: formData
    });

    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", text);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

testApi();
