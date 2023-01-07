<template>
  <v-card class="pa-6 rounded-sm mx-12 my-12">Kingdom Hearts 1</v-card>
  <v-card class="pa-6 rounded-sm mx-12 my-12">
    <v-card-title>"Highest" spawn rates by location</v-card-title>
    <v-card-text>
      <KHCirclePacking v-if="khData" :khData="khData" />
    </v-card-text>
  </v-card>
</template>

<script async setup>
import { json } from "d3-fetch";
import { ref, onServerPrefetch, onMounted } from "vue";
import KHCirclePacking from "../../components/charts/KHCirclePacking.vue";

const khData = ref(null);

onServerPrefetch(async () => {
  // component is rendered as part of the initial request
  // pre-fetch data on server as it is faster than on the client
  khData.value = await fetchOnServer(json("../../../data/kh/darkness.json"));
});

onMounted(async () => {
  if (!khData.value) {
    // if data is null on mount, it means the component
    // is dynamically rendered on the client. Perform a
    // client-side fetch instead.
    khData.value = await json("../../../data/kh/darkness.json");
  }
});
</script>
