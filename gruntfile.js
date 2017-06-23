module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Grunt tasks
    less: {
      all: {
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

    // https://www.npmjs.com/package/grunt-bower-concat
    bower_concat: {
      all: {
        dest: {
          'css': 'css/bower_components.min.css',
          'js': 'js/bower_components.min.js'
        },
        dependencies: {
          'angular': 'jquery'
        },
        callback: function(mainFiles) {
          // Use minified files if available
          return mainFiles.map(function(filepath) {
            var min = filepath.replace(/(\/|\\)src(\/|\\)/, '$1dist$2').replace(/(\.css|\.js)$/, '.min$1');
            return grunt.file.exists(min) ? min : filepath;
          });
        },
        mainFiles: { // override
          'lodash': 'dist/lodash.min.js'
        },
        options: {
          separator: ';'
        },
        bowerOptions: {
          relative: false
        }
      }
    },

    copy: {
      all: {
        files: [
          {
            expand: true,
            cwd: 'bower_components/components-font-awesome/fonts/',
            src: ['*'],
            dest: 'fonts/'
          },
          {
            expand: true,
            cwd: 'bower_components/tinymce/',
            src: [
              'themes/modern/theme.min.js',
              'plugins/*/plugin.min.js',
              'skins/*/*.min.css',
              'skins/*/fonts/tinymce.*',
              'plugins/codesample/css/prism.css'
            ],
            dest: 'js/'
          }
        ],
      },
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
      },
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
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-bower-concat');

  // Task definitions
  grunt.registerTask('default', ['serve']);
  grunt.registerTask('serve', [
    'less',
    'bower_concat',
    'copy',
    'connect:server',
    'watch'
  ]);
};
