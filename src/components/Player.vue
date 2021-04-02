<template>
    <div id="player_wrapper">
        <div id="video-loading" :class="{active:videoLoading}">
            <div class="bar"></div>
        </div>
        <div id="video-wrapper" class="text-right">
            <video :id="$root.playerID" :width="playerWidth" :height="playerHeight" :src="videoSrc" controls autoplay></video>
        </div>
        <VideoInfo :viewInfo="viewInfo" />
    </div>
</template>

<script>
    import VideoInfo from "./player/VideoInfo";
    export default {
        name: "Player",
        components:{VideoInfo},
        data(){
            return {
                sideBarWidth: 0,
                viewInfo:false
            }
        },
        computed:{
            videoLoading:function () {
                return this.$root.videoLoading;
            },
            playerWidth:function () {
                if(this.$root.fullPlayer){
                    return (this.$root.winWidth - (1 + this.sideBarWidth));
                }
                else{
                    return '100%';
                }
            },
            playerHeight:function () {
                if(this.$root.fullPlayer){
                    return (this.$root.winHeight - 75);
                }
                else{
                    return '350px';
                }
            },
            videoSrc:function () {
                return this.$root.videoData.url;
            }
        },
        methods:{
            hideVideoInfo(){
                this.viewInfo = false;
            },
            viewvideoInfo(){
                this.viewInfo = true;
            }
        },
        mounted() {
            let that = this;
            this.$root.event.on("opened_side_bar", function () {
                that.sideBarWidth = 320;
            });
            this.$root.event.on("closes_side_bar", function () {
                that.sideBarWidth = 0;
            });
            this.$root.event.on('view-video-info',function () {
                that.viewvideoInfo();
                that.$root.event.emit("close_side_bar");
            });
            this.$root.event.on('view-video-info-close',function () {
                that.hideVideoInfo();
            });
            document.addEventListener('keydown', function (event) {
                if(event.key === "Escape"){
                    that.hideVideoInfo();
                }
            });

        }
    }
</script>

<style lang="scss">
    #player_wrapper{
        position: relative;
    }
    #video-loading{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 10px;
        overflow: hidden;
        z-index: 99999;
        display: none;
        &.active{
            display: block;
        }
        .bar {
            position: absolute;
            height: 10px;
            background-color: #497ee8;
            animation-name: loader-animation;
            animation-duration: 3s;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
        }
    }
</style>