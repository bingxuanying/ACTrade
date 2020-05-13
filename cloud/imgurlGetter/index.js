const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  try {
    return await cloud.getTempFileURL({
      fileList: [
        'cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/gif/EarthLoading.gif',
        'cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/gif/FlightLoading.gif',
        'cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/gif/IslandLoading.gif',
        'cloud://vegi-exchange-45j4z.7665-vegi-exchange-45j4z-1301890684/dev/gif/PassportLoading.gif'
      ]
    }).then(res => {
      // get temp file URL
      console.log(res.fileList)
    }).catch(error => {
      console.log(err)
    })
  } catch (e) {
    console.log(e)
  }
};