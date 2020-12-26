<template>
    <div class="video-item" :class="colCss">
        <div class="item-header">
            <span class="video-time"> <b-icon icon="clock"/> {{ $root.formatMsTime(video.duration * 1000)}}</span>
        </div>
        <div class="item-images">
            <img :src="$root.imgPath(video.thumbnail)" alt="video poster">
            <div class="video-loading d-flex align-items-center justify-content-center" v-if="videoRequest">
                <b-icon icon="arrow-clockwise" animation="spin-pulse" font-scale="4"/>
            </div>
        </div>
        <div class="item-footer d-flex justify-content-between">
            <a class="video-play flex-fill" @click="showVideo()"><b-icon icon="play"/></a>
            <a class="video-add flex-fill" @click="saveVideo()" v-if="!hasVideo && !onlyShow"><b-icon icon="plus"/></a>
        </div>
        <div class="item-main">
            <h3>{{ video.title }}</h3>
        </div>
    </div>
</template>

<script>
    export default {
        name: "listVideoItem",
        props:{
            video:{
                type: Object,
                required: true
            },
            colCss:{
                type:String
            },
            onlyShow:{
                type: Boolean,
                default:false
            },
            autoRequest:{
                type: Boolean,
                default:false
            }
        },
        data(){
            return {
                videoRequest:false,
                remoteInfo:{}
            }
        },
        computed:{
            hasVideo(){
                return this.$root.hasVideo(this.video.id);
            }
        },
        methods:{
            readVideoData(callback=function () {}){
                let that = this;
                that.videoRequest = true;
                this.$root.videoInfo(that.video.id).then(function (info) {
                    that.remoteInfo      = info;
                    if(that.remoteInfo.hasOwnProperty("error")){
                        that.$root.makeToast("Not found", that.remoteInfo.message, "error");
                    }
                    else{
                        callback(that.remoteInfo);
                    }
                    that.videoRequest = false;
                });
            },
            showVideo(){
                let that = this;
                that.videoRequest = true;
                if(Object.keys(that.remoteInfo).length > 1){
                    that.videoRequest = false;
                    that.$root.externalSource = that.remoteInfo;
                    that.$root.showExternalPlayer = true;
                    return;
                }
                that.readVideoData(function () {
                    that.$root.externalSource = that.remoteInfo;
                    that.$root.showExternalPlayer = true;
                });
            },
            saveVideo(){
                let that = this;
                that.readVideoData(function () {
                    that.$root.addVideo(that.remoteInfo);
                });
            }
        },
        mounted() {
            if(this.autoRequest){
                this.readVideoData();
            }
        }
    }
</script>

<style lang="scss">
    .video-item{
        color: #cccccc;
        margin-bottom: 30px;
        .item-header{
            width: 100%;
            background-color: #000;
            padding: 5px 15px;
        }
        .item-images{
            width: 100%;
            position: relative;
            .video-loading{
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                z-index: 500;
                text-align: center;
                color: #cccccc;
            }
            img{
                position: relative;
                width: 100%;
                z-index: 1;
            }
        }
        .item-footer{
            width: 100%;
            background-color: #000;
            border-top: 1px solid #cccccc;
            a{
                color: inherit;
                display: block;
                text-align: center;
                padding: 5px 15px;
                cursor: pointer;
                &:first-child{
                    border-right: 1px solid #cccccc;
                }
                &:last-child{
                    border-right: none !important;
                }
            }
        }
        .item-main{
            padding-top: 15px;
            h3{
                font-size: 18px;
                font-weight: 500;
            }
        }
    }
</style>