myApp.controller('deliveryController', function ($scope, $location, $stateParams, $rootScope, $state, $filter, $timeout, $ionicPopup, localize, routeService, loaderService, $cordovaCamera) {
    $scope.message = "";
    $scope.item = null;
    $scope.comment = { text: "" };
    $scope.enableDelivery = true;
    $scope.imgURI = "http://placehold.it/300x300"; //HS
    $scope.commentImgURI = "http://placehold.it/300x300"; //HS [2016-nov-3]

    if ($stateParams.distributionId == null || $stateParams.routeId == null || $stateParams.part == null) {
        return;
    }

    if ($stateParams.distributionId && $stateParams.routeId) {
        //HS [2017-oct-26] - Get triggeredFrom param to set autoSetCurrentItem param 
        var autoSetCurrentItem = true;
        if ($stateParams.triggeredFrom && $stateParams.triggeredFrom == 'home') {
            autoSetCurrentItem = true;
        }
        else if ($stateParams.triggeredFrom && $stateParams.triggeredFrom == 'order') {
            autoSetCurrentItem = false;
        }
        //HS [2017-oct-26] - Passed autoSetCurrentItem param 
        //HS [2016-Aug-22] - Passed autoSetCurrentItem=true instead of false to set the undelivered point as current point
        //routeService.setRouteId($stateParams.distributionId, $stateParams.routeId, $stateParams.part, true).then(
        routeService.setRouteId($stateParams.distributionId, $stateParams.routeId, $stateParams.part, autoSetCurrentItem).then(
            function (data) {
                $scope.item = data;
                $scope.currenItemIndex = routeService.data.currentItemIndex;
                $scope.enableDelivery = (routeService.data.currentRoute.routeStartTime && true);
                //HS [15-feb-2016] - Check the enableDelivery flag and set if passed with valid value and route not started
                if ($stateParams.enableDelivery != null && typeof ($stateParams.enableDelivery) != 'undefined' && $stateParams.enableDelivery == 1 && routeService.data.currentRoute.routeStartTime == null) {
                    $scope.enableDelivery = true;
                }
            },
            function () {
            })
    }

    var timer;

    
    $scope.deliverAndGetNextItem = function () {

        loaderService.show();

        //HS [2016-Aug-22] - Check whether the point is last or not
        var isLastItem = routeService.isLastItem();

        var item = routeService.deliverAndGetNextItem();

        if (timer) {
            $timeout.cancel(timer);
        }
        timer = $timeout(function () {
            $scope.item = item;
            $scope.currenItemIndex = routeService.data.currentItemIndex;
            $scope.imgURI = "http://placehold.it/300x300"; //HS
            loaderService.hide();

            if (isLastItem) {
                $state.go('app.home');
            }
        }, 2000);
        
    }

    //HS
    $scope.deliverWithImageAndGetNextItem = function () {

        loaderService.show();

        //HS [2016-Aug-22] - Check whether the point is last or not
        var isLastItem = routeService.isLastItem();

        if ($scope.imgURI != 'http://placehold.it/300x300') routeService.data.imageData = $scope.imgURI; //HS
        var item = routeService.deliverWithImageAndGetNextItem();

        if (timer) {
            $timeout.cancel(timer);
        }
        timer = $timeout(function () {
            $scope.item = item;
            $scope.currenItemIndex = routeService.data.currentItemIndex;
            $scope.imgURI = "http://placehold.it/300x300"; //HS
            loaderService.hide();

            if (isLastItem) {
                $state.go('app.home');
            }
        }, 2000);

    }

    $scope.undeliver = function () {

        var confirmPopup = $ionicPopup.confirm({
            title: $filter('i18n')("undeliver"),
            template: $filter('i18n')("undeliverMessage"),
            cancelText: $filter('i18n')("cancel"),
            okText: $filter('i18n')("ok")

        });
        confirmPopup.then(function (res) {
            if (res) {
                loaderService.show();
                var item = routeService.undeliver();

                if (timer) {
                    $timeout.cancel(timer);
                }
                timer = $timeout(function () {
                    $scope.item = item;
                    $scope.currenItemIndex = routeService.data.currentItemIndex;
                    loaderService.hide();

                }, 1000);
            }
        });
        
    }

    $scope.moveToNextItem = function () {

        //HS [2016-Aug-22] - Check whether the point is last or not
        var isLastItem = routeService.isLastItem();

        if ($scope.item.DeliveryTime) {
            $scope.item = routeService.next();
            $scope.currenItemIndex = routeService.data.currentItemIndex;

            if (isLastItem) {
                $state.go('app.home');
            }
        } else {
            var confirmPopup = $ionicPopup.confirm({
                title: $filter('i18n')("skipTitle"),
                template: $filter('i18n')("skipMessage"),
                cancelText: $filter('i18n')("cancel"),
                okText: $filter('i18n')("ok")

            });
            confirmPopup.then(function (res) {
                if (res) {
                    //HS
                    //$scope.item = routeService.next();
                    //$scope.currenItemIndex = routeService.data.currentItemIndex;

                    //HS
                    if ($scope.item.SkipTime) { //If already skipped then simply move to next point
                        $scope.item = routeService.next();
                        $scope.currenItemIndex = routeService.data.currentItemIndex;

                        if (isLastItem) {
                            $state.go('app.home');
                        }
                    }
                    else { //Skipped for the first time so send details to server
                        loaderService.show();
                        var item = routeService.skip();

                        if (timer) {
                            $timeout.cancel(timer);
                        }
                        timer = $timeout(function () {
                            $scope.item = item;
                            $scope.currenItemIndex = routeService.data.currentItemIndex;
                            loaderService.hide();

                            if (isLastItem) {
                                $state.go('app.home');
                            }
                        }, 2000);
                    }
                }
            });
        }

    }

    $scope.goToDeliveryItem = function () {
      if ($scope.item.DeliveryItemId) {
        $state.go('app.deliveryItem', { itemId: $scope.item.DeliveryItemId });
      }
      
      

    }

    $scope.moveToPrevItem = function () {

        $scope.item = routeService.prev();
        $scope.currenItemIndex = routeService.data.currentItemIndex;
    }


    $scope.openNavigation = function (item) {
        var address = $filter('navigationAddress')(item);
        console.log(address);
        if (window.plugins && window.plugins.webintent) {
            console.log('before webintent');
            window.plugins.webintent.startActivity({
                action: window.plugins.webintent.ACTION_VIEW,
                url: 'waze://?q=' + address + '&navigate=yes'
            },
            function () { },
            function () { alert('Failed to open URL via Android Intent') }
            );

        } else {
            console.log('before window.open');
            window.open('waze://?q=' + address + '&navigate=yes');
        }

    }

    $scope.addComment = function () {
        //HS [2017-oct-27] - Blank the comment text
        $scope.comment.text = "";
        $scope.commentImgURI = "http://placehold.it/300x300";

        var myPopup = $ionicPopup.show({
            template: '<textarea ng-model="comment.text" rows="5">',
            title: $filter('i18n')("addComment"),
            scope: $scope,
            buttons: [
              { text: $filter('i18n')("cancel") },
              {
                  text: '<b>' + $filter('i18n')("save") + '</b>',
                  type: 'button-positive',
                  onTap: function (e) {
                      if (!$scope.comment.text || $scope.comment.text == "") {
                          e.preventDefault();
                      } else {
                          return $scope.comment.text;
                      }
                  }
              }
            ]
        });
        myPopup.then(function (res) {
            //HS [2016-nov-3] - Moved code in the addCommentWithPicture function
            //if (res && res != "") {
            //    loaderService.show();

            //    routeService.comment(res);
            //    $scope.commentSuccess = true;
            //    timer = $timeout(function () {
            //        $scope.commentSuccess = false;
            //        loaderService.hide();

            //    }, 1000);
            //}
            //$scope.comment.text = "";

            //if ($scope.item.complaints && $scope.item.complaints.length) {
            //HS [2017-oct-26] - Checks for the length > 0
            if ($scope.item.complaints != null && typeof ($scope.item.complaints) != 'undefined' && $scope.item.complaints.length > 0) {
                //alert('save comment ONLY');
                addCommentInDB(res, null);
            }
            else {
                confirmCommentPicture(res);
            }
            
            //alert('main popup');
        });
    }

    //HS [2016-nov-3] - Show confirm popup to take picture with comment
    function confirmCommentPicture(comment) {
        if (comment && comment != "") {

            var confirmPopup = $ionicPopup.show({
                title: $filter('i18n')("photographerComment"),
                template: '<div>' + $filter('i18n')("photographerCommentConfirmText") + '</div>',
                scope: $scope,
                buttons: [
                    {
                        text: $filter('i18n')("no")
                    },
                    {
                        text: $filter('i18n')("yes"),
                        type: 'button-positive margin-right-5',
                        onTap: function (e) {
                            return 'yes';
                        }
                    }
                ]
            });
            confirmPopup.then(function (res) {
                if (res) {
                    //alert('show camera: ' + comment);
                    takeCommentPicture(comment);
                }
                else {
                    //alert('save comment without image');
                    addCommentInDB(comment, null);
                    //console.log('Cancel clicked!');
                }
            });

        }
        
    }

    //HS [2016-nov-3] - Show camera to take comment picture
    function takeCommentPicture(comment) {

        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 600,
            targetHeight: 600,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
            $scope.commentImgURI = "data:image/jpeg;base64," + imageData;

            var confirmPopup = $ionicPopup.show({
              title: $filter('i18n')("delivered"),
              cssClass: 'full-size',

                template: '<div class="list card"><div class="item item-image"><img ng-src="' + $scope.commentImgURI + '"></div></div>',
                scope: $scope,
                buttons: [
                    {
                        text: $filter('i18n')("cancel")
                    },
                    {
                        text: $filter('i18n')("retakepicture"),
                        type: 'button-positive',
                        onTap: function (e) {
                            return 'retakepicture';
                        }
                    },
                    {
                        text: $filter('i18n')("continue"),
                        type: 'button-positive margin-right-5',
                        onTap: function (e) {
                            if ($scope.commentImgURI == 'http://placehold.it/300x300') {
                                //don't allow the user to close unless user takes picture
                                e.preventDefault();
                            } else {
                                return $scope.commentImgURI;
                            }
                        }
                    }
                ]
            });
            confirmPopup.then(function (res) {
                if (res) {
                    if (res == 'retakepicture') {
                        takeCommentPicture(comment);
                    }
                    else {
                        //$scope.deliverWithImageAndGetNextItem();
                        //alert('save comment with image');
                        addCommentInDB(comment, res);
                    }
                }
                else {
                    //console.log('Cancel clicked!');
                    $scope.addComment();
                }
            });

        }, function (err) {
            // error
            alert(err);
            console.log(err);
        });

    }

    //HS [2016-nov-3] - Add comment with and/or without picture
    function addCommentInDB(comment, imageData) {
        //alert('add comment: ' + comment);
        //alert('image: ' + imageData);

        loaderService.show();

        if (imageData == null) {
            routeService.comment(comment);
        }
        else {
            routeService.commentWithPicture(comment, imageData);
        }
        $scope.commentSuccess = true;
        timer = $timeout(function () {
            $scope.commentSuccess = false;
            loaderService.hide();

        }, 1000);

        $scope.comment.text = "";
        $scope.commentImgURI = "http://placehold.it/300x300";
    }


    //HS
    $scope.takePicture = function () {

        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 600,
            targetHeight: 600,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;

            var confirmPopup = $ionicPopup.show({
                title: $filter('i18n')("delivered"),
                template: '<div class="list card"><div class="item item-image"><img ng-src="' + $scope.imgURI + '"></div></div>',
                scope: $scope,
                buttons: [
                    {
                        text: $filter('i18n')("cancel")
                    },
                    {
                        text: $filter('i18n')("retakepicture"),
                        type: 'button-positive',
                        onTap: function (e) {
                            return 'retakepicture';
                        }
                    },
                    {
                        text: $filter('i18n')("continue"),
                        type: 'button-positive margin-right-5',
                        onTap: function(e) {
                            if ($scope.imgURI == 'http://placehold.it/300x300') {
                                //don't allow the user to close unless user takes picture
                                e.preventDefault();
                            } else {
                                return $scope.imgURI;
                            }
                        }
                    }
                ]
            });
            confirmPopup.then(function (res) {
                if (res) {
                    if (res == 'retakepicture') {
                        $scope.takePicture();
                    }
                    else {
                        $scope.deliverWithImageAndGetNextItem();
                    }
                }
                else {
                    //console.log('Cancel clicked!');
                }
            });

        }, function (err) {
            // error
                                                alert(err);
                                                console.log(err);
        });

    }

})



