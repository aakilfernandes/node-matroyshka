const defunction = require('defunction')
const Promise = require('bluebird')

module.exports = defunction([], '*', function PromiseStub() {
  this.promise = new Promise((resolve, reject)  => {
    this.resolve = resolve
    this.reject = reject
  })
})
