## Web Framwork:Koajs
[Koa.js](http://koajs.com/)
![koajs](koajs.png)


## Template:Swig
[Swig Template](https://github.com/paularmstrong/swig/)

## Database:No

## Cache:cache.js
纯手写的缓存模块

## 发布文章
Markdown文章直接发布在archive目录即可.
命名规范：0123456789123(时间戳，长度13)#YYYY-MM-DD(时间)#xxxxxxxxxx-_xxxxx.MD(英文标题:英文、数字、-、_不支持中文命名)

## 部署

### NODE依赖项
	npm install #项目依赖
	npm install forever -g #持续运行依赖.

### 反向代理配置(Nginx)

下载[nginx windows](http://nginx.org/download/nginx-1.8.1.zip)
追加配置项:

	server {
			listen       80;
			server_name  tinygg.cn;

			location / {
				 proxy_pass http://localhost:3000;
				 }
			error_page   500 502 503 504  /50x.html;
			location = /50x.html {
				root   html;
			}
	}

运行

	cd to nginx目录
	start nginx

停止

	nginx -s stop

##运行

forever start blog.js

forever stop blog.js