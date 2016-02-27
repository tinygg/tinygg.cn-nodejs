var fs = require('fs');
var toMarkdown = require('to-markdown');



var json_history=JSON.parse(fs.readFileSync('./archive/2016-02-16-15-18.dump'));

var first = json_history[0].Text;

console.log(first);

console.log(toMarkdown(first));

