import Memcached from 'memcached';

// Configure Memcached server locations and options
const servers = ['127.0.0.1:11211']; // Replace with your Memcached server address and port
const options = {
    retries: 5,
    retryTimeout: 1000,
    remove: true
};

// Create a new Memcached client instance
const memcached = new Memcached(servers, options);
// Event listener for successful connection
memcached.on('connect', function () {
    console.log('Memcached connected successfully.');
});

// Event listener for connection issues or disconnections
memcached.on('failure', function (details) {
    console.error('Memcached connection failed or disconnected:', details);
});

// Event listener for server removal (e.g., if a server becomes unresponsive)
memcached.on('remove', function (server) {
    console.warn('Memcached server removed from pool:', server);
});
// Export the Memcached client for use in other files
export default memcached;