/*:
 * @author Gentle Orchid
 * @plugindesc My first plugin.
 *
 * @param Thing
 * @type text
 * @default Text here.
 *
 * @param Number Param
 * @type number
 * @desc number
 * @min 0
 * @max 50
 * @decimals 5
 *
 * @param File param
 * @type file 
 * @dir audio/bgm
 * @require 1
 * @desc Pick a song!
 *
 * @help
 * This is 
 * my first plugin.
*/


(function() {
	var params = pluginmanager.parameters("My_plugin");
	
	var text = params["Text thing"]
	var number = params["Number Param"];
	var file = params["File param"];
	
	console.log(text);
	console.log(number);
	console.log(file);
})();

var lh = Window_Bade.prototype.lineHeight()*2

function My_Window() {
    this.intialize.apple(this, arguments);
}	

My_Window.prototype = object.create(Window_Base.prototype);
My_Window.prototype.constructor = My_Window;

My_window.prototype.initialize = function() {
	window_base.prototype.initialize.call(this, 0, 0, Graphics.boxwidth, 1h);
	this.refresh();
}

My_Window.prototype.refresh = function() {
	this.contents.clear();
	this.drawText(text, 0 ,0);
;

var smstart = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
	smstart.apply(this, arguments);
	this.my_window = new My_Window();
	this.addChild(this.my_window);
}