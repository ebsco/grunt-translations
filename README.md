# grunt-translations

Replace text in files using strings, regexs or functions.

## Installation
In your project's [gruntfile][getting_started] directory, run:

```bash
npm install grunt-translations --save-dev
```

Then add this line to your project's [gruntfile][getting_started]:

```javascript
grunt.loadNpmTasks('grunt-translations');
```

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/wiki/Getting-started#the-gruntfile


## Usage


```javascript
translations: {
  example: {
    src: ['text/*.txt'],             // source files array (supports minimatch)
    dest: 'build/text/',             // destination directory or file
    reportPath: 'report.txt',        // path to report output (optional)
    exclusionFile: 'exclusions.txt', // string to exclude from translation attribute identification
    translationAttributes: ["{{t ", "{{ t ", "{{{t ", "{{{ t "], // translation attribute to search for in identified elements
    replacements: [{
      from: 'Red',                   // string replacement
      to: 'Blue'
    }, {
      from: /(f|F)(o{2,100})/g,      // regex replacement ('Fooo' to 'Mooo')
      to: 'M$2'
    }, {
      from: 'Foo',
      to: function (matchedWord) {   // callback replacement
        return matchedWord + ' Bar';
      }
    }]
  }
}
```

Here's another example using [grunt.template][grunt.template], and overwriting
original source files:

```javascript
translations: {
  another_example: {
    src: ['build/*.html'],
    overwrite: true,                 // overwrite matched source files
    replacements: [{
      from: /[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}/g,
      to: "<%= grunt.template.today('dd/mm/yyyy') %>"
    }]
  }
}
```



## API reference


### replace

*translations* is the top level task that goes in your `grunt.initConfig({})`. It is
a [multi-task][multitask], meaning that it must contain targets, which you can
name anything you like.

[multitask]: https://github.com/gruntjs/grunt/wiki/Configuring-tasks#task-configuration-and-targets


### src

*src* is an array of source files to be replaced, and is required.
It supports [minimatch][minimatch] paths.

[minimatch]: https://github.com/isaacs/minimatch


### dest

*dest* is the destination for files to be replaced, and can refer to either a:

- file: `'path/output.txt'`
- directory: `'path/'`

grunt-text-replace will throw an error if multiple source files are mapped to
a single file.


### overwrite

*overwrite* should be used for in-place replacement, that is when all you need
to do is overwrite existing files.
To use it, omit *dest*, otherwise
grunt-text-replace will throw an error. You can only use one or the other. 


### replacements

*replacements* is an array of *from* and *to* replacements. See the
[examples](#usage) above.

### reportPath

*reportPath* is the path to a text file to report output (optional).
Output is also logged to the console.
[examples](#usage) above.


### exclusionFile is the path to a text file containing strings to exclude 
from translation attribute identification
[examples](#usage) above.

### translationAttributes: an array of translation attribute to search for in element
identified in the replacements.from data
[examples](#usage) above.

### from

*from* is the old text that you'd like replace. It can be a:

- plain string: `'Red'` *matches all instances of 'Red' in file*
- regular expression object:  `/Red/g` *same as above*


### to

*to* is the replacement. It can be a:

- plain string
- string containing a [grunt.template][grunt.template]
- string containing regex variables `$1`, `$2`, etc
- combination of the above
- function where the return value will be used as the replacement text (supports
[grunt.template][grunt.template])
- any JavaScript object


#### function
Where *to* is a function, the function receives 4 parameters:

1. **matchedWord**:  the matched word
2. **index**:  an integer representing point where word was found in a text
3. **fullText**:  the full original text
4. **regexMatches**:  an array containing all regex matches, empty if none
defined or found.


```javascript
// Where the original source file text is:  "Hello world"

replacements: [{
  from: /wor(ld)/g,
  to: function (matchedWord, index, fullText, regexMatches, sourcePath) {
    // matchedWord:  "world"
    // index:  6
    // fullText:  "Hello world"
    // regexMatches:  ["ld"]
    // sourcePath: /templates/index.html
    return 'planet';   //
  }
}]

// The new text will now be:  "Hello planet"
```

#### JavaScript object
Where *to* is a JavaScript object, type coercion will apply as follows:

1. **null**:  will result in an empty string
2. **undefined**:  will return in an empty string
3. **other**:  all other values will use default JavaScript type coercion. Examples:
    - false: 'false'
    - true: 'true'
    - 0: '0'



### options

*options* is an object, specific to a target, and the only supported option is
*processTemplates*

#### processTemplates

*processTemplates* when set to false (by default it is true) switches off
grunt.template processing within function return statements. It doesn't work for
string replacements (ie. when the replacement is a string, not a function), as
grunt processes templates within config string values before they are passed to
the plugin.

```javascript
replace: {
  prevent_templates_example: {
    src: ['text/*.txt'],
    dest: 'build/text/',
    options: {
      processTemplates: false
    },
    replacements: [{
      from: /url\(.*\)/g,
      to: function () {
        return "url(<% Don't process this template, retain the delimeters %>)";
      }
    }]
  }
}
```


[grunt.template]: http://gruntjs.com/api/grunt.template

## Road map
Some changes I'm considering. Happy to receive suggestions for/against:

- **Consolidate function parameters.** This would mean replacing the 4 existing
function parameters 'matchedWord', 'index', 'fullText' and 'regexMatches' with a single
'data' object with 4 members.
- **Source/Destination paths in function callback**. The above change makes it easier to
add the source and destination paths as part of the data parameter in the function callback,
which is a requested feature.
- **Grunt 4.0 'files' and 'options'**. At some point I might move to bringing the plugin
in alignment with the Grunt 4.0 convention of having standard 'files' and 'options' objects.


## slanders770/grunt-translations History
v0.0.1 - 02/11/2015 - "initial commit of source"

## License
Copyright (c) 2013 Jonathon Holmes
Licensed under the MIT license.
