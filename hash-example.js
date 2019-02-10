sodium = require('sodium-native')

var message = Buffer.from('Hello, World!')
var ciphertext = Buffer.alloc(sodium.crypto_generichash_BYTES)
sodium.crypto_generichash(ciphertext, message)
console.log(ciphertext.toString('hex'))
