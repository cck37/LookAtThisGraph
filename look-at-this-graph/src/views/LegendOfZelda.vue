<template>
  <div>
    <nav-bar :routes="routes" base="/loz" />
    <h1>Welcome to LoZ</h1>
    <router-view></router-view>
  </div>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import routes from "../plugins/loz-routes";
</script>

<style></style>
