module.exports = function(grunt){

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ["build"],

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
      core_js: {
        cwd: 'src/js/core/',
        src: '*.js',
        dest: 'build/js/',
        expand: true,
        flatten: true
      },
      core_css: {
        cwd: 'src/css/core/',
        src: '*.css',
        dest: 'build/css/',
        expand: true,
        flatten: true
      }
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

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.registerTask('buildcss', ['cssc','cssmin','copy']);
  //grunt.registerTask('default', 'concat min cssmin');
  grunt.registerTask('default', ['clean', 'copy:core_js', 'copy:core_css', 'concat', 'uglify']);
};
