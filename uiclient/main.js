const { app, BrowserWindow, ipcMain } = require('electron')

require('electron-debug')({
    showDevTools: process.env.NODE_ENV === 'development'
})

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 720,
        resizable: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.setMenu(null);
    win.loadFile('./index.html');
    ipcMain.on('request-minimize', () => win.minimize());
}


app.on('ready', createWindow);