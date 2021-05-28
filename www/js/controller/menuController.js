myApp.controller('menuController', function ($scope, $state, $rootScope, notificationService, userService, $ionicViewService) {

    $rootScope.showMenu = true;

    $scope.signout = function () {

        userService.signout();
        //localStorage["username"] = "";
        $ionicViewService.nextViewOptions({
            disableBack: true
        });
        $scope.isSignedIn = false;
        $state.go('app.signin', { signout: true });
    };

    /**** SINGLE USER LOGIN ****/
    ////////$scope.signout = function () {

    ////////    //HS[2016-nov-25] - Stop checking user session
    ////////    userService.stop();

    ////////    notificationService.stop();

    ////////    userService.signout();
    ////////    //localStorage["username"] = "";

    ////////    //HS [2016-nov-24] - Clears the user session from storage
    ////////    localStorage["cus"] = "";
    ////////    $ionicViewService.nextViewOptions({
    ////////        disableBack: true
    ////////    });
    ////////    $scope.isSignedIn = false;
    ////////    $state.go('app.signin', { signout: true });
    ////////};

    //$scope.changeLang = function () {
    //    if ($rootScope.appLanguage == "he") {
    //        localStorage["mvlang"] = "en";
    //        $window.location.reload();
    //    } else {
    //        localStorage["mvlang"] = "he";
    //        $window.location.reload();
    //    }
    //    localize.initLocalizedResources();
    //};

})
