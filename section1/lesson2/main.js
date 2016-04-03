var app = angular.module('myApp', []);

app.controller('MyCtrl', function($scope){
    $scope.formData = {};

    $scope.submit = function(form){
        if (form.$valid) {
            console.log($scope.formData);
        };
    }
});