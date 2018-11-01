require('dotenv-extended').load();
require('dotenv').config();
var builder = require('botbuilder');
var fs = require('fs');
let axios = require('axios');
var luisAppId = process.env.LUIS_APP_ID;
var luisAPIKey = process.env.LUIS_SUBSCRIPTION_KEY;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
var bluePrintAPIHostName = process.env.BLUE_PRINT_API_HOST_NAME;
var bluePrintAPIPort=process.env.BLUE_PRINT_API_PORT || 8080;

const DOU_CREATE_LEAVE_REQUEST = "dou.create.leave.request";
const DOU_GET_PROJECTS = "dou.get.projects";
const DOU_GET_TASKS = "dou.get.tasks";
const DOU_GET_BEST_PERSON = "dou.get.best.person";
const DOU_GET_EXPIRED_TASKS = "dou.get.expired.tasks";
const DOU_GET_VACATION_DAYS = "dou.get.vacation.days";
const DOU_GET_POINTS = "dou.get.points";
const DOU_WELCOME = "dou.welcome";
const DOU_GET_PROFILES="dou.get.profiles";
const DOU_GET_WORKING_YEAR="dou.get.working.years";
const DOU_GET_POSITION="dou.get.position";
const DOU_GET_ANNUAL_VACATION_DAYS="dou.get.vacation.days";
const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;
const bluePrintUrl = "http://"+bluePrintAPIHostName+":" + bluePrintAPIPort + "/ml/"

const apiAxios = axios.create({
    baseURL: bluePrintUrl,
    // timeout: 1000
});

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
function isArrayEmpty(arr){
    var result=true;
    if (arr.length == 0) {
        result=true;
    }
    else {
        result=false;
    }
    return result;

}
function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }
    if (!obj) {
        return false;
    }
    return obj != null;
}

function getProfiles(fullname){
    let users = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    const profiles=users.users.filter(user => 
            user.fullName.toString().toLowerCase().indexOf(fullname.toString().toLowerCase()) !== -1
        );
    return profiles;
}
function getEntity(intent,type){
    entities = builder.EntityRecognizer.findAllEntities(intent.entities, type);
    entities_len=entities.map(ent=>ent.entity.length);
    max_len=Math.max(...entities_len);
    entities=entities.filter(ent=>ent.entity.length==max_len);
    console.log(isArrayEmpty(entities))
    return entities;

}


module.exports = {
    isDefined: isDefined,
    isEmpty:isEmpty,
    isArrayEmpty:isArrayEmpty,
    DOU_CREATE_LEAVE_REQUEST : DOU_CREATE_LEAVE_REQUEST,
    DOU_GET_BEST_PERSON : DOU_GET_BEST_PERSON,
    DOU_GET_PROJECTS : DOU_GET_PROJECTS,
    DOU_GET_TASKS : DOU_GET_TASKS,
    DOU_GET_EXPIRED_TASKS : DOU_GET_EXPIRED_TASKS,
    DOU_GET_VACATION_DAYS : DOU_GET_VACATION_DAYS,
    DOU_GET_POINTS : DOU_GET_POINTS,
    DOU_GET_PROFILES : DOU_GET_PROFILES,
    DOU_GET_WORKING_YEAR:DOU_GET_WORKING_YEAR,
    DOU_GET_POSITION:DOU_GET_POSITION,
    DOU_WELCOME : DOU_WELCOME,
    DOU_GET_ANNUAL_VACATION_DAYS:DOU_GET_ANNUAL_VACATION_DAYS,
    LuisModelUrl:LuisModelUrl,
    apiAxios:apiAxios,
    getProfiles:getProfiles,
    getEntity:getEntity
};
