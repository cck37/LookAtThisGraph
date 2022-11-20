<template>
  <v-navigation-drawer
    model-value
    class="pt-4"
    color="grey-lighten-3"
    rail
    expand-on-hover
    permanent
  >
    <v-btn
      v-for="(route, idx) in normalizedRoutes"
      :key="idx"
      :size="idx === 0 ? 36 : 20"
      class="d-block text-center mx-auto mb-9"
    >
      <router-link :to="route.path">
        {{ route.friendlyName }}
      </router-link>
    </v-btn>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps(["routes", "base"]);
const normalizedRoutes = computed(() => {
  const routes = props.routes.map((route) => ({
    ...route,
    path: `${props.base}/${route.path}`,
  }));
  return [{ path: "/", component: "", friendlyName: "Home" }, ...routes];
});
</script>
