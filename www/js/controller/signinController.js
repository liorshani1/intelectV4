myApp.controller('signinController', function ($scope, $location, $stateParams, $rootScope, $filter, $ionicPopup, $ionicViewService, $state, $timeout, localize, userService, loaderService, $cordovaBarcodeScanner) {
    $scope.message = "";
    $scope.user = {};
    $scope.sms = {};
    $scope.user.username = localStorage["username"];
    $scope.sms.phonenumber = localStorage["phonenumber"];
    $rootScope.showMenu = false;
    $rootScope.currentTab = localStorage["signintab"] || "password";

    $scope.signIn = function (user) {
        //console.log('sign in attempt');

        if (user && user.username && user.password) {
          //console.log('before userService.Signin');

            userService.signin(user.username, user.password).then(
              function (data) {
                //console.log('userService.Signin success');

                    localStorage["username"] = user.username;
                    localStorage["signintab"] = "password";
                    //HS
                    localStorage["role"] = data.Results.role;
                    $scope.message = "success";
                    $ionicViewService.nextViewOptions({
                        disableBack: true
                    });
                    $rootScope.showMenu = true;

                    $state.go('app.home');
                },
                function (data) {
                  //console.log('userService.Signin error');

                  //console.log(data);
                    //alert(data);
                    //alert(data.ErrorMessage);
                    if (data && data.ErrorMessage) {
                        $scope.message = data.ErrorMessage;
                    } else {
                        $scope.message = "לא ניתן להתחבר";
                    }
                });
        } else {
            $scope.message = "עליך למלא שם משתמש וסיסמה";
        }
    };



   
    /**** SINGLE USER LOGIN ****/
    ////////$scope.signIn = function (user) {
    ////////    console.log('sign in attempt');

    ////////    if (user && user.username && user.password) {
    ////////        //HS [2016-nov-24] - Passed the user session to login api
    ////////        userService.signin(user.username, user.password, localStorage["cus"]).then(
    ////////            function (data) {
    ////////                //console.log('data');
    ////////                //console.log(data);
    ////////                localStorage["username"] = user.username;
    ////////                localStorage["signintab"] = "password";
    ////////                //HS
    ////////                localStorage["role"] = data.Results.role;
    ////////                $scope.message = "success";
    ////////                //HS [2016-nov-24] - Set the user session in storage
    ////////                localStorage["cus"] = data.Results.cus;
    ////////                $ionicViewService.nextViewOptions({
    ////////                    disableBack: true
    ////////                });
    ////////                $rootScope.showMenu = true;

    ////////                $state.go('app.home');
    ////////            },
    ////////            function (data) {
    ////////                //alert(data);
    ////////                //alert(data.ErrorMessage);
    ////////                if (data && data.ErrorMessage) {
    ////////                    $scope.message = data.ErrorMessage;
    ////////                } else {
    ////////                    $scope.message = "לא ניתן להתחבר";
    ////////                }
    ////////            });
    ////////    } else {
    ////////        $scope.message = "עליך למלא שם משתמש וסיסמה";
    ////////    }
    ////////};


    var _GetUser = function () {
        userService.getUser().then(
        function (data) {
            $state.go('app.home');
        },
        function (data) {
        });
    }

    /**** SINGLE USER LOGIN ****/
    ////////var _GetUser = function () {
    ////////    //HS [2016-nov-24] - Passed the user session to getUser api
    ////////    userService.getUser(localStorage["cus"]).then(
    ////////    function (data) {
    ////////        localStorage["role"] = data.Results.role;
    ////////        //console.log('getUser');
    ////////        //console.log(data);
    ////////        //HS [2016-nov-24] - Set the user session in storage
    ////////        localStorage["cus"] = data.Results.cus;
    ////////        $state.go('app.home');
    ////////    },
    ////////    function (data) {
    ////////    });
    ////////}
    
    if ($stateParams.signout == "false") {
        _GetUser();
    }

    $scope.signInWithSMS = function (sms) {
        if (sms && sms.phonenumber && sms.token) {
            userService.validateSmsToken(sms.phonenumber, sms.token).then(
                function (data) {
                    localStorage["phonenumber"] = sms.phonenumber;
                    localStorage["signintab"] = "sms";
                    $scope.message = "success";
                    $ionicViewService.nextViewOptions({
                        disableBack: true
                    });
                    $rootScope.showMenu = true;

                    $state.go('app.home');
                },
                function (data) {
                    if (data && data.ErrorMessage) {
                        $scope.message = data.ErrorMessage;
                    } else {
                        $scope.message = "לא ניתן להתחבר";
                    }
                });
        } else {
            $scope.message = "עליך למלא מספר טלפון וקוד כניסה";
        }
        sms.token = "";

    }

    $scope.getToken = function (sms) {
        if (sms && sms.phonenumber) {
            userService.requestSmsToken(sms.phonenumber).then(
                function (data) {
                    $scope.message = "קוד כניסה נשלח למספר המבוקש";
                },
                function (data) {
                    if (data && data.ErrorMessage) {
                        $scope.message = data.ErrorMessage;
                    } else {
                        $scope.message = "לא ניתן לשלוח קוד כניסה למספר המבוקש";
                    }
                });
        } else {
            $scope.message = "עליך למלא מספר טלפון";
        }
        sms.token = "";

    }

    $scope.setCurrentTab  = function(tab){
        $scope.currentTab = tab;

    }

    $scope.forgotPassword = function () {
        var alertPopup = $ionicPopup.alert({
            title: $filter('i18n')("forgotpassword"),
            template: $filter('i18n')("forgotpasswordMessage")
        });
    }


})






