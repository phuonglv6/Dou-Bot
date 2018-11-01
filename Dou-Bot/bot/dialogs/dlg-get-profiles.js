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
            console.log("nameEntity: ",nameEntity[0].entity);
            let curUserName=nameEntity[0].entity;
            let proNoun=["he","she","i","we","they","you","them","us","him","her","us","his","their"];
            if(prvUserName==undefined && proNoun.indexOf(curUserName)!= -1 ){
                session.send("I don't understand what you said");
                session.endDialog();        
            }else if(prvUserName==undefined && proNoun.indexOf(curUserName) == -1){
                showProfiles(session,curUserName);
                session.userData.userName=curUserName;
                
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)!= -1 ){
                showProfiles(session,prvUserName);
                session.userData.userName=prvUserName;

            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)== -1 ){
                showProfiles(session,curUserName);
                session.userData.userName=curUserName;
            }
        }else if(nameEntity==null&&prvUserName!=undefined){
            showProfiles(session,prvUserName);
            session.userData.userName=prvUserName;
        }else{
            session.send("We don't have any information");
            session.endDialog();    
        }
    }
];
function showProfiles(session,userName){
    bluePrintApi.getProfilesByFullName(userName)
    .then(res => {
        profiles=res.users;
        if(util.isArrayEmpty(profiles)){
            session.send("Sorry we don't have any profiles of "+userName);
            session.endDialog();            
        }else{
            sendProfiles(session,profiles);
        }           
    });
}

function createHeroCard(session,profile) {
    return new builder.HeroCard(session)
        .images([
            builder.CardImage.create(session, "https://dou-assistant.herokuapp.com/images/"+profile.usrId+"/"+profile.usrId+".jpg")
        ])        
        .title(profile.fullNm)
        .subtitle('UserName: '+profile.usrId)
        .text("BirthDay: "+profile.brdyVal);
}

function sendProfiles(session, profiles) {
    if (profiles.length>0){
        sendProfileInformation(session,profiles);
    }
}

function sendProfileInformation(session, profiles) {

    var message = new builder.Message(session);
    message.attachmentLayout(builder.AttachmentLayout.carousel);
    var cards = [];
    if (profiles.length>1){
        for (var i = 0; i < profiles.length; ++i) {
            var profile = profiles[i];    
            var heroCard = createHeroCard(session,profile);
            cards.push(heroCard);
        }    
    }else{
        var heroCard = createHeroCard(session,profiles[0]);
        cards.push(heroCard);
        session.userData.userName=profiles[0].fullNm;
    }
    message.attachments(cards);
    session.send(message);
    session.endDialog();
}