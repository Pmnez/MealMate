require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require("botbuilder");

const app = express();
const port = process.env.PORT || 3978;

// Create adapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword
});

// Catch-all for errors
adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError]: ${error}`);
  await context.sendActivity("Oops! Something went wrong.");
};

// Memory storage
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = conversationState.createProperty("mealBooking");

// Booking times
const bookingWindows = {
  Breakfast: { start: 5, end: 9 },
  Lunch: { start: 10, end: 14 },
  Supper: { start: 17, end: 21 }
};

// Meal menus
const menus = {
  Breakfast: ["Pancakes", "Omelette", "Porridge", "Fruit Salad", "Tea & Toast"],
  Lunch: ["Chicken & Rice", "Beef Stew", "Vegetable Curry", "Fish & Ugali", "Pasta Salad"],
  Supper: ["Grilled Fish", "Chapati & Beans", "Beef Stir Fry", "Vegetable Soup", "Rice & Lentils"]
};

// Send meal selection card
function createMealCard() {
  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          body: [
            { type: "TextBlock", text: "🍴 Please select a meal:", weight: "bolder", size: "medium" }
          ],
          actions: [
            { type: "Action.Submit", title: "Breakfast", data: { meal: "Breakfast" } },
            { type: "Action.Submit", title: "Lunch", data: { meal: "Lunch" } },
            { type: "Action.Submit", title: "Supper", data: { meal: "Supper" } }
          ],
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.4"
        }
      }
    ]
  };
}

// Bot logic
async function botLogic(context) {
  const state = await userState.get(context, { meal: null, awaitingNumber: false });

  if (context.activity.type === "message") {
    const text = (context.activity.text || "").trim().toLowerCase();

    if (state.awaitingNumber && !isNaN(text)) {
      const choice = parseInt(text);
      const items = menus[state.meal];
      if (choice >= 1 && choice <= items.length) {
        const item = items[choice - 1];
        await context.sendActivity(`✅ You booked **${item}** for **${state.meal}**. Enjoy your meal and have a nice moment! 🎉`);
        state.awaitingNumber = false;
        state.meal = null;
      } else {
        await context.sendActivity("⚠️ Please enter a number between 1 and 5.");
      }
      return;
    }

    if (text.includes("book meal")) {
      await context.sendActivity(createMealCard());
    } else {
      await context.sendActivity("Type **book meal** to start your booking 🍴");
    }
  } else if (context.activity.value) {
    const { meal } = context.activity.value;

    if (meal) {
      // Validate booking time
      const hour = new Date().getHours();
      const window = bookingWindows[meal];

      if (hour >= window.start && hour < window.end) {
        const items = menus[meal]
          .map((item, i) => `${i + 1}. ${item}`)
          .join("\n");

        await context.sendActivity(`🍽 Here is the ${meal} menu:\n${items}\n\n👉 Please reply with the number (1–5) of your choice.`);
        state.meal = meal;
        state.awaitingNumber = true;
      } else {
        await context.sendActivity(
          `⏰ Sorry, ${meal} booking is closed.\n\nBooking windows are:\n- Breakfast: 5–9\n- Lunch: 10–14\n- Supper: 17–21`
        );
      }
    }
  }

  await conversationState.saveChanges(context);
}

// Middleware
app.use(bodyParser.json());

// Messages endpoint
app.post("/api/messages", (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await botLogic(context);
  });
});

// Start server
app.get("/", (req, res) => {
  res.send("✅ MealMate Bot is running! Use Bot Framework Emulator or Teams to chat.");
});
app.listen(port, () => {
  console.log(`\nMealMate Bot running on http://localhost:${port}`);
});
