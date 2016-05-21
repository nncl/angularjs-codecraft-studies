var app = angular.module('codecraft', [
    'ngResource',
    'infinite-scroll',
    'angularSpinner',
    'jcs-autoValidate',
    'angular-ladda',
    'mgcrea.ngStrap',
    'toaster',
    'ngAnimate',
    'ui.router'
]);

app.config(function ($httpProvider, $resourceProvider, laddaProvider, $datepickerProvider) {
    $httpProvider.defaults.headers.common['Authorization'] = 'Token 20002cd74d5ce124ae219e739e18956614aab490';
    $resourceProvider.defaults.stripTrailingSlashes = false;
    laddaProvider.setOption({
        style: 'expand-right'
    });
    angular.extend($datepickerProvider.defaults, {
        dateFormat: 'd/M/yyyy',
        autoclose: true
    });
});

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('list', {
            url: '/',
            templateUrl: 'templates/list.html',
            controller: 'PersonListController'
        })
        .state('edit', {
            url: '/edit/:email',
            templateUrl: 'templates/edit.html',
            controller: 'PersonDetailController'
        })
        .state('create', {
            url: '/create',
            templateUrl: 'templates/edit.html',
            controller: 'PersonCreateController'
        })
    ;

    $urlRouterProvider.otherwise('/');
});

app.filter('defaultImage', function () {
    return function (input, param) {
        if (!input) {
            return param
        }
        return input;
    }
});

angular.module('phonecatFilters', []).filter('checkmark', function () {
    return function (input) {
        return input ? '\u2713' : '\u2718';
    };
});

app.factory("Contact", function ($resource) {
    return $resource("https://codecraftpro.com/api/samples/v1/contact/:id/", {id: '@id'}, {
        update: {
            method: 'PUT'
        }
    });
});

app.controller('PersonDetailController', function ($scope, $stateParams, $state, ContactService) {
    $scope.mode = 'Edit';

    var email = $stateParams.email;

    $scope.contacts = ContactService;
    $scope.contacts.selectedPerson = $scope.contacts.getPerson(email);

    $scope.save = function () {
        $scope.contacts.updateContact($scope.contacts.selectedPerson).then(function () {
            $state.go('list');
        });
    };

    $scope.remove = function () {
        $scope.contacts.removeContact($scope.contacts.selectedPerson).then(function () {
            $state.go('list');
        });
    }
});

app.controller('PersonCreateController', function ($scope, $stateParams, $state, ContactService) {
    $scope.mode = 'Create';

    $scope.save = function () {
        console.log("createContact");
        $scope.contacts.createContact($scope.contacts.selectedPerson)
            .then(function () {
                $scope.go('list');
            });
    };
});

app.controller('PersonListController', function ($scope, $modal, ContactService) {

    $scope.search = "";
    $scope.order = "email";
    $scope.contacts = ContactService;

    $scope.loadMore = function () {
        $scope.contacts.loadMore();
    };

    $scope.showCreateModal = function () {
        $scope.contacts.selectedPerson = {};
        $scope.createModal = $modal({
            scope: $scope,
            template: 'templates/modal.create.tpl.html',
            show: true
        })
    };

});

app.service('ContactService', function ($q, $rootScope, Contact, toaster) {


    var self = {
        'page': 1,
        'hasMore': true,
        'isLoading': false,
        'isSaving': false,
        'selectedPerson': null,
        'persons': [],
        'search': null,
        'ordering': 'name',
        'getPerson': function (email) {
            for (var i = 0; i < self.persons.length; i++) {
                var obj = self.persons[i];

                if (obj.email == email) {
                    return obj;
                }
            }
        },
        'doSearch': function () {
            self.hasMore = true;
            self.page = 1;
            self.persons = [];
            self.loadContacts();
        },
        'doOrder': function () {
            self.hasMore = true;
            self.page = 1;
            self.persons = [];
            self.loadContacts();
        },
        'loadContacts': function () {
            if (self.hasMore && !self.isLoading) {
                self.isLoading = true;

                var params = {
                    'page': self.page,
                    'search': self.search,
                    'ordering': self.ordering
                };

                Contact.get(params, function (data) {
                    console.log(data);
                    angular.forEach(data.results, function (person) {
                        self.persons.push(new Contact(person));
                    });

                    if (!data.next) {
                        self.hasMore = false;
                    }
                    self.isLoading = false;
                });
            }

        },
        'loadMore': function () {
            if (self.hasMore && !self.isLoading) {
                self.page += 1;
                self.loadContacts();
            }
        },
        'updateContact': function (person) {
            var d = $q.defer();
            self.isSaving = true;
            person.$update().then(function () {
                self.isSaving = false;
                toaster.pop('success', 'Updated ' + person.name);
                d.resolve();
            });
            return d.promise;
        },
        'removeContact': function (person) {
            var d = $q.defer();
            self.isDeleting = true;
            person.$remove().then(function () {
                self.isDeleting = false;
                var index = self.persons.indexOf(person);
                self.persons.splice(index, 1);
                self.selectedPerson = null;
                toaster.pop('success', 'Deleted ' + person.name);
                d.resolve();
            });
            return d.promise;
        },
        'createContact': function (person) {
            var d = $q.defer();
            self.isSaving = true;
            Contact.save(person).$promise.then(function () {
                self.isSaving = false;
                self.selectedPerson = null;
                self.hasMore = true;
                self.page = 1;
                self.persons = [];
                self.loadContacts();
                toaster.pop('success', 'Created ' + person.name);
                d.resolve()
            });
            return d.promise;
        },
        'watchFilters': function () {
            /* Shortcut for this:

             $rootScope.$watch('search', function (newVal) {
             if (angular.isDefined(newVal)) {
             self.doSearch();
             }

             });*/

            $rootScope.$watch(function () {
                return self.search;
            }, function (newVal) {
                if (angular.isDefined(newVal)) {
                    self.doSearch();
                }
            });

            $rootScope.$watch(function () {
                return self.ordering;
            }, function (newVal) {
                if (angular.isDefined(newVal)) {
                    self.doOrder();
                }
            })
        }

    };

    self.loadContacts();
    self.watchFilters();

    return self;

});