var app = angular.module('codecraft', [
	'ngResource'
]);

// it is called before http services being loaded
app.config(function ($httpProvider, $resourceProvider) {
	$httpProvider.defaults.headers.common['Authorization'] = 'Token 8286adb00e144417ea099cc6bdc0cf2d72eae4d0';

	// codecraft API always return the URL w/ slash at the end, so...
	$resourceProvider.defaults.stripTrailingSlashes = false;
});

app.controller('PersonDetailController', function ($scope, ContactService) {
	$scope.contacts = ContactService;
});

app.controller('PersonListController', function ($scope, ContactService) {

	$scope.search = "";
	$scope.order = "email";
	$scope.contacts = ContactService;

	$scope.sensitiveSearch = function (person) {
		if ($scope.search) {
			return person.name.indexOf($scope.search) == 0 ||
				person.email.indexOf($scope.search) == 0;
		}
		return true;
	};

});

// FACTORIES
app.factory('ContactFactory' , function ($resource) {
	return $resource('https://codecraftpro.com/api/samples/v1/contact/:id/');
})

app.service('ContactService', function (ContactFactory) {

	var self = {
		'addPerson': function (person) {
			this.persons.push(person);
		},
		'selectedPerson': null,
		'persons': [],
		'hasMore' : true,
		'isLoading' : false,
		'page' : 1,
		'loadPersons' : function () {
			ContactFactory.get(function (data) {
				angular.forEach(data.results, function (person) {
					self.persons.push(new ContactFactory(person));
				})
			});
		}

	};

	self.loadPersons();

	return self;

});