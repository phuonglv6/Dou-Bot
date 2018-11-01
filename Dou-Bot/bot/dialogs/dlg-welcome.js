
var builder = require('botbuilder');
var DialogLabels = {
    LeaveRequest:"Create leave request",
    Tasks:"Get tasks",
    Projects:"Get projects",
    ExpiredTasks:"Get expired tasks",
    Point:"Get my point",
    BestPerson:"Get best person"

};
var welcome="Hello, I’m Dou Assistant. Can i help you?<br>"
           +" *Type something* and hit _enter to send your message.\n"
           +"If you’re not sure how to do something in Dou Assistant, *just type your question below*."
           +" I'll do my best to help!";
function sendWelcomeInformation(session, dlgnames) {
    session.send(welcome);
    var message = new builder.Message(session);
    // message.attachmentLayout(builder.AttachmentLayout.carousel);
    // var cards = [];
    // for (var key in DialogLabels) {
    //     if (DialogLabels.hasOwnProperty(key)) {
    //        var heroCard = new builder.HeroCard(session);
    //        heroCard.buttons([builder.CardAction.imBack(session, "i want to "+DialogLabels[key], DialogLabels[key])]);
    //        cards.push(heroCard);
    //     }
    // }
    // message.attachments(cards);
    session.send(message);
    session.endDialog();
}
module.exports = [
    function (session) {
        sendWelcomeInformation(session,DialogLabels);
    }
];

