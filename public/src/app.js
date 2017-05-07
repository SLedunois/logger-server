const angular = require('angular');
const Io = require('socket.io-client');

var app = angular.module('logger', [])
  .controller('loggerCtrl', ['$scope', '$sce', function ($scope, $sce) {
    $scope.files = [];
    var socket = Io();

    socket.on('config:getConfiguration', function () {
      socket.emit('config:configuration', {
        type: 'CLIENT'
      });
    });

    socket.on('client:files', function (files) {
      $scope.files = files;
      $scope.$apply();
    });
  }]);
