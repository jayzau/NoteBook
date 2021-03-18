# Gin Web Framework

[快速入门](https://gin-gonic.com/zh-cn/docs/quickstart/)


## 安装

`go get -u github.com/gin-gonic/gin`

```shell
gnutls_handshake() failed: The TLS connection was non-properly terminated.
...
```

安装受挫...

[上代理](https://goproxy.io/zh/)

```shell
export GOPROXY=https://goproxy.io,direct
```

再次受挫...

手动克隆代码至对应目录：

| 报错                                                | 克隆目录                                 | 仓库链接                                                     |
| --------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| cannot find package "golang.org/x/crypto/*?"        | `$GOPATH/src/golang.org/x/crypto`        | [crypto](https://github.com/golang/crypto)                   |
| cannot find package "golang.org/x/sys/*?"           | `$GOPATH/src/golang.org/x/sys`           | [sys](https://github.com/golang/sys)                         |
| cannot find package "google.golang.org/protobuf/*?" | `$GOPATH/src/google.golang.org/protobuf` | [protobuf-go](https://github.com/protocolbuffers/protobuf-go) |

!`protobuf-go`需注意文件名：`mv protobuf-go/ protobuf/`

### 运行环境测试

```go
// $GOPATH/src/main.go
package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()
    // gin.H 是 map[string]interface{} 的一种快捷方式
    // type H map[string]interface{}
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
```

## 基础

### 模板使用

Goland 模板高亮提示设置：

![设置](/images/go/GinWeb-1/template.jpg)

模板的渲染：使用`LoadHTMLGlob`或`LoadHTMLFiles`。

目录结构如下：

```shell
.
├── main.go
└── templates
    ├── subTemplate
    │   └── subTemp1.tmpl
    └── temp1.tmpl
```

- LoadHTMLGlob

  - `router.LoadHTMLGlob("templates/*")`

    报错：`panic: read templates/subTemplate: is a directory`

    `*`只能对应文件，而不是文件夹。

  - `router.LoadHTMLGlob("templates/**/*")`

    报错：`html/template: "temp1.tmpl" is undefined`

    `**`匹配的文件夹，导致`tmpl`文件无法匹配。

  综上，使用`LoadHTMLGlob`时必须严格遵守通配符`*/**`的规则。

- LoadHTMLFiles

  - `router.LoadHTMLFiles("templates/temp1.tmpl", "templates/subTemplate/subTemp1.tmpl")`

    能够正常加载所有tmpl，缺点就是书写过于复杂。

`LoadHTMLGlob`和`LoadHTMLFiles`在代码中多次使用时，以最后一次为准。

---

使用不同目录下名称相同的模板：

```shell
.
├── main.go
└── templates
    ├── subTemp1
    │   └── index.tmpl
    └── subTemp2
        └── index.tmpl
```

- subTemp1

  ```html
  {{ define "subTemp1/index.tmpl" }}
  <html lang="en">
      <p>
          subTemp1/index.tmpl 为 context.HTML 方法传入的 name 参数。
      </p>
  </html>
  {{ end }}
  
  ```

- subTemp2

  ```html
  {{ define "subTemp1/index.tmpl" }}
  <html lang="en">
      <p>
          subTemp2/index.tmpl 为 context.HTML 方法传入的 name 参数。
      </p>
  </html>
  {{ end }}
  ```

---

自定义分隔符：

```go
router.Delims("{[{", "}]}")		// 默认 {{ }}
```

---

过滤器：模板内可直接引用渲染脚本里面的方法。

### JSONP

使用 [JSONP](<https://www.runoob.com/json/json-jsonp.html>) 向不同域的服务器请求数据。如果查询参数存在回调，则将回调添加到响应体中。

```go
router.GET("/JSONP", func(context *gin.Context) {
    data := map[string]interface{}{
        "foo": "bar",
    }
    context.JSONP(http.StatusOK, data)
})
// http://0.0.0.0:8080/JSONP 					{"foo":"bar"}
// http://0.0.0.0:8080/JSONP?callback=func		func({"foo":"bar"});
```

### PureJSON

Go 1.6 +

简单对比：

- `c.JSON(200, gin.H{"html": "<b>Hello, world!</b>",})`

  resp: `{"html":"\u003cb\u003eHello, world!\u003c/b\u003e"}`

- `c.PureJSON(200, gin.H{"html": "<b>Hello, world!</b>",})`

  resp: `{"html":"<b>Hello, world!</b>"}`

### ？SecureJSON

防止json劫持。不懂。

### 表单和查询参数

- 表单验证：

  ```go
  type LoginForm struct {
  	User     string `form:"user" binding:"required"`
  	Password string `form:"password" binding:"required"`
  }
  
  /*
  ...
  */
  router.POST("/login", func(context *gin.Context) {
      var form LoginForm
      if context.ShouldBind(&form) == nil {
          if form.User == "jay" && form.Password == "chou" {
              context.JSON(http.StatusOK, gin.H{"status": "success!"})
          }
      }
      context.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
  })
  // ShouldBind -> binding.Default 将自动选择合适的绑定
  ```

- 自定义表单验证

  ```go
  var myValidator validator.Func = func(fl validator.FieldLevel) bool {}
  
  type myForm struct {
      Text	string `form:"text" binding:"required,myValidator"`
  }
  ```

- 默认值：

  ```go
  // 查询参数
  id := context.Query("id")
  page := context.DefaultQuery("page", "0")
  // 表单
  message := context.PostForm("message")
  nick := context.DefaultPostForm("nick", "anonymous")
  ```

### ？将`request body`绑定到不同的结构体

后续跟随实战学习。

[模型绑定和验证](https://gin-gonic.com/zh-cn/docs/examples/binding-and-validation/)

[绑定 HTML 复选框](https://gin-gonic.com/zh-cn/docs/examples/bind-html-checkbox/)

- 绑定URI

  ```go
  type Person struct {
  	ID   string `uri:"id" binding:"required,uuid"`
  	Name string `uri:"name" binding:"required"`
  }
  
  // curl -v localhost:8088/thinkerou/987fbc97-4bed-5078-9f07-9141ba07c9f3
  router.GET("/:name/:id", func(c *gin.Context) {
      var person Person
      if err := c.ShouldBindUri(&person); err != nil {
          c.JSON(400, gin.H{"msg": err})
          return
      }
      c.JSON(200, gin.H{"name": person.Name, "uuid": person.ID})
  })
  ```

  

### 文件上传

- 文件大小限制：`router.MaxMultipartMemory = 8 << 20  // 8 MiB  默认 32 MiB`

- 单文件：`file, err := c.FormFile("file")`

- 多文件：

  ```go
  form, _ := c.MultipartForm()
  files := form.File["fileKey"]  // {[]*mime/multipart.FileHeader}
  ```

- 文件保存：`c.SaveUploadedFile(file, dst)`

实际测试下来文件大小限制并未生效，大于8MiB的文件依然能够正常上传保存。

![chromedriver](/images/go/GinWeb-1/fileSize.jpg)

### 从 reader 读取数据（文件下载）

存在的意义只能想到文件下载。

```go
router.GET("/someDataFromReader", func(c *gin.Context) {
    response, err := http.Get("https://avatars.githubusercontent.com/u/42144949")
    if err != nil || response.StatusCode != http.StatusOK {
        c.Status(http.StatusServiceUnavailable)
        return
    }

    reader := response.Body
    contentLength := response.ContentLength
    contentType := response.Header.Get("Content-Type")

    extraHeaders := map[string]string{
        "Content-Disposition": `attachment; filename="gopher.png"`,
    }

    c.DataFromReader(http.StatusOK, contentLength, contentType, reader, extraHeaders)
})
```

### 优雅地重启或停止

[你想优雅地重启或停止 web 服务器吗？](https://gin-gonic.com/zh-cn/docs/examples/graceful-restart-or-stop/)

没体会到优雅在哪，不过`context.WithTimeout`和`signal.Notify`是个好东西。

### BasicAuth 中间件

```go
// 模拟的用户数据
var secrets = gin.H{
	"foo":    gin.H{"email": "foo@bar.com", "phone": "123433"},
	"austin": gin.H{"email": "austin@example.com", "phone": "666"},
	"lena":   gin.H{"email": "lena@guapa.com", "phone": "523443"},
}

// 路由组使用 gin.BasicAuth() 中间件
// gin.Accounts 是 map[string]string 的一种快捷方式
authorized := r.Group("/admin", gin.BasicAuth(gin.Accounts{
    "foo":    "bar",		// 账号密码
    "austin": "1234",
    "lena":   "hello2",
    "manu":   "4321",
}))

// /admin/secrets 端点
// 触发 "localhost:8080/admin/secrets
authorized.GET("/secrets", func(c *gin.Context) {
    // 获取用户，它是由 BasicAuth 中间件设置的
    user := c.MustGet(gin.AuthUserKey).(string)  // 断言 string 类型
    if secret, ok := secrets[user]; ok {
        c.JSON(http.StatusOK, gin.H{"user": user, "secret": secret})
    } else {
        c.JSON(http.StatusOK, gin.H{"user": user, "secret": "NO SECRET :("})
    }
})
```

测试用，清空浏览器登录信息，重启即可：`Chrome：//restart`

### 中间件

- 全局中间件

  ```go
  // 默认使用的 gin.Default() 已加载了两个中间件 Logger/Recovery
  /*
  func Default() *Engine {
  	debugPrintWARNINGDefault()
  	engine := New()
  	engine.Use(Logger(), Recovery())
  	return engine
  }
  */
  // 全局注册
  r := gin.New()  // 没有任何中间件的路由
  r.Use(gin.Logger())
  ```

- 路由中间件

  ```go
  r.GET("/hander", Hander(), func(c *gin.Context) {})
  /* 
  实际上之前写的 func 部分也可以看做是中间件，以 .GET 方法源码为例：
  func (group *RouterGroup) GET(relativePath string, handlers ...HandlerFunc) IRoutes {
  	return group.handle(http.MethodGet, relativePath, handlers)
  }
  除了路径参数外，可变参数部分类型均为 HandlerFunc 。如：
  func BasicAuth(accounts Accounts) HandlerFunc {
  	return BasicAuthForRealm(accounts, "")
  }
  */
  ```

- 路由组

  ```go
  // 路由组注册
  authorized := r.Group("/auth")
  authorized.Use(AuthRequired())
  {
      authorized.POST("/login", loginEndpoint)
      // 路由组嵌套
      testing := authorized.Group("testing")
      testing.GET("/analytics", analyticsEndpoint)
  }
  ```

- 自定义中间件

  ```go
  func Logger() gin.HandlerFunc {
  	return func(c *gin.Context) {
  		t := time.Now()
  		// 设置 example 变量
  		c.Set("example", "12345")
  		// 请求前
  		c.Next()
  		// 请求后
  		latency := time.Since(t)
  		log.Print(latency)
  		// 获取发送的 status
  		status := c.Writer.Status()
  		log.Println(status)
  	}
  }
  ```

### 中间件中使用 Goroutine

当在中间件或 handler 中启动新的 Goroutine 时，**不能**使用原始的上下文，必须使用只读副本。

```go
r.GET("/long_async", func(c *gin.Context) {
    // 创建在 goroutine 中使用的副本
    cCp := c.Copy()
    go func() {
        // 用 time.Sleep() 模拟一个长任务。
        time.Sleep(5 * time.Second)

        // 请注意您使用的是复制的上下文 "cCp"，这一点很重要
        log.Println("Done! in path " + cCp.Request.URL.Path)
    }()
})
```

### 日志记录

```go
// 禁用控制台颜色，将日志写入文件时不需要控制台颜色。
gin.DisableConsoleColor()
// 强制日志颜色化
// gin.ForceConsoleColor()

// 记录到文件。
f, _ := os.Create("./gin.log")
gin.DefaultWriter = io.MultiWriter(f)

// 如果需要同时将日志写入文件和控制台，请使用以下代码。
// gin.DefaultWriter = io.MultiWriter(f, os.Stdout)
/* 
package io
func MultiWriter(writers ...Writer) Writer
*/
```

### 映射查询字符串或表单参数

官方文档示例：

```go
/*
POST /post?ids[a]=1234&ids[b]=hello HTTP/1.1
Content-Type: application/x-www-form-urlencoded

names[first]=thinkerou&names[second]=tianou
*/
func main() {
	router := gin.Default()

	router.POST("/post", func(c *gin.Context) {
		ids := c.QueryMap("ids")
		names := c.PostFormMap("names")

		fmt.Printf("ids: %v; names: %v", ids, names)
	})
	router.Run(":8080")
}
// ids: map[b:hello a:1234], names: map[second:tianou first:thinkerou]
```

生活中还没碰见过这类用法，感觉更常用的应该是`Array`方法：

```go
/*
POST /post?ids=1234&ids=hello HTTP/1.1
Content-Type: application/x-www-form-urlencoded
*/
ids := c.QueryArray("ids")		// Form: PostFormArray
fmt.Printf("ids: %v\n", ids)	// ids: [1234 hello]
```

### 自定义 HTTP 配置

最终都指向`http.Server`，具体参数看源码。

### Cookie

```go
// get
cookie, err := c.Cookie("gin_cookie")
/* set
SetCookie(name, value string, maxAge int, path, domain string, secure, httpOnly bool)
*/ 
c.SetCookie("gin_cookie", "test", 3600, "/", "localhost", false, true)
```

### 路由参数

除了利用结构体绑定方式获取值以外，常规使用方法：

```go
// 此 handler 将匹配 /user/john 但不会匹配 /user/ 或者 /user
router.GET("/user/:name", func(c *gin.Context) {
    name := c.Param("name")
    c.String(http.StatusOK, "Hello %s", name)
})

// 此 handler 将匹配 /user/john/ 和 /user/john/send
// 如果没有其他路由匹配 /user/john，它将重定向到 /user/john/
router.GET("/user/:name/*action", func(c *gin.Context) {
    name := c.Param("name")
    action := c.Param("action")
    message := name + " is " + action
    c.String(http.StatusOK, message)
})
```

### 重定向

常规：

```go
// Redirect returns a HTTP redirect to the specific location.
func (c *Context) Redirect(code int, location string) {
	c.Render(-1, render.Redirect{
		Code:     code,
		Location: location,
		Request:  c.Request,
	})
}
```

路由重定向：

```go
r.GET("/test", func(c *gin.Context) {
    c.Request.URL.Path = "/test2"
    r.HandleContext(c)
})
```

### 静态文件服务

```go
func main() {
	router := gin.Default()
    // 内里不够深厚，看不出来 Static 和 StaticFS 方法的区别
	router.Static("/assets", "./assets")
	router.StaticFS("/more_static", http.Dir("my_file_system"))
    // 单文件用 StaticFile
	router.StaticFile("/favicon.ico", "./resources/favicon.ico")

	// 监听并在 0.0.0.0:8080 上启动服务
	router.Run(":8080")
}
```

