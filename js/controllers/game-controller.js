/*jslint node: true */
'use strict';

function GameController($scope, Storage, game) {

	$scope.game = game;

	$scope.makeMove = function (col) {
		// The player who makes the move
		var player = game.getCurrentPlayer();

		// Perform the move
		game.put(col);

		if (game.isEnded()) {
			// With this move the game reached an "end" state.
			$scope.$apply();

			if (game.won()) {
				// Check if player won
				alert(player.name + " won!");
			} else {
				// Check if the game ended
				alert("None won! :(");
			}

			savePlaythrough();

			// Reset the game
			game.reset();
			return;
		}
	};


	function savePlaythrough () {
		var lastPlaythrough = game.getState();
		lastPlaythrough.date = (new Date()).getTime();

		Storage.save(lastPlaythrough).
			then(function() {
				// this callback will be called asynchronously
				// when the response is available
			});
	}

}
