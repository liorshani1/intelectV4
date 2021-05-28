myApp.controller('deliveryItemController', function ($scope, $location, $stateParams, $rootScope, $state, $filter, $timeout, $ionicPopup, localize, deliveryItemService, loaderService, $cordovaCamera, $cordovaBarcodeScanner, signaturePadService) {
  $scope.item = null;

  $scope.barcode = null;


  $scope.bc = {
    format: 'CODE128',
    lineColor: '#000000',
    width: 3,
    height: 100,
    displayValue: true,
    fontOptions: '',
    font: 'monospace',
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 2,
    fontSize: 20,
    background: '#ffffff',
    margin: 0,
    marginTop: undefined,
    marginBottom: undefined,
    marginLeft: undefined,
    marginRight: undefined,
    valid: function (valid) {
    }
  }


  if ($stateParams.barcode == null && $stateParams.itemId == null) {
    return;
  }

  $scope.showRouteDetails = false;
  signaturePadService.clearSignature();
  
  $scope.showSignaturePad = function () {


    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/signaturePad.html',
      cssClass: 'full-size',
      title: 'חתימת המקבל',
      scope: $scope,
      buttons: [
        { text: $filter('i18n')("cancel") },
        {
          text: $filter('i18n')("continue"),
          type: 'button-positive',
          onTap: function (e) {
            if (signaturePadService.getSignature() == null) {
              alert('חובה לחתום');
              e.preventDefault();
            } else {
              confirmCommentPicture();
            }
          }
        }
      ]
    });

  };

  
  $scope.showBarcode = function () {


      var myPopup = $ionicPopup.show({
        templateUrl: 'templates/deliveryItemShowBarcode.html',
        cssClass: 'full-size',
        title: $filter('i18n')("showBarcode"),
        scope: $scope,
        buttons: [
          { text: 'סגור' }
        ]
      });



  };

  $scope.toggleRouteDetails = function () {
    $scope.showRouteDetails = !$scope.showRouteDetails;
  };


  var getDeliveryItemByCode = function () {
    deliveryItemService.getByCode($scope.barcode).then(
      function (data) {
                                                       
       //HS [2018-apr-26] - Task # 6 - Add New barcode (Return Barcode) After Scan - Open Popup on not find barcode in database
       if(data)
       {
       $scope.item = data;
       prepareItemForDisplay();
       
       $scope.transitions = null;
       $scope.itemId = $scope.item.DeliveryItemId;
       $scope.$broadcast('scroll.refreshComplete');
       
       deliveryItemService.getAvaliableTransitions($scope.item.DeliveryItemId).then(
        function (data) {
        $scope.transitions = data;
        },
        function () {
        $scope.item = null;
        $scope.transitions = null;
        
        })
       }
       else
       {
         // Custom popup
    var myPopup = $ionicPopup.show({
      // HS [2018-may-11] - Change title text and template position right as per suggested oded on skype. 
      title: 'החבילה לא נמצאה.',
      template: '<p align="right">האם זו חבילה חוזרת?</p>',
      scope: $scope,
      buttons: [
                { text: $filter('i18n')("cancel")}, {
                text: '<b>' + $filter('i18n')("save") + '</b>',
                type: 'button-positive',
                onTap: function(e) {
                  deliveryItemService.SaveNewBarcode($scope.item.DeliveryItemCode,$scope.barcode).then(function (data) {
                    if(data){
                    console.log("Data",data);                                         
                    $scope.barcode=$scope.item.DeliveryItemCode;
                    alert("הוסף בהצלחה חבילה חדשה");
                    getDeliveryItemByCode();
                    $scope.barcode=null;
                    }
                   else
                   {
                   console.log("Error In Save New barcode funtion");
                   }
                   },function () {
                            //$scope.item = null;
                    console.log("Error In Save New barcode funtion");
                   });
                }
                }
                ]
      })
      
  }
})

}



  var prepareItemForDisplay = function () {
    $scope.item.ScheduledDeliveryDateDisplay = ($scope.item.ScheduledDeliveryDate ? moment($scope.item.ScheduledDeliveryDate).format("L LT") : "");
    //$scope.item.DeliveryItemCode = "INT123456789"
  }



  var getDeliveryItemById = function () {

    deliveryItemService.getById($scope.itemId).then(
      function (data) {
        $scope.item = data;
        prepareItemForDisplay();
        
        $scope.transitions = null;
        $scope.$broadcast('scroll.refreshComplete');

        deliveryItemService.getAvaliableTransitions($scope.item.DeliveryItemId).then(
          function (data) {
            $scope.transitions = data;
          },
          function () {
            $scope.item = null;
            $scope.transitions = null;

          })
      },
      function () {
        $scope.item = null;
        $scope.transitions = null;

      })
  }

  if ($stateParams.barcode) {
    $scope.barcode = $stateParams.barcode;
    getDeliveryItemByCode();
  } else {
    if ($stateParams.itemId) {
      $scope.itemId = $stateParams.itemId;
      getDeliveryItemById();
    }
  }

  $scope.doRefresh = function () {
    getDeliveryItemById();
  };


  $scope.scanBarcodeMock = function () {
    $scope.barcode = "INT54206";
    getDeliveryItemByCode();
  }

  $scope.scanBarcode = function () {

    $cordovaBarcodeScanner
      .scan()
      .then(function (barcodeData) {
        console.log(barcodeData);
        if (!barcodeData.cancelled) {
          $scope.barcode = barcodeData.text;
          getDeliveryItemByCode();
        }
      }, function (error) {
        alert("Scanning failed: " + error);
      });

  }

  //HS [2018-may-11] - Delivery Item Page - Added scan lable for type barcode to scan function - add click function
  $scope.scanBarcodeByType = function () {
    $scope.data = {}
                 
    // Custom popup
    var myPopup = $ionicPopup.show({
            template: '<input type = "text" ng-model = "data.model">',
            title: 'הקלדת ברקוד לסריקה',
            //subTitle: 'Subtitle',
            scope: $scope,
            
            buttons: [
                      { text: $filter('i18n')("cancel")}, {
                      text: '<b>' + $filter('i18n')("save") + '</b>',
                      type: 'button-positive',
                      onTap: function(e) {
                      if (!$scope.data.model) {
                      //don't allow the user to close unless he enters model...
                      e.preventDefault();
                      } else {
                        $scope.barcode = $scope.data.model;
                        getDeliveryItemByCode();
                      }
                      }
                      }
                      ]
            });

myPopup.then(function(res) {
console.log('Tapped!', res);
});
};


  $scope.selectReason = function (reason) {

    $scope.selectedReason = reason;
    //if (reason.NotesRequired) {
    //  myoptions.container.find('.txtNotes').addClass('required');
    //}
    //else {
    //  myoptions.container.find('.txtNotes').removeClass('required');
    //}
  }

  $scope.selectTransition = function (transition) {

    $scope.selectedTransition = transition;
    $scope.selectedReason = null;

    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/deliveryItemTransition.html',
      cssClass: 'full-size',
      title: $scope.selectedTransition.Action,
      scope: $scope,
      buttons: [
        { text: $filter('i18n')("cancel") },
        {
          text: '<b>' + $filter('i18n')("continue") + '</b>',
          type: 'button-positive',
          onTap: function (e) {
            if ($scope.selectedTransition.ChangeItemStateTo == 4) { //delivered
              $scope.showSignaturePad();
              


            } else {
              if (!applyTransition()) {
                e.preventDefault();
              };

            }


          }
        }
      ]
    });



  }

  $scope.acceptDeliveryPopup = function (transition) {


    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/deliveryItemAcceptDelivery.html',
      cssClass: 'full-size',
      title: $filter('i18n')("acceptDelivery"),
      scope: $scope,
      buttons: [
        { text: $filter('i18n')("cancel") },
        {
          text: $filter('i18n')("acceptDelivery") ,
          type: 'button-positive',
          onTap: function (e) {
            acceptDelivery()

          }
        }
      ]
    });



  }


  var scheduleDelivery = function () {


    var deliveryItemId, scheduledDeliveryDate, notes;

    deliveryItemId = $scope.item.DeliveryItemId;
    notes = $scope.scheduledDate.notes;

    if ($scope.scheduledDate.date == null || $scope.scheduledDate.time == null) {
      alert($filter('i18n')("dateOrTimeIsMissing"));
      return;
    }

    scheduledDeliveryDate = moment(moment().add($scope.scheduledDate.date,'d').format('YYYY-MM-DD') + " " + $scope.scheduledDate.time).format('YYYY-MM-DD HH:mm')

    deliveryItemService.scheduleDelivery(deliveryItemId, scheduledDeliveryDate, notes).then(
      function (data) {
        $scope.item = data;
        prepareItemForDisplay();

        $scope.transitions = null;
        $scope.selectedTransition = null;
        $scope.selectedReason = null;
        $scope.notes = null;

        deliveryItemService.getAvaliableTransitions($scope.item.DeliveryItemId).then(
          function (data) {
            $scope.transitions = data;
          },
          function (data) {
            alert(data);

          })
      },
      function (data) {
        alert(data);

      })
    return true;


  }


  $scope.refreshScheduledTime = function () {
    if ($scope.scheduledDate.minute == 60) { $scope.scheduledDate.minute = 0 };
    $scope.scheduledDate.time = moment('2012-02-02 00:00').add($scope.scheduledDate.hour, 'h').add($scope.scheduledDate.minute, 'm').format('HH:mm');
  }

  $scope.ScheduleDeliveryPopup = function (item) {

    $scope.scheduledDate = {
      date: null,
      time: null,
      notes: null,
      hour: moment().format('HH'),
      minute: 0
    }

    $scope.refreshScheduledTime();

    var idate = moment();
    $scope.scheduledDate.availableDate = []
    var idisplay;
    for (var i = 0; i < 7; i++) {
      idisplay = idate.format('DD/MM/YYYY');
      if (i == 0) {
        idisplay += " - " + $filter('i18n')("today");
      } else if(i == 1) {
        idisplay += " - " + $filter('i18n')("tommorow");
      } 


      $scope.scheduledDate.availableDate.push({
        value: i,
        display: idisplay
      })

      idate.add(1, 'd');
    }
    

    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/deliveryItemScheduleDelivery.html',
      cssClass: 'full-size',
      title: $filter('i18n')("ScheduleDelivery"),
      scope: $scope,
      buttons: [
        { text: $filter('i18n')("cancel") },
        {
          text: '<b>' + $filter('i18n')("save") + '</b>',
          type: 'button-positive',
          onTap: function (e) {
            if (!scheduleDelivery()) {
              e.preventDefault();
            };



          }
        }
      ]
    });



  }


  //HS [2016-nov-3] - Show confirm popup to take picture with comment
  function confirmCommentPicture(comment) {

    var confirmPopup = $ionicPopup.show({
      title: $filter('i18n')("photographerComment"),
      template: '<div>' + $filter('i18n')("photographerCommentConfirmText") + '</div>',
      scope: $scope,
      buttons: [
        {
          text: $filter('i18n')("no")
        },
        {
          text: $filter('i18n')("yes"),
          type: 'button-positive margin-right-5',
          onTap: function (e) {
            return 'yes';
          }
        }
      ]
    });
    confirmPopup.then(function (res) {
      if (res) {
        //alert('show camera: ' + comment);
        takeCommentPicture(comment);
      }
      else {
        applyTransition();
      }
    });


  }


  function takeCommentPicture(comment) {

    var options = {
      quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 600,
      targetHeight: 600,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };

    $cordovaCamera.getPicture(options).then(function (imageData) {
      $scope.commentImgURI = "data:image/jpeg;base64," + imageData;

      var confirmPopup = $ionicPopup.show({
        title: $filter('i18n')("delivered"),
        cssClass: 'full-size',

        template: '<div class="list card"><div class="item item-image"><img ng-src="' + $scope.commentImgURI + '"></div></div>',
        scope: $scope,
        buttons: [
          {
            text: $filter('i18n')("cancel")
          },
          {
            text: $filter('i18n')("retakepicture"),
            type: 'button-positive',
            onTap: function (e) {
              return 'retakepicture';
            }
          },
          {
            text: $filter('i18n')("continue"),
            type: 'button-positive margin-right-5',
            onTap: function (e) {
              if ($scope.commentImgURI == 'http://placehold.it/300x300') {
                //don't allow the user to close unless user takes picture
                e.preventDefault();
              } else {
                return $scope.commentImgURI;
              }
            }
          }
        ]
      });
      confirmPopup.then(function (res) {
        if (res) {
          if (res == 'retakepicture') {
            takeCommentPicture(comment);
          }
          else {
            applyTransition();

          }
        }
        else {
          applyTransition();
        }
      });

    }, function (err) {
      // error
      alert(err);
      console.log(err);
    });

  }




  $scope.closeTransition = function (myoptions) {

    $scope.selectedTransition = null;
    $scope.selectedReason = null;

  }

  var applyTransition = function () {

    if (!$scope.selectedTransition) {
      return false;
    }

    if ($scope.selectedTransition.Reasons.length) {
      if (!$scope.selectedReason) {
        alert("עליך לבחור סיבה");
        return false;

      } else {
        if ($scope.selectedReason.NotesRequired) {
          if (!$scope.selectedTransition.notes || !$scope.selectedTransition.notes.length) {
            alert("הערות הוא שדה חובה");
            return false;
          }
        }
      }
    }


    var deliveryItemId, transitionId, deliveryReasonId, notes, deliveredToName, imageData, signatureData;

    deliveryItemId = $scope.item.DeliveryItemId;
    transitionId = $scope.selectedTransition.DeliveryTypeStatusTransitionId;
    deliveryReasonId = $scope.selectedReason && $scope.selectedReason.DeliveryReasonId;
    notes = $scope.selectedTransition.notes;
    deliveredToName = $scope.selectedTransition.deliveredToName;
    imageData = $scope.commentImgURI;
    signatureData = signaturePadService.getSignature();

    deliveryItemService.applyTransition(deliveryItemId, transitionId, deliveryReasonId, notes, deliveredToName, imageData, signatureData).then(
      function (data) {
        $scope.item = data;
        prepareItemForDisplay();

        $scope.transitions = null;
        $scope.selectedTransition = null;
        $scope.selectedReason = null;
        $scope.notes = null;

        deliveryItemService.getAvaliableTransitions($scope.item.DeliveryItemId).then(
          function (data) {
            $scope.transitions = data;
          },
          function (data) {
            alert(data);

          })
      },
      function (data) {
        alert(data);

      })
    return true;


  }


  var acceptDelivery = function () {



    deliveryItemService.acceptDelivery($scope.item.DeliveryItemCode).then(
      function (data) {
        $scope.item = data;
        prepareItemForDisplay();

        $scope.transitions = null;
        $scope.selectedTransition = null;
        $scope.selectedReason = null;
        $scope.notes = null;

        deliveryItemService.getAvaliableTransitions($scope.item.DeliveryItemId).then(
          function (data) {
            $scope.transitions = data;
          },
          function (data) {
            alert(data);

          })
      },
      function (data) {
        alert(data);

      })
    return true;


  }

})



