var Imported = Imported || {};
Imported.Lazr_MessageLog = true;

var Lazr = Lazr || {};
Lazr.ML = Lazr.ML || {};

/*:
 * @plugindesc v1.00 It's a message log.
 * @author LazrElectric
 *
 * @param Maximum Messages
 * @desc The maximum number of messages to store at once.
 * @default 16
 *
 * @param Log Condition
 * @desc If this evaluates to true, messages will be logged.
 * @default true
 *
 * @help This is a log for your messages.
 * To call it up, use SceneManager.push(Scene_Log);
 * To clear the log, use Lazr.ML.clear();
 */

Lazr.Parameters = PluginManager.parameters('Lazr_MessageLog');
Lazr.ML.maxMessages = Number(Lazr.Parameters['Maximum Messages'] || 16);
Lazr.ML.logCondition = Lazr.Parameters['Log Condition'] || true;

Lazr.ML.log = [];

Lazr.ML.Game_Message_prototype_add = Game_Message.prototype.add;
Game_Message.prototype.add = function(text) {
	Lazr.ML.Game_Message_prototype_add.call(this, text);
	if (eval(Lazr.ML.logCondition)) {
		Lazr.ML.log.push(text);
		while (Lazr.ML.log.length > Lazr.ML.maxMessages || Lazr.ML.log[0] == '') {
			Lazr.ML.log.shift();
		}
	}
};

// Show Text
Game_Interpreter.prototype.command101 = function() {
    if (!$gameMessage.isBusy()) {
    	if (eval(Lazr.ML.logCondition)) Lazr.ML.log.push('');
        $gameMessage.setFaceImage(this._params[0], this._params[1]);
        $gameMessage.setBackground(this._params[2]);
        $gameMessage.setPositionType(this._params[3]);
        while (this.nextEventCode() === 401) {  // Text data
            this._index++;
            $gameMessage.add(this.currentCommand().parameters[0]);
        }
        switch (this.nextEventCode()) {
        case 102:  // Show Choices
            this._index++;
            this.setupChoices(this.currentCommand().parameters);
            break;
        case 103:  // Input Number
            this._index++;
            this.setupNumInput(this.currentCommand().parameters);
            break;
        case 104:  // Select Item
            this._index++;
            this.setupItemChoice(this.currentCommand().parameters);
            break;
        }
        this._index++;
        this.setWaitMode('message');
    }
    return false;
};

Lazr.ML.clear = function() {
	Lazr.ML.log = [];
};

function Scene_Log() {
    this.initialize.apply(this, arguments);
}

Scene_Log.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Log.prototype.constructor = Scene_Log;

Scene_Log.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Log.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createLogWindow();
};

Scene_Log.prototype.createLogWindow = function() {
	this._logWindow = new Window_MessageLog(0, 0);
    this._logWindow.setHandler('cancel',   this.popScene.bind(this));
	this.addWindow(this._logWindow);
};

function Window_MessageLog() {
	this.initialize.apply(this, arguments);
}

Window_MessageLog.prototype = Object.create(Window_Command.prototype);
Window_MessageLog.prototype.constructor = Window_MessageLog;

Window_MessageLog.prototype.initialize = function(x, y) {
	var width = this.windowWidth();
	var height = this.windowHeight();
	Window_Command.prototype.initialize.call(this, x, y, width, height);
	this.refresh();	
};

Window_MessageLog.prototype.windowWidth = function() {
	return SceneManager._screenWidth;
};

Window_MessageLog.prototype.windowHeight = function() {
	return Math.min(this.fittingHeight(Lazr.ML.maxMessages), SceneManager._screenHeight);
};

Window_MessageLog.prototype.refresh = function() {
	var x = this.textPadding() - 16;
	this.clearCommandList();
	for (var i = 0; i < Lazr.ML.log.length; i++) {
		this.addCommand('', 'logWindow'+i, false);
	}
	this.drawAllItems();
};

Window_MessageLog.prototype.drawItem = function(index) {
	var rect = this.itemRectForText(index);
    this.resetTextColor();
    var item = Lazr.ML.log[index];
	item = item.replace(/\\w\[\d+\]/gi, '');
	item = item.replace(/\\c\[\d+\]/gi, '');
	item = item.replace(/\\lsv\[\d+\]/gi, '');
	item = item.replace(/\\lspiv\[\d+\]/gi, '');
	item = item.replace(/\\lspa\[\d+\]/gi, '');
	item = item.replace(/\\lspav\[\d+\]/gi, '');
	item = item.replace(/\\lsi\[\d+\]/gi, '');
	item = item.replace(/\\g/gi, '');
	item = item.replace(/\\\./gi, '');
	item = item.replace(/\\\|/gi, '');
	item = item.replace(/\\\!/gi, '');
	item = item.replace(/\\\>/gi, '');
	item = item.replace(/\\c/gi, '');
	item = item.replace(/\\\</gi, '');
	item = item.replace(/\\\^/gi, '');
	item = item.replace(/\\fb/gi, '');
	item = item.replace(/\\fi/gi, '');
	item = item.replace(/\\lson/gi, '');
	item = item.replace(/\\lsoff/gi, '');
	item = item.replace(/\\auto/gi, '');
	item = item.replace(/\\msgreset/gi, '');
	item = item.replace(/\\lsn\<\w\>/gi, '');
	item = item.replace(/\<WordWrap\>/gi, '');
	item = this.convertEscapeCharacters(item);
	item = item.replace(/dg\[\d+\]/gi, '');
	item = item.replace(/lspi\[\d+\]/gi, '');
	item = item.replace(/n\</gi, '');
	item = item.replace(/\>/gi, ': ');
    this.drawText(item, 0, rect.y, this.windowWidth(), 'left');
};