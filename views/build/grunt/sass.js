module.exports = function(grunt) {

    var sass    = grunt.config('sass') || {};
    var watch   = grunt.config('watch') || {};
    var notify  = grunt.config('notify') || {};
    var root    = grunt.option('root') + '/xmlEditRp/views/';

    //override load path
    sass.xmleditrp = {
        options : {
            loadPath : ['../scss/', root + 'scss/inc']
        },
        files : {}
    };

    //files goes heres
    sass.xmleditrp.files[root + 'css/editor.css'] = root + 'scss/editor.scss';
    watch.xmleditrpsass = {
        files : [root + 'scss/**/*.scss'],
        tasks : ['sass:xmleditrp', 'notify:xmleditrpsass'],
        options : {
            debounceDelay : 500
        }
    };

    notify.xmleditrpsass = {
        options: {
            title: 'Grunt SASS',
            message: 'SASS files compiled to CSS'
        }
    };

    grunt.config('sass', sass);
    grunt.config('watch', watch);
    grunt.config('notify', notify);

    //register an alias for main build
    grunt.registerTask('xmleditrpsass', ['sass:xmleditrp']);
};
