const defunction = require('defunction')

module.exports = defunction(['Uint8Array'], 'string', function getSocketIdString(socketId) {
  return Array.from(socketId).join(':')
})
