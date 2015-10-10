var gulp = require('gulp');
var pkg = require('./package.json');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var del = require('del');
var spawn = require('child_process').spawn;

var compilelist =
[
    {
        "name": "ol2_js",
        "type": "js",
        "src": "./src/js/openlayers/*.js",
        "outfile":"cybergis-client-openlayers.js",
        "minified":"cybergis-client-openlayers.min.js",
        "dest":"./build/js/"
    },
    {
        "name": "geoext_js",
        "type": "js",
        "src": "./src/js/geoext/*.js",
        "outfile":"cybergis-client-geoext.js",
        "minified":"cybergis-client-geoext.min.js",
        "dest":"./build/js/"
    },
    {
        "name": "ol2_css",
        "type": "css",
        "src": "./src/css/openlayers/*.css",
        "outfile":"cybergis-client-openlayers.css",
        "dest":"./build/css/"
    },
    {
        "name": "geoext_css",
        "type": "css",
        "src": "./src/css/geoext/*.css",
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
        "src": "./src/css/core/*.css",
        "dest": "./build/css"
    }
];

gulp.task('compile', function(){
    for(var i = 0; i < compilelist.length; i++)
    {
        var t = compilelist[i];
        process.stdout.write(t.name);
        if(t.type=="js")
        {
            gulp.src(t.src)
                .pipe(concat(t.outfile))
                .pipe(gulp.dest(t.dest))
                .pipe(uglify())
                .pipe(rename({ extname: '.min.js'}))
                .pipe(gulp.dest(t.dest));
        }
        else if(t.type=="css")
        {
            gulp.src(t.src)
                .pipe(concat(t.outfile))
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
    './build/js/**/*',
    './build/css/**/*'
  ]);
});

gulp.task('default', ['clean','copy','compile']);
