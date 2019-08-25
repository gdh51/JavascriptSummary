# 异步编程

## 脚本化HTTP
Comet：服务器发起通信并异步发送消息到客户端。
Ajax：客户端从服务请求数据

### HTTP头部信息
XHR对象提供了操作 **请求头部** 和 **响应头部** 的方法，默认情况下，在发送XHR请求的同时，还会发送下列头部信息：
+ Accept：浏览器能够处理的内容类型。
+ Accept-Charset：浏览器能够显示的字符集。
+ Accept-Encoding：浏览器能够处理的压缩编码。
+ Accept-Language：浏览器当前设置的语言。
+ Connection：浏览器与服务器之间连接的类型。
+ Cookie：当前页面设置的任何`Cookie`。
+ Host：发出请求的页面所在的域。
+ Referer：发出请求的页面的URI。
+ User-Agent：浏览器的用户代理字符串。

#### 自定义请求头部
`xhr.gsetRequestHeader()`：可以设置自定义的请求头部信息，接收两个参数：头部字段的名称和头部字段的值。多次调用不会取代新值，但不能指定`Content-Length`、`Date`、`Referer`或`User-Agent`头，还有以下头：（必须在调用`xhr.open()`方法之后且调用`xhr.send()`方法前调用）
Accept-Charset | Content-Transfer-Encoding | TE
-|-|-
Accept-Encoding | Date | Trailer
Connertion | Expect | Transfer-Encoding
Content-Length | Host | Upgrade
Cookie | Keep-Alive | User-Agent
Cookie2 | Referer | Via

我们能为请求指定`Authorization`头，但通常不需要。如果请求一个受密码保护的URL，把用户名和密码作为第四个和第五个参数传递给`xhr.open()`方法，XML对象将会自动设置合适的头部。

#### 查询响应头部信息
`xhr.ggetResponseHeader()`： 接受一个参数头部字段的名称，可以取得相应的响应头部信息。
`xhr.getAllResponseHeaders()`：取得一个包含所有响应头部信息的长字符串。
（会自动过滤掉`cookie`头，因为HTTP会自动处理`cookie`）



### XMLHttpRequest
E7之前创建的XHR对象要使用`MSXML`库中的一个`ActiveX`对象实现。且可能会遇到三个版本，即`MSXML2.XMLHttp`、`MSXML2.XMLHttp.3.0`和`MXSML2.XMLHttp.6.0`（最稳定版本）。

在IE8之后与其他主流浏览器都支持原生的XHR对象。第一步通过如下创建XHR对象：
```js
  var xhr = new XMLHttpRequest();
```
XHR的用法
在使用XHR对象时，要调用的第一个方法是`xhr.open()`，它接受3个参数：要发送的请求的类型（`get`、`post`等）、请求的`URL`和表示是否异步发送请求的布尔值。例如：
```js
xhr.open("get", "example.php", false);
```

第二个参数的URL是相对于执行代码的当前页面（也可以使用绝对路径，也可以利用`base`元素设置相对路径的基准）且使用`xhr.open()`方法时**并未发送请求**。
（只能向同一个域中使用相同端口和协议的URL发送请求，否则会引发安全错误）

第三个参数表示是否异步发送，当为`false`（同步发送时），javascript代码会等到服务器响应之后再继续执行。此时`xhr.send()`方法将会阻塞到请求完成，这种情况下下需要使用事件处理程序：一旦`xhr.send()`返回，仅需要检查XML对象的`xhr.staus()`与`xhr.responseText`属性即可。异步响应时，发送请求后`xhr.send()`方法立即返回。

第二步要发送特定的请求，必须调用`xhr.send()`方法：接受一个参数，要作为请求主体发送的数据。如果不需要通过请求主体发送数据，则必须传入`null`（因为在不传入时有些浏览器会报错，兼容）。
```js
xhr.send(null);
```
调用`xhr.send()`方法后，请求就会被发送到服务器。

服务器在收到响应后，相应的数据会自动填充XHR对象的属性：
+ responseText：作为响应主体被返回的文本。
+ responseXML：如果响应的内容类型为`text/xml`或`application/xml`，这个属性中将保存包含着响应数据的XML DOM文档。
+ status：响应的HTTP状态。
+ statusText：HTTP状态的说明。

在接收到响应后，第一步是检查`xhr.status`属性，当该属性的状态码为200时表示响应成功; 当状态码为304时表示请求的资源并没有被修改，可以直接使用浏览器中的缓存版本。

#### xhr.readyState请求/响应状态
XHR对象存在一个`xhr.readyState`属性表示请求/响应过程的当前活动阶段，取值如下：
+ 0：未初始化。尚未调用`xhr.open()`方法
+ 1：启动。已调用`xhr.open()`方法，但尚未调用`xhr.send()`方法。
+ 2：发送。已调用`xhr.send()`方法，但尚未接受到响应。
+ 3：接收。已接收到部分响应数据。
+ 4：完成。已接收到全部响应数据，而且已经可以在客户端使用了。

每当该值发生一次变换，都会触发一次`readystatechange`事件。通常我们只需关注第4阶段，且必须在调用`xhr.open()`方法*之前*指定`onreadystatechange`事件处理程序以确保跨浏览器的*兼容性*。

```js
xhr.onreadystatechange = function(){
  if(xhr.readyState==4){
    if(xhr.status>=200&&xhr.status<300||xhr.status==304){
    //成功响应时做的事
    } else {
    //失败响应时做的事
    }
  }
};
```

#### 返回数据的位置
无论内容的类型是什么，响应主体的内容都会保存到`xhr.responseText`属性中；对于非XML数据而言，`xhr.responseXML`属性的值将为`null`。

#### 请求的取消
在接收响应之前可以调用`xhr.abort()`方法来取消异步请求。
```js
xhr.abort();
```

调用该方法后，XHR对象会停止触发事件，而且*不再允许*访问任何和响应有关的对象属性。

在终止请求后，还应该对XHR对象进行**解引用操作**。由于内存原因，不建议重用XHR对象。

浏览器在XMLHttpRequest类上定义了它们的HTTP API。这个类的每个实例都表示一个独立的请求/响应对。
一个HTTP请求由4部分组成：
+ HTTP请求方法或动作
+ 正在请求的URL
+ 一个可选的请求头合集，其中可能包括身份验证性信息
+ 一个可选的请求主体
服务器返回的HTTP响应包含3部分：
+ 一个数字和文字组成的状态码，用来显示请求成功和失败
+ 一个响应头合集
+ 响应主体
XMLHttpRequest允许把DELETE、HEAD、OPTIONS、PUT作为open的第一个参数。
Web服务器通常使用二进制数据响应HTTP请求。responseText属性只能用于文本。
服务器响应的正常解码是假设服务器为这个响应发送了Content-Type头和正确的MIME类型。如果服务器发送XML文档当没有设置适当的MIME类型，那么XML对象将不会解析它且涉资responseXML属性。
XML2中定义了overrideMimeType()来解决这个问题，传入一个表示MIME类型的字符串参数，将会把响应作为该类型来返回。
表单编码的请求
利用&连接每个键值对，并对每个名字和值执行URL编码（使用16进制转义码替换特殊字符）
表单数据编码格式有一个正式的MIME类型：
application/x-www-form-urlencoded
当使用POST方法提交表单数据时，必须设置Content-Type请求头为该值
当发送的为XML文档或字符串但没指定请求头时，通常会自动设置为text/html或text/plain
上传文件
通过input元素选择文件时，表单将在它产生的POST请求主体中发送文件内容。XHR2运行通过send方法传入File对象来实现上传文件。
在支持File对象的浏览器中，每个<input type=’file’>元素有一个files属性，它是File对象中的类数组对象。拖放API运行通过拖放事件的dataTransfer.files属性来访问用那个户拖放到元素上的文件。
文件类型是更通用的二进制大对象（Blob）类型中的一个子类型。XHR2允许向send方法传入任何Blob对象。如果没有显式设置Content-Type头，这个Blob对象的type属性用于设置待上传的Content-Type头
multipart/form-data
当HTML表单同时包含文件上传元素和其他元素时，浏览器必须使用multipart/form-data的特殊Content-Type来用POST方法提交表单。
这种编码包括使用长边界字符串把请求主体分离成多个部分。
XHR2定义了FormData，它容易实现多部分请求主体。将该对象传入send方法中，send会对请求定义合适的边界字符串和设置Content-Type头
上传进度事件
XML对象有一个upload属性，该属性是一个对象，它定义了addEventListener方法和整个progress事件集合。

### GET请求
用于向服务器查询某些信息，必要时可以将查询字符串参数追加到URL的末尾。
查询字符串中的每一个参数的名称和值都必须使用`encodeURIComponent()`进行编码，之后才能放到URL的末尾，且所有名-值都必须由和号` & `分隔，如下：
```js
xhr.open("get", "example.php?name1=value1&name2=value2", true);
```

### POST请求
用于向服务器发送应该被保存的数据。利用`xhr.send()`方法传入某些数据。可以直接传入XML DOM文档，文档会自动序列化后作为请求主体被提交到服务器。

默认情况下POST请求和提交Web表单的请求会不一样，但我们可以通过XHR对象来模仿表单提交：
1.	设置`Content-type`头部信息为`application/x-www-form-urlencoded`，即提交表单时的内容类型。
2.	以适当的格式创建一个字符串（以查询字符串的形式）



### XMLHTTPRequest 2级

#### FormData对象
`FormData对象`：一个序列化表单以及创建与表单格式相同的数据的对象。

创建一个formData对象，并添加一个name键值对。
```js
var data = new FormData();
data.append("name", "Nicholas");
```

##### 添加表单数据
可以使用两种方式向`FormData`对象传入表单值：
第一种使用`FormData.prototype.append()`方法添加单个键值对。

`FormData.prototype.append()`：接收两个参数，键与值，分别对应表单字段的名字和字段中包含的值。

第二种方法是直接在`FormData`构造函数传入表单元素。
```js
var data2=new FormData(document.forms[0]);
```
创建后直接传入`xhr.send()`方法做参数即可，*不必配置适当的头部信息*。

#### 超时设定
XHR对象有一个`timeout`属性，表示请求在等待响应多少毫秒后就终止。在给`timeout`属性设置一个数值后表示在多少毫秒后如果没有接收到响应就终止并触发`timeout`事件。
```js
xhr.open("get","example",true);
xhr.timeout=10000;
xhr.ontimeout=function(){
  //超时后的设置
}
xhr.send(null);
```

#### 重写响应的MIME类型
`xhr.overrideMimeType()`：重写XHR响应的MIME类型。调用该方法必须在`xhr.send()`方法之前。

适用于这种情况：（服务器返回的MIME类型是`text/plain`，但数据中实际包含的是XML，根据MIME类型，即使数据是XML，但`xhr.responseXML`属性中仍然是`null`。）

### 进度事件
+ loadstart：在接收到响应数据的第一个字节时触发。

+ progress：在接收响应期间持续不断的触发。（必须在`xhr.open()`方法之前添加事件处理程序）
  该事件处理程序会接收到一个`event`对象，其`target`属性是XHR对象，该事件对象还包含  了三个额外的属性：
  + lengthComputable：表示进度信息是否可用的布尔值
  + position：表示已经接收的字节数
  + totalSize：表示根据`Content-Length`响应头部确定的预期字节数。

+ error：在请求发生错误时触发。

+ abort：在因为调用`xhr.abort()`方法而终止连接时触发。

+ load：在接收到完整的响应数据时触发。（不一定成功）
  该事件处理程序会接收一个`event`对象，其`target`属性指向XHR对象的实例。
  事实上**只要浏览器接收到服务器的响应**，不管状态如何，**都会触发`load`事件**，所以必须检查`status`属性。

+ loadend：在通信完成或者触发`error`、`abort`或`load`事件后触发。

每个请求都从触发`loadstart`事件开始，接下来是一个或多个`progress`事件，然后触发`error`、`abort`、`load`事件中的一个，最后触发`loadend`事件结束。



### 跨资源共享
*CORS（Cross-Origin Resource Sharing跨源资源共享）*定义了在必须访问跨源资源时，浏览器和服务器应该如何沟通。

在发送一个简单的GET或POST请求时，它没有自定义的头部，而主体内容是`text/plain`。在发送该请求时，需要给它附加一个额外的`Origin`头部，其中包含请求页面的源信息（协议、域名和端口），以便服务器决定是否响应。例如：
`Origin:http://www.nczonline.net`

如果服务器接收这个请求，就在`Access-Control-Allow-Origin`头部中回发相同的源信息(如果是公共资源，可以回发` * `)。例如：
`Access-Control-Allow-Origin：http://www.nczonline.net`

**注意请求和响应都不包含`cookie`信息**。

#### IE8-IE10对CORS的实现
IE8-IE10中引入了XDR类型，与XHR类似但有以下不同：

+ `cookie`不会随请求发送，也不会随响应返回
+ 只能设置请求头部信息中的`Content-Type`字段
+ 不能访问响应头部信息
+ 只支持GET和POST请求

这些变换使CSRF和XSS的问题得到了缓解，被请求的资源可以根据它认为合适的任意数据来决定是否设置`Access-Control-Allow-Origin`头部
```js
var xdr = new XDomainRequest;
  xdr.onload = function(){
    console.log(xdr);
  }
  xdr.open("get", "emaple.php");
  xdr.send(null);
```

同xhr类似，但xdr的`xdr.open()`方法只有两个参数，因为XDR请求都是异步执行的。

在请求返回后会触发`load`事件，响应的数据也会保存在`xdr.responseText`属性中。只要能响应原始文本就会触发`onload`事件所以无法确认响应状态; 但如果失败就会触发`error`事件，所以`error`事件是唯一能够确定的请求。

当发送POST请求时，XDR对象提供了一个`xdr.contentType`属性表示发送数据的格式。

#### IE10+及其他主流浏览器对CORS的实现
只需要在`xhr.open()`方法中传入**绝对URL**即可。但有以下方面的限制：
+ 不能使用`xhr.setRequestHeader()`设置自定义头部
+ 不能发送和接收`cookie`
+ 调用`xhr.getAllResponseHeaders()`总会返回空字符串

所以**尽量在访问本地资源时使用相对URL，访问远程资源时再使用绝对URL以消除歧义，避免出现限制访问头部或本地cookie信息等问题**。

#### Preflighted Requests
CROS通过一个叫做Preflighted Requests的透明服务器验证机制支持开发人员使用自定义的头部、GET和POST之外的方法，以及不同类型的主体内容。预检请求首先需要向另外一个域名的资源发送一个 HTTP OPTIONS 请求头，其目的就是为了判断实际发送的请求是否是安全的。

下面的2种情况需要进行预检：
1. 简单请求，比如使用`Content-Type`为 `application/xml` 或 `text/xml` 的 POST 请求；
2. 中设置自定义头，比如 X-JSON、X-MENGXIANHUI 等。

使用OPTIONS方法发送下列头部时，会向服务器发送一个Preflight请求。
+ Origin：与简单的请求相同
+ Access-Control-Requests-Method：请求自身使用的方法。
+ Access-Control-Requests-Headers：（可选）自定义的头部信息，多个头部以逗号分隔。

例如发送一个带有自定义头部NCZ的使用POST方法的请求：
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

Preflight请求结束后，结果将按照响应中指定的时间缓存起来。而为此付出的代价只是第一次发送这种请求时会多一次HTTP请求。（IE11及主流浏览器支持）

#### 带凭据的请求
默认情况跨源请求不提供凭据（`cookie`、HTTP认证及客户端SSL证明等）且任何作为跨域响应来接收的`cookie`都会丢失。

通过将`xhr.withCredentials`属性设置为`true`，可以指定某个请求应该发送凭据。相应的服务器端应该设置下面的HTTP头部来响应：
```js
Access-Control-Allow-Credentials：true
```

如果发送带凭据的请求而服务器没有包含这个头部则浏览器就不会把响应交给Javascript，于是`xhr.responseText`将为空字符串，且`xhr.status`值为0，且会调用`onerror`事件处理程序。

服务器可以在`Preflight`响应中发送这个HTTP头部，表示允许源发送带凭据的请求。
（IE11及主流浏览器支持）

## Comet
Ajax是一种从页面向服务器请求数据的技术，而Comet则是一种服务器向页面推送数据的技术。

Comet能够让信息近乎实时地被推送到页面上，非常适合处理体育比赛分数和股票报价。

有两种实现Comet的方法：

### 长轮询
长轮询：传统轮询（短轮询）的一个翻版，即浏览器定时向服务器发送请求，看看有没有数据更新。

页面发起一个到服务器的请求，然后服务器*一直保持连接打开，直到有数据可发送*。*发送完毕后，浏览器关闭连接，直到页面又发起一个到服务器的新请求*，浏览器在打开连接。

无论长轮询还是短轮询，*浏览器都要先向服务器发送连接*。

轮询的优势是所有浏览器都支持，使用XHR对象和`setTimeout()`就能实现

### HTTP流
在页面的生命周期内只使用一个HTTP连接。浏览器向服务器发送一个请求，而*服务器保持连接打开，然后周期性地向浏览器发送数据*。

在主流浏览器中通过监听`xhr.readystatechange`事件及检测`xhr.readyState`的值是否为3就可以利用XHR对象实现HTTP流。

随着浏览器不断接收数据，`xhr.readyState`的值会周期性的变为3，且此时`xhr.readystatechange`属性中就会保存接收到的所有数据，此时在比较之前接收到的数据，决定*从什么位置开始取得最新的数据*即可。

## 服务器发送事件（SSE）
用于创建到服务器的单向连接，服务器通过这个连接可以发送任意数量的数据。服务器响应的MIME类型必须是`text/event-stream`。SSE支持轮询和HTTP流，而且能在断开连接时自动确定何时重新连接。（IE不支持）

要预定新的事件流，首先要创建一个新的`EventSource`对象
```js
var source = new EventSource("myevents.php");
```
传入的URL必须与创建对象的页面同源（相同的URL模式、域及端口）

该实例有一个`readyState`属性，0表示正在连接到服务器，1表示打开了连接，2表示关闭了连接。

此外拥有三个事件：
+ open：在建立连接时触发
+ message：在从服务器接收到新数据时触发
+ error：在无法建立连接时触发

服务器发回的数据以字符串形式保存在`event.data`中

默认情况下，`EventSource`对象会保持与服务器的活动连接。如果连接断开还会重新连接。这意味着SSE适合长轮询和HTTP流。如果要强制断开连接并且不再重新连接，可以调用`close()`方法。
```js
source.close();
```

所谓的服务器事件会通过一个持久的HTTP响应发送，这个响应的MIME类型为`text/event-stream`。响应的格式是*纯文本*，最简单的情况是每个数据项都带有前缀`data：*`，例如：
```js
data：foo

data：bar

data：foo
data：bar
```
### 数据的接收
在`message`事件`event.data`属性存放服务器作为该事件的负载发送的任何字符串; `event.type`属性，默认值为`message`，事件源可以修改这个值。

`onmessage`事件处理程序接收从一个给定的服务器事件源发出的所有事件，如果有必要，也可以根据`type`属性派发一个事件。

对于以上响应而言，事件流中的第一个`message`事件返回的`event.data`值为`foo`; 第二个`message`事件返回的`event.data`为`bar`; 第三个为`foo\nbar`（中间为换行符）。

对于多个连续的以`data：*`开头的数据行，将作为多段数据解析，每个值之间以一个换行符分隔（`\n`）。只有在包含`data：*`的数据行后有空行时，才会触发`message`事件。

通过id：前缀可以给特定的事件指定一个关联的ID，这个ID行位于data：行前面或后面皆可：
```js
data：foo
id：1
```

设置ID后，`EventSource`对象会跟踪上一次触发的事件。如果连接断开，会向服务器发送一个包含名为`Last-Event-ID`的特殊HTTP头部的请求，以便服务器知道下一次该触发哪个事件。

## Web Sockets：一个独立的持久连接上提供全双工、双向通信
在创建Web Socket之后，会有一个HTTP请求发送到浏览器以发起连接。在取得服务器响应后，建立的连接会使用HTTP升级从HTTP

协议交换为Web Socket协议。
此时URL协议会有不同：未加密的连接是`ws：//`；加密的连接为`wss：//`。
```js
var socket = new WebSocket("ws://www.example.com/server.php");
```
*注意必须给WebSocket构造函数传入绝对URL且它不受同源策略的限制*。

实例化WebSocket对象后，浏览器会马上尝试创建连接。同XHR类似，它也有一个表示当前状态的`readyState`属性：
+ WebSocket.OPENING (0)：正在建立连接。
+ WebSocket.OPEN (1)：已经建立连接。
+ WebSocket.CLOSING (2)：正在关闭连接。
+ WebSocket.CLOSE (3)：已经关闭连接。

要关闭WebSocket可以在任何时候调用`close()`方法。

要向服务器发送数据，使用`send()`方法并传入任意的字符串即可，该方法只能发送*纯文本*数据，对于复杂的数据必须进行序列化。

当服务器向客户端发来信息时，WebSocket对象就会触发`message`事件，在事件的`event.data`属性中保存着返回的数据（字符串）。

它还拥有其他三个事件：（只能通过DOM 0级指定事件处理程序）
+ open：在成功建立连接时触发
+ error：在发生错误时触发，连接不能持续
+ close：在连接关闭时触发。

在三个事件中仅`close`事件的`event`对象有额外的属性：
+ wasClean：表示连接是否已经明确地关闭
+ code：服务器返回的数值状态码
+ reason：一个字符串，包含服务器发回的消息。

## Fetch API
首先说明IE在所有版本都不支持

fetch 是一个相当底层的 API，在实际项目使用中，需要做各种各样的封装和异常处理，而并非开箱即用

书写一个请求的形式如下：
```js
fetch(url, options).then(response=> {
  //处理返回的请求,这里的返回请求只要不是网络错误都在这里
}).catch(error=> {
  //处理网络错误
});

//即：
fetch(url, {
  method: "POST",
  body: JSON.stringify(data),
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "same-origin"
}).then((res)=>{
  console.log(res);
}).catch((err)=>{
  console.log(err);
});
```
### options对象的配置选项

#### method
表示请求的类型,默认是GET

#### headers
设置请求的头部,默认为{}

### 检查请求是否成功
请求失败时不会直接被`catch()`方法捕获,而是必须通过`response.ok`的`Boolean`值来判断,`catch()`方法只会在网络错误时,才会触发

### 默认不携带cookie
Fetch默认不会携带cookie,要想请求时携带,请设置option对象的credentials属性,它有以下值：
+ `'include'`：任何请求都携带cookie
+ `'same-origin'`：只有同源的请求才携带cookie
+ `'omit'`：任何请求不携带cookie
