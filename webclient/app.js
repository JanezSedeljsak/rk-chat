const app = angular.module("rkchat", []);

function capFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

app.controller("rkchat_controller", $scope => {
    $scope.SOCKET = new WebSocket('wss://localhost:8888'); // global socket variable
    $scope.SOCKET.onmessage = function(event) {
        console.log(event.data);
    } 

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
        $scope.connectToSocket(username);
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `You have just logged in as ${$scope.username}`,
            showConfirmButton: false,
            timer: 1500
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
        $scope.SOCKET.close();
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
        debugger;
        const currentDate = new Date();
        if (!$scope.message) return; // if no message don't send
        let data = {
            message: $scope.message,
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
        $scope.message = ""; // reset input
    }

});