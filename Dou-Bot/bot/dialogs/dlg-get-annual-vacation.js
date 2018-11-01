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
            console.log("nameEntity: ",nameEntity[0].entity);
            let curUserName=nameEntity[0].entity;
            let proNoun=["he","she","i","we","they","you","them","us","him","her","us","his","their"];
            if(prvUserName==undefined && proNoun.indexOf(curUserName)!= -1 ){
                session.send("I don't understand what you said");
                session.endDialog();        
            }else if(prvUserName==undefined && proNoun.indexOf(curUserName) == -1){
                showAnnualDays(session,curUserName);
                session.userData.userName=curUserName;
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)!= -1 ){
                showAnnualDays(session,prvUserName);
                session.userData.userName=prvUserName;
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)== -1 ){
                showAnnualDays(session,curUserName);
                session.userData.userName=curUserName;
            }
        }else if(nameEntity==null&&prvUserName!=undefined){
            showAnnualDays(session,prvUserName);
            session.userData.userName=prvUserName;
        }
        else{
            session.send("We don't have any information");
            session.endDialog();    
        }
    }
];
function showAnnualDays(session,userName){
    bluePrintApi.getProfilesByFullName(userName)
    .then(res => 
    {
        profiles=res.users;
        if (profiles.length==1){
            bluePrintApi.getAnnualVacationByUserId(profiles[0].usrId)
            .then(annualDays=>{
                if(util.isEmpty(annualDays)){
                    session.send("Sorry we don't have any information about annual days of "+userName);
                    session.endDialog();            
                }else{
                    sendRemainingAnnualVacationDaysInformation(session,annualDays,userName);
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

function createHeroCardAnnualVacation(session,annualDays,userName) {
    return new builder.HeroCard(session)
        .title(userName.toUpperCase())
        .subtitle("Remaining Days: "+annualDays.currentRemains)
        .images([
            builder.CardImage.create(session, "https://github.com/amido/azure-vector-icons/raw/master/renders/scheduler.png")
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
        .buttons([builder.CardAction.imBack(session, "show me " + profile.usrId+"'s remaining annual leave days.", "Show Remainning Days")]);
}

function sendRemainingAnnualVacationDaysInformation(session, annualDays,userName) {

    var message = new builder.Message(session);
    message.attachmentLayout(builder.AttachmentLayout.carousel);
    var cards = [];
    var heroCard = createHeroCardAnnualVacation(session,annualDays,userName);
    cards.push(heroCard);
    session.userData.userName=userName;

    message.attachments(cards);
    session.send(message);
    session.endDialog();
}