/*:
 * @plugindesc Fixes the delayed audio bug by loading the audio files when the game starts.
 * @author Dreadwing93
 *
 * @param preload
 * @text Preload Files
 * 
 * @param preload se
 * @parent preload
 * @text SE
 * @desc Sound effects to preload.
 * @type file[]
 * @dir audio/se/
 * @default []
 *
 * @param preload me
 * @parent preload
 * @text ME
 * @desc Music effects to preload.
 * @type file[]
 * @dir audio/me/
 * @default []
 *
 * @param preload bgs
 * @parent preload
 * @text BGS
 * @desc Music effects to preload.
 * @type file[]
 * @dir audio/bgs/
 * @default []
 *
 * @param preload bgm
 * @parent preload
 * @text BGM
 * @desc Music effects to preload.
 * @type file[]
 * @dir audio/bgm/
 * @default []
 *
 * @help
 *
 * Some computers experience a delayed audio bug in RMMV games.
 * This is caused because RMMV needs to load the entire sound file
 * into memory before it can be played. It can be fixed by simply
 * loading the files ahead of time, and that's what this plugin does.
 * 
 * You can specify which files should be preloaded in the parameters
 * section to the right. If your title music is delayed, then you 
 * need to add a splash screen to give it time to preload.
 *
 *
 */

(function(){
    var parameters = PluginManager.parameters('dread_audioFix');

    var SE_LIST=JSON.parse(parameters['preload se']);
    var ME_LIST=JSON.parse(parameters['preload me']);
    var BGS_LIST=JSON.parse(parameters['preload bgs']);
    var BGM_LIST=JSON.parse(parameters['preload bgm']);

    function preloadAudio(folder,list){
        for(var i=0;i<list.length;++i){
            AudioManager.createBuffer(folder,list[i]);
        }
    }
    preloadAudio('se',SE_LIST);
    preloadAudio('me',ME_LIST);
    preloadAudio('bgs',BGS_LIST);
    preloadAudio('bgm',BGM_LIST);


    WebAudio.prototype._load = function(url) {
        if(WebAudio.buffers[url]){
            this._buffer = WebAudio.buffers[url];
            this._onXhrLoad_2(this._buffer);
            return;
        }
        if (WebAudio._context) {
            var xhr = new XMLHttpRequest();
            if(Decrypter.hasEncryptedAudio) url = Decrypter.extToEncryptExt(url);
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                if (xhr.status < 400) {
                    this._onXhrLoad(xhr);
                }
            }.bind(this);
            xhr.onerror = this._loader || function(){this._hasError = true;}.bind(this);
            xhr.send();
        }
    };

    WebAudio.buffers={};

    WebAudio.prototype._onXhrLoad = function(xhr) {
        var array = xhr.response;
        if(Decrypter.hasEncryptedAudio) array = Decrypter.decryptArrayBuffer(array);
        this._readLoopComments(new Uint8Array(array));
        WebAudio._context.decodeAudioData(array, function(buffer) {
            this._buffer = buffer;
            WebAudio.buffers[this._url]=buffer;
            this._onXhrLoad_2(buffer);
        }.bind(this));
    };

    WebAudio.prototype._onXhrLoad_2 = function(buffer){
        this._totalTime = buffer.duration;
        if (this._loopLength > 0 && this._sampleRate > 0) {
            this._loopStart /= this._sampleRate;
            this._loopLength /= this._sampleRate;
        } else {
            this._loopStart = 0;
            this._loopLength = this._totalTime;
        }
        this._onLoad();
    };

})();