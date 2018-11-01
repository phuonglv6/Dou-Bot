var util   = require('../util/utility');

async function getProfilesByFullName(fullName){
  profiles = await util.apiAxios.post('/get-profile-by-fullname', {
        "fullName": fullName
      });
  // console.log(profiles);
  return profiles.data;
}
async function getProjectsByUserId(userId){
  let projects=[];
  projects= await util.apiAxios.post('/get-user-projects', {
    "usrId": userId
  })
  // console.log(projects);
  return projects.data.projects;

}
async function getTasksByUserId(userId){
    let tasks=[];
    tasks= await util.apiAxios.post('/tasks-user-project', {
      "usrId": userId
    })
    // console.log(tasks);
    return tasks.data.tasks;
}

async function getAnnualVacationByUserId(userId){
  remainning_day=await util.apiAxios.post('/user-remain-days', {
    "usrId": userId
  });
  return remainning_day.data.days;
}
async function getExpiredTasksByUserId(userId){
  let expiredTasks=[];
  expiredTasks= await util.apiAxios.post('/get-tasks-due-date', {
    "usrId": userId
  })
  // console.log("expiredTasks: ");
  // console.log(expiredTasks);
  return expiredTasks.data.tasks;
}
module.exports = {
  getProfilesByFullName:getProfilesByFullName,
  getProjectsByUserId:getProjectsByUserId,
  getTasksByUserId:getTasksByUserId,
  getAnnualVacationByUserId:getAnnualVacationByUserId,
  getExpiredTasksByUserId:getExpiredTasksByUserId

}
