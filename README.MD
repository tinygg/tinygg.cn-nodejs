##Web框架 Koa.js

##Template Swig 

##NO DATABASE

##cache.js

手写的缓存插件

##Markdown
直接发布在archive目录即可.

##部署
windows下载
ngix http://nginx.org/download/nginx-1.8.1.zip

追加配置项

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