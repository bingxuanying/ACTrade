const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;
// 功能： NookeaRoom内留言，互相提醒
exports.main = async (event, context) => {
  
}