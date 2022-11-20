import { createRouter, createWebHashHistory } from "vue-router";

import Home from "../views/Home.vue";

import KingdomHearts from "../views/KingdomHearts.vue";
import khRoutes from "./kh-routes";

import LegendOfZelda from "../views/LegendOfZelda.vue";
import lozRoutes from "./loz-routes";

export const routes = [
  { path: "/", component: Home },
  { path: "/kh", component: KingdomHearts, children: khRoutes },
  { path: "/loz", component: LegendOfZelda, children: lozRoutes },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
