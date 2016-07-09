var config={

};
config.musicVolume = cc.sys.localStorage.getItem('musicVolume');
if(config.musicVolume === undefined || config.musicVolume === null){
	config.musicVolume = 0.8
}
cc.audioEngine.setMusicVolume(config.musicVolume);
config.setMusicVolume = function(value){
	config.musicVolume = value;
	cc.audioEngine.setMusicVolume(config.musicVolume);
	cc.sys.localStorage.setItem('musicVolume', value);
}
config.getMusicVolume = function(){
	return config.musicVolume;
}

config.effectVolume = cc.sys.localStorage.getItem('effectVolume');
if(config.effectVolume === undefined || config.effectVolume === null){
	config.effectVolume = 0.8
}
cc.audioEngine.setEffectsVolume(config.effectVolume);
config.setEffectsVolume = function(value){
	config.effectVolume = value;
	cc.audioEngine.setEffectsVolume(config.effectVolume);
	cc.sys.localStorage.setItem('effectVolume', value);
}
config.getEffectsVolume = function(){
	return config.effectVolume;
}

module.exports = config;