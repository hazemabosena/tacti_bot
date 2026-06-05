#!/usr/bin/env node
/**
 * Test script to verify the web server and API are working
 * Run with: node test_web_server.js
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const host = 'localhost';

const tests = [
  {
    name: '🏥 Health Check',
    path: '/health',
    method: 'GET'
  },
  {
    name: '📡 API Tacticool',
    path: '/api/tacticool',
    method: 'GET'
  },
  {
    name: '🌐 Homepage',
    path: '/',
    method: 'GET'
  }
];

async function runTests() {
  console.log(`\n🧪 Testing Tacticool Web Server (${host}:${PORT})\n`);
  
  for (const test of tests) {
    try {
      const result = await makeRequest(test.method, test.path);
      console.log(`✅ ${test.name}: ${result.statusCode}`);
      if (result.data) {
        console.log(`   Response: ${result.data.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
  
  console.log(`\n📍 Access the dashboard at: http://${host}:${PORT}\n`);
}

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: PORT,
      path: path,
      method: method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

runTests();
