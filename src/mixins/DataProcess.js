import {
    VideoDb,
    CategoryDb,
    storageLoadConfig,
    dataEquals,
    storageSaveConfig
} from "../classes/Utils";
const dcollect = require("dcollect");
const DataProcess = {
    
    data() {
        return {
            videoDb: null,
            categoryDb: null,
            videos: null,
            categories: null,
            videoListFilter:{
                categories:[],
                search:'',
                orderBy:['sort', 'asc']
            },
            videoList: []
        }
    },
    computed:{
        searchText(){
            return this.videoListFilter.search;
        }
    },
    watch:{
        searchText:function (val) {
            this.videoList = this.filterVideos();
        }
    },
    methods:{
        videoInfo(url){
            let that = this;
            return new Promise(function (resolve, reject) {
                that.$root.sendPromise("videoInfo", {url}).then(function (data) {
                    console.log(data);
                    resolve(data);
                }).catch(function (e) {
                    reject(e);
                });
            });
        },

        playListInfo(sendData){
            let that = this;
            return new Promise(function (resolve, reject) {
                that.$root.sendPromise("playListInfo", sendData).then(function (data) {
                    console.log(data);
                    resolve(data);
                }).catch(function (e) {
                    reject(e);
                });
            });
        },

        searchListInfo(sendData){
            let that = this;
            return new Promise(function (resolve, reject) {
                that.$root.sendPromise("searchListInfo", sendData).then(function (data) {
                    resolve(data);
                }).catch(function (e) {
                    reject(e);
                });
            });
        },

        addVideo(data){
            let that = this;
            let videoData = {
                id: data.id,
                title:data.fulltitle,
                image: data.thumbnail,
                categories: data.categories,
                watch_time:0,
                sort:0
            };

            this.videoDb.add(videoData).then(function () {
                that.$root.event.emit("video_added", videoData);
                that.videoList = that.filterVideos();

                that.$root.send("notify", {
                    title:"New video",
                    body:videoData.title,
                    icon:that.icon = videoData.image
                });

            }).catch(function (e) {
                videoData.error = e;
                that.$root.event.emit("video_not_be_added", videoData);
            });
        },

        updateVideo(data){
            let that = this;
            let videoData = data;
            this.videoDb.update(data).then(function () {
                that.$root.event.emit("video_updated", videoData);
                that.$root.send("notify", {
                    title:"New video",
                    body:videoData.title,
                    icon:that.icon = videoData.image
                });
            }).catch(function () {
                that.$root.event.emit("video_not_be_updated", videoData);
            });
        },

        deleteVideo(data){
            let that = this;
            let id = data;
            if(this.$root.isObject(data)){
                id = data.id;
            }
            this.videoDb.delete(id).then(function () {
                that.$root.event.emit("video_deleted", {id});
                that.videoList = that.filterVideos();
            }).catch(function (e) {
                console.error(e);
                that.$root.event.emit("video_not_be_deleted", videoData);
            });
        },

        addCategory(data){
            let that = this;
            let category = {
                id: this.categoryDb.createId(new Date()),
                name: data.name,
                sort:0
            };
            this.categoryDb.add(category).then(function () {
                that.$root.event.emit("category_added", category);
            }).catch(function () {
                that.$root.event.emit("category_not_be_added", category);
            });
        },
        updateCategory(data){
            let that = this;

            this.categoryDb.update(data).then(function () {
                that.$root.event.emit("category_updated", data);
            }).catch(function () {
                that.$root.event.emit("category_not_be_updated", data);
            });
        },
        deleteCategory(data){
            let that = this;
            let id = data;
            if(this.$root.isObject(data)){
                id = data.id;
            }
            this.categoryDb.delete(id).then(function () {
                that.$root.event.emit("category_deleted", data);
            }).catch(function () {
                that.$root.event.emit("category_not_be_deleted", data);
            });
        },

        prepareVideoDB(){
            let that = this;
            that.videoDb.open().then(function () {
                return that.videoDb.load();
            }).then(function () {
                that.videos = new dcollect(that.videoDb.list);
                that.videoList = that.filterVideos();
                that.$root.event.emit("video_data_ready");
            }).catch(function (e) {
                that.$root.error(e);
            });
        },

        filterVideos(){
            let that = this;
            let videos = that.videos.query();

            if(that.videoListFilter.search.length > 0) {
                videos.whereLike('title', that.videoListFilter.search, true);
            }

            if(that.videoListFilter.categories.length > 0) {
                videos.rawFilter(function (item) {
                    if(item.categories.length > 0){
                        for(let i = 0; i < item.categories; i++){
                            if(that.videoListFilter.categories.includes(item.categories[i])){
                                return true;
                            }
                        }
                    }
                    return false;
                })
            }

            videos.orderBy(that.videoListFilter.orderBy[0], that.videoListFilter.orderBy[1]);
            return videos.get();
        },

        prepareCategoryDB(){
            let that = this;
            that.categoryDb.open().then(function () {
                return that.categoryDb.load();
            }).then(function () {
                that.categories = new dcollect(that.categoryDb.list);
            }).catch(function (e) {
                that.$root.error(e);
            });
        },
        hasVideo(id){
            return this.videos.query().where("id", "=", id).count() > 0;
        }
    },

    created(){
        let that = this;
        that.videoDb = new VideoDb(50000);
        that.categoryDb = new CategoryDb(1000);
    },

    mounted(){

        this.prepareVideoDB();
        this.prepareCategoryDB();
    }

};

export { DataProcess }