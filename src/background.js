'use strict'

import {app, BrowserWindow, ipcMain, Menu, nativeImage, Notification, protocol} from 'electron';
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib';
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer';
import {search, getVideo, getPlaylist, getRelated, SearchOptions} from "scrape-yt"

const path = require("path");
const isDevelopment = process.env.NODE_ENV !== 'production';
const EventEmitter = require('events');
const ytdl = require('ytdl-core');

let win;
let notificationController;
let iconAddress = nativeImage.createFromPath(path.join(__dirname, '/assets/logo.png'));
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    {scheme: 'app', privileges: {secure: true, standard: true}}
]);

async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        minWidth: 720,
        height: 600,
        minHeight: 480,
        frame: false,
        icon: iconAddress, //nativeImage.createFromPath(path.join(__dirname,'/assets/logo.png')),
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            //nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
            nodeIntegration: true,
            enableRemoteModule: true,
            nodeIntegrationInWorker: true
        }

    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }

    ipcMain.handle('videoInfo', async function (e, data) {

        let info = {};
        try {
            info = await ytdl.getInfo(data.url);
            info = formatVideoInfo(info);
        }catch (e) {
            info = {'error': true, message:'video not found'};
        }
        return info;
    });

    ipcMain.handle("playListInfo", async function (e, data) {
        let id = null;
        if (data.hasOwnProperty("id")) {
            id = data.id;
        }
        else{
            id = data.url.split("=")[data.url.split("=").length - 1];
        }
        try{
            return await getPlaylist(id);
        }
        catch (e) {
            return  {'error': true, message:'parse error'};
        }
    });
    ipcMain.handle("searchListInfo", async function (e, data) {
        try{
            let options = {
                type: 'video',
                limit: 10,
                page:1,
                useWorkerThread:false
            };
            if(data.hasOwnProperty('options')){
                options = Object.assign(options, data.options);
            }
            console.log(options);
            return await search(data.text, options);
        }
        catch (e) {
            return  {'error': true, message:'parse error'};
        }
    });

    ipcMain.on("quit", function () {
        app.quit();
    });

    ipcMain.on("min", function () {
        win.minimize();
    });

    ipcMain.on("notify", function (e, data) {
        viewNotification(data);
    });

}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {

    //Menu.setApplicationMenu(null);

    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    } else {
        Menu.setApplicationMenu(null);
    }
    createWindow()
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}

async function formatVideoInfo(info) {

    if (typeof info.formats !== "undefined") {

        let allAudio = info.formats.filter(function (object) {
            return object.hasAudio === true;
        });
        let allVideos = info.formats.filter(function (object) {
            return object.hasVideo === true;
        });

        let hasAudioVideos = info.formats.filter(function (object) {
            return object.hasVideo === true && object.hasAudio === true;
        });

        let onlyAudio = info.formats.filter(function (object) {
            return object.hasVideo === false && object.hasAudio === true;
        });

        if (hasAudioVideos.length > 0) {
            info.url = hasAudioVideos[0].url;
        } else {
            console.log("sesli video yoktu");
        }

        info.videos = allVideos;
        info.hasAudiovideos = hasAudioVideos;
        info.hasAuido = allAudio;
        info.onlyAuido = onlyAudio;
        info.fulltitle = info.videoDetails.title;
        info.title = info.videoDetails.title;

        info.thumbnail = info.videoDetails.thumbnail.thumbnails[0].url

        info.thumbnails = info.videoDetails.thumbnail.thumbnails;
        info.id = info.videoDetails.videoId;
        info.display_id = info.videoDetails.videoId;
        info.viewCount = info.videoDetails.viewCount;
        info.duration = info.videoDetails.lengthSeconds;
        info.keywords = info.videoDetails.keywords;
        info.categories = info.videoDetails.category.split(',');
        info.full_description = info.videoDetails.shortDescription;
        info.tyep = 'video';
        try {
            info.uploadDate = info.player_response.microformat.playerMicroformatRenderer.uploadDate;
        } catch (e) {}
        info.album = info.videoDetails.media.album;
        info.channel = {
            id: info.videoDetails.channelId,
            name: info.videoDetails.ownerChannelName,
            url:info.videoDetails.ownerProfileUrl
        };
        info.related_videos = await getRelated(info.videoDetails.videoId, {limit:100, useWorkerThread:false});
    }
    return info;
}

function viewNotification(params) {
    // let notify = {
    //   title: 'content loaded',
    //   body: 'artık arama yapabilirsiniz',
    //   icon: iconAddress,
    // };

    let notify = Object.assign({}, params);
    notify.subtitle = "yPlayer";
    if (notify.hasOwnProperty("icon")) {
        notify.icon = iconAddress;
    }
    notificationController = new Notification(notify);
    notificationController.show();
    notificationController.on('click', function () {
        win.show();
    });
    return notify;
}

async function f() {

}



