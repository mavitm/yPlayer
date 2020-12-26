<template>
    <div id="search-list" class="row">
        <listVideoItem v-for="video in result.videos" v-bind:key="video.id" :video="video" :colCss="'col-6'" />
    </div>
</template>

<script>
    import listVideoItem from "./listVideoItem";
    export default {
        name: "SearchList",
        components:{listVideoItem},
        props:{
            result:{
                type: Object,
                required: true
            }
        },

    }
</script>

<style scoped>

</style>