const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log(event);
  return sendTemplateMessage(event);
};

async function sendTemplateMessage(event) {
  try {
    const { OPENID } = cloud.getWXContext();
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: "tradingFloor",
      lang: "zh_CN",
      data: {
        phrase1: {
          value: "动森排队",
        },
        phrase3: {
          value: "2015年01月05日",
        },
        character_string2: {
          value: "12345",
        },
      },
      templateId: "qIrI96K_NpjeopDWiH1iYexvCzU6v289wpIqyMEVwYA",
      miniprogramState: "developer",
    });
    return result;
  } catch (err) {
    return err;
  }
}
