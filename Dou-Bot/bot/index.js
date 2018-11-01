var builder = require('botbuilder');
var siteUrl = require('./site-url');
var util   = require('../util/utility');
var mongoLib = require("../db/mongo-db-client.js");
var botbuilder_azure = require("botbuilder-azure");

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


// Bot Storage: Here we register the state storage for your bot. 
// Default store: volatile in-memory store - Only for prototyping!
// We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
// For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
// var inMemoryStorage = new builder.MemoryBotStorage();
const mongoDbClient = new mongoLib.MongoDbClient();
var mongoStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, mongoDbClient);

var bot = new builder.UniversalBot(connector, function (session) {
    session.beginDialog('welecome');
}).set('storage', mongoStorage); // Register in memory storage

// Enable Conversation Data persistence
bot.set('persistConversationData', true);



// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/');
            }
        });
    }
});

// Connector listener wrapper to capture site url
var connectorListener = connector.listen();
function listen() {
    return function (req, res) {
        // Capture the url for the hosted application
        // We'll later need this url to create the checkout link 
        var url = req.protocol + '://' + req.get('host');
        siteUrl.save(url);
        connectorListener(req, res);
    };
}
// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(util.LuisModelUrl);
bot.recognizer(recognizer);

bot.dialog("welecome",require('./dialogs/dlg-welcome'))
.triggerAction({
    matches: util.DOU_WELCOME});

bot.dialog("get-profiles",require('./dialogs/dlg-get-profiles'))
.triggerAction({
    matches: util.DOU_GET_PROFILES
});

bot.dialog("get-working-years",require('./dialogs/dlg-get-working-years'))
.triggerAction({
    matches: util.DOU_GET_WORKING_YEAR
});

bot.dialog("get-position",require('./dialogs/dlg-get-position'))
.triggerAction({
    matches: util.DOU_GET_POSITION
});
bot.dialog("get-annual-vacation-days",require('./dialogs/dlg-get-annual-vacation'))
.triggerAction({
    matches: util.DOU_GET_ANNUAL_VACATION_DAYS
});


bot.dialog("get-projects",require('./dialogs/dlg-get-projects'))
.triggerAction({
    matches: util.DOU_GET_PROJECTS
});

bot.dialog("get-tasks",require('./dialogs/dlg-get-tasks'))
.triggerAction({
    matches: util.DOU_GET_TASKS
});
bot.dialog("get-expired-tasks",require('./dialogs/dlg-get-expired-tasks'))
.triggerAction({
    matches: util.DOU_GET_EXPIRED_TASKS
});


// Other wrapper functions
function beginDialog(address, dialogId, dialogArgs) {
    bot.beginDialog(address, dialogId, dialogArgs);
}

function sendMessage(message) {
    bot.send(message);
}

module.exports = {
    listen: listen,
    beginDialog: beginDialog,
    sendMessage: sendMessage
};