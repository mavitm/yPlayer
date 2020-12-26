const PlayerAction = {
    data(){
        return {
            playerID: 'videoplayer',
            player: document.getElementById('videoplayer'),
            fullPlayer:true,
            videoLoading:false,
            currentVideoIndex: 0,
            videoData: {},
            isPlay: false,

            singleRepeat:false,
            listRepeat:true,
            randomPlay:false,


            showExternalPlayer:false,
            externalSource:null

        }
    },
    watch:{
        showExternalPlayer:function (val) {
            if(val === true){
                this.pause();
            }
        }
    },
    methods:{
        play(){
            this.player.play();
            this.videoLoading = false;
        },
        pause(){
            this.player.pause();
        },
        togglePlayPause(){
            this.isPlay ? this.pause() : this.play();
        },
        playSameVideo:function () {
            this.changeVideo(this.currentVideoIndex);
        },
        playRandomVideo:function () {
            let key = Math.floor(Math.random() * this.$root.videoList.length);
            if(this.$root.videoList.length > 1 && key === this.currentVideoIndex){
                this.playNextVideo();
                return;
            }
            this.changeVideo(key);
        },
        playNextVideo:function () {
            let nextKey = this.currentVideoIndex + 1;
            if(nextKey > (this.$root.videoList.length - 1)){
                nextKey = 0;
            }
            this.changeVideo(nextKey);
        },
        playPreviousVideo:function () {
            let previousKey = this.currentVideoIndex - 1;
            if(previousKey < 0){
                previousKey = (this.$root.videoList.length - 1);
            }
            this.changeVideo(previousKey);
        },
        changeVideo(key){
            let that = this;
            that.currentVideoIndex = key;
            let d = that.$root.videoList[key];
            that.playID(d.id, key);
            // this.$root.videoInfo({url:that.$root.getUrl(d.id)}).then(function (info) {
            //     that.videoData = info;
            //     that.videoLoading = false;
            // }).catch(function (e) {
            //     that.$root.error(e);
            // });
        },
        playID(id, key=null){
            let that = this;
            that.videoLoading = true;
            this.$root.videoInfo(id).then(function (info) {
                that.videoData = info;
                that.videoLoading = false;

                if(key === null){
                    let videos = that.$root.videoList;
                    for (let i = 0; videos.length; i++){
                        if(that.$root.videoList[i].id === id){
                            that.currentVideoIndex = i;
                            break;
                        }
                    }
                }

            }).catch(function (e) {
                that.$root.error(e);
                that.videoLoading = false;
            });
        },
        keyEvents(event){
            if(event.keyCode === 176){ //key: "MediaTrackNext"
                this.playNextVideo();
            }
            else if(event.keyCode === 177){ //key: "MediaTrackPrevious"
                this.playPreviousVideo();
            }
            else if(event.keyCode === 179){ //key: "MediaPlayPause"
                this.togglePlayPause();
            }
        },
    },

    mounted(){
        let that = this;
        that.player = document.getElementById(that.playerID);
        document.addEventListener('keydown', this.keyEvents);

        try {
            this.player.onpause = function () {
                that.isPlay = false;
            };
            this.player.onplay = function () {
                that.isPlay = true;
            };

            this.player.onended = function () {
                if (that.singleRepeat) {
                    that.playSameVideo();
                } else if (that.randomPlay) {
                    that.playRandomVideo();
                } else {
                    that.playNextVideo();
                }
            };
        }catch (e) {}

        that.$root.addBackendListener("play", function () {
            that.play();
        });

        that.$root.addBackendListener("stop", function () {
            that.pause();
        });

        that.$root.addBackendListener("pause", function () {
            that.pause();
        });

        that.$root.addBackendListener("next-video", function () {
            that.playNextVideo();
        });

        that.$root.addBackendListener("previous-video", function () {
            that.playPreviousVideo();
        });

        that.$root.event.on("playID", function (data) {
            that.playID(data.id);
        });

        that.$root.event.once("video_data_ready", function () {
            if(that.$root.autoPlayer){
                that.playRandomVideo();
            }
        });
    }
};


export { PlayerAction }

