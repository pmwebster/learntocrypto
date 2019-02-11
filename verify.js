// Public key: 4553131a9eae939dc8ba283b81e790cb220b99d4b8261e3cee2bc6ee76e76a79
// Message: Hello world!
// Signature: baa65a45bf15f552357d8dfd12a6e4dd96b766964d18466362463a18ef82afc6a1098af509e16837ccf58aaa572877293fe490b0874cb04476753c4e07227303
var sodium = require('sodium-native')

var publicKey = Buffer.from('4553131a9eae939dc8ba283b81e790cb220b99d4b8261e3cee2bc6ee76e76a79', 'hex')
var message = Buffer.from('Hello world!')
var signature = Buffer.from('baa65a45bf15f552357d8dfd12a6e4dd96b766964d18466362463a18ef82afc6a1098af509e16837ccf58aaa572877293fe490b0874cb04476753c4e07227303', 'hex')

console.log(sodium.crypto_sign_verify_detached(signature, message, publicKey))
