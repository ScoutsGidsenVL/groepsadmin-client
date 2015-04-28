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
          compress: true,
          yuicompress: true,
          optimization: 2,
          sourceMap: true,
          sourceMapFilename: 'css/bootstrap.css.map', // where Grunt should put the file
          sourceMapURL: 'bootstrap.css.map', // the complete url and filename put in the compiled css file
          sourceMapBasepath: 'css', // Sets sourcemap base path, defaults to current working directory.
          //sourceMapRootpath: '/', // adds this path onto the sourcemap filename and less file paths
        }
      }
    },

    watch: {
      options: {
        livereload: true,
      },
      // Watch for LESS changes and build CSS automatically
      styles: {
        // Which files to watch (all .less files recursively in the less directory)
        files: ['less/**/*.less'],
        tasks: ['less'],
        options: {
          nospaces: true
        }
      },/*
      // Watch for JS changes.
      scripts: {
        files: ['js/*.js'],
        tasks: ['less::development']
      },*/
      // Watch html files, just for LiveReload
      templates: {
        files: ['*.html']
      }
    },

    connect: {
      server: {
        livereload: true
      }
    }

  });

  // Load required modules
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Task definitions
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('serve', [
    'connect:server',
    'watch'
  ]);

};
