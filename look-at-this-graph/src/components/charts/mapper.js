//todo: replace with rollup
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

//todo: replace with rollup
const mapComponentsByEnemy = (components) => {
  return components.reduce((enemy, component) => {
    component.enemies.forEach((en) => {
      //FIXME: Figure out a way to append onto existing objects w/o relying on a key value pair
      if (enemy.hasOwnProperty(en.name)) {
        enemy[en.name]["children"].push({ ...en, name: component.name });
      } else {
        enemy[en.name] = {
          name: en.name,
          children: [{ ...en, name: component.name, value: en.drop_rate_max }],
        };
      }
    });
    return enemy;
  }, {});
};

//FIXME: Above aggregates force us to iterate through a list of keys and then map it back to an array
//todo: replace with rollup
const welcomeToHell = (aggregatedDict) =>
  Object.keys(aggregatedDict).map((key) => ({
    name: aggregatedDict[key].name,
    children: Object.keys(aggregatedDict[key])
      .filter((key2) => key2 !== "name")
      .map((key2) => ({ ...aggregatedDict[key][key2] })),
  }));

export const mapToHierarchy = (data) => {
  const { recipes, components, enemies } = data;
  const enemiesDict = mapComponentsByEnemy(components);
  const aggregatedDict = mapEnemiesByLocation(enemies, enemiesDict);
  return welcomeToHell(aggregatedDict);
};

// Mushrooms have a more complex relationship with their environment
// https://www.khguides.com/kh/combat/enemies/mushroom-heartless/
const mushroomNames = [
  "White Mushroom",
  "Rare Truffle",
  "Black Fungus",
  "Pink Agaricus",
];
const isMushroom = (name) => mushroomNames.some((mush) => mush === name);

export const mapToFlat = (data) => {
  const { recipes, components, enemies } = data;
  let flat_loc_arr = [];
  for (let i in enemies) {
    let enemy = enemies[i];
    enemy.locations.forEach((j) => {
      if (!isMushroom(enemy.name)) {
        flat_loc_arr.push({
          locationName: j.split(":")[0],
          enemyName: enemy.name,
        });
      }
    });
  }
  let flat_comp_arr = [];
  for (let i in components) {
    let component = components[i];
    component.enemies.forEach((j) => {
      if (!isMushroom(j.name)) {
        flat_comp_arr.push({
          ...j,
          componentName: component.name,
          enemyName: j.name,
        });
      }
    });
  }
  let flat_recipe_arr = [];
  for (let i in recipes) {
    let recipe = recipes[i];
    recipe.components.forEach((j) => {
      flat_recipe_arr.push({
        recipeName: recipe.name,
        componentName: j.name,
        quantity: j.quantity,
      });
    });
  }

  let joined = flat_comp_arr
    .map((t) => {
      var locs = flat_loc_arr.filter((l) => l.enemyName === t.enemyName);
      return locs.map((l) => ({ ...l, ...t }));
    })
    .flat();

  joined = joined.map((t) => {
    return {
      ...t,
      recipes: flat_recipe_arr.filter(
        (r) => r.componentName === t.componentName
      ),
    };
  });

  return joined;
};
