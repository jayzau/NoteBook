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

### 表单

表单验证：

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

