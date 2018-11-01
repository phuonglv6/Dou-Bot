require('dotenv-extended').load();
require('dotenv').config();
var util   = require("../../util/utility");
var bluePrintApi   = require("../../api/blue_print_api");
var builder = require('botbuilder');

module.exports = [
    function (session,args) {
        let userId=session.message.address.user.id;
        let intent = args.intent;
        let nameEntity= util.getEntity(intent,'EmployeeName');
        let prvUserName=session.userData.userName;
        console.log("prvUserName: ",prvUserName);
        if(!util.isArrayEmpty(nameEntity)){
            let curUserName=nameEntity[0].entity;
            let proNoun=["he","she","i","we","they","you","them","us","him","her","us","his","their"];
            if(prvUserName==undefined && proNoun.indexOf(curUserName)!= -1 )
            {
                session.send("I don't understand what you said");
                session.endDialog();        
            }else if(prvUserName==undefined && proNoun.indexOf(curUserName) == -1){
                showExpiredTasks(session,curUserName);
                session.userData.userName=curUserName;
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)!= -1 ){
                showExpiredTasks(session,prvUserName);
                session.userData.userName=prvUserName;
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)== -1 ){
                showExpiredTasks(session,curUserName);
                session.userData.userName=curUserName;
            }
        }
        else if(nameEntity==null&&prvUserName!=undefined){
            showExpiredTasks(session,prvUserName);
            session.userData.userName=prvUserName;
        }
        else{
            session.send("We don't have any information");
            session.endDialog();    
        }
    }
];

function showExpiredTasks(session,userName){
    bluePrintApi.getProfilesByFullName(userName)
    .then(res => {
        profiles=res.users;
        if (profiles.length==1){
            bluePrintApi.getExpiredTasksByUserId(profiles[0].usrId)
            .then(ExpiredTasks=>{
                if(util.isArrayEmpty(ExpiredTasks)){
                    session.send("Sorry "+userName+" don't have any expired tasks at this time");
                    session.endDialog();            
                }else{
                    sendExpiredTasks(session,ExpiredTasks,userName);
                }            
            });
        }else if(profiles.length>1){
            createHeroCardProfiles(session,profiles);                      
        }else{
            session.send("Sorry user: "+ userName+" don't exist in the system");
            session.endDialog();            
        }           
    });

}

function createHeroCardExpiredTask(session,ExpiredTasks,userName) {
    return new builder.HeroCard(session)
        .title(userName.toUpperCase())
        .subtitle('Task Name: '+ExpiredTasks.taskNm)
        .text("DueDate : "+ExpiredTasks.strPlnDueDt)
        .images([
            builder.CardImage.create(session, "https://dou-assistant.herokuapp.com/images/expired_task-icon.png")
        ]);
}

function createHeroCardProfiles(session,profiles){
    var message = new builder.Message(session);
    message.attachmentLayout(builder.AttachmentLayout.carousel);
    var cards = [];
    for (var i = 0; i < profiles.length; ++i) {
        var profile = profiles[i];    
        var heroCard = createHeroCardProfile(session,profile);
        cards.push(heroCard);
    }
    message.attachments(cards);
    session.send(message);
    session.endDialog();
    
}

function createHeroCardProfile(session,profile) {
    console.log(profile);
    return new builder.HeroCard(session)
        .images([
            builder.CardImage.create(session, "https://dou-assistant.herokuapp.com/images/"+profile.usrId+"/"+profile.usrId+".jpg")
        ])        
        .title(profile.fullNm)
        .subtitle(profile.usrId)
        .buttons([builder.CardAction.imBack(session, "show me " + profile.usrId+"'s expired task", "Show Expired Tasks")]);
}



function sendExpiredTasks(session, ExpiredTasks,userName) {
    if (ExpiredTasks.length>0){
        sendExpiredTaskInformation(session,ExpiredTasks,userName);
    }
}

function sendExpiredTaskInformation(session, ExpiredTasks,userName) {
    var message = new builder.Message(session);
    message.attachmentLayout(builder.AttachmentLayout.carousel);
    var cards = [];
    if (ExpiredTasks.length>1){
        for (var i = 0; i < ExpiredTasks.length; ++i) {
            var ExpiredTask = ExpiredTasks[i];    
            var heroCard = createHeroCardExpiredTask(session,ExpiredTask,userName);
            cards.push(heroCard);
        }    
    }else if(ExpiredTasks.length==1){
        var heroCard = createHeroCardExpiredTask(session,ExpiredTasks[0],userName);
        cards.push(heroCard);
        session.userData.userName=userName;
    }
    message.attachments(cards);
    session.send(message);
    session.endDialog();
}