<template>
    <div id="player_wrapper">
        <div id="video-loading" :class="{active:videoLoading}">
            <div class="bar"></div>
        </div>
        <div id="video-wrapper" class="text-right">
            <video :id="$root.playerID" :width="playerWidth" :height="playerHeight" :src="videoSrc" controls autoplay></video>
        </div>

        <div class="video-info" v-if="viewInfo">
            <a class="close" @click="hideVideoInfo()"><b-icon icon="x-square-fill"></b-icon></a>
            <h1>{{ $root.videoData.fulltitle }}</h1>
            <h3 class="mb-3">{{ $root.videoData.id }}</h3>
            <p>{{ $root.videoData.full_description }}</p>
            <div class="d-flex align-items-center justify-content-between video-property p-4">
                <div class="published-date">
                    <b-icon icon="calendar-date"></b-icon> {{ publishDate }}
                </div>
                <div class="view-count">
                    <b-icon icon="eye"></b-icon> {{ viewCount }}
                </div>
                <div class="video-time">
                    <b-icon icon="clock"></b-icon> {{ videoTime }}
                </div>
            </div>

            <h3>downloadable audio</h3>
            <div class="d-flex flex-column">
                <div class="d-flex flex-row align-items-center justify-content-between border-bottom py-2" v-for="item in downloadItems">
                    <div class="quality">{{ item.quality }}</div>
                    <div class="quality-label">{{ item.qualityLabel }}</div>
                    <div class="container-type">{{ item.container }}</div>
                    <div class="download-link">
                        <a class="btn btn-dark text-nowrap text-left" @click="$root.externalOpen(item.url)"><b-icon icon="download"></b-icon> {{ $root.formatBytes(item.contentLength)}}</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Player",
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
            },
            publishDate(){
                try{
                    return this.$root.videoData.player_response.microformat.playerMicroformatRenderer.publishDate;
                }catch (e) {
                    return 'undefined';
                }
            },
            viewCount(){
                try{
                    return this.$root.videoData.player_response.microformat.playerMicroformatRenderer.viewCount;
                }catch (e) {
                    return 'undefined';
                }
            },
            videoTime(){
                try{
                    let second = this.$root.videoData.player_response.microformat.playerMicroformatRenderer.lengthSeconds;
                    return this.$root.formatMsTime(second * 1000);
                }catch (e) {
                    return 'undefined';
                }
            },
            downloadItems(){
                return this.$root.videoData.hasAuido;
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
    .video-info{
        width: 100%;
        max-width: 640px;
        height: auto;
        max-height: 80%;
        position: absolute;
        left: 50%;
        top: 50px;
        z-index: 1035;
        transform: translate(-50%, 0);
        background-color: #222222;
        padding: 30px;
        border: 1px solid #000000;
        overflow-y: auto;
        h1{
            font-size: 30px;
            font-weight: bold;
        }
        h3{
            font-size: 22px;
            color: #767676;
        }
        .video-property{
            font-weight: bold;
        }
        .close{
            position: absolute;
            right: 0;
            top: 0;
            color: #e80020;
            cursor: pointer;
        }
    }
</style>