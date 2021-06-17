const app = angular.module("rkchat", []);
const net = require('net');
const moment = require('moment');
const html5tooltips = require('html5tooltipsjs');
const tls = require('tls');
const fs = require('fs');

const tcpSocketConfig = [3333, '127.0.0.1'];
const crtFilesDirectory = './../public_cert/';
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // ignore unauthorized IPs if dev mode

const connectWithTLS = (name, callback) => {
    const connectionObj = {
        host: tcpSocketConfig[1],
        port: tcpSocketConfig[0],
        cert: fs.readFileSync(`${crtFilesDirectory}${name}.crt`),
        key: fs.readFileSync(`${crtFilesDirectory}${name}.key`),
        ca: fs.readFileSync(`${crtFilesDirectory}server_cert.crt`),
        secureProtocol: 'TLSv1_2_method'
    };

    tls.connect(connectionObj, callback);
};

app.controller("rkchat_controller", ($scope, $parser, $drag, $appWindow, $notification) => {
    const tcpSocket = new net.Socket();
    tcpSocket.on('data', function (data) {
        const parsedData = $parser.decodeData(data);
        // if public message
        if ('no_user' in parsedData) {
            $notification.show('normal', { icon: 'error', title: 'Oops...', text: "The user you are trying to reach currently isn't online!" })
        } else if ('init_user' in parsedData) {
            $notification.show('normal', { title: `${parsedData['username']} just joined!` });
        } else if ('user_left' in parsedData) {
            $notification.show('normal', { title: `${parsedData['username']} just left!` });
        } else if (!('receiver' in parsedData)) {
            $scope.groups['public'].push(parsedData);
            $scope.$apply();
        } else if ($parser.capFirstLetter(parsedData['receiver']) == $scope.username) {
            // if chat window doesn't exist yet create it...
            const groupName = $parser.capFirstLetter(parsedData['username']);
            if (!(parsedData['username'] in $scope.groups)) {
                $scope.groups[groupName] = [];
                $scope.$apply();
                $drag.for(document.getElementById(`${groupName}-continer`));
            }
            $scope.groups[groupName].push(parsedData);
            $scope.$apply();
        }
    });

    $scope.initData = () => {
        $scope.userOnline = false;
        $scope.username = null;
        $scope.message = "";
        $scope.groups = { public: [] };  
        html5tooltips.refresh();
    };

    $scope.initData();
    $scope.exit = () => $appWindow.exit();
    $scope.minimize = () => $appWindow.minimize();
    $scope.closeChat = (group) => delete $scope.groups[group]; 
    $scope.logout = () => {
        tcpSocket.destroy();
        $scope.initData();
        $notification.show('normal', { icon: 'success', title: `You have just logged out` });
    };

    $scope.enterChat = () => {
        $notification.show('form', { title: 'Enter your username', confirmButtonText: 'Enter chat' }, (input) => {
            if (input.value.length > 3) {
                $scope.username = $parser.capFirstLetter(input.value);
                $scope.userOnline = true;
                $scope.$apply();
                connectWithTLS(input.value, (res) => {
                    console.log(res);
                    $notification.show('normal', { icon: 'success', title: `You have just logged in as ${$scope.username}`, timer: 1000 }, () => {
                        tcpSocket.connect(...tcpSocketConfig, console.log);
                        $drag.for(document.getElementById("public-continer"));
                    });
                });
            } else $notification.show('normal', { icon: 'error', title: 'Oops...', text: 'You need to have atleast 4 characters in your name!' });
        });
    };

    $scope.addGroup = () => {
        $notification.show('form', { title: 'Enter receiver name', confirmButtonText: 'Add user to groups' }, (input) => {
            const groupName = $parser.capFirstLetter(input.value);
            $scope.groups[groupName] = [];
            $scope.$apply();
            $drag.for(document.getElementById(`${groupName}-continer`));
        });
    };

    $scope.sendMessage = (group) => {
        const messageContainer = document.getElementById(`${group}-message`);
        const messageVal = messageContainer.value;
        if (!messageVal) return; // if no message don't send
        let data = {
            message: messageVal,
            timestamp: moment().format('HH:mm'),
            username: $scope.username,
        }

        if (group != 'public') data['receiver'] = group;
        $parser.sendData(tcpSocket, data);
        $scope.groups[group].push({ ...data, username: '_' });
        messageContainer.value = ""; // reset input
    };
});