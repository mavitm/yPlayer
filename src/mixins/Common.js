const URL = require("url").URL;
const Common = {
    methods:{

        log() {
            console.log(...arguments);
        },

        error() {
            console.error(...arguments);
        },

        isArray(variable){
            return Array.isArray(variable);
        },

        isObject(variable){
            return typeof variable === 'object' && Array.isArray(variable) === false && variable !== null;
        },

        isFunction(variable){
            return typeof variable === 'function';
        },

        isUrl(url){
            try {
                new URL(url);
                return true;
            } catch (err) {
                return false;
            }
        },

        toFixed(val){
            return val.toFixed(2);
        },

        imgPath(url){
            try{
                return url.split('?')[0];
            }
            catch (e) {
                return url;
            }
        },

        getUrl(id){
            return "https://www.youtube.com/watch?v="+id;
        },

        formatMsTime(ms, showMiliSecond= false){
            let time = new Date(ms),
                hours = time.getUTCHours(),
                minutes = time.getUTCMinutes(),
                seconds = time.getUTCSeconds();
            //let milliseconds = time.getUTCMilliseconds();
            seconds = String(seconds).length < 2 ? "0"+seconds : seconds;
            minutes = String(minutes).length < 2 ? "0"+minutes : minutes;
            if(hours > 0){
                return hours + ":" + minutes + ":" + seconds;
            }
            return minutes + ":" + seconds;
        },
        formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';

            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        },
        makeToast(title, text, status = 'success', position='bottomLeft'){
            let positionKeys = {
                topRight: "b-toaster-top-right",
                topLeft: "b-toaster-top-left",
                topCenter: "b-toaster-top-center",
                topFull: "b-toaster-top-full",
                bottomRight: "b-toaster-bottom-right",
                bottomLeft: "b-toaster-bottom-left",
                bottomCenter: "b-toaster-bottom-center",
                bottomFull: "b-toaster-bottom-full",
            };
            if(status === "error"){
                status = "danger";
            }
            this.$bvToast.toast(text, {
                title: title,
                toaster: positionKeys[position],
                solid: true,
                variant: status,
                appendToast: false
            });
        },
    }
};

export { Common }