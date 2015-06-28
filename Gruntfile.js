module.exports = function(grunt) {
	grunt.initConfig({
		jshint: {
			files: ['js/*.js', 'js/controllers/*.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.registerTask('default', ['jshint']);

};