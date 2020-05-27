const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;
// 功能： NookeaRoom内留言，互相提醒
exports.main = async (event, context) => {
  let { OPENID, APPID, UNIONID } = cloud.getWXContext();
  // selling/buying.rooms 下需要: productid{description:Str, img_url:Str, isUpdated:bool, roomId:Str, timestamp:Str, zh_name:Str}
  // Event: isMaster senderName reciverId infomation(对话) productid img_url roomId timestamp zh_name(of product)
  let { isMaster, senderName, reciverId, infomation, productid } = event;
  let info = {};
  info.img_url = event.img_url;
  info.roomId = event.roomId;
  info.timestamp = event.timestamp;
  info.zh_name = event.zh_name;
  info.description = senderName + " 刚刚回复了你: " + infomation;
  info.isUpdated = true;
  console.log("info:");
  console.log(info);
  console.log(reciverId);
  if (isMaster) {
    // master的留言 -> send to slave的我的留言
    let path = "tradeHistory.buying.rooms." + productid;
    console.log(path);
    db.collection("UsersProfile")
      .where({
        _openid: reciverId,
      })
      .update({
        data: {
          [path]: info,
          "tradeHistory.isUpdated": true,
          "tradeHistory.buying.isUpdated": true,
        },
      })
      .then((res) => {
        console.log("send to slave: suceess");
        console.log(res);
      })
      .catch((res) => {
        console.log("send to slave: fail");
        console.log(res);
      });
  } else {
    // slave的留言 => send to master的我的出售
    let path = "tradeHistory.selling.rooms." + productid;
    console.log(path);

    db.collection("UsersProfile")
      .where({
        _openid: reciverId,
      })
      .update({
        data: {
          [path]: info,
          "tradeHistory.isUpdated": true,
          "tradeHistory.selling.isUpdated": true,
        },
      })
      .then((res) => {
        console.log("send to master: suceess");
      })
      .catch((res) => {
        console.log("send to master: fail");
        console.log(res);
      });
  }
  return null;
};
