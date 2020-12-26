<template>
  <div id="app">
    <div id="title-bar" class="d-flex align-items-center">
        <div class="app-title w-100 mr-2">yPlayer</div>
        <div class="app-min ml-auto mr-3" @click="appMin">-</div>
        <div class="app-close" @click="appQuit()">x</div>
    </div>
      <div id="content">
          <Sidebar></Sidebar>
          <player></player>
      </div>
      <AdditionForm></AdditionForm>
      <Navbar></Navbar>
      <ExternalPlayer v-if="$root.showExternalPlayer" :source="$root.externalSource"/>
  </div>
</template>
<script>
    import Player from "./components/Player";
    import Navbar from "./components/Navbar";
    import AdditionForm from "./components/AdditionForm";
    import Sidebar from "./components/Sidebar";
    import ExternalPlayer from "./components/additionform/ExternalPlayer";
    export default {
        name: 'Home',
        components:{Player, Navbar, AdditionForm, Sidebar, ExternalPlayer},
        methods:{
            appQuit(){
                this.$root.send("quit");
            },
            appMin(){
                this.$root.send("min");
            }
        }

    }
</script>
<style lang="scss">
  #title-bar{
    position: relative;
    z-index: 1030;
    width: 100%;
    height: 25px;
    color: #cccccc;
    padding: 10px;
    background-color: #222222;
    .app-title{
      font-size: 11px;
      -webkit-user-select: none;
      -webkit-app-region: drag;
    }
    .app-min, .app-close{
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
      -webkit-user-select: none;
    }
  }
</style>
