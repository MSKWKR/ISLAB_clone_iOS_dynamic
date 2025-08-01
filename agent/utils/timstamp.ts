export function get_timestamp() {
  var today = new Date();
  var timestamp = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' +
      today.getDate() + ' ' + today.getHours() + ':' + today.getMinutes() +
      ':' + today.getSeconds() + ':' + today.getMilliseconds();
  return timestamp;
}