const responseTemplate = require('../../templates/response')
const defunction = require('defunction')

const GreetedResponse = module.exports = defunction([], '*', function Response() {
  this.type = 'greeted'
})

GreetedResponse.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return responseTemplate.encode({
    branch: this.type,
    value: new Uint8Array([0])
  })
})
