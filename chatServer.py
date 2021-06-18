import signal
import socket
import threading
import json
from myUtil import RKChatHelpers, PORT

def client_thread(client_sock, client_addr):
    global clients

    print("[system] connected with " + client_addr[0] + ":" + str(client_addr[1]))
    print("[system] we now have " + str(len(clients)) + " clients")

    try:
        while True: 
            msg_received = RKChatHelpers.ReciveMessage(client_sock)
            if not msg_received:
                break

            data = json.loads(msg_received)
            user_init_message, private_message = False, False
            receiver_socket = None

            if data.get('receiver'):
                private_message = True
                receiver_socket = next((key for key, val in clients.items() if val == data['receiver']), None) # get client socket by username
                # if not user with 'receiver' in clients
                if not receiver_socket:
                    data_tmp = json.loads(msg_received)
                    data = { 'no_user': True, 'username':  data['receiver'] }
                    RKChatHelpers.SendMessage(client_sock, data)
                    continue

            elif data.get('init_user', False) == True:
                clients[client_sock] = data.get('username', '')
                user_init_message = True

            no_user = private_message and not receiver_socket
            data['username'] = clients[client_sock] # get username by his socket
            RKChatHelpers.FormatMessage(data, isUserInit=user_init_message, 
                noUser=no_user, isPrivate=private_message, printMessage=True) 

            if private_message:
                receiver = data['receiver']
                RKChatHelpers.SendMessage(receiver_socket, data)
            else:
                for client in clients:
                    if client != client_sock:
                        RKChatHelpers.SendMessage(client, data)
    except:
        pass


    with clients_lock:
        left_name = clients[client_sock]
        data = {'user_left': True, 'username': left_name }
        del clients[client_sock]
        
        RKChatHelpers.FormatMessage(data, userLeft=True, printMessage=True)
        for client in clients:
            RKChatHelpers.SendMessage(client, data)

    print("[system] we now have " + str(len(clients)) + " clients")
    client_sock.close()


signal.signal(signal.SIGINT, signal.SIG_DFL)

ssl_context = RKChatHelpers.GenerateSSLContext(isClientSide=False)
server_socket = ssl_context.wrap_socket(socket.socket(socket.AF_INET, socket.SOCK_STREAM))
server_socket.bind(("localhost", PORT))
server_socket.listen(1)

print("[system] listening ...")
clients = {}
clients_lock = threading.Lock()
while True:
    try:
        client_sock, client_addr = server_socket.accept()
        cert = client_sock.getpeercert()

        for sub in cert['subject']:
            for key, value in sub:
                if key == 'commonName': # (common name contains username)
                    with clients_lock:
                        clients[client_sock] = value

                        # send out user init message
                        for client in clients:
                            if client != client_sock:
                                tmpData = { 'init_user': True, 'username': value }
                                RKChatHelpers.SendMessage(client, tmpData)


        thread = threading.Thread(target=client_thread, args=(client_sock, client_addr))
        thread.daemon = True
        thread.start()

    except KeyboardInterrupt:
        break

print("[system] closing server socket ...")
server_socket.close()
