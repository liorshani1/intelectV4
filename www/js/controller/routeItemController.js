myApp.controller('routeItemController',     function ($scope, $location, $stateParams, $rootScope, $state, $filter, $timeout, $ionicPopup, localize, routeService, loaderService) {
    $scope.item = routeService.data.currentItem;
    $scope.enableDelivery = false;

    

})



