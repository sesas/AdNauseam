// NOTE: this file is 'assume-unchanged' in git

// configs for testing the addon-UI (menu/advault/log)
var TEST_MODE = false, 
	TEST_PAGE = 'http://www.nytimes.com/', 
	TEST_ADS = '../lib/test/test-ad-data.json';
	// TEST_ADS = '../lib/test/lots-of-ads.json';

if (typeof exports != 'undefined') {

	// configs for testing the addon-core
	exports.PARSER_TEST_MODE = false;
	exports.PARSER_TEST_PAGE = 'http://www.nytimes.com/';
    exports.PARSER_TEST_ADS = '/Users/dhowe/Documents/javascript-workspace/AdNauseam/lib/test/test-ad-data.json';
} 