myApp.factory('routeOrderStateService', function ($rootScope, $ionicLoading) {

    var _data = {
        filter: 'reorder'
    }
    return {
        data: _data
    }
});