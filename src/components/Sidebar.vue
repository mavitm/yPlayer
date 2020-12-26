<template>
    <div id="sidebar" class="d-flex flex-column" v-if="isOpenSideBar">

        <div class="form-group p-3">
            <input type="text" class="form-control" placeholder="Search" v-model="$root.videoListFilter.search">
        </div>

        <div class="video-list">
            <ListItem v-for="vItem in $root.videoList" :item="vItem"></ListItem>
        </div>

        <div class="sidebar-buttons mt-auto p-3 mb-4">
            <button class="btn btn-link" @click="closeSideBar()"><b-icon icon="arrow-bar-left"></b-icon> <span>esc</span></button>
            <button class="btn btn-link float-right" @click="$root.event.emit('show_add_form')">
                <b-icon icon="plus"></b-icon> New
            </button>

        </div>
    </div>
</template>

<script>
    import ListItem from "./sidebar/ListItem";
    export default {
        name: "Sidebar",
        components:{ListItem},
        data(){
            return {
                isOpenSideBar:false,
                showCategory:false
            }
        },
        computed:{

        },
        methods:{
            openSidebar(){
                this.isOpenSideBar = true;
                this.$root.event.emit("opened_side_bar");
            },
            closeSideBar(){
                this.isOpenSideBar = false;
                this.$root.event.emit("closes_side_bar");
            },
            keyEvents(event){
                if(event.keyCode === 27){
                    if(this.showCategory){
                        this.showCategory   = false;
                    }
                    else{
                        this.closeSideBar();
                    }
                }
            },
        },
        mounted() {
            let that = this;
            that.$root.event.on("open_side_bar", this.openSidebar);
            that.$root.event.on("close_side_bar", this.closeSideBar);
            document.addEventListener('keydown', this.keyEvents);
        }
    }
</script>

<style lang="scss">
    #sidebar{
        width: 320px;
        height: 100%;
        position: fixed;
        z-index: 1031;
        background-color: #000000;
    }

    .video-list{
        height: 100%;
        overflow-y: auto;
    }

    .sidebar-buttons{
        .btn{
            color: #ffffff;
            &:hover{
                color: #cccccc;
                text-decoration: none;
            }
            span{
                font-size: 11px;
            }
        }
    }

</style>