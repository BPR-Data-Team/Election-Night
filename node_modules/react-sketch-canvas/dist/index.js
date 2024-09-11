
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./react-sketch-canvas.cjs.production.min.js')
} else {
  module.exports = require('./react-sketch-canvas.cjs.development.js')
}
