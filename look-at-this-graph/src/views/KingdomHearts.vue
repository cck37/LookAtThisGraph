<template>
  <v-layout style="height: 100vh">
    <nav-bar :routes="routes" base="/kh" />
    <v-app-bar>
      <v-img
        aspect-ratio="16/9"
        width="50"
        height="50"
        src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwebstockreview.net%2Fimages%2Fshhh-clipart-s-surprise-15.png&f=1&nofb=1&ipt=de550f640c45b8a485282f0655cea44a2756c1e14056eb6461be849b215d3a15&ipo=images"
      >
      </v-img>
    </v-app-bar>
    <v-main class="kh-bg">
      <router-view></router-view>
    </v-main>
  </v-layout>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import routes from "../plugins/kh-routes";
</script>

<style scoped>
.kh-bg {
  background-image: url("/assets/kh_header.jpg");
  background-position: center;
  background-repeat: repeat;
  height: 100vh;
}
</style>
