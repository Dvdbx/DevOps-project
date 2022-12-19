var redis = require("redis");
const configure = require('./configure')

const config = configure()
var db = redis.createClient({
  host: "127.0.0.1",
  port: 6379

})

process.on('SIGINT', function() {
  db.quit();
});

module.exports = db
