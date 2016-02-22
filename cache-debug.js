var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var gaze = require('gaze');
var readline = require('readline');

//##
var article_timestamp_cache = {
'path1':'1434382735394',
'path2':'1434382735399'
}

//##@@
var article_title_cache = {
'path1':'xxxx1',
'path2':'xxxx2'
};

//###
// var year_cache = [
// '2013',
// '2014',
// '2015',
// '2016'
// ];

//###
var year_month_cache = {
'2016':['2016-01','2016-02'],
'2015':['2015-02']
};

//###@@@
var month_article_cache ={
'2016-01':['path1','path2','path3'],
'2016-02':['path7']
};

//////////////////////////////////
////////CLEAR EXAMPLE DATA
//////////////////////////////////
//for content
article_timestamp_cache ={};
article_title_cache={};

//for classify
year_month_cache={};
year_month_article_cache={};
//////////////////////////////////

//////////////////////////////////
////////MONITOR
//////////////////////////////////
// Watch all .js files/dirs in process.cwd()
gaze('archive/**/*#*#*.MD', function(err, watcher) {
  //var watched = this.watched();// Get all watched files
  //console.log(watched);

  // On file added
  this.on('added', add_callback);

  // On file deleted
  this.on('deleted', del_callback);

  // On file changed
  this.on('changed', function(filepath) {
    console.log(filepath + ' was changed');

    var file_parse = path.parse(filepath);
    var name = file_parse.name;

	// article_title_cache={};
	var data=fs.readFileSync(filepath,'utf-8');
	var lines = data.toString().split(/\r\n*/ig);
	article_title_cache[name] = lines[0].replace(/#\s*/,'');
	console.log(article_title_cache);
  });

  this.on('renamed',function(filepath){
	console.log(filepath+' was renamed, use same function as add !!!(auto emit delete event)');
	//TODO SAME TO ADD
	add_callback(filepath);
  });

  // Get watched files with relative paths
  var files = this.relative();
  console.log(files);
  //init
  _post = files['archive\\'];
  for (var i = _post.length - 1; i >= 0; i--) {
  	add_callback('archive\\'+_post[i]);
  }
});
  
// Also accepts an array of patterns
//gaze(['static/css/**.css', 'static/image/*.*','static/js/*.js'], function() {
  // Add more patterns later to be watched
  //this.add(['js/*.js']);
//});

function add_callback(filepath) {
    console.log(filepath + ' was added');

    // { root: 'E:\\',
	//   dir: 'E:\\tinygg_NODE\\archive',
	//   base: 'xxxx.MD',
	//   ext: '.MD',
	//   name: 'xxxx' }
    var file_parse = path.parse(filepath);

    var name = file_parse.name;
    var stamp = name.split('#')[0];
    var date =  name.split('#')[1];

    var year = date.split('-')[0];
	var month = date.split('-')[1];
    var day = date.split('-')[2];
    //console.log(year);
    //console.log(month);
    //console.log(day);

	//UPDATE CONTENT
	//##article_timestamp_cache ={};
	//console.log(article_timestamp_cache[name]);
	if(!article_timestamp_cache[name])
	{
		article_timestamp_cache[name] = stamp;
	}
	console.log(article_timestamp_cache);

	//read first line
	var data=fs.readFileSync(filepath,'utf-8');
	var lines = data.toString().split(/\r\n*/ig);
	article_title_cache[name] = lines[0].replace(/#\s*/,'');
	console.log(article_title_cache);

	// for classify
	// ##year_cache=[];
	// if(year_cache.indexOf(year) < 0)
	// {
	// 	year_cache.push(year);
	// }
	// console.log(year_cache);

	// ##year_month_cache={};
	if(!year_month_cache[year])
	{
		year_month_cache[year] = [year + '-' + month];
	}
	else
	{
		if(year_month_cache[year].indexOf(year + '-' + month)<0)
		{
			year_month_cache[year].push(year + '-' + month);
		}
	}
	console.log(year_month_cache);

	// ##year_month_article_cache={};
	if(!year_month_article_cache[year + '-' + month])
	{
		year_month_article_cache[year + '-' + month] = [name];
	}
	else
	{
		if(year_month_article_cache[year + '-' + month].indexOf(name))
		{
			year_month_article_cache[year + '-' + month].push(name);
		}
	}
	console.log(year_month_article_cache);
}

function del_callback(filepath) {
    console.log(filepath + ' was deleted');

    var file_parse = path.parse(filepath);

    var name = file_parse.name;
    var stamp = name.split('#')[0];
    var date =  name.split('#')[1];

    var year = date.split('-')[0];
	var month = date.split('-')[1];
    var day = date.split('-')[2];

    //TODO DELETE PATH && archive related

	// article_timestamp_cache ={};
	if(article_timestamp_cache[name])
	{
		delete article_timestamp_cache[name];
	}
	console.log(article_timestamp_cache);

	// article_title_cache={};
	if(article_title_cache[name])
	{
		delete article_title_cache[name];		
	}
	console.log(article_title_cache);

	// //for classify
	// year_month_article_cache={};
	if(year_month_article_cache[year + '-' + month])
	{
		var index = year_month_article_cache[year + '-' + month].indexOf(name);
		if(index >= 0)
		{
			delete year_month_article_cache[year + '-' + month][index];
		}
		//remove this year-month key if it's value array is null
		//console.log('prepare to delete year_month_article_cache.');
		if(!year_month_article_cache[year + '-' + month][0])
		{
			delete year_month_article_cache[year + '-' + month];
			//console.log('delete year_month_article_cache ins.');
		}
	}
	console.log(year_month_article_cache);

	// year_month_cache={};
	if(year_month_cache[year])
	{
		var index = year_month_cache[year].indexOf(year + '-' + month);
		if(index >= 0)
		{
			delete year_month_cache[year][index];
		}
		//remove this year key, if it's value array is null
		//console.log('prepare to delete year_month_cache.');
		//console.log(year_month_cache[year].length);
		if(!year_month_cache[year][0])
		{
			delete year_month_cache[year];
			//console.log('delete year_month_cache ins.');
		}
	}
	console.log(year_month_cache);
 }

var counter = 0;
//////////////////////////////////
////////SERVER THE CACHE SERVICE
//////////////////////////////////
http.createServer(function (req, res) {
  	var path = url.parse(req.url).path;
  	console.log(path);
	if(path == '/') counter++;
	res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
	if(path =='/cache')
	{	
		res.write(JSON.stringify(article_timestamp_cache)+'<br>');
		res.write(JSON.stringify(article_title_cache)+'<br>');
		res.write(JSON.stringify(year_month_cache)+'<br>');
		res.write(JSON.stringify(year_month_article_cache)+'<br>');
		res.end();
	}
	else
	{
		res.end('Hello World\n'+counter);
	}

}).listen(9999, '127.0.0.1');
console.log('Server running at http://127.0.0.1:9999/');