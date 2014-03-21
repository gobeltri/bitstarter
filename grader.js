#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://pure-dusk-2467.herokuapp.com/index.html"

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting", instr);
	}
	return instr;
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
	$ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var clone = function(fn) {
	// Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

/* Process URL and call to the checks. Prints outputs */
var processUrl = function (url, checks) {
	rest.get(url).on('complete', function(result) {
		//callback(cheerio.load(result));
		var cheerioUrl = cheerio.load(result);
		var checkJson = checkUrl(cheerioUrl, checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		
		console.log(outJson);
		console.log(url);
		console.log(cheerioUrl);
	});
};

/* Check remote Url with JSON */
var checkUrl = function(cheerio, checksfile) {
	
	$ = cheerio;
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};


/* Main */
if(require.main == module) {
	program
		.option('-c, --checks <check_file>)', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url_address>', 'Path to URL')
		.parse(process.argv);
		
	// Check if an URL was passed as parameter
	if (program.url) {
		processUrl(program.url, program.checks);
	}
	// If not an URL
	else {
		var checkJson = checkHtmlFile(program.file, program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
		console.log(program.file);
		console.log(cheerioHtmlFile(program.file));
	}
} else {
	exports.checkHtmlFile = checkHtmlFile;
}
