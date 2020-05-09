const cloud = require("wx-server-sdk");

cloud.init()
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log(event);
  try {
    OPENID = event.openid;
    return await cloud.openapi.subscribeMessage
      .send({
        touser: OPENID,
        page: "tradingFloor",
        lang: "zh_CN",
        data: {
          phrase1: {
            value: "动森排队",
          },
          phrase3: {
            // value: event.roomNum,
            value: "不能英文偶",
          },
          character_string2: {
            value: 12345,
          },
        },
        templateId: "qIrI96K_NpjeopDWiH1iYexvCzU6v289wpIqyMEVwYA",
        miniprogramState: "developer",
      }).then( db.collection('UsersProfile').where({
        _openid:OPENID
      }).update({data:{
          subscription: false
        }}).then(res=>{
        console.log("进入db.collection.get的then");
      }).catch(err =>{console.log("进入db.collection.get的catch")})
      , function(err){
        console.log("进入失败 callbakc");
        console.log(err);
        console.log("失败cb end");
      }
      )

  } catch (err) {
    console.log(err);
    return err;
  }
};

async function sendTemplateMessage(event) {}
