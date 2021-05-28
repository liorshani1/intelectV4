
myApp.factory('notificationService', function ($http, $q, $state, $rootScope, $interval, $window, loaderService, $filter, $ionicPopup, $timeout, multiplePopupService) {

    var _data = {
        running: false,
        calling: false,
        skipped: {
            lastUpdatedOn: null,
            notifications: [],
            count: 0
        },
        notifications: null
    }

    var notify;

    var _start = function () {
        var deferred = $q.defer();

        if (angular.isDefined(notify)) return deferred.promise;

        _data.running = true;
        
        notify = $interval(function () {
            if (_data.calling) { return; }

            _data.calling = true;
            deferred.resolve(_data.calling);

            //var curTime = new Date();
            //curUTCTime = new Date(Date.UTC(curTime.getFullYear(), curTime.getMonth(), curTime.getDate(), curTime.getHours(), curTime.getMinutes(), curTime.getSeconds(), curTime.getMilliseconds()));

            _data.skipped.count = _data.skipped.count + 1;
            _data.skipped.lastUpdatedOn = (new Date()).toJSON();
            deferred.resolve(_data.skipped);
            //console.log(_data);

            var params = {
                lastTime: _data.skipped.lastUpdatedOn,
                minutesInterval: -1
            }

            $http.post(globalParams.baseUrl + '/Distributions/GetRecentDistributionItemsForNotification', params).
                success(function (data, status, headers, config) {

                    _data.calling = false;
                    deferred.resolve(_data.calling);

                    //console.log('GetRecentDistributionItemsForNotification: ' + data);
                    if (data && data.Results) {
                        if (data.Results.length > 0) {
                            var confirmPopup = [];
                            for (var index = 0; index < data.Results.length; index++) {

                                multiplePopupService.show('alert', {
                                    title: $filter('i18n')("notifications"),
                                    template: data.Results[index].NotificationText,
                                    scope: $rootScope,
                                    buttons: [
                                        {
                                            text: $filter('i18n')("ok"),
                                            type: 'button-positive'
                                        }
                                    ]
                                });

                            }
                        }
                    }
                }).
                error(function (data, status, headers, config) {
                    _data.calling = false;
                    deferred.resolve(_data.calling);
                });

            //_data.calling = false;
            //deferred.resolve(_data.calling);
        }, 60000);

        deferred.resolve(_data.running);

        return deferred.promise;
    };

    var _stop = function () {
        var deferred = $q.defer();

        if (angular.isDefined(notify)) {
            $interval.cancel(notify);
            _data.running = false;
            _data.calling = false;
            _data.skipped.count = 0;
            _data.skipped.lastUpdatedOn = null;
            notify = undefined;
            console.log('stopped');
        }

        deferred.resolve(_data.running);
        deferred.resolve(_data.calling);
        deferred.resolve(_data.skipped);

        return deferred.promise;
    };

    var _getNotifications = function () {
        var deferred = $q.defer();

        loaderService.show();

        $http.get(globalParams.baseUrl + '/Distributions/GetDistributionItemsForNotification').
            success(function (data, status, headers, config) {
                //console.log(data.Results);
                if (data && data.Results) {
                    _data.notifications = data.Results;
                }
                else {
                    _data.notifications = null;
                }

                deferred.resolve(_data.notifications);

                loaderService.hide();
            }).
            error(function (data, status, headers, config) {
                _data.notifications = null;
                deferred.resolve(_data.notifications);
            });
        return deferred.promise;
    }

    var _removeSkippedNotification = function (distributionItemId) {
        var deferred = $q.defer();

        loaderService.show();

        var params = {
            distributionItemId: distributionItemId
        }

        $http.post(globalParams.baseUrl + '/Distributions/RemoveSkippedDistributionItem', params).
            success(function (data, status, headers, config) {
                //console.log(data.Results);

                deferred.resolve(data.Results);

                loaderService.hide();
            }).
            error(function (data, status, headers, config) {
            });
        return deferred.promise;
    }

    var _removeDelayedNotification = function (distributionRouteId) {
        var deferred = $q.defer();

        loaderService.show();

        var params = {
            distributionRouteId: distributionRouteId
        }

        $http.post(globalParams.baseUrl + '/Distributions/RemoveDelayedDistributionItem', params).
            success(function (data, status, headers, config) {
                //console.log(data.Results);

                deferred.resolve(data.Results);

                loaderService.hide();
            }).
            error(function (data, status, headers, config) {
            });
        return deferred.promise;
    }


    return {
        data: _data,
        start: _start,
        stop: _stop,
        getNotifications: _getNotifications,
        removeSkippedNotification: _removeSkippedNotification,
        removeDelayedNotification: _removeDelayedNotification
    }
});

