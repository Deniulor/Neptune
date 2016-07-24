
module.exports = function(){
    var storage={};

    storage.set = function(item, value) {
        cc.sys.localStorage.setItem(item, value);
    }
    storage.get = function(item) {
        return cc.sys.localStorage.getItem(item);
    }

    return storage;
};