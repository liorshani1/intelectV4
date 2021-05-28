
myApp.factory('userService', function ($http, $q, $state, $rootScope, loaderService, geolocation, $interval) {

    var _data = {
        isSignedIn: false,
        username: null,
        userData: null,
        loading: false,
        email: null,
        passwrodRegexPattern: ""

    }

    /**** SINGLE USER LOGIN ****/
    ////////var _data = {
    ////////    isSignedIn: false,
    ////////    username: null,
    ////////    userData: null,
    ////////    loading: false,
    ////////    email: null,
    ////////    passwrodRegexPattern: "",
    ////////    running: false, //HS [2016-nov-25]
    ////////    calling: false //HS [2016-nov-25]
    ////////}

    var _initAuthenticatedUser = function (userData) {
        _data.isSignedIn = true;
        //_data.email = userData.emaiAddress;
        _data.username = userData.username;
        _data.userData = userData;

    }

    var _initUnauthenticatedUser = function () {
        _data.isSignedIn = false;
        _data.username = null;
        _data.userData = null;
    }

    var _signout = function () {
        var deferred = $q.defer();

        _data.loading = true;
        loaderService.show();


        $http.post(globalParams.baseUrl + '/Account/AppLogout', null).
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    _initUnauthenticatedUser();
                    deferred.resolve();
                }
                else {
                    _initUnauthenticatedUser();
                    deferred.reject();
                }
                _data.loading = false;
                loaderService.hide();

            }).
            error(function (data, status, headers, config) {
                _initUnauthenticatedUser()
                deferred.reject(status);
                _data.loading = false;
                loaderService.hide();

            });
        return deferred.promise;
    };

    var _signin = function (username, password) {
        var deferred = $q.defer();

        _data.loading = true;
        loaderService.show();

        var signinParams = {
            UserName: username,
            Password: password,
            position: geolocation.stringifiedPosition()
        }
        //alert(globalParams.baseUrl);
        //alert(JSON.stringify(signinParams));
        //console.log('before appLogin');
        $http.post(globalParams.baseUrl + '/Account/AppLogin', { user: signinParams }).
            success(function (data, status, headers, config) {
              //console.log('appLogin success');

              if (data && data.Success) {
                    _initAuthenticatedUser(data.Results);
                    deferred.resolve(data);
                }
                else {
                    _initUnauthenticatedUser(data);
                    deferred.reject(data);
                }
                _data.loading = false;
                loaderService.hide();

            }).
            error(function (data, status, headers, config) {
              //console.log('appLogin error');

              //if (headers) { console.log(headers); }
              //if (config){ console.log(config); }
              //if (data) { console.log(data); }
              //if (status) { console.log(status); }
              
              
                _initUnauthenticatedUser()
                deferred.reject(status);
                _data.loading = false;
                loaderService.hide();

            });
        return deferred.promise;
    };

    /**** SINGLE USER LOGIN ****/
    //////////HS [2016-nov-24] - Added cus parameter
    ////////var _signin = function (username, password, cus) {
    ////////    var deferred = $q.defer();

    ////////    _data.loading = true;
    ////////    loaderService.show();

    ////////    var signinParams = {
    ////////        UserName: username,
    ////////        Password: password,
    ////////        position: geolocation.stringifiedPosition(),
    ////////        SId: cus //HS [2016-nov-24] - Passed the user session to login api
    ////////    }
    ////////    //alert(globalParams.baseUrl);
    ////////    //alert(JSON.stringify(signinParams));
    ////////    $http.post(globalParams.baseUrl + '/Account/AppLogin', { user: signinParams }).
    ////////        success(function (data, status, headers, config) {
    ////////            if (data && data.Success) {
    ////////                _initAuthenticatedUser(data.Results);
    ////////                deferred.resolve(data);
    ////////            }
    ////////            else {
    ////////                _initUnauthenticatedUser(data);
    ////////                deferred.reject(data);
    ////////            }
    ////////            _data.loading = false;
    ////////            loaderService.hide();

    ////////        }).
    ////////        error(function (data, status, headers, config) {
    ////////            //alert(data);
    ////////            //alert(status);
    ////////            //alert(headers);
    ////////            //alert(config);
    ////////            _initUnauthenticatedUser()
    ////////            deferred.reject(status);
    ////////            _data.loading = false;
    ////////            loaderService.hide();

    ////////        });
    ////////    return deferred.promise;
    ////////};

    var _changePassword = function (oldPassword, newPassword) {
        var deferred = $q.defer();

        _data.loading = true;
        loaderService.show();

        var params = {
            oldPassword: oldPassword,
            newPassword: newPassword
        }

        $http.post(globalParams.baseUrl + '/Account/AppChangePassword', params).
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    deferred.resolve(data);
                }
                else {
                    deferred.reject(data.Results && data.Results.message);
                }
                _data.loading = false;
                loaderService.hide();

            }).
            error(function (data, status, headers, config) {
                deferred.reject(status);
                _data.loading = false;
                loaderService.hide();

            });
        return deferred.promise;
    };

    var _requestSmsToken = function (phoneNumber) {
        var deferred = $q.defer();

        _data.loading = true;
        loaderService.show();

        var params = {
            phoneNumber: phoneNumber
        }

        $http.post(globalParams.baseUrl + '/Account/RequestSmsToken', params).
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    deferred.resolve(data);
                }
                else {
                    deferred.reject(data.Results && data.Results.message);
                }
                _data.loading = false;
                loaderService.hide();

            }).
            error(function (data, status, headers, config) {
                deferred.reject(status);
                _data.loading = false;
                loaderService.hide();

            });
        return deferred.promise;
    };

    var _validateSmsToken = function (phoneNumber, smsToken) {
        var deferred = $q.defer();

        _data.loading = true;
        loaderService.show();

        var params = {
            phoneNumber: phoneNumber,
            smsToken: smsToken
        }

        $http.post(globalParams.baseUrl + '/Account/AppValidateSmsToken', params).
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    _initAuthenticatedUser(data.Results);
                    deferred.resolve(data);
                }
                else {
                    _initUnauthenticatedUser(data);
                    deferred.reject(data);
                }
                _data.loading = false;
                loaderService.hide();

            }).
            error(function (data, status, headers, config) {
                _initUnauthenticatedUser()
                deferred.reject(status);
                _data.loading = false;
                loaderService.hide();

            });
        return deferred.promise;
    };


    var _getUser = function () {
        var deferred = $q.defer();
        _data.loading = true;

        $http.get(globalParams.baseUrl + '/Account/AppGetUser').
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    _initAuthenticatedUser(data.Results);
                    deferred.resolve(data);
                }
                else {
                    _initUnauthenticatedUser(data);
                    deferred.reject(data);
                }
                _data.loading = false;
                loaderService.hide();

            }).
            error(function (data, status, headers, config) {
                _initUnauthenticatedUser()
                deferred.reject(status);
                _data.loading = false;
                loaderService.hide();

            });
        return deferred.promise;
    };

    /**** SINGLE USER LOGIN ****/
    //////////HS [2016-nov-24] - Added cus parameter
    ////////var _getUser = function (cus) {
    ////////    var deferred = $q.defer();
    ////////    _data.loading = true;

    ////////    var params = {
    ////////        SId: cus //HS [2016-nov-24] - Passed the user session to getUser api
    ////////    }

    ////////    //HS [2016-nov-24] - Changed method to POST and passed params to the api
    ////////    $http.post(globalParams.baseUrl + '/Account/AppGetUser', { u: params }).
    ////////        success(function (data, status, headers, config) {
    ////////            if (data && data.Success) {
    ////////                _initAuthenticatedUser(data.Results);
    ////////                deferred.resolve(data);
    ////////            }
    ////////            else {
    ////////                _initUnauthenticatedUser(data);
    ////////                deferred.reject(data);
    ////////            }
    ////////            _data.loading = false;
    ////////            loaderService.hide();

    ////////        }).
    ////////        error(function (data, status, headers, config) {
    ////////            _initUnauthenticatedUser()
    ////////            deferred.reject(status);
    ////////            _data.loading = false;
    ////////            loaderService.hide();

    ////////        });
    ////////    return deferred.promise;
    ////////};

    //////////HS [2016-nov-25] - Start - Variables used in backgroud ivmus calls
    ////////var notify;
    ////////var cus;

    ////////var _start = function (_cus) {
    ////////    var deferred = $q.defer();

    ////////    cus = _cus;

    ////////    if (angular.isDefined(notify)) return deferred.promise;

    ////////    _data.running = true;

    ////////    notify = $interval(function () {
    ////////        if (_data.calling) { return; }

    ////////        _data.calling = true;
    ////////        deferred.resolve(_data.calling);

    ////////        $http.post(globalParams.baseUrl + '/Users/IVMUS', { s: cus }).
    ////////            success(function (data, status, headers, config) {

    ////////                _data.calling = false;
    ////////                deferred.resolve(_data.calling);

    ////////                if (data == 'false') {
    ////////                    _stop();
    ////////                    _signout();
    ////////                    $state.go('app.signin', { signout: true });
    ////////                }
    ////////            }).
    ////////            error(function (data, status, headers, config) {
    ////////                _data.calling = false;
    ////////                deferred.resolve(_data.calling);
    ////////            });

    ////////    }, 60000);

    ////////    deferred.resolve(_data.running);

    ////////    return deferred.promise;
    ////////};

    ////////var _stop = function () {
    ////////    var deferred = $q.defer();

    ////////    if (angular.isDefined(notify)) {
    ////////        $interval.cancel(notify);
    ////////        _data.running = false;
    ////////        _data.calling = false;
    ////////        notify = undefined;
    ////////        //console.log('stopped');
    ////////    }

    ////////    deferred.resolve(_data.running);
    ////////    deferred.resolve(_data.calling);

    ////////    return deferred.promise;
    ////////};
    //////////HS [2016-nov-25] - End

    return {
        data: _data,
        getUser: _getUser,
        signout: _signout,
        signin: _signin,
        changePassword: _changePassword,
        requestSmsToken: _requestSmsToken,
        validateSmsToken: _validateSmsToken

    }

    /**** SINGLE USER LOGIN ****/
    ////////return {
    ////////    data: _data,
    ////////    getUser: _getUser,
    ////////    signout: _signout,
    ////////    signin: _signin,
    ////////    changePassword: _changePassword,
    ////////    requestSmsToken: _requestSmsToken,
    ////////    validateSmsToken: _validateSmsToken,
    ////////    start: _start, //HS [2016-nov-25]
    ////////    stop: _stop //HS [2016-nov-25]
    ////////}
});
