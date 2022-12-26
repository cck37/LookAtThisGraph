<template>
  <KHCirclePacking v-if="khData" :khData="khData" />
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
