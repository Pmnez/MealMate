const { TeamsFxBot } = require("@microsoft/teamsfx");
const menuCommand = require("./commands/menuCommand");
const bookCommand = require("./commands/bookCommand");
const statusCommand = require("./commands/statusCommand");
const adminCommand = require("./commands/adminCommand");

class MealMateBot extends TeamsFxBot {
  constructor() {
    super();
    this.registerCommand(menuCommand);
    this.registerCommand(bookCommand);
    this.registerCommand(statusCommand);
    this.registerCommand(adminCommand);
  }
}

module.exports = { MealMateBot };