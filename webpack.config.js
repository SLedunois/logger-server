const path = require('path');

module.exports = {
  entry: "./public/src/app.js",
  output: {
    filename: "public/dist/javascripts/bundle.js"
  },
  resolve : {
    modules: [
      "node_modules",
      "bower_components"
    ]
  }
};
