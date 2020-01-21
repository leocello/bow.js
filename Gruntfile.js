'use strict';
module.exports = function(grunt) {
    require('time-grunt')(grunt);
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin'
    });

    var config = {
        app: {
            js: 'js',
            sass: 'sass',
            less: 'less'
        },
        dist: {
            root: 'dist',
            js: 'js',
            sass: 'css',
            css: 'css',
            less: 'css'
        }
    };

    grunt.initConfig({

        config: config,

        jsbeautifier: {
            files: ["<%= config.dist.root %>/<%= config.dist.js %>/**/*.js"],
            options: {
                css: {
                    indentChar: " ",
                    indentSize: 4
                },
                js: {
                    braceStyle: "collapse",
                    breakChainedMethods: false,
                    e4x: false,
                    evalCode: false,
                    indentChar: " ",
                    indentLevel: 0,
                    indentSize: 4,
                    indentWithTabs: false,
                    jslintHappy: false,
                    keepArrayIndentation: false,
                    keepFunctionIndentation: false,
                    maxPreserveNewlines: 10,
                    preserveNewlines: true,
                    spaceBeforeConditional: true,
                    spaceInParen: false,
                    unescapeStrings: false,
                    wrapLineLength: 0,
                    endWithNewline: true
                }
            }
        },

        uglify: {
            options: {
                sourceMap: true,
                preserveComments: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app.js %>',
                    src: '{,*/}*.js',
                    dest: '<%= config.dist.root %>/<%= config.dist.js %>',
                    ext: '.min.js'
                }]
            }
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.dist.root %>'
                    ]
                }]
            }
        },

        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app.js %>',
                    src: '{,*/}*.js',
                    dest: '<%= config.dist.root %>/<%= config.dist.js %>',
                    ext: '.js'
                }]
            }
        }

    });

    grunt.registerTask('build', [
        'clean:dist',
        'babel',
        'jsbeautifier',
        'uglify',
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
