// @ts-ignore
const constants = require('../constants');
function computeType(type=0){
    return Object.keys(constants.ApplicationCommandOptionType).find(key=>type === constants.ApplicationCommandOptionType[key]);
}
function validateSnowflake(snowflake){
    return typeof snowflake === "string" && snowflake.length>16 && snowflake.length<20
}
function resolveAll(arr){
    return Promise.all(arr.map(x=>new Promise(r=>x.catch(_=>console.log("Failed doing Something.")).then(r))))

}
module.exports = {computeType, validateSnowflake, resolveAll};