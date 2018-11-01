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
        console.log(nameEntity)
        let prvUserName=session.userData.userName;
        console.log("prvUserName: ",prvUserName);
        if(!util.isArrayEmpty(nameEntity)){
            let curUserName=nameEntity[0].entity;
            console.log("curUserName: ",curUserName);
            let proNoun=["he","she","i","we","they","you","them","us","him","her","us","his","their"];
            if(prvUserName==undefined && proNoun.indexOf(curUserName)!= -1 )
            {
                session.send("I don't understand what you said");
                session.endDialog();        
            }else if(prvUserName==undefined && proNoun.indexOf(curUserName) == -1){
                showTasks(session,curUserName);
                session.userData.userName=curUserName;
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)!= -1 ){
                showTasks(session,prvUserName);
                session.userData.userName=prvUserName;
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)== -1 ){
                showTasks(session,curUserName);
                session.userData.userName=curUserName;
            }
        }
        else if(nameEntity==null&&prvUserName!=undefined){
            showTasks(session,prvUserName);
            session.userData.userName=prvUserName;

        }
        else{
            session.send("We don't have any information");
            session.endDialog();    
        }
    }
];

function showTasks(session,userName){
    bluePrintApi.getProfilesByFullName(userName)
    .then(res => {
        profiles=res.users;
        if (profiles.length==1){
            bluePrintApi.getTasksByUserId(profiles[0].usrId)
            .then(tasks=>{
                if(util.isArrayEmpty(tasks)){
                    session.send("Sorry "+userName+" don't any tasks at this time");
                    session.endDialog();            
                }else{
                    sendTasks(session,tasks,userName);
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

function createHeroCardTask(session,tasks,userName) {
    return new builder.HeroCard(session)
        .title(userName.toUpperCase())
        .subtitle('Task Name: '+tasks.taskNm)
        .text("Project : "+tasks.pjtNm)
        .images([
            builder.CardImage.create(session, "https://dou-assistant.herokuapp.com/images/task-icon.png")
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
            builder.CardImage.create(session,"https://dou-assistant.herokuapp.com/images/"+profile.usrId+"/"+profile.usrId+".jpg")
        ])        
        .title(profile.fullNm)
        .subtitle(profile.usrId)
        .buttons([builder.CardAction.imBack(session, "show me " + profile.usrId+"'s task", "Show Tasks")]);
}

function sendTasks(session, tasks,userName) {
    if (tasks.length>0){
        sendTaskInformation(session,tasks,userName);
    }
}

function sendTaskInformation(session, tasks,userName) {
    var message = new builder.Message(session);
    message.attachmentLayout(builder.AttachmentLayout.carousel);
    var cards = [];
    if (tasks.length>1){
        for (var i = 0; i < tasks.length; ++i) {
            var task = tasks[i];    
            var heroCard = createHeroCardTask (session,task,userName);
            cards.push(heroCard);
        }    
    }else if(tasks.length==1){
        var heroCard = createHeroCardTask(session,tasks[0],userName);
        cards.push(heroCard);
        session.userData.userName=userName;
    }
    message.attachments(cards);
    session.send(message);
    session.endDialog();
}