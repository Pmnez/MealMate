const sp = require("../internal/sharePointService");

/**
 * Admin command usage:
 * - "admin set breakfast: Eggs; Porridge; Fruit; Tea; Coffee"
 * - "admin set lunch: Rice & Beans; Chicken; Salad; Juice; Chapati"
 * - "admin set supper: Ugali; Fish; Sukuma; Beef Stew; Water"
 */
module.exports = {
  name: "admin",
  description: "Admin: add or edit menu items (5 max)",
  async run(context, message) {
    const text = (message.text || "").toLowerCase();
    const match = text.match(/admin\s+set\s+(breakfast|lunch|supper)\s*:\s*(.+)$/i);
    if (!match) {
      await context.sendActivity("⚙️ Admin usage:\n`admin set lunch: Item1; Item2; Item3; Item4; Item5`");
      return;
    }
    const mealType = match[1].toLowerCase();
    const items = match[2].split(";").map(s => s.trim()).filter(Boolean).slice(0,5);
    if (!items.length) {
      await context.sendActivity("Please provide up to 5 items separated by semicolons.");
      return;
    }
    try {
      await sp.setMenu(mealType, items);
      await context.sendActivity(`✅ Updated **${mealType}** menu (${items.length} items).`);
    } catch (e) {
      await context.sendActivity(`Couldn't update menu: ${e?.message || e}`);
    }
  }
};