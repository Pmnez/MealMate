// index.js
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

// Send adaptive card
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

function createMenuCard(meal, items) {
  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          body: [
            { type: "TextBlock", text: `🍽 Select your ${meal}:`, weight: "bolder", size: "medium" }
          ],
          actions: items.map(item => ({
            type: "Action.Submit",
            title: item,
            data: { meal, item }
          })),
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.4"
        }
      }
    ]
  };
}

// Bot logic
async function botLogic(context) {
  if (context.activity.type === "message") {
    const text = (context.activity.text || "").toLowerCase();

    if (text.includes("book meal")) {
      await context.sendActivity(createMealCard());
    } else {
      await context.sendActivity("Type **book meal** to start your booking 🍴");
    }
  } else if (context.activity.value) {
    const { meal, item } = context.activity.value;

    if (meal && !item) {
      // Validate booking time
      const hour = new Date().getHours();
      const window = bookingWindows[meal];

      if (hour >= window.start && hour < window.end) {
        await context.sendActivity(createMenuCard(meal, menus[meal]));
      } else {
        await context.sendActivity(`⏰ Sorry, ${meal} booking is closed.`);
      }
    }

    if (meal && item) {
      await context.sendActivity(`✅ You booked **${item}** for **${meal}**. Enjoy your meal!`);
    }
  }
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
