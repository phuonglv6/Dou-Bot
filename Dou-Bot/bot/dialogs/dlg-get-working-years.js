require('dotenv-extended').load();
require('dotenv').config();
var util   = require("../../util/utility");
var bluePrintAPIHostName = process.env.BLUE_PRINT_API_HOST_NAME || 'blueprint.dounets.com';
var bluePrintAPIPort=process.env.BLUE_PRINT_API_PORT || 8080;
let axios = require('axios');
var builder = require('botbuilder');

module.exports = [
    function (session,args) {
        let userId=session.message.address.user.id;
        let bluePrintUrl = "http://"+bluePrintAPIHostName+":" + bluePrintAPIPort+"/chatapi/"+userId+"/userProjects";
        let intent = args.intent;
        let nameEntity = builder.EntityRecognizer.findEntity(intent.entities, 'EmployeeName');
        let prvUserName=session.userData.userName;
        console.log("prvUserName: ",prvUserName);
        if(nameEntity!=null){
            console.log("nameEntity: ",nameEntity.entity);
            let curUserName=nameEntity.entity;
            let proNoun=["he","she","i","we","they","you","them","us","him","her","us","his"];
            if(prvUserName==undefined && proNoun.indexOf(curUserName)!= -1 )
            {
                session.send("I don't understand what you said");
                session.endDialog();        
            }else if(prvUserName==undefined && proNoun.indexOf(curUserName) == -1){
                let profiles=util.getProfiles(curUserName);
                if(util.isArrayEmpty(profiles)){
                    session.send("Sorry we don't have any information about the working year of "+curUserName);
                    session.endDialog();            
                }else{
                    sendWorkingYears(session,profiles);
                }
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)!= -1 ){
                let profiles=util.getProfiles(prvUserName);
                if(util.isArrayEmpty(profiles)){
                    session.send("Sorry we don't have any information about the working year of "+prvUserName);
                    session.endDialog();            
                }else{
                    sendWorkingYears(session,profiles);
                }
            }else if(prvUserName!=undefined && proNoun.indexOf(curUserName)== -1 ){
                let profiles=util.getProfiles(curUserName);
                if(util.isArrayEmpty(profiles)){
                    session.send("Sorry we don't have any information about the working year of "+curUserName);
                    session.endDialog();            
                }else{
                    sendWorkingYears(session,profiles);
                }
                session.userData.userName=curUserName;
            }

        }else if(nameEntity==null&&prvUserName!=undefined){
            let profiles=util.getProfiles(prvUserName);
                if(util.isArrayEmpty(profiles)){
                    session.send("Sorry we don't have any information about the working year of "+prvUserName);
                    session.endDialog();            
                }else{
                    sendWorkingYears(session,profiles);
                }
        }
        else{
            session.send("We don't have any information");
            session.endDialog();    
        }
    }
];
function createThumbnailCard(session,profile) {
    console.log("createThumbnailCard: ",profile);
    return new builder.ThumbnailCard(session)
        .title(profile.fullName)
        .subtitle('<strong>Full Name:</strong> '+profile.fullName+"<br><strong>Working Years:</strong> "+profile.workingYears)
        .images([
            builder.CardImage.create(session, profile.image_url)
        ]);
}
function createHeroCard(session,profile) {
    console.log("Hero profile: ",profile);
    return new builder.HeroCard(session)
        .images([builder.CardImage.create(session, profile.image_url)])
        .title(profile.fullName)
        .subtitle("Working Years: "+profile.workingYears);
}

function sendWorkingYears(session, profiles) {
    if (profiles.length>0){
        sendWorkingYearInformation(session,profiles);
    }
}


function sendWorkingYearInformation(session, profiles) {

    var message = new builder.Message(session);
    message.attachmentLayout(builder.AttachmentLayout.carousel);
    var cards = [];
    if (profiles.length>1){
        for (var profileIterator = 0; profileIterator < profiles.length; ++profileIterator) {
            var profile = profiles[profileIterator];    
            var heroCard = createHeroCard(session,profile);
            cards.push(heroCard);
        }    
    }else{
        var thumbnailCard = createThumbnailCard(session,profiles[0]);
        cards.push(thumbnailCard);
        session.userData.userName=profiles[0].fullName;
    }
    message.attachments(cards);
    session.send(message);
    session.endDialog();
}