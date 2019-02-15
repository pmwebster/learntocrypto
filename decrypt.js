var sodium = require('sodium-native')

var ciphertext = Buffer.from('ab170af2add198eba5a5bdc8ea4ae4fc36d7d402369187c7ce70af1b', 'hex')
var plainText = Buffer.alloc(ciphertext.length - sodium.crypto_secretbox_MACBYTES)
var nonce = Buffer.from('1b8f1b8bca4e10708f8aa6d2cbd60e2f6d91cb940c093550', 'hex')
var key = Buffer.from('b937a0b67d60db2ddd8a22846a2dc0873167171b837d45f7f7170943b2038473', 'hex')

if (!sodium.crypto_secretbox_open_easy(plainText, ciphertext, nonce, key)) {
  console.log('Decryption failed!')
} else {
  console.log('Decrypted message:', plainText, '(' + plainText.toString() + ')')
}