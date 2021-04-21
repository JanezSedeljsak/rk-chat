const app = angular.module("rkchat", []);
const net = require('net');

app.controller("rkchat_controller", $scope => {
    var client = new net.Socket();
    client.on('data', function(data) {
        debugger;
        const parsedData = RKClientHelpers.decodeData(data);
        // if public message
        if (!('reciver' in parsedData)) {
            $scope.groups['public'].push(parsedData);
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
                $scope.username = RKClientHelpers.capFirstLetter(input.value);
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
                        RKClientHelpers.sendData(client, { "init_user": true, "username": $scope.username });
                    });
                    dragElement(document.getElementById("public-continer"));
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
            const groupName = RKClientHelpers.capFirstLetter(input.value);
            $scope.groups[groupName] = [];
            $scope.$apply();
            dragElement(document.getElementById(`${groupName}-continer`));
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

        if ($scope.currentGroup != 'public') {
            data['reciver'] = $scope.currentGroup;
        }

        $scope.groups[group].push({ ...data, username: '_' });
        document.getElementById(`${group}-message`).value = ""; // reset input
    }

});