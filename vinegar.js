const fs = require('fs')

const steps = ['Given', 'When', 'Then', 'And']
const stepRegExps = steps.map(step => RegExp(`^ *(${step}) *(.*) *`))

// Tests
exports.load = function (feature, definition) {
  const lines = fs.readFileSync(feature).toString().split('\n')

  const backgrounds = []
  const scenarios = []

  let previousKeyword
  lines.map(line => {
    for (const stepRegExp of stepRegExps) {
      const match = line.match(stepRegExp)
      if (match) {
        let keyword
        if (match[1] === 'And') {
          keyword = previousKeyword
        } else {
          keyword = previousKeyword = match[1]
        }
        scenarios.push({ keyword, text: match[2] })
        break
      }
    }
  })

  return { backgrounds, scenarios }
}
