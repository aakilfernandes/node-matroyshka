const colors = require('colors')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.should()

process.on('uncaughtException', function (err) {
  console.log(err.message.red)
  console.log(err.stack.toString().yellow)
  process.exit()
  // if (err.code !== 'ECONNRESET') {
  //   process.exit()
  // }
})
