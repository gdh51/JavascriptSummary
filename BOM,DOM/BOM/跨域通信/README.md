# 跨域文档通信

-   [信道通信-MessageChannel&BroadcastChannel](./信道通信/README.md)

## 同源策略

同源策略/`SOP`(`Same-origin policy`)是一种约定，由`Netscape`公司`1995`年引入浏览器，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，浏览器很容易受到`XSS`、`CSFR`等攻击。所谓同源是指`协议+域名+端口`三者相同，即便两个不同的域名指向同一个`ip`地址，也非同源。

一个 URL 如：`https://www.lazy.com:8080` 其中协议为`https`,域名为`www.lazy.`，端口为`8080`

### 同源策略限制

1. `Cookie`、`LocalStorage` 和 `IndexDB` 无法读取
2. `DOM` 和 `js` 对象无法获得
3. 无法用`js`发送非同源的`ajax`请求 。更准确的说，`js`可以向非同源的服务器发请求，但是服务器返回的数据会被浏览器拦截。

## 必须跨域时的 解决方法

### 跨文档消息传递（XDM）异步

跨文档信息传递通过`postMessage()`这个`API`来实现。

`window.postMessage(data,origin)`：接受两个参数：第一个表示发送的消息，第二个参数为指明目标窗口的 URL————**协议+主机+端口号**，当某一项不匹配时都会被忽略; 当第二个参数为`*`时可以把消息发送给任何域。第一个参数最好只传入字符串，为了浏览器兼容性，也可以传递一个对象，会把该对象深度复制。当使用`*`时表示可以传给任意窗口，`/`时表示与当前窗口同源

`iframe`元素的`contentWindow`属性可以直接访问框架的`window`对象。

```js
let fw = document.getElementsByTagName('iframe')[0].contentWindow
```

当然，直接通过`frame`集合访问具体的框架也是直接访问的框架的`window`对象。如下

```js
var iframe1 = frames[0]
fw === iframe1 //true
```

通过该种方式发送的消息，目标窗口可以通过自身文档的`window`对象的`message`事件进行监听接收信息（**该事件需要在接收这个消息的文档中注册**）

#### message 事件

在该事件（`message`事件）中我们只需要关注它的 3 个属性：

-   `data`：作为`postMessage()`方法传入的第一个参数的字符串数据。如果数据是个对象，则会对传入的数据进行深度复制

-   `origin`：发送信息的文档所在的域。通常应先检查该属性来忽略未知源的信息。

-   `source`：发送信息的文档的`window`对象的代理。这个代理对象主要用于在发送上一条信息的窗口中调用`postMessage`方法。如果发送信息的窗口来自同一个域，则这个对象就是`window`。（这个属性大多数情况下只是`window`对象的代理，并非实际的`window`对象，不能通过它访问`window`对象的其他信息，所以只通过它调用`postMessage()`方法就可以了）

## 通过 jsonp 跨域

通过动态创建`script`标签并指定其`src`属性为要访问的`URL`进行跨域

当我们要请求一个跨域资源时只需要下面这样在`URL`后添加要调用的回调函数名

```js
let script = document.createElement('script')
script.type = 'text/javascript'
script.src = 'http://www.someURL.com:8080/name=lazy&callback=somefn'

document.head.appendChild(script)

function somefn(arg) {
    console.log(arg)
}
```

服务器在收到请求后，会解析`URL`,并根据`callback()`的值向请求方发送带有数据的函数如：

```js
somefn({ status: 'ok' })
```

该函数会在返回时立即执行。

缺点是该请求只能为`GET`请求

## 通过设置 document.domain 相同 使 iframe 跨域

这个方法*仅在*主域相同,子域不同的情况下可以使用

1. 父窗口为：`www.domain.com/a.html`;

    ```html
    <iframe src="http://www.domain.com/a.html"></iframe>
    <script>
        document.domain = 'domain.com'
    </script>
    ```

2. 子窗口为: `child.domain.com/b.html`;

    ```html
    <iframe src="http://child.domain.com/b.html"></iframe>
    <script>
        document.domain = 'domain.com'
    </script>
    ```

## 通过设置 location.hash + iframe 跨域

实现原理： a 欲与 b 跨域相互通信，通过中间页 c 来实现。 三个页面，不同域之间利用`iframe`的`location.hash`传值，相同域之间直接 js 访问来通信。

具体实现：`A域：a.html` -> `B域：b.html` -> `A域：c.html`，`a`与`b`不同域只能通过`hash`值单向通信，`b`与`c`也不同域也只能单向通信，但`c`与`a`同域，所以`c`可通过`parent.parent`访问`a`页面所有对象。

1. `a.html`为`http://www.domain1.com/a.html`

    ```html
    <iframe
        id="iframe"
        src="http://www.domain2.com/b.html"
        style="display:none;"
    ></iframe>
    <script>
        var iframe = document.getElementById('iframe')

        // 向b.html传hash值
        setTimeout(function () {
            iframe.src = iframe.src + '#user=admin'
        }, 1000)

        // 开放给同域c.html的回调方法
        function onCallback(res) {
            alert('data from c.html ---> ' + res)
        }
    </script>
    ```

2. `b.html`为`http://www.domain2.com/b.html` 与 a 跨域

    ```html
    <iframe
        id="iframe"
        src="http://www.domain1.com/c.html"
        style="display:none;"
    ></iframe>
    <script>
        var iframe = document.getElementById('iframe')

        // 监听a.html传来的hash值，再传给c.html
        window.onhashchange = function () {
            iframe.src = iframe.src + location.hash
        }
    </script>
    ```

3. `c.html`为`http://www.domain1.com/c.html`

    ```html
    <script>
        // 监听b.html传来的hash值
        window.onhashchange = function () {
            // 再通过操作同域a.html的js回调，将结果传回
            window.parent.parent.onCallback(
                'hello: ' + location.hash.replace('#user=', '')
            )
        }
    </script>
    ```

## 设置 window.name 来使 iframe 跨域

`window.name`属性的独特之处：`name`值在不同的页面（甚至不同域名）加载后依旧存在，并且可以支持非常长的`name`值（2MB）。

思路：通过将不同源的地址转换为同源地址来进行`window.name`传递

```js
var proxy = function (url, callback) {
    var state = 0
    var iframe = document.createElement('iframe')

    // 加载跨域页面
    iframe.src = url

    // onload事件会触发2次，第1次加载跨域页，并留存数据于window.name
    iframe.onload = function () {
        if (state === 1) {
            // 第2次onload(同域proxy页)成功后，读取同域window.name中数据
            callback(iframe.contentWindow.name)
            destoryFrame()
        } else if (state === 0) {
            // 第1次onload(跨域页)成功后，切换到同域代理页面
            iframe.contentWindow.location = 'http://www.domain1.com/proxy.html'
            state = 1
        }
    }

    document.body.appendChild(iframe)

    // 获取数据以后销毁这个iframe，释放内存；这也保证了安全（不被其他域frame js访问）
    function destoryFrame() {
        iframe.contentWindow.document.write('')
        iframe.contentWindow.close()
        document.body.removeChild(iframe)
    }
}

// 请求跨域b页面数据
proxy('http://www.domain2.com/b.html', function (data) {
    alert(data)
})
```

## 跨域资源共享（CORS）

普通跨域请求：只服务端设置`Access-Control-Allow-Origin`即可，前端无须设置，若要带`cookie`请求：前后端都需要设置。

需注意的是：由于同源策略的限制，所读取的`cookie`为*跨域请求接口所在域*的`cookie`，而非当前页。如果想实现当前页`cookie`的写入需要`nginx`反向代理中设置`proxy_cookie_domain` 或`NodeJs`中间件代理中`cookieDomainRewrite`参数的设置

目前，所有浏览器都支持该功能(`IE8+：IE8/9`需要使用`XDomainRequest`对象来支持`CORS`)，`CORS`也已经成为主流的跨域解决方案。

前端设置：

```js
//原生ajax
// 前端设置是否带cookie
xhr.withCredentials = true
```

服务器端设置：
若后端设置成功，前端浏览器控制台则不会出现跨域报错信息，反之，说明没设成功。

```js
//只介绍nodejs
//设置响应头
res.writeHead(200, {
    'Access-Control-Allow-Credentials': 'true', // 后端允许发送Cookie
    'Access-Control-Allow-Origin': 'http://www.domain1.com', // 允许访问的域（协议+域名+端口）
    /*
     * 此处设置的cookie还是domain2的而非domain1，因为后端也不能跨域写cookie(nginx反向代理可以实现)，
     * 但只要domain2中写入一次cookie认证，后面的跨域接口都能从domain2中获取cookie，从而实现所有的接口都能跨域访问
     */
    'Set-Cookie': 'l=a123456; Path=/; Domain=www.domain2.com; HttpOnly'
    // HttpOnly的作用是让js无法读取cookie
})
```

## nginx 代理跨域

### nginx 配置解决 iconfont 跨域

浏览器跨域访问 js、css、img 等常规静态资源被同源策略许可，但 iconfont 字体文件(eot|otf|ttf|woff|svg)例外，此时可在 nginx 的静态资源服务器中加入以下配置。

```js
location / {
  add_header Access-Control-Allow-Origin *;
}
```

### nginx 反向代理接口跨域

跨域原理： 同源策略是**浏览器的安全策略**，不是 HTTP 协议的一部分。服务器端调用 HTTP 接口只是使用 HTTP 协议，不会执行 JS 脚本，不需要同源策略，也就不存在跨越问题。

实现思路：通过 nginx 配置一个代理服务器（域名与`domain1`相同，端口不同）做跳板机，反向代理访问`domain2`接口，并且可以顺便修改`cookie`中`domain`信息，方便当前域`cookie`写入，实现跨域登录。

nginx 具体配置：

```php
#proxy服务器
server {
    listen       81;
    server_name  www.domain1.com;

    location / {
        proxy_pass   http://www.domain2.com:8080;  #反向代理
        proxy_cookie_domain www.domain2.com www.domain1.com; #修改cookie里域名
        index  index.html index.htm;

        # 当用webpack-dev-server等中间件代理接口访问nignx时，此时无浏览器参与，故没有同源限制，下面的跨域配置可不启用
        add_header Access-Control-Allow-Origin http://www.domain1.com;  #当前端只跨域不带cookie时，可为*
        add_header Access-Control-Allow-Credentials true;
    }
}
```

## Nodejs 中间件代理跨域

node 中间件实现跨域代理，原理大致与 nginx 相同，都是通过启一个代理服务器，实现数据的转发，也可以通过设置`cookieDomainRewrite`参数修改响应头中`cookie`中域名，实现当前域的`cookie`写入，方便接口登录认证。

```js
var express = require('express')
var proxy = require('http-proxy-middleware')
var app = express()

app.use(
    '/',
    proxy({
        // 代理跨域目标接口
        target: 'http://www.domain2.com:8080',
        changeOrigin: true,

        // 修改响应头信息，实现跨域并允许带cookie
        onProxyRes: function (proxyRes, req, res) {
            res.header('Access-Control-Allow-Origin', 'http://www.domain1.com')
            res.header('Access-Control-Allow-Credentials', 'true')
        },

        // 修改响应信息中的cookie域名
        cookieDomainRewrite: 'www.domain1.com' // 可以为false，表示不修改
    })
)

app.listen(3000)
console.log('Proxy server is listen at port 3000...')
```

## WebSocket 协议跨域

WebSocket protocol 是 HTML5 一种新的协议。它实现了浏览器与服务器全双工通信，同时允许跨域通讯，是 server push 技术的一种很好的实现。
原生 WebSocket API 使用起来不太方便，我们使用`Socket.io`，它很好地封装了 webSocket 接口，提供了更简单、灵活的接口，也对不支持 webSocket 的浏览器提供了向下兼容。这里就不在介绍

[参考](https://segmentfault.com/a/1190000011145364)

## 跨站脚本（XSS）

如果 web 页面动态生成文档内容，并且这些文档内容是基于用户提交的数据的，而没有通过从中移除任何嵌入的 HTML 标签来消毒，那么这个 web 页面很容易遭到跨站脚本攻击。

通常防止 XSS 攻击的方式是，在使用任何不可信的数据来动态创建文档内容之前，从中移除 HTML 标签。如：

```js
str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
```

对 HTML 标签进行转义和过滤删除。

IE8 中有一个`toStaticHTML`方法，来移除`<script>`标签而不修改不可执行的 HTML。
HTML5 为`iframe`定义了一个`sandbox`属性，实现后运行显示不可信的内容，并自动禁止用脚本。
[更多浏览器安全问题](../浏览器安全问题/README.md)
