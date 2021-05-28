myApp.factory('loaderService', function ($rootScope, $ionicLoading) {
    return {
        show : function() {

          $rootScope.loading = $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>',
            //template: '<i class="icon ion-load-c ion-spin" style="font-size:60px"></i>',
                animation: 'fade-in',
                showBackdrop: true,
                minWidth: 200,
                showDelay: 0
            });
        },

        hide: function () {
            $ionicLoading.hide();
        }
    }
});
