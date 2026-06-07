//-----------------------------------------------------------------------------
//  Galv's Layer Graphics
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_LayerGraphics.js
//-----------------------------------------------------------------------------
//  Version 1.0
//  2015-10-30 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_LayerGraphics = true;

var Galv = Galv || {};        // Galv's main object
Galv.LG = Galv.LG || {};      // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc Create graphic layers for parallax mapping, fog, etc. View the 'Help' document for plugin commands and info.
 * 
 * @author Galv - galvs-scripts.com
 *
 * @help
 *   Galv's Layer Graphics
 * ----------------------------------------------------------------------------
 * Before you start, you will need to create a layers folder in your project.
 * /img/layers/
 * This is where all your layer images will be taken from.
 *
 * Each map can have many graphic layers, but be aware that the more you have,
 * the more chance the game could lag (especially on slow computers or mobile
 * devices).
 *
 * When a layer is made, it is stored, so you can set layers for maps before
 * a player enters them. The layers are created when the map is created, so
 * for layer commands created on the same map, 'REFRESH LAYERS' plugin command
 * can be used to force the layers to create during play.
 *
 * Below are commands to be used in the "Plugin Command" event command.
 * NOTE: This is different to the "Script" event command.
 * ----------------------------------------------------------------------------
 *   Plugin Commands (Quick)
 * ----------------------------------------------------------------------------
 *
 *  LAYER MAPID ID GRAPHIC XSPEED YSPEED OPACITY Z XSHIFT YSHIFT BLEND
 *
 *  LAYER REMOVE MAPID ID
 *
 *  LAYER REFRESH
 *
 * ----------------------------------------------------------------------------
 *   Plugin Commands (Detailed)
 * ----------------------------------------------------------------------------
 * To create or change a layer graphic, the following plugin command is used:
 *
 *  LAYER MAPID ID GRAPHIC XSPEED YSPEED OPACITY Z XSHIFT YSHIFT BLEND
 *
 * Each property is separated by a space and you will exchange the property
 * names above with values.
 *
 * EXPLANATION OF PROPERTIES:
 * LAYER        - do not change this, it is the keyword for the plugin.
 * MAPID        - the id of the map you are creating the layer for
 * ID           - the id of the layer itself. If you want to change or remove
 *              - an existing layer, you refer to it by it's id.
 * GRAPHIC      - The filename of the image found in /img/layers/
 * XSPEED       - The speed of the horizontal movement. Negatives to go left
 * YSPEED       - The speed of the vertical movement. Negatives to go up
 * OPACITY      - Transparency of the image (0 - 255)
 * Z            - What priority the image has. 0 = ground, 5 = above all chars
 * XSHIFT       - Horizonal movement shift that differs from player movement
 * YSHIFT       - Vertical movement shift that differs from player movement
 *              - Make XSHIFT and YSHIFT = 0 to move with map
 * BLEND        - Blend mode (0 = normal, 1 = add, 2 = multiply, 3 = screen)
 *
 * Example:
 * LAYER 12 1 clouds 1 0 155 5 0 0 0
 * This will create/change layer 1 on map 12. It will make it use "clouds.png"
 * as the image that will scroll right, be partially transparent and above all
 *
 * Using Variables
 * You can use a variable for any property (except 'GRAPHIC') in the plugin 
 * if you put a "v" before the property. The number after will be variable id.
 *
 * Example:
 * LAYER 12 1 clouds 1 0 v1 5 0 0 0
 * This is the same example as above, but will use the value of variable 1
 * for the opacity of the layer. This only changes the setting when called,
 * changing the variable again without calling this plugin command again will
 * not change the layer.
 *
 * ----------------------------------------------------------------------------
 *
 *  LAYER REMOVE MAPID ID  - Remove a layer from a map
 * 
 * Example:
 * LAYER REMOVE 12 1       - Removes layer 1 from map 12
 *
 * ----------------------------------------------------------------------------
 *
 *  LAYER REFRESH          - For creating new layers on the same map as the
 *                         - plugin command. Do this command if creating
 *                         - NEW layers on the map. It is not required for
 *                         - changing existing layers
 *
 * ----------------------------------------------------------------------------
 *
 * ----------------------------------------------------------------------------
 *   SCRIPT CALL
 * ----------------------------------------------------------------------------
 * For advanced users only. Layer properties can be accessed via script:
 * $gameMap.layerSettings[mapId][layerId].property
 * "property" being the above properites in lowercase.
 */

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

// LAYER GRAPHIC FOLDER
ImageManager.loadLayerGraphic = function(filename, hue) {
    return this.loadBitmap('img/layers/', filename, hue, true);
};


// PLUGIN CODE
var Galv_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Galv_Game_Interpreter_pluginCommand.call(this, command, args);
 	if (command === 'LAYER') Galv.LG.createLayer(args);
 };


// CREATE LAYER
Galv.LG.createLayer = function(config) {
	switch (config[0]) {
	case 'REFRESH':
		// Recreate layer graphics
		SceneManager._scene._spriteset.createLayerGraphics();
		return;
	case 'REMOVE':
		// Remove specified layer object
		mapid = Galv.LG.num(config[1]);
		id = Galv.LG.num(config[2]);
		if (id) {
			$gameMap.layerSettings[mapid][id] = {};
		} else {
			$gameMap.layerSettings[mapid] = {};
		};
		return;
	};
	
	// get variables
	

	mapid = Galv.LG.num(config[0]);
	id = Galv.LG.num(config[1]);
	$gameMap.layerSettings[mapid] = $gameMap.layerSettings[mapid] || {};
	$gameMap.layerSettings[mapid][id] = $gameMap.layerSettings[mapid][id] || {};
	
	var x_exist = $gameMap.layerSettings[mapid][id].currentx || 0;
	var y_exist = $gameMap.layerSettings[mapid][id].currenty || 0;
	
	// create object
	$gameMap.layerSettings[mapid][id] = {
		graphic: config[2],         // filename of the graphic in /img/layers/
		xspeed: Galv.LG.num(config[3]),          // speed the layer will scroll horizontally
		yspeed: Galv.LG.num(config[4]),          // speed the layer will scroll vertically
		opacity: Galv.LG.num(config[5]),         // the opacity of the layer
		z: Galv.LG.num(config[6]),               // what level the layer is displayed at (ground is 0)
		xshift: Galv.LG.num(config[7]),          // Moves the layer at a different x amount than the map (0 to not move)
		yshift: Galv.LG.num(config[8]),          // Moves the layer at a different y amount than the map (0 to not move)
		blend: Galv.LG.num(config[9]),           // Blend mode  (0 = normal, 1 = add, 2 = multiply, 3 = screen)
		currentx: x_exist,                        // origin x saved. Reset this on map change
		currenty: y_exist,                        // origin y saved. Reset this on map change
	};

};


Galv.LG.num = function(txt) {
	if (txt[0] === "v") {
		varId = Number(txt.replace("v",""));
		return $gameVariables.value(varId);
	} else {
		return Number(txt);
	};
};




Galv.LG.isEmpty = function(obj) {
	return Object.keys(obj).length === 0;
};


var Galv_Spriteset_Map_createlowerlayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
    Galv_Spriteset_Map_createlowerlayer.call(this);
	this.layerGraphics = this.layerGraphics || {};
	this.createLayerGraphics();
};
    
Spriteset_Map.prototype.createLayerGraphics = function() {
    // Create Active Layers On Map
	
	var mapGraphics = $gameMap.layerConfig(); // get object only for the map

	for (var propertyId in mapGraphics) {

		// if layers sprite doesn't exist, make it.
		if (!this.layerGraphics.hasOwnProperty(propertyId)) {
			this.layerGraphics[propertyId] = this.createLayerSprite(propertyId);
		};

		// If settings are empty for the layer
		if (Galv.LG.isEmpty(mapGraphics[propertyId]) || mapGraphics[propertyId]["graphic"] == "") {
			//this._tilemap.removeChild(this.layers[propertyId]);

			var ind = this._tilemap.children.indexOf(this.layerGraphics[propertyId]);
			if (ind > -1) {
				this._tilemap.children.splice(ind, 1);
			}
			
		} else {
			this._tilemap.addChild(this.layerGraphics[propertyId]);
		};
	};

};

Spriteset_Map.prototype.createLayerSprite = function(layerId) {
	if (!$gameMap.layerConfig()[layerId]) return null;
	var sprite = new Sprite_LayerGraphic(layerId);
	sprite.move(0, 0, Graphics.width, Graphics.height);
	return sprite;
};
    

// GAME MAP - SETUP LAYER SETTINGS
var Galv_Game_Map_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
	Galv_Game_Map_initialize.call(this);
	this.layerSettings = {};   // Store ALL layers here.
};



var Galv_Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
	Galv_Game_Map_setup.call(this,mapId);
	for (var obj in this.layerConfig()) {
		obj.currentx = 0;
		obj.currenty = 0;
	};
};


Game_Map.prototype.layerConfig = function() {
	// Get object list from layerSettings
	if (this.layerSettings[this.mapId()]) {
		return this.layerSettings[this.mapId()];
	} else {
		this.layerSettings[this.mapId()] = {}
		return this.layerSettings[this.mapId()];
	};
};


// CREATE LAYER SPRITE
function Sprite_LayerGraphic(id) {
	this.id = id;
    this.initialize.apply(this, arguments);
}


Sprite_LayerGraphic.prototype = Object.create(TilingSprite.prototype);
Sprite_LayerGraphic.prototype.constructor = Sprite_LayerGraphic;


Sprite_LayerGraphic.prototype.initialize = function() {
    TilingSprite.prototype.initialize.call(this);
	this.currentGraphic = "";
    this.createBitmap();
    this.update();
};


Sprite_LayerGraphic.prototype.createBitmap = function() {
	if (Galv.LG.isEmpty($gameMap.layerConfig()[this.id])) {
		this.bitmap = ImageManager.loadLayerGraphic("");
	} else {
		this.bitmap = ImageManager.loadLayerGraphic(this.lValue().graphic);
	};
	this.z = this.lValue().z;
};


Sprite_LayerGraphic.prototype.lValue = function() {
	return $gameMap.layerConfig()[this.id];
};


// Update
Sprite_LayerGraphic.prototype.update = function() {
	TilingSprite.prototype.update.call(this);

	if (this.currentGraphic !== this.lValue().graphic) {
		this.createBitmap();
		this.currentGraphic = this.lValue().graphic;
	};
	
	this.updatePosition();
};

// Update Position
Sprite_LayerGraphic.prototype.updatePosition = function() {
	this.z = this.lValue().z || 0;
	this.opacity = this.lValue().opacity || 0;
	this.blendMode = this.lValue().blend || 0;
	
	this.origin.x = 0 + $gameMap.displayX() * 48 + this.lValue().currentx + this.xOffset();
	this.origin.y = 0 + $gameMap.displayY() * 48 + this.lValue().currenty + this.yOffset();
	this.lValue().currentx += this.lValue().xspeed;
	this.lValue().currenty += this.lValue().yspeed;
};

Sprite_LayerGraphic.prototype.xOffset = function() {
	return $gameMap.displayX() * this.lValue().xshift;
};

Sprite_LayerGraphic.prototype.yOffset = function() {
	return $gameMap.displayY() * this.lValue().yshift;
};

})();