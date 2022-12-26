<template>
  <div>
    <h1>Circle Pack in D3</h1>
    <svg width="960" height="960"></svg>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { mapToHierarchy, mapToFlat } from "./mapper";
import * as d3 from "d3";

const props = defineProps(["khData"]);

function chart() {
  var height = 932;
  var width = 932;

  var pack = d3.pack().size([900, 900]);

  function round(value, decimals) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
  }

  const sumMaxDropRate = (group) => {
    return group.reduce((x, y) => round(x * (1 - y.drop_rate_max), 2), 1);
  };

  let data = mapToFlat(props.khData).filter(
    (d) => d.drop_rate_max !== undefined
  );
  let groups = d3.rollup(
    data,
    sumMaxDropRate,
    function (d) {
      return d.locationName;
    },
    function (d) {
      return d.componentName;
    }
  );

  let root_hierarchy = d3.hierarchy(groups);
  root_hierarchy.sum((d) => 1 - d[1]);

  console.table(groups);
  console.log(root_hierarchy);
  console.log(this);
  const root = pack(root_hierarchy);
  console.log(root.descendants());
  let focus = root;
  let view;

  const color = d3
    .scaleLinear()
    .domain([0, 5])
    .range(["hsla(0, 0%, 10%, 1)", "hsla(0, 0%, 80%, 0.25)"])
    .interpolate(d3.interpolateHcl);

  const svg = d3
    .select("svg")
    .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
    .style("display", "block")
    .style("margin", "0 -14px")
    .style("background", color(0))
    .style("cursor", "pointer")
    .on("click", (event) => zoom(event, root));

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
    .attr("fill", (d) => (d.children ? color(d.depth) : "white"))
    .attr("pointer-events", (d) => (!d.children ? "none" : null))
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "#000");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", null);
    })
    .on(
      "click",
      (event, d) => focus !== d && (zoom(event, d), event.stopPropagation())
    );

  const label = svg
    .append("g")
    .style("font", "10px sans-serif")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants())
    .join("text")
    .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
    .style("display", (d) => (d.parent === root ? "inline" : "none"))
    .text((d) =>
      d.parent === root
        ? d.data[0]
        : `${d.data[0]} - ${parseFloat(d.value).toFixed(3) * 100}%`
    );

  console.log(label);
  zoomTo([root.x, root.y, root.r * 2]);

  function zoomTo(v) {
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
  }

  function zoom(event, d) {
    const focus0 = focus;

    focus = d;

    const transition = svg
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

  return svg.node();
}

onMounted(() => {
  chart();
  //   var tooltip = d3
  //     .select(".tooltip-area")
  //     .style("opacity", 0)
  //     .attr("class", "tooltip")
  //     .style("border", "solid");

  //   const mouseover = (_event, _d) => {
  //     tooltip.style("opacity", 1);
  //   };

  //   const mouseleave = (_event, _d) => {
  //     tooltip.style("opacity", 0);
  //   };

  //   const mousemove = (event, d) => {
  //     const text = d3.select(".tooltip-area__text");
  //     text.text(
  //       d.children === undefined
  //         ? `${d.data[0] ?? ""}: ${parseFloat(d.value).toFixed(3) * 100}%`
  //         : ""
  //     );

  //     //const [x, y] = d3.pointer(event, d);

  //     tooltip.attr("transform", `translate(${d.x}, ${d.y + 20})`);
  //   };

  //   function zoomed({ transform }) {
  //     nodes.attr("transform", transform);
  //   }

  //   var nodes = d3
  //     .select("svg")
  //     .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
  //     .style("display", "block")
  //     .selectAll(".plot_area")
  //     .data(root.descendants())
  //     .join("g")
  //     .attr("transform", function (d) {
  //       return "translate(" + [d.x, d.y] + ")";
  //     });

  //   nodes
  //     .append("circle")
  //     .attr("r", function (d) {
  //       return d.r;
  //     })
  //     .attr("class", "node");

  //   nodes
  //     .append("text")
  //     .attr("dy", 4)
  //     .text(function (d) {
  //       return d.children !== undefined && d.data[0]
  //         ? `${d.data[0]}: ${parseFloat(d.value).toFixed(3)}`
  //         : "";
  //     });

  //   nodes
  //     .on("mouseover", mouseover)
  //     .on("mousemove", mousemove)
  //     .on("mouseleave", mouseleave)
  //     .call(
  //       d3
  //         .zoom()
  //         .extent([
  //           [0, 0],
  //           [width, height],
  //         ])
  //         .scaleExtent([1, 10])
  //         .on("zoom", zoomed)
  //     );
});
</script>

<style>
.chart > div {
  white-space: nowrap;
  font: 10px sans-serif;
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
.tooltip-area__text {
  font-size: 12px;
}

.node:hover {
  stroke-width: 7px !important;
  opacity: 1 !important;
}
</style>
