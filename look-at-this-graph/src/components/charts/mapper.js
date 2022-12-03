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

export const mapToFlat = (data) => {
  const { recipes, components, enemies } = data;
  let flat_loc_arr = [];
  for (let i in enemies) {
    let enemy = enemies[i];
    enemy.locations.forEach((j) =>
      flat_loc_arr.push({
        locationName: j.split(":")[0],
        enemyName: enemy.name,
      })
    );
  }
  let flat_comp_arr = [];
  for (let i in components) {
    let component = components[i];
    component.enemies.forEach((j) =>
      flat_comp_arr.push({
        ...j,
        componentName: component.name,
        enemyName: j.name,
      })
    );
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

  let joined = flat_loc_arr.map((loc) => {
    return {
      ...loc,
      ...flat_comp_arr.reduce((acc, val) => {
        return val.enemyName === loc.enemyName ? val : acc;
      }, {}),
    };
  });

  joined = joined.map((join) => {
    return {
      ...join,
      ...flat_recipe_arr.reduce((acc, val) => {
        return val.componentName === join.componentName ? val : acc;
      }, {}),
    };
  });

  return joined;
};
