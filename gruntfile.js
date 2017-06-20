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
          sourceMapURL: 'bootstrap.css.map', // relative to css/bootstrap.css
          sourceMapFilename: 'css/bootstrap.css.map', // relative to this Gruntfile.js
          sourceMapRootpath: '..' // relative to the path in sourceMapFilename
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
    },

    wiredep: {
      target: {
        src: 'index.html'
      }
    }
  });

  // Load required modules
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-wiredep');

  // Task definitions
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('serve', [
    'less',
    'wiredep',
    'connect:server',
    'watch'
  ]);

};
