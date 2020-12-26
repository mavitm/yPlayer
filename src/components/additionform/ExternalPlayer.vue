<template>
    <div id="external-player">
        <a class="close" @click="hideExternalPlayer()">
            <b-icon icon="x-square-fill"/>
        </a>
        <video id="external-video" width="100%" height="380" :src="$root.externalSource.url" controls autoplay/>
    </div>
</template>

<script>
    export default {
        name: "ExternalPlayer",
        methods:{
            hideExternalPlayer(){
                this.$root.showExternalPlayer = false;
            }
        },
        mounted() {
            document.getElementById("external-video").play();
        },
        destroyed() {
            try {
                document.getElementById("external-video").stop();
            }catch (e) {

            }
            this.$root.externalSource = null;
        }
    }
</script>

<style lang="scss">
    #external-player{
        background-color: #000000;
        padding: 24px 0 0 0;
        width: 410px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999999;
        video{
            position: relative;
            z-index: 1;
        }
        .close{
            position: absolute;
            right: 0;
            top: 0;
            color: #e80020;
            cursor: pointer;
            z-index: 500;
        }
    }
</style>