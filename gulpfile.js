var gulp = require('gulp');
var pkg = require('./package.json');
var contact = require('gulp-concat');
var minify = require('gulp-minify');
var jshint = require('gulp-jshint');
var del = require('del');
var spawn = require('child_process').spawn;

var compilelist =
[
    {
        "name": "ol2",
        "type": "js",
        "src": "./src/js/openlayers/*.js",
        "outfile":"cybergis-client-openlayers.js",
        "minified":"cybergis-client-openlayers.min.js",
        "dest":"./build/js/"
    },
    {
        "name": "geoext",
        "type": "js",
        "src": "./src/js/geoext/*.js",
        "outfile":"cybergis-client-geoext.js",
        "minified":"cybergis-client-geoext.min.js",
        "dest":"./build/js/"
    },
    {
        "name": "ol2_css",
        "type": "css"
        "src": "./src/css/openlayers/*.css",
        "outfile":"cybergis-client-openlayers.css",
        "dest":"./build/css/"
    },
    {
        "name": "geoext_css",
        "type": "css",
        "src": "./src/css/geooext/*.css",
        "outfile": "cybergis-client-geoext.css",
        "dest":"./build/css/"
    }
];

var copylist =
[
    {
        "name": "core_js",
        "src": "./src/js/core/*.js",
        "dest": "./build/js"
    },
    {
        "name": "core_css",
        "src": "./src/js/core/*.js",
        "dest": "./build/css"
    }
];

gulp.task('compile', function(){
    for(var i = 0; i < compilelist.length; i++)
    {
        var t = compilelist[i];
        if(t.type=="js")
        {
            gulp.src(t.src)
                .pipe(concat({filename: t.outfile}))
                .pipe(gulp.dest(t.dest))
                .pipe(minify({filename: t.minified}))
                .pipe(gulp.dest(t.dest));
        }
        else if(t.type=="css")
        {
            gulp.src(t.src)
                .pipe(concat({filename: t.outfile}))
                .pipe(gulp.dest(t.dest));
        }
    }
});

gulp.task('copy', function(){
    for(var i = 0; i < copylist.length; i++)
    {
        var t = copylist[i];
        gulp.src(t.src).pipe(gulp.dest(t.dest));
    }
});


gulp.task('clean', function () {
  return del([
    'build/**/*'
  ]);
});

gulp.task('default', ['clean','copy','compile']);
