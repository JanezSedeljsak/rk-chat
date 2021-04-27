## Tcp-socket-demo
This is a basic example of using tcp-sockets. The server and terminal client are written in python. On top of that we also have a GUI client built with Electron (Node based framework) for a better user experience.

The app comes with a basic communication system with the options of sending public messages or private messages directly to a specific receiver.

### Terminal client docs
If you are using the terminal client this is the way to send messages:
* Public message: ```$ message-content```
* Private message: ```$ receiver >>> message-content```

### Functionality
* Client enters chat with a unique username
* Sending private/public messages
* Alerts for "user joined" and "user left"
* Error message when trying to send a private message to somone who isn't online

#### Message structure example
```json
{
    "message": "This is a message example",
    "timestamp": "12:10",
    "username": "John Doe",
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
    └──  myUtil.py (global helpers for python)
    └──  uiclient (electron based GUI client)
        └──  main.js (electron entry point)
        └──  index.html 
        └──  js
            └──  app.js (main logic for client)
            └──  services.js (helpers methods for angular)
        └──  css (additional styling)
```

### License

[![CC0](https://licensebuttons.net/p/zero/1.0/88x31.png)](https://creativecommons.org/publicdomain/zero/1.0/)

### Authors

```JS
const AUTHOR = 'Janez Sedeljsak' //https://github.com/JanezSedeljsak;
```
