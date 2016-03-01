
/**
 * Module dependencies.
 */
var koa = require('koa');
var route = require('koa-route');
var views = require('co-views');
var static = require('koa-static');

var logger = require('koa-logger');
var parse = require('co-body');
var glob = require("glob");
var rf=require('fs');
var path = require('path');
var moment = require('moment');

var cached = require('./cache.js');
cached.LogON(false);

var showdown  = require('showdown');
converter = new showdown.Converter();


//app
var app = koa();
//view 
var render = views('./views', {
  map: { html: 'swig' }
});
//static
app.use(static(__dirname+'/static'));

app.use(logger());

// route definitions
app.use(route.get('/([0-9]*)', index));
// format:YYYY-MM-DD/title
app.use(route.get('/([0-9]{4}-[0-9]{2}-[0-9]{2})/(.*)', post));
// format:post.id
app.use(route.get('/([0-9]{11,13})', post));
//debug cache
app.use(route.get('/cache',cache));

app.use(route.get('/archive',archive));
app.use(route.get('/inbox',inbox));

//timestamp tools
app.use(route.get('/timestamp(.*)',timestamp));

function *timestamp()
{
  var paths = this.request.path.split('/');
  //console.log(paths);
  var time;
  if(paths.length == 3) {
    //console.log(paths[2]);
    time = paths[2];    
  }
  else 
  {
    paths = this.request.querystring;
    //console.log(paths);
    time = paths;
  }
  //console.log(time);
  if(time) this.body = moment(time)+'#'+ moment(time).format('YYYY-MM-DD')+'#';
  else this.body = Date.now()+'#'+ moment().format('YYYY-MM-DD')+'#';
}

function *inbox()
{ 
  this.body = yield render('post',
  {
    post:{
      type:'inbox',
      content:
      "my inbox is under building."
    }
  });
}

function *archive()
{ 
  this.body = yield render('post',
  {
    post:{
      type:'archive',
      content:
      "my archive is under building."
    }
  });
}

// function 后面带 * 的叫做generator。
// 在generator内部你可以使用 yield 
function *cache(){
  console.log(cached.Article_Timestamp());
  console.log(cached.Article_Title());
  console.log(cached.Year_Month());
  console.log(cached.Year_Month_Article());
  this.body = yield render('post', {
      post:{
        type:'cache',
        content:'cache info list on your console.'}
      }
  );
}

/**
 * Post listing.
 */
function *post(){
  var paths = this.request.path.split('/');

  var post_name;
  var post_content;
  //TODO  search file name from cache instead of using glob again.
  if(paths.length == 3)
  {
      var pattern = 'archive/*#' + paths[1] + '#' + paths[2] + '.MD';
      //console.log(pattern);
      var files = glob.sync(pattern,{nocase: true});
      //console.log(files);
      if(files.length == 1)
      {
        post_name = files[0];
        console.log(files[0]);
        var data = rf.readFileSync(files[0],'utf-8');
        data  = converter.makeHtml(data);
        post_content = data.replace(/<h1.*<\/h1>/i,'');
      }
  }
  else if(paths.length == 2)
  {      
      var pattern = 'archive/*'+paths[1]+'*.MD';
      //console.log(pattern);
      var files = glob.sync(pattern,{nocase: true});
      //console.log(files);
      if(files.length == 1)
      {
        post_name = files[0];
        console.log(files[0]);
        var data = rf.readFileSync(files[0],'utf-8');
        data  = converter.makeHtml(data);
        post_content = data.replace(/<h1.*<\/h1>/i,'');
      }
  }
  else
  {
    this.body = yield render('post',
      {
        post:{
          type:'文章',
          content:
          "sorry, we can't find this post."
        }
      });
  }

  if(!post_name)
  {
    this.body = yield render('post',
      {
        post:{
          type:'文章',
          content:
          "sorry, we can't find this post."
        }
      });
  }
  else
  {

    console.log('>>>>>>>>>'+post_name);
    var name = path.parse(post_name).name;
    var stamp = name.split('#')[0];
    var date =  name.split('#')[1];
    var en_title = name.split('#')[2];

    var date_en = parse_date_en(date);
    var year = date_en.split('-')[0];
    var month = date_en.split('-')[1];
    var day = date_en.split('-')[2];

    var sorted_timestamp_array = get_sorted_json_value_array(cached.Article_Timestamp());
    //console.log(sorted_timestamp_array);

    var current_index = sorted_timestamp_array.indexOf(+stamp);
    //console.log(stamp);

    var next_url = '/';
    var next_title = '无';
    if(current_index + 1 < sorted_timestamp_array.length)
    {
      var next_stamp = sorted_timestamp_array[current_index + 1];
      var next_en_title = cached.Timestamp_Article()[next_stamp];
      next_title = cached.Article_Title()[next_en_title];
      next_url = '/' + next_en_title.split('#')[1] + '/' + next_en_title.split('#')[2];
    }

    var last_url = '/';
    var last_title = '无';
    if(current_index - 1 >= 0)
    {
      var last_stamp = sorted_timestamp_array[current_index - 1];
      var last_en_title = cached.Timestamp_Article()[last_stamp];
      last_title = cached.Article_Title()[last_en_title];
      last_url = '/' + last_en_title.split('#')[1] + '/' + last_en_title.split('#')[2];
    }
    var post_json = { post:
      {
        type:'文章',
        title:cached.Article_Title()[name],
        url:'/' + date + '/' + en_title,
        content:post_content,
        date:{
          year:year,
          month:month,
          day:day
        },
        next_url:next_url,
        next_title:next_title,
        last_url:last_url,
        last_title:last_title
      }
    }; 

    post_json['permanent_url'] = 'http://tinygg.cn/' + stamp;
    post_json['permanent_id'] = stamp;
    //console.log(post_json);
    this.body = yield render('post', post_json);
  }

}

function *index() {
  var page = 0;
  var per_page = 6;
  var paths = this.request.path.split('/');
  //console.log(paths);
  if(paths.length == 2)
  {
    page = +paths[1];
  }

  var posts_json = get_posts_json(page, per_page);
  //console.log(this.request.header);//////////////////////
  posts_json['permanent_url'] = 'http://tinygg.cn';
  this.body = yield render('index', posts_json);
}

function get_posts_json(page, per_page)
{
  var json = {};
  var posts = [];
  var sorted_timestamp_array = get_sorted_json_value_array(cached.Article_Timestamp());
  //console.log(sorted_timestamp_array);

  var max = 0;
  var has_next = false;
  var has_last = false;

  if(page > 0)
  {
    has_last = true;
  }
  else
  {
    has_last = false;
  }

  if((page + 1)*per_page < sorted_timestamp_array.length)
  {
    max = (page + 1)*per_page;
    has_next = true;
  }
  else
  {
    max = sorted_timestamp_array.length;
    has_next = false;
  }

  var timestamp_article_json = cached.Timestamp_Article();
  var article_title_json = cached.Article_Title();
  for(var i = page*per_page; i < max; i++)
  {
    if(i < max)
    {
      var stamp = sorted_timestamp_array[i];
      var name = timestamp_article_json[stamp];
      var _date = name.split('#')[1];
      var _title_en = name.split('#')[2];
      var _title = article_title_json[name];
      var _url = '/'+_date+'/'+_title_en;
      var _content = rf.readFileSync('archive/'+name+'.MD','utf-8');
      _content  = converter.makeHtml(_content);
      _content = _content.replace(/<h1.*<\/h1>/i,'').substr(0,300);

      var date_en = parse_date_en(_date);
      posts.push(
        {
          title:_title,
          url:_url,
          content:_content,
          date:{
            year:date_en.split('-')[0],
            month:date_en.split('-')[1],
            day:date_en.split('-')[2]
          }
        });
    }
  }

  //console.log(page);
  //console.log(has_last);
  //console.log(has_next);
  var str_last = ((page-1)==0?'':(page-1));
  var last_ = (has_last? '/' + str_last:'');
  var next_ = (has_next? '/' + (page+1) :'');
  json = { posts: posts, last_page_url:last_,next_page_url: next_}
  //console.log(json);
  return json;
}

/***
  *sort article
  */
function get_sorted_json_value_array(article_timestamp_json)
{
  var value_tmp = [];
  for(var key in article_timestamp_json) {
      value_tmp.push(article_timestamp_json[key]);
  }
  value_tmp.sort(function(a,b){
      return a > b ? -1 : 1;
  });
  return value_tmp;
}

function parse_date_en(date)
{
  var dt = new Date(date);
  var m=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Spt","Oct","Nov","Dec");
  var d=new Array("st","nd","rd","th");
  mn=dt.getMonth();
  wn=dt.getDay();
  dn=dt.getDate();
  var dns;
  if(((dn)<1) ||((dn)>3)){
    dns=d[3];
  }
  else
  {
    dns=d[(dn)-1];
    if((dn==11)||(dn==12)){
      dns=d[3];
    }
  }
  return dt.getFullYear() + "-" + m[mn] + "-" + dn+dns;
}

// listen
app.listen(3000);
console.log('listening on port 3000');