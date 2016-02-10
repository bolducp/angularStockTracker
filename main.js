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
      alert("error: " + res);
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
      thisService.stocks.push(res);
      alert("Stock added");
    }, function(res){
      alert("error: " + res);
      });
    };

  this.lookUp = function(stockName){
    return $http.jsonp(`http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp?input=${stockName}&jsoncallback=JSON_CALLBACK`);
  };
});
