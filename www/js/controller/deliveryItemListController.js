myApp.controller('deliveryItemListController', function ($scope, $location, $stateParams, $filter, $ionicPopup, $rootScope, $ionicScrollDelegate, $state, $timeout, localize, routeService, loaderService, routeOrderStateService, localStorageService, deliveryItemService, $cordovaBarcodeScanner) {
  $scope.message = "";
  $scope.selectedItemId = 0;
  $scope.itemOrder = { text: "" };
  $scope.filter = 'list';




  if ($stateParams.distributionId == null || $stateParams.routeId == null || $stateParams.part == null) {
    return;
  }

  var reloadData = function () {


    deliveryItemService.loadRouteItems($stateParams.distributionId, $stateParams.routeId, $stateParams.part).then(
      function (data) {
        $scope.data = data;
        _setVisibleData($scope.data);
        $scope.$broadcast('scroll.refreshComplete');

      },
      function () {
      })
  }
  var _setVisibleData = function (data) {


    switch ($scope.deliveryFilter) {
      case 'active':
        //$scope.filteredDeliveryRoutes = _.filter($scope.data.DeliveryRoutes, function (item) { return item.StopsDelivered < item.StopsTotal });
        $scope.visibleData = _.filter(data.items, function (item) { return item.DeliveryTime == null });
        break;
      case 'completed':
        //$scope.filteredDeliveryRoutes = _.filter($scope.data.DeliveryRoutes, function (item) { return item.StopsDelivered == item.StopsTotal });
        $scope.visibleData = _.filter(data.items, function (item) { return item.DeliveryTime != null });
        break;
      case 'all':
        $scope.visibleData = data.items;
        break;
    }


  }

  reloadData();

  $scope.doRefresh = function () {
    reloadData();

  }

  $scope.reorderItem = function (item, $fromIndex, $toIndex, $event) {

    //alert($scope.data.items[$toIndex].Position );
    if ($toIndex < 0) {
      return;
    }
    if (!$scope.data.items[$toIndex]) {
      return;
    }
    loaderService.show();
    //$scope.data.items[$toIndex].selected = true;
    $scope.selectedItemId = item.DistributionItemId;

    var position = $scope.data.items[$toIndex].Position
    $scope.data.items.splice($fromIndex, 1);
    $scope.data.items.splice($toIndex, 0, item);

    if (position == null) {
      position = 1;
    }

    routeService.reorderItem(item.DistributionItemId, position, false).then(
      function () {
        reloadData();
        loaderService.hide();
      },
      function () {
        loaderService.hide();
      });

    $event.preventDefault;

  }

  $scope.showItem = function (item) {

    $state.go('app.deliveryItem', { itemId: item.DeliveryItemId });

  }

  $scope.scanBarcode = function () {
    $cordovaBarcodeScanner
      .scan()
      .then(function (barcodeData) {
        console.log(barcodeData);
        if (!barcodeData.cancelled) {
          //$state.go('app.deliveryItem', { barcode: barcodeData.text });
          //HS [2018-apr-27] - Task # 6 - Add New barcode (Return Barcode) After Scan - Open Popup on not find barcode in database
          deliveryItemService.getByCode(barcodeData.text).then(function (data) {
            if(data){
            $state.go('app.deliveryItem', { barcode: barcodeData.text });
            }
            else {
              //HS [2018-may-14] - Delivery Item List - Not found the package show only error message. 
              var myPopup = $ionicPopup.show({
                title: 'החבילה לא נמצאה.',
                template: '<p align="right"> החבילה לא נמצאה </p>',
                scope: $scope,
                buttons: [
                          {
                          text: '<b align="center">' + $filter('i18n')("ok") + '</b>',
                          type: 'button-positive',
                          onTap: function(e) {
                          }
                          }
                          ]
                });
    
            }
            
            }, function (error) {
        alert("Scanning failed: " + error);
            }
 )
}})}

  //HS [2018-may-11] - Delivery Item Page - Added scan lable for type barcode to scan function - add click function
  $scope.scanBarcodeByType = function () {
    $scope.data = {}
                 
    // Custom popup
    var myPopup = $ionicPopup.show({
            template: '<input type = "text" ng-model = "data.model">',
            title: 'הקלדת ברקוד לסריקה',
            //subTitle: 'Subtitle',
            scope: $scope,
            
            buttons: [
                      { text: $filter('i18n')("cancel")}, {
                      text: '<b>' + $filter('i18n')("save") + '</b>',
                      type: 'button-positive',
                      onTap: function(e) {
                      if (!$scope.data.model) {
                      //don't allow the user to close unless he enters model...
                      e.preventDefault();
                      } else {
                            //$state.go('app.deliveryItem', { barcode: $scope.data.model });
                            //HS [2018-may-14] -Delivery Item List - Not found the package show only error message.
                            deliveryItemService.getByCode($scope.data.model).then(
                            function (data) {                               
                              if(data)
                              {
                                $state.go('app.deliveryItem', { barcode: $scope.data.model });
                              }
                              else
                              {
                            
                            var myPopup = $ionicPopup.show({
                            title: 'החבילה לא נמצאה.',
                            template: '<p align="right"> החבילה לא נמצאה </p>',
                            scope: $scope,
                            buttons: [
                                      {
                                      text: '<b align="center">' + $filter('i18n')("ok") + '</b>',
                                      type: 'button-positive',
                                      onTap: function(e) {
                                      }
                                      }
                                      ]
                            })
                            
                        }
                      });
                      }
                      }
                      }
                      ]
            });

myPopup.then(function(res) {
console.log('Tapped!', res);
});
};

  $scope.setFilter = function (filter) {
    $scope.filter = filter;
    $ionicScrollDelegate.scrollTop();
  }

  $scope.setItemOrder = function (item, $event) {

    var myPopup = $ionicPopup.show({
      template: '<input type="tel" ng-model="itemOrder.text"  auto-focus >',
      title: $filter('i18n')("order"),
      scope: $scope,
      buttons: [
        { text: $filter('i18n')("cancel") },
        {
          text: '<b>' + $filter('i18n')("save") + '</b>',
          type: 'button-positive',
          onTap: function (e) {
            if (!$scope.itemOrder.text || $scope.itemOrder.text == "" || !is_int($scope.itemOrder.text)) {
              e.preventDefault();
            } else {
              return $scope.itemOrder.text;
            }
          }
        }
      ]
    });
    myPopup.then(function (res) {
      if (res && res != "") {
        loaderService.show();
        $scope.selectedItemId = item.DistributionItemId;
        routeService.reorderItem(item.DistributionItemId, $scope.itemOrder.text, false).then(
          function () {
            reloadData();
            loaderService.hide();
          },
          function () {
            loaderService.hide();
          });


      }
      $scope.itemOrder.text = "";

    });

    $event.preventDefault;
  }

  function is_int(value) {
    if ((parseFloat(value) == parseInt(value)) && !isNaN(value)) {
      return true;
    } else {
      return false;
    }
  }

  $scope.deliveryFilter = "active"

  $scope.setDeliveryFilter = function (item) {
    $scope.deliveryFilter = item;
    _setVisibleData($scope.data);



  }

})



