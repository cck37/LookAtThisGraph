<template>
  <div>
    <nav-bar :routes="routes" base="/kh" />
    <h1>Welcome to KH</h1>
    <router-view></router-view>
  </div>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import routes from "../plugins/kh-routes";
</script>

<style></style>
