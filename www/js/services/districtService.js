
myApp.factory('districtService', function ($http, $q, $state, $rootScope,loaderService) {


    var _data = {
        routes: [],
        loading: false,
        params: {
            distributionId: 0,
            districtId: 0,
            searchPhrase: "",
            currentPage: 1,
            resultsInPage: 500,
            orderBy: "RouteName"
        }
    }

    var _setDistrictId = function (distributionId, districtId) {
        var deferred = $q.defer();

        _data.params.distributionId = distributionId;
        _data.params.districtId = districtId;
        _loadDistrict().then(
            function (data) {
                
                deferred.resolve(data);
            },
            function () {
                deferred.reject();
            });

        return deferred.promise;

    }

    var _refresh = function () {
        var deferred = $q.defer();

        
        _loadDistrict().then(
            function (data) {
                deferred.resolve(data);
            },
            function () {
                deferred.reject();
            });

        return deferred.promise;

    }


    var _loadDistrict = function () {
        var deferred = $q.defer();

        _data.loading = true;
        loaderService.show();
        
        //$http.post(globalParams.baseUrl + '/Distributions/GetDistrictRoutes', _data.params).
        $http.post(globalParams.baseUrl + '/Distributions/GetRoutesByDistrict', _data.params).
            success(function (data, status, headers, config) {
                if (data && data.Results) {
                    _data.routes = data.Results;
                    deferred.resolve(_data.routes);
                }
                else {
                    deferred.reject();
                }
                _data.loading = false;
                loaderService.hide();

            }).
            error(function (data, status, headers, config) {
                _data.loading = false;
                loaderService.hide();
                deferred.reject(status);

            });
        return deferred.promise;
    };
    
   

    return {
        data: _data,
        setDistrictId: _setDistrictId
    }
});