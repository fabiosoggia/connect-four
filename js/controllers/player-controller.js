/*jslint node: true */
'use strict';

function PlaythroughPlayerController($scope, Storage) {

	$scope.game = null;
	$scope.playthroughs = Storage.data;

	function playAction(game, timeout, action) {
		setTimeout(function() {
			game.put(action.column);

			// Look at this:
			// http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
			$scope.$apply();
		}, timeout);
	}

	$scope.play = function (index) {
		var state = $scope.playthroughs[index];
		var game = new ConnectionFourApp.Game(state);
		$scope.game = game;
		for (var i = 0; i < state.actions.length; i++) {
			playAction(game, 500 * i, state.actions[i]);
			// $scope.game.put(state.actions[i].column);
		}
	};

}
