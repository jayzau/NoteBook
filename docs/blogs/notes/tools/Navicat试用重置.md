Navicat作为一款数据库可视化工具，为工作带来了很大的便利，但毕竟是商业化软件，需要付费使用。

### 目标

实现永久免费使用Navicat工具

### 环境和工具

Ubuntu 18.04.2 LTS

Python 3.6.8

Navicat

### 原理

Navicat通过配置文件`user.reg`来读取试用过期时间，所以只要更改文件内容就可以实现“永不过期”。

Navicat在启动时读取不到`user.reg`会重新生成一个，试用期也会重置为14天。

用户数据也在此文件中，所以只能更改部分与过期时间相关的数据，否则就相当于完全重装Navicat了。

### 代码

因为单次试用只有14天，手动更改太麻烦，找到规律完全可以用程序代替。

[code](https://github.com/jayzau/-whoops/blob/361ba22bd48b98579ecfd48b2caf57b902711bea/scripts/navicat.py)

最后将代码加入定时任务，例如每13天自动执行一次，就大功告成了！
