var fs = require('fs')
var jsonStream = require('duplex-json-stream')
var net = require('net')

var log = require('./log')
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
	return log.reduce((a, b) => (a + b.amount), 0)
}

function writeBalance(socket) {
  bal = getBalance()
  socket.write({cmd: 'balance', balance: bal })
}

function storeTransaction(msg) {
  log.push(msg)
  fs.writeFile ("log.json", JSON.stringify(log), function(err) {
    if (err) throw err
  })
}

server.listen(3876)