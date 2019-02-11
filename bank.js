var fs = require('fs')
var jsonStream = require('duplex-json-stream')
var net = require('net')
var sodium = require('sodium-native')

var genesisHash = Buffer.alloc(32).toString('hex')
var publicKey = Buffer.from('4134acfd1ac170e4fe43525aa17b150481048086f4ca8840a60e2b4a8c138c64', 'hex')
var secretKey = Buffer.from('6ccf71a18485fd740230735f7da5cb6f35c8e0d4b396c630c24663517c24f4f94134acfd1ac170e4fe43525aa17b150481048086f4ca8840a60e2b4a8c138c64', 'hex')

var log = require('./log')
// integrity check of transaction log
if (log.length > 1) {
  // Hashes
  check = log.reduce((a, b) => ({hash: hashToHex(a.hash + JSON.stringify(b.msg))}))

  if (log[log.length - 1].hash !== check.hash) {
	console.log("Transaction log has been tampered with, aborting start-up!")
    process.exit(1)
  }
  console.log("Transaction log clean")

  // Signatures
  for(var l of log) {
  	signature = sign(l.msg)
  	if (l.signature !== signature) {
  		console.log("Bad signature found, aboring start-up!")
  		process.exit(1)
  	}
  }
  console.log("Transaction signatures clean")
}
console.log("Starting server on port 3876")

var server = net.createServer(function (socket) {
  socket = jsonStream(socket)

  socket.on('data', function (msg) {
    console.log('Bank received:', msg)
    switch (msg.cmd) {
    case 'balance':
      writeBalance(this)
      break

    case 'deposit':
      storeTransaction(msg)
      writeBalance(this)
      break

    case 'withdraw':
      if (checkWithdraw(msg.amount)) {
	      msg.amount = msg.amount * -1
	      storeTransaction(msg)
	  }
      writeBalance(this)
      break

    default:
    	// Unknown command
    	break
	}
  })
})

function checkWithdraw(amount) {
  bal = getBalance()
  if ((bal - amount) > 0) {
  	return true
  } else {
  	return false
  }
}

function getBalance() {
	return log.reduce((a, b) => (a + b.msg.amount), 0)
}

function hashToHex(str) {
	var input = Buffer.from(str)
	var output = Buffer.alloc(sodium.crypto_generichash_BYTES)
	sodium.crypto_generichash(output, input)
	return output.toString('hex')
}

function sign(msg) {
  var signature = Buffer.alloc(sodium.crypto_sign_BYTES)
  sodium.crypto_sign_detached(signature, Buffer.from(JSON.stringify(msg)), secretKey)
  return signature.toString('hex')
}

function writeBalance(socket) {
  bal = getBalance()
  socket.write({cmd: 'balance', balance: bal })
}

function storeTransaction(msg) {
  var prevHash = log.length ? log[log.length - 1].hash : genesisHash
  var signature = sign(msg)

  log.push({
  	msg: msg,
  	hash: hashToHex(prevHash + JSON.stringify(msg)),
  	signature: signature
  })
  // rewrite out log
  fs.writeFile ("log.json", JSON.stringify(log), function(err) {
    if (err) throw err
  })
}

server.listen(3876)