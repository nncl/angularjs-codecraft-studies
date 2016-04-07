var app = angular.module('minmax', [
	'jcs-autoValidate'
]);

app.run(function (defaultErrorMessageResolver) {
		defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
			errorMessages['tooYoung'] = 'Você precisa ter pelo menos {0} anos para usar este site';
			errorMessages['tooOld'] = 'Você pode ter até {0} anos para usar este site';
			errorMessages['badUsername'] = 'Nome de Usuário somente pode conter número, letras e _';
		});
	}
);


app.controller('MinMaxCtrl', function ($scope, $http) {
	$scope.formModel = {};

	$scope.onSubmit = function () {

		console.log("Hey i'm submitted!");
		console.log($scope.formModel);

		$http.post('https://minmax-server.herokuapp.com/register/', $scope.formModel).
			success(function (data) {
				console.log(":)")
			}).error(function(data) {
				console.log(":(")
			});

	};
});