/*jslint node: true */
'use strict';

function MultiplayerGameController($scope, Storage, game, $location, SimpleWebRTC) {

	var playerId = 0;

	$scope.game = game;
	$scope.status = "";
	$scope.invalid = false;

	reset();
	$scope.room = ($location.hash() || (new Date()).getTime()) + "";
	$location.hash($scope.room);
	$scope.url = $location.absUrl();

	var webrtc = new SimpleWebRTC({
		// we don't do video
		localVideoEl: "",
		remoteVideosEl: "",
		// dont ask for camera access
		autoRequestMedia: false,
		// dont negotiate media
		receiveMedia: {
			mandatory: {
				OfferToReceiveAudio: false,
				OfferToReceiveVideo: false
			}
		}
	});

	webrtc.createRoom($scope.room, function (err, name) {
		if (err) {
			webrtc.joinRoom($scope.room);
			playerId = 1;
			return;
		}
	});

	/**
	 * Return true if there are enougth player to play the game.
	 * @return {[type]} [description]
	 */
	$scope.isPlayable = function () {
		return (webrtc.getPeers().length > 0);
	};

	function onPeer(peer) {
		if (webrtc.getPeers().length > 1) {
			webrtc.disconnect();
			$scope.invalid = true;
			$scope.status = "Retry later";
			return;
		}

		console.log("createdPeer", peer);

		if (!peer || !peer.pc) {
			return;
		}

		peer.pc.on('iceConnectionStateChange', function () {
			var state = peer.pc.iceConnectionState;
			onConnectionStateChange(peer, state);
		});
	}
	webrtc.on("createdPeer", onPeer);


	function onConnectionStateChange (peer, state) {
		switch (state) {
			case "checking":
				$scope.status = "Connecting to peer...";
				break;
			case "connected":
			case "completed": // on caller side
				$scope.status = "Connection established.";
				break;
			case "disconnected":
			case "failed":
			case "closed":
				reset();
				break;
		}
	}
	webrtc.connection.on("message", function(data) {
		if(data.type === "protocol") {
			onProtocolMessage(data.payload);
		}
	});


	function sendProtocolMessage (message) {
		webrtc.sendToAll("protocol", message);
	}

	function onProtocolMessage (payload) {
		if ($scope.isMyTurn()) {
			// It's your turn, the other player can't move
			return;
		}
		move(payload.column);
	}


	$scope.isMyTurn = function () {
		var currentPlayerId = game.getCurrentPlayerId();
		return (playerId === currentPlayerId);
	};

	$scope.makeMove = function (col) {
		if (!$scope.isPlayable()) {
			return;
		}

		// The player who want to makes the move
		var player = game.getCurrentPlayer();
		var currentPlayerId = game.getCurrentPlayerId();

		if (!$scope.isMyTurn()) {
			// It's not your turn
			return;
		}

		// Perform the move
		move(col);
		sendProtocolMessage({ column: col });
	};

	function move (col) {
		// The player who makes the move
		var player = game.getCurrentPlayer();

		// Perform the move
		game.put(col);

		if (game.isEnded()) {
			// With this move the game reached an "end" state.

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
	}

	function reset () {
		$scope.status = "Waiting for a player";
		$scope.game.reset();
		playerId = 0;
	}



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
