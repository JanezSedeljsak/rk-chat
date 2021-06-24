## RK-chat
This is a basic example of using tcp-sockets. The server and terminal client are written in python. On top of that we also have a GUI client built with Electron (Node based framework) for a better user experience.

The app comes with a basic communication system with the options of sending public messages or private messages directly to a specific receiver.

### Terminal client docs
If you are using the terminal client this is the way to send messages:
* Public message: ```$ message-content```
* Private message: ```$ receiver >>> message-content```

### Functionality
* Client enters chat with a SSL certificate file (filename is required - available options are in the public_cert directory)
* Sending private/public messages
* Basic alerts and live messaging with reactive UI
* Error message when trying to send a private message to somone who isn't online
* Admin dashboard: viewing who is currently online and manually confirming ssl certificates
* Users can register with their username (app will generate unverified certificate)

#### Message structure example
```json
{
    "message": "This is a message example",
    "timestamp": "12:10",
    "receiver": "Lorem Ipsum"
}
```

### GUI Client

> Chat: ![banner-img](https://raw.githubusercontent.com/JanezSedeljsak/tcp-socket-demo/main/docs/client-chat.png)
> Admin app: ![banner-img](https://raw.githubusercontent.com/JanezSedeljsak/tcp-socket-demo/main/docs/admin-app.png)

### App structure
```
└──  tcp-socket-demo
    └──  chatServer.py (main tcp-socket server)
    └──  chatClient.py (terminal client)
    └──  myUtil.py (global helpers for python)
    └──  public_cert (folder containing every certificate)
        └──  ..... certificates [*.key, *.crt]
    └──  uiclient (electron based GUI client)
        └──  main.js (electron entry point)
        └──  admin.html (admin template)
        └──  index.html 
        └──  js
            └──  app.js (main logic for client)
            └──  adminApp.js (main logic for adminApp)
            └──  services.js (helpers methods for angular)
        └──  css (additional styling)
```

### License

[![CC0](https://licensebuttons.net/p/zero/1.0/88x31.png)](https://creativecommons.org/publicdomain/zero/1.0/)

### Authors

```JS
const AUTHOR = 'Janez Sedeljsak' //https://github.com/JanezSedeljsak;
```
