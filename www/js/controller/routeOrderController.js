myApp.controller('routeOrderController', function ($scope, $location, $stateParams, $filter, $ionicPopup, $rootScope, $ionicScrollDelegate, $state, $timeout, localize, routeService, loaderService, routeOrderStateService, localStorageService) {
  $scope.message = "";
  $scope.selectedItemId = 0;
  $scope.itemOrder = { text: "" };
  $scope.count = {};
  $scope.filter = routeOrderStateService.data.filter;
  //HS
  $scope.distributionApproved = 'NO';
  $scope.canceledApproved = 'NO';
  $scope.newApproved = 'NO';
  $scope.complaintsApproved = 'NO';
  $scope.changedApproved = 'NO';
  $scope.role = localStorage["role"];
  //$scope.totals = {
  //    newSubscribers: 0,
  //    complaints: 0,
  //    removedSubscribers: 0,
  //    addressChange: 0,
  //    locationChange: 0,
  //    quantityChange: 0,
  //    packagingChange: 0
  //};
  $scope.publications = [];

  //console.log('start');
  //console.log('distributionId' + $stateParams.distributionId);
  //console.log('routeId' + $stateParams.routeId);
  //console.log('part' + $stateParams.part);

  if ($stateParams.distributionId == null || $stateParams.routeId == null || $stateParams.part == null) {
    return;
  }

  //HS [2016-Aug-22] - Passed autoSetCurrentItem=true instead of false to set the undelivered point as current point
  routeService.setRouteId($stateParams.distributionId, $stateParams.routeId, $stateParams.part, true).then(
    function (data) {
      //console.log('setRouteId');
      $scope.data = routeService.data.currentRoute;
      _setVisibleData($scope.data);

      //HS [2016-may-17] - For 'totals' tab, set publications
      $scope.publications = $scope.data.publications || [];

      $scope.count.all = $scope.data.items.length;
      $scope.count.new = _.countBy($scope.data.items, function (item) { return (item.CompareTypesString != null && item.CompareTypesString.indexOf('1') > -1); })[true] || 0;
      $scope.count.canceled = $scope.data.removedPoints.length;// _.countBy($scope.data.items, function (item) { return item.removedPoints && item.removedPoints.length; })[true] || 0;
      $scope.count.complaints = _.countBy($scope.data.items, function (item) { return item.complaints && item.complaints.length > 0; })[true] || 0;
      $scope.count.changed = _.countBy($scope.data.items, function (item) {
        return (item.CompareTypesString != null) && (item.CompareTypesString.indexOf('3') > -1
          || item.CompareTypesString.indexOf('4') > -1
          || item.CompareTypesString.indexOf('5') > -1
          || item.CompareTypesString.indexOf('6') > -1);
      })[true] || 0;

      //console.log('new: ' + $scope.count.new);
      //console.log('canceled: ' + $scope.count.canceled);
      //console.log('complaints: ' + $scope.count.complaints);
      //console.log('changed: ' + $scope.count.changed);

      //HS [2016-may-17] - For 'changes' tab, count total changes records for all compareData
      $scope.count.changed += $scope.count.new + $scope.count.canceled + $scope.count.complaints;

      var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));
      var fda = findAndGet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId);
      findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'canceled', fda['canceled']);
      if ($scope.count.canceled > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'canceledCount', $scope.count.canceled);
      findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'new', fda['new']);
      if ($scope.count.new > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'newCount', $scope.count.new);
      findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'complaints', fda['complaints']);
      if ($scope.count.complaints > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'complaintsCount', $scope.count.complaints);
      findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'changed', fda['changed']);
      if ($scope.count.complaints > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'changedCount', $scope.count.changed);
      //HS [2016-oct-21] - DO NOT set 'hasCount' to fix the routestart popup issue where it does not show preparation popup if user visits this page 
      //                  and then start route but if user directly clicks on route start on the home page then it show the popup.
      //findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'hasCount', true);
      localStorage.setItem("distribution_approval", JSON.stringify(distributionApproval));

      if (fda['canceled']) $scope.canceledApproved = 'YES';
      if (fda['new']) $scope.newApproved = 'YES';
      if (fda['complaints']) $scope.complaintsApproved = 'YES';
      if (fda['changed']) $scope.changedApproved = 'YES';

      //console.log('Load : ' + JSON.stringify(JSON.parse(localStorage["distribution_approval"])));

      //$scope.count.all = $scope.data.items.length;
      //$scope.count.new = _.countBy($scope.data.items, function (item) { return item.IsNew; })[true] || 0;
      //$scope.count.canceled = _.countBy($scope.data.items, function (item) { return item.complaints && item.complaints.length; })[true] || 0;
      //$scope.count.complaints = _.countBy($scope.data.items, function (item) { return item.IsNew; })[true] || 0;

      ////HS - Old code
      ////var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));
      ////var fda = findAndGet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId);
      ////findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'canceled', fda['canceled']);
      ////if ($scope.count.canceled > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'canceledCount', $scope.count.canceled);
      ////findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'new', fda['new']);
      ////if ($scope.count.new > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'newCount', $scope.count.new);
      ////findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'complaints', fda['complaints']);
      ////if ($scope.count.complaints > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'complaintsCount', $scope.count.complaints);
      ////findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'hasCount', true);
      ////localStorage.setItem("distribution_approval", JSON.stringify(distributionApproval));

      ////if (fda['canceled']) $scope.canceledApproved = 'YES';
      ////if (fda['new']) $scope.newApproved = 'YES';
      ////if (fda['complaints']) $scope.complaintsApproved = 'YES';

      ////HS - new code to sync the complaints count when user navigate to this page from popup of Home screen
      //routeService.loadRouteComplaints($stateParams.distributionId, $stateParams.routeId, $stateParams.part, false).then(
      //    function (data) {
      //        //var routeAll = routeData.items.length;
      //        //var routeNew = _.countBy(routeData.items, function (item) { return item.IsNew; })[true] || 0;
      //        //var routeCanceled = 0;
      //        //var routeComplaints = _.countBy(routeData.items, function (item) { return (item.complaints && item.complaints.length > 0); })[true] || 0;

      //        $scope.count.all = $scope.data.items.length;
      //        $scope.count.new = _.countBy($scope.data.items, function (item) { return item.IsNew; })[true] || 0;
      //        $scope.count.canceled = 0;
      //        $scope.count.complaints = _.countBy($scope.data.items, function (item) {
      //            return (item.complaints && item.complaints.length > 0);
      //        })[true] || 0;

      //        var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));
      //        var fda = findAndGet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId);
      //        findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'canceled', fda['canceled']);
      //        if ($scope.count.canceled > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'canceledCount', $scope.count.canceled);
      //        findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'new', fda['new']);
      //        if ($scope.count.new > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'newCount', $scope.count.new);
      //        findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'complaints', fda['complaints']);
      //        if ($scope.count.complaints > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'complaintsCount', $scope.count.complaints);
      //        findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'hasCount', true);
      //        localStorage.setItem("distribution_approval", JSON.stringify(distributionApproval));

      //        if (fda['canceled']) $scope.canceledApproved = 'YES';
      //        if (fda['new']) $scope.newApproved = 'YES';
      //        if (fda['complaints']) $scope.complaintsApproved = 'YES';
      //    },
      //    function () {
      //    })


      //alert('Load : \n' + JSON.stringify(JSON.parse(localStorage["distribution_approval"])));
    },
    function () {
    })

  var _setVisibleData = function (data) {
    //HS - Start
    //$scope.distributionApproved = 'NO';
    //$scope.canceledApproved = 'NO';
    //$scope.newApproved = 'NO';
    //$scope.complaintsApproved = 'NO';
    var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));
    //alert(JSON.stringify(distributionApproval));
    var fda = findAndGet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId);
    //console.log("fda: " + JSON.stringify(fda));
    //alert($stateParams.distributionId);

    //if (fda != null) {
    //alert("found");
    //}
    //HS - End

    //console.log('_setVisibleData');
    //console.log(data);

    switch ($scope.filter) {
      case 'new':
        $scope.distributionApproved = (fda != null && fda.new) ? 'YES' : 'NO';
        $scope.newApproved = (fda != null && fda.new) ? 'YES' : 'NO';
        break;
      case 'complaints':
        $scope.distributionApproved = (fda != null && fda.complaints) ? 'YES' : 'NO';
        $scope.complaintsApproved = (fda != null && fda.complaints) ? 'YES' : 'NO';
        break;
      case 'canceled':
        $scope.distributionApproved = (fda != null && fda.canceled) ? 'YES' : 'NO';
        $scope.canceledApproved = (fda != null && fda.canceled) ? 'YES' : 'NO';
        break;
      case 'changed':
        $scope.distributionApproved = (fda != null && fda.changed) ? 'YES' : 'NO';
        $scope.changedApproved = (fda != null && fda.changed) ? 'YES' : 'NO';
        break;
    }

    //console.log('changed: ' + (fda != null && fda.changed));

    switch ($scope.filter) {
      case 'all':
        $scope.visibleData = data.items;
        break;
      case 'new':
        //$scope.visibleData = _.filter(data.items, { 'IsNew': true });
        $scope.visibleData = _.filter(data.items, { 'CompareData': 1 });
        break;
      case 'complaints':
        //$scope.visibleData = _.filter(data.items, function (item) { return item.complaints && item.complaints.length > 0 });
        $scope.visibleData = _.filter(data.items, function (item) { return (item.complaints && item.complaints.length > 0) });
        break;
      case 'canceled':
        //$scope.visibleData = data.items;
        $scope.visibleData = data.removedPoints; //_.filter(data.items, function (item) { return item.removedPoints && item.removedPoints.length > 0 });
        break;
      case 'changed':
        //$scope.visibleData = _.filter(data.items, function (item) { return (item.CompareData >= 3 && item.CompareData <= 6) });

        //HS [2016-may-17] - For 'changes' tab, json array with separate header, compare type, count and associated records
        $scope.changedData = [];
        var filteredData = _.filter(data.items, function (item) { return (item.CompareTypesString != null && item.CompareTypesString.indexOf('1') > -1) });
        if (filteredData && filteredData.length > 0) {
          $scope.changedData.push({ header: $filter('i18n')("totals-newSubscribers"), compareData: 1, count: filteredData.length, visibleData: filteredData });
        }
        filteredData = _.filter(data.items, function (item) { return (item.complaints && item.complaints.length > 0) });
        if (filteredData && filteredData.length > 0) {
          $scope.changedData.push({ header: $filter('i18n')("totals-complaints"), compareData: 2, count: filteredData.length, visibleData: filteredData });
          //console.log('complaints');
          //console.log(filteredData);
        }
        filteredData = data.removedPoints;
        if (filteredData && filteredData.length > 0) {
          $scope.changedData.push({ header: $filter('i18n')("totals-removedSubscribers"), compareData: 0, count: filteredData.length, visibleData: filteredData });
        }
        filteredData = _.filter(data.items, function (item) { return (item.CompareTypesString != null && item.CompareTypesString.indexOf('3') > -1) });
        if (filteredData && filteredData.length > 0) {
          $scope.changedData.push({ header: $filter('i18n')("totals-addressChange"), compareData: 3, count: filteredData.length, visibleData: filteredData });
        }
        filteredData = _.filter(data.items, function (item) { return (item.CompareTypesString != null && item.CompareTypesString.indexOf('4') > -1) });
        if (filteredData && filteredData.length > 0) {
          $scope.changedData.push({ header: $filter('i18n')("totals-locationChange"), compareData: 4, count: filteredData.length, visibleData: filteredData });
        }
        filteredData = _.filter(data.items, function (item) { return (item.CompareTypesString != null && item.CompareTypesString.indexOf('5') > -1) });
        if (filteredData && filteredData.length > 0) {
          $scope.changedData.push({ header: $filter('i18n')("totals-quantityChange"), compareData: 5, count: filteredData.length, visibleData: filteredData });
        }
        filteredData = _.filter(data.items, function (item) { return (item.CompareTypesString != null && item.CompareTypesString.indexOf('6') > -1) });
        if (filteredData && filteredData.length > 0) {
          $scope.changedData.push({ header: $filter('i18n')("totals-packagingChange"), compareData: 6, count: filteredData.length, visibleData: filteredData });
        }

        ////HS [2016-may-17] - For 'changes' tab, json array with separate header, compare type, count and associated records
        //$scope.changedData = [];
        //var filteredData = _.filter(data.items, { 'CompareData': 1 });
        //if (filteredData && filteredData.length > 0) {
        //    $scope.changedData.push({ header: $filter('i18n')("totals-newSubscribers"), compareData: 1, count: filteredData.length, visibleData: filteredData });
        //}
        //filteredData = _.filter(data.items, function (item) { return (item.complaints && item.complaints.length > 0) });
        //if (filteredData && filteredData.length > 0) {
        //    $scope.changedData.push({ header: $filter('i18n')("totals-complaints"), compareData: 2, count: filteredData.length, visibleData: filteredData });
        //    //console.log('complaints');
        //    //console.log(filteredData);
        //}
        //filteredData = data.removedPoints;
        //if (filteredData && filteredData.length > 0) {
        //    $scope.changedData.push({ header: $filter('i18n')("totals-removedSubscribers"), compareData: 0, count: filteredData.length, visibleData: filteredData });
        //}
        //filteredData = _.filter(data.items, function (item) { return (item.CompareData == 3) });
        //if (filteredData && filteredData.length > 0) {
        //    $scope.changedData.push({ header: $filter('i18n')("totals-addressChange"), compareData: 3, count: filteredData.length, visibleData: filteredData });
        //}
        //filteredData = _.filter(data.items, function (item) { return (item.CompareData == 4) });
        //if (filteredData && filteredData.length > 0) {
        //    $scope.changedData.push({ header: $filter('i18n')("totals-locationChange"), compareData: 4, count: filteredData.length, visibleData: filteredData });
        //}
        //filteredData = _.filter(data.items, function (item) { return (item.CompareData == 5) });
        //if (filteredData && filteredData.length > 0) {
        //    $scope.changedData.push({ header: $filter('i18n')("totals-quantityChange"), compareData: 5, count: filteredData.length, visibleData: filteredData });
        //}
        //filteredData = _.filter(data.items, function (item) { return (item.CompareData == 6) });
        //if (filteredData && filteredData.length > 0) {
        //    $scope.changedData.push({ header: $filter('i18n')("totals-packagingChange"), compareData: 6, count: filteredData.length, visibleData: filteredData });
        //}
        break;
      case 'reorder':
        $scope.visibleData = data.items;
        break;
      case 'totals':
        //$scope.totals.newSubscribers = _.filter(data.items, { 'CompareData': 1 }).length || 0;
        //$scope.totals.complaints = _.filter(data.items, function (item) { return (item.complaints && item.complaints.length > 0) }).length || 0;
        //$scope.totals.removedSubscribers = data.removedPoints.length || 0;
        //$scope.totals.addressChange = _.filter(data.items, function (item) { return (item.CompareData == 3) }).length || 0;
        //$scope.totals.locationChange = _.filter(data.items, function (item) { return (item.CompareData == 4) }).length || 0;
        //$scope.totals.quantityChange = _.filter(data.items, function (item) { return (item.CompareData == 5) }).length || 0;
        //$scope.totals.packagingChange = _.filter(data.items, function (item) { return (item.CompareData == 6) }).length || 0;

        //HS [2016-may-17] - For 'totals' tab, set publications
        $scope.publications = data.publications || [];
        break;
      default:
        $scope.visibleData = data.items;
    }

    //alert('Route: \n' + JSON.stringify(JSON.parse(localStorage["distribution_approval"])));

  }

  $scope.$watch(function () { return routeService.data.dataVersion; }, function (data) {
    if (routeService.data.currentRoute) {
      $scope.data = routeService.data.currentRoute;
      _setVisibleData($scope.data);

      $scope.count.all = $scope.data.items.length;
      $scope.count.new = _.countBy($scope.data.items, function (item) { return (item.CompareTypesString != null && item.CompareTypesString.indexOf('1') > -1); })[true] || 0;
      $scope.count.canceled = $scope.data.removedPoints.length; //_.countBy($scope.data.items, function (item) { return (item.removedPoints && item.removedPoints.length>0); })[true] || 0;
      $scope.count.complaints = _.countBy($scope.data.items, function (item) { return (item.complaints && item.complaints.length > 0); })[true] || 0;
      $scope.count.changed = _.countBy($scope.data.items, function (item) {
        return (item.CompareTypesString != null) && (item.CompareTypesString.indexOf('3') > -1
          || item.CompareTypesString.indexOf('4') > -1
          || item.CompareTypesString.indexOf('5') > -1
          || item.CompareTypesString.indexOf('6') > -1);
      })[true] || 0;

      //HS [2016-may-17] - For 'changes' tab, count total changes records for all compareData
      $scope.count.changed += $scope.count.new + $scope.count.canceled + $scope.count.complaints;

      //console.log('watch');
      //console.log($scope.count.all + ':' + $scope.count.new + ':' + $scope.count.canceled + ':' + $scope.count.complaints);

      //$scope.count.all = $scope.data.items.length;
      //$scope.count.new = _.countBy($scope.data.items, function (item) { return item.IsNew; })[true] || 0;
      //$scope.count.canceled = 0;
      //$scope.count.complaints = _.countBy($scope.data.items, function (item) {
      //    return (item.complaints && item.complaints.length>0);
      //})[true] || 0;

      var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));
      var fda = findAndGet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId);
      findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'canceled', fda['canceled']);
      if ($scope.count.canceled > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'canceledCount', $scope.count.canceled);
      findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'new', fda['new']);
      if ($scope.count.new > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'newCount', $scope.count.new);
      findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'complaints', fda['complaints']);
      if ($scope.count.complaints > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'complaintsCount', $scope.count.complaints);
      findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'changed', fda['changed']);
      if ($scope.count.complaints > 0) findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'changedCount', $scope.count.changed);
      //HS [2016-oct-21] - DO NOT set 'hasCount' to fix the routestart popup issue where it does not show preparation popup if user visits this page 
      //                  and then start route but if user directly clicks on route start on the home page then it show the popup.
      //findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, 'hasCount', true);
      localStorage.setItem("distribution_approval", JSON.stringify(distributionApproval));

      if (fda['canceled']) $scope.canceledApproved = 'YES';
      if (fda['new']) $scope.newApproved = 'YES';
      if (fda['complaints']) $scope.complaintsApproved = 'YES';
      if (fda['changed']) $scope.changedApproved = 'YES';

      //alert('watch : \n' + JSON.stringify(JSON.parse(localStorage["distribution_approval"])));
    }
  }, true);


  var timer;

  $scope.reorderItem = function (item, $fromIndex, $toIndex, $event) {

    //alert($scope.data.items[$toIndex].Position );
    if ($toIndex < 0) {
      return;
    }
    loaderService.show();
    $scope.data.items[$toIndex].selected = true;
    $scope.selectedItemId = item.DistributionItemId;

    var position = $scope.data.items[$toIndex].Position
    $scope.data.items.splice($fromIndex, 1);
    $scope.data.items.splice($toIndex, 0, item);

    if (position == null) {
      position = 1;
    }

    routeService.reorderItem(item.DistributionItemId, position).then(
      function () {
        $scope.data = routeService.data.currentRoute;
        loaderService.hide();
      },
      function () {
        loaderService.hide();
      });

    $event.preventDefault;



    //if (timer) {
    //    $timeout.cancel(timer);
    //}
    //timer =  $timeout(function () {
    //    $scope.selectedItemId = 0
    //}, 1000);

  }

  $scope.showItem = function (item) {


    if (item.DeliveryItemId && item.DeliveryItemId > 0) { //go to delivery item page when it is a delivery
      $state.go('app.deliveryItem', { itemId: item.DeliveryItemId });

    } else {

      routeService.setCurrentItem(item);
      if (routeService.data.currentRoute.routeStartTime) {
        //HS [2017-oct-26] - Passed triggeredFrom param to set autoSetCurrentItem param in routeService.setRouteId call in deliveryController.js file
        $state.go('app.delivery', { distributionId: $stateParams.distributionId, routeId: $stateParams.routeId, part: $stateParams.part, triggeredFrom: 'order' });
      } else {
        //HS [2017-oct-26] - Passed triggeredFrom param to set autoSetCurrentItem param in routeService.setRouteId call in deliveryController.js file
        $state.go('app.delivery', { distributionId: $stateParams.distributionId, routeId: $stateParams.routeId, part: $stateParams.part, triggeredFrom: 'order' });
        // $state.go('app.routeItem');
      }
    }
  }

  $scope.setFilter = function (filter, count) {
    if (count && count > 0 && $scope.filter != filter) {
      $scope.filter = filter;
      routeOrderStateService.data.filter = filter;
      _setVisibleData($scope.data);
      $ionicScrollDelegate.scrollTop();

    }
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

        routeService.reorderItem(item.DistributionItemId, $scope.itemOrder.text).then(
          function () {
            $scope.data = routeService.data.currentRoute;
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

  //HS - Start
  $scope.setDistributionApproval = function (currentFilter, $event) {
    var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));
    findAndSet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId, currentFilter, $event.target.checked);
    localStorage.setItem("distribution_approval", JSON.stringify(distributionApproval));
    //distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));

    //var distributionApproval = JSON.parse(localStorage.getItem("distribution_approval"));
    var fda = findAndGet(distributionApproval, 'distributionId', $stateParams.distributionId, 'routeId', $stateParams.routeId);

    switch (currentFilter) {
      case 'new':
        $scope.distributionApproved = (fda != null && fda.new) ? 'YES' : 'NO';
        $scope.newApproved = (fda != null && fda.new) ? 'YES' : 'NO';
        break;
      case 'complaints':
        $scope.distributionApproved = (fda != null && fda.complaints) ? 'YES' : 'NO';
        $scope.complaintsApproved = (fda != null && fda.complaints) ? 'YES' : 'NO';
        break;
      case 'canceled':
        $scope.distributionApproved = (fda != null && fda.canceled) ? 'YES' : 'NO';
        $scope.canceledApproved = (fda != null && fda.canceled) ? 'YES' : 'NO';
        break;
      case 'changed':
        $scope.distributionApproved = (fda != null && fda.changed) ? 'YES' : 'NO';
        $scope.changedApproved = (fda != null && fda.changed) ? 'YES' : 'NO';
        break;
    }

    $event.preventDefault;
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

})



