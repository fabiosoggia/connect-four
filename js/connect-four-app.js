/*jslint node: true */
'use strict';

/**
 * ConnectionFourApp namepace.
 */
var ConnectionFourApp = {};

/**
 * Instantiate a new game for pPlayer.
 * @param {Array} pPlayers [description]
 */
ConnectionFourApp.Game = function (settings) {
	this.settings = settings;

	// More checks required here.
	this.players = settings.players || [1, 2];
	this.playersCount = this.players.length;
	this.connections = settings.connections || 4;

	// Init the game.
	this.init();
};

/**
 * Initialize/reset the initial state of the game. This method do not
 * performs changes to players and other game settings.
 */
ConnectionFourApp.Game.prototype.init = function() {
	this.board = new ConnectionFourApp.Board(this.settings.columns, this.settings.rows);
	this._round = 0;
	this._actionStack = [];
};

/**
 * This is an alis method for init. See init().
 */
ConnectionFourApp.Game.prototype.reset = ConnectionFourApp.Game.prototype.init;

/**
 * Return the status of the match.
 * @return {[type]} [description]
 */
ConnectionFourApp.Game.prototype.getState = function() {
	this.settings.actions = this._actionStack;
	return this.settings;
};

ConnectionFourApp.Game.prototype.nextRound = function() {
	this._round = (this._round + 1) % this.playersCount;
};

ConnectionFourApp.Game.prototype.previousRound = function() {
	// Set the current round
	if (this._round === 0) {
		this._round = this.playersCount - 1;
	} else {
		this._round = this._round - 1;
	}
};


/**
 * Get the player who has to play.
 * @return {Object} one of the playes specified in the constructor
 */
ConnectionFourApp.Game.prototype.getCurrentPlayer = function() {
	return this.players[this._round];
};

ConnectionFourApp.Game.prototype.getCurrentPlayerId = function() {
	return this._round;
};

/**
 * Undo last action.
 */
ConnectionFourApp.Game.prototype.undo = function(callback) {
	var action = this._actionStack.pop();

	if (!action) {
		return;
	}

	this.board.pop(action.column);
	this.previousRound();

	if (callback) {
		callback(action.column);
	}
};

/**
 * The player returned by getCurrentPlayer() put a piece in the column.
 * @param  {[type]} column [description]
 * @return {[type]}        [description]
 */
ConnectionFourApp.Game.prototype.put = function(column) {
	var playerId = this._round;

	if (!this.board.push(column, playerId)) {
		return false;
	}

	this._actionStack.push({
		player: playerId,
		column: column
	});

	var row = this.board.length(column) - 1;
	var points = this.board.countConnection(column, row);

	this.nextRound();

	return true;
};

/**
 * Return true if getCurrentPlayer() won the round.
 * @return {[type]} [description]
 */
ConnectionFourApp.Game.prototype.won = function() {
	if (this._actionStack.length === 0) {
		return false;
	}

	var col = this._actionStack[this._actionStack.length - 1].column;
	var row = this.board.length(col) - 1;

	return (this.board.countConnection(col, row) >= this.connections);
};

ConnectionFourApp.Game.prototype.isEnded = function() {
	// Number of actions >= available cells
	if (this._actionStack.length >= this.board.cellsCout()) {
		return true;
	}

	return this.won();
};

/**
 * This is the data structure is used to manage a table of columns where
 * every colum is a stack.
 * @param {Number} columns the number of columns of the table
 * @param {Number} rows    the max number of rows of the table
 */
ConnectionFourApp.Board = function (columns, rows) {
	var self = this;

	this.columnsCount = columns;
	this.rowsCount = rows;

	// Create board to manage the game
	this.columns = [];
	for (var i = 0; i < this.columnsCount; i++) {
		this.columns[i] = [];
	}

	/**
	 * Count the number of connected cell starting from (col, row).
	 * The connection rule follow the four connections game rules (vertical, horizontal or diagonal).
	 * If there are more than one valid connection (ex: a vertical and a diagonal connection), return
	 * the size of the longest one.
	 *
	 * @param  {[type]} col [description]
	 * @param  {[type]} row [description]
	 * @return {[type]}     [description]
	 */
	this.countConnection = function (col, row) {
		// Horizontal connections
		var rowPoints = -1 + _countDirectionConnection(col, row, 1, 0) + _countDirectionConnection(col, row, -1, 0);
		// Vertical connections
		var colPoints = -1 + _countDirectionConnection(col, row, 0, 1) + _countDirectionConnection(col, row, 0, -1);
		// Diagonal connection (top-left -> bottom-right)
		var diagonalPoints_tlbr = -1 + _countDirectionConnection(col, row, 1, 1) + _countDirectionConnection(col, row, -1, -1);
		// Diagonal connection (bottom-left -> top-right)
		var diagonalPoints_bltr = -1 + _countDirectionConnection(col, row, 1, -1) + _countDirectionConnection(col, row, -1, 1);

		var maxPoints = Math.max(rowPoints, colPoints, diagonalPoints_tlbr, diagonalPoints_bltr);

		return maxPoints;
	};

	function _countDirectionConnection(col, row, hdir, vdir) {
		if (hdir === 0 && vdir === 0) {
			return 1;
		}

		if (hdir !== 0) {
			hdir = (hdir > 0) ? 1 : -1;
		}

		if (vdir !== 0) {
			vdir = (vdir > 0) ? 1 : -1;
		}

		var value = self.columns[col][row];

		// The (col, row) cell is always 1 point.
		var points = 1;
		for (var i = 1; /* wait for a break */; i++) {

			var c = col + (hdir * i);
			var r = row + (vdir * i);

			try {
				if (self.columns[c][r] == value) {
					points++;
				} else {
					break;
				}
			} catch (ex) {
				break;
			}
		}
		return points;
	}
};

/**
 * Push a new value on the column.
 * @param  {Number} column
 * @param  {Object} value
 */
ConnectionFourApp.Board.prototype.push = function(column, value) {
	if (column < 0 || column >= this.columns.length) {
		throw "Invalid column";
		// return false;
	}

	if (this.columns[column].length >= this.rowsCount) {
		// The column is full
		return false;
	}

	this.columns[column].push(value);
	return true;
};

/**
 * Remove an element from the top of a column and return it.
 * @param  {Number} column the colomn from you want to remove the element.
 * @return {Object}        The object on the top of the column
 */
ConnectionFourApp.Board.prototype.pop = function(column) {
	if (column < 0 || column >= this.columns.length) {
		throw "Invalid column";
		// return false;
	}

	return this.columns[column].pop();
};

/**
 * Return the value of the object of the top of the column.
 * @param  {Number} column [description]
 * @return {Object}        The object on the top of the column
 */
ConnectionFourApp.Board.prototype.top = function(column) {
	if (column < 0 || column >= this.columns.length) {
		throw "Invalid column";
		// return false;
	}

	var topPosition = this.columns[column].length - 1;
	return this.columns[column][topPosition];
};

/**
 * Return how many elements are in the column-th column.
 * @param  {[type]} column [description]
 * @return {[type]}        [description]
 */
ConnectionFourApp.Board.prototype.length = function(column) {
	if (column < 0 || column >= this.columns.length) {
		throw "Invalid column";
		// return false;
	}

	return this.columns[column].length;
};

ConnectionFourApp.Board.prototype.get = function(column, row) {
	if (column < 0 || column >= this.columnsCount) {
		throw "Invalid column";
		// return false;
	}

	if (row < 0 || row >= this.rowsCount) {
		throw "Invalid row";
		// return false;
	}

	return this.columns[column][row];
};

/**
 * Return the number of cell in this board.
 * @return {[type]} [description]
 */
ConnectionFourApp.Board.prototype.cellsCout = function() {
	return (this.columnsCount * this.rowsCount);
};
