myApp.directive('autoFocus', function ($timeout) {
    return {
        link: {
            pre: function preLink(scope, element, attr) {
                $timeout(function () {
                    element[0].focus();
                },100);
                console.debug('prelink called');
                // this fails since the element hasn't rendered
                //element[0].focus();
            },
            post: function postLink(scope, element, attr) {
                console.debug('postlink called');
                // this succeeds since the element has been rendered
                element[0].focus();
            }
        }
    }
});