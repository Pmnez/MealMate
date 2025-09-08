const { CardFactory } = require("botbuilder");
const menuCard = require("../adaptiveCards/menuCard.json");
const sp = require("../internal/sharePointService");

module.exports = {
  name: "menu",
  description: "Show today’s menu",
  /**
   * Shows an adaptive card with current menu pulled from SharePoint (if configured).
   */
  async run(context, message) {
    // Try to replace placeholders with real menu items from SharePoint (if available)
    try {
      const menu = await sp.getMenu();
      if (menu && menu.length) {
        // menu is expected as: [{mealType:'breakfast', items:[...]}, ...]
        const card = JSON.parse(JSON.stringify(menuCard));
        // Default choices for items
        const itemChoices = (mealType) => {
          const found = menu.find(m => m.mealType === mealType);
          const items = (found?.items || []).slice(0,5);
          if (!items.length) return card.body[3].choices; // fallback
          return items.map((t, i) => ({ title: t, value: String(i+1) }));
        };
        // Ensure "mealType" stays as is, but map "mealItem" choices dynamically based on default = breakfast
        // We'll keep a generic list; actual picked mealType is validated on submit
        card.body[3].choices = itemChoices("breakfast");
        await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
        return;
      }
    } catch (e) {
      // ignore and fall back
    }
    await context.sendActivity({ attachments: [CardFactory.adaptiveCard(menuCard)] });
  }
};