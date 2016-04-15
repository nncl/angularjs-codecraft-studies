var app = angular.module('codecraft', [
	'ngResource',
	'infinite-scroll'
]);

// it is called before http services being loaded
app.config(function ($httpProvider, $resourceProvider) {
	$httpProvider.defaults.headers.common['Authorization'] = 'Token 8286adb00e144417ea099cc6bdc0cf2d72eae4d0';

	// codecraft API always returns the URL w/ slash at the end, so...
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

	$scope.loadMore = function () {
		console.log('PersonListCtrl::loadMore()');
		$scope.contacts.loadMore();
	};

});

// FACTORIES
app.factory('ContactFactory' , function ($resource) {
	return $resource('https://codecraftpro.com/api/samples/v1/contact/:id/');
});

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
			if (self.hasMore & !self.isLoading) {
				self.isLoading = true;

				var params = {
					"page" : self.page
				};

				ContactFactory.get(params, function (data) {
					console.log(data);
					angular.forEach(data.results, function (person) {
						self.persons.push(new ContactFactory(person));
					});

					if(!data.next) {
						self.hasMore = false;
					}

					self.isLoading = false;
				});
			}
		},
		'loadMore' : function () {
			if (self.hasMore && !self.isLoading){
				self.page += 1;
				self.loadPersons();
			}
		}

	};

	self.loadPersons();

	return self;

});