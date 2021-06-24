const app = angular.module("adminApp", []);
const html5tooltips = require('html5tooltipsjs');

app.controller("admin_controller", ($scope, $appWindow, $certService) => {
    $scope.exit = () => $appWindow.exit();
    $scope.minimize = () => $appWindow.minimize('admin');
    $scope.refreshList = () => $scope.certFiles = $certService.getAllCertRequests();
    $scope.loadMembers = () => $scope.members = $certService.getAllCertificates();
    $scope.confirmCertificate = (certName) => {
        $certService.confirmCertificate(certName);
        $scope.initData();
    }

    $scope.certFiles = [];
    $scope.members = [];
    $scope.online = new Set(['bozicek', 'miklavz']);

    $scope.initData = () => {
        html5tooltips.refresh();
        $scope.refreshList();
        $scope.loadMembers();
    };
    
    $scope.initData();
});