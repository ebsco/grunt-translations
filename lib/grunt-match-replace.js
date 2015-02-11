var grunt = require('grunt');
var path = require('path');
var fs = require('fs');
var colors = require('colors');
var reportPath = null;
var searchAttributes = null;
var exclusionFileData = null;
var gruntTextReplace = {};


exports.match = function (settings) {
  gruntTextReplace.match(settings);
  this.settings = settings;
}

exports.replaceText = function (settings) {
  var text = settings.text;
  var replacements = settings.replacements;
  return gruntTextReplace.replaceTextMultiple(text, replacements);
}

exports.replaceFile = function (settings) {
  return gruntTextReplace.replaceFile(settings)
}

exports.replaceFileMultiple = function (settings) {
  return gruntTextReplace.replaceFileMultiple(settings)
}

exports.reportMatch = function (matchedSubstring, index, fullText, regexMatches, pathToSourceFile) {
  return gruntTextReplace.reportMatch(matchedSubstring, index, fullText, regexMatches, pathToSourceFile)
}

gruntTextReplace = {
  replaceFileMultiple: function (settings) {
    var sourceFiles = grunt.file.expand(settings.src);
    
    //create report file if reportPath is defined
    if(typeof reportPath !== 'undefined' && reportPath){
     fs.open(reportPath, 'a', function(err, fd){
        console.log('Error writing to file: ' + reportPath)
      });
      console.log("Start: " + this.getDateTime());
      console.log("FileCount: " + (sourceFiles.length).toString());
      fs.appendFileSync(reportPath, "Start: " + this.getDateTime() + ' \r\n');
      fs.appendFileSync(reportPath, "FileCount: " + (sourceFiles.length).toString() + ' \r\n');

    }

    sourceFiles.forEach(function (pathToSource) {
      gruntTextReplace.replaceFile({
        src: pathToSource,
        dest: settings.dest,
        replacements: settings.replacements
      });
    });
    console.log("End: " + this.getDateTime())
  },

  getDateTime: function(){
    var currentdate = new Date(); 
    dateTime = (currentdate.getMonth()+1) + "/"
        + currentdate.getDate()  + "/" 
        + currentdate.getFullYear() + " @ "  
        + currentdate.getHours() + ":"  
        + currentdate.getMinutes() + ":" 
        + currentdate.getSeconds();
    return dateTime;
  },


  replaceFile: function (settings) {
    var pathToSourceFile = settings.src;
    var pathToDestinationFile = this.getPathToDestination(pathToSourceFile, settings.dest);
    var replacements = settings.replacements;
    var isThereAGenuineReplacement = replacements.reduce(function (previous, current) { 
      return previous || (current.from !== current.to) 
    }, false);
    var isReplacementRequired = (pathToSourceFile !== pathToDestinationFile) || isThereAGenuineReplacement
    if (isReplacementRequired) {
      grunt.file.copy(pathToSourceFile, pathToDestinationFile, {
        process: function (text) {
          return gruntTextReplace.replaceTextMultiple(text, replacements, pathToSourceFile);
        }
      });
    }
  },

  replaceTextMultiple: function (text, replacements, pathToSourceFile) {
    return replacements.reduce(function (newText, replacement) {
      return gruntTextReplace.replaceText({
        text: newText,
        from: replacement.from,
        to: replacement.to
      }, pathToSourceFile);
    }, text);
  },

  replaceText: function (settings, pathToSourceFile) {
    var text = settings.text;
    var from = this.convertPatternToRegex(settings.from);
    var to = this.expandReplacement(settings.to, pathToSourceFile);
    return text.replace(from, to);
  },

  match: function (settings) {
    var src = grunt.file.expand(settings.src || []);
    reportPath = settings.reportPath;
    searchAttributes = settings.translationAttributes;
    var dest = settings.dest;
    var overwrite = settings.overwrite;
    var replacements = settings.replacements;
    var isDestinationDirectory = (/\/$/).test(dest);
    var initialWarnCount = grunt.fail.warncount;

    //read in the exclusion file
    exclusionFileData = fs.readFileSync(settings.exclusionFile).toString().split('\n');
    //loop over the array and 
    exclusionFileData.forEach(function(element ,index, array){
      array[index] = element.replace(/(\r\n|\n|\r)/gm,"");
    });

    if (typeof dest === 'undefined' &&
        typeof src === 'undefined' &&
        typeof replacements === 'undefined') {
      grunt.warn(gruntTextReplace.errorMessages.noTargetsDefined);
    } else if (typeof dest === 'undefined' && overwrite !== true) {
      grunt.warn(gruntTextReplace.errorMessages.noDestination);
    } else if (typeof replacements === 'undefined') {
      grunt.warn(gruntTextReplace.errorMessages.noReplacements);
    } else if (typeof dest !== 'undefined' && overwrite === true) {
      grunt.warn(gruntTextReplace.errorMessages.overwriteFailure);
    } else if ((isDestinationDirectory === false && src.length > 1) && overwrite !== true) {
      grunt.warn(gruntTextReplace.errorMessages.multipleSourceSingleDestination);
    } else if (grunt.fail.warncount - initialWarnCount === 0) {
      gruntTextReplace.replaceFileMultiple({
        src: src,
        dest: dest,
        replacements: replacements
      });
    }
  },

  errorMessages: {
    noTargetsDefined: "No targets were found. Remember to wrap functionality " +
      "within a target.",
    noDestination: "Destination is not defined! If you want to overwrite " +
      "files, then make sure to set overwrite: true. If you don't wish to " +
      "overwrite, then make sure to set a destination",
    noReplacements: "No replacements were found.",
    overwriteFailure: "Overwrite is to true, but a destination has also " +
      "been defined. If you want to overwrite files, remove the destination. " +
      "If you want to send files to a destination, then ensure overwrite is " +
      "not set to true",
    multipleSourceSingleDestination: "Cannot write multiple files to same " +
      "file. If you wish to export to a directory, make sure there is a " +
      "trailing slash on the destination. If you wish to write to a single " +
      "file, make sure there is only one source file"
  },

  getPathToDestination: function (pathToSource, pathToDestinationFile) {
    var isDestinationDirectory = (/\/$/).test(pathToDestinationFile);
    var fileName = path.basename(pathToSource);
    var newPathToDestination;
    if (typeof pathToDestinationFile === 'undefined') {
      newPathToDestination = pathToSource;
    } else {
      newPathToDestination = pathToDestinationFile + (isDestinationDirectory ? fileName : '');
    }
    return newPathToDestination;
  },

  convertPatternToRegex: function (pattern) {
    var regexCharacters = '\\[](){}^$-.*+?|,/';
    if (typeof pattern === 'string') {
      regexCharacters.split('').forEach(function (character) {
        var characterAsRegex = new RegExp('(\\' + character + ')', 'g');
        pattern = pattern.replace(characterAsRegex, '\\$1');
      });
      pattern = new RegExp(pattern, 'g');
    }
    return pattern;
  },

  expandReplacement: function (replacement, pathToSourceFile) {
    if (typeof replacement === 'function') {
      return this.expandFunctionReplacement(replacement, pathToSourceFile);
    } else if (typeof replacement === 'string') {
      return this.expandStringReplacement(replacement, pathToSourceFile);
    } else {
      return gruntTextReplace.expandNonStringReplacement(replacement);
    }
  },

  expandFunctionReplacement: function (replacement, pathToSourceFile) {
    return function () {
      var matchedSubstring = arguments[0];
      var index = arguments[arguments.length - 2];
      var fullText = arguments[arguments.length - 1];
      var regexMatches = Array.prototype.slice.call(arguments, 1,
        arguments.length - 2);

      gruntTextReplace.reportMatch(matchedSubstring, index, fullText, regexMatches, pathToSourceFile);
      
      var returnValue = replacement(matchedSubstring, index, fullText, regexMatches, pathToSourceFile);
      return (typeof returnValue === 'string') ?
        gruntTextReplace.processGruntTemplate(returnValue) :
        gruntTextReplace.expandNonStringReplacement(returnValue);
    };
  },

  expandStringReplacement: function (replacement) {
    return gruntTextReplace.processGruntTemplate(replacement);
  },

  expandNonStringReplacement: function (replacement) {
    var isReplacementNullOrUndefined = (typeof replacement === 'undefined') || (replacement === null);
    return isReplacementNullOrUndefined ? '' : String(replacement);
  },

  processGruntTemplate: function (string) {
    var isProcessTemplateTrue = true;
    if (grunt.task.current.data &&
        grunt.task.current.data.options &&
        typeof grunt.task.current.data.options.processTemplates !== 'undefined' &&
        grunt.task.current.data.options.processTemplates === false) {
      isProcessTemplateTrue = false;
    }

      return isProcessTemplateTrue ? grunt.template.process(string) : string;
  },

  reportMatch: function (matchedSubstring, index, fullText, regexMatches, pathToSourceFile, translationAttribute) {
     var sourceString = matchedSubstring.replace(/(<([^>]+)>)/ig, "");

      if (sourceString) {
        if(exclusionFileData.indexOf(sourceString) == -1)
          {
          
          var match = false;
          //loop throug the searchAttributes 
          for (i = 0; i < searchAttributes.length; i++){
            //if a match is found exit the function
            if (sourceString.indexOf(searchAttributes[i]) > -1) {
               match = true;
            }
          };

          if(!match){
                if(typeof reportPath !== 'undefined' && reportPath){
                  fs.appendFileSync(reportPath, 'MISSING TRANSLATION: ' + matchedSubstring, {encoding: 'utf8', flag: 'a'}, function(err){
                     console.log('Error writing to file: ' + reportPath)
                  });

                  fs.appendFileSync(reportPath, '    ---> ' + pathToSourceFile + ' \r\n', {encoding: 'utf8', flag: 'a'}, function(err){
                  console.log('Error writing to file: ' + reportPath + ' \r\n')
                  });
                }

                console.log(matchedSubstring.yellow);
                console.log("---> " + pathToSourceFile.grey);
          }

        };
      }
  }

}
