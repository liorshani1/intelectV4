
var myApp = angular.module('myApp', [
  'ionic',
  'localization',
  'LocalStorageModule',
  'myApp.filters',
  'myApp.geolocation',
  'ngCordova',
  'angular-barcode'])
  .constant('debug', false)

myApp.run(function ($ionicPlatform, $rootScope, $window, $state, $stateParams, $filter, localStorageService, notificationService, $timeout, localize) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    if (window.cordova && window.cordova.plugins) {
      cordova.plugins.diagnostic.requestExternalStorageAuthorization(function (status) {
        console.log("Authorization request for external storage use was " + (status == cordova.plugins.diagnostic.permissionStatus.GRANTED ? "granted" : "denied"));
        //alert("Authorization request for external storage use was " + (status == cordova.plugins.diagnostic.permissionStatus.GRANTED ? "granted" : "denied"));
      }, function (error) {
        console.error(error);
        //alert(error);
      });
    }

    localStorage.setItem("distribution_approval", JSON.stringify([]));

  });

  $rootScope.online = navigator.onLine ? true : false;
  $rootScope.$apply();

  if (window.addEventListener) {
    window.addEventListener("online", function () {
      $rootScope.online = true;
      $rootScope.$apply();
    }, true);
    window.addEventListener("offline", function () {
      $rootScope.online = false;
      $rootScope.$apply();
    }, true);
  } else {
    document.body.ononline = function () {
      $rootScope.online = true;
      $rootScope.$apply();
    };
    document.body.onoffline = function () {
      $rootScope.online = false;
      $rootScope.$apply();
    };
  }

  document.addEventListener("pause", function () {
    notificationService.stop();
  }, true);
  document.addEventListener("resume", function () {
    notificationService.start();
  }, true);

  $rootScope.appLanguage = "he";
  $rootScope.appDirection = "{direction:'rtl'}";
  $rootScope.appSide = "right";
  $rootScope.appOside = "left";
  $rootScope.appVersion = appVersion;
  moment.locale('he');

  localize.setLanguage($rootScope.appLanguage);

})

  .config(function ($stateProvider, $urlRouterProvider, $compileProvider, $provide, $httpProvider, debug) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|waze|file|blob|tel):|data:image\//);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|blob|tel):|data:image\//);

    /******Working*********/
    $httpProvider.defaults.withCredentials = true;

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $httpProvider.interceptors.push('responseInterceptor');


    $stateProvider

      .state('app', { url: "/app", abstract: true, templateUrl: "templates/menu.html", controller: 'menuController' })
      .state('app.signin', { url: "/signin/:signout", views: { 'menuContent': { templateUrl: "templates/signin.html", controller: 'signinController', data: { title: "Sign In" } } } })
      .state('app.home', { url: "/home", views: { 'menuContent': { templateUrl: "templates/home.html", controller: 'homeController', data: { title: "Home" } } } })
      .state('app.district', { url: "/district/:distributionId/:districtId", views: { 'menuContent': { templateUrl: "templates/district.html", controller: 'districtController', data: { title: "District" } } } })
      .state('app.routeReorder', { url: "/route/order/:distributionId/:routeId/:part", views: { 'menuContent': { templateUrl: "templates/routeOrder.html", controller: 'routeOrderController', data: { title: "Route Order" } } } })
      .state('app.deliveryItemList', { url: "/route/deliveryItemList/:distributionId/:routeId/:part", views: { 'menuContent': { templateUrl: "templates/deliveryItemList.html", controller: 'deliveryItemListController', data: { title: "Delivery Item List" } } } })
      //HS [2017-oct-26] - Passed triggeredFrom flag
      //HS [15-feb-2016] - Passed enableDelivery flag
      .state('app.delivery', { url: "/route/:distributionId/:routeId/:part/:enableDelivery/:triggeredFrom", views: { 'menuContent': { templateUrl: "templates/delivery.html", controller: 'deliveryController', data: { title: "Delivery" } } } })
      .state('app.deliveryItem', { url: "/deliveryItem/:barcode/:itemId", views: { 'menuContent': { templateUrl: "templates/deliveryItem.html", controller: 'deliveryItemController', data: { title: "Delivery Item" } } } })
      .state('app.map', { url: "/map", views: { 'menuContent': { templateUrl: "templates/map.html", controller: 'mapController', data: { title: "Map" } } } })
      .state('app.routeItem', { url: "/routeItem", views: { 'menuContent': { templateUrl: "templates/delivery.html", controller: 'routeItemController', data: { title: "Delivery" } } } })
      .state('app.about', { url: "/about", views: { 'menuContent': { templateUrl: "templates/about.html", controller: 'aboutController', data: { title: "about" } } } })
      .state('app.changePassword', { url: "/changePassword/:passwordExpired", views: { 'menuContent': { templateUrl: "templates/changePassword.html", controller: 'changePasswordController', data: { title: "changePassword" } } } })
      .state('app.notification', { url: "/notification", views: { 'menuContent': { templateUrl: "templates/notification.html", controller: 'notificationController', data: { title: "Notifications" } } } })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/signin/false');


    // catch exceptions in angular
    $provide.decorator('$exceptionHandler', ['$delegate', function ($delegate) {
      return function (exception, cause) {
        $delegate(exception, cause);

        var data = {
          type: 'angular',
          url: window.location.hash,
          localtime: Date.now()
        };
        if (cause) { data.cause = cause; }
        if (exception) {
          if (exception.message) { data.message = exception.message; }
          if (exception.name) { data.name = exception.name; }
          if (exception.stack) { data.stack = exception.stack; }
        }

        if (debug) {
          console.log('exception', data);
          window.alert('Error ($exceptionHandler): ' + JSON.stringify(data));
        } else {
          console.log('exception', data);
          //track('exception', data);
        }
      };
    }]);
    // catch exceptions out of angular
    window.onerror = function (message, url, line, col, error) {
      var stopPropagation = debug ? false : true;
      var data = {
        type: 'javascript',
        url: window.location.hash,
        localtime: Date.now()
      };
      if (message) { data.message = message; }
      if (url) { data.fileName = url; }
      if (line) { data.lineNumber = line; }
      if (col) { data.columnNumber = col; }
      if (error) {
        if (error.name) { data.name = error.name; }
        if (error.stack) { data.stack = error.stack; }
      }

      if (debug) {
        console.log('exception', data);
        window.alert('Error (window.onerror): ' + JSON.stringify(data));
      } else {
        console.log('exception', data);
        //track('exception', data);
      }
      return stopPropagation;
    };

  });
