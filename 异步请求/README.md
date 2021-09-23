# 异步编程

## 脚本化 HTTP

`Comet`：服务器发起通信并异步发送消息到客户端。(服务器推送)
`Ajax`：客户端从服务请求数据

### XMLHttpRequest

IE7 之前创建的 XHR 对象要使用`MSXML`库中的一个`ActiveX`对象实现。且可能会遇到三个版本，即`MSXML2.XMLHttp`、`MSXML2.XMLHttp.3.0`和`MXSML2.XMLHttp.6.0`（最稳定版本）。

在 IE8 之后与其他主流浏览器都支持原生的 XHR 对象。第一步通过如下创建 XHR 对象：

```js
var xhr = new XMLHttpRequest()
```

在使用 XHR 对象时，第一步是调用`xhr.open()`，它接受 3 个参数：要发送的请求的类型（`get`、`post`等）、请求的`URL`和表示是否异步发送请求的布尔值。例如：

```js
xhr.open('get', 'example.php', false)
```

第二个参数的 URL 是相对于执行代码的当前页面（也可以使用绝对路径，也可以利用`base`元素设置相对路径的基准）。使用`xhr.open()`方法时**并未发送请求**。

> 只能向同一个域中使用相同端口和协议的 URL 发送请求，否则会引发安全错误

第三个参数表示是否异步发送，当为`false`表示同步发送，此时 _Javascript_ 代码会等到服务器响应之后再继续执行。此时`xhr.send()`方法将会阻塞到请求完成，这种情况下下需要使用事件处理程序：一旦`xhr.send()`返回，仅需要检查 XML 对象的`xhr.status`与`xhr.responseText`属性即可。异步响应时，发送请求后`xhr.send()`方法立即返回`xhr`对象实例。

第二步要发送特定的请求，必须调用`xhr.send()`方法：接受一个参数，要作为请求主体发送的数据。如果不需要通过请求主体发送数据，则必须传入`null`（因为在不传入时有些浏览器会报错，兼容）。

```js
xhr.send(null)
```

调用`xhr.send()`方法后，请求就会被发送到服务器。

服务器在收到响应后，相应的数据会自动填充 XHR 对象的属性：

-   `response`：作为响应的内容的对象
-   `responseText`：作为响应主体被返回的文本。
-   `responseXML`：如果响应的内容类型为`text/xml`或`application/xml`，这个属性中将保存包含着响应数据的 XML DOM 文档。
-   `status`：响应的 HTTP 状态。
-   `statusText`：HTTP 状态的说明。

在接收到响应后，第一步是检查`xhr.status`属性，当该属性的状态码为 200 时表示响应成功; 当状态码为 304 时表示请求的资源并没有被修改，可以直接使用浏览器中的缓存版本。(详情请自行学习 http 协议)

#### xhr.readyState 请求/响应状态

XHR 对象存在一个`xhr.readyState`属性表示请求/响应过程的当前活动阶段，取值如下：

-   0：未初始化。尚未调用`xhr.open()`方法
-   1：启动。已调用`xhr.open()`方法，但尚未调用`xhr.send()`方法。
-   2：发送。已调用`xhr.send()`方法，但尚未接受到响应。
-   3：接收。已接收到部分响应数据。
-   4：完成。已接收到全部响应数据，而且已经可以在客户端使用了。

每当该值发生一次变换，都会触发一次`readystatechange`事件。通常我们只需关注第 4 阶段，且必须在调用`xhr.open()`方法*之前*指定`onreadystatechange`事件处理程序以确保跨浏览器的*兼容性*。

```js
xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            //成功响应时做的事
        } else {
            //失败响应时做的事
        }
    }
}
```

#### 返回数据的位置

无论内容的类型是什么，响应主体的内容都会保存到`xhr.responseText`属性中,且为字符串文本；对于非 XML 数据而言，`xhr.responseXML`属性的值将为`null`。

#### 取消请求

在接收响应之前可以调用`xhr.abort()`方法来取消异步请求。

```js
xhr.abort()
```

调用该方法后，XHR 对象会停止触发事件，而且*不再允许*访问任何和响应有关的对象属性。

在终止请求后，还应该对 XHR 对象进行**解引用操作**。由于防止内存泄漏；不建议重用 XHR 对象。

浏览器在`XMLHttpRequest`类上定义了它们的 HTTP API。这个类的每个实例都表示一个独立的请求/响应对。

一个 HTTP 请求由 4 部分组成：

-   HTTP 请求方法或动作
-   正在请求的 URL
-   一个可选的请求头合集，其中可能包括身份验证性信息
-   一个可选的请求主体

服务器返回的 HTTP 响应包含 3 部分：

-   一个数字和文字组成的状态码，用来显示请求成功和失败
-   一个响应头合集
-   响应主体
    `XMLHttpRequest`允许把`DELETE、HEAD、OPTIONS、PUT`作为`open()`的第一个参数。

Web 服务器通常使用二进制数据响应 HTTP 请求。

> 服务器响应的正常解码是假设服务器为这个响应发送了`Content-Type`头和正确的 MIME 类型。如果服务器发送 XML 文档当没有设置适当的 MIME 类型，那么 XML 对象将不会解析它且不会设置设置为响应的`responseXML`属性。

XML2 标准中定义了`xhr.overrideMimeType()`来解决这个问题，传入一个表示 MIME 类型的字符串参数，将会把响应作为该类型来返回。

#### HTTP 头部信息

XHR 对象提供了操作 **请求头部** 和 **响应头部** 的方法，默认情况下，在发送 XHR 请求的同时，还会发送下列头部信息：

-   `Accept`：浏览器能够处理的内容类型。
-   `Accept-Charset`：浏览器能够显示的字符集。
-   `Accept-Encoding`：浏览器能够处理的压缩编码。
-   `Accept-Language`：浏览器当前设置的语言。
-   `Connection`：浏览器与服务器之间连接的类型。
-   `Cookie`：当前页面设置的任何`Cookie`。
-   `Host`：发出请求的页面所在的域。
-   `Referer`：发出请求的页面的 URI。
-   `User-Agent`：浏览器的用户代理字符串。

##### 自定义请求头部

`xhr.setRequestHeader()`：可以设置自定义的请求头部信息，接收两个参数：头部字段的名称和头部字段的值。多次调用不会取代新值，但不能指定`Content-Length`、`Date`、`Referer`或`User-Agent`头，还有以下头：（必须在调用`xhr.open()`方法之后且调用`xhr.send()`方法前调用）
Accept-Charset | Content-Transfer-Encoding | TE
--------------- | ------------------------- | :----------------
Accept-Encoding | Date | Trailer
Connertion | Expect | Transfer-Encoding
Content-Length | Host | Upgrade
Cookie | Keep-Alive | User-Agent
Cookie2 | Referer | Via

我们能为请求指定`Authorization`头，但通常不需要。如果请求一个受密码保护的 URL，把用户名和密码作为第四个和第五个参数传递给`xhr.open()`方法，XML 对象将会自动设置合适的头部。

##### 查询响应头部信息

`xhr.getResponseHeader()`： 接受一个参数头部字段的名称，可以取得相应的响应头部信息。
`xhr.getAllResponseHeaders()`：取得一个包含所有响应头部信息的长字符串。
（会自动过滤掉`cookie`头，因为 HTTP 会自动处理`cookie`）

#### 表单的提交

在传递给后端的表单数据中都是利用&连接为一个个键值对，并对每个名字和值执行 URL 编码（使用 16 进制转义码替换特殊字符）如：`a=1&&b=2&&c=3`

表单数据编码格式有一个正式的 MIME 类型：`application/x-www-form-urlencoded`

当使用 POST 方法提交表单数据时(不上传文件时)，必须设置`Content-Type`请求头为该值

当发送的为 XML 文档或字符串但没指定请求头时，通常会自动设置为`text/html`或`text/plain`

##### 利用表单上传文件

通过`<input>`元素选择文件时，表单将在它产生的 POST 请求主体中发送文件内容。XHR2 标准允许通过`send()`方法传入`File`对象来实现上传文件。

在支持`File`对象的浏览器中，每个`<input type="file">`元素有一个`files`属性，它是`File`对象中的类数组对象。拖放 API 运行通过拖放事件的`dataTransfer.files`属性来访问用那个户拖放到元素上的文件。

文件类型是更通用的二进制大对象（Blob）类型中的一个子类型。XHR2 允许向`send()`方法传入任何 Blob 对象。如果没有显式设置`Content-Type`头，这个 Blob 对象的`type`属性用于设置待上传的`Content-Type`头

当 HTML 表单同时包含文件上传元素和其他元素时，浏览器必须使用`multipart/form-data`的特殊`Content-Type`来用 POST 方法提交表单。

这种编码包括使用长边界字符串把请求主体分离成多个部分。

XHR2 定义了`FormData`对象，它容易实现多部分请求主体(即任何通过表单上传数据的方式都行)。将该对象传入`send()`方法中作为参数，`send()`会对请求定义合适的边界字符串和设置`Content-Type`头

#### GET 请求

用于向服务器查询某些信息，必要时可以将查询字符串参数追加到 URL 的末尾。
查询字符串中的每一个参数的名称和值都必须使用`encodeURIComponent()`进行编码，之后才能放到 URL 的末尾，且所有键=值对都必须由和号 &`分隔，如下：

```js
xhr.open('get', 'example.php?name1=value1&name2=value2', true)
```

#### POST 请求

用于向服务器发送应该被保存的数据。利用`xhr.send()`方法传入某些数据。可以直接传入 XML DOM 文档，文档会自动序列化后作为请求主体被提交到服务器。

默认情况下 POST 请求和提交 Web 表单的请求会不一样，但我们可以通过 XHR 对象来模仿表单提交：

1. 设置`Content-type`头部信息为`application/x-www-form-urlencoded`，即提交表单时的内容类型。
2. 以适当的格式创建一个字符串（以查询字符串的形式）

### XMLHTTPRequest 2 级

#### FormData 对象

`FormData对象`：一个序列化表单以及创建与表单格式相同的数据的对象。

创建一个`FormData`对象，并添加一个名为`name`值为`Nicholas`的键值对。

```js
var data = new FormData()
data.append('name', 'Nicholas')
```

##### 添加表单数据

可以使用两种方式向`FormData`对象传入表单值：

1. 使用`FormData.prototype.append()`方法添加单个键值对。

    `FormData.prototype.append()`：接收两个参数，键与值，分别对应表单字段的名字和字段中包含的值。

2. 方法是直接在`FormData`构造函数传入表单元素。

    ```js
    var data2 = new FormData(document.forms[0])
    ```

创建该对象后直接传入`xhr.send()`方法做参数即可(_不必配置适当的头部信息_)。

#### 超时设定

XHR 对象有一个`timeout`属性，表示请求在等待响应多少毫秒后就终止。在给`timeout`属性设置一个数值后表示在多少毫秒后如果没有接收到响应就终止并触发`timeout`事件。

```js
xhr.open('get', 'example', true)
xhr.timeout = 10000
xhr.ontimeout = function () {
    //超时后的执行一些操作
}
xhr.send(null)
```

在 XHR1.0 中, 我们可以通过定时器 + `xhr.abort()`方法来模拟超时设置。

```js
// 10秒后进行超时操作
setTimout(() => {
    xhr.abort()
}, 10000)
```

#### 重写响应的 MIME 类型

`xhr.overrideMimeType()`：重写 XHR 响应的 MIME 类型。调用该方法必须在`xhr.send()`方法之前。

适用于这种情况：（服务器返回的 MIME 类型是`text/plain`，但数据中实际包含的是 XML，根据 MIME 类型，即使数据是 XML，但`xhr.responseXML`属性中仍然是`null`。）

### 进度事件

-   `loadstart`：在接收到响应数据的第一个字节时触发。

-   `progress`：在接收响应期间持续不断的触发。（必须在`xhr.open()`方法之前添加事件处理程序）
    该事件处理程序会接收到一个`event`对象，其`target`属性是 XHR 对象，该事件对象还包含 了三个额外的属性：

    -   `lengthComputable`：表示进度信息是否可用的布尔值
    -   `position`：表示已经接收的字节数
    -   `totalSize`：表示根据`Content-Length`响应头部确定的预期字节数。

-   `error`：在请求发生错误时触发。

-   `abort`：在因为调用`xhr.abort()`方法而终止连接时触发。

-   `load`：在接收到完整的响应数据时触发。（不一定成功）

    > 该事件处理程序会接收一个`event`对象，其`target`属性指向 XHR 对象的实例。
    > 事实上**只要浏览器接收到服务器的响应**，不管状态如何，**都会触发`load`事件**，所以必须检查`status`属性。

-   `loadend`：在通信完成或者触发`error`、`abort`或`load`事件后触发。

**每个请求都从触发`loadstart`事件开始，接下来是一个或多个`progress`事件，然后触发`error`、`abort`、`load`事件中的一个，最后触发`loadend`事件结束**。

### 跨资源共享

*CORS（Cross-Origin Resource Sharing 跨源资源共享）*定义了在必须访问跨源资源时，浏览器和服务器应该如何沟通。

在发送一个简单的 GET 或 POST 请求时，它没有自定义的头部，而主体内容是`text/plain`。在发送该请求时，需要给它附加一个额外的`Origin`头部，其中包含请求页面的源信息（协议、域名和端口），以便服务器决定是否响应。例如：
`Origin:http://www.nczonline.net`

如果服务器接收这个请求，就在`Access-Control-Allow-Origin`头部中回发相同的源信息(如果是公共资源，可以回发`*`)。例如：
`Access-Control-Allow-Origin：http://www.nczonline.net`

**注意请求和响应都不会包含`cookie`信息**。

#### IE8-IE10 对 CORS 的实现

IE8-IE10 中引入了 XDR 类型，与 XHR 类似但有以下不同：

-   `cookie`不会随请求发送，也不会随响应返回
-   只能设置请求头部信息中的`Content-Type`字段
-   不能访问响应头部信息
-   只支持 GET 和 POST 请求

这些变换使 CSRF 和 XSS 的问题得到了缓解，被请求的资源可以根据它认为合适的任意数据来决定是否设置`Access-Control-Allow-Origin`头部

```js
var xdr = new XDomainRequest()
xdr.onload = function () {
    console.log(xdr)
}
xdr.open('get', 'emaple.php')
xdr.send(null)
```

同 xhr 类似，但 xdr 的`xdr.open()`方法只有两个参数，因为 XDR 请求都是异步执行的。

在请求返回后会触发`load`事件，响应的数据也会保存在`xdr.responseText`属性中。只要能响应原始文本就会触发`onload`事件所以无法确认响应状态; 但如果失败就会触发`error`事件，所以`error`事件是唯一能够确定的请求。

当发送 POST 请求时，XDR 对象提供了一个`xdr.contentType`属性表示发送数据的格式。

#### IE10+及其他主流浏览器对 CORS 的实现

只需要在`xhr.open()`方法中传入**绝对 URL**即可。但有以下方面的限制：

-   不能使用`xhr.setRequestHeader()`设置自定义头部
-   不能发送和接收`cookie`
-   调用`xhr.getAllResponseHeaders()`总会返回空字符串

所以**尽量在访问本地资源时使用相对 URL，访问远程资源时再使用绝对 URL 以消除歧义，避免出现限制访问头部或本地 cookie 信息等问题**。

#### Preflighted Requests

CROS 通过一个叫做`Preflighted Requests`的透明服务器验证机制支持开发人员使用自定义的头部、`GET`和`POST`之外的方法，以及不同类型的主体内容。预检请求首先需要向另外一个域名的资源发送一个 `HTTP OPTIONS` 请求头，其目的就是为了判断实际发送的请求是否是安全的。

下面的 2 种情况需要进行预检：

1. 简单请求，比如使用`Content-Type`为 `application/xml` 或 `text/xml` 的 POST 请求；
2. 中设置自定义头，比如 `X-JSON`、`X-MENGXIANHUI` 等。

使用`OPTIONS`方法发送下列头部时，会向服务器发送一个`Preflight`请求。

-   `Origin`：与简单的请求相同
-   `Access-Control-Requests-Method`：请求自身使用的方法。
-   `Access-Control-Requests-Headers`：（可选）自定义的头部信息，多个头部以逗号分隔。

例如发送一个带有自定义头部 NCZ 的使用 POST 方法的请求：

```js
Origin：http://www.nczonline.net
Access-Control-Requests-Method:POST
Access-Control-Requests-Headers:NCZ
```

当服务器收到后在响应中发送如下头部与浏览器进行沟通：

```js
Access-Control-Requests-Origin：http://www.nczonline.net
Access-Control-Requests-Method:POST,GET
Access-Control-Requests-Headers:NCZ
Access-Control-Max-Age:1728000
```

Preflight 请求结束后，结果将按照响应中指定的时间缓存起来。而为此付出的**代价只是第一次发送这种请求时会多一次 HTTP 请求**。（IE11 及主流浏览器支持）

#### 带凭据的请求

默认情况跨源请求不提供凭据（`cookie`、HTTP 认证及客户端 SSL 证明等）且任何作为跨域响应来接收的`cookie`都会丢失。

通过将`xhr.withCredentials`属性设置为`true`，可以指定某个请求应该发送凭据。相应的服务器端应该设置下面的 HTTP 头部来响应：

```js
Access-Control-Allow-Credentials：true
```

如果发送带凭据的请求而服务器没有包含这个头部则浏览器就不会把响应交给 Javascript，于是`xhr.responseText`将为空字符串，且`xhr.status`值为 0，且会调用`onerror`事件处理程序。

服务器可以在`Preflight`响应中发送这个 HTTP 头部，表示允许源发送带凭据的请求。
（IE11 及主流浏览器支持）

## Comet

[详情](./轮询/Comet)

### HTTP 流

在页面的生命周期内只使用一个`HTTP`连接。浏览器向服务器发送一个请求，而*服务器保持连接打开，然后周期性地向浏览器发送数据*。

在主流浏览器中通过监听`xhr.readystatechange`事件及检测`xhr.readyState`的值是否为 3 就可以利用 XHR 对象实现 HTTP 流。

随着浏览器不断接收数据，`xhr.readyState`的值会周期性的变为 3，且此时`xhr.readystatechange`属性中就会保存接收到的所有数据，此时在比较之前接收到的数据，决定*从什么位置开始取得最新的数据*即可。

## Fetch API

首先说明 IE 在所有版本都不支持

`fetch` 是一个相当**底层**的 API，在实际项目使用中，需要做各种各样的封装和异常处理，而并非开箱即用

书写一个请求的形式如下：

```js
fetch(url, options)
    .then(response => {
        //处理返回的请求,这里的返回请求只要不是网络错误都在这里
    })
    .catch(error => {
        //处理网络错误
    })

//即：
fetch(url, {
    method: 'POST',

    // 这里要设置符合对应格式的Content-Type
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'same-origin'
})
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.log(err)
    })
```

### options 对象的配置选项

一个完整的配置相包括：

```js
fetch(url, {
    // 荷载，必须匹配Content-Type头部
    body: JSON.stringify(data),

    // 是否缓存，可选项有no-cache, reload, force-cache, only-if-cached
    cache: 'no-cache', // *default

    // 是否携带凭证(cookie)，默认不携带
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
        'user-agent': 'Mozilla/4.0 MDN Example',
        'content-type': 'application/json'
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer' // *client, no-referrer
})
```

#### method

表示请求的类型,默认是 GET

#### headers

设置请求的头部,默认为`{}`

### 检查请求是否成功

请求失败时不会直接被`catch()`方法捕获,而是必须通过`response.ok`的`Boolean`值来判断,`catch()`方法只会在网络错误时,才会触发

### 默认不携带 cookie

`Fetch`默认不会携带`cookie`,要想请求时携带,请设置`option`对象的`credentials`属性,它有以下值：

-   `'include'`：任何请求都携带`cookie`
-   `'same-origin'`：只有同源的请求才携带`cookie`
-   `'omit'`：任何请求不携带`cookie`(默认值，但之后版本有修改)
