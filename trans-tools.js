var fs = require('fs');
var moment = require('moment');
var pinyin = require('pinyin');

var toMarkdown = require('to-markdown');

var json_history=JSON.parse(fs.readFileSync('./2016-02-16-15-18.dump'));

//var first = json_history[0].Text;

for(var raw in json_history)
{
	var text = json_history[raw].Text;
	//console.log(text);

	if(text && json_history[raw].Title) {
		
		var md ="<h1>" + json_history[raw].Title + "</h1>";
		md += json_history[raw].Text;
		md = toMarkdown(md);


		var title_raw = json_history[raw].Title;
		console.log(title_raw);

		var title_temp = title_raw
			.replace(/[!！?？//+']/g,'')
			.replace(/["‘’“”~:：,，【】《》\[\]]/g,' - ')
			.replace(/[$]/g,' USB ')
			.replace(/[￥]/g,' RMB ')
			.replace(/#/g,' Sharp ')
			.trim()
			.replace(/\s?-\s-\s?/g,'')
			.replace(/\s/g,'-')
			.replace(/--/g,'-')
			.replace(/\.\./g,'')
			.trim();
		//console.log(title_temp);

		var title_array = pinyin(title_temp, 
			{style: pinyin.STYLE_NORMAL,
			heteronym: false
			});

		var title_array_slice = [];
		for (var i = 0; i < title_array.length; i++) {
			if(i<10)
			{
				title_array_slice.push(title_array[i]);
			}			
		}
		var title = title_array_slice
		.join('-')
		.toUpperCase();

		//console.log(md);
		var file_name = json_history[raw].CreateTime + '#'
		+ moment(json_history[raw].CreateTime,'x').format('YYYY-MM-DD')+'#'
		+ title +'.MD';
		fs.writeFileSync('./archive/'+file_name, md, 'utf8');
	}
}