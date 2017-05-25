const angular = require('angular');
const ngSticky = require('ngSticky');
const Io = require('socket.io-client');
const _ = require('lodash');

var app = angular.module('logger', ['sticky'])
  .controller('loggerCtrl', ['$scope', '$sce', function ($scope, $sce) {
    $scope.platforms = [];
    var socket = Io();

    $scope.selectedFiles = {};
    $scope.activeFile = {};
    $scope.notifications = [];
    $scope.options = {
      autoScroll: true
    };

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
      setTimeout(function () {
        autoScroll();
        $scope.safeApply();
      }, 150)
    };

    $scope.addNotification = function (type, plateform) {
      var notification = {
        type: type,
        platformName: plateform.platformName,
        show: true
      };
      console.log(notification);
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

    var autoScroll = function () {
      if (!$scope.options.autoScroll) return;
      $scope.scrollBottom();
    };

    $scope.scrollBottom = function () {
      window.scrollTo(0,document.body.scrollHeight);
    };

    socket.on('config:getConfiguration', function () {
      socket.emit('config:configuration', {
        type: 'CLIENT'
      });
    });

    socket.on('client:platforms', function (platforms) {
      for (var i = 0; i < platforms.length; i++) {
        platforms[i].opened = false;
        _.map(platforms[i].files, function (file) {
          file.content = '';
          return file.htmlContent = '';
        });
      }
      $scope.platforms = platforms;
      $scope.safeApply();
    });

    socket.on('client:fileContent', function (data) {
      addContent(data);
      autoScroll();
    });

    socket.on('client:newLine', function (data) {
      addContent(data);
      autoScroll();
    });

    socket.on('client:newConnection', function (newPlatform) {
      /*var file, tmpFile, filesToAdd = [];
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
      $scope.safeApply();*/
      $scope.platforms.push(newPlatform);
      $scope.addNotification('success', newPlatform);
      $scope.safeApply();
    });

    socket.on('client:lostConnection', function (lostPlatform) {
      $scope.addNotification('error', lostPlatform);
      $scope.platforms = _.without($scope.platforms, _.find($scope.platforms, {platformName: lostPlatform.platformName}));
      $scope.$apply()
    });
  }]);
