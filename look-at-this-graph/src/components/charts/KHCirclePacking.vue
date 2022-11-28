<template>
  <div>
    <h1>Circle Pack in D3</h1>
    <svg :height="height" :width="width">
      <g transform="translate(50,50)">
        <circle
          v-for="c in output"
          :key="c.id"
          :r="c.r"
          :cx="c.x"
          :cy="c.y"
          :fill="c.fill"
          :stroke="c.stroke"
        ></circle>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from "vue";
import * as d3 from "d3";

const props = defineProps(["khData"]);

const mapEnemiesByLocation = (enemies, enemiesDict) => {
  return enemies.reduce((location, enemy) => {
    enemy.locations.forEach((loc) => {
      let locName = loc.split(":")[0].trim();
      //FIXME: Figure out a way to append onto existing objects w/o relying on a key value pair
      if (
        location.hasOwnProperty(locName) &&
        enemiesDict.hasOwnProperty(enemy.name)
      ) {
        location[locName][enemy.name] = enemiesDict[enemy.name];
      } else if (enemiesDict.hasOwnProperty(enemy.name)) {
        location[locName] = {
          name: locName,
          [enemy.name]: enemiesDict[enemy.name],
        };
      }
    });
    return location;
  }, {});
};

const mapComponentsByEnemy = (components) => {
  return components.reduce((enemy, component) => {
    component.enemies.forEach((en) => {
      //FIXME: Figure out a way to append onto existing objects w/o relying on a key value pair
      if (enemy.hasOwnProperty(en.name)) {
        enemy[en.name]["components"].push({ ...en, name: component.name });
      } else {
        enemy[en.name] = {
          name: en.name,
          components: [{ ...en, name: component.name }],
        };
      }
    });
    return enemy;
  }, {});
};

//FIXME: Above aggregates force us to iterate through a list of keys and then map it back to an array
const welcomeToHell = (aggregatedDict) =>
  Object.keys(aggregatedDict).map((key) => ({
    name: aggregatedDict[key].name,
    enemies: Object.keys(aggregatedDict[key])
      .filter((key2) => key2 !== "name")
      .map((key2) => ({ ...aggregatedDict[key][key2] })),
  }));

const mapToHierarchy = (data) => {
  const { recipes, components, enemies } = data;
  const enemiesDict = mapComponentsByEnemy(components);
  const aggregatedDict = mapEnemiesByLocation(enemies, enemiesDict);
  return welcomeToHell(aggregatedDict);
};

const packData = (data) => {
  return d3
    .nest()
    .key((d) => d.name)
    .entries(data);
};

console.log(mapToHierarchy(props.khData));

const output = computed(() => packData(mapToHierarchy(props.khData)));
</script>
