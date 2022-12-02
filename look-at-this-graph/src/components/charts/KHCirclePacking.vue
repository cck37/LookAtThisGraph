<template>
  <div>
    <h1>Circle Pack in D3</h1>
    <div class="chart"></div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
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

onMounted(() => {
  let data = mapToHierarchy(props.khData);
  console.log(data);
  d3.select(".chart")
    .selectAll("div")
    .data(data)
    .enter()
    .append("div")
    .style("width", function (d) {
      return d.enemies.length * 10 + "px";
    })
    .text(function (d) {
      return `${d.name} ${d.enemies.length}`;
    });
});
</script>

<style>
.chart > div {
  white-space: nowrap;
  font: 10px sans-serif;
  background-color: steelblue;
  text-align: right;
  padding: 3px;
  margin: 1px;
  color: white;
}
</style>
