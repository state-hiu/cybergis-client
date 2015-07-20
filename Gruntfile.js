module.exports = function(grunt){

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    concat_openlayers: {
      js: {
        src: 'src/js/openlayers/*.js',
        dest: 'build/js/cybergis-client-openlayers.js'
      },
      css: {
        src: 'src/css/openlayers/*.css',
        dest: 'build/css/cybergis-client-openlayers.css'
      }
    },
    concat_geoext: {
      js: {
        src: 'src/js/geoext/*.js',
        dest: 'build/js/cybergis-client-geoext.js'
      },
      css: {
        src: 'src/css/geoext/*.css',
        dest: 'build/css/cybergis-client-geoext.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.registerTask('buildcss', ['cssc','cssmin','copy']);
  //grunt.registerTask('default', 'concat min cssmin');
  grunt.registerTask('default', 'concat_openlayers concat_geoext');
};
