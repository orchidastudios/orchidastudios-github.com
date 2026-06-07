//=============================================================================
// Save Event Position
// by Shaz
// Last Updated: 2015.11.12
//=============================================================================

/*:
 * @plugindesc Allows you to save an event's position and direction
 * @author Shaz
 *
 * @help
 * This plugin lets you set the position and direction where an event will
 * appear the next time the map is loaded.  The commands can also be called
 * via a script call inside of move routes to save/forget the position of
 * the event being moved.
 *
 * This plugin affects events only, not the player or followers, or vehicles.
 *
 * This does not move the event to the specified location - it simply sets the
 * location for the next time the map is loaded.
 *
 * Arguments may be values or formulae to be evaluated (do not include any
 * spaces).  Use this._mapId for the current map, or this._eventId for the
 * current event.
 *
 * Plugin Command:
 * ---------------
 * SavePos - save position for current event
 * SavePos x y
 * SavePos x y dir
 *
 * SaveOtherPos eventId - save position for other event (including other map)
 * SaveOtherPos eventId x y
 * SaveOtherPos eventId x y dir
 * SaveOtherPos mapId eventId x y dir
 *
 * ForgetPos - forget current event's position
 * ForgetOtherPos eventId - forget another event's position (incl other map)
 * ForgetOtherPos mapId eventId
 *
 * Script Call within Move Route (current event only):
 * ---------------------------------------------------
 * this.savePos()
 * this.savePos(x, y)
 * this.savePos(x, y, dir)
 *
 * this.forgetPos()
 */

(function() {
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {

    switch(command.toUpperCase()) {
      case 'SAVEPOS':
        this.savePos(args);
        break;
      case 'SAVEOTHERPOS':
        this.saveOtherPos(args);
        break;
      case 'FORGETPOS':
        this.forgetPos(args);
        break;
      case 'FORGETOTHERPOS':
        this.forgetOtherPos(args);
        break;
      default:
        _Game_Interpreter_pluginCommand.call(this, command, args);
    }
  };

  Game_Interpreter.prototype.savePos = function(args) {
    args.unshift(this._eventId);
    this.saveOtherPos(args);
  };

  Game_Interpreter.prototype.saveOtherPos = function(args) {
    // evaluate any formulae
    for (arg = 0; arg < args.length; arg++) {
      args[arg] = eval(args[arg]);
    }

    // default any missing arguments
    if (args.length < 5) {
      evt = $gameMap.event(args[0]);
      args.unshift(this._mapId);
    }

    mapId = args[0];
    eventId = args[1];
    x = args.length > 2 ? args[2] : evt.x;
    y = args.length > 2 ? args[3] : evt.y;
    dir = args.length > 4 ? args[4] : evt.direction();

    // and save
    $gameSystem.saveEventPosition(mapId, eventId, x, y, dir);
  };

  Game_Interpreter.prototype.forgetPos = function(args) {
    args.unshift(this._eventId);
    this.forgetOtherPos(args);
  };

  Game_Interpreter.prototype.forgetOtherPos = function(args) {
    // evaluate any formulae
    for (arg = 0; arg < args.length; arg++) {
      args[arg] = eval(args[arg]);
    }

    // default any missing arguments
    mapId = args.length > 1 ? args[0] : this._mapId;
    eventId = args[args.length - 1];

    // and forget
    $gameSystem.forgetEventPosition(args);
  };

  Game_System.prototype.saveEventPosition = function(mapId, eventId, x, y, dir) {
    this.checkEventPositionsExist();
    key = [mapId, eventId];
    value = [x, y, dir];
    this._eventPositions[key] = value;
  };

  Game_System.prototype.forgetEventPosition = function(mapId, eventId) {
    this.checkEventPositionsExist();
    key = [mapId, eventId];
    if (this._eventPositions[key]) {
      delete this._eventPositions[key];
    }
  };

  Game_System.prototype.eventPosition = function(mapId, eventId) {
    this.checkEventPositionsExist();
    key = [mapId, eventId];
    return this._eventPositions[key] || null;
};

  Game_System.prototype.checkEventPositionsExist = function() {
    if (!this._eventPositions) {
      this._eventPositions = {};
    }
  };

  Game_Character.prototype.savePos = function(x, y, dir) {
    // only usable by events
    if (this.constructor === Game_Event) {
      // default any missing arguments
      mapId = $gameMap.mapId();
      eventId = this._eventId;
      if (!x) { x = this._x };
      if (!y) { y = this._y };
      if (!dir) { dir = this._direction };

      // and save
      $gameSystem.saveEventPosition(mapId, eventId, x, y, dir);
    }
  };

  Game_Character.prototype.forgetPos = function() {
    // only usable by events
    if (this.constructor === Game_Event) {
      $gameSystem.forgetEventPosition($gameMap.mapId(), this._eventId);
    }
  };

  var _Game_Event_initialize = Game_Event.prototype.initialize;
  Game_Event.prototype.initialize = function(mapId, eventId) {
    _Game_Event_initialize.call(this, mapId, eventId);
    savedPosition = $gameSystem.eventPosition(mapId, eventId);
    if (savedPosition) {
      this.setPosition(savedPosition[0], savedPosition[1]);
      this.setDirection(savedPosition[2]);
    }
  };
})();