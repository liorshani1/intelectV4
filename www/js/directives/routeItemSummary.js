myApp.directive('routeItemSummary', function (locationsService) {
    return {
        restrict: 'A',
        templateUrl: 'templates/directives/routeItemSummary.html',
        controller: function ($scope, $state) {
            $scope.$watch(function () { return locationsService.data.selectedLocation; }, function (data) {
                $scope.location = data;
            }, true);

           
            
        },
        link: function (scope, elem, attrs) {
            //scope.$watch(function () { return locationsService.data.selectedLocation; }, function (data) {
            //    scope.location = data;
            //    $scope.apply();
            //}, true);

        }
    }
});