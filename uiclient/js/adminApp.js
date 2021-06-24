const app = angular.module("adminApp", []);
const html5tooltips = require('html5tooltipsjs');
const tls = require('tls');

app.controller("admin_controller", ($scope, $appWindow, $certService, $parser) => {
    $scope.exit = () => $appWindow.exit();
    $scope.minimize = () => $appWindow.minimize('admin');
    $scope.refreshList = () => $scope.certFiles = $certService.getAllCertRequests();
    $scope.loadMembers = () => $scope.members = $certService.getAllCertificates();
    $scope.confirmCertificate = (certName) => {
        $certService.confirmCertificate(certName);
        $scope.initData();
    }

    tcpSocketClient = tls.connect($certService.getUserCertificate('admin'), () => {});
    tcpSocketClient.on('error', function(error) {
        console.error(error);
        $notification.show('normal', { icon: 'error', title: `Error occured`, timer: 1000 }, null);
        tcpSocketClient.destroy();
    });

    tcpSocketClient.on('data', data => {
        const parsedData = $parser.decodeData(data);
        if ('members' in parsedData && Array.isArray(parsedData['members'])) {
            $scope.online = new Set(parsedData['members']);
            $scope.$apply();
        }
    });

    $scope.certFiles = [];
    $scope.members = [];
    $scope.online = new Set([]);

    $scope.initData = () => {
        html5tooltips.refresh();
        $scope.refreshList();
        $scope.loadMembers();
    };
    
    $scope.initData();
});