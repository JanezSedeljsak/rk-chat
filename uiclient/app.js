const app = angular.module("rkchat", []);
const net = require('net');

function capFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

app.controller("rkchat_controller", $scope => {
    var client = new net.Socket();
    client.connect(4444, '127.0.0.1', function() {
        console.log('Connected');
        client.write('Hello, server! Love, Client.');
    });

    client.on('data', function(data) {
        console.log('Received: ' + data);
    });

    $scope.userOnline = false;
    $scope.username = null;
    $scope.currentGroup = 'public';
    $scope.message = "";
    $scope.groups = {
        'public': []
    }

    $scope.enterChat = () => {
        $scope.username = capFirstLetter(document.getElementById('username').value);
        $scope.userOnline = true;
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `You have just logged in as ${$scope.username}`,
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            dragElement(document.getElementById("main-continer"));
        });
        // @TODO connect to socket
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
            $scope.groups[capFirstLetter(input.value)] = [];
            $scope.$apply();
        });
    }

    $scope.changeGroup = groupName => {
        $scope.currentGroup = groupName;
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

    $scope.sendMessage = () => {
        const messageVal = document.getElementById('message').value;
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

        $scope.groups[$scope.currentGroup].push({
            ...data,
            username: '_'
        });

        document.getElementById('message').value = ""; // reset input
    }

});