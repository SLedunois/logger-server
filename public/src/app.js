const angular = require('angular');
const ngSticky = require('ngSticky');
const Io = require('socket.io-client');
const _ = require('lodash');

var app = angular.module('logger', ['sticky'])
  .controller('loggerCtrl', ['$scope', '$sce', function ($scope, $sce) {
    $scope.files = [];
    var socket = Io();

    $scope.selectedFiles = {};
    $scope.activeFile = {};
    $scope.notifications = [];

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

    $scope.addNotification = function (type, files) {
      var notification = {
        type: type,
        files: files,
        show: true
      };
      $scope.notifications.push(notification);
      setTimeout(function () {
        notification.show = false;
        $scope.safeApply();
      }, 10000)
    };

    $scope.dismissNotification = function (notification) {
      notification.show = false;
      $scope.safeApply();
    };

    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase === '$apply' || phase === '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };

    var checkIfStackError = function (content) {
      return content.indexOf('Error') !== -1
        || /^\s*at\s/.test(content)
        || content.indexOf('Exception') !== -1;
    };

    var formatLogs = function (content) {
      var _c = content.split('\n');
      var newContent = '';
      for (var i = 0; i < _c.length; i++) {
        newContent += checkIfStackError(_c[i]) ? '<div class="tail error">' : '<div class="tail">';
        newContent += _c[i] + '</div>';
      }
      return newContent;
    };

    var addContent = function (data) {
      if ($scope.selectedFiles.hasOwnProperty(data._id)) {
        $scope.selectedFiles[data._id].content += formatLogs(data.content);
        $scope.selectedFiles[data._id].htmlContent = $sce.trustAsHtml($scope.selectedFiles[data._id].content);
        $scope.safeApply();
      }
    };

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
      $scope.safeApply();
    });

    socket.on('client:fileContent', function (data) {
      addContent(data);
    });

    socket.on('client:newLine', function (data) {
      addContent(data);
    });

    socket.on('client:newConnection', function (newFiles) {
      var file, tmpFile, filesToAdd = [];
      for (var i = 0; i < newFiles.length; i++) {
        file = newFiles[i];
        tmpFile = _.find($scope.files, {
          filename: file.filename,
          filepath: file.filepath,
          name: file.name,
          ip: file.ip
        });
        if (tmpFile === undefined) {
          filesToAdd.push(file);
        } else {
          if ($scope.selectedFiles.hasOwnProperty(tmpFile._id)) {
            delete $scope.selectedFiles[tmpFile._id];
            if ($scope.activeFile.id === tmpFile._id) {
              $scope.activeFile.id = file._id;
            }
            $scope.selectedFiles[file._id] = tmpFile;
            tmpFile._id = file._id;
          }
        }
      }
      if (filesToAdd.length > 0) {
        $scope.files = _.concat($scope.files, filesToAdd);
        $scope.addNotification('success', filesToAdd);
      }
      $scope.safeApply();
    });

    socket.on('client:lostConnection', function (lostFiles) {
      $scope.addNotification('error', lostFiles);
      for (var i = 0; i < lostFiles.length; i++) {
        if (!$scope.selectedFiles.hasOwnProperty(lostFiles[i]._id)) {
          $scope.files = _.remove($scope.files, function (file) {
            return file._id === lostFiles[i]._id;
          });
        }
      }
      $scope.$apply()
    });
  }]);
