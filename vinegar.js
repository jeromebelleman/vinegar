const fs = require('fs')

const scenarioTypes = ['Scenario Outline']
let regExps = scenarioTypes.map(step => RegExp(`^ *(${step}) *:`))

const steps = ['Given', 'When', 'Then', 'And']
regExps = [...regExps, ...steps.map(step => RegExp(`^ *(${step}) *(.*) *`))]

exports.mkExample = function (header, line) {
  const example = {}
  line = line.split('|').slice(1, -1).map(field => field.trim())
  for (const field in header) example[header[field]] = line[field]
  return example
}

exports.mkHeader = function (line) {
  return line.split('|').slice(1, -1).map(field => field.trim())
}

exports.load = function (feature, definition) {
  const lines = fs.readFileSync(feature).toString().split('\n')

  const backgrounds = []
  const scenarios = []

  let i = 0
  let match
  let previousKeyword

  let outline, header
  let examples = []
  let example

  while (true) {
    const line = lines[i]

    if (line.match(/^ *(Feature|Examples) *:/)) {
      // Just skip (for now)
    } else if (line.match(/^ *\|/)) {
      if (!example) {
        if (header) {
          examples.push(exports.mkExample(header, line))
        } else {
          header = exports.mkHeader(line)
        }
      }
    } else if (match = line.match(/^ *Scenario *:/)) {
      outline = undefined
    } else if (match = line.match(/^ *Scenario Outline *:/)) {
      if (outline) {
        i = outline
        outline = undefined
      } else {
        outline = i + 1
      }
    } else if (match = line.match(/^ *(Given|When|Then|And) *(.+) */)) {
      let keyword
      if (match[1] === 'And') {
        keyword = previousKeyword
      } else {
        keyword = match[1]
        previousKeyword = keyword
      }

      let text = match[2]
      if (example) {
        for (const column in example) {
          text = text.replace(`<${column}>`, example[column])
        }
      }
      if (!outline || example) scenarios.push({ keyword, text })
    } else if (line.match(/^ *#|^ *$/)) {
    } else {
      throw `Unexpected input line ${i}: "${line}"`
    }

    i++

    if (i === lines.length - 1) {
      if (example = examples.shift()) {
        i = outline
      } else {
        break
      }
    }
  }

  return { backgrounds, scenarios }
}
