const app = angular.module("rkchat", []);

app.controller("rkchat_controller", $scope => {
    $scope.userOnline = false;
    $scope.username = "fds";
    $scope.currentGroup = 'public';
    $scope.groups = {
        'public': [
            { 'sender': 'Janez', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': '_', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': 'Janez', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': '_', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': 'Kekec', 'timestamp': '20:45', 'message': 'kekec test test' },
            { 'sender': '_', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': 'Janez', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': '_', 'timestamp': '20:45', 'message': 'test test' }
        ],
        'janez': [
            { 'sender': 'Janez', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': '_', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': 'Janez', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': '_', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': 'Janez', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': '_', 'timestamp': '20:45', 'message': 'test test' }
        ],
        'toni': [
            { 'sender': 'Janez', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': '_', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': 'Janez', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': '_', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': 'Janez', 'timestamp': '20:45', 'message': 'test test' },
            { 'sender': '_', 'timestamp': '20:45', 'message': 'test test' }
        ]
    }

    $scope.enterChat = () => {
        $scope.userOnline = true;
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
        $scope.groups["nekrandom"] = {};
        console.log("okej");
        Swal.fire('Oops...', 'Something went wrong!', 'error')
    }

    $scope.changeGroup = groupName => {
        alert("keyyy");
        $scope.groupName = groupName;
        $scope.$apply();
    }

    $scope.logout = () => {
        $scope.userOnline = false;
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `You have just logged out`,
            showConfirmButton: false,
            timer: 1500
        });
    }

});