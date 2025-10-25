#!/usr/bin/env node
/**
 * Quick Atlas connectivity diagnostic
 * Run: node diagnose-atlas.js
 */

const mongoose = require('mongoose');
const dns = require('dns').promises;
const net = require('net');

console.log('=== MongoDB Atlas Connectivity Diagnostic ===\n');

// Test 1: Check public IP
console.log('1. Checking your public IP address...');
async function checkPublicIP() {
  try {
    const https = require('https');
    return new Promise((resolve, reject) => {
      https.get('https://api.ipify.org?format=json', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            console.log(`   ✓ Your public IPv4: ${json.ip}`);
            resolve(json.ip);
          } catch (e) {
            console.log('   ⚠ Could not parse IPv4 response');
            resolve(null);
          }
        });
      }).on('error', (e) => {
        console.log(`   ⚠ IPv4 check failed: ${e.message}`);
        resolve(null);
      });
    });
  } catch (e) {
    console.log(`   ⚠ IPv4 check error: ${e.message}`);
    return null;
  }
}

// Test 2: DNS SRV lookup
console.log('\n2. Testing DNS SRV lookup for Atlas cluster...');
const srvHost = '_mongodb._tcp.cluster0.bx9is7t.mongodb.net';
async function testSRV() {
  try {
    const records = await dns.resolveSrv(srvHost);
    console.log(`   ✓ SRV lookup succeeded, found ${records.length} records:`);
    records.forEach(r => console.log(`     - ${r.name}:${r.port} (priority: ${r.priority})`));
    return records;
  } catch (e) {
    console.log(`   ✗ SRV lookup failed: ${e.message}`);
    console.log('     This may indicate DNS resolver issues or network blocking.');
    return null;
  }
}

// Test 3: TCP connectivity to shards
console.log('\n3. Testing TCP connectivity to Atlas shard hosts...');
const shardHosts = [
  'ac-bb4nhzt-shard-00-00.bx9is7t.mongodb.net',
  'ac-bb4nhzt-shard-00-01.bx9is7t.mongodb.net',
  'ac-bb4nhzt-shard-00-02.bx9is7t.mongodb.net'
];

async function testTCP(host, port = 27017, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ host, port, success: false, error: 'Timeout' });
    }, timeout);

    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ host, port, success: true });
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      resolve({ host, port, success: false, error: err.message });
    });
  });
}

async function testAllShards() {
  for (const host of shardHosts) {
    const result = await testTCP(host, 27017);
    if (result.success) {
      console.log(`   ✓ ${host}:27017 - TCP connection successful`);
    } else {
      console.log(`   ✗ ${host}:27017 - Failed: ${result.error}`);
    }
  }
}

// Test 4: Actual MongoDB connection
console.log('\n4. Testing actual MongoDB authentication and connection...');
async function testMongoConnection() {
  const uri = process.env.MONGO_URI || 
    `mongodb+srv://Arjun:${encodeURIComponent('Arjun@2006')}@cluster0.bx9is7t.mongodb.net/smart_campus?retryWrites=true&w=majority`;
  
  const maskedUri = uri.replace(/:([^:@]+)@/, ':*****@');
  console.log(`   Connecting to: ${maskedUri}`);

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    console.log('   ✓ MongoDB connection successful!');
    console.log('   ✓ Authentication passed');
    console.log('   ✓ IP whitelist configured correctly');
    await mongoose.disconnect();
    return true;
  } catch (e) {
    console.log(`   ✗ MongoDB connection failed: ${e.message}`);
    
    if (e.message.includes('IP') || e.message.includes('whitelist') || e.name === 'MongooseServerSelectionError') {
      console.log('\n   ⚠ DIAGNOSIS: IP not whitelisted in Atlas Network Access');
      console.log('   → Go to: https://cloud.mongodb.com → Network Access');
      console.log('   → Click "Add IP Address"');
      console.log('   → Either add your IP or click "Allow access from anywhere" (0.0.0.0/0)');
    } else if (e.message.includes('authentication failed')) {
      console.log('\n   ⚠ DIAGNOSIS: Authentication failed (wrong username/password)');
    } else if (e.message.includes('ENOTFOUND') || e.message.includes('querySrv')) {
      console.log('\n   ⚠ DIAGNOSIS: DNS resolution failed');
      console.log('   → Your network may be blocking MongoDB Atlas');
      console.log('   → Try from a different network (mobile hotspot)');
    } else if (e.message.includes('TLS') || e.message.includes('SSL')) {
      console.log('\n   ⚠ DIAGNOSIS: TLS/SSL connection error');
      console.log('   → Network or firewall may be interfering with encrypted connections');
    }
    return false;
  }
}

// Run all tests
(async () => {
  try {
    await checkPublicIP();
    await testSRV();
    await testAllShards();
    const connected = await testMongoConnection();
    
    console.log('\n=== Summary ===');
    if (connected) {
      console.log('✓ All tests passed! Your MongoDB Atlas connection is working.');
    } else {
      console.log('✗ Connection failed. Please follow the diagnosis above to fix the issue.');
      console.log('\nQuick fix: Add 0.0.0.0/0 to Atlas Network Access temporarily.');
    }
    process.exit(connected ? 0 : 1);
  } catch (e) {
    console.error('\nUnexpected error:', e);
    process.exit(1);
  }
})();
