const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;
// 功能1： 有人post了一个新的selling -> 心愿单里有的人收到新消息
// 功能2： post的那个人的tradeHistory里添加一个 selling.rooms
exports.main = async (event, context) => {
  let { OPENID, APPID, UNIONID } = cloud.getWXContext();
  //news 需要的para: zh_name, img_url,  roomId, timestamp isUpdated(这里加), description
  let zh_name = event.zh_name
  let news = {}
  news.img_url = event.img_url
  news.roomId = event.roomId
  news.timestamp = event.timestamp
  news.description = "有人发布了出售!"
  news.isUpdated = true
  let path = 'wishlist.' + zh_name + '.zh_name'
  let path2 = 'tradeHistory.news.rooms.' + zh_name 
  db.collection('UsersProfile').where({
    [path]:zh_name
  }).update({
    data:{
      'tradeHistory.news.isUpdated': true,
      [path2]: news
    }
  }).then(res=>{
    console.log("push news to who in wishlist: success")
  }).catch(res=>{
    console.log("push news to who in wishlist: fail")
    console.log(res)
  })

}