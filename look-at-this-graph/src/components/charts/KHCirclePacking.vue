<template>
  <div>
    <h1>Circle Pack in D3</h1>
    <div class="chart"></div>
    <svg width="1000" height="1000">
      <g class="plot-area" />
      <g class="tooltip-area">
        <text class="tooltip-area__text" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { mapToHierarchy, mapToFlat } from "./mapper";
import * as d3 from "d3";

const props = defineProps(["khData"]);

//todo: pass to hierarchy
//todo:

onMounted(() => {
  var packLayout = d3.pack().size([900, 900]);
  let data = mapToHierarchy(props.khData);
  let rootData = d3.hierarchy(data);
  rootData.sum(function (d) {
    return d[1];
  });
  //console.log(props.khData, rootData);
  console.table(mapToFlat(props.khData));
  const sumMaxDropRate = (group) => {
    return d3.sum(group, function (d) {
      return d.drop_rate_max;
    });
  };

  let data2 = mapToFlat(props.khData);
  let groups = d3.rollup(
    data2,
    sumMaxDropRate,
    function (d) {
      return d.locationName;
    },
    function (d) {
      return d.componentName;
    }
  );

  let root = d3.hierarchy(groups);
  root.sum((d) => d[1]);

  packLayout(root);

  var tooltip = d3
    .select(".tooltip-area")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  const mouseover = (_event, _d) => {
    tooltip.style("opacity", 1);
  };

  const mouseleave = (_event, _d) => {
    tooltip.style("opacity", 0);
  };

  const mousemove = (event, d) => {
    const text = d3.select(".tooltip-area__text");
    text.text(
      d.children === undefined
        ? `${d.data[0] ?? ""}: ${parseFloat(d.value).toFixed(3) * 100}%`
        : ""
    );

    //const [x, y] = d3.pointer(event, d);

    tooltip.attr("transform", `translate(${d.x}, ${d.y + 20})`);
  };

  var nodes = d3
    .select("svg g")
    .selectAll(".plot_area")
    .data(root.descendants())
    .join("g")
    .attr("transform", function (d) {
      return "translate(" + [d.x, d.y] + ")";
    });

  nodes
    .append("circle")
    .attr("r", function (d) {
      return d.r;
    })
    .attr("class", "node");

  nodes
    .append("text")
    .attr("dy", 4)
    .text(function (d) {
      return d.children !== undefined && d.data[0]
        ? `${d.data[0]}: ${parseFloat(d.value).toFixed(1)}`
        : "";
    });

  nodes
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  // d3.select(".chart")
  //   .selectAll("div")
  //   .data(data)
  //   .enter()
  //   .append("div")
  //   .style("width", function (d) {
  //     return d.children.length * 10 + "px";
  //   })
  //   .text(function (d) {
  //     return `${d.name} ${d.children.length}`;
  //   });
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
circle {
  fill: indianred;
  opacity: 0.3;
  stroke: white;
}

text {
  fill: white;
  text-anchor: middle;
}
.tooltip-area__text {
  font-size: 10px;
}

.node:hover {
  stroke-width: 7px !important;
  opacity: 1 !important;
}
</style>
