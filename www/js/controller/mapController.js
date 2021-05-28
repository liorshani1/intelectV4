
myApp.controller('mapController', function ($rootScope, $scope, $timeout, $filter, $state, $timeout, geolocation, districtService) {


    $scope.myMarkers = {};
    $scope.selectedLocation = null;
    $scope.panelOnMap = true;
    var _lastSelectedMarker = null;

    $scope.refresh = function () {
        districtService.refresh();
    }


    $scope.mapOptions = {
        center: new google.maps.LatLng(geolocation.position.lat, geolocation.position.lng),
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        },
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
    };

    $rootScope.myMap = new google.maps.Map(document.getElementById("map"), $scope.mapOptions);



    //$scope.$watch(function () { return locationsService.selectedLocationId; }, function (data) {
    //    selectLocation(locationsService.selectedLocationId, true);
    //}, false);


    $scope.$watch(function () { return districtService.data; }, function (data) {
        hideUnavailableMarkers(data.routes);
        if (data.routes && data.routes.length >= 1) {
            for (var i = 0; i < data.routes.length; i++) {
                if (data.routes[i].LastDeliveryCoordiantes) {
                    var latLng = new google.maps.LatLng(data.routes[i].LastDeliveryCoordiantes.Lat, data.routes[i].LastDeliveryCoordiantes.Lng);
                    $scope.addMarker(latLng, data.routes[i]);
                }
            }
        };
    }, true);



    $scope.mapOptions.center = new google.maps.LatLng(geolocation.position.lat, geolocation.position.lng)

    $timeout(function () {
        $rootScope.myMap.setCenter($scope.mapOptions.center);

        if (geolocation.position.accuracy > 500) {
            $rootScope.myMap.setZoom(10);
        } else {
            $rootScope.myMap.setZoom(14);
        }

    }, 1000, false);







    var showInfoWindow = function (data, marker) {
        document.getElementById('infoPanel').style.display = "block";

        if (data) {
            selectRoute(data.RouteId, data.Part, false);
        }
    }

    $scope.addMarker = function (latlng, data, subject) {

        if (typeof $scope.myMarkers[data.RouteId + "_" + data.Part] === "undefined") {

            var content = getMarkerContent(data, '');// '<div class="marker-bg"><span class="route-status-indication ' + cssClass + '"></span></div>';

            var marker = new RichMarker({
                position: latlng,
                map: $rootScope.myMap,
                draggable: false,
                //content: '<div class="marker-bg"><img src="' + globalParams.contentBaseUrl + '/logo20/' + data.OrganizationId + '.png"/></div>',
                content: content,
                shadow: 'none',
                width: '30px',
                height: '40px',
                routeData: data
            });

            $scope.myMarkers[data.RouteId + "_" + data.Part] = marker;

            google.maps.event.addListener(marker, 'click', function () {
                showInfoWindow(data, marker);
            });

        } else {
            $scope.myMarkers[data.RouteId + "_" + data.Part].setVisible(true).setContent(getMarkerContent(data, "selected"));
        }

    };

    var hideUnavailableMarkers = function (availableRoutes) {
        var routeIds = [];
        for (var i = 0; i < availableRoutes.length; i++) {
            routeIds.push(availableRoutes[i].RouteId)
        }


    };

    var clearMarkers = function () {

        for (var k in $scope.myMarkers) {
            // use hasOwnProperty to filter out keys from the Object.prototype
            if ($scope.myMarkers.hasOwnProperty(k)) {
                $scope.myMarkers[k].setMap(null);
            }
        }
        $scope.myMarkers = {};
        //centralMaps.infoWindow.close();
    };


    var getMarkerContent = function(data, markerClass){

        if (!markerClass) {
            markerClass = "";
        }

        var cssClass;
        if (data.EndTime) {
            cssClass = 'route-green';
        } else {
            cssClass = $filter("fromNowClassName")(data.LastDeliveryTime);
        }
        //var minutesPassed = moment().diff(data.LastDeliveryTime, 'minutes');
        //if (minutesPassed > 20) {
        //    cssClass = "route-red";
        //} else if (minutesPassed > 10) {
        //    cssClass = "route-orange";
        //} else {
        //    cssClass = "route-green";
        //}
        var content = '<div class="marker-bg ' + markerClass + '"><span class="route-status-indication ' + cssClass + '"></span></div>';
        return content;

    }

    var selectRoute = function (routeId, part, enableZoom) {

        if (_lastSelectedMarker && _lastSelectedMarker.routeData.RouteId == routeId && _lastSelectedMarker.routeData.Part == part) {
            return;
        }

        if (_lastSelectedMarker) {
            //_lastSelectedMarker.setContent('<div class="marker-bg"><img src="' + $scope.contentBaseUrl + '/logo20/' + _lastSelectedMarker.routeData.RouteId + '.png"/></div>')
            _lastSelectedMarker.setContent(getMarkerContent(_lastSelectedMarker.routeData, ""));
        }

        if (typeof $scope.myMarkers[routeId + "_" + part] != "undefined") {
            //set map center based on location position
            if (enableZoom) {
                //$scope.myMap.panTo($scope.myMarkers[locationId].getPosition());
                $rootScope.myMap.setZoom(16);
            }

            $scope.routeSelected = $scope.myMarkers[routeId + "_" + part].routeData;
            //$scope.myMarkers[routeId + "_" + part].setContent('<div class="marker-bg selected"><img src="' + $scope.contentBaseUrl + '/logo20/' + $scope.myMarkers[routeId + "_" + part].routeData.RouteId + '.png"/></div>');
            $scope.myMarkers[routeId + "_" + part].setContent(getMarkerContent($scope.routeSelected, "selected"));//'<div class="marker-bg selected"></div>'
            _lastSelectedMarker = $scope.myMarkers[routeId + "_" + part];
            $scope.$apply();
        }
    }


    //$scope.locationSelect = function (location) {

    //    if (location.ServiceCount > 1) {

    //        $rootScope.transitionTo("app.services", { locationId: location.LocationId, serviceTypeId: $scope.serviceTypeId })

    //    }
    //    else {

    //        if (location.HasFIFOService) {
    //            $rootScope.transitionTo("app.service", { serviceId: location.ServiceId });

    //        } else if (location.HasCalendarService) {

    //            $rootScope.transitionTo("app.selectdate", { serviceId: location.ServiceId });
    //        }
    //    }
    //    servicesService.setServicesData(location.LocationId, $scope.serviceTypeId);


    //};

    $scope.reorderRoute = function (distributionId, routeId, part) {
        $state.go('app.routeReorder', { distributionId: distributionId, routeId: routeId, part: part });
    }
});



