var fs = require('fs')
var jsonStream = require('duplex-json-stream')
var net = require('net')
var sodium = require('sodium-native')

var genesisHash = Buffer.alloc(32).toString('hex')
var log = require('./log')
// integrity check of transaction log
if (log.length > 1) {
	check = log.reduce((a, b) => ({hash: hashToHex(a.hash + JSON.stringify(b.msg))}))

	if (log[log.length - 1].hash !== check.hash) {
		console.log("Transaction log has been tampered with, aborting start-up!")
		process.exit(1)
	}
	console.log("Transaction log clean, starting server on port 3876")
}


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

function writeBalance(socket) {
  bal = getBalance()
  socket.write({cmd: 'balance', balance: bal })
}

function storeTransaction(msg) {
  var prevHash = log.length ? log[log.length - 1].hash : genesisHash

  log.push({
  	msg: msg,
  	hash: hashToHex(prevHash + JSON.stringify(msg))
  })
  // rewrite out log
  fs.writeFile ("log.json", JSON.stringify(log), function(err) {
    if (err) throw err
  })
}

server.listen(3876)