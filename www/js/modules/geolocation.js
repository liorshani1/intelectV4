angular.module('myApp.geolocation', [])
    // geolocation service responsible for retrieving the current position of the user

    .factory('geolocation', ['$http', '$rootScope', '$window', '$filter', '$interval', '$timeout', function ($http, $rootScope, $window, $filter, $interval, $timeout) {

        var geolocation = {
            position: {
                lat: 32.0688116,
                lng: 34.777033500,
                accuracy: 9999
            },
            positionAvailable: null,

            loadingPosition: false,

            setLoadingState: function (state) {
                $timeout(function () {
                    geolocation.loadingPosition = state;
                }, 0)
            },

            stringifiedPosition: function () {
                return JSON.stringify(geolocation.position);
            },


            initGeolocation: function () {

                var positionSuccess = function (position) {
                    geolocation.setLoadingState(false);
                    geolocation.position.lat = position.coords.latitude;
                    geolocation.position.lng = position.coords.longitude;
                    geolocation.position.accuracy = position.coords.accuracy;
                    geolocation.positionAvailable = true;
                };

                var positionError = function (error) {
                    //console.log('positionError: ' + error.code + ' : ' + error.message);
                    geolocation.setLoadingState(false);
                    geolocation.position.lat = null;
                    geolocation.position.lng = null;
                    geolocation.position.accuracy = 9999;
                    geolocation.positionAvailable = false;
                };

                var getPosition = function () {

                    if (navigator.geolocation) {
                        geolocation.setLoadingState(true);
                        //navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { timeout: 9000, enableHighAccuracy: true });
                        //HS - increased timeout to avoid timeout expired error
                        navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { timeout: 90000, enableHighAccuracy: true });
                    }
                };



                var positionWatch = $interval(getPosition, 10000);
                getPosition();

            }
        };

        // force the load of the resource file
        geolocation.initGeolocation();

        // return the local instance when called
        return geolocation;
    }])






