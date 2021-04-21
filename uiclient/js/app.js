const app = angular.module("rkchat", []);
const net = require('net');
const { parse } = require('path');

app.controller("rkchat_controller", ($scope, $parser, $drag) => {
    var client = new net.Socket();
    client.on('data', function(data) {
        const parsedData = $parser.decodeData(data);

        // if public message
        if ('no_user' in parsedData) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "The user you are trying to reach currently isn't online!",
                showConfirmButton: false,
                timer: 1500
            });
        } else if ('init_user' in parsedData) {
            Swal.fire({
                title: `${parsedData['username']} just joined!`,
                showConfirmButton: false,
                timer: 1500
            });
        } else if ('user_left' in parsedData) {
            Swal.fire({
                title: `${parsedData['username']} just left!`,
                showConfirmButton: false,
                timer: 1500
            });
        } else if (!('reciver' in parsedData)) {
            $scope.groups['public'].push(parsedData);
            $scope.$apply();
        } else if ($parser.capFirstLetter(parsedData['reciver']) == $scope.username) {
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

    $scope.userOnline = false;
    $scope.username = null;
    $scope.message = "";
    $scope.groups = {
        'public': []
    }

    $scope.enterChat = () => {
        Swal.fire({
            title: 'Enter your username',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Enter chat',
        }).then((input) => {
            if (input.value.length > 3) {
                $scope.username = $parser.capFirstLetter(input.value);
                $scope.userOnline = true;
                $scope.$apply();
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: `You have just logged in as ${$scope.username}`,
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    client.connect(3333, '127.0.0.1', () => {
                        $parser.sendData(client, { "init_user": true, "username": $scope.username });
                    });
                    $drag.for(document.getElementById("public-continer"));
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'You need to have atleast 4 characters in your name!',
                });
            }

        });
    }

    $scope.addGroup = () => {
        Swal.fire({
            title: 'Enter reciver name',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Add user to groups',
        }).then((input) => {
            const groupName = $parser.capFirstLetter(input.value);
            $scope.groups[groupName] = [];
            $scope.$apply();
            $drag.for(document.getElementById(`${groupName}-continer`));
        });
    }

    $scope.logout = () => {
        $scope.userOnline = false;
        $scope.username = "";
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `You have just logged out`,
            showConfirmButton: false,
            timer: 1500
        });
    }

    $scope.sendMessage = (group) => {
        const messageVal = document.getElementById(`${group}-message`).value;
        const currentDate = new Date();
        if (!messageVal) return; // if no message don't send
        let data = {
            message: messageVal,
            timestamp: `${currentDate.getHours()}:${currentDate.getMinutes()}`,
            username: $scope.username,
        }

        if (group != 'public') data['reciver'] = group;
        $parser.sendData(client, data);
        $scope.groups[group].push({ ...data, username: '_' });
        document.getElementById(`${group}-message`).value = ""; // reset input
    }

});