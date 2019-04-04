const fs = require('fs')

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

  // Output
  const backgrounds = []
  const scenarios = []
  let scenario = []

  // State machine
  let i = 0
  let match
  let previousKeyword
  let isBackground

  // Examples
  let outline, header, example
  let examples = []

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
    } else if (match = line.match(/^ *(Scenario|Background) *:/)) {
      if (scenario.length) scenarios.push(scenario)
      scenario = []
      if (example = examples.shift()) {
        header = undefined
        i = outline - 1 // - 1, since i++ comes further down
      } else {
        isBackground = match[1] === 'Background' ? true : false
        outline = undefined
      }
    } else if (match = line.match(/^ *Scenario Outline *:/)) {
      if (scenario.length) scenarios.push(scenario)
      scenario = []
      if (example = examples.shift()) {
        header = undefined
        i = outline - 1 // - 1, since i++ comes further down
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
      if (!outline || example) {
        if (isBackground) {
          backgrounds.push({ keyword, text })
        } else {
          scenario.push({ keyword, text })
        }
      }
    } else if (line.match(/^ *#|^ *$/)) {
      // Just skip comments and empty lines
    } else {
      throw new Error(`Unexpected input line ${i}: "${line}"`)
    }

    i++ // TODO Try moving this right to the bottom

    if (i === lines.length - 1) { // TODO As a last if?
      if (scenario.length) scenarios.push(scenario)
      scenario = []

      if (example = examples.shift()) {
        i = outline
      } else {
        break
      }
    }
  }

  return { backgrounds, scenarios }
}
