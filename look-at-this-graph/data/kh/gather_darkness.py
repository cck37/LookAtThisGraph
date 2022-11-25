from playwright.sync_api import sync_playwright
import json
import re

def get_recipes(page):
    # Locators
    tables = page.locator("table.list.block-1:visible")

    recipes_list = list()
    table_count = tables.count()
    for i in range(table_count):
        rows = tables.nth(i).locator("tr")
        rows_count = tables.nth(i).locator("tr").count()
        for j in range(rows_count):
            key = rows.nth(j).locator("td").nth(0).all_inner_texts()
            
            # "[1]\xa0\xa0Spirit Shard\n[1]\xa0\xa0Power Shard\n[1]\xa0\xa0Mythril Shard"
            components_raw = rows.nth(j).locator("td").nth(1).all_inner_texts()
            component_list = list()
            if len(components_raw) > 0:
                for components in components_raw:
                    for component in components.split("\n"):

                        component_dict = dict()

                        t_str = component.replace(u"\xa0", " ")
                        t_list = t_str.split("]")
                        
                        component_dict["name"] = t_list[1].strip("[").strip("]").strip()
                        component_dict["quantity"] = int(t_list[0].strip("[").strip("]").strip())
                        component_list.append(component_dict)
            
            if len(key) > 0 and component_dict:
                inner_dict = dict()
                inner_dict["name"] = key[0]
                inner_dict["components"] = component_list
                recipes_list.append(inner_dict)

    return recipes_list

def get_components(page):
    # Locators
    tables = page.locator("table.list.block-1:visible")

    components_list = list()
    table_count = tables.count()
    for i in range(table_count):
        rows = tables.nth(i).locator("tr")
        rows_count = tables.nth(i).locator("tr").count()
        for j in range(rows_count):
            key_raw = rows.nth(j).locator("td").nth(0).locator(".synthesis").all_inner_texts()
            if len(key_raw) > 0:
                key = key_raw[0]

                enemies_raw = rows.nth(j).locator("td").nth(2).text_content()
                enemies_list = list()

                if len(enemies_raw) > 0:
                    for enemy in enemies_raw.split(","):                        
                        enemies_dict = dict()

                        enemy = enemy.replace(u"\xa0", " ").strip()
                        name_re = r"^.+\("
                        lable_rate = r"\(\d+(-|\s+/\s+)?\d*%\)"
                        
                        if re.search(name_re, enemy) and re.search(lable_rate, enemy):
                            
                            enemies_dict["name"] = re.search(name_re, enemy).group().strip("(").strip()
                            enemies_dict["drop_rate"] = re.search(lable_rate, enemy).group().strip("(").strip(")").strip()

                            drop_rates = enemies_dict["drop_rate"].strip("%").split("-")
                            
                            if drop_rates[0].isnumeric():
                                drop_rate_min = int(drop_rates[0])/100
                            else: # Fuck you Bambi
                                drop_rates = enemies_dict["drop_rate"].split("/")
                                drop_rate_min = int(drop_rates[0])/100

                            if len(drop_rates) > 1 and drop_rates[1].isnumeric():
                                drop_rate_max = int(drop_rates[1])/100
                            else:
                                drop_rate_max = drop_rate_min
                        
                            enemies_dict["drop_rate_min"] = drop_rate_min
                            enemies_dict["drop_rate_max"] = drop_rate_max

                            enemies_list.append(enemies_dict)

                if len(enemies_list) > 0: 
                    inner_dict = dict()
                    inner_dict["name"] = key
                    inner_dict["enemies"] = enemies_list
                    components_list.append(inner_dict)

    return components_list

def get_enemies(page):
    # Locators
    tables = page.locator("table.boss.final:visible")

    enemy_list = list()
    table_count = tables.count()
    for i in range(table_count):
        key_raw = tables.nth(i).locator("h2").all_inner_texts()[0]
        locations_raw = tables.nth(i).locator(".location").all_inner_texts()[0]
        
        location_list = list()
        for location in locations_raw.replace(u"\xa0", " ").replace("LOCATION:", "").split(","):
            location_list.append(location.strip())
        
        if len(location_list) > 0:
            inner_dict = dict()
            inner_dict["name"] = key_raw.strip()
            inner_dict["locations"] = location_list
            enemy_list.append(inner_dict)

    return enemy_list

# TODO: Bambie Summons + Drop Rates 

def get_darkness(p):
    result = dict()

    browser = p.webkit.launch(headless=False)
    
    context = browser.new_context()
    # Start tracing before creating / navigating a page.
    context.tracing.start(screenshots=True, snapshots=True, sources=True)

    recipes_page = browser.new_page()
    recipes_page.goto("https://www.khguides.com/kh/inventory/synthesis/")
    result["recipes"] = get_recipes(recipes_page)

    components_page = browser.new_page()
    components_page.goto("https://www.khguides.com/kh/inventory/items/")
    result["components"] = get_components(components_page)

    enemies_page = browser.new_page()
    enemies_page.goto("https://www.khguides.com/kh/combat/enemies/")
    result["enemies"] = get_enemies(enemies_page)

    with open('darkness.json', 'w', encoding ='utf8') as json_file:
        json.dump(result, json_file, indent = 4)

    browser.close()

    return result

if __name__ == "__main__":
    with sync_playwright() as p:
        print(get_darkness(p))