var app = angular.module('AnglularSharePointApp', [
	'ngRoute',
]);


app.config(function ($routeProvider) {

	$routeProvider

	.when('/', {
		templateUrl: '../Views/home.html',
		controller: 'HomeController',
	})

	.otherwise({
		redirectTo: '/',
	});

});


app.run(function () {

});