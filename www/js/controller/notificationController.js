myApp.controller('notificationController', function ($scope, $location, $stateParams, $filter, $ionicPopup, $rootScope, $ionicScrollDelegate, $state, $timeout, localize, notificationService, loaderService, localStorageService) {

    $rootScope.showMenu = true;

    notificationService.getNotifications().then(
        function (data) {
            $scope.notifications = notificationService.data.notifications;
            $scope.$broadcast('scroll.refreshComplete');
        },
        function (data) {
            $scope.notifications = null;
            $scope.$broadcast('scroll.refreshComplete');
        });

    $scope.remove = function (index, item) {
        if ($scope.notifications) {
            //alert(item.NotificationTypeId + ' | item.DistributionItemId: ' + item.DistributionItemId);
            //alert(item.NotificationTypeId + ' | item.DistributionRouteId: ' + item.DistributionRouteId);

            var confirmPopup = $ionicPopup.show({
                title: $filter('i18n')("removeTitle"),
                template: $filter('i18n')("removeNotification"),
                scope: $scope,
                buttons: [
                    {
                        text: $filter('i18n')("cancel")
                    },
                    {
                        text: $filter('i18n')("ok"),
                        type: 'button-positive',
                        onTap: function (e) {
                            return 'ok';
                        }
                    }
                ]
            });
            confirmPopup.then(function (res) {
                if (res && res == 'ok') {
                    
                    if (item.NotificationTypeId == 1 && item.DistributionItemId && item.DistributionItemId > 0) {
                        notificationService.removeSkippedNotification(item.DistributionItemId).then(
                        function (data) {
                            //alert('data: ' + data);
                            if (data) {
                                //console.log($scope.notifications[index]);
                                $scope.notifications.splice(index, 1);
                            }
                        },
                        function (data) {
                        });
                    }
                    else if (item.NotificationTypeId == 2 && item.DistributionRouteId && item.DistributionRouteId > 0) {
                        notificationService.removeDelayedNotification(item.DistributionRouteId).then(
                        function (data) {
                            //alert('data: ' + data);
                            if (data) {
                                //console.log($scope.notifications[index]);
                                $scope.notifications.splice(index, 1);
                            }
                        },
                        function (data) {
                        });
                    }

                }
                else {
                    //console.log('Cancel clicked!');
                }
            });

        }
    }

    $scope.doRefresh = function () {
        notificationService.getNotifications().then(
        function (data) {
            $scope.notifications = notificationService.data.notifications;
            $scope.$broadcast('scroll.refreshComplete');
        },
        function (data) {
            $scope.notifications = null;
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

})



