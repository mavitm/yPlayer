<template>
  <div class="main-wrapper home">
      <div id="content">
          <Sidebar></Sidebar>
          <player></player>
      </div>
      <AdditionForm></AdditionForm>
      <Navbar></Navbar>
  </div>
</template>

<script>
  import Player from "../components/Player";
  import Navbar from "../components/Navbar";
  import AdditionForm from "../components/AdditionForm";
  import Sidebar from "../components/Sidebar";
export default {
  name: 'Home',
  components:{Player, Navbar, AdditionForm, Sidebar}

}
</script>
