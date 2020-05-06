const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log(event);
  try {
    // const { OPENID } = cloud.getWXContext();
    OPENID = "opMPF5Nv70STC8faolY9uaIATfF8"
    return await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: "tradingFloor",
      lang: "zh_CN",
      data: {
        phrase1: {
          "value": "动森排队",
        },
        phrase3: {
          "value": "我傻了",
        },
        character_string2: {
          "value": "12345",
        },
      },
      templateId: "qIrI96K_NpjeopDWiH1iYexvCzU6v289wpIqyMEVwYA",
      miniprogramState: "developer",
    });
  } catch (err) {
    return err;
  }
};

async function sendTemplateMessage(event) {

}
