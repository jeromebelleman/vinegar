const fs = require('fs')

const steps = ['Given', 'When', 'Then', 'And']
const stepRegExps = steps.map(step => RegExp(`^ *(${step}) *(.*) *`))

// Tests
exports.load = function (feature, definition) {
  const lines = fs.readFileSync(feature).toString().split('\n')

  backgrounds = []
  scenarios = []

  lines.map(line => {
    for (const stepRegExp of stepRegExps) {
      const match = line.match(stepRegExp)
      if (match) {
        scenarios.push({ keyword: match[1], text: match[2] })
        break
      }
    }
  })

  return { backgrounds, scenarios }
}
