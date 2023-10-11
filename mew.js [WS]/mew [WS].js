const WebSocketServer = require('websocket').server;
const http = require('http');
const readline = require('readline');

const server = http.createServer((request, response) => {});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const connections = [];

let port = '';

rl.question('Insert the port: ', (input) => {

    const parsedPort = parseInt(input);

    if (!isNaN(parsedPort) && parsedPort >= 0 && parsedPort <= 65535) {

        port = parsedPort;
        console.log(`Port set to ${port}`);
    } else {
        port = '8888';
        console.log('Invalid port. Using the default port.');
    }

    server.listen(port, () => {
        console.log(`WebSocket server listening on port ${port}`);
    });

    rl.close();
});

wsServer.on('request', (request) => {
    const connection = request.accept('echo-protocol', request.origin);

    connections.push(connection);

    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            const messageText = message.utf8Data;
            if (messageText.startsWith('Name: ')) {
                const name = messageText.substring(6);
            } else {
                console.log(`${messageText}`);

                connections.forEach((conn) => {
                    if (conn !== connection) {
                        conn.sendUTF(messageText);
                    }
                });
            }
        }
    });

    connection.on('close', (reasonCode, description) => {
        console.log(`Connection closed (${reasonCode}): ${description}`);

        const index = connections.indexOf(connection);
        if (index !== -1) {
            connections.splice(index, 1);
        }
    });
});