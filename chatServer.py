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
        while True:  # neskoncna zanka
            msg_received = RKChatHelpers.ReciveMessage(client_sock)
            if not msg_received:  # ce obstaja sporocilo
                break

            data = json.loads(msg_received)
            user_init_message, private_message = False, False
            reciver_socket = None

            if data.get('reciver'):
                private_message = True
                reciver_socket = next((key for key, val in clients.items() if val == data['reciver']), None) # get client socket by username
                # if not user with 'reciver' in clients
                if not reciver_socket:
                    data_tmp = json.loads(msg_received)
                    data = { 'no_user': True, 'username':  data['reciver'] }
                    RKChatHelpers.SendMessage(client_sock, data)
                    continue

            elif data.get('init_user', False) == True:
                clients[client_sock] = data.get('username', '')
                user_init_message = True

            no_user = private_message and not reciver_socket
            RKChatHelpers.FormatMessage(data, isUserInit=user_init_message, 
                noUser=no_user, isPrivate=private_message, printMessage=True) 

            if private_message:
                reciver = data['reciver']
                RKChatHelpers.SendMessage(reciver_socket, data)
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

# kreiraj socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind(("localhost", PORT))
server_socket.listen(1)

# cakaj na nove odjemalce
print("[system] listening ...")
clients = {}
clients_lock = threading.Lock()
while True:
    try:
        # pocakaj na novo povezavo - blokirajoc klic
        client_sock, client_addr = server_socket.accept()
        with clients_lock:
            clients[client_sock] = "" # na začetku client nima uporabniškega imena (to naredimo z ločenim sporočilom)

        thread = threading.Thread(target=client_thread, args=(client_sock, client_addr))
        thread.daemon = True
        thread.start()

    except KeyboardInterrupt:
        break

print("[system] closing server socket ...")
server_socket.close()
