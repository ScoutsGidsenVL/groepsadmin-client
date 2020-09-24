module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    version_bump: {
      files: ['package.json']
    },

    "git-describe": {
      options: {},
      default: {}
    },

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

    concat: {
      vendor: {
        src: [
          'js/bower_components.js',
          'bower_components/angular-i18n/angular-locale_nl-be.js',
          'js/jquery.sparkline.2.1.2.js',
          'js/ui-bootstrap-custom-tpls-1.3.2.js',
          'js/bootstrap/transition.js',
          'js/bootstrap/dropdown.js',
          'js/bootstrap/alert.js',
          'js/bootstrap/bootstrap-select.min.js'
        ],
        dest: 'app/assets/js/<%= pkg.name %>-vendor.js'
      },
      private: {
        options: {
          process: grunt.template.process
        },
        src: [
          // Angular Project Dependencies,
          'app/app.js',
          'app/app.config.js',
          'app/app.route.js',
          'app/polyfills.js',
          'app/controllers/**.js',
          'app/directives/**.js',
          'app/filters/**/**.js',
          'app/services/**/**.js'
        ],
        dest: 'app/assets/js/<%= pkg.name %>-private.js'
      },
      public: {
        src: [
          // Angular Project Dependencies,
          'app/polyfills.js',
          'app/app-public.js',
          'app/app-public.route.js',
          'app/controllers/alert-controller.js',
          'app/controllers/lidworden-controller.js',
          'app/services/api-info-service.js',
          'app/services/alert-service.js',
          'app/services/rest-service.js',
          'app/services/lid-service.js',
          'app/services/cache-service.js',
          'app/services/form-validation-service.js',
          'app/directives/ga-parse-date.js',
          'app/directives/ga-datum-control.js',
          'app/directives/ga-straat-control.js',
          'app/directives/ga-gemeente-control.js',
          'app/directives/ui-dialog.js',
          'app/directives/ui-selectpicker.js',
          'app/directives/utils.js',
          'app/directives/telefoonnummer.js',
          'app/directives/rekeningnummer.js',
          'app/directives/ga-email.js'
        ],
        dest: 'app/assets/js/<%= pkg.name %>-public.js'
      }
    },

    // https://www.npmjs.com/package/grunt-bower-concat
    bower_concat: {
      all: {
        dest: {
          'css': 'css/bower_components.css',
          'js': 'js/bower_components.js'
        },
        exclude: [
          'angular-i18n'
        ],
        dependencies: {
          'angular': 'jquery'
        },
        callback: function (mainFiles) {
          // Use minified files if available
          return mainFiles.map(function (filepath) {
            var min = filepath.replace(/(\/|\\)src(\/|\\)/, '$1dist$2').replace(/(\.css|\.js)$/, '.min$1');
            return /*grunt.file.exists(min) ? min :*/ filepath;
          });
        },
        mainFiles: { // override
          'lodash': 'dist/lodash.min.js'
        },
        options: {
          separator: ';\n'
        },
        bowerOptions: {
          relative: false
        }
      }
    },

    uglify: {
      options: {
        mangle: true,
        compress: true
      },
      vendor: {
        src: ['<%= concat.vendor.dest %>'],
        dest: 'app/assets/js/<%= pkg.name %>-vendor.min.js'
      },
      private: {
        src: ['<%= concat.private.dest %>'],
        dest: 'app/assets/js/<%= pkg.name %>-private.min.js'
      },
      public: {
        src: ['<%= concat.public.dest %>'],
        dest: 'app/assets/js/<%= pkg.name %>-public.min.js'
      },
    },

    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'css/<%= pkg.name %>.css': ['css/bootstrap.css', 'css/bower_components.css']
        }
      }
    },

    injector: {
      options: {
        relative: true,
        addRootSlash: false
      },
      dev: {
        files: {
          'index.html': [
            'app/assets/js/<%= pkg.name %>-vendor.min.js',
            'app/app.js',
            'app/app.config.js',
            'app/app.route.js',
            'app/polyfills.js',
            'app/controllers/**.js',
            'app/directives/**.js',
            'app/filters/**/**.js',
            'app/services/**/**.js'
          ],
          'formulier.html': [
            'app/assets/js/<%= pkg.name %>-vendor.min.js',
            'app/polyfills.js',
            'app/app-public.js',
            'app/app-public.route.js',
            'app/controllers/alert-controller.js',
            'app/controllers/lidworden-controller.js',
            'app/services/api-info-service.js',
            'app/services/alert-service.js',
            'app/services/rest-service.js',
            'app/services/lid-service.js',
            'app/services/cache-service.js',
            'app/services/form-validation-service.js',
            'app/directives/ga-parse-date.js',
            'app/directives/ga-datum-control.js',
            'app/directives/ga-gemeente-control.js',
            'app/directives/ga-straat-control.js',
            'app/directives/ui-dialog.js',
            'app/directives/ui-selectpicker.js',
            'app/directives/utils.js',
            'app/directives/telefoonnummer.js',
            'app/directives/rekeningnummer.js',
            'app/directives/ga-email.js'
          ]
        }
      },
      production: {
        files: {
          'index.html': [
            'app/assets/js/<%= pkg.name %>-vendor.min.js',
            'app/assets/js/<%= pkg.name %>-private.min.js',
            'app/assets/js/templates.js'
          ],
          'formulier.html': [
            'app/assets/js/<%= pkg.name %>-vendor.min.js',
            'app/assets/js/<%= pkg.name %>-public.min.js',
            'app/assets/js/templates.js'
          ]
        }
      }
    },

    clean: ['app/assets/js', 'js/bower_components.css', 'css'],

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
            dest: 'app/assets/js/'
          }
        ],
      },
    },

    ngtemplates: {
      app: {
        src: 'partials/*.html',
        dest: 'app/assets/js/templates.js',
        options: {
          module: 'ga.utils',
          root: 'app/',
          standAlone: false,
          htmlmin:  {
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeComments: true
          }
        }
      }
    },

    cacheBust: {
      taskName: {
        options: {
          assets: ['app/assets/js/*.js', 'css/*.css']
        },
        src: ['index.html', 'formulier.html']
      }
    },

    watch: {
      options: {

      },
      // Watch for LESS changes and build CSS automatically
      styles: {
        // Which files to watch (all .less files recursively in the less directory)
        files: ['less/**/*.less'],
        tasks: ['less', 'cssmin'],
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
        options: {
          port: 8000,
          middleware: function (connect, options, defaultMiddleware) {
            var proxy = require('grunt-connect-proxy2/lib/utils').proxyRequest;
            return [
              // Include the proxy first
              proxy
            ].concat(defaultMiddleware);
          }
        },
        proxies: [
          {
            context: '/groepsadmin',
            // host: 'ga-staging.scoutsengidsenvlaanderen.be',
            // port: 443,
            // https: true
            host: 'localhost',
            port: 8080,
            https: false
          }
        ]
      }
    }
  });

  // Load required modules
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-injector');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-cache-bust');
  grunt.loadNpmTasks('grunt-version-bump');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-connect-proxy2');

  // Task definitions
  grunt.registerTask('default', ['serve']);
  grunt.registerTask('serve', [
    'clean',
    'less',
    'bower_concat',
    'concat:vendor',
    'uglify:vendor',
    'cssmin',
    'injector:dev',
    'copy',
    'configureProxies:server',
    'connect:server',
    'watch'
  ]);
  grunt.registerTask('build', [
    'clean',
    'less',
    'bower_concat',
    'concat',
    'uglify',
    'ngtemplates',
    'injector:production',
    'cssmin',
    'cacheBust',
    'copy'
  ]);
};
