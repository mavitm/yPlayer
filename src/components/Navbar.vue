<template>
    <b-navbar toggleable="sm" type="light" variant="dark" fixed="bottom">
        <a class="nav-sidebar-btn" @click="$root.event.emit('open_side_bar')"><b-icon icon="layout-sidebar-inset"></b-icon></a>

        <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav class="ml-5">

                <!--
                <a class="btn btn-link mr-2" @click="showAddForm()">
                    <b-icon icon="plus"></b-icon> New
                </a>
                -->

                <a :class="listRepeatBtn" class="btn btn-link mr-2" @click="setListRepeat()">
                    <b-icon icon="arrow-repeat"></b-icon> List
                </a>

                <a class="btn btn-link mr-2" :class="singleRepeatBtn" @click="setSingleRepeat()">
                    <b-icon icon="arrow-repeat"></b-icon> Single
                </a>

                <a :class="shufleBtn"  class="btn btn-link mr-2" @click="setRandom()">
                    <b-icon icon="shuffle"></b-icon> Shufle
                </a>

                <a :disabled="previousButtonLoad" class="btn btn-link mr-2" @click="$root.playPreviousVideo()">
                    <b-icon icon="skip-backward"></b-icon>
                    <!-- <b-icon icon="arrow-clockwise" animation="spin" font-scale="1" v-if="previousButtonLoad"></b-icon>-->
                </a>

                <a v-if="$root.isPlay" class="btn btn-link mr-2" @click="$root.pause()">
                    <b-icon icon="pause"></b-icon>
                </a>

                <a v-if="!$root.isPlay" class="btn btn-link mr-2" @click="$root.play()">
                    <b-icon icon="play"></b-icon>
                </a>

                <a :disabled="nextButtonLoad" class="btn btn-link mr-2" @click="$root.playNextVideo()">
                    <b-icon icon="skip-forward"></b-icon>
                    <!-- <b-icon icon="arrow-clockwise" animation="spin" font-scale="1" v-if="nextButtonLoad"></b-icon>-->
                </a>
            </b-navbar-nav>
        </b-collapse>

        <b-navbar-brand href="#" class="ml-auto">yPlayer</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    </b-navbar>
</template>

<script>
    export default {
        name: "Navbar",
        computed:{
            shufleBtn() {
                let css = {};
                css.active = this.$root.randomPlay;
                return css;
            },
            singleRepeatBtn() {
                let css = {};
                css.active = this.$root.singleRepeat;
                return css;
            },
            listRepeatBtn() {
                let css = {};
                css.active = this.$root.listRepeat;
                return css;
            },
            previousButtonLoad(){
                return false;
            },
            nextButtonLoad(){
                return false;
            }
        },
        methods:{
            showAddForm(){
                this.$root.event.emit("show_add_form");
            },
            setListRepeat(){
                this.$root.listRepeat   = !this.$root.listRepeat;
                if(this.$root.listRepeat){
                    this.$root.singleRepeat = false;
                }
                else{
                    this.$root.randomPlay = false;
                }
            },
            setSingleRepeat(){
                this.$root.singleRepeat = !this.$root.singleRepeat;
                if(this.$root.singleRepeat){
                    this.$root.listRepeat = false;
                    this.$root.randomPlay = false;
                }
            },
            setRandom(){
                this.$root.randomPlay = !this.$root.randomPlay;
                if(this.$root.randomPlay) {
                    this.$root.singleRepeat = false;
                    this.$root.listRepeat = true;
                }
            }
        }
    }
</script>

<style lang="scss">
    .nav-sidebar-btn{
        background-color: #222222;
        color: #ffffff;
        padding: 15px 20px;
        margin: -15px;
        cursor: pointer;
        display: block;
        position: relative;
        z-index: 1035;
        &:hover{
            color: #cccccc;
        }
    }
    .navbar-brand{
        color: #767676 !important;
        font-weight: bold;
        text-shadow: 1px 1px #000000;
    }
    .navbar-nav{
        .btn-link{
            color: #767676;
            text-decoration: none;
            &:hover, &:active, &.active{
                color: #ffffff;
                text-decoration: none;
            }
        }
    }
</style>