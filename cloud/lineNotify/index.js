const cloud = require("wx-server-sdk");

cloud.init()
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log(event);
  try {
    var OPENID = event.openid,
        password = event.password,
        roomNum = event.roomNum,
        roomId = event.roomId;
        note = event.note
    console.log(OPENID+' '+ password + ' '+ roomNum+' '+ roomId);
    return await cloud.openapi.subscribeMessage
      .send({
        touser: OPENID,
        page: "/pages/roomSlave/roomSlave?room_id=" + roomId,
        lang: "zh_CN",
        // 等新版上线才能使用
        data: {
          character_string1: {
            value: roomNum,
          },
          character_string2: {
            value: password,
          },
          thing3: {
            value: note,
          },
        },
        templateId: "nCLX2VrFKOP_Xg8hrR_mT2tg5Vylbam_cHPrZgOqOrA",
        miniprogramState: "formal",
      })
      .then(
        () => {
          db.collection('UsersProfile')
          .where({
            _openid: OPENID
          })
          .update({
            data:{
              subscription: false
            }
          })
          .then(res=>{
            console.log("进入db.collection.get的then");
          })
          .catch(err =>{ console.log("进入db.collection.get的catch") })
        }, 
        (err) => {
          console.log("进入失败 callbakc");
          console.log(err);
          console.log("失败cb end");
        }
      )
      .catch(err => {
        console.log("send的catch");
        console.log(err);
      })

  } catch (err) {
    console.log(err);
    return err;
  }
};