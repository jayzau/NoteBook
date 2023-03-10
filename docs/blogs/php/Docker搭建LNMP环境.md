## 安装

`redis`代替`mysql`作示例。

```shell
docker pull nginx
docker pull mysql:5.7
docker pull php:7.3.29-fpm
docker pull redis
```

选一个目录存放相关文件、配置。例：`/opt`

```shell
cd /opt
mkdir -p nginx/conf.d
mkdir -p redis/data
mkdir www
```

先启动`php`容器。

```shell
docker run --name myphp73 -v /opt/www/:/var/www/html -p 9000:9000 --restart=always -d php:7.3.29-fpm 
```

部分依赖

```shell
# 先进入php容器
docker-php-ext-install pdo_mysql
docker-php-ext-install -j$(nproc) bcmath
pecl install -o -f redis		# 随后根据提示修改ini： extension=redis.so
```

找到容器IP地址，然后编辑`nginx`配置

```shell
docker inspect myphp73		# IPAddress
vim /opt/nginx/conf.d/default.conf
```

```nginx
# 以下为示例内容
server {
  listen  80 default_server;
  server_name _;
  root   /usr/share/nginx/html;

  location / {
   index index.html index.htm index.php;
   autoindex off;
  }
  location ~ \.php(.*)$ {
   root   /var/www/html/;
   fastcgi_pass IPAddress:9000;
   fastcgi_index index.php;
   fastcgi_split_path_info ^((?U).+\.php)(/?.+)$;
   fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
   fastcgi_param PATH_INFO $fastcgi_path_info;
   fastcgi_param PATH_TRANSLATED $document_root$fastcgi_path_info;
   include  fastcgi_params;
  }
}
```

启动`nginx`容器

```shell
docker run --name mynginx -v /opt/www:/usr/share/nginx/html -v /opt/nginx/conf.d/:/etc/nginx/conf.d -p 80:80 --restart=always -d nginx
```

编辑`info.php`测试是否正常运行

```shell
echo "<?php phpinfo();" > /opt/www/info.php  # 随后访问  127.0.0.1/info.php  进行验证
```

 运行`redis`（`mysql`同理）

```shell
docker run --name myredis -v /opt/redis/data:/data -p 6379:6379 --restart=always -d redis
```

---

## 项目配置

以`Laravel`为例，主要是伪静态配置

项目地址：`/opt/www/myProject`

目录树：

```shell
.
├── README.md
├── app
│   └── ...
├── package.json
├── public
│   ├── index.php
│   └── ...
└── ...

```

创建配置文件：`touch /opt/nginx/conf.d/myProject.conf`

编辑并写入：

```shell
server {
  listen  80;
  server_name www.myProjectHost.com;
  root   /usr/share/nginx/html/myProject/public;
  
  location / {
   index index.html index.htm index.php;
   try_files $uri $uri/ /index.php?$query_string;			# 伪静态
   autoindex off;
  }
  location ~ \.php(.*)$ {
   root   /var/www/html/myProject/public;
   fastcgi_pass 172.17.0.3:9000;			# PHP IPAddress:port
   fastcgi_index index.php;
   fastcgi_split_path_info ^((?U).+\.php)(/?.+)$;
   fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
   fastcgi_param PATH_INFO $fastcgi_path_info;
   fastcgi_param PATH_TRANSLATED $document_root$fastcgi_path_info;
   include  fastcgi_params;
  }
}
```

修改`hosts`文件以便本地域名访问：

```shell
echo "127.0.0.1    www.myProjectHost.com" >> /etc/hosts
```

访问测试，根据页面报错再继续调整适配。

---

## Mysql

```shell
docker pull --platform linux/x86_64 mysql:5.7
```

m1芯片是arm架构，官方无镜像提供，需要加参数指定pull amd版镜像。

绑定目录：

- `/etc/mysql/conf.d/`
- `/var/lib/mysql/`

---

## 指定容器IP

默认网段是随机分配容器IP（按启动顺序），LNMP环境中Nginx会将php转发给PHP-fpm解析，这一点在配置中有体现，所以需要指定IP，避免重启时IP变化导致服务失效。（每次手动定位IP改配置也麻烦）

```shell
// Usage:  docker network create [OPTIONS] NETWORK
docker network create --subnet 172.18.0.0/16 LNMP
```

容器启动时添加命令：

```shell
docker run [OPTIONS] --network=LNMP --ip 172.18.0.x [CONTAINER:TAG]
```

