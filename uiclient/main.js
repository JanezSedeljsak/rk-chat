const { app, BrowserWindow, ipcMain } = require('electron');
const { PythonShell } =  require('python-shell');
const BASE_PATH = './../';

/*certificateService('get-requested-certificates', (res) => {
    console.log(res);
}, ['kekec'], BASE_PATH);*/

require('electron-debug')({
    showDevTools: process.env.NODE_ENV === 'development'
});

function certificateService(actionName, callback, args=[], pathPrefix="") {
    const options = { mode: 'text', args: [actionName, ...args, pathPrefix] };
    PythonShell.run(`${BASE_PATH}myUtil.py`, options, (err, result) => {
        if (err) throw err;
        callback(JSON.parse(result));
    });
}

let win, adminWin;
const baseWindowSettings = {
    width: 1024,
    height: 720,
    resizable: false,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
};

app.on('ready', () => {
    win = new BrowserWindow({ ...baseWindowSettings });
    win.setMenu(null);
    win.loadFile('./index.html');
});

ipcMain.on('draw-admin', () => {
    adminWin = new BrowserWindow({ ...baseWindowSettings });
    adminWin.setMenu(null);
    adminWin.loadFile('./admin.html');
});

ipcMain.on('request-minimize', () => win.minimize());
ipcMain.on('request-minimize-admin', () => adminWin.minimize());

ipcMain.on('generate-certificate', (event, data) => {
    certificateService('generate-certificate', result => {
        console.log(result);
    }, [data['certName']], BASE_PATH);
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