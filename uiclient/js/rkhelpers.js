const pystruct = require('python-struct');

class RKClientHelpers {
    static capFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    static sendData(socketClient, object) {
        const jsonString = JSON.stringify(object);
        const byteHeader = pystruct.pack("!H", jsonString.length);
        socketClient.write(byteHeader+jsonString);
    }
    
    static decodeData(byteArr) {
        const enc = new TextDecoder("utf-8");
        const len = pystruct.unpack("!H", byteArr)[0];
        const dec = enc.decode(byteArr);
        return JSON.parse(dec.substr(dec.length-len));
    }
}