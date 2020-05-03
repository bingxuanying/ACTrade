const formatTime = () => {
  var date = new Date(),
      year = date.getUTCFullYear().toString(),
      month = (date.getUTCMonth() + 1).toString(),
      day = date.getUTCDate().toString(),
      hr = date.getUTCHours().toString(),
      min = date.getUTCMinutes().toString(),
      sec = date.getUTCSeconds().toString(),
      milisec = date.getUTCMilliseconds().toString();
  if (month.length < 2) 
    month = '0' + month;
  if (day.length < 2) 
    day = '0' + day;
  if (hr.length < 2) 
    hr = '0' + hr;
  if (min.length < 2) 
    min = '0' + min;
  if (sec.length < 2) 
    sec = '0' + sec;
  milisec = '0'.repeat(3 - milisec.length) + milisec;

  return parseInt(year + month + day + hr + min + sec + milisec, 10);
}

module.exports = {
  formatTime: formatTime
}
