<template>
    <div id="video-result">
        <listVideoItem :video="result" :colCss="'col-12'" :onlyShow="true" :autoRequest="true" />

        <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control" v-model="result.fulltitle">
        </div>

        <div class="action-buttons mt-4">
            <button class="btn btn-danger" @click="cancel()"><b-icon icon="x-square-fill"/> Cancel</button>
            <button class="btn btn-success float-right" @click="save()" v-if="!hasVideo"><b-icon icon="plus-square-fill"/> Save</button>
            <p class="float-right" v-else>already attached</p>
        </div>

        <div class="related-videos">
            <h1>Related videos</h1>

            <SearchList :result="{videos:result.related_videos}" />
        </div>


    </div>
</template>

<script>
    import SearchList from "./SearchList";
    import listVideoItem from "./listVideoItem";
    export default {
        name: "VideoResult",
        components:{listVideoItem, SearchList},
        props:{
            result:{
                type: Object,
                required: true
            }
        },
        computed:{
            fulltitle(){
                return this.result.fulltitle;
            },
            full_description(){
                return this.result.full_description;
            },
            image(){
                return this.$root.imgPath(this.result.thumbnail);
            },
            hasVideo(){
                return this.$root.hasVideo(this.result.id);
            }
        },
        methods:{
            save(){
                this.$emit("videoSave");
            },
            cancel(){
                this.$emit("hideForm");
            }
        }
    }
</script>

<style lang="scss">
    #video-result{
        .related-videos{
            border-top: 1px solid #333333;
            margin-top: 30px;
            padding-top: 30px;
            h1{
                font-weight: 500;
                font-size: 20px;
                margin-bottom: 30px;
            }
        }
    }
</style>