var app = angular.module('ConnectFourApp', []);

app.factory('game', function() {

	var settings = {
		/**
		 * The players of the game.
		 */
		players: [
			// Check out this amazing palette:
			// http://www.colourlovers.com/palette/3807033/Ripe_as_Summer_Fruit
			{ name: "Player 1", color: "#FA7F8A" },
			// { name: "Player 2", color: "#FAAA97" },
			// { name: "Player 3", color: "#FCD287" },
			{ name: "Player 4", color: "#FCF887" },
			// { name: "Player 5", color: "#9FD1A7" },
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

	return new ConnectionFourApp.Game(settings);
});

/**
 * This is used to store and poll data using a web api.
 */
app.factory('WebApi', function($http, $timeout) {
	// Check this:
	// http://stackoverflow.com/questions/14944936/angularjs-global-http-polling-service
	$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	var apiurl = "api/playthrough/index.php";
	var data = [];
	var poller = function() {
		$http.get(apiurl).then(function(r) {
			data.length = 0;
			for (var i = 0; i < r.data.length; i++) {
				data.push(r.data[i]);
			}
			data.reverse();
			$timeout(poller, 2000);
		});
	};
	poller();

	function save (obj) {
		return $http.post('api/playthrough/index.php', obj);
	}

	return {
		data: data,
		save: save
	};
});

/**
 * This is used to store and poll data using a local storage.
 */
app.factory('LocalApi', function($timeout, $q) {
	var KEY = "CONNECT4_PLAYTHROUGH";
	var data = [];
	var poller = function() {
		data.length = 0;
		var list = JSON.parse(localStorage.getItem(KEY)) || [];
		for (var i = 0; i < list.length; i++) {
			data.push(list[i]);
		}
		$timeout(poller, 2000);
	};
	poller();

	/**
	 * Save the current playthrough.
	 * @return {Boolean} true if the save process success, false otherwise.
	 */
	function save(obj) {
		var list = JSON.parse(localStorage.getItem(KEY)) || [];
		list.unshift(obj);
		localStorage.setItem(KEY, JSON.stringify(list));
		var deferred = $q.defer();


		setTimeout(function() {
			deferred.resolve('Hello, ' + name + '!');
		}, 0);

		return deferred.promise;


	}

	return {
		data: data,
		save: save
	};
});

// app.run(function(WebApi) {});

// Chage LocalApi/WebApi according to your setting
// Default is LocalApi
app.controller('GameController', ['$scope', 'LocalApi', 'game', GameController]);
app.controller('PlaythroughPlayerController', ['$scope', 'LocalApi', PlaythroughPlayerController]);