const angular = require('angular');
const Io = require('socket.io-client');
const _ = require('lodash');

var app = angular.module('logger', [])
  .controller('loggerCtrl', ['$scope', '$sce', function ($scope, $sce) {
    $scope.files = [];
    var socket = Io();

    $scope.selectedFiles = {};
    $scope.activeFile = {};

    socket.on('config:getConfiguration', function () {
      socket.emit('config:configuration', {
        type: 'CLIENT'
      });
    });

    socket.on('client:files', function (files) {
      _.map(files, function (file) {
         file.content = '';
         return file.htmlContent = '';
      });
      $scope.files = files;
      $scope.$apply();
    });

    $scope.someSelectedFiles = function () {
      return Object.keys($scope.selectedFiles).length > 0;
    };

    $scope.removeFileWatcher = function (fileId) {
      delete $scope.selectedFiles[fileId];
      if ($scope.someSelectedFiles()) {
        $scope.activeFile.id = Object.keys($scope.selectedFiles)[0];
      }
    };

    $scope.watchFile = function (file) {
      if (!$scope.selectedFiles.hasOwnProperty(file._id)) {
        file.content = '';
        file.htmlContent = '';
        $scope.selectedFiles[file._id] = file;
        $scope.activeFile.id = file._id;
        socket.emit('client:getFileContent', file._id);
      } else {
        $scope.activeFile.id = file._id;
      }
    };

    var checkIfStackError = function (content) {
      var regex = /^\s*at\s/;
      return content.indexOf('Error') !== -1 || regex.test(content);
    };

    var formatLogs = function (content, isTail) {
      var newContent = (isTail && checkIfStackError(content)) ? '<div class="tail error">' :'<div>';
      newContent += content.replace(/\n/g, '<br />') + '</div>';
      return newContent;
    };

    var addContent = function (data, isTail) {
      if ($scope.selectedFiles.hasOwnProperty(data._id)) {
        $scope.selectedFiles[data._id].content += formatLogs(data.content, isTail);
        $scope.selectedFiles[data._id].htmlContent = $sce.trustAsHtml($scope.selectedFiles[data._id].content);
        $scope.$apply();
      }
    };

    socket.on('client:fileContent', function (data) {
      addContent(data, false);
    });

    socket.on('client:newLine', function (data) {
      addContent(data, true);
    });

  }]);
