const WebSocketServer = require('websocket').server;
const http = require('http');
const os = require('os');

const server = http.createServer((request, response) => {});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

const connections = [];

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

const ipAddress = 'Ur Ip'; // Sostituisci con l'indirizzo IP del tuo server Wi-Fi

server.listen(4444, ipAddress, () => {
  console.log(`WebSocket server listening on IP address ${ipAddress} port 4444`);
});


