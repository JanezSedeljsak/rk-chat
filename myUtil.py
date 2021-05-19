from datetime import datetime
import uuid
import struct
from json import dumps
import ssl
import os

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
        encoded_data = bytes(dumps(data), encoding="utf-8")
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