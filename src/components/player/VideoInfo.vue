<template>
    <div class="video-info" v-if="viewInfo">
        <a class="close" @click="hideVideoInfo()"><b-icon icon="x-square-fill"/></a>
        <h1>{{ $root.videoData.fulltitle }}</h1>
        <h3 class="mb-3">{{ $root.videoData.id }}</h3>
        <p>{{ $root.videoData.full_description }}</p>
        <div class="d-flex align-items-center justify-content-between video-property p-4">
            <div class="published-date">
                <b-icon icon="calendar-date"/> {{ publishDate }}
            </div>
            <div class="view-count">
                <b-icon icon="eye"/> {{ viewCount }}
            </div>
            <div class="video-time">
                <b-icon icon="clock"/> {{ videoTime }}
            </div>
        </div>

        <ul class="nav nav-fill info-nav mb-4">
            <li class="nav-item" :class="returnCssNames('download')">
                <a class="nav-link" @click="changeTab('download')"><b-icon icon="link"/> Downloadable</a>
            </li>
            <li class="nav-item" :class="returnCssNames('related')">
                <a class="nav-link" @click="changeTab('related')"><b-icon icon="link"/> Related videos</a>
            </li>
        </ul>

        <table class="table table-dark" v-if="activeTab === 'download'">
            <thead>
                <tr>
                    <th>Quality</th>
                    <th>p</th>
                    <th>Ext.</th>
                    <th>Audio</th>
                    <th>Video</th>
                    <th>Download</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in downloadItems">
                    <td class="quality">{{ item.quality }}</td>

                    <td class="quality-label" v-if="item.qualityLabel">{{ item.qualityLabel }}</td>
                    <td class="quality-label" v-else>--</td>

                    <td class="container-type">{{ item.container }}</td>
                    <td class="container-type" :class="{'text-success':item.hasAudio, 'text-danger':!item.hasAudio}">
                        <span v-if="item.hasAudio">Yes</span>
                        <span v-else>No</span>
                    </td>
                    <td class="container-type":class="{'text-success':item.hasVideo, 'text-danger':!item.hasVideo}">
                        <span v-if="item.hasVideo">Yes</span>
                        <span v-else>No</span>
                    </td>
                    <td class="download-link">
                        <a class="btn btn-dark text-nowrap text-left" @click="$root.externalOpen(item.url)"><b-icon icon="download"></b-icon> {{ $root.formatBytes(item.contentLength)}}</a>
                    </td>
                </tr>
            </tbody>
        </table>
        <SearchList :result="{videos:$root.videoData.related_videos}" v-if="activeTab === 'related'" />
    </div>
</template>

<script>
    import SearchList from "../additionform/SearchList";
    export default {
        name: "VideoInfo",
        components:{SearchList},
        props:{
            viewInfo:Boolean
        },
        data(){
            return{
                activeTab:'download',
            }
        },
        computed:{
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
                return this.$root.videoData.formats;
            }
        },
        methods:{
            returnCssNames(tabName){
                let obj = {};
                obj.active = tabName === this.activeTab;
                return obj;
            },
            changeTab(tabName){
                this.activeTab = tabName;
            },
            hideVideoInfo(){
                this.$root.event.emit('view-video-info-close');
            }
        }
    }
</script>

<style lang="scss">
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
    .nav.info-nav{
        .nav-item {
            background-color: #454d55;
            &:first-child{
                border-right: 1px solid #3b434b;
            }
            .nav-link {
                font-size: 18px;
                font-weight: bold;
                color: #ffffff;
                cursor: pointer;
            }
            &.active{
                .nav-link{
                    background-color: #3b434b;
                }
            }
        }
    }
</style>