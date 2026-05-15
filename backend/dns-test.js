const dns = require('dns').promises;

async function testDns() {
  const host = '_mongodb._tcp.cluster1.e6ue3p3.mongodb.net';
  console.log(`Testing SRV lookup for: ${host}`);
  try {
    const addresses = await dns.resolveSrv(host);
    console.log('SRV Records found:', addresses);
  } catch (err) {
    console.error('SRV Lookup failed:', err.message);
    console.log('Attempting to resolve Google DNS to see if internet is reachable...');
    try {
      const google = await dns.resolve('google.com');
      console.log('google.com resolved to:', google);
    } catch (gErr) {
      console.error('Even google.com failed! This machine has no DNS resolution.');
    }
  }
}

testDns();
