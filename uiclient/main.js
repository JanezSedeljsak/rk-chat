const { app, BrowserWindow, ipcMain } = require('electron')
const { PythonShell } =  require('python-shell')
const BASE_PATH = './../';

require('electron-debug')({
    showDevTools: process.env.NODE_ENV === 'development'
})

function certificateService(actionName, callback, args=[], pathPrefix="") {
    const options = { mode: 'text', args: [actionName, ...args, pathPrefix] };
    PythonShell.run(`${BASE_PATH}myUtil.py`, options, (err, result) => {
        if (err) throw err;
        callback(JSON.parse(result));
    });
}

/*certificateService('get-requested-certificates', (res) => {
    console.log(res);
}, ['kekec'], BASE_PATH);*/

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
    ipcMain.on('generate-certificate', () => {
        certificateService('generate-certificate', result => {
            console.log(result);
        });
    });

    ipcMain.on('get-requested-certificates', () => {
        certificateService('get-requested-certificates', result => {
            console.log(result);
        });
    });

    ipcMain.on('confirm-certificate', () => {
        certificateService('confirm-certificate', result => {
            console.log(result);
        });
    });
}

app.on('ready', createWindow);