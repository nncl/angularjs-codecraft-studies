var app = angular.module('codecraft', [
	'ngResource',
	'infinite-scroll',
	'angularSpinner',
	'jcs-autoValidate',
	'angular-ladda',
	'mgcrea.ngStrap'
]);

// it is called before http services being loaded
app.config(function ($httpProvider, $resourceProvider, laddaProvider) {
	$httpProvider.defaults.headers.common['Authorization'] = 'Token 8286adb00e144417ea099cc6bdc0cf2d72eae4d0';

	// codecraft API always returns the URL w/ slash at the end, so...
	$resourceProvider.defaults.stripTrailingSlashes = false;

	laddaProvider.setOption({
		style : 'expand-right'
	});
});

app.controller('PersonDetailController', function ($scope, ContactService) {
	$scope.contacts = ContactService;

	$scope.save = function () {
		$scope.contacts.updateContact($scope.contacts.selectedPerson);
	};

	$scope.remove = function () {
		$scope.contacts.removeContact($scope.contacts.selectedPerson);
	}
});

app.controller('PersonListController', function ($scope, $modal, ContactService) {

	$scope.search = "";
	$scope.order = "email";
	$scope.contacts = ContactService;

	$scope.openModal = function () {
		$scope.contacts.selectedPerson = {};
		$scope.createModal = $modal({
			scope : $scope,
			template : 'templates/modal.html',
			show : true
		});
	};

	$scope.createContact = function () {
		$scope.contacts.createContact($scope.contacts.selectedPerson);
	};

	$scope.$watch('search', function (newVal, oldVal) {
		if(angular.isDefined(newVal)){
			$scope.contacts.doSearch(newVal);
		}
	});

	$scope.$watch('order', function (newVal, oldVal) {
		if(angular.isDefined(newVal)){
			$scope.contacts.doOrder(newVal);
		}
	});

	$scope.loadMore = function () {
		console.log('PersonListCtrl::loadMore()');
		$scope.contacts.loadMore();
	};

});

// FACTORIES
app.factory('ContactFactory' , function ($resource) {
	return $resource('https://codecraftpro.com/api/samples/v1/contact/:id/',
        {id : '@id'},
        {update : {
            method : 'PUT'
        }
    });
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
		'isSaving' : false,
		'page' : 1,
		'search' : null,
		'ordering' : null,
		'doSearch' : function (search) {
			self.hasMore = true;
			self.page = 1;
			self.persons = [];
			self.search = search;
			self.loadPersons();
		},
		'doOrder' : function (order) {
			self.hasMore = true;
			self.page = 1;
			self.persons = [];
			self.ordering = order;
			self.loadPersons();
		},
		'loadPersons' : function () {
			if (self.hasMore & !self.isLoading) {
				self.isLoading = true;

				var params = {
					"page" : self.page,
					"search" : self.search,
					"ordering" : self.ordering
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
		},
		'updateContact' : function (person) {
			console.log('Updated');
			console.log(person);
            self.isSaving = true;
            // ContactFactory.update(person).$promise.then(function () {
            //     self.isSaving = false;
            // });
            person.$update().then(function () {
                self.isSaving = false;
            });
		},
		'removeContact' : function (person) {
            self.isDeleting = true;
            person.$remove().then(function () {
                self.isDeleting = false;
				var index = self.persons.indexOf(person);
				self.persons.splice(index, 1);
				self.selectedPerson = null;
            });
		},
		'createContact' : function (person) {
			self.isSaving = true;
			ContactFactory.save(person).$promise.then(function () {
				self.isSaving = false;
			});
		}

	};

	self.loadPersons();

	return self;

});