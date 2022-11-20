// TOOD: proper index.js for this
import KH1 from "../views/kh/KH1.vue";
import KH2 from "../views/kh/KH2.vue";
import KH3 from "../views/kh/KH3.vue";

const routes = [
  { path: "1", component: KH1, friendlyName: "Kingdom Hearts 1" },
  { path: "2", component: KH2, friendlyName: "Kingdom Hearts 2" },
  { path: "3", component: KH3, friendlyName: "Kingdom Hearts 3" },
];

export default routes;
