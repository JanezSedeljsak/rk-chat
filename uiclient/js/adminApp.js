const app = angular.module("adminApp", []);

app.controller("admin_controller", ($scope, $appWindow, $adminApp) => {
    $scope.files = ['neki', 'osem'];
    $scope.exit = () => $appWindow.exit();
    $scope.minimize = () => $appWindow.minimize();
});