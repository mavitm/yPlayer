const { shell,ipcRenderer } = require("electron");
import {version} from '../../package';
import {MD5} from "../classes/MD5"
const EventEmitter = require('events');
const AppWindow = {
    data:function () {
        return {
            loading: false,
            winWidth: document.documentElement.clientWidth,
            winHeight: document.documentElement.clientHeight,

            appVersion:version,

            autoPlayer:true,

            event: new EventEmitter(),

            //BACKEND
            backendListener: {},
            backendListenerListKeys: []
        }
    },
    methods:{
        handleResize: function () {
            this.winWidth = document.documentElement.clientWidth;
            this.winHeight = document.documentElement.clientHeight;
        },
        appTriggerEvent(eventName, data){
            this.event.emit(eventName, data);
        },
        externalOpen (link) {
            shell.openExternal(link)
        },
        send(key, data){
            ipcRenderer.send(key, data);
        },
        sendPromise(key, data){
            return ipcRenderer.invoke(key, data);
        },
        quit: function () {
            ipcRenderer.send("quit");
        },

        addBackendListener(eventName, callback, single=false){
            if(typeof this.backendListener[eventName] === "undefined" || single === true){
                this.backendListener[eventName] = [];
            }
            if(Array.isArray(this.backendListener[eventName])){

                let methodUnique = eventName+'_'+MD5(callback.toString());

                if(!this.backendListenerListKeys.includes(methodUnique)){
                    this.backendListener[eventName].push(callback);
                    this.backendListenerListKeys.push(methodUnique);
                }
            }
            else{
                this.backendListener[eventName] = [callback];
            }
        },
        removeBackendListener(eventName, callback, force= false){
            if(typeof callback !== "function"){
                throw 'callback not operable';
            }

            if(typeof this.backendListener[eventName] === "undefined"){
                return true;
            }

            let methodUnique = eventName+'_'+MD5(callback.toString());

            this.backendListenerListKeys = this.backendListenerListKeys.filter(function (val) {
                    return val !== methodUnique;
            });

            if(force){
                this.backendListener[eventName] = [];
            }
            else{
                if(this.backendListener[eventName].length < 2){
                    this.removeBackendListener(eventName, callback, true);
                }
                else{
                    this.backendListener[eventName] = this.backendListener[eventName].filter(function (call) {
                        if(typeof call === "function"){
                            return methodUnique !== eventName+MD5(call.toString());
                        }
                        return true;
                    });
                }
            }
        },
    },

    created() {
        this.handleResize();
    },

    mounted() {
        window.addEventListener("resize", this.handleResize);

        ipcRenderer.on("backendMessage", function (err, data) {
            if(typeof that.backendListener[data.method] !== "undefined"){
                if(Array.isArray(that.backendListener[data.method])){
                    that.backendListener[data.method].forEach(function (call) {
                        if(typeof call === "function"){
                            call(data);
                        }
                    });
                }
            }
        });
    }
};
export { AppWindow }