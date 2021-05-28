myApp.controller('changePasswordController', function ($scope, $location, $stateParams, $rootScope, $ionicViewService, $state, $timeout, localize, userService, loaderService) {
    $scope.message = "";
    $scope.details = "";
    $scope.passwordExpired = $stateParams.passwordExpired;
   
    $scope.passwords = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    }
    $rootScope.showMenu = true;


    $scope.changePassword = function (passwords) {
        $scope.details = "";

        if (passwords && passwords.oldPassword && passwords.newPassword && passwords.confirmPassword &&
            passwords.oldPassword != '' && passwords.newPassword != '' && passwords.confirmPassword != '') {

            if (passwords.newPassword != passwords.confirmPassword) {
                $scope.message = "סיסמה חדשה ואשר סיסמה לא תואמים";
                return;
            }

            userService.changePassword(passwords.oldPassword, passwords.newPassword).then(
                function (data) {
                    $scope.message = "הסיסמה עודכנה בהצלחה";
                    $scope.passwords = {
                        oldPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    }
                },
                function (data) {
                    $scope.message = " לא ניתן לעדכן את הסיסמה" 
                    $scope.details = data;


                });
        } else {
            $scope.message = "עליך למלא את כל השדות";
        }
    };



})






