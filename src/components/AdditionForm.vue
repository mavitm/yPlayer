<template>
    <div id="form-wrapper" :class="formCss">
        <div id="add-form" :class="formCss">
            <a class="close" @click="hideForm()">
                <b-icon icon="x-square-fill"/>
            </a>
            <div class="form-group">
                <b-form-group v-slot="{ ariaDescribedby }" name="search-options">
                    <b-form-radio-group id="search-group" :aria-describedby="ariaDescribedby" v-model="searchType" :options="searchOptions"/>
                </b-form-group>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" id="search-input" :placeholder="inputPlaceholder" v-model="url">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" id="button-addon2" @click="search()">
                            <b-icon icon="search"/>
                        </button>
                    </div>
                </div>
            </div>
            <div id="download-animation" class="text-center p-5 m-5" v-if="startRequest">
                <b-icon icon="cloud-download-fill" animation="cylon-vertical" font-scale="3"/>
            </div>
            <p class="text-center text-danger p-2" v-if="errorText">{{ errorText }}</p>
            <VideoResult :result="result" v-on:videoSave="videoSave" v-on:hideForm="hideForm" v-if="showVideo"/>
            <SearchList :result="result" v-if="showPlayList"/>
            <SearchList :result="{videos:result}" v-if="showSearchList"/>
            <!--
            <div class="searc-pages d-flex align-items-center justify-content-between" v-if="showSearchList">
                <a @click="previousSearch()"><b-icon icon="arrow-left"/> Previos</a>
                <a @click="nextSearch()">Next <b-icon icon="arrow-right"/> </a>
            </div>
            -->
        </div>
    </div>
</template>

<script>
    const url = require('url');
    import VideoResult from "./additionform/VideoResult";
    import SearchList from "./additionform/SearchList";
    export default {
        name: "AdditionForm",
        components:{VideoResult, SearchList},
        data(){
            return {
                searchType:'video',
                url:'',
                inputPlaceholder:'Url address or id',
                result:{},
                resultReady: false,
                startRequest:false,
                errorText:'',
                searchOptions:[
                    { text: 'Video url or ID', value:'video'},
                    { text: 'Play list ID', value:'play-list'},
                    { text: 'Search', value:'text'}
                ],
                searchRequestOptions:{
                    type: 'video',
                    limit:50,
                    page:1,
                    useWorkerThread:false
                },
                formCss:{
                    "display-none":true
                }
            }
        },
        watch:{
            searchType:function (val) {
                if(val === "text"){
                    this.inputPlaceholder = 'Text, keywords ...';
                }
                else{
                    this.inputPlaceholder = 'Url address or id';
                }
                this.result = {};
                this.resultReady = false;
            }
        },
        computed:{
            showVideo(){
                return this.searchType === 'video' && this.resultReady === true;
            },
            showPlayList(){
                return this.searchType === 'play-list' && this.resultReady === true;
            },
            showSearchList(){
                return this.searchType === 'text' && this.resultReady === true;
            }
        },
        methods:{
            async search(){
                let that = this;
                that.errorText = '';
                that.searchRequestOptions.page = 1;
                let charLimit = this.searchType === 'text' ? 3 : 9;
                if(that.url.length < charLimit){
                    that.errorText = 'error';
                    return ;
                }

                if(that.searchType === 'video'){
                    that.findVideo();
                }
                else if(that.searchType === 'play-list'){
                    that.getPlayerListData();
                }
                else if(that.searchType === 'text'){
                    that.getSearchListData();
                }
            },

            findVideo(){
                let that = this;
                let id = that.url;
                that.resultReady = false;
                that.startRequest = true;
                if(this.url.startsWith("https://")){
                    id = that.url.split('v=')[this.url.split('v=').length - 1];
                    id = that.url.split('&')[0];
                }
                this.$root.videoInfo(id).then(function (info) {
                    that.result      = info;

                    if(that.result.hasOwnProperty("error")){
                        that.resultReady = false;
                        that.errorText = that.result.message;
                    }
                    else{
                        that.resultReady = true;
                    }
                    that.startRequest = false;
                });
            },

            getPlayerListData(){
                let that = this;
                let id = that.url;
                that.resultReady = false;
                that.startRequest = true;
                if(this.url.startsWith("https://")){
                    let query = url.parse(that.url, true).query;
                    id = query.list;
                }
                that.$root.playListInfo({ url:that.url, id } ).then(function (data) {
                    that.result = data;
                    if(that.result.hasOwnProperty("error")){
                        that.resultReady = false;
                        that.errorText = that.result.message;
                    }
                    else{
                        that.resultReady = true;
                    }
                    that.startRequest = false;
                });
            },

            getSearchListData(option = {}){
                let that = this;
                let text = that.url;
                that.resultReady = false;
                that.startRequest = true;

                let request = {
                    text,
                    options: Object.assign(that.searchRequestOptions, option)
                };
                that.$root.searchListInfo(request).then(function (data) {
                    that.result = data;
                    if(that.result.hasOwnProperty("error")){
                        that.resultReady = false;
                        that.errorText = that.result.message;
                    }
                    else{
                        that.resultReady = true;
                    }
                    that.startRequest = false;
                });
            },

            previousSearch(){
                this.searchRequestOptions.page -= 1;
                if(this.searchRequestOptions.page < 1){
                    this.searchRequestOptions.page = 1;
                }
                this.getSearchListData(this.searchRequestOptions);
            },

            nextSearch(){
                this.searchRequestOptions.page += 1;
                this.getSearchListData(this.searchRequestOptions);
            },

            videoSave(){
                this.$root.addVideo(this.result);
            },

            hideForm(){
                this.resultReady = false;
                this.formCss["display-none"] = true;
            },

            keyEvents(event){
                if(event.keyCode === 27){
                    this.hideForm();
                }
            },
        },
        mounted() {
            let that = this;
            that.$root.event.on("video_added", function (videoData) {
                //that.resultReady    = false;
                //that.startRequest   = false;
                // that.$root.send("viewNotification", {
                //     title: videoData.title, image: videoData.image, text: 'new video added'
                // });
            });
            that.$root.event.on("video_not_be_added", function (videoData) {
                that.errorText = videoData.error.toString();
            });
            that.$root.event.on("show_add_form", function () {
                that.errorText = '';
                that.formCss["display-none"] = false;
            });
            document.addEventListener('keydown', this.keyEvents);
            document.getElementById("search-input").addEventListener("keypress", function (e) {
                if(e.key === "Enter"){
                    that.search();
                }
            });
        }
    }
</script>

<style lang="scss">
    #form-wrapper{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        background-color: rgba(0,0,0,0.7);
        z-index: 999999;
    }
    #add-form{
        width: 100%;
        max-width: 640px;
        height: auto;
        position: absolute;
        left: 50%;
        top: 110px;
        z-index: 1032;
        transform: translate(-50%, 0);
        background-color: #222222;
        padding: 30px;
        border: 1px solid #000000;
        margin-bottom: 120px;
        overflow-y: auto;
        .close{
            position: absolute;
            right: 0;
            top: 0;
            color: #e80020;
            cursor: pointer;
        }
        label{
            font-size: 15px;
            font-weight: bold;
        }
    }
</style>