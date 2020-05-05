const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  console.log(event);
  return sendTemplateMessage(event);
};

async function sendTemplateMessage(event) {
  try {
    const { OPENID } = cloud.getWXContext();
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: "index",
      lang: "zh_CN",
      data: {
        number01: {
          value: "339208499",
        },
        date01: {
          value: "2015年01月05日",
        },
        site01: {
          value: "TIT创意园",
        },
        site02: {
          value: "广州市新港中路397号",
        },
      },
      templateId: "TEMPLATE_ID",
      miniprogramState: "developer",
    });
    return result;
  } catch (err) {
    return err;
  }
}
