const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  try {
    // 获取imgurl的方程
    // return await cloud.getTempFileURL({
    //   fileList: [
    //     'cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/nookea/DiyCollection.png',
    //   ]
    // }).then(res => {
    //   // get temp file URL
    //   console.log(res.fileList)
    // }).catch(error => {
    //   console.log(err)
    // })

    //一次性添加多条collection的方程
    var pms = []
    var i = 0, max = 5
    const name = 'Plants'
    while(i < max){
      console.log(i)
      let p = db.collection(name).add({
        data:{
          "category":"灌木",
          "type":"",
          "name":"",
          "img_url":"",
        }
      }) 
      pms.push(p)
      i = i + 1
    }
    return Promise.all(pms);
  } catch (e) {
    console.log(e)
  }
};