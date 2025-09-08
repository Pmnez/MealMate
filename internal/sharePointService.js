/**
 * SharePoint service (placeholder).
 * Replace the TODO parts to use Microsoft Graph via TeamsFx:
 *  - Create a SharePoint List named "MealMenu" with columns:
 *      MealType (Choice: breakfast|lunch|supper), Items (Multiline text; JSON array string)
 *    And a "MealBookings" list with columns:
 *      UserId (Text), Date (DateOnly), MealType (Text), Item (Text)
 *
 *  - Request Graph scopes in Teams Toolkit: Files.ReadWrite.All or Sites.ReadWrite.All
 *  - Use @microsoft/teamsfx to get a Graph client:
 *      const { createMicrosoftGraphClientWithCredential, IdentityType, TeamsUserCredential } = require("@microsoft/teamsfx");
 *      const credential = new TeamsUserCredential();
 *      const graph = await createMicrosoftGraphClientWithCredential(credential, ["Sites.ReadWrite.All"]);
 *
 *  - Then call Graph endpoints for SharePoint lists (beta or v1.0 as applicable).
 */

// In-memory fallback so the bot works without SharePoint during dev
const memory = {
  menu: {
    breakfast: ["Eggs & Toast", "Porridge", "Fruit Bowl", "Tea & Mandazi", "Cereal"],
    lunch: ["Rice & Chicken", "Pilau", "Githeri", "Chapati & Beans", "Salad"],
    supper: ["Ugali & Fish", "Ugali & Sukuma", "Beef Stew", "Mukimo", "Rice & Beef"]
  },
  bookings: [] // {userId, date, mealType, item}
};

function todayStr(d = new Date()) {
  return d.toISOString().slice(0,10);
}

module.exports = {
  /**
   * Get menu grouped by mealType.
   * Returns: [{mealType, items:[...]}, ...]
   */
  async getMenu() {
    return Object.keys(memory.menu).map(k => ({ mealType: k, items: memory.menu[k] }));
  },

  /**
   * Set menu items for a mealType (max 5).
   */
  async setMenu(mealType, items) {
    memory.menu[mealType] = items.slice(0,5);
    // TODO: Save to SharePoint list "MealMenu"
    return true;
  },

  /**
   * Save a booking for a user (overwrites existing for same day+mealType).
   */
  async saveBooking({ userId, mealType, item, when }) {
    const date = todayStr();
    // Remove any existing booking of same mealType today for this user
    memory.bookings = memory.bookings.filter(b => !(b.userId === userId && b.date === date && b.mealType === mealType));
    memory.bookings.push({ userId, date, mealType, item, when });
    // TODO: Write to SharePoint list "MealBookings"
    return true;
  },

  /**
   * Get today's bookings for a user.
   */
  async getBookingsForUser(userId, date = todayStr()) {
    // TODO: Read from SharePoint list "MealBookings"
    return memory.bookings.filter(b => b.userId === userId && b.date === date);
  }
};