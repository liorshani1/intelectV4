myApp.controller('signaturePadController', function ($scope, $location, $stateParams, $rootScope, $state, $filter, $timeout, $ionicPopup, localize, deliveryItemService, loaderService, $cordovaCamera, $cordovaBarcodeScanner, signaturePadService) {
  
  $timeout(function () {
    var canvas = document.getElementById('signatureCanvas');
    var popup = document.getElementById('signatureCanvasPopup')
    canvas.width = popup.offsetWidth - 10;

    $scope.signaturePad = new SignaturePad(canvas, {
      backgroundColor: "rgb(255,255,255)",
      penColor: "rgb(66, 133, 244)"
    });

    
    $scope.signature = signaturePadService.getSignature();

  },0);
  
  

  

  $scope.clearCanvas = function () {
    $scope.signaturePad.clear();
  }

  $scope.saveCanvas = function () {
    var sigImg = $scope.signaturePad.toDataURL("image/jpeg");
    signaturePadService.setSignature(sigImg);
    $scope.signature = sigImg;
  }


})



