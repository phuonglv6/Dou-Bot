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
            console.log("curUserName: ",nameEntity[0].entity);
            let curUserName=nameEntity[0].entity;

            let proNoun=["he","she","i","we","they","you","them","us","him","her","us","his","their"];
            if(prvUserName==undefined && proNoun.indexOf(curUserName)!= -1 ){
                session.send("I don't understand what you said");
                session.endDialog();        
            }else if(prvUserName==undefined && proNoun.indexOf(curUserName) == -1){
                showProjects(session,curUserName);
                session.userData.userName=curUserName;
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)!= -1 ){
                showProjects(session,prvUserName);
                session.userData.userName=prvUserName;
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)== -1 ){
                showProjects(session,curUserName);
                session.userData.userName=curUserName;
            }
        }else if(nameEntity==null&&prvUserName!=undefined){
            showProjects(session,prvUserName);
            session.userData.userName=prvUserName;

        }else{
            session.send("We don't have any information");
            session.endDialog();    
        }

    }
];

function showProjects(session,userName){
    bluePrintApi.getProfilesByFullName(userName)
    .then(res => {
        profiles=res.users;
        if (profiles.length==1){
            bluePrintApi.getProjectsByUserId(profiles[0].usrId)
            .then(projects=>{
                if(util.isArrayEmpty(projects)){
                    session.send("Sorry "+userName+" don't have any projects at this time");
                    session.endDialog();            
                }else{
                    sendProjects(session,projects,userName);
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
function createHeroCardProject(session,projects,userName) {
    return new builder.HeroCard(session)
    .images([
        builder.CardImage.create(session, "https://dou-assistant.herokuapp.com/images/project-icon.png")
    ])
    .title(userName.toUpperCase())
    .subtitle('Project Name: '+projects.pjtNm)
    .text("Project Description: "+projects.pjtId);
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
        .buttons([builder.CardAction.imBack(session, "show me " + profile.usrId+"'s project", "Show Projects")]);
}

function sendProjects(session, projects,userName) {
    if (projects.length>0){
        sendProjectInformation(session,projects,userName);
    }
}


function sendProjectInformation(session, projects,userName) {
    var message = new builder.Message(session);
    message.attachmentLayout(builder.AttachmentLayout.carousel);
    var cards = [];
    if (projects.length>1){
        for (var i = 0; i < projects.length; ++i) {
            var project = projects[i];    
            var heroCard = createHeroCardProject(session,project,userName);
            cards.push(heroCard);
        }    
    }else{
        var heroCard = createHeroCardProject(session,projects[0],userName);
        cards.push(heroCard);
        session.userData.userName=userName;
    }
    message.attachments(cards);
    session.send(message);
    session.endDialog();
}