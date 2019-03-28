const fs = require('fs')

const scenarioTypes = ['Scenario Outline']
let regExps = scenarioTypes.map(step => RegExp(`^ *(${step}) *:`))

const steps = ['Given', 'When', 'Then', 'And']
regExps = [...regExps, ...steps.map(step => RegExp(`^ *(${step}) *(.*) *`))]

exports.load = function (feature, definition) {
  const lines = fs.readFileSync(feature).toString().split('\n')

  const backgrounds = []
  const scenarios = []

  let previousKeyword
  let outline = false
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    for (const regExp of regExps) {
      const match = line.match(regExp)
      if (match) {
        let keyword
        if (match[1] === 'Scenario Outline') {
          outline = true
        } else {
          if (match[1] === 'And') {
            keyword = previousKeyword
          } else {
            keyword = previousKeyword = match[1]
          }
          scenarios.push({ keyword, text: match[2] })
        }
        break
      }
    }
    i++
  }

  return { backgrounds, scenarios }
}
