
myApp.controller('homeController', function ($scope, $location, $stateParams, $rootScope, $state, localize, assignmentsService, routeService, initRouteService, localStorageService, $filter, $ionicPopup, notificationService, userService, deliveryItemService, $cordovaBarcodeScanner) {
  $scope.message = "";
  $scope.data = null;

  //HS
  var getNotifications = function () {
    //console.log('running: ' + notificationService.data.running);
    notificationService.start().then(
      function (data) {
        //console.log(data);
      },
      function () {
      })
  }

  /**** SINGLE USER LOGIN ****/
  //////////HS[2016-nov-25] - Check valid user session
  ////////var checkUserSession = function () {
  ////////    userService.start(localStorage["cus"]).then(
  ////////        function (data) {
  ////////            //console.log(data);
  ////////        },
  ////////        function () {
  ////////        })
  ////////}

  var reload = function () {
    /**** SINGLE USER LOGIN ****/
    //////////HS[2016-nov-25] - Check valid user session
    ////////checkUserSession();

    getNotifications(); //HS

    assignmentsService.getAssignments().then(
      function (data) {
        //HS
        //if (!JSON.parse(localStorage.getItem("distribution_approval")) || JSON.parse(localStorage.getItem("distribution_approval")).length == 0) {
        initDistributionRoutesApproval(data.Routes);
        //}
        $scope.data = data;
        $scope.setDeliveryFilter('active');
        $scope.$broadcast('scroll.refreshComplete');
      },
      function (data) {
        $scope.data = null;
        $scope.$broadcast('scroll.refreshComplete');
      });
  }
  reload();

  $scope.reorderRoute = function (distributionId, routeId, part) {
    //HS - Start
    var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));
    var fda = findAndGet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId);
    if (!fda || fda.length == 0) {
      distributionApproval.push({ 'distributionId': distributionId, 'routeId': routeId, 'canceled': false, 'canceledCount': -1, 'new': false, 'newCount': -1, 'complaints': false, 'complaintsCount': -1, 'changed': false, 'changedCount': -1, 'hasCount': false });
    }
    localStorage.setItem("distribution_approval", JSON.stringify(distributionApproval));
    //alert('Home: \n' + JSON.stringify(JSON.parse(localStorage.getItem("distribution_approval"))));
    //HS - End
    //console.log('reorderRoute');
    $state.go('app.routeReorder', { distributionId: distributionId, routeId: routeId, part: part });
  }

  //HS - Start
  function initDistributionRoutesApproval(array) {
    var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));

    for (var i = 0, len = array.length; i < len; i++) {
      if (!distributionApproval || distributionApproval.length == 0) {
        distributionApproval = [];
      }
      var fda = findAndGet(distributionApproval, 'distributionId', array[i]['DistributionId'], 'routeId', array[i]['RouteId']);
      if (!fda || fda.length == 0) {
        distributionApproval.push({
          'distributionId': array[i]['DistributionId'],
          'routeId': array[i]['RouteId'],
          'canceled': array[i]['RouteCanceledSelected'],
          'canceledCount': array[i]['RouteCanceledCount'],
          'new': array[i]['RouteNewSelected'],
          'newCount': array[i]['RouteNewCount'],
          'complaints': array[i]['RouteComplaintsSelected'],
          'complaintsCount': array[i]['RouteComplaintsCount'],
          'changed': array[i]['RouteChangedSelected'],
          'changedCount': array[i]['RouteChangedCount'],
          'routeSelectedTime': array[i]['RouteSelectedTime'],
          'hasCount': (array[i]['RouteSelectedTime'] == null ? false : true)
        });
        //console.log('RouteSelectedTime: ' + array[i]['RouteSelectedTime']);
      }

      //console.log('fda: ' + fda);
      //console.log('Init: ' + JSON.stringify(JSON.parse(localStorage.getItem("distribution_approval"))));
    }

    localStorage.setItem("distribution_approval", JSON.stringify(distributionApproval));

    //alert('Init: \n' + JSON.stringify(JSON.parse(localStorage.getItem("distribution_approval"))));
  }

  function findAndGet(array, findProperty1, findValue1, findProperty2, findValue2) {
    if (array && array.length > 0) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (array[i][findProperty1] == findValue1 && array[i][findProperty2] == findValue2) {
          return array[i];
        }
      }
    }
    return null;
  }

  function findAndSet(array, findProperty1, findValue1, findProperty2, findValue2, setProperty, setValue) {
    if (array && array.length > 0) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (array[i][findProperty1] == findValue1 && array[i][findProperty2] == findValue2) {
          array[i][setProperty] = setValue;
          //Remove from array
          //array.splice(index, 1);
        }
      }
    }
  }
  //HS - End

  $scope.deliveryRouteSelected = function (route) {
    //if (route.StartTime) {
    $state.go('app.deliveryItemList', { distributionId: route.DistributionId, routeId: route.RouteId, part: route.Part });
    //} else {
    //  routeService.routeStart(route.DistributionId, route.RouteId, route.Part).then(
    //    function (data) {
    //      $state.go('app.deliveryItemList', { distributionId: route.DistributionId, routeId: route.RouteId, part: route.Part });
    //    },
    //    function (data) {
    //    })
    //}
  }



  $scope.routeStart = function (distributionId, routeId, part) {
    //HS - moved to _setRoutePreparations function
    //console.log('routeStart');
    //routeService.routeStart(distributionId, routeId, part).then(
    //    function (data) {
    //        $state.go('app.delivery', { distributionId: distributionId, routeId: routeId });
    //    },
    //    function (data) {
    //    })

    //HS
    _checkRoutePreparations(distributionId, routeId, part, false);
  }

  $scope.routeContinue = function (distributionId, routeId, part) {
    //HS - moved to _setRoutePreparations function
    //console.log('routeContinue');
    //$state.go('app.delivery', { distributionId: distributionId, routeId: routeId, part: part });

    //HS
    _checkRoutePreparations(distributionId, routeId, part, true);
  }

  $scope.districtShow = function (distributionId, districtId) {
    console.log('routeContinue');
    $state.go('app.district', { distributionId: distributionId, districtId: districtId });
  }


  $scope.doRefresh = function () {
    assignmentsService.getAssignments().then(
      function (data) {
        //HS
        if (!JSON.parse(localStorage.getItem("distribution_approval")) || JSON.parse(localStorage.getItem("distribution_approval")).length == 0) {
          initDistributionRoutesApproval(data.Routes);
        }
        $scope.data = data;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.setDeliveryFilter($scope.deliveryFilter);
      },
      function (data) {
        $scope.data = null;
        $scope.$broadcast('scroll.refreshComplete');

      });

  };

  //HS
  var _checkRoutePreparations = function (distributionId, routeId, part, isRouteStarted) {
    var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));
    var fda = findAndGet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId);

    //console.log('hasCount: ' + fda['hasCount']);

    if (!fda['hasCount']) {
      //alert('Calling API');
      //initRouteService.setRouteId(distributionId, routeId, part, false).then(
      //HS [2016-Aug-22] - Passed autoSetCurrentItem=true instead of false to set the undelivered point as current point
      routeService.setRouteId(distributionId, routeId, part, true).then(
        function (data) {
          //var routeData = initRouteService.data.currentRoute;
          var routeData = routeService.data.currentRoute;

          //var routeNew = _.countBy(routeData.items, function (item) { return item.CompareData == 1; })[true] || 0;
          //var routeCanceled = routeData.removedPoints.length; //_.countBy(routeData.items, function (item) { return (item.removedPoints && item.removedPoints.length > 0); })[true] || 0;
          //var routeComplaints = _.countBy(routeData.items, function (item) { return (item.complaints && item.complaints.length>0); })[true] || 0;
          //var routeChanged = _.countBy(routeData.items, function (item) { return item.CompareData >= 3 && item.CompareData <= 6; })[true] || 0;

          var routeNew = _.countBy(routeData.items, function (item) { return (item.CompareTypesString != null && item.CompareTypesString.indexOf('1') > -1); })[true] || 0;
          var routeCanceled = routeData.removedPoints.length; //_.countBy(routeData.items, function (item) { return (item.removedPoints && item.removedPoints.length > 0); })[true] || 0;
          var routeComplaints = _.countBy(routeData.items, function (item) { return (item.complaints && item.complaints.length > 0); })[true] || 0;
          var routeChanged = _.countBy(routeData.items, function (item) {
            return (item.CompareTypesString != null) && (item.CompareTypesString.indexOf('3') > -1
              || item.CompareTypesString.indexOf('4') > -1
              || item.CompareTypesString.indexOf('5') > -1
              || item.CompareTypesString.indexOf('6') > -1);
          })[true] || 0;

          routeChanged += routeNew + routeCanceled + routeComplaints;

          findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'canceled', fda['canceled']);
          if (routeCanceled > 0) findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'canceledCount', routeCanceled);
          findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'new', fda['new']);
          if (routeNew > 0) findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'newCount', routeNew);
          findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'complaints', fda['complaints']);
          if (routeComplaints > 0) findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'complaintsCount', routeComplaints);
          findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'changed', fda['changed']);
          if (routeChanged > 0) findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'changedCount', routeChanged);
          findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'hasCount', true);
          localStorage.setItem("distribution_approval", JSON.stringify(distributionApproval));

          //alert('routeContinue: \n' + JSON.stringify(JSON.parse(localStorage.getItem("distribution_approval"))));

          //if ((fda['canceledCount'] == -1 || (fda['canceledCount'] > 0 && fda['canceled']))
          //    && (fda['newCount'] == -1 || (fda['newCount'] > 0 && fda['new']))
          //    && (fda['complaintsCount'] == -1 || (fda['complaintsCount'] > 0 && fda['complaints']))
          //    && (fda['changedCount'] == -1 || (fda['changedCount'] > 0 && fda['changed']))) {
          //    //alert('allow to proceed');
          //    _setRoutePreparations(distributionId, routeId, part, isRouteStarted);
          //}
          //else {
          //    //alert('אנא אשר את התוכן בכל המסכים המקדימים');
          //    _showPreparationMessage(distributionId, routeId, part);
          //}

          //console.log('changedCount: ' + fda['changedCount']);
          //console.log('routeChanged: ' + routeChanged);

          //HS [2016-may-17] - For 'changes' tab, check 'changed' checkbox and it's count ONLY
          if ((fda['changedCount'] == -1 || (fda['changedCount'] > 0 && fda['changed']))) {
            //alert('allow to proceed');
            _setRoutePreparations(distributionId, routeId, part, isRouteStarted);
          }
          else {
            //alert('אנא אשר את התוכן בכל המסכים המקדימים');
            _showPreparationMessage(distributionId, routeId, part);
          }


          //var routeAll = routeData.items.length;
          //var routeNew = _.countBy(routeData.items, function (item) { return item.IsNew; })[true] || 0;
          //var routeCanceled = _.countBy(routeData.items, function (item) { return item.complaints && item.complaints.length; })[true] || 0;
          //var routeComplaints = _.countBy(routeData.items, function (item) { return item.IsNew; })[true] || 0;

          //initRouteService.loadRouteComplaints(distributionId, routeId, part, false).then(
          //function (data) {
          //    //var routeAll = routeData.items.length;
          //    var routeNew = _.countBy(routeData.items, function (item) { return item.IsNew; })[true] || 0;
          //    var routeCanceled = 0;
          //    var routeComplaints = _.countBy(routeData.items, function (item) { return (item.complaints && item.complaints.length > 0); })[true] || 0;

          //    findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'canceled', fda['canceled']);
          //    if (routeCanceled > 0) findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'canceledCount', routeCanceled);
          //    findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'new', fda['new']);
          //    if (routeNew > 0) findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'newCount', routeNew);
          //    findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'complaints', fda['complaints']);
          //    if (routeComplaints > 0) findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'complaintsCount', routeComplaints);
          //    findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'hasCount', true);
          //    localStorage.setItem("distribution_approval", JSON.stringify(distributionApproval));

          //    //alert('routeContinue: \n' + JSON.stringify(JSON.parse(localStorage.getItem("distribution_approval"))));

          //    if ((fda['canceledCount'] == -1 || (fda['canceledCount'] > 0 && fda['canceled']))
          //        && (fda['newCount'] == -1 || (fda['newCount'] > 0 && fda['new']))
          //        && (fda['complaintsCount'] == -1 || (fda['complaintsCount'] > 0 && fda['complaints']))) {
          //        //alert('allow to proceed');
          //        _setRoutePreparations(distributionId, routeId, part, isRouteStarted);
          //    }
          //    else {
          //        //alert('אנא אשר את התוכן בכל המסכים המקדימים');
          //        _showPreparationMessage(distributionId, routeId, part);
          //    }
          //},
          //function () {
          //})
        },
        function () {
        })
    }
    else {
      //if ((fda['canceledCount'] == -1 || (fda['canceledCount'] > 0 && fda['canceled']))
      //    && (fda['newCount'] == -1 || (fda['newCount'] > 0 && fda['new']))
      //    && (fda['complaintsCount'] == -1 || (fda['complaintsCount'] > 0 && fda['complaints']))
      //    && (fda['changedCount'] == -1 || (fda['changedCount'] > 0 && fda['changed']))) {
      //    //alert('allow to proceed');
      //    _setRoutePreparations(distributionId, routeId, part, isRouteStarted);
      //}
      //else {
      //    //alert('אנא אשר את התוכן בכל המסכים המקדימים');
      //    _showPreparationMessage(distributionId, routeId, part);
      //}

      //console.log('changedCount: ' + fda['changedCount']);
      //console.log('changed: ' + fda['changed']);
      //console.log('condition: ' + (fda['changedCount'] == -1 || (fda['changedCount'] > 0 && fda['changed'])));
      //HS [2016-may-17] - For 'changes' tab, check 'changed' checkbox and it's count ONLY
      if ((fda['changedCount'] == -1 || (fda['changedCount'] > 0 && fda['changed']))) {
        //alert('allow to proceed');
        _setRoutePreparations(distributionId, routeId, part, isRouteStarted);
      }
      else {
        //alert('אנא אשר את התוכן בכל המסכים המקדימים');
        _showPreparationMessage(distributionId, routeId, part);
      }
    }
  }

  //HS
  var _showPreparationMessage = function (distributionId, routeId, part) {
    var confirmPopup = $ionicPopup.show({
      title: $filter('i18n')("message"),
      template: 'אנא אשר את התוכן בכל המסכים המקדימים',
      scope: $scope,
      buttons: [
        {
          text: $filter('i18n')("ok"),
          type: 'button-positive'
        }
      ]
    });
    confirmPopup.then(function (res) {
      $state.go('app.routeReorder', { distributionId: distributionId, routeId: routeId, part: part });
    });
  }

  //HS
  //var _setRoutePreparations = function (distributionId, routeId, part, routeCanceledSelected, routeCanceledCount, routeNewSelected, routeNewCount, routeComplaintsSelected, routeComplaintsCount, isRouteStarted) {
  var _setRoutePreparations = function (distributionId, routeId, part, isRouteStarted) {
    var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));
    var fda = findAndGet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId);

    if (fda != null) {
      if (fda['routeSelectedTime'] == null) { //It's first time it saves the data in DB by calling API & then navigate
        routeService.setRoutePreparations(distributionId, routeId, part, fda['canceled'], fda['canceledCount'], fda['new'], fda['newCount'], fda['complaints'], fda['complaintsCount'], fda['changed'], fda['changedCount']).then(
          function (data) {
            //alert(data);
            if (data) {
              findAndSet(distributionApproval, 'distributionId', distributionId, 'routeId', routeId, 'routeSelectedTime', true);
              localStorage.setItem("distribution_approval", JSON.stringify(distributionApproval));

              if (!isRouteStarted) { //routeStart
                console.log('routeStart');

                //HS [2016-Apr-25] - Moved "routeStart" API's success code here
                //HS [15-feb-2016] - To fix the enableDelivery flag issue in the delivery page
                //HS [2016-Aug-22] - Passed autoSetCurrentItem=true instead of false to set the undelivered point as current point
                routeService.setRouteId(distributionId, routeId, part, true).then(
                  function (data) {
                    //alert('routeService.data.currentRoute');
                    if (routeService.data.currentRoute) {
                      //alert('routeService.data.currentRoute: true');
                      routeService.data.currentRoute.routeStartTime = new Date();
                    }
                  },
                  function () {
                  })

                //HS [2017-oct-26] - Passed triggeredFrom param to set autoSetCurrentItem param in routeService.setRouteId call in deliveryController.js file
                //HS [15-feb-2016] - Passed enableDelivery flag
                $state.go('app.delivery', { distributionId: distributionId, routeId: routeId, part: part, enableDelivery: 1, triggeredFrom: 'home' });

                //HS [2016-Apr-25] - Called route start API in the setRoutePreparations API and simply moved it's the success code outside of it
                //routeService.routeStart(distributionId, routeId, part).then(
                //    function (data) {

                //        //HS [15-feb-2016] - To fix the enableDelivery flag issue in the delivery page
                //        routeService.setRouteId(distributionId, routeId, part).then(
                //            function (data) {
                //                //alert('routeService.data.currentRoute');
                //                if (routeService.data.currentRoute) {
                //                    //alert('routeService.data.currentRoute: true');
                //                    routeService.data.currentRoute.routeStartTime = new Date();
                //                }
                //            },
                //            function () {
                //            })

                //        //HS [15-feb-2016] - Passed enableDelivery flag
                //        $state.go('app.delivery', { distributionId: distributionId, routeId: routeId, part: part, enableDelivery: 1 });
                //    },
                //    function (data) {
                //    })

              }
              else { //routeContinue
                console.log('routeContinue');
                //$state.go('app.delivery', { distributionId: distributionId, routeId: routeId, part: part, enableDelivery: -1 });
                //HS [2017-oct-26] - Passed triggeredFrom param to set autoSetCurrentItem param in routeService.setRouteId call in deliveryController.js file
                $state.go('app.delivery', { distributionId: distributionId, routeId: routeId, part: part, enableDelivery: 1, triggeredFrom: 'home' });
              }
            }
          },
          function () {
          })
      }
      else { //Already approves preparations & no need to call API, simply navigate
        if (!isRouteStarted) { //routeStart
          console.log('routeStart');

          //HS [2016-Apr-25] - Moved "routeStart" API's success code here
          //HS [15-feb-2016] - To fix the enableDelivery flag issue in the delivery page
          //HS [2016-Aug-22] - Passed autoSetCurrentItem=true instead of false to set the undelivered point as current point
          routeService.setRouteId(distributionId, routeId, part, true).then(
            function (data) {
              if (routeService.data.currentRoute) {
                routeService.data.currentRoute.routeStartTime = new Date();
              }
            },
            function () {
            })

          //HS [2017-oct-26] - Passed triggeredFrom param to set autoSetCurrentItem param in routeService.setRouteId call in deliveryController.js file
          //HS [15-feb-2016] - Passed enableDelivery flag
          $state.go('app.delivery', { distributionId: distributionId, routeId: routeId, part: part, enableDelivery: 1, triggeredFrom: 'home' });

          //HS [2016-Apr-25] - Called route start API in the setRoutePreparations API and simply moved it's the success code outside of it
          //routeService.routeStart(distributionId, routeId, part).then(
          //    function (data) {

          //        //HS [15-feb-2016] - To fix the enableDelivery flag issue in the delivery page
          //        routeService.setRouteId(distributionId, routeId, part).then(
          //            function (data) {
          //                if (routeService.data.currentRoute) {
          //                    routeService.data.currentRoute.routeStartTime = new Date();
          //                }
          //            },
          //            function () {
          //            })

          //        //HS [15-feb-2016] - Passed enableDelivery flag
          //        $state.go('app.delivery', { distributionId: distributionId, routeId: routeId, part: part, enableDelivery: 1 });
          //    },
          //    function (data) {
          //    })

        }
        else { //routeContinue
          console.log('routeContinue');
          //$state.go('app.delivery', { distributionId: distributionId, routeId: routeId, part: part, enableDelivery: -1 });
          //HS [2017-oct-26] - Passed triggeredFrom param to set autoSetCurrentItem param in routeService.setRouteId call in deliveryController.js file
          $state.go('app.delivery', { distributionId: distributionId, routeId: routeId, part: part, enableDelivery: 1, triggeredFrom: 'home' });
        }
      }
    }
  }


  $scope.scanBarcode = function () {

    cordova.plugins.barcodeScanner.scan(
      function (result) 
      {

        if (!result.cancelled) {
          // $state.go('app.deliveryItem', { barcode: barcodeData.text });
          //HS [2018-may-11] - Home Page - Not found the package show only error message.
          deliveryItemService.getByCode(result.text).then(
            function (data) {
              if (data) {
                $state.go('app.deliveryItem', { barcode: result.text });
              }
              else {

                var myPopup = $ionicPopup.show({
                  title: 'החבילה לא נמצאה.',
                  template: '<p align="right"> החבילה לא נמצאה </p>',
                  scope: $scope,
                  buttons: [
                    {
                      text: '<b align="center">' + $filter('i18n')("ok") + '</b>',
                      type: 'button-positive',
                      onTap: function (e) {
                      }
                    }
                  ]
                })

              }
            })
        }

        // alert("We got a barcode\n" +
        //       "Result: " + result.text + "\n" +
        //       "Format: " + result.format + "\n" +
        //       "Cancelled: " + result.cancelled);
      },
      function (error) {
        alert("Scanning failed: " + error);
      }
    );


    // $cordovaBarcodeScanner
    //   .scan()
    //   .then(function (barcodeData) {
    //     console.log(barcodeData);
    //     if (!barcodeData.cancelled) {
    //       // $state.go('app.deliveryItem', { barcode: barcodeData.text });
    //       //HS [2018-may-11] - Home Page - Not found the package show only error message.
    //       deliveryItemService.getByCode(barcodeData.text).then(
    //         function (data) {
    //           if (data) {
    //             $state.go('app.deliveryItem', { barcode: barcodeData.text });
    //           }
    //           else {

    //             var myPopup = $ionicPopup.show({
    //               title: 'החבילה לא נמצאה.',
    //               template: '<p align="right"> החבילה לא נמצאה </p>',
    //               scope: $scope,
    //               buttons: [
    //                 {
    //                   text: '<b align="center">' + $filter('i18n')("ok") + '</b>',
    //                   type: 'button-positive',
    //                   onTap: function (e) {
    //                   }
    //                 }
    //               ]
    //             })

    //           }
    //         })
    //     }
    //   }, function (error) {
    //     alert("Scanning failed: " + error);
    //   });

  }
  //HS [2018-apr-25] - Home - Added scan lable for type barcode to scan function - add click function
  //HS [2018-apr-24] - Home - Added scan lable for type barcode to scan function - add click function
  $scope.scanBarcodeByType = function () {
    $scope.data = {}

    // Custom popup
    var myPopup = $ionicPopup.show({
      template: '<input type = "text" ng-model = "data.model">',
      title: 'הקלדת ברקוד לסריקה',
      //subTitle: 'Subtitle',
      scope: $scope,

      buttons: [
        { text: $filter('i18n')("cancel") }, {
          text: '<b>' + $filter('i18n')("save") + '</b>',
          type: 'button-positive',
          onTap: function (e) {
            if (!$scope.data.model) {
              //don't allow the user to close unless he enters model...
              e.preventDefault();
            } else {
              //$state.go('app.deliveryItem', { barcode: $scope.data.model });
              //HS [2018-may-11] - Home Page - Not found the package show only error message.
              deliveryItemService.getByCode($scope.data.model).then(
                function (data) {
                  if (data) {
                    $state.go('app.deliveryItem', { barcode: $scope.data.model });
                  }
                  else {

                    var myPopup = $ionicPopup.show({
                      title: 'החבילה לא נמצאה.',
                      template: '<p align="right"> החבילה לא נמצאה </p>',
                      scope: $scope,
                      buttons: [
                        {
                          text: '<b align="center">' + $filter('i18n')("ok") + '</b>',
                          type: 'button-positive',
                          onTap: function (e) {
                          }
                        }
                      ]
                    })

                  }
                })
            }
          }
        }
      ]
    });

    myPopup.then(function (res) {
      console.log('Tapped!', res);
    });
  };

  ///deliveries - YH 2018-02-20

  $scope.deliveryFilter = "active"

  $scope.setDeliveryFilter = function (item) {
    $scope.deliveryFilter = item;

    switch ($scope.deliveryFilter) {
      case 'active':
        $scope.filteredDeliveryRoutes = _.filter($scope.data.DeliveryRoutes, function (item) { return item.StopsDelivered < item.StopsTotal });
        break;
      case 'completed':
        $scope.filteredDeliveryRoutes = _.filter($scope.data.DeliveryRoutes, function (item) { return item.StopsDelivered == item.StopsTotal });

        break;
      case 'all':
        $scope.filteredDeliveryRoutes = $scope.data.DeliveryRoutes;
        break;
    }


  }

})
