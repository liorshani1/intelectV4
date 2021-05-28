myApp.factory('unitFormatService', function ($http, $q, $timeout, $filter, $state, $rootScope) {


    var _formatDistance = function (distance) {

        //distance = parseInt(distance);

        distance = distance / 1000;
        units = $filter('i18n')("km");


        return distance.toFixed(1) + " " + units;

    };

    var _formatWaitTimeList = function (seconds) {
        var val, units;
        if (seconds == null) {
            val = "N/A";
            unit = "";
        } else if (seconds < 60) {
            val = seconds;
            unit = $filter('i18n')("sec");
        } else if (seconds < 3600) {
            val = parseInt(seconds / 60);
            unit = $filter('i18n')("min");
        } else if (seconds < 3600) {
            val = parseInt(seconds / 60);
            unit = $filter('i18n')("min");
        } else {
            val = parseInt(seconds / 3600);
            unit = $filter('i18n')("hr");
        }

        return val + ' ' + unit;

        //return moment.duration(seconds, 's').humanize(false);
    };

    var _formatWaitTimeTitle = function (seconds) {
        var duration = moment.duration(seconds * 1000);
        return duration.hours() + res.Units.hr + " " + duration.minutes() + res.Units.min;

    };

    var _formatWaitTimeTitleSaperated=function(seconds) {
        var duration = moment.duration(seconds * 1000);
        return duration.hours() + res.Units.hrLng + "<br/>" + duration.minutes() + res.Units.minLng;

    }

    var  _formatWaitTimeBigBox=function(seconds) {
        var duration = moment.duration(seconds * 1000);
        var h, m;
        h = duration.hours();
        m = duration.minutes();

        if (h < 10) { h = "0" + h; }
        if (m < 10) { m = "0" + m; }


        var htmlString = '<div  class="waitingTime waitingTimeBig"><div class="timeRow"><span class="wtValue" id="location_wt_hr">';



        htmlString += h;
        htmlString += '</span><span class="wtUnits">' + res.Units.hr + '</span></div><div class="timeRow"><span class="wtValue" id="location_wt_min">';
        htmlString += m;
        htmlString += '</span><span class="wtUnits">' + res.Units.min + '</span></div></div>';

        return htmlString;
    }


    var _formatAddress = function (address1, address2, city) {

        return (address1 ? address1 + ", " : "") + (address2 ? address2 + ", " : "") + (city ? city : "")
    };



    return {

        formatDistance: _formatDistance,
        formatWaitTimeList: _formatWaitTimeList,
        formatWaitTimeTitle: _formatWaitTimeTitle,
        formatWaitTimeTitleSaperated: _formatWaitTimeTitleSaperated,
        formatWaitTimeBigBox: _formatWaitTimeBigBox,
        formatAddress: _formatAddress,
       
    }
});