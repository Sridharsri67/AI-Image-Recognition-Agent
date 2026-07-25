const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 AI Image Recognition Agent Server Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});

// Force restart to reload .env config
