/**
 * WebSocket Integration Test
 * Tests Socket.IO functionality with a mock server
 */

const SocketIO = require('socket.io');
const Client = require('socket.io-client');
const http = require('http');

describe('WebSocket Integration Tests', () => {
  let io, serverSocket, clientSocket, httpServer;
  const TEST_PORT = 3333;

  beforeAll((done) => {
    // Create a test HTTP server
    httpServer = http.createServer();
    
    // Create Socket.IO server (v2 syntax)
    io = SocketIO(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Start listening
    httpServer.listen(TEST_PORT, () => {
      console.log(`Test WebSocket server listening on port ${TEST_PORT}`);
    });

    // Handle server connections
    io.on('connection', (socket) => {
      console.log('Test server: Client connected');
      serverSocket = socket;
      
      // Echo back any message for testing
      socket.on('test-message', (data) => {
        socket.emit('test-response', data);
      });
      
      socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.emit('room-joined', roomId);
      });
    });

    done();
  });

  afterAll((done) => {
    // Close all connections
    if (io) {
      io.close();
    }
    if (httpServer) {
      httpServer.close();
    }
    done();
  });

  beforeEach(() => {
    // Clean up any existing client connection
    if (clientSocket) {
      clientSocket.disconnect();
      clientSocket = null;
    }
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.disconnect();
      clientSocket = null;
    }
  });

  test('should establish WebSocket connection to test server', (done) => {
    clientSocket = Client(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      forceNew: true
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      expect(clientSocket.id).toBeTruthy();
      done();
    });

    clientSocket.on('connect_error', (error) => {
      done(new Error(`Connection failed: ${error.message}`));
    });
  });

  test('should send and receive messages', (done) => {
    clientSocket = Client(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      forceNew: true
    });

    const testData = { message: 'Hello WebSocket', timestamp: Date.now() };

    clientSocket.on('connect', () => {
      // Send test message
      clientSocket.emit('test-message', testData);
    });

    clientSocket.on('test-response', (data) => {
      expect(data).toEqual(testData);
      done();
    });

    clientSocket.on('connect_error', (error) => {
      done(new Error(`Connection failed: ${error.message}`));
    });
  });

  test('should handle room joining', (done) => {
    clientSocket = Client(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      forceNew: true
    });

    const roomId = 'test-room-123';

    clientSocket.on('connect', () => {
      clientSocket.emit('join-room', roomId);
    });

    clientSocket.on('room-joined', (joinedRoomId) => {
      expect(joinedRoomId).toBe(roomId);
      done();
    });

    clientSocket.on('connect_error', (error) => {
      done(new Error(`Connection failed: ${error.message}`));
    });
  });

  test('should handle disconnection gracefully', (done) => {
    clientSocket = Client(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      forceNew: true
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      
      // Disconnect after connection
      clientSocket.disconnect();
      
      // Give it a moment to disconnect
      setTimeout(() => {
        expect(clientSocket.connected).toBe(false);
        done();
      }, 100);
    });

    clientSocket.on('connect_error', (error) => {
      done(new Error(`Connection failed: ${error.message}`));
    });
  });

  test('should handle multiple simultaneous connections', async () => {
    const client1 = Client(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      forceNew: true
    });
    
    const client2 = Client(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      forceNew: true
    });

    // Wait for both to connect
    await new Promise((resolve) => {
      let connected = 0;
      
      client1.on('connect', () => {
        connected++;
        if (connected === 2) resolve();
      });
      
      client2.on('connect', () => {
        connected++;
        if (connected === 2) resolve();
      });
    });

    expect(client1.connected).toBe(true);
    expect(client2.connected).toBe(true);
    expect(client1.id).not.toBe(client2.id);

    // Clean up
    client1.disconnect();
    client2.disconnect();
  });
});