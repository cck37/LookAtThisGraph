<template>
  <div>
    <v-select
      clearable
      chips
      hint="What recipes do you still need to finish"
      :items="recipes"
      label="Recipes"
      multiple
      variant="underlined"
      v-model="selectedRecipes"
    ></v-select>
    <svg width="960" height="960"></svg>
  </div>
</template>

<script setup>
import { watchEffect, ref, onMounted } from "vue";
import { mapToFlat } from "./mapper";
import * as d3 from "d3";

const props = defineProps(["khData"]);
let data = mapToFlat(props.khData);
const recipes = [...new Set(data.map((comp) => comp.recipeName))]; // arr->set->arr to remove dupes
const selectedRecipes = ref([]);
watchEffect(() => {
  chart(
    data.filter((comp) =>
      selectedRecipes.value.some((r) => r === comp.recipeName)
    )
  );
});

function color() {
  d3.scaleLinear()
    .domain([0, 5])
    .range(["hsl(0, 0%, 10%)", "hsla(0, 0%, 80%)"])
    .interpolate(d3.interpolateHcl);
}

function update(root) {
  const height = 932;
  const width = 932;
  let focus = root;
  let view;

  const svg = d3
    .select("svg")
    .attr("viewBox", [-(width / 2), -(height / 2), width, height])
    .style("display", "block")
    .style("margin", "0 -14px")
    .style("background", color(0))
    .style("cursor", "pointer")
    .on("click", (event) => zoom(event, root));

  const node = d3
    .select("svg")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
    .attr("fill", (d) => (d.children ? color(d.depth) : "white"))
    .attr("pointer-events", (d) => (!d.children ? "none" : "auto"))
    .on(
      "click",
      (event, d) => focus !== d && (zoom(event, d), event.stopPropagation())
    );

  const label = d3
    .select("svg")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants())
    .join("text")
    .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
    .style("display", (d) => (d.parent === root ? "inline" : "none"))
    .style("font-size", (d) => (d.parent === root ? `${d.r * 0.4}px` : "12px"))
    .text((d) =>
      d.parent === root
        ? d.data[0]
        : `${d.data[0]} - ${parseFloat(d.value).toFixed(3) * 100}%`
    );

  const zoomTo = (v) => {
    const k = width / v[2];

    view = v;

    label.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
    node.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
    node.attr("r", (d) => d.r * k);
  };

  function zoom(event, d) {
    const focus0 = focus;

    focus = d;

    const transition = d3
      .select("svg")
      .transition()
      .duration(event.altKey ? 7500 : 750)
      .tween("zoom", (d) => {
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
        return (t) => zoomTo(i(t));
      });

    label
      .filter(function (d) {
        return d.parent === focus || this.style.display === "inline";
      })
      .transition(transition)
      .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
      .on("start", function (d) {
        if (d.parent === focus) this.style.display = "inline";
      })
      .on("end", function (d) {
        if (d.parent !== focus) this.style.display = "none";
      });
  }

  zoomTo([root.x, root.y, root.r * 2]);
}

// TODO: Mimic https://observablehq.com/@d3/pack (clip-path, text structuring, etc.)
function chart(data) {
  const height = 932;
  const width = 932;
  var pack = d3.pack().size([900, 900]);

  const round = (value, decimals) => {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
  };

  const sumMaxDropRate = (group) => {
    return group.reduce((x, y) => round(x * (1 - y.drop_rate_max), 2), 1);
  };

  console.log(data);

  const groups = d3.rollup(
    data,
    sumMaxDropRate,
    function (d) {
      return d.locationName;
    },
    function (d) {
      return d.componentName;
    }
  );

  const root_hierarchy = d3
    .hierarchy(groups)
    .sum((d) => 1 - d[1])
    .sort((a, b) => d3.descending(a.value, b.value));

  const root = pack(root_hierarchy);

  update(root);
}

onMounted(() => {
  chart(data);
});
</script>

<style>
.chart > div {
  white-space: nowrap;
  text-align: right;
  padding: 3px;
  margin: 1px;
  color: white;
}
circle {
  fill: hsl(0, 0%, 2%);
  opacity: 0.3;
  stroke: darkblue;
}

text {
  fill: gold;
  text-anchor: middle;
}

.node:hover {
  stroke-width: 7px !important;
  opacity: 1 !important;
}
</style>
