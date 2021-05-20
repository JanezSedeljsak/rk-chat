import socket
import sys
import threading
import json
from datetime import datetime
from myUtil import RKChatHelpers, PORT

def send_message(sock, message):
    data = { "timestamp": datetime.now().strftime("%H:%M") }

    if ">>>" in msg_send:
        data["message"] = msg_send[msg_send.index(">>>") + 3:].strip()
        data["receiver"] = msg_send[:msg_send.rindex(">>>")].strip()
    else:
        data["message"] = msg_send

    RKChatHelpers.SendMessage(sock, data)

def message_receiver():
    while True:
        msg_received = RKChatHelpers.ReciveMessage(sock)
        if msg_received:
            data = json.loads(msg_received)
            if 'no_user' in data:
                RKChatHelpers.FormatMessage(data, noUser=True, printMessage=True)
            elif 'init_user' in data:
               RKChatHelpers.FormatMessage(data, isUserInit=True, printMessage=True)
            elif 'user_left' in data:
                RKChatHelpers.FormatMessage(data, userLeft=True, printMessage=True)
            elif 'receiver' in data:
                RKChatHelpers.FormatMessage(data, isPrivate=True, printMessage=True)
            else:
                RKChatHelpers.FormatMessage(data, printMessage=True)


cert_data = input("Vnesi datoteki - certfiikat in kljuc (ločena s presledkom): ")
print("[system] connecting to chat server ...")

ssl_context = RKChatHelpers.GenerateSSLContext(*cert_data.split(" "))
sock = ssl_context.wrap_socket(socket.socket(socket.AF_INET, socket.SOCK_STREAM))
sock.connect(("localhost", PORT))
#RKChatHelpers.SendUsernameToSocket(sock, me) [when using SSL we get user identification from the cert "Common name"]
print("[system] connected!")

thread = threading.Thread(target=message_receiver)
thread.daemon = True
thread.start()

print("""
#----------------------------------------------#
# Navodila za privat sporočila                 #
# <prejemnik> >>> <sporočilo>                  #
#----------------------------------------------#
""")

while True:
    try:
        msg_send = input()
        send_message(sock, msg_send)
    except KeyboardInterrupt:
        sys.exit()
