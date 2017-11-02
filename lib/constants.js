
const tcpDataMax = (Math.pow(256, 2)) - 1
const proxyPacketCiphertextMax = tcpDataMax - 16 - 32 - 2
const proxyPacketPlaintextMax = (16 * Math.floor(proxyPacketCiphertextMax / 16)) - 1
const tcpCommandDataMax = proxyPacketPlaintextMax - 16 - 2 - 2

module.exports = {
  tcpDataMax,
  proxyPacketCiphertextMax,
  proxyPacketPlaintextMax,
  tcpCommandDataMax
}
