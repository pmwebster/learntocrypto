var sodium = require('sodium-native')

var key = sodium.sodium_malloc(sodium.crypto_secretbox_KEYBYTES)
sodium.randombytes_buf(key)
console.log(key.toString('hex'))