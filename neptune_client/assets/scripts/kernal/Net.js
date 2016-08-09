module.exports = function() {
    var net= require('pomelo-client');
    net. init({
        host: '127.0.0.1',
        port: 3014,
        user: {},
        handshakeCallback : function(){}
    }, function(data) {
        cc.log('connect success:', data);
    });
    return net;
};