## Tcp-socket-demo
The app comes with a basic communication system with the options of sending public messages or private messages directly to a specific receiver. Currently this branch only supports CLI version of the application due to hard implementation of the GUI system with SSL certificates....

### Terminal client docs
If you are using the terminal client this is the way to send messages:
* Public message: ```$ message-content```
* Private message: ```$ receiver >>> message-content```

### Functionality
* Client enters chat with typing in the name of their certificate file and key file (johnoe.crt johndoe.key)
* Sending private/public messages
* Alerts for "user joined" and "user left"
* Error message when trying to send a private message to somone who isn't online
* User identification works with SSL certificates (this is also the way we get the username from the client)
* Server has to contain the certificate of every user so they have permissions to connect

#### Message structure example
```json
{
    "message": "This is a message example",
    "timestamp": "12:10",
    "receiver": "Lorem Ipsum"
}
```

### GUI Client

![banner-img](https://raw.githubusercontent.com/JanezSedeljsak/tcp-socket-demo/main/docs/client-chat.png)

### App structure
```
└──  tcp-socket-demo
    └──  chatServer.py (main tcp-socket server)
    └──  chatClient.py (terminal client)
    └──  public_cert (folder containing every certificate)
        └──  ..... certificates [*.key, *.crt]
```

### License

[![CC0](https://licensebuttons.net/p/zero/1.0/88x31.png)](https://creativecommons.org/publicdomain/zero/1.0/)

### Authors

```JS
const AUTHOR = 'Janez Sedeljsak' //https://github.com/JanezSedeljsak;
```
