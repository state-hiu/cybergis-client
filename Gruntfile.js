module.exports = function(grunt){

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      openlayers_js: {
        src: 'src/js/openlayers/*.js',
        dest: 'build/js/cybergis-client-openlayers.js'
      },
      openlayers_css: {
        src: 'src/css/openlayers/*.css',
        dest: 'build/css/cybergis-client-openlayers.css'
      },
      geoext_js: {
        src: 'src/js/geoext/*.js',
        dest: 'build/js/cybergis-client-geoext.js'
      },
      geoext_css: {
        src: 'src/css/geoext/*.css',
        dest: 'build/css/cybergis-client-geoext.css'
      }
    },
    copy: {
      main: {
        cwd: 'src/js/core/',
        src: '*.js',
        dest: 'build/js/',
        expand: true,
        flatten: true
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'build/js/cybergis-client-openlayers.min.js': ['build/js/cybergis-client-openlayers.js'],
          'build/js/cybergis-client-geoext.min.js': ['build/js/cybergis-client-geoext.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.registerTask('buildcss', ['cssc','cssmin','copy']);
  //grunt.registerTask('default', 'concat min cssmin');
  grunt.registerTask('default', ['copy','concat','uglify']);
};
