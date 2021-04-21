const pystruct = require('python-struct');

app.service('$drag', function () {
    this.dragElement = function(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id + "-header")) {
            document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
        } else elmnt.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
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
    this.capFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    
    this.sendData = (socketClient, object) => {
        const jsonString = JSON.stringify(object);
        const byteHeader = pystruct.pack("!H", jsonString.length);
        socketClient.write(byteHeader+jsonString);
    };

    this.decodeData = byteArr => {
        const enc = new TextDecoder("utf-8");
        const len = pystruct.unpack("!H", byteArr)[0];
        const dec = enc.decode(byteArr);
        return JSON.parse(dec.substr(dec.length-len));
    };
})