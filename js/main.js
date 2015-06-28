$(document).ready(function () {

	var settings = {
		/**
		 * The players of the game.
		 */
		players: [
			{ name: "Player 1", color: "#FA7F8A" },
			{ name: "Player 2", color: "#FCD287" },
		],
		/**
		 * The size of the grid.
		 */
		columns: 7,
		rows: 6,
		/**
		 * How many connections are required to win.
		 * @type {Number}
		 */
		connections: 4
	};


	/**
	 * The DOM root for the game UI
	 */
	var $root = $("#game");

	/**
	 * A game session.
	 */
	var game = null;

	// Run a new game session
	startGame();

	// Listener for the undo button
	$("#undo").click(function () {
		game.undo(function (column) {
			var $columns = $(".column");
			var $column = $($columns[column]);
			$column.find(".coin").last().remove();
		});
		return false;
	});


	function startGame () {
		game = new ConnectionFourApp.Game(settings);
		drawGrid($root, settings.columns);
	}

	function createPlayerCoin (player) {
		return $("<div></div>")
			.addClass("coin")
			.css("background-color", player.color);
	}

	function onClick (column) {
		console.log("Click on " + column);

		if (!game.put(column)) {
			return;
		}

		var player = game.getCurrentPlayer();
		var coin = createPlayerCoin(player);

		this.append(coin);

		if (game.won()) {
			alert(player.name + " won!");
			startGame();
		}

		if (game.isEnded()) {
			alert("None won!");
			startGame();
		}
	}

	function setListener ($element, column) {
		$element.click(function () {
			onClick.call($element, column);
		});
	}

	// Generate the grid
	function drawGrid ($element, columns) {
		// Clear the gamespace
		$element.html('');
		var width = 100 / columns;
		for (var i = 0; i < columns; i++) {
			var column = $("<div></div>")
				.addClass("column")
				.css("width", width + "%");

			setListener(column, i);

			$element.append(column);
		}
	}



});