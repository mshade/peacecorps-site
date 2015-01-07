/*global module:false*/
'use strict';

var timer = require('grunt-timer');

module.exports = function(grunt) {
  timer.init(grunt);

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
      '<%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Env vars
    env: {
      test: {
        concat: {
          PATH : {
            'value': 'node_modules/.bin',
            'delimiter': ':'
          }
        }
      }
    },
    // Constants
    pkgFullName: '<%= pkg.name %>-donation',
    jsBuildDir: './js/compiled/',
    jsSrcDir: './js/src/',
    jsTestDir: '<%= jsSrcDir %>test/',
    // Task configuration.
    clean: ['<%= jsBuildDir %>'],
    uglify: {
      options: {
        report: 'gzip',
        sourceMap: true,
        sourceMapIn: '<%= browserify.donation.dest %>.map',
        sourceMapIncludeSources : true
      },
      dist: {
        src: '<%= browserify.donation.dest %>',
        dest: '<%= jsBuildDir %><%= pkgFullName %>.min.js'
      }
    },
    jshint: {
      all: ['<%= jsSrcDir %>**/*.js'],
      options: {
        jshintrc: './.jshintrc'
      }
    },
    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: [
          { 'css/compiled/donation.css': 'css/src/donation.scss'}
        ]
      }
    },
    browserify: {
      donation: {
        options: {
          exclude: '<%= jsSrcDir %>test/**/*.js',
          browserifyOptions: {
             debug: true
          }
        },
        dest: '<%= jsBuildDir %><%= pkgFullName %>.js',
        src: '<%= jsSrcDir %>donation.js'
      },
      withWatch: {
        options: {
          exclude: '<%= jsSrcDir %>test/',
          browserifyOptions: {
             debug: true
          },
          watch: true
        },
        dest: '<%= jsBuildDir %><%= pkgFullName %>.js',
        src: '<%= jsSrcDir %>donation.js'
      }
    },
    exorcise: {
      donation: {
        options: {},
        files: {
          '<%= browserify.donation.dest %>.map': [
            '<%= browserify.donation.dest %>'],
        }
      }
    },
    copy: {
      cssLibs: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['./node_modules/font-awesome/scss/*.scss'],
            dest: './css/src/lib/font-awesome/',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: ['./node_modules/font-awesome/fonts/*'],
            dest: './fonts',
          }
        ]
      }
    },
    fontAwesomeVars: {
      main: {
        variablesScssPath: './css/src/lib/font-awesome/_variables.scss',
        faCssPrefix: 'ico',
        fontPath: '../../../../fonts/'
      }
    },
    watch: {
      jshint: {
        files: '<%= jsSrcDir %>**/*.js',
        tasks: ['jshint']
      },
      css: {
        files: ['css/src/**/*.scss', '!css/src/bourbon', '!css/src/neat'],
        tasks: ['sass']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-exorcise');
  grunt.loadNpmTasks('grunt-font-awesome-vars');
  grunt.loadNpmTasks('grunt-testling');

  // Default task.
  grunt.registerTask('default', ['test', 'build']);
  grunt.registerTask('build', [
      'jshint',
      'clean',
      'copy:cssLibs',
      'fontAwesomeVars',
      'browserify:donation',
      'exorcise',
      'sass',
      'uglify']);
  grunt.registerTask('test', ['env:test', 'jshint', 'testling']);
  grunt.registerTask('build-watch', ['browserify:withWatch', 'watch']);
};
