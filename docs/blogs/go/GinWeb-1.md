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
