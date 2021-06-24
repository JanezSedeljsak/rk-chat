from OpenSSL import crypto, SSL
from datetime import datetime
import json
import ssl
import os
import re
import sys
import uuid
import struct

# config
CERT_FILE_PATH = 'public_cert'
PORT = 3333
HEADER_LENGTH = 2
SERVER_CERT = os.path.join(CERT_FILE_PATH, 'server_cert.crt')
SERVER_KEYFILE = os.path.join(CERT_FILE_PATH, 'server_private.key')
CLIENTS_PEM = os.path.join(CERT_FILE_PATH, 'clients.pem')

class RKChatHelpers:
    
    @staticmethod
    def _bulkGet(obj, *args, other=None):
        return (obj.get(arg, other) for arg in args)

    @staticmethod
    def _formatNormalMessage(data):
        message, sender, timestamp = RKChatHelpers._bulkGet(
            data, 'message', 'username', 'timestamp', other="")

        return [
            "[RKChat] Message -----------------------------",
            "  Content:  %s" % message,
            "  Sender:   %s" % sender,
            "  Time:     %s" % timestamp,
            "[RKChat /] -----------------------------------"
        ]

    @staticmethod
    def _formatUserInitMessage(data):
        username = data.get('username', '')
        return [
            "[RKChat] New user just joined ----------------",
            "  Username:  %s" % username,
            "[RKChat /] -----------------------------------"
        ]

    @staticmethod
    def _formatPrivateMessage(data):
        linesTmp = RKChatHelpers._formatNormalMessage(data)
        linesTmp[0] = "[RKChat] Private Message - for '%s'" % data.get('receiver', '')
        return linesTmp

    @staticmethod
    def _noUserMessage(data):
        username = data.get('username', '')
        return [
            "[RKChat] Message failed to send --------------",
            "  Missing user:  %s" % username,
            "[RKChat /] -----------------------------------"
        ]
    
    @staticmethod
    def _formatUserLeftMessage(data):
        username = data.get('username', '')
        return [
            "[RKChat] User just left ----------------------",
            "  Username:  %s" % username,
            "[RKChat /] -----------------------------------"
        ]

    @staticmethod
    def _parseMessage(sock, msglen):
        message = b''
        while len(message) < msglen:
            chunk = sock.recv(msglen - len(message))  # preberi nekaj bajtov
            if chunk == b'':
                raise RuntimeError("socket connection broken")
            message = message + chunk  # pripni prebrane bajte sporocilu

        return message

        
    @staticmethod
    def FormatMessage(data, isUserInit=False, userLeft=False, isPrivate=False, noUser=False, printMessage=True):
        lines = []
        if noUser:
            lines = RKChatHelpers._noUserMessage(data)
        # če gre za izpis privatnega sporočila
        elif isPrivate:
            lines = RKChatHelpers._formatPrivateMessage(data)
        elif userLeft:
            lines = RKChatHelpers._formatUserLeftMessage(data)
        elif isUserInit:
            lines = RKChatHelpers._formatUserInitMessage(data)
        else:
            lines = RKChatHelpers._formatNormalMessage(data)

        messaage = "\n".join(lines)
        if not printMessage:
            return messaage
        
        print(messaage)

    @staticmethod
    def ReciveMessage(sock):
        header = RKChatHelpers._parseMessage(sock, HEADER_LENGTH)
        message_length = struct.unpack("!H", header)[0]

        message = None
        if message_length > 0:
            message = RKChatHelpers._parseMessage(sock, message_length)
            message = message.decode("utf-8")

        return message

    @staticmethod
    def SendMessage(sock, data):
        encoded_data = bytes(json.dumps(data), encoding="utf-8")
        header = struct.pack("!H", len(encoded_data))
        message = header + encoded_data 
        sock.sendall(message)

    @staticmethod
    def SendUsernameToSocket(sock, username):
        data = { "init_user": True, "username": username }
        RKChatHelpers.SendMessage(sock, data)

    @staticmethod
    def GenerateSSLContext(crtFile="", keyFile="", isClientSide=True):
        global CERT_FILE_PATH
        context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
        context.verify_mode = ssl.CERT_REQUIRED
        if isClientSide:
            certfile = os.path.join(CERT_FILE_PATH, crtFile)
            keyfile = os.path.join(CERT_FILE_PATH, keyFile)

            context.load_cert_chain(certfile=certfile, keyfile=keyfile)
            context.load_verify_locations(SERVER_CERT)
        else:
            context.load_cert_chain(certfile=SERVER_CERT, keyfile=SERVER_KEYFILE)
            context.load_verify_locations(CLIENTS_PEM)

        context.set_ciphers('ECDHE-RSA-AES128-GCM-SHA256')
        return context


class CertificateServices:
    @staticmethod
    def GenerateSignedCertificate(name, prefix=""):
        global CLIENTS_PEM, CERT_FILE_PATH
        success = True

        try:
            k = crypto.PKey()
            k.generate_key(crypto.TYPE_RSA, 4096)
            cert = crypto.X509()
            cert.get_subject().CN = name.capitalize()
            cert.set_issuer(cert.get_subject())
            cert.set_pubkey(k)
            cert.sign(k, 'sha512') 

            with open(os.path.join(prefix, CERT_FILE_PATH, f'{name.lower()}.unconfirmed_crt'), "wt") as f:
                f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert).decode("utf-8"))

            with open(os.path.join(prefix, CERT_FILE_PATH, f'{name.lower()}.key'), "wt") as f:
                f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k).decode("utf-8"))
        
        except:
            success = False

        return success

    
    @staticmethod
    def ConfirmNewCertificate(name, prefix=""):
        global CLIENTS_PEM, CERT_FILE_PATH
        certContent = None

        # read unconfirmed file and then remove it
        unconfirmedCert = os.path.join(prefix, CERT_FILE_PATH, f'{name.lower()}.unconfirmed_crt')
        with open(unconfirmedCert, "r") as f:
            certContent = f.read()
        
        os.remove(unconfirmedCert)

        if not certContent:
            return False
            
        # create the real crt file
        with open(os.path.join(prefix, CERT_FILE_PATH, f'{name.lower()}.crt'), "wt") as f:
            f.write(f'\n{certContent.strip()}')
        
        # add content to server verified users
        with open(prefix, CLIENTS_PEM, 'a') as f:
            f.write(certContent)
        
        return True

    @staticmethod
    def getNewRequestedCertFiles(prefix=""):
        global CLIENTS_PEM, CERT_FILE_PATH
        return [
            f[:f.index('.unconfirmed_crt')] 
            for f in os.listdir(os.path.join(prefix, CERT_FILE_PATH)) 
            if re.match("[A-Za-z0-9]+\.unconfirmed_crt", f)
        ]
    
    @staticmethod
    def getAllCertificates(prefix=""):
        global CLIENTS_PEM, CERT_FILE_PATH
        return [
            f[:f.index('.crt')] 
            for f in os.listdir(os.path.join(prefix, CERT_FILE_PATH)) 
            if re.match("[A-Za-z0-9]+\.crt", f) and not any(protected in f for protected in {'server', 'admin'})
        ]

    @staticmethod
    def getCertificate(name, prefix=""):
        messagesCode = ['SUCCESS', 'NOT_VERIFIED', 'NOT_FOUND', 'UNKNOWN_ERROR']
        userMessage = ['', 'Your account is not yet approved!', 'Certificate does not exist!', 'Unknown error']

        if os.path.isfile(os.path.join(prefix, CERT_FILE_PATH, f'{name.lower()}.unconfirmed_crt')):
            return messagesCode[1], userMessage[1]
        
        if not os.path.isfile(os.path.join(prefix, CERT_FILE_PATH, f'{name.lower()}.crt')):
            return messagesCode[2], userMessage[2]

        result = {}
        success = True

        try:
            with open(os.path.join(prefix, CERT_FILE_PATH, f'{name.lower()}.crt'), "r") as f:
                result['cert'] = f.read()
            
            with open(os.path.join(prefix, CERT_FILE_PATH, f'{name.lower()}.key'), "r") as f:
                result['key'] = f.read()
                
            with open(os.path.join(prefix, CERT_FILE_PATH, 'server_cert.crt'), "r") as f:
                result['ca'] = f.read()
        
        except:
            success = False

        if not success:
            return messagesCode[3], userMessage[3]

        return messagesCode[0], result


if __name__ == "__main__":
    result = { "args": sys.argv[1:] }
    action = sys.argv[1]
    prefix = sys.argv[-1] if len(sys.argv) > 2 else "" # last arg sent is the path prefix (depends on where we run the script from)
    
    if action == 'generate-certificate':
        result['success'] = sys.argv[2] and CertificateServices.GenerateSignedCertificate(sys.argv[2], prefix=prefix)

    elif action == 'get-requested-certificates':
        result['certificates'] = CertificateServices.getNewRequestedCertFiles(prefix=prefix) or []

    elif action == 'confirm-certificate':
        result['success'] = sys.argv[2] and CertificateServices.ConfirmNewCertificate(sys.argv[2], prefix=prefix)

    elif action == 'get-certificate':
        certRes = CertificateServices.getCertificate(sys.argv[2], prefix=prefix)
        if certRes[0] == 'SUCCESS':
            result['success'] = True
            result['certData'] = certRes[1]
        else:
            result['success'] = False
            result['code'] = certRes[0]
            result['message'] = certRes[1]
        
    elif action == 'get-all-certificates':
        result['members'] = sorted(CertificateServices.getAllCertificates(prefix=prefix))
        

    print(json.dumps(result))

