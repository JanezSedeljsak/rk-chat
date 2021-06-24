const app = angular.module("rkchat", []);
const moment = require('moment');
const html5tooltips = require('html5tooltipsjs');
const tls = require('tls');

let tcpSocketClient = null;

app.controller("rkchat_controller", ($scope, $parser, $drag, $appWindow, $notification, $certService) => {
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
    $scope.openAdmin = () => $certService.openAdminApp();
    $scope.closeChat = (group) => delete $scope.groups[group]; 
    $scope.logout = () => {
        try {
            tcpSocketClient.destroy();
            tcpSocketClient = null;
        } catch(err) { /* ignore */ }
        $scope.initData();
        $notification.show('normal', { icon: 'success', title: `You have just logged out` });
    };

    $scope.register = () => {
        $notification.show('form', { title: 'Enter your username', confirmButtonText: 'Send request to admin' }, (input) => {
            $certService.sendCertificateRequest(input.value);
        });
    };

    $scope.enterChat = () => {
        $notification.show('form', { title: 'Enter your username', confirmButtonText: 'Enter chat' }, (input) => {
            const tlsOptions = $certService.getUserCertificate(input.value);
            if (!tlsOptions) return;
            
            $scope.username = $parser.capFirstLetter(input.value);
            $scope.userOnline = true;
            $scope.$apply();

            tcpSocketClient = tls.connect(tlsOptions, () => {
                $notification.show('normal', { icon: 'success', title: `You have just logged in as ${$scope.username}`, timer: 1000 }, null);
            });

            tcpSocketClient.on('error', function(error) {
                console.error(error);
                $notification.show('normal', { icon: 'error', title: `Error occured`, timer: 1000 }, null);
                tcpSocketClient.destroy();
            });

            tcpSocketClient.on('data', data => {
                const parsedData = $parser.decodeData(data);
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
        $parser.sendData(tcpSocketClient, data);
        $scope.groups[group].push({ ...data, username: '_' });
        messageContainer.value = ""; // reset input
    };
});