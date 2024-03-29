# 存储

场景的浏览器存储一般为`cookie/localStorage/sessionStorage/IndexedDB`等等

-   [Indexed Database](./IndexedDB/README.md)

## 离线应用缓存(已废弃，但仍大量使用，选择性查看即可)

要想在缓存中保存数据，可以使用一个描述文件，列出要下载和缓存的资源。
要将描述文件与页面关联起来，可以在`html`元素中指定`manifest`属性如下：

```html
<html lang="en" manifest="./offline.appcache"></html>
```

表示在同目录的`offline.appcache`中包含着描述文件。（该文件的 MIME 类型必须为`text/cache-manifest`）

### manifest 缓存清单

`manifest`采用三段式,分别为`CACHE`, `NETWORK`, `FALLBACK` 如：

```js
CACHE MANIFEST
# v1.0.0
./test.css

NETWORK:
./test.js

FALLBACK:
/other 404.html
```

#### CACHE MANIFEST 部分

清单文件的首行内容必须以`CACHE MANIFEST`字符串开始，后跟若干字符注释，注释从`#`号开始；之后的就是要缓存的文件`URL`列表，一行一个`URL`，在它们第一次被下载后就会缓存起来，缓存后不需要网络进行访问。**相对路径的`URL`相对于清单文件的`URL`**。

#### NETWORK 部分

第二段内容以`NETWORK:`开始，在其后的表示这些`URL`资源需要用网络访问的内容，如要表示**除缓存外的内容都需要用网络访问则可以用`*`表示**

#### FALLBACK 部分

最后段内容以`FALLBACK:`开始，表示一个替代方案。它指定了一个后备页面，当资源无法访问时，浏览器就会使用该页面。该段落的每一条记录都列出了两个`URL`——第一个表示资源，第二个表示后备页面。(两个`URL`都必须使用相对路径并且与清单文件同源)如当访问`/ohter`路径时，如果访问失败，那么会将`404.html`作为代替进行访问

应用程序缓存清单约定以`.appcache`作为文件扩展名，但服务器识别清单的方式是通过`text/cache-mainfest`这个`MIME`类型的清单，如果服务器将清单文件的`Content-Type`头设置为其他`MIME`类型，那么就不会缓存应用。同时我们还需要为缓存的页面配置`manifest`头部：

```html
<html lang="en" manifest="./offline.appcache"></html>
```

[聊一聊 H5 应用缓存-Manifest](https://segmentfault.com/a/1190000009047702)
[前端性能优化（Application Cache 篇）](https://segmentfault.com/a/1190000000490331)
[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Using_the_application_cache)

### applicationCache 对象

#### manifest 缓存状态

每个`manifest`缓存都有一个状态，表示着缓存的情况。**一个缓存清单只有一个状态**，即使它被多个页面引用。

浏览器检查清单文件以及更新缓存的操作是**异步**的。

`applicationCache`对象是应用缓存的核心对象，该对象有一个`status`属性，表示应用缓存的当前状态：

-   `0(UNCACHED)`：无缓存，没有和页面相关的应用缓存
-   `1(IDLE)`：闲置，应用缓存未更新
-   `2(CHECKING)`：检查中，正在下载描述文件并检查更新
-   `3(DOWNLOADING)`：下载中，应用缓存正在下载描述文件中指定的资源
-   `4(UPDATEREADY)`：更新完成，已经更新，并所有资源都已下载完毕并触发`updateready`事件，可以通过`swapCache()`来使用
-   `5(OBSOLETE)`：废弃，应用缓存的描述文件已经不存在了，无法访问应用缓存。

#### applicationCache.update()——手动更新缓存

-   `applicationCache.update()`:手动触发应用缓存更新，通常用于长时间不关闭的页面，比如邮箱，调用该函数会出现以下情况：

    -   当有更新时，会依次触发`checking`、`downloading`、`progress`、`updateready`事件
    -   当无更新时，会依次触发`checking`、`noupdate`事件
    -   在未开启缓存的页面将抛出`Uncaught DOMException`错误

-   `applicationCache.abort()`:取消应用缓存的更新

-   `applicationCache.swapCache()`：在存在一个更新版本的应用缓存时,启用新应用缓存,否则将抛出`Uncaught DOMException`错误（在触发`updateready`事件时调用）

#### 相关事件

当然还有很多相关的事件，表示其状态的改变：（事件安装对象应为`applicationCache`对象）

-   `checking`：在浏览器为应用缓存查找更新时触发
-   `error`：在检查更新或下载资源期间发生错误时触发
-   `noupdate`：在检查描述文件发现文件无变化时触发
-   `downloading`：在开始下载应用缓存资源时触发
-   `progress`：在文件下载应用缓存的过程中持续不断地触发
-   `updateready`：在页面新的应用缓存下载完毕且可以通过 swapCache()使用时触发。
-   `cached`：在应用缓存完整可用时触发

一般情况以上事件会随页面加载按上述顺序依次触发。但调用`window.applicationCache.update()`方法可以触发上述事件(具体顺序按[上面](#applicationcacheupdate%e6%89%8b%e5%8a%a8%e6%9b%b4%e6%96%b0%e7%bc%93%e5%ad%98))

### manifest 缓存独立性

1. `manifest`缓存与浏览器默认的缓存是独立的，**不受浏览器缓存大小限制**
2. 各个`manifest`文件的缓存相互独立，各自在独立的区域进行缓存，即使是缓存同一个文件也可能由于缓存的版本不一样，而造成各个页面资源不一致。

### manifest 缓存规则

1. 遵循全局缓存规律：**当`manifest`文件改动后**(这就意味着即使缓存的资源即使更新，也不会被使用)，将重新缓存一遍所有的文件（包括`html`文件与动态添加的缓存文件）
2. `manifest`文件本身不能写进缓存清单，否则无法更新缓存
3. 即使`manifest`丢失，缓存也依然有效，不过引入该`manifest`的文件将不会在更新
4. 如果缓存存在且`manifest`文件没有被修改，浏览器直接从缓存中加载文档和资源，不会访问网络(无论是否联网！)
5. 如果一个缓存资源下载失败，那么就会导致其他缓存资源的下载停止，并会清空缓存。

### 一些坑

1. 因为缓存成功后会将引用`manifest`的`.html`文件一同缓存，所以如果只希望缓存资源而不希望缓存`.html`文件时，就会导致`.html`更新后也无法更新
2. 当我们缓存的资源更新时，需要更新`manifest`文件来重新进行缓存，不然并不会使用更新后的资源，而是使用原缓存的资源。(最有效的方法就是修改`manifest`中的注释)
3. 如果资源没有被缓存，在而没有设置`NETWORK`的情况下，将会无法加载（浏览器不会去网络上进行加载），所以需要使用通配符来表明除了`CACHE MANIFEST`中确定的资源以外，其他资源都需要去网络上加载

#### 针对上述坑的解决方法

针对问题 1，最好的解决方法就是不在我们使用的`.html`文件中引用`manifest`文件，而是单独为其创建一个`.html`文件来引用`manifest`，然后在我们使用的`.html`文件中通过`<iframe>`元素来引用这个缓存页面。

```html
<!-- main.html -->
<!DOCTYPE html>
<html lang="zh">
    <head>
        <meta charset="UTF-8" />
        <title>主页面</title>
        <link rel="stylesheet" href="css/style.css" />
        <script src="js/javascript.js"></script>
    </head>
    <body>
        <iframe src="cache.html"></iframe>
    </body>
</html>

<!-- cache.html -->
<!DOCTYPE html>
<html manifest="manifest.appcache">
    <head>
        <meta charset="utf-8" />
        <title>缓存页面</title>
    </head>
    <body></body>
</html>
```

这样就仅有`cache.html`文件和`manifest`指定的`URL`会被缓存。

### 更新缓存的一个样板

```js
window.addEventListener(
    'load',
    function (e) {
        window.applicationCache.addEventListener(
            'updateready',
            function (e) {
                if (
                    window.applicationCache.status ==
                    window.applicationCache.UPDATEREADY
                ) {
                    window.applicationCache.swapCache()
                    //提示已有新版本,请刷新页面
                } else {
                    //未有缓存更新，保持原样
                }
            },
            false
        )
    },
    false
)
```

## Cookie

最初是在客户端用于储存会话信息的，该标准要求服务器对任意`HTTP`请求发送`Set-Cookie` `HTTP`头部作为响应的一部分，其中包含会话信息。服务器响应的头可能如下：

```js
HTTP/1.1 200 OK
Content-type:text/html
Set-Cookie:name=value
Other-header:other-header-value
```

这个`HTTP`响应设置以`name`为名称,`value`为值的一个`cookie`，名称和值在传送时都必须是`URL`编码。

浏览器会储存这样的会话信息，并在这之后，通过*为每个请求添加 Cookie HTTP 头将信息发回到服务器*：

```js
GET/index.html HTTP/1.1
Cookie:name=value
Other-header:other-header-value //这一行表示其他的头部信息
```

发送回服务器的额外信息可以用于唯一验证客户端的唯一性。
（可以通过`navigator.cookieEnabled`属性查看浏览器是否开启`cookie`）

### 限制

`cookie`在性质上是绑定在特定的域名下。**当在创建它的域名发送请求时都会包含这个`cookie`**。（无法被其他域访问）

每个域的`cookie`总数有限，各种浏览器数量不同，超过限制后在设置会清除以前的。

每个`cookie`的尺寸也有限制，大多数浏览器为`4096b±1`的长度范围内

`cookie`名称*不区分大小写*（但某些服务器会区分大小写，所以还是以区分大小写形式书写）（`cookie`的名称必须经过 URL 编码）

路径(`path`)：保存`cookie`的路径，在*该路径下的所有文件（包括子目录）都能使用该 cookie*

`domain`:设置`cookie`的`domain`属性来改变文档源限制，使子域共享`cookie`。如果`catalog.example.com`域下的一个页面创建了一个`cookie`，并将`path`属性设置成`/`，其`domain`属性设置为`.example.com`，那么`cookie`就对所有`*.example.com/[*]`的域名可见。未设置时，`domain`默认值为当前`Web`服务器的主机名。

失效时间(`expires`)：表示`cookie`何时应该被删除的时间戳（何时应该停止向服务器发送这个`cookie`）
`Max-Age`:指定的是从文档被访问后的存活时间，这个时间是个相对值(比如:`3600s`),相对的是文档第一次被请求时服务器记录的`Request_time`(请求时间)和`expires`相似，该属性是以`s`(秒)为单位的倒计时。(它的优先级高于`expires`)

默认情况，当浏览器关闭时会删除所有`cookie`。可以自己设置删除时间，这个值是个`GMT`格式的日期（`Wdy,DD-Mon-YYYY HH:MM:SS GMT`）在这种情况下设置的`cookie`在浏览器关闭后依然保存在用户的电脑上。（`expires`属性设置，设置以前的时间会直接删除`cookie`）

安全标志(`secure`)：指定后，`cookie`只有在使用`SSL`连接的时候才发送到服务器。只能通过`HTTPS`或其他安全协议连接时传递。

### 格式

每一段信息都作为`Set-Cookie`头的一部分，使用分号加空格分隔每一段：

```js
Set-Cookie:name=value;expires=Mon, 22-Jan-07 07:10:24 GMT; domain=.wrox.com
```

该头信息指定了一个叫做`name`的`cookie`，它会在格林事件 2007..失效，同时对于
`www.wrox.com`和`wrox.com`的任何子域都有效,除了名值对，其他参数都不会作为`cookie`的一部分发送到服务器。

### 浏览器操作 cookie

#### 查询

```js
document.cookie //返回当前页面可用的所有cookie字符串
```

所有名字和值都是经过`URL`编码的，所以必须使用`decodeURIComponent()`来解码，因为不允许包含分号、逗号和空白符

#### 添加

当直接用于设置`cookie`时会将这个新的`cookie`字符串直接添加到现有的`cookie`集合中。

```js
document.cookie = 'name=Nico'
```

创建了一个`name`为`Nico`的`cookie`，当客户端每次向服务器发送请求的时候，都会发送这个`cookie`；当浏览器关闭时就会删除。（最好转下码）
。
要给创建的`cookie`指定额外的信息，只要将参数追加到该字符串，和`Set-Cookie`头中的格式一样。

```js
document.cookie = 'name=Nico; domain=.wrox.com; path=/'
```

#### 删除

删除一个`cookie`：指定保存时间为以前的时间，不必指定属性的值（如下）

```js
document.cookie = 'do=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
//（失效日期一般为1970年1月1日，初始化为0ms的Date对象）
```

#### 突破浏览器 cookie 数量限制

子`cookie`：为了绕开浏览器单域下的`cookie`数限制。用来存储多个名称值对：

```js
document.cookie = 'name=name1=value&name2=value2&name3=value3&name4=value4'
```

即在每个`cookie`中存储多个值（部分浏览器不允许用户设置`cookie`比如`Chrome`）

#### cookie 和 localStorage 的区别

1. `cookie`用于来记录用户和跟踪用户状态，而`localStorage`一般用于存储。
2. `cookie`大小和个数一般受限于浏览器，而`localStorage`没有限制。

## Session

虽然`Session`不属于浏览器端，但面试官貌似都喜欢考这个知识，这里就对其进行了解和学习。

`Session`是一种用来记录客户端与服务器端之间的交互，这种交互通常称之为会话，所以这种会话状态就被称之为`Session`。

而`Session`的实现则是借助于`cookie`来实现，每一个会话状态都会有一个唯一的`session id`，而这个`session id`就存储在`cookie`中一同发送给客户端，如果是相同的客户端，那么在再次访问服务器时，就会携带该`cookie`，那么也就是该`session id`，我们就可以知道这是之前的那个一个用户，而不需要额外的登录操作。

所以`Session`就是借助`cookie`本身和后端存储实现的，一种更高级的会话状态。

如果用户禁用`cookie`，那么我们可以通过重写`URL`，以查询字符串的方式向`URL`中添加`session`

### session 生命周期

`session`保存在服务器端，为了更快的存取速度一般存储在内存中。当我们第一次访问服务器时，就会为该用户生成一个唯一的`session`。之后，如果用户继续访问服务器，那么就会更新该`session`的最后访问时间。当用户越来越多时，内存中`session`的个数就会增多，为了防止内存溢出，就要设置合适的过期时间，来删除内存中那些长久不使用的`session`(不活跃的)。

### 硬是要说 cookie 与 session 的区别

1. `session`在服务器端，`cookie`在客户端
2. `session`的运作依赖于`session id`，而`session id`一般存储于`cookie`中，一同发送给客户端。(用户禁止`cookie`时，重写`URL`来降级)
3. `session`存放于服务器文件夹、数据库或内存中，`cookie`存放于浏览器。
4. 安全性，由于`cookie`在浏览器端可见，而`session`保存在服务器中，所以相对不安全。
5. 单个存储大小，由于浏览器原因，`cookie`的存储大小被限制在 4k 左右，且一个网站最多保存 20 个左右`cookie`。

## Web 存储机制

下面主要讲述`HTML5`新增的几个`Storage`对象，用于浏览器存储。

### Storage 对象类型

提供最大的存储空间来存储名值对儿。该类的实例都共有以下方法：

-   `Storage.prototype.clear()`：删除所有的值
-   `Storage.prototype.getItem(name)`：根据指定的`name`值获取对应的值
-   `Storage.prototype.key(index)`：获取`index`位置处的值
-   `Storage.prototype.removeItem(name)`：删除名为`name`的名值对
-   `Storage.prototype.setItem(name, value)`：为指定的`name`设置一个值

#### storage 事件

对`Storage`对象进行任何修改，都会在文档（`document.defaultView`、`window`）上触发`storage`事件，当通过属性或`setItem()`方法保存数据，或使用`delete`操作符或`removeItem()`删除数据，或调用`clear()`方法时，都会触发该事件。（**只有服务器下才能触发且只有一个页面注册事件另一个页面改变时触发**）

该事件`event`对象有以下属性：

-   `domain`：发生变换的存储空间的域名
-   `key`：设置或删除的键名
-   `newValue`：如果设置值则是新值，如果删除键，则为`null`
-   `oldValue`：键被更改之前的值。

存储的数据会调用`toString()`以字符串类型进行存储

#### sessionStorage 对象

`Storage`对象的子类，存储特定于某个会话的数据，该数据会保持到浏览器关闭。（主要针对会话的小段数据的存储）同一个标签页里面的同源框架可以互相访问。

由于`sessionStorage`是`Storage`的一个子类型，所以可以用`setItem(name,value)`直接设置新的属性。（其他方法同上）,也可以像给对象添加对象一样指定新的名值对（如下）： (查看同理)

```js
sessionStorage.book = 'dsd'
```

#### localStorage 对象

同样为`Storage`对象的子类，用于永久性存储。要访问一个该对象，页面必须来自**同一个域名**(子域名无效)，使用同一个协议，在同一个端口上。`localStorage`也是`Storage`的子类型，同`sessionStorage`一样的方式存储删除数据。

### 针对 IE 的方案

使用`CSS`在某个元素上指定`userData`行为：

```html
<div style="behavior:url(#default#userData)"></div>
```

一旦该元素使用了`userData`行为，那么就可以使用`Element.setAttribute()`方法在上面保存数据了。

为了将数据提交到浏览器缓存中，还必须调用`Element.save(spacename)`方法并传入一个表示数据空间名字的参数如下：

```js
var dataStore = document.getElementsByTagName('div')[0]
dataStore.setAttribute('name', 'Nicholas')
dataStore.setAttribute('book', 'Javascript')
dataStore.save('BookInfo')
```

上述代码在`div`元素上存储了 2 个信息，并用`Element.save(spacename)`方法指定了数据空间的名称`BookInfo`。在下一次页面载入之后，可以使用`Element.load()`指定同样的数据空间名称来获取数据：

```js
dataStore.load('BookInfo')
dataStore.getAttribute('name') //Nicholas
dataStore.getAttribute('book') //Javascript
```

对相应元素使用`Element.load()`方法后便可以通过元素访问。

可以通过`Element.removeAttribute(name)`方法来删除某元素的数据，参数为属性名称，删除后调用`Element.save(spacename)`方法保存提交。（访问某个数据空间脚本运行页面必须来自同一个域名，同一路径下）
