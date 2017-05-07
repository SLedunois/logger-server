var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require('gulp-util');
var webpackConfig = require('./webpack.config');
var watch = require('gulp-watch');

var build = function () {
  return webpack(webpackConfig, function (err, stats) {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      colors: true,
      progress: true
    }));
    var date = new Date();
    console.log('LAST COMPILATION : ' +
      date.getHours() +
      ':' + date.getMinutes() +
      ':' + date.getSeconds());
  });
};

gulp.task('watch', function () {
  return watch('./public/src/**/*.js', function () {
    build();
  });
});

gulp.task('build', function () {
  build();
});
