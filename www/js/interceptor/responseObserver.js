
myApp.factory('responseInterceptor', function ($q, $window, $injector, $timeout, $rootScope, $injector) {
  return {
    'response': function (response) {
      if (response.config.url == 302) {

      //Will only be called for HTTP up to 300
        console.log(response);
      }

      return response;
    },
    'responseError': function (rejection) {
      switch (rejection.status) {
        case 403:
          $injector.get('$state').go('app.changePassword', { passwordExpired: true });
          break;
        case 500:
          //$window.location = './500.html';
          console.log(rejection);
          //alert(JSON.stringify(errorResponse));
      }

      return $q.reject(rejection);
    }
  };
});



//myApp.factory('responseObserver',
//    function responseObserver($q, $window, $injector) {
//        return function (promise) {
//            return promise.then(
//                function (successResponse) {
//                    return successResponse;
//                }, function (errorResponse) {
//                    switch (errorResponse.status) {
//                        case 403:
//                            $injector.get('$state').go('app.changePassword', {passwordExpired:true});
//                            break;
//                        case 500:
//                            //$window.location = './500.html';
//                            //console.log(errorResponse);
//                            alert(JSON.stringify(errorResponse));
//                    }

//                    return $q.reject(errorResponse);
//                });
//        };
//    });
