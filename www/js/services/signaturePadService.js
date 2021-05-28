
myApp.factory('signaturePadService', function () {

    var _data = {
        signature: null
    }


    var _getSignature = function () {
      return _data.signature;
    };

    var _setSignature = function (signature) {
      _data.signature = signature;
    };

    var _clearSignature = function () {
       _data.signature = null;
    };


    return {
      getSignature: _getSignature,
      clearSignature: _clearSignature,
      setSignature: _setSignature
    }
});

