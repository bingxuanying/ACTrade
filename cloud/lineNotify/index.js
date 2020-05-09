const cloud = require("wx-server-sdk");

cloud.init();
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
      })
      .then(() => {
        db.collection("UsersProfile")
          .doc(OPENID)
          .update({
            data: {
              subscription: false,
            },
          })
          .then(() => {
            console.log("更新profile.sub成功");
          })
          .catch(() => {
            console.log("更新profile.sub失败");
          });
      });
  } catch (err) {
    console.log(err);
    return err;
  }
};

async function sendTemplateMessage(event) {}
