// Keep-Alive Service for Render Free Tier
// This script pings the server every 10 minutes to prevent it from sleeping

const https = require('https');

const SERVER_URL = process.env.SERVER_URL || 'https://library-backend-2-uvqp.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

function pingServer() {
  const url = `${SERVER_URL}/health`;

  console.log(`🏓 Pinging server at ${new Date().toLocaleString()}...`);

  https.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Server is alive! Status:', res.statusCode);
    } else {
      console.log('⚠️  Server responded with status:', res.statusCode);
    }
  }).on('error', (err) => {
    console.error('❌ Error pinging server:', err.message);
  });
}

// Ping immediately on start
pingServer();

// Then ping every 10 minutes
setInterval(pingServer, PING_INTERVAL);

console.log(`🚀 Keep-alive service started!`);
console.log(`📡 Pinging ${SERVER_URL}/health every 10 minutes`);
console.log(`⏰ Next ping in 10 minutes at ${new Date(Date.now() + PING_INTERVAL).toLocaleString()}\n`);
