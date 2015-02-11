/*
 * grunt-translations
 * https://github.com/ebsco/grunt-translations
 *
 * Copyright (c) 2015 Jonathan Holmes, Scott Landers
 * Licensed under the MIT license.
 */

var gruntTextReplace = require('../lib/grunt-translations');

module.exports = function(grunt) {



  // Please see the grunt documentation for more information regarding task
  // creation: https://github.com/gruntjs/grunt/blob/devel/docs/toc.md

  grunt.registerMultiTask('translations',
    'General purpose text replacement for grunt. Allows you to replace ' +
    'text in files using strings, regexs or functions. Searches for text and' +
    'generates console output and optional text report of matches found',
    function () {
      gruntTextReplace.match({
        src: this.data.src,
        dest: this.data.dest,
        overwrite: this.data.overwrite,
        replacements: this.data.replacements,
        reportPath: this.data.reportPath,
        translationAttributes: this.data.translationAttributes,
        exclusionFile: this.data.exclusionFile
      });
    });
};
