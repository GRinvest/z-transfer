/*
 * This easy script will shield your matured funds and send to exchange address:
 *
 * apt-get install nodejs
 * node zdump.js
 */ 
const http = require('http');

// Your t-address with block rewards
const coinbase = '';
// Your z-address for shielding
const zAddress = '';
// Exchange address
const exchange = '';
// Mininal balance for shielding or moving to exchange
const threshold = 5.0;

// Username and password for zcashd RPC
const rpcLogin = '';
const rpcPassword = '';
const rpcHost = '127.0.0.1';
const rpcPort = 8232;

// Default tx fee is 0.0001 (keep default)
const txFee = 0.0001;
// Repeat shield/send every 10 minutes (keep default, there is no operation status check yet)
const interval = 600000;

// Make HTTP POST
function post(method, params, callback) {
    var body = JSON.stringify({ method: method, params: params })
    var options = {
        port: rpcPort,
        hostname: rpcHost,
        auth: rpcLogin + ':' + rpcPassword,
        method: 'POST',
        path: '/',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    };
    var req = http.request(options, function(res) {
        res.on('data', function (body) {
            if (callback != null) {
                callback(null, JSON.parse(body));
            }
        });
    });
    req.on('error', function(err) {
        callback(err, null);
    });
    req.write(body);
    req.end('\n');
};

// Execute RPC z_sendmany
function transfer(from, to) {
    post('z_getbalance', [from], function(err, data) {
        if (err != null) {
            console.log('Error: ' + err.message);
            return;
        }
        if (data.result >= (threshold - txFee)) {
            var amount = data.result - txFee;
            console.log('Transfer', amount, 'from', from, 'to', to);
            post('z_sendmany', [from, [{ address: to, amount: amount }]], function(err, data) {
                if (err != null) {
                    console.log('Error: ' + e.message);
                } else {
                    console.log('Sent', amount)
                }
            });
        } else {
            console.log('Balance', data.result, 'is below threshold');
        }
    });
}

// Shield matured balance
(function shieldRewards() {
    transfer(coinbase, zAddress);
    setTimeout(shieldRewards, interval)
})();

// Transfer shielded balance
(function transferToExchange() {
    transfer(zAddress, exchange);
    setTimeout(transferToExchange, interval)
})();