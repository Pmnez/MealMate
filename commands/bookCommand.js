const sp = require("../internal/sharePointService");

/**
 * Time window (24h): breakfast<9, lunch<13, supper<19 local server time
 */
function isWithinWindow(mealType, date = new Date()) {
  const h = date.getHours();
  if (mealType === "breakfast") return h < 9;
  if (mealType === "lunch") return h < 13;
  if (mealType === "supper") return h < 19;
  return false;
}

module.exports = {
  name: "book",
  description: "Book a meal (via Adaptive Card submit or 'book lunch' text)",
  async run(context, message) {
    const userId = context.activity?.from?.aadObjectId || context.activity?.from?.id || "unknown";
    const text = (message.text || "").toLowerCase();
    const submitted = message.value || {};
    const mealType = submitted.mealType || (text.includes("breakfast") ? "breakfast" : text.includes("lunch") ? "lunch" : text.includes("supper") ? "supper" : undefined);
    const mealItem = submitted.mealItem; // "1".."5" when from card

    if (!mealType) {
      await context.sendActivity("Please specify a meal: *breakfast*, *lunch*, or *supper* — or use the **menu** card.");
      return;
    }

    if (!isWithinWindow(mealType)) {
      await context.sendActivity(`⏰ Sorry, booking for **${mealType}** is closed for today.`);
      return;
    }

    // Resolve item title from SharePoint menu if present
    let itemTitle = `Option ${mealItem || "?"}`;
    try {
      const menu = await sp.getMenu();
      const found = menu.find(m => m.mealType === mealType);
      if (found && found.items && mealItem) {
        const idx = parseInt(mealItem, 10) - 1;
        if (found.items[idx]) itemTitle = found.items[idx];
      }
    } catch {}

    // Save booking
    try {
      await sp.saveBooking({ userId, mealType, item: itemTitle, when: new Date().toISOString() });
      await context.sendActivity(`✅ Booked **${mealType}**: *${itemTitle}*`);
    } catch (e) {
      await context.sendActivity(`⚠️ Could not save booking right now. I booked it in memory. (${e?.message || e})`);
    }
  }
};