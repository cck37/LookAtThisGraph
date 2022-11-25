<template>
  <v-card class="pa-6 rounded-sm mx-12 my-12">Kingdom Hearts 1</v-card>
  <v-card class="pa-6 rounded-sm mx-12 my-12">Chart Go Here</v-card>
</template>

<script setup>
import { onMounted } from "vue";
import { json } from "d3-fetch";

const mapEnemiesByLocation = (enemies) => {
  return enemies.reduce((location, enemy) => {
    enemy.locations.forEach((loc) => {
      if (
        location.hasOwnProperty(loc) &&
        location[loc].hasOwnProperty(enemy.name)
      ) {
        location[loc][enemy.name] += 1;
      } else if (location.hasOwnProperty(loc)) {
        location[loc][enemy.name] = 1;
      } else {
        location[loc] = { [enemy.name]: 1 };
      }
    });
    return location;
  }, {});
};

const mapComponentsByEnemy = (components) => {
  return;
};

onMounted(() => {
  json("../../../data/kh/darkness.json").then((data) => console.log(data));
});
</script>
