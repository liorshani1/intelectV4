
myApp.factory('assignmentsService', function ($http, $q, $state, $rootScope,loaderService) {

    var _data = {
        assignments: [],
        loading : false
    }


    var _getAssignments = function () {
        var deferred = $q.defer();

        _data.loading = true;
        loaderService.show();


        $http.post(globalParams.baseUrl + '/Distributions/GetMyCurrentAssignments', null).
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    _data.assignments = data.Results;
                    deferred.resolve(data.Results);
                }
                else {
                    _data.assignments = null;
                    deferred.reject();
                }
                _data.loading = false;
                loaderService.hide();

            }).
            error(function (data, status, headers, config) {
                _data.loading = false;
                loaderService.hide();
                _data.assignments = null;
                deferred.reject(status);

            });
        return deferred.promise;
    };
    


    return {
        data: _data,
        getAssignments: _getAssignments
    }
});