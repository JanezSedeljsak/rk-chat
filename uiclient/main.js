const { app, BrowserWindow, ipcMain } = require('electron');
const { PythonShell } =  require('python-shell');
const BASE_PATH = './../';

require('electron-debug')({
    showDevTools: process.env.NODE_ENV === 'development'
});

async function certificateService({ actionName, args=[], pathPrefix="" }) {
    const options = { mode: 'text', args: [actionName, ...args, pathPrefix] };

    return new Promise((resolve, reject) => {
        PythonShell.run(`${BASE_PATH}myUtil.py`, options, (err, result) => {
            if (err) throw err;
            // console.log(result);
            resolve(JSON.parse(result));
        });
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

ipcMain.on('call-certificate-service', async (event, data) => {
    const params = { actionName: data['action'], args: [], pathPrefix: BASE_PATH };
    if ('certName' in data) params['args'].push(data['certName']);
    if ('allowAdmin' in data && data['allowAdmin']) params['args'].push('allow-admin');

    const certServiceResult = await certificateService(params);
    event.returnValue = certServiceResult;
});