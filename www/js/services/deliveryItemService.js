
myApp.factory('deliveryItemService', function ($http, $q, $state, $rootScope, loaderService, geolocation, $filter) {

  var _data = {
    loading: false
  }


  var _getByCode = function (barcode) {
    var deferred = $q.defer();

    _data.loading = true;
    loaderService.show();


    var params = {
      PublisherId: 0,
      Code: barcode
    }

    $http.get(globalParams.baseUrl + '/deliveryItems/GetBycode', { params: params }).
      success(function (data, status, headers, config) {
        if (data && data.Success) {
          deferred.resolve(data.Results);
        }
        else {
          deferred.reject();
        }
        _data.loading = false;
        loaderService.hide();

      }).
      error(function (data, status, headers, config) {
        _data.loading = false;
        loaderService.hide();
        deferred.reject(status);

      });
    return deferred.promise;
  };

 //HS [2018-apr-26] - Task # 6 - Add New barcode (Return Barcode) After Scan - Call api to save return barcode
  var _saveNewBarcode = function (deliveryItemCode,barcode) {
  var deferred = $q.defer();
  
  _data.loading = true;
  loaderService.show();
  
  
  var params = {
  deliveryItemCode:deliveryItemCode,
  Code: barcode
  }
  
  $http.get(globalParams.baseUrl + '/deliveryItems/GetNewBarcodeByScan', { params: params }).
  success(function (data, status, headers, config) {
          if (data && data.Success) {
          deferred.resolve(data.Results);
          }
          else {
          deferred.reject();
          }
          _data.loading = false;
          loaderService.hide();
          
          }).
  error(function (data, status, headers, config) {
        _data.loading = false;
        loaderService.hide();
        deferred.reject(status);
        
        });
  return deferred.promise;
  };
              
  var _getById = function (itemId) {
    var deferred = $q.defer();

    _data.loading = true;
    loaderService.show();


    var params = {
      DeliveryItemId: itemId
    }

    $http.get(globalParams.baseUrl + '/deliveryItems/Get', { params: params }).
      success(function (data, status, headers, config) {
        if (data && data.Success) {
          deferred.resolve(data.Results);
        }
        else {
          deferred.reject();
        }
        _data.loading = false;
        loaderService.hide();

      }).
      error(function (data, status, headers, config) {
        _data.loading = false;
        loaderService.hide();
        deferred.reject(status);

      });
    return deferred.promise;
  };

  var _getAvaliableTransitions = function (deliveryItemId) {
    var deferred = $q.defer();

    _data.loading = true;
    loaderService.show();


    var params = {
      DeliveryItemId: deliveryItemId
    }

    $http.get(globalParams.baseUrl + '/deliveryItems/getAvailableTransitions', { params: params }).
      success(function (data, status, headers, config) {
        if (data && data.Success) {
          deferred.resolve(data.Results);
        }
        else {
          deferred.reject();
        }
        _data.loading = false;
        loaderService.hide();

      }).
      error(function (data, status, headers, config) {
        _data.loading = false;
        loaderService.hide();
        deferred.reject(status);

      });
    return deferred.promise;
  };

  var _loadRouteItems = function (distributionId, routeId, part) {
    var deferred = $q.defer();

    _data.loading = true;
    loaderService.show();

    var params ={
      distributionId: distributionId,
      routeId: routeId,
      currentPage: 1,
      resultsInPage: 999,
      orderBy: 'Position',
      part: part
    }


    $http.post(globalParams.baseUrl + '/Distributions/GetAppRouteItemsForDelivery', params).
      success(function (data, status, headers, config) {
        if (data && data.Results) {
          r = { distributionId: parseInt(params.distributionId), routeId: parseInt(params.routeId), part: params.part, items: data.Results, routeName: data.extraData.RouteName, routeStartTime: data.extraData.RouteStartTime };
          deferred.resolve(r);
        }
        else {
          deferred.reject();
        }
        _data.loading = false;
        loaderService.hide();

      }).
      error(function (data, status, headers, config) {
        _data.loading = false;
        loaderService.hide();
        deferred.reject(status);

      });
    return deferred.promise;
  };

  var _applyTransition = function (deliveryItemId, transitionId, deliveryReasonId, notes, deliveredToName, imageData, signatureData) {
    var deferred = $q.defer();

    _data.loading = true;
    loaderService.show();


    var params = {

      DeliveryItemId: deliveryItemId,
      position: geolocation.stringifiedPosition(),
      TransitionId: transitionId,
      ReasonId: deliveryReasonId,
      Notes: notes,
      DeliveredToName: deliveredToName,
      ImageData: imageData,
      SignatureData: signatureData

    }

    $http.post(globalParams.baseUrl + '/DeliveryItems/ApplyTransition',  params ).
      success(function (data, status, headers, config) {
        if (data && data.Success) {
          deferred.resolve(data.Results);
        }
        else {
          deferred.reject(data.ErrorMessage);
        }
        _data.loading = false;
        loaderService.hide();

      }).
      error(function (data, status, headers, config) {
        _data.loading = false;
        loaderService.hide();
        deferred.reject(status);

      });
    return deferred.promise;
  };

  var _acceptDelivery = function (deliveryCode) {
    var deferred = $q.defer();

    _data.loading = true;
    loaderService.show();


    var params = {

      code: deliveryCode,
      position: geolocation.stringifiedPosition()
    }

    $http.post(globalParams.baseUrl + '/DeliveryItems/ScanToAccept', params).
      success(function (data, status, headers, config) {
        if (data && data.Success) {
          deferred.resolve(data.Results);
        }
        else {
          deferred.reject(data.ErrorMessage);
        }
        _data.loading = false;
        loaderService.hide();

      }).
      error(function (data, status, headers, config) {
        _data.loading = false;
        loaderService.hide();
        deferred.reject(status);

      });
    return deferred.promise;
  };
  var _scheduleDelivery = function (deliveryItemId, scheduledDeliveryDate, notes) {
    var deferred = $q.defer();

    _data.loading = true;
    loaderService.show();


    var params = {

      DeliveryItemId: deliveryItemId,
      position: geolocation.stringifiedPosition(),
      ScheduledDeliveryDate: scheduledDeliveryDate,
      Notes: notes
    }

    $http.post(globalParams.baseUrl + '/DeliveryItems/ScheduleDelivery', params).
      success(function (data, status, headers, config) {
        if (data && data.Success) {
          deferred.resolve(data.Results);
        }
        else {
          deferred.reject(data.ErrorMessage);
        }
        _data.loading = false;
        loaderService.hide();

      }).
      error(function (data, status, headers, config) {
        _data.loading = false;
        loaderService.hide();
        deferred.reject(status);

      });
    return deferred.promise;
  };

  return {
    data: _data,
    getByCode: _getByCode,
    scheduleDelivery: _scheduleDelivery,
    getAvaliableTransitions: _getAvaliableTransitions,
    applyTransition: _applyTransition,
    loadRouteItems: _loadRouteItems,
    acceptDelivery: _acceptDelivery,
    getById: _getById,
    //HS [2018-apr-26] - Task # 6 - Add New barcode (Return Barcode) After Scan - Call api to save return barcode
    SaveNewBarcode:_saveNewBarcode
  }
});
