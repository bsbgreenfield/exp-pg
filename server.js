process.env.NODE_ENV = 'developement'
const app = require("./app");

app.listen(3000, function () {
  console.log("Listening on 3000");
});