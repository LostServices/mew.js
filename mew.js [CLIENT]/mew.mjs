import readline from 'readline';
import chalk from 'chalk';
import pkg from 'websocket';

const { client: WebSocketClient } = pkg;
const client = new WebSocketClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let Name = '';
let connection;
let chatEnabled = false;

const startTime = Date.now();

function updateConsoleTitle() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const title = `Mew.js | User: ${Name} | Uptime: ${hours}:${minutes % 60}:${seconds % 60}`;

    process.stdout.write(`\x1b]0;${title}\x07`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function validateInput(input) {
    const specialChars = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\|]/;
    return !specialChars.test(input);
}

function Main() {
    console.clear();
    rl.question('Insert your name: ', (input) => {
        if (validateInput(input)) {
            Name = input;
            console.clear();
            setInterval(updateConsoleTitle, 1000);
            homeUi();
        } else {
            console.log(chalk.red('The name can\'t contain special characters'));
            sleep(2000).then(() => {
                Main();
            });
        }
    });
}

async function chat() {
    chatEnabled = true;

    while (chatEnabled) {
        const input = await askForInput();
        if (connection && chatEnabled) {
            connection.sendUTF(`${Name}: ${input}`);
        }
    }
}

async function askForInput() {
    return new Promise((resolve) => {
        rl.setPrompt(`${chalk.grey('[')}${chalk.rgb(255, 182, 193).bold('Mew.js')}${chalk.grey('@')}${chalk.rgb(255, 182, 193).bold(`chat`)}${chalk.grey('] :~# ')}`);
        rl.prompt();
        rl.on('line', (input) => {
            resolve(input);
            if (input === '/disconnect') {
                if (connection && connection.connected) {
                    connection.close();
                }
                chatEnabled = false;
            }
            if(input === '/cls') {
                console.clear();
            }
        });
    });
}

async function homeUi() {
    rl.question(`${chalk.grey('[')}${chalk.rgb(255, 182, 193).bold('Mew.js')}${chalk.grey('@')}${chalk.rgb(255, 182, 193).bold('root')}${chalk.grey('] :~# ')}`, async (input) => {
        handleUserInput(input);
    });
}

function handleUserInput(input) {
    const args = input.split(' ');
    const command = args[0];

    switch (command) {
        case 'help':
            console.clear();
            console.log('\n');
            console.log(chalk.rgb(252, 3, 132).bold('                                           @Root'));
            console.log(chalk.rgb(255, 182, 193).bold('                                           connect {ip} {port}  '));
            console.log(chalk.rgb(255, 182, 193).bold('                                           nameset      '));
            console.log(chalk.rgb(255, 182, 193).bold('                                           exit      \n'));
            console.log(chalk.rgb(252, 3, 132).bold('                                           @Chat'));
            console.log(chalk.rgb(255, 182, 193).bold('                                           /cls     '));
            console.log(chalk.rgb(255, 182, 193).bold('                                           /disconnect      '));
            console.log('\n');
            console.log('\n');
            console.log('\n');
            homeUi();
            break;
        case 'nameset':
            Main();
            break;
        case 'exit':
            process.exit(0);
            break;
        case 'connect':
            const ip = args[1];
            const port = args[2];
            
            if (ip && port) {
                client.on('connectFailed', (error) => {
                    console.clear();
                    console.log(chalk.red(`${error.toString()}`));
                    sleep(4000).then(() => {
                        console.clear();
                        homeUi();
                    });
                });

                client.on('connect', (conn) => {
                    console.clear();
                    console.log(chalk.green('Connected'));
                    connection = conn;
                    connection.sendUTF(`${Name} connected`);

                    connection.on('error', (error) => {
                        console.clear();
                        console.log(chalk.red(`${error.toString()}`));
                        sleep(4000).then(() => {
                            console.clear();
                            homeUi();
                        });
                    });

                    connection.on('close', () => {
                        console.clear();
                        console.log(chalk.red('Connection closed'));
                        sleep(2000).then(() => {
                            console.clear();
                            homeUi();
                        });
                    });

                    connection.on('message', (message) => {
                        if (message.type === 'utf8') {
                            console.log(`${message.utf8Data}`);
                        }
                        rl.prompt();
                    });

                    sleep(2000).then(() => {
                        console.clear();
                        chat();
                    });
                });

                client.connect(`ws://${ip}:${port}/`, 'echo-protocol');
            } else {
                console.clear();
                console.log(chalk.red('Invalid command. Please provide IP and port.'));
                sleep(3000).then(() => {
                    console.clear();
                    homeUi();
                });
            }
            break;

        default:
            console.clear();
            console.log(chalk.red('Command not found'));
            sleep(2000).then(() => {
                console.clear();
                homeUi();
            });
    }
}

Main();
