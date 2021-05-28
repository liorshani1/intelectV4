myApp.factory('providersService', function ($http, $q, $state, $timeout, $filter, $rootScope, loaderService) {

   
    var _timer;

    /// query strings parameters for ProviderSearch
    var _params = {
        CategoryId: null,
        CountryId: null,
        ViewMode: 0,
        SearchPhrase: "",
        currentPage: 1,
        ResultsInPage: 20,
        position: null,
        countryId: null,
        src: "mvapp"

    };

    // results from ProviderSearch
    var _data = {
        results: [],
        loading: false,
        viewMode: 0,
        moreProviders: true,
        searchPhraseProviders: null,
        organizationId: 0,
        organizationName: null,
        organizationItemDescription: null,
        categories: [],
        
    };

    var _dataProvider = null;

    var _setProvider = function (provider) {
        _dataProvider = provider;
    };
    var _routingNavigation = function (state, stId)
    {
        switch (state)
        {
            case "providers": {

                if (_dataProvider.AvailableServiceTypesCount > 1) {
                    $state.transitionTo("servicetypes", { organizationId: _dataProvider.OrganizationId })
                    return true;
                }
                else if (_dataProvider.AvailableLocationsCount > 1) {
                    $state.transitionTo("location", { organizationId: _dataProvider.OrganizationId, serviceTypeId: stId })
                    return true;
                }
                else
                {
                    $state.transitionTo("app.services", { locationId: _dataProvider.LocationId, serviceTypeId: stId })
                    return true;
                }
                return false;
                
            };
            case "app.servicetypes": {

                if (_dataProvider.AvailableLocationsCount > 1) {
                    $state.transitionTo("location", { organizationId: _dataProvider.OrganizationId, serviceTypeId: stId })
                    return true;
                }
                else {
                    $state.transitionTo("app.services", { locationId: _dataProvider.LocationId, serviceTypeId: stId })
                     return true;
                }
                return false;
               
            };
            //case "app.location": {
                
            //    if (_dataProvider.AvailableServicesCount > 1) {
            //        $state.transitionTo("app.services", { locationId: _dataProvider.LocationId, serviceTypeId: stId })
            //      
            //    }
            //    break;
               
            //};
        }
    }

    var _selectedProviderData = {
        provider: null
    }

    var _setFavoritesOnly = function (favoritesOnly) {
        _params.ViewMode = favoritesOnly;
        _data.viewMode = favoritesOnly;
        _getResults(true);
    }

    //var _getSelectedCategoryName = function () {
    //    if (_data.categories && _data.categories.length) {
    //        var r = $.grep(_data.categories, function (e) { return e.OrganizationCategoryId === _params.CategoryId; });
    //        if (r && r.length) {
    //            return r[0].OrganizationCategoryName;
    //        } else {
    //            //return $filter('i18n')("AllCategories");
    //        }
    //    } else {
    //        //return $filter('i18n')("AllCategories");
    //    }

    //}

    var _setCategory = function (categoryId, categoryName) {
        _params.CategoryId = categoryId;
        _getResults(true);
    }

    var _setCountryId = function (countryId) {
        _params.CountryId = countryId;
    }

    var _loadMoreProviders = function () {
        _params.currentPage += 1;
        _getResults(false);
    }
    var _setProviderData = function (organizationId, organizationName, organizationItemDescription) {
        _data.organizationId = organizationId;
        _data.organizationName = organizationName;
        _data.organizationItemDescription = organizationItemDescription;

    };


    //update the search phrase used for ProviderSearch and call _getResults after 0.5 second idle time
    var _updateSearchPhrase = function (value) {
        if (_params.SearchPhrase != value) {
            _params.SearchPhrase = value;

            if (_timer) {
                $timeout.cancel(_timer);
            }

            _timer = $timeout(function () {
                _data.searchPhraseProviders = value;
                _getResults(true);
            }, 400);
        }
    }


    //get the categories from the server and update data.categories
    //var _getCategories = function () {
    //    var deferred = $q.defer();
    //    var _catParams = {
    //        CountryId: _params.CountryId,
    //    };
    //    _data.loading = true;
    //    $http.jsonp(globalParams.baseUrl + '/ProviderGetCategories?callback=JSON_CALLBACK', { params: _catParams }).
    //        success(function (data, status, headers, config) {
    //            if (data.Success) {
    //                _data.categories = data.Results;
    //                _data.categories.unshift({ "OrganizationCategoryName": $filter('i18n')("AllCategories"), "OrganizationCategoryId": 0 });
    //                deferred.resolve(data);
    //            } else {
    //                _data.categories = [];
    //                deferred.reject();
    //            }
    //            _data.loading = false;

    //        }).
    //        error(function (data, status, headers, config) {
    //            _data.categories = [];
    //            deferred.reject();
    //            _data.loading = false;

    //        });
    //    return deferred.promise;
    //};


    //get the results from the server and update _data
    var _getResults = function (resetList) {
        var deferred = $q.defer();

        if (resetList) {
            _data.results = [];
            _params.currentPage = 1;
            _data.moreProviders = true;
        }



        loaderService.show();
        $http.jsonp(globalParams.baseUrl + '/ProviderSearch?callback=JSON_CALLBACK', { params: _params }).
            success(function (data, status, headers, config) {
                if (data.Success) {
                    if (resetList) {
                        _data.results = [];
                        _params.currentPage = 1;
                        _data.moreProviders = true;
                    }
                    _data.results = _data.results.concat(data.Results);
                    if (data.Results.length < _params.ResultsInPage) {
                        _data.moreProviders = false;
                    }

                    //_data.organizationId = data.Results[0].OrganizationId;
                    //_data.organizationName = data.Results[0].OrganizationName;
                    //_data.organizationItemDescription = data.Results[0].ItemDescription;
                    loaderService.hide();
                    deferred.resolve(data);
                } else {
                    _data.results = [];
                    loaderService.hide();
                    deferred.reject();
                }
              

            }).
            error(function (data, status, headers, config) {
                _data.results = [];
                loaderService.hide();
                deferred.reject();
                

            });
        return deferred.promise;

    };



    //exposed objects
    return {
        data: _data,
        params: _params,
        selectedProviderData: _selectedProviderData,
        //getCategories: _getCategories,
        getResults: _getResults,
        loadMoreProviders: _loadMoreProviders,
        updateSearchPhrase: _updateSearchPhrase,
        setFavoritesOnly: _setFavoritesOnly,
        setProviderData: _setProviderData,
        //setCategory: _setCategory,
        setCountryId: _setCountryId,
        routingNavigation: _routingNavigation,
        setProvider: _setProvider
        //getSelectedCategoryName: _getSelectedCategoryName
    }
});

