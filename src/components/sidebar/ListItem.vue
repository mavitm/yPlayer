<template>
    <div class="video-list-item d-flex" :class="{active:isActive}">
        <div class="item-image hand">
            <img :src="image" alt="" @click="videoPlay(item.id, true)">
        </div>
        <div class="item-info hand">
            <h2 @click="videoPlay(item.id, true)">{{ fulltitle }}</h2>
        </div>
        <b-dropdown variant="link" class="item-action" toggle-class="text-decoration-none" dropright no-caret>
            <template #button-content>
                <b-icon icon="three-dots-vertical"></b-icon>
            </template>
            <b-dropdown-item href="#" @click="videoPlay(item.id, false)"><b-icon icon="play"></b-icon> Play</b-dropdown-item>
            <b-dropdown-item href="#" @click="openExternal(item.id)"><b-icon icon="link"></b-icon> open external</b-dropdown-item>
            <b-dropdown-item href="#" @click="$root.event.emit('view-video-info')" v-if="isActive"><b-icon icon="exclamation-circle"></b-icon> info</b-dropdown-item>
            <b-dropdown-item href="#" @click="deleteItem(item.id)"><b-icon icon="trash"></b-icon> Delete</b-dropdown-item>
        </b-dropdown>
    </div>
</template>

<script>
    export default {
        name: "ListItem",
        props:{
            item:{
                type: Object,
                required: true
            }
        },
        computed:{
            fulltitle(){
                return this.item.title;
            },
            full_description(){
                return this.item.full_description;
            },
            image(){
                return this.$root.imgPath(this.item.image);
            },
            isActive(){
                return this.$root.videoData.id === this.item.id;
            }
        },
        methods:{
            videoPlay(id, hideSideBar=false){
                if(this.$root.videoData.id === this.item.id){
                    return;
                }
                this.$root.event.emit("playID", {id});
                if(hideSideBar){
                    this.$root.event.emit("close_side_bar");
                }
            },
            openExternal(id){
                let url = this.$root.getUrl(id);
                console.log(url);
                this.$root.externalOpen(url);
            },
            deleteItem(id){
                let that = this;
                this.$bvModal.msgBoxConfirm('are you sure.', {
                    title: 'Please Confirm',
                    size: 'sm',
                    buttonSize: 'sm',
                    okVariant: 'danger',
                    okTitle: 'YES',
                    cancelTitle: 'NO',
                    footerClass: 'p-2',
                    hideHeaderClose: false,
                    centered: true
                })
                    .then(value => {
                        if(value) {
                            that.$root.deleteVideo(id);
                        }
                    })
                    .catch(err => {
                        // An error occurred
                    })
            }
        }
    }
</script>

<style lang="scss">
    .video-list-item{
        padding: 5px;
        .item-image{
            margin-right: 5px;
            img{
                width: 90px;
            }
        }
        h2{
            font-size: 15px;
            font-weight: bold;
            margin: 0;
            padding: 10px 0;
            color: #767676;
        }
        .dropdown{
            .btn{
                color: #767676;
                &:hover{
                    color: #ffffff;
                }
            }
        }
        &.active{
            h2{
                color: #ffffff;
            }
        }
    }
</style>