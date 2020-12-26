module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true //process.env.ELECTRON_NODE_INTEGRATION
        }
    },
    css: {
        loaderOptions: {
            sass: {
                prependData: `
                @import 'node_modules/bootstrap/scss/bootstrap.scss';
                @import 'node_modules/bootstrap-vue/src/index.scss';
                @import "@/assets/scss/app.scss";
                `
            }
        }
    },
    publicPath: process.env.NODE_ENV === 'production' ? '' : '/'
};

