
myApp.factory('routeService', function ($http, $q, $state, $rootScope, loaderService, geolocation, $filter) {


    var _data = {
        routes: [],
        currentRoute: null,
        currentItem: {},
        currentItemIndex:0,
        loading: false,
        dataVersion: 1,
        imageData: null, //HS
        params: {
            distributionId: 0,
            routeId: 0,
            //part: 0, //HS
            searchPhrase: "",
            currentPage: 1,
            resultsInPage: 500,
            orderBy: "Position"
        }
    }

    var _setCurrentItem = function (currentItem) {
        _data.currentItem = currentItem;
        _data.currentItemIndex = _data.currentRoute.items.indexOf(_data.currentItem);
        //_data.currentItem.complaints = _.filter(_data.currentRoute.complaints, { 'SubscriberId': _data.currentItem.SubscriberId })
    }
   
    var _setRouteId = function (distributionId, routeId, part, autoSetCurrentItem) {
        var deferred = $q.defer();

        //if (!part) part = 0;
        //else if (part == null) part = 0;
        //else if (part == "") part = 0;
        //else {
        //    try {
        //        part = parseInt(part);
        //    }
        //    catch (e) {
        //        part = 0;
        //    }
        //}

        var r = _.find(_data.routes, { 'distributionId': parseInt(distributionId), 'routeId': parseInt(routeId), 'part' : part });
        if (r) {
            //console.log('true');

            _data.params.distributionId = distributionId;
            _data.params.routeId = routeId;
            _data.params.part = part;
            _data.currentRoute = r;
            if (autoSetCurrentItem) {
                _data.currentItem = _.find(_data.currentRoute.items, { 'DeliveryTime': null })
                if (!_data.currentItem) {
                    _setCurrentItem(_.first(_data.currentRoute.items));
                    //_data.currentItem = _.first(_data.currentRoute.items)
                    //_data.currentItemIndex = _data.currentRoute.items.indexOf(_data.currentItem);

                }
                    //HS [2016-Aug-22] - Set current item index if undelivered point found
                else {
                    _data.currentItemIndex = _data.currentRoute.items.indexOf(_data.currentItem);
                }
            }
            deferred.resolve(_data.currentItem);
        }else
        {
            //console.log('false');

            _data.params.distributionId = distributionId;
            _data.params.routeId = routeId;
            _data.params.part = part;
            _loadRoute().then(
                function () {
                    _setCurrentItem(_.find(_data.currentRoute.items, { 'DeliveryTime': null }));
                    //_data.currentItem = _.find(_data.currentRoute.items, { 'DeliveryTime': null });
                    if (!_data.currentItem) {
                        _setCurrentItem(_.first(_data.currentRoute.items));
                        //_data.currentItem = _.first(_data.currentRoute.items)

                    }
                        //HS [2016-Aug-22] - Set current item index if undelivered point found
                    else {
                        _data.currentItemIndex = _data.currentRoute.items.indexOf(_data.currentItem);
                    }
                    // _data.currentItemIndex = _data.currentRoute.items.indexOf(_data.currentItem);
                    deferred.resolve(_data.currentItem);
                },
                function () {
                });
        }
        return deferred.promise;

    }

    var _attachComplaintsToItems = function (complaints, items) {
        if (!complaints || !items) {
            return false;
        }
        for (var i = 0; i < complaints.length; i++) {
            var filtered = _.filter(items, { 'SubscriberId': complaints[i].SubscriberId });
            if (filtered) {
                //console.log('SubscriberId:' + complaints[i].SubscriberId);
                for (var j = 0; j < filtered.length; j++) {
                    filtered[j].complaints = filtered[j].complaints || [];
                    filtered[j].complaints.push(complaints[i]);

                    //var filtered1 = _.filter(filtered[j].complaints, { 'SubscriberId': complaints[i].SubscriberId });
                    //console.log(filtered1);
                    //if (filtered1.length==0) {
                    //    filtered[j].complaints.push(complaints[i]);
                    //}
                }
            }
        }
        _data.dataVersion += 1;
    }


    var _loadRouteComplaints = function (distributionId, routeId, part) {
        var deferred = $q.defer();

        var params = {
            distributionId:distributionId, 
            routeId: routeId,
            part: part
        }

        _data.loading = true;

        $http.post(globalParams.baseUrl + '/Distributions/GetRouteRecentComplaints', params).
            success(function (data, status, headers, config) {
                if (data && data.Results) {
                    var r = _.find(_data.routes, { 'distributionId': parseInt(params.distributionId), 'routeId': parseInt(params.routeId) });
                    if (!r) {
                        r = { distributionId: parseInt(params.distributionId), routeId: parseInt(params.routeId), complaints: data.Results };
                        _data.routes.push(r);
                    } else {
                        r.complaints = data.Results;
                    }
                    _attachComplaintsToItems(r.complaints,r.items)

                    //_setCurrentItem(_data.currentItem);
                    deferred.resolve(_data.currentRoute);
                }
                else {
                    deferred.reject();
                }
                _data.loading = false;

            }).
            error(function (data, status, headers, config) {
                _data.loading = false;
                deferred.reject(status);

            });
        return deferred.promise;
    };


    var _loadRoute = function () {
        var deferred = $q.defer();

        _data.loading = true;
        loaderService.show();

        //console.log('GetAppRouteItems');
        //console.log(_data.params);

        //$http.post(globalParams.baseUrl + '/Distributions/GetRouteItems', _data.params).
        $http.post(globalParams.baseUrl + '/Distributions/GetAppRouteItems', _data.params).
            success(function (data, status, headers, config) {
                if (data && data.Results) {
                    //console.log(data);

                    var r = _.find(_data.routes, { 'distributionId': parseInt(_data.params.distributionId), 'routeId': parseInt(_data.params.routeId), 'part': _data.params.part });
                    if (!r) {
                        r = { distributionId: parseInt(_data.params.distributionId), routeId: parseInt(_data.params.routeId), part: _data.params.part, items: data.Results, routeName: data.extraData.RouteName, routeStartTime: data.extraData.RouteStartTime  };
                        _data.routes.push(r);
                    } else {
                        r.items = data.Results;
                    }
                    _data.currentRoute = r;
                    deferred.resolve(_data.currentRoute);
                    //_loadRouteComplaints(_data.params.distributionId, _data.params.routeId, _data.params.part);

                    r.removedPoints = r.removedPoints || [];
                    r.removedPoints = data.extraData.RemovedPoints;

                    //r.complaints = data.extraData.Complaints;
                    //_attachComplaintsToItems(r.complaints, r.items);

                    //HS [2016-may-17] - For 'totals' tab, add publications
                    r.publications = [];
                    angular.forEach(data.Results, function (value, key) {
                        if (!value.OutputDisplayName || value.OutputDisplayName == null) value.OutputDisplayName = $filter('i18n')("normal-product");
                        var p = _.find(r.publications, { 'OutputDisplayName': value.OutputDisplayName });
                        if (!p) {
                            p = { OutputDisplayName: value.OutputDisplayName, Count: 0 };
                            if (value.Quantity) p.Count += value.Quantity;
                            r.publications.push(p);
                        }
                        else {
                            if(value.Quantity) p.Count += value.Quantity;
                        }
                    });
                    r.publications.splice(0, 0, { OutputDisplayName: $filter('i18n')("totals-products"), Count: 0 });

                    var uniqueSubscribers = [];
                    for (i = 0; i < data.Results.length; i++) {
                        if (uniqueSubscribers.indexOf(data.Results[i].SubscriberId) === -1) {
                            uniqueSubscribers.push(data.Results[i].SubscriberId);
                        }
                    }

                    r.publications.push({ OutputDisplayName: $filter('i18n')("totals-subscribers"), Count: uniqueSubscribers.length });

                    //console.log('response');
                    //console.log(r);
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
    
    //HS [2016-Aug-22] - Check whether the point is last or not
    var _isLastItem = function () {
        return _data.currentItemIndex >= (_data.currentRoute.items.length - 1);
    }

    var _moveToNextItem = function () {
        
        //console.log('currentItemIndex: ' + _data.currentItemIndex);
        //console.log('length: ' + _data.currentRoute.items.length);
        if (_data.currentItemIndex < _data.currentRoute.items.length) {
            _setCurrentItem(_data.currentRoute.items[_data.currentItemIndex + 1]);

            //_data.currentItemIndex += 1;
            //_data.currentItem = _data.currentRoute.items[_data.currentItemIndex];

            ////Uncomment below code when need to show skipped point/first point after last point delivery. Right now after last point, user redirected to home page.
            ////HS [2016-Aug-22] - Added else part to check the undelivered point after last point and set the current point for the navigation
            //if (!_isLastItem()) {
            //    _setCurrentItem(_data.currentRoute.items[_data.currentItemIndex + 1]);
            //}
            //else {
            //    var deferred = $q.defer();

            //    var undeliveredCount = _.countBy(_data.currentRoute.items, function (item) { return (item.DeliveryTime == null); })[true] || 0;
            //    console.log(undeliveredCount);
            //    if (undeliveredCount > 0) {
            //        _data.currentItem = _.find(_data.currentRoute.items, { 'DeliveryTime': null });
            //        console.log('_data.currentItem');
            //        console.log(_data.currentItem);
            //        if (!_data.currentItem) {
            //            _setCurrentItem(_.first(_data.currentRoute.items));
            //            //_data.currentItem = _.first(_data.currentRoute.items)
            //            //_data.currentItemIndex = _data.currentRoute.items.indexOf(_data.currentItem);
            //        }
            //        else {
            //            _setCurrentItem(_data.currentItem);
            //        }
            //        console.log('currentItemIndex :' + _data.currentItemIndex);
            //    }
            //    else {
            //        _setCurrentItem(_.first(_data.currentRoute.items));
            //    }
            //    deferred.resolve(_data.currentItem);
            //}

        }
        return _data.currentItem;
    }

    var _moveToPrevItem = function () {

        if (_data.currentItemIndex > 0) {
            _setCurrentItem(_data.currentRoute.items[_data.currentItemIndex -1]);

            //_data.currentItemIndex -= 1;
            //_data.currentItem = _data.currentRoute.items[_data.currentItemIndex];
        }
        return _data.currentItem;
    }

    var _deliverAndGetNextItem = function () {

        //add delivery data on the item 
        _data.currentItem.deliveryData = {};
        _data.currentItem.deliveryData.time = (new Date()).toJSON();
        _data.currentItem.deliveryData.position = geolocation.stringifiedPosition();
        _data.currentItem.deliveryData.imageData = null; //HS
        _data.currentItem.DeliveryTime = _data.currentItem.deliveryData.time;

        _data.imageData = null; //HS

        //try to upload the changes to server
        _deliverInternal(_data.currentItem, true);
        
        return _moveToNextItem();

    };

    //HS
    var _deliverWithImageAndGetNextItem = function () {

        //add delivery data on the item 
        _data.currentItem.deliveryData = {};
        _data.currentItem.deliveryData.time = (new Date()).toJSON();
        _data.currentItem.deliveryData.position = geolocation.stringifiedPosition();
        _data.currentItem.deliveryData.imageData = _data.imageData; //HS
        _data.currentItem.DeliveryTime = _data.currentItem.deliveryData.time;

        _data.imageData = null; //HS

        //try to upload the changes to server
        _deliverInternal(_data.currentItem, true);

        return _moveToNextItem();

    };

    var _undeliver = function () {

        //remove delivery data on the item 
        _data.currentItem.deliveryData = {};
        _data.currentItem.deliveryData.time = null;
        _data.currentItem.deliveryData.position = null;
        _data.currentItem.DeliveryTime = null;

        //try to upload the changes to server
        _undeliverInternal(_data.currentItem, true);

        return _data.currentItem;

    };

    var _comment = function (comment) {

        //add delivery data on the item 
        _data.currentItem.commentData = {};
        _data.currentItem.commentData.comment = comment;

        
        //try to upload the changes to server
        _commentInternal(_data.currentItem, true);

    };


    var _commentInternal = function (item, tryToUploadCachedItems) {
        var itemIndex = _data.currentRoute.items.indexOf(item);
        //mark this item as being processed
        item.commentData.isProcessed = true;

        $http.post(globalParams.baseUrl + '/Distributions/CommentItem', {
            distributionItemId: item.DistributionItemId,
            comment: item.commentData.comment,
            currentTime: (new Date()).toJSON()
        }).
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    //remove the comments from the cached item 
                    _data.currentRoute.items[itemIndex].commentData = null;
                } else {
                    item.commentData.isProcessed = false;
                }
                if (tryToUploadCachedItems) {
                    _tryToUploadCachedItems();
                }
            }).
            error(function (data, status, headers, config) {
                item.commentData.isProcessed = false;
            });
    }

    //HS [2016-nov-3] - Add comment with picture
    var _commentWithPicture = function (comment, imageData) {

        //add delivery data on the item 
        _data.currentItem.commentData = {};
        _data.currentItem.commentData.comment = comment;


        //try to upload the changes to server
        _commentWithPictureInternal(_data.currentItem, imageData, true);

    };

    //HS [2016-nov-3] - Add comment with picture
    var _commentWithPictureInternal = function (item, imageData, tryToUploadCachedItems) {
        var itemIndex = _data.currentRoute.items.indexOf(item);
        //mark this item as being processed
        item.commentData.isProcessed = true;

        $http.post(globalParams.baseUrl + '/Distributions/CommentItemWithImage', {
            distributionItemId: item.DistributionItemId,
            comment: item.commentData.comment,
            imageData: imageData,
            currentTime: (new Date()).toJSON()
        }).
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    //remove the comments from the cached item 
                    _data.currentRoute.items[itemIndex].commentData = null;
                } else {
                    item.commentData.isProcessed = false;
                }
                if (tryToUploadCachedItems) {
                    _tryToUploadCachedItems();
                }
            }).
            error(function (data, status, headers, config) {
                item.commentData.isProcessed = false;
            });
    }

    var _deliverInternal = function (item, tryToUploadCachedItems) {
        var itemIndex = _data.currentRoute.items.indexOf(item);
        //mark this item as being processed
        item.deliveryData.isProcessed = true;

        //HS
        var params = {};
        var relativeUrl = '/Distributions/Deliver';
        if (item.deliveryData.imageData != null) {
            relativeUrl = '/Distributions/DeliverWithImage';
            params = {
                distributionItemId: item.DistributionItemId,
                position: item.deliveryData.position,
                imageData: item.deliveryData.imageData, //HS
                deliveryTime: item.deliveryData.time,
                currentTime: (new Date()).toJSON()
            }
        }
        else {
            params = {
                distributionItemId: item.DistributionItemId,
                position: item.deliveryData.position,
                deliveryTime: item.deliveryData.time,
                currentTime: (new Date()).toJSON()
            }
        }

        //HS
        //$http.post(globalParams.baseUrl + '/Distributions/Deliver', {
        //$http.post(globalParams.baseUrl + '/Distributions/DeliverWithImage', {
        //    distributionItemId: item.DistributionItemId,
        //    position: item.deliveryData.position,
        //    imageData: item.deliveryData.imageData, //HS
        //    deliveryTime: item.deliveryData.time,
        //    currentTime: (new Date()).toJSON()
        //}).
        $http.post(globalParams.baseUrl + relativeUrl, params).
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    //update the item in th cache
                    if (data.Results) {
                        _data.currentRoute.items[itemIndex] = data.Results;
                    }
                } else {
                    item.deliveryData.isProcessed = false;
                }
                if (tryToUploadCachedItems) {
                    _tryToUploadCachedItems();
                }
            }).
            error(function (data, status, headers, config) {
                item.deliveryData.isProcessed = false;
            });
    }

    var _undeliverInternal = function (item, tryToUploadCachedItems) {
        var itemIndex = _data.currentRoute.items.indexOf(item);
        //mark this item as being processed
        item.deliveryData.isProcessed = true;

        $http.post(globalParams.baseUrl + '/Distributions/Undeliver', {
            distributionItemId: item.DistributionItemId
        }).
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    //update the item in th cache
                    _data.currentRoute.items[itemIndex] = data.Results;
                } else {
                    item.deliveryData.isProcessed = false;
                }
                if (tryToUploadCachedItems) {
                    _tryToUploadCachedItems();
                }
            }).
            error(function (data, status, headers, config) {
                item.deliveryData.isProcessed = false;
            });
    }

    var _tryToUploadCachedItems = function () {

        var routesCount = _data.routes.length;

        for (var i = 0; i < _data.routes.length; i++) {
            
            //upload delivery data
            var cachedItems = _.select(_data.routes[i].items, function (item) {
                return item.deliveryData && !item.deliveryData.isProcessed && item.deliveryData.time;
            });


            if (cachedItems && cachedItems.length) {
                for (var j = 0; j < cachedItems.length; j++) {
                    //try to upload the changes to server
                    _deliverInternal(cachedItems[j], false);
                }
            }

            //upload un-delivery data
            var cachedUndeliverItems = _.select(_data.routes[i].items, function (item) {
                return item.deliveryData && !item.deliveryData.isProcessed && item.deliveryData.time == null;
            });


            if (cachedUndeliverItems && cachedUndeliverItems.length) {
                for (var j = 0; j < cachedUndeliverItems.length; j++) {
                    //try to upload the changes to server
                    _undeliverInternal(cachedUndeliverItems[j], false);
                }
            }

            //upload comments data
            var cachedComments = _.select(_data.routes[i].items, function (item) {
                return item.commentData && !item.commentData.isProcessed;
            });


            if (cachedComments && cachedComments.length) {
                for (var j = 0; j < cachedComments.length; j++) {
                    //try to upload the changes to server
                    _commentInternal(cachedComments[j], false);
                }
            }

        }


    }


    var _routeStart = function (distributionId, routeId, part) {
        var deferred = $q.defer();

        _data.loading = true;
        loaderService.show();

        var params = {
            distributionId: distributionId,
            routeId: routeId,
            position: geolocation.stringifiedPosition(),
            part: part
        }


        $http.post(globalParams.baseUrl + '/Distributions/RouteStart', params).
            success(function (data, status, headers, config) {
                if (data && data.Results) {
                    //_data.items = data.Results;
                    deferred.resolve(data.Results);
                }
                else {
                    //_data.items = null;
                    deferred.reject();
                }
                _data.loading = false;
                loaderService.hide();

            }).
            error(function (data, status, headers, config) {
                _data.loading = false;
                loaderService.hide();
                //_data.items = null;
                deferred.reject(status);

            });
        return deferred.promise;
    };

    var _reorderItem = function (distributionItemId, position, reloadAfterCompletion ) {
        var deferred = $q.defer();

        if (reloadAfterCompletion == null) { reloadAfterCompletion =true} //default is true
        _data.loading = true;
        loaderService.show();

        $http.post(globalParams.baseUrl + '/Distributions/ReorderItem', {distributionItemId: distributionItemId, position:position}).
            success(function (data, status, headers, config) {
                if (data && data.Results) {
                  if (reloadAfterCompletion) {
                    _loadRoute().then(
                      function () {
                        deferred.resolve();
                      },
                      function () {
                        deferred.reject();
                      });
                  } else {
                    deferred.resolve();
                  }
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

    //HS
    var _setRoutePreparations = function (distributionId, routeId, part, routeCanceledSelected, routeCanceledCount, routeNewSelected, routeNewCount, routeComplaintsSelected, routeComplaintsCount, routeChangedSelected, routeChangedCount) {
        var deferred = $q.defer();

        _data.loading = true;
        loaderService.show();
        
        var params = {
            distributionId: distributionId,
            routeId: routeId,
            part: part,
            routeCanceledCount: routeCanceledCount,
            routeCanceledSelected: routeCanceledSelected,
            routeNewCount: routeNewCount,
            routeNewSelected: routeNewSelected,
            routeComplaintsCount: routeComplaintsCount,
            routeComplaintsSelected: routeComplaintsSelected,
            routeChangedCount: routeChangedCount,
            routeChangedSelected: routeChangedSelected,
            position: geolocation.stringifiedPosition(), //HS [2016-Apr-25] - Added position param require for "routeStart" API
        }


        $http.post(globalParams.baseUrl + '/Distributions/SetRoutePreparations', params).
            success(function (data, status, headers, config) {
                if (data) {
                    deferred.resolve(data);
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

    //HS
    //var _setSkipTime = function () {
    //    //set skip time on the item 
    //    _data.currentItem.SkipTime = (new Date()).toJSON();
    //};

    //HS
    var _skip = function () {

        //set skip time on the item 
        _data.currentItem.SkipTime = (new Date()).toJSON();

        //try to upload the changes to server
        _skipInternal(_data.currentItem, true);

        return _moveToNextItem();

    };

    //HS
    var _skipInternal = function (item, tryToUploadCachedItems) {
        var itemIndex = _data.currentRoute.items.indexOf(item);

        $http.post(globalParams.baseUrl + '/Distributions/SkipDistributionItem', {
            distributionItemId: item.DistributionItemId
        }).
            success(function (data, status, headers, config) {
                if (data && data.Success) {
                    //update the item in th cache
                    if (data.Results) {
                        _data.currentRoute.items[itemIndex] = data.Results;
                    }
                } else {
                    item.SkipTime = null;
                }
                if (tryToUploadCachedItems) {
                    _tryToUploadCachedItems();
                }
            }).
            error(function (data, status, headers, config) {
                item.SkipTime = null;
            });
    }

    return {
        data: _data,
        setRouteId: _setRouteId,
        routeStart: _routeStart,
        deliverAndGetNextItem: _deliverAndGetNextItem,
        deliverWithImageAndGetNextItem: _deliverWithImageAndGetNextItem, //HS
        prev: _moveToPrevItem,
        next: _moveToNextItem,
        reorderItem: _reorderItem,
        comment: _comment,
        undeliver: _undeliver,
        setCurrentItem: _setCurrentItem,
        loadRouteComplaints: _loadRouteComplaints, //HS
        setRoutePreparations: _setRoutePreparations, //HS
        skip: _skip, //HS
        isLastItem: _isLastItem, //HS
        commentWithPicture: _commentWithPicture //HS
    }
});
