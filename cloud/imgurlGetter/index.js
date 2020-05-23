const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  try {
    // 获取imgurl的方程
    return await cloud
      .getTempFileURL({
        fileList: [
          "cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/img/modal-bg.png",
          "cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/img/modal-bg2.png"
        ],
      })
      .then((res) => {
        // get temp file URL
        console.log(res.fileList);
      })
      .catch((error) => {
        console.log(err);
      });

    //一次性添加多条collection的方程
    // var pms = []
    // var i = 0, max = 43
    // const name = 'Materials'
    // while(i < max){
    //   console.log(i)
    //   let p = db.collection(name).add({
    //     data:{
    //       "category":"材料",
    //       "type":"材料",
    //       "name":"",
    //       "img_url":"",
    //     }
    //   })
    //   pms.push(p)
    //   i = i + 1
    // }
    // return Promise.all(pms).then(
    //   console.log("成功更新"+max+"条docs于"+name+" collection")
    // );
  } catch (e) {
    console.log(e);
  }
};
