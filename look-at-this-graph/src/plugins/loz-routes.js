// TOOD: proper index.js for this
import OOT from "../views/loz/LOZ-OOT.vue";
import MM from "../views/loz/LOZ-MM.vue";

const routes = [
  { path: "oot", component: OOT, friendlyName: "Ocarina of Time" },
  { path: "mm", component: MM, friendlyName: "Majoras Mask" },
];

export default routes;
