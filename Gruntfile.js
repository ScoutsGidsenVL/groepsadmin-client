module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Grunt tasks
    less: {
      development: {
        files: {
          'css/bootstrap.css': ['less/bootstrap.less']
        },
        options: {
          compress: true/*,
          // LESS source maps
          // To enable, set sourceMap to true and update sourceMapRootpath based on your install
          sourceMap: true,
          sourceMapFilename: 'css/styles.css.map'*/
        }
      }
    },

    watch: {
      // Watch for LESS changes, building CSS directly
      styles: {
        // Which files to watch (all .less files recursively in the less directory)
        files: ['less/**/*.less'],
        tasks: ['less'],
        options: {
          nospawn: true
        }
      },
      // Watch for JS changes.
      scripts: {
        files: ['js/**/*.js'],
        tasks: ['less::development']
      }/*,
      livereload: {
        options: { 
          livereload: false
        },
        files: ['css/styles.css', 'js/scripts.js','*.html' ]
      }*/
    }

  });

  // Load required modules
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Task definitions
  grunt.registerTask('default', ['watch']);

};