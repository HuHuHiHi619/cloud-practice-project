const { createClient } = require('redis');

(async () => {
  const client = createClient({
    socket: {
      host: 'localhost',
      port: 6379
    }
  });

  client.on('error', (err) => console.log('Redis Client Error', err));
  
  await client.connect();
  console.log('Connected to Redis');
  
  await client.set('test', 'Hello from Node.js');
  const value = await client.get('test');
  console.log('Test Value:', value); // ควรได้ "Hello from Node.js"
  
  await client.quit();
})();