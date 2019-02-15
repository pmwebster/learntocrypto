var sodium = require('sodium-native')
var nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
var key = Buffer.from('b937a0b67d60db2ddd8a22846a2dc0873167171b837d45f7f7170943b2038473', 'hex')

var argv = process.argv.slice(2)
var message = Buffer.from(argv[0])

var ciphertext = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES)
sodium.randombytes_buf(nonce)
sodium.crypto_secretbox_easy(ciphertext, message, nonce, key)

console.log('Encrypted Message: ' + ciphertext.toString('hex'))
console.log('Nonce: ' + nonce.toString('hex'))