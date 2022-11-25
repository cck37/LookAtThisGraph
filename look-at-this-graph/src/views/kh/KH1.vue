<template>
  <v-card class="pa-6 rounded-sm mx-12 my-12">Kingdom Hearts 1</v-card>
  <v-card class="pa-6 rounded-sm mx-12 my-12">Chart Go Here</v-card>
</template>

<script setup>
import { onMounted } from "vue";
import { json } from "d3-fetch";
onMounted(() => {
  json("../../../data/kh/darkness.json").then((data) => console.log(data));
});
</script>
