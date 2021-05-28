'use strict';

/* Filters */

angular.module('myApp.filters', [])
    .filter('distance', function ($filter) {
        return function (distance) {
            distance = distance / 1000;
            var units = $filter('i18n')("km");// "km";// res.Units.km;
            return distance.toFixed(1) + " " + units + $filter('i18n')("away"); //res.Units.away;
        };
    }).filter('waitingTimeList', function ($filter) {
        return function (seconds) {
            var val, unit;
            if (seconds == null) {
                val = "N/A";
                unit = "";
            } else if (seconds < 60) {
                val = seconds;
                unit = $filter('i18n')("sec"); //"sec";
            } else if (seconds < 3600) {
                val = parseInt(seconds / 60);
                unit = $filter('i18n')("min"); //"min";//res.Units.min;
            } else if (seconds < 3600) {
                val = parseInt(seconds / 60);
                unit = $filter('i18n')("min");//res.Units.min;
            } else {
                val = parseInt(seconds / 3600);
                unit = $filter('i18n')("hr");//"hr";//res.Units.hr;
            }
            
            return '<span class="wtValue">' + val + '</span><span class="wtUnits">' + unit + '</span>'
        };
    }).filter('waitingTimeBigBox', function ($filter) {
        return function (seconds) {
            var duration = moment.duration(seconds * 1000);
            var h, m;
            h = duration.hours();
            m = duration.minutes();

            if (h < 10) { h = "0" + h; }
            if (m < 10) { m = "0" + m; }


            var htmlString = '<div  class="waitingTime waitingTimeBig"><div class="timeRow"><span class="wtValue" id="location_wt_hr">';
            htmlString += h;
            htmlString += '</span><span class="wtUnits">' + $filter('i18n')("hr") + '</span></div><div class="timeRow"><span class="wtValue" id="location_wt_min">';
            htmlString += m;
            htmlString += '</span><span class="wtUnits">' + $filter('i18n')("min") + '</span></div></div>';

            return htmlString;
        };
    }).filter('monthDay', function () {
        return function (date) {
            return moment(date).format("MMM D");
        };
    }).filter('dayOfWeek', function () {
        return function (date) {
            return moment(date).format("ddd");
        };
    }).filter('time', function () {
        return function (time) {
            return moment().hours(0).minutes(time).format("LT");
        };
    }).filter('referenceDate', function () {
        return function (date) {
            var d = moment(date).format("ddd, LL");
            return d;
        };
    }).filter('fromNow', function () {
        return function (date) {
            var d = moment(date).fromNow();
            return d;
        };
    }).filter('fromNowClassName', function () {
        return function (date) {
            var cssClass;
            var minutesPassed = moment().diff(date, 'minutes');
            if (minutesPassed > 20) {
                cssClass = "route-red";
            } else if (minutesPassed > 10) {
                cssClass = "route-orange";
            } else {
                cssClass = "route-green";
            }

            return cssClass;
        };
    }).filter('shortDate', function () {
        return function (date) {
            var d = moment(date).format("L");
            return d;
        };
    }).filter('referenceTime', function () {
        return function (date) {
            if (date == null) return "";
            var d = moment(date).format("LT");
            return d;
        };
    }).filter('expectedArrivalTime', function () {
        return function (date, minutes) {
            return moment(date).add('minutes', minutes["visitData.ReferenceDate"]).format("LT");
        };
    }).filter('dateFormat', function () {
        return function (date) {
            return moment(date).format("YYYY-MM-DD");
        };
    }).filter('formatWaitTimeTitle', function ($filter) {
        return function (seconds) {
            var duration = moment.duration(seconds * 1000);
            return ((duration.hours() > 0) ? duration.hours() + " " + $filter('i18n')("hr") + " " : "") + duration.minutes() + " " + $filter('i18n')("min");
        };
    }).filter('hour', function ($filter) {
        return function (time) {
            return (moment().hours(0).minutes(time).format("H:mm"));
        };
    }).filter('ampm', function ($filter) {
        return function (time) {
            
            return (moment().hours(0).minutes(time).format("A"));
        };
    }).filter('navigationAddress', function ($filter) {
        return function (item) {

            return encodeURIComponent(item.StreetNumber + " " + item.StreetName + " " + item.City);
        };
    });



//angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
//    return function (exception, cause) {
//        exception.message += ' (caused by "' + cause + '")';
//        exception.message += 'exception: ' + exception;
//        alert(exception.message);
        
//    };
//});

var _getMonthDayFormat = function (date) {
    return moment(date).format("MMM D");
};
var _getDayFormat = function (date) {
    return moment(date).format("ddd");
};