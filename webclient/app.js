const app = angular.module("rkchat", []);

function capFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

app.controller("rkchat_controller", $scope => {
    $scope.userOnline = false;
    $scope.username = null;
    $scope.currentGroup = 'public';
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
        });
        // @TODO connect to socket
    }

    $scope.addGroup = () => {
        $scope.groups["nekrandom"] = {};
    }

    $scope.changeGroup = groupName => {
        $scope.currentGroup = groupName;
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