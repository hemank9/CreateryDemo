// api/_petpooja-menu.js
// Builds and sends the Menu Push payload to Petpooja, and parses the response
// to build our id-mapping table.

import { MENU, CATEGORIES, ADDON_GROUPS, getCategoryId } from "./_menu-data.js";

// Per the sandbox config: Menu Sharing Endpoint is Base URL + "/pushmenu"
const PETPOOJA_PUSHMENU_URL = "https://developerapi.petpooja.com/pushmenu";

function buildMenuPayload() {
  const categories = CATEGORIES.map((cat) => ({
    categoryid: cat.id,
    categoryname: cat.name,
    active: "1",
  }));

  const items = MENU.map((item) => {
    const variationGroups = [];
    if (item.x) {
      Object.entries(item.x).forEach(([groupKey, options]) => {
        variationGroups.push({
          groupname: groupKey,
          variations: options.map((opt, i) => {
            const m = opt.match(/\+(\d+)/);
            const extra = m ? Number(m[1]) : 0;
            return {
              id: `${item.id}_${groupKey}_${i}`,
              name: opt.replace(/\s*\+\d+/, ""),
              price: (item.p + extra).toFixed(2),
            };
          }),
        });
      });
    }

    return {
      itemid: String(item.id),
      itemname: item.n,
      price: item.p.toFixed(2),
      categoryid: getCategoryId(item.c),
      active: "1",
      item_addon_group_id: item.addonGroup || "",
      variation_groups: variationGroups,
    };
  });

  return {
    app_key: process.env.PETPOOJA_APP_KEY,
    app_secret: process.env.PETPOOJA_APP_SECRET,
    access_token: process.env.PETPOOJA_ACCESS_TOKEN,
    restID: process.env.PETPOOJA_REST_ID,
    categories,
    items,
    addongroups: ADDON_GROUPS.map((g) => ({
      addongroupid: g.id,
      addongroupname: g.name,
      addongroupitems: g.items.map((i) => ({
        addonitemid: i.id,
        addonitemname: i.name,
        addonitemprice: i.price,
        active: "1",
      })),
    })),
  };
}

async function pushMenuToPetpooja() {
  const payload = buildMenuPayload();

  const res = await fetch(PETPOOJA_PUSHMENU_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`Menu push failed: ${res.status} ${JSON.stringify(data)}`);
  }

  return data;
}

export { buildMenuPayload, pushMenuToPetpooja };
