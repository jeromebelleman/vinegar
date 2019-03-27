const fs = require('fs')

exports.load = function (feature, definition) {
  return fs.readFileSync(feature).toString().split('\n')
}
