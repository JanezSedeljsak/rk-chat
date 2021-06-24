const pystruct = require('python-struct');
const { ipcRenderer } = require('electron');

app.service('$drag', function () {
    this.for = function (elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id + "-header")) {
            document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
        } else elmnt.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            var containers = document.getElementsByClassName("chat-container");
            for (var i = 0; i < containers.length; i++) containers.item(i).style.zIndex = 0;
            e = e || window.event;
            e.preventDefault();
            e.target.parentElement.style.zIndex = 5;
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
});

app.service('$parser', function () {
    this.capFirstLetter = str => str.split(" ").map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase()).join(" ");

    this.sendData = (socketClient, object) => {
        let jsonString = JSON.stringify(object);
        // tmp fix remove non utf-8 characters
        jsonString = jsonString.replace(/[^\x20-\x7E]/g, '');

        const byteHeader = pystruct.pack("!H", jsonString.length);
        socketClient.write(byteHeader + jsonString);
    };

    this.decodeData = byteArr => {
        const enc = new TextDecoder("utf-8");
        const len = pystruct.unpack("!H", byteArr)[0];
        const dec = enc.decode(byteArr);
        return JSON.parse(dec.substr(dec.length - len));
    };
});

app.service('$appWindow', function ($window) {
    this.exit = () => $window.close();
    this.minimize = (winName="") => ipcRenderer.send(winName == 'admin' ? 'request-minimize-admin' : 'request-minimize');
});

app.service('$notification', function () {
    this.defaultSettingsByType = {
        normal: {
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        },
        form: {
            input: 'text',
            inputAttributes: { autocapitalize: 'off' },
            showCancelButton: true
        }
    };

    this.show = function(type, settings, callback=() => {}) {
        const def = type in this.defaultSettingsByType ? this.defaultSettingsByType[type] : {};
        Swal.fire({ ...def, ...settings }).then(function(input){
            if (input.isConfirmed) {
                if (!callback) return;
                callback(input);
            }
        }, () => {});
    }
});

app.service('$certService', function($notification) {
    this.myHash = s => {
        let a = 0, c = 0, o;
        for (let h = s.length - 1; h >= 0; h--) {
            o = s.charCodeAt(h);
            a = (a << 6 & 268435455) + o + (o << 14);
            c = a & 266338304;
            a = c !== 0 ? a ^ c >> 21 : a;
        }
        return `__${String(a).split("").reverse().join("")}__`;
    };

    this.openAdminApp = () => {
        $notification.show('form', { title: 'Enter admin code', confirmButtonText: 'Open app', input: 'password' }, (input) => {
            if (this.myHash(input.value) == '__433063862__') {
                ipcRenderer.send('draw-admin');
            }
        });
    };

    this.getAllCertRequests = () => {
        const data = ipcRenderer.sendSync('call-certificate-service', { action: 'get-requested-certificates' });
        if ('certificates' in data && Array.isArray(data['certificates'])) {
            return data['certificates'];
        }

        $notification.show('normal', { icon: 'error', title: `Error occured!` });
        return [];
    }

    this.confirmCertificate = (certName) => {
        const data = ipcRenderer.sendSync('call-certificate-service', { certName, action: 'confirm-certificate' });
        if ('success' in data && data['success']) return;

        $notification.show('normal', { icon: 'error', title: `Error occured!` });
    };

    this.sendCertificateRequest = (certName) => {
        const data = ipcRenderer.sendSync('call-certificate-service', { certName, action: 'generate-certificate' });
        if ('success' in data && data['success']) {
            $notification.show('normal', { icon: 'success', title: `Your certificate was succesfully created!` });
            return;
        }

        $notification.show('normal', { icon: 'error', title: `Error occured while creating your certificate!` });
    };

    this.getUserCertificate = (certName) => {
        const data = ipcRenderer.sendSync('call-certificate-service', { certName, action: 'get-certificate' });
        if ('success' in data && data['success'] && 'certData' in data) {
            const tcpSocketConfig = [3333, '127.0.0.1'];

            return {
                host: tcpSocketConfig[1],
                port: tcpSocketConfig[0],
                secureProtocol: 'TLSv1_2_method',
                rejectUnauthorized: false,
                ...data['certData']
            };
        }

        $notification.show('normal', { icon: 'error', title: data['message'] });
        return undefined;
    }

    this.getAllCertificates = () => {
        const data = ipcRenderer.sendSync('call-certificate-service', { action: 'get-all-certificates' });
        if ('members' in data && Array.isArray(data['members'])) {
            return data['members'];
        }

        $notification.show('normal', { icon: 'error', title: `Error occured!` });
        return [];
    }
});