const sp = require("../internal/sharePointService");

module.exports = {
  name: "status",
  description: "Show your booking status for today",
  async run(context, message) {
    const userId = context.activity?.from?.aadObjectId || context.activity?.from?.id || "unknown";
    const today = new Date().toISOString().slice(0,10);
    try {
      const bookings = await sp.getBookingsForUser(userId, today);
      if (!bookings.length) {
        await context.sendActivity("📭 No bookings for today. Type **menu** to book.");
        return;
      }
      const lines = bookings.map(b => `• ${b.mealType}: ${b.item}`);
      await context.sendActivity("📋 Your bookings today:\n" + lines.join("\n"));
    } catch (e) {
      await context.sendActivity("Couldn't load your bookings yet. Try again later.");
    }
  }
};