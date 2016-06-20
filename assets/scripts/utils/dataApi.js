/**
 * Data model `new Data()`
 *
 * @param {Array}
 */
var Data = function(head, lines) {
	var fields = {};
	head = head.replace(/(^\s*)|(\s*$)/g, ''); // trim
	head.split('\t').forEach(function(i, k) {
		// i = i.replace("\"","");
		fields[i + ''] = k;
	});

	var result = {}, ids = [];
	for( var i = 0; i < lines.length; ++i){
		var line = lines[i].replace(/(^\s*)|(\s*$)/g, ''); // trim
		if(line.length <= 0){
			continue;
		}
		var values = line.split('\t');
		var item = {};
		for (var k in fields) {
			var v = values[fields[k]];
			if(!isNaN(v)){
				v = Number(v);
			}
			item[k] = v;
		}
		result[item.id] = item;
		ids.push(item.id);
	}

	this.data = result;
	this.ids = ids;
};

/**
 * find items by attribute
 *
 * @param {String} attribute name
 * @param {String|Number} the value of the attribute
 * @return {Array} result
 * @api public
 */
Data.prototype.findBy = function(attr, value) {
	var result = [];
	var i, item;
	for (i in this.data) {
	  item = this.data[i];
	  if (item[attr] == value) {
	    result.push(item);
	  }
	}
	return result;
};

/**
 * find item by id
 *
 * @param id
 * @return {Obj}
 * @api public
 */
Data.prototype.findById = function(id) {
	return this.data[id];
};

Data.prototype.random = function() {
	var length = this.ids.length;
	var rid =  this.ids[Math.floor(Math.random() * length)];
	return this.data[rid];
};

/**
 * find all item
 *
 * @return {array}
 * @api public
 */
Data.prototype.all = function() {
	return this.data;
};

var exp = {};
exp.inited = false;

var datacount = 0;
var addData = function(dataname){
	datacount ++;
	cc.loader.loadRes('data/' + dataname, null, function (err, datas) {
		datacount --;
		if(err){
			cc.log('数据' + dataname + '配表读取失败，跳过预处理，错误：', err);
			datacount <= 0 && cc.log('-----配表加载完毕-----');
			return;
		}
		datas = datas.split('\n');
		if(datas.length <= 2){
			cc.log('数据' + dataname + '配表不足2行，跳过预处理');
			datacount <= 0 && cc.log('-----配表加载完毕-----');
			return;
		}
		var head = datas.splice(0, 2)[1]; // 提取出头部，并将datas变为纯数据
		exp[dataname] = new Data(head, datas);
		if(datacount <= 0){
			exp.inited = true;
			cc.log('-----配表加载完毕-----');
		}
	});
};

setTimeout(function(){
	cc.log('-----开始加载配表-----');
	addData('creatures');
	addData('skills');
}, 50);
module.exports = exp;