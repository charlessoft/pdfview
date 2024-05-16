<script setup>
// import HelloWorld from './components/HelloWorld.vue'
// import Main from './components/main.vue'

</script>

<template>

  <div >
    <RouterLink to="/">文章导读(LR)</RouterLink>
    <RouterLink to="/mlayout_markdown" style="margin-left: 20px;">文章导读(微软)</RouterLink>
    <RouterLink to="/marker_markdown" style="margin-left: 20px;">文章导读(marker)</RouterLink>
    <hr />
    <router-view />
<!--    <Main v-if="loading==true" :pdf="jsPdf" style="margin-top:0px;width: 100%;height:100%;"></Main>-->
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
