module.exports = function() {
    var audio={};
 
    var storedMusic = npt.storage.get('musicVolume');
    if(storedMusic === undefined || storedMusic === null){
        storedMusic = 0.8
    }
    cc.audioEngine.setMusicVolume(storedMusic);
    audio.setMusicVolume = function(value){
        cc.audioEngine.setMusicVolume(value);
        npt.storage.set('musicVolume', value);
    }
    audio.getMusicVolume = function(){
        return cc.audioEngine.getMusicVolume();
    }

    var storedEffect = npt.storage.get('effectVolume');
    if(storedEffect === undefined || storedEffect === null){
        storedEffect = 0.8
    } 
    cc.audioEngine.setEffectsVolume(storedEffect);
    audio.setEffectsVolume = function(value){
        cc.audioEngine.setEffectsVolume(value);
        npt.storage.set('effectVolume', value);
    }
    audio.getEffectsVolume = function(){
        return cc.audioEngine.getEffectsVolume();
    }
    return audio;
};