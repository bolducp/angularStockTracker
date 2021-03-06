'use strict';

var app = angular.module('stockTracker', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', { url: '/', templateUrl: './partials/home.html' })  // give it a name and a configuration object that contains a url, a template
    .state('listStocks', { url: '/listStocks', templateUrl: './partials/listStocks.html', controller: 'listCtrl' })  // give it a name and a configuration object that contains a url, a template
    .state('addStock', { url: '/addStock', templateUrl: './partials/addStock.html', controller: 'addCtrl' })  // give it a name and a configuration object that contains a url, a template

  $urlRouterProvider.otherwise('/'); // gives a default view
});

app.controller('listCtrl', function($scope, $state, Stocks){
  $scope.stocks = Stocks.stocks;

  $scope.delete = function(symbolToDelete){
    Stocks.deleteStock(symbolToDelete);
  };
});

app.controller('addCtrl', function($scope, $state, Stocks){
  $scope.symbol = " ";
  $scope.search = " ";

  $scope.add = function(){
    Stocks.addStock($scope.symbol);
    $scope.reset();
  };

  $scope.reset = function(){
    $scope.symbol = " ";
  };

  $scope.lookUp = function(){
    var promise = Stocks.lookUp($scope.search);
    promise.then(function(res){
      $scope.searchResults = res.data;
      $scope.showTable = true;
    }, function(res){
      swal("error: " + res);
      });

    $scope.search = " ";
  };
});

app.service('Stocks', function($http, $q){
  if (!this.stockSymbols){
    this.stocks = [];
  };
  var thisService = this;

  this.addStock = function(stockSymbol){
    var promise = $http.jsonp(`http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=${stockSymbol}&jsoncallback=JSON_CALLBACK`);
    promise.then(function(res){
      if (res.data.Message){
        return swal("Sorry. No such stock.");
      }
      else if (thisService.stocks.findIndex(function(stock){ return stock.Symbol === res.data.Symbol }) !== -1){
        return swal(`You are already tracking ${res.data.Name}.`);
      }
      thisService.stocks.push(res.data);
      swal(res.data.Symbol + " added.");
    }, function(res){
      swal("error: " + res);
      });
    };

  this.lookUp = function(stockName){
    return $http.jsonp(`http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp?input=${stockName}&jsoncallback=JSON_CALLBACK`);
  };

  this.deleteStock = function(stockSymbol){
    if (thisService.stocks.findIndex(function(stock){ return stock.Symbol === stockSymbol }) === -1){
      return  swal(`You are not tracking ${stockSymbol}.`);
    }
    var index = thisService.stocks.findIndex(function(stock){ return stock.Symbol === stockSymbol });
    thisService.stocks.splice(index, 1);
  };

});
