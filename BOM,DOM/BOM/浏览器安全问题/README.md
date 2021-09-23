# 浏览器安全问题

## XSS(跨站脚本攻击)

XSS 这类安全问题发生的本质原因在于，浏览器错误的将攻击者提供的用户输入数据当做`JavaScript`脚本给执行了。

### XSS 类型分类

XSS 按照恶意输入的脚本是否在应用中存储，XSS 被划分为`"存储型XSS"`和`"反射型XSS"`,如果按照是否和服务器有交互，又可以划分为`"Server Side XSS"`和`"DOM based XSS"`。

### 如何防御

最佳的做法就是对数据进行严格的输出编码，如`<>`等符号进行 HTML 编码变成`&lt;`、`&gt;`, 但是根据不同的环境要进行不同的编码，如 URL 中要转换为`%3Cscript%3E`；也可以通过 `CSP`(`Content Security Policy`) 限制请求资源的`origin`，来防止 XSS 攻击，但最好的做法还是输入编码。

## iframe 被恶意更改

当我们使用第三方`iframe`时，如果第三方`iframe`被攻击者恶意抢注将`iframe`中内容替换掉，那么就会利用用户浏览器漏洞下载安装木马等等。。

### 如何防御

设置`iframe`元素的`sandbox`属性, 设置`iframe`的权限。设置该属性而不设置值时，会执行最严格的限制，除了显示静态资源外，其他什么都做不了。当然也可以通过具体值来开放`iframe`权限。

### CSP 网页防护

和`X-Frames-Options`一样，都需要在服务器端设置好相关的响应头。 CSP 的作用， 真的是太大了，他能够极大的防止你的页面被 XSS 攻击，而且可以制定 js,css,img 等相关资源的`origin`，防止被恶意注入。不过他的兼容性,较差。目前支持 Edge12+ 以及 IE10+。

而且目前市面上，流行的是 3 种 CSP 头，以及各种浏览器的兼容性

使用主要是在后端服务器上配置，在前端，我们可以观察`Response Header`里是否有这样的一个 Header:`Content-Security-Policy: default-src 'self'`

这就表明，你的网页是启用 CSP 的。通常我们可以在 CSP 后配置各种指定资源路径，有

```js
default-src,
script-src,
style-src,
img-src,
connect-src,
font-src,
object-src,
media-src,
sandbox,
child-src,
...
```

如果你未指定的话，则是使用`default-src`规定的加载策略.

**默认**配置就是同域: `default-src "self"`

child-src 就是用来指定 iframe 的有效加载路径。其实和 X-Frame-Options 中配置 allow-origin 是一个道理。不过,allow-origin 没有得到厂商们的支持。
而，sandbox 其实就和 iframe 的 sandbox 属性（下文介绍）,是一样一样的，他可以规定来源能够带有什么权限.

例如：
`Content-Security-Policy: child-src 'self' http://example.com; sandbox allow-forms allow-same-origin`

此时，iframe 的 src 就只能加载同域和`example.com`页面。 最后再补充一点: 使用 CSP 能够很好的防止 XSS 攻击，原理就是 CSP 会默认`escape`掉内联样式和脚本，以及`eval`执行。但是，你可以使用`script-src`进行降低限制.

`Content-Security-Policy: script-src 'unsafe-inline'`
如果想更深入的了解 CSP,可以参阅:[CSP](https://imququ.com/post/content-security-policy-reference.html)

**以上针对的是 iframe 自己的网页**

## click hack(点击劫持)

1. 攻击者精心构造一个诱导用户点击的内容，比如 Web 页面小游戏
2. 将我们的页面放入到`iframe`当中
3. 利用`z-index`等 CSS 样式将这个`iframe`叠加到小游戏的垂直方向的正上方
4. 把`iframe`设置为 100%透明度
5. 受害者访问到这个页面后，肉眼看到的是一个小游戏，如果受到诱导进行了点击的话，实际上点击到的却是`iframe`中的我们的页面

### 如何防御

1. 同样是使用 `CSP` 来限制`iframe`的权限,通过设置 HTTP 头部`Content-Security-Policy`的值为`frame-ancestors 'ORIGIN'`的来指定允许哪些 URL 地址加载

2. 设置`cookie`的`SameSite`属性为`strict`或`lax`, 这样`cookie`就不会被发送

3. 设置头部为`X-Frame-Options: DENY`。这样就告诉浏览器你不允许你的内容以`iframe`的形势出现。

4. 兼容性处理：通过查询该窗口是否为顶级窗口来判断我们的页面是否存在于`iframe`中，当存在时就跳转（这种方法有缺点，可以用双重框架的方法破解，详情请看下面链接）

```js
if (window.top === window) {
    // 安全
} else {
    window.top.location = window.location
}

//只允许同源窗体
if (top.location.host != window.location.host) {
    top.location.href = window.location.href
}
```

#### X-Frame-Options

`X-Frame-Options`是一个响应头，主要是描述服务器的网页资源的`iframe`权限。目前的支持度是 IE8+,有 3 个选项:

-   DENY：当前页面不能被嵌套 iframe 里，即便是在相同域名的页面中嵌套也不允许,也不允许网页中有嵌套`iframe`
-   SAMEORIGIN：`iframe`页面的地址只能为同源域名下的页面
-   ALLOW-FROM：可以在指定的`origin url`的`iframe`中加载

`X-Frame-Options`其实就是将前端 js 对`iframe`的把控交给服务器来进行处理。

[Clickjacking Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html)

## 错误的内容推断

想象这样一个攻击场景：某网站允许用户在评论里上传图片，攻击者在上传图片的时候，看似提交的是个图片文件，实则是个含有 JavaScript 的脚本文件。该文件逃过了文件类型校验（这涉及到了恶意文件上传这个常见安全问题，但是由于和前端相关度不高因此暂不详细介绍），在服务器里存储了下来。接下来，受害者在访问这段评论的时候，浏览器会去请求这个伪装成图片的 JavaScript 脚本，而此时如果浏览器错误的推断了这个响应的内容类型`（MIME types）`，那么就会把这个图片文件当做 JavaScript 脚本执行，于是攻击也就成功了。

问题的关键就在于，后端服务器在返回的响应中设置的`Content-Type Header`仅仅只是给浏览器提供当前响应内容类型的建议，而浏览器有可能会自作主张的根据响应中的实际内容去推断内容的类型。

### 如何防御

通过设置`X-Content-Type-Options`这个 HTTP Header 明确禁止浏览器去推断响应类型。

同样是上面的攻击场景，后端服务器返回的`Content-Type`建议浏览器按照图片进行内容渲染，浏览器发现有`X-Content-Type-OptionsHTTP Header`的存在，并且其参数值是`nosniff`，因此不会再去推断内容类型，而是强制按照图片进行渲染，那么因为实际上这是一段 JS 脚本而非真实的图片，因此这段脚本就会被浏览器当作是一个已经损坏或者格式不正确的图片来处理，而不是当作 JS 脚本来处理，从而最终防止了安全问题的发生。

## 不安全的第三方依赖包

我们日常用的第三放依赖包不一定是安全的，举个例子，jQuery 就存在多个已知安全漏洞，例如`jQuery issue 2432`，使得应用存在被 XSS 攻击的可能。而 Node.js 也有一些已知的安全漏洞，比如`CVE-2017-11499`，可能导致前端应用受到 DoS 攻击。另外，对于前端应用而言，除使用到的前端开发框架之外，通常还会依赖不少 Node 组件包，它们可能也有安全漏洞。

手动检查这些第三方代码有没有安全问题是个苦差事，主要是因为应用依赖的这些组件数量众多，手工检查太耗时，好在有自动化的工具可以使用，比如`NSP(Node Security Platform)`，Snyk 等等。

## 本地存储数据泄露

解决方法：尽量不再前端存储中存储重要信息

[8 大前端安全问题（上）](http://insights.thoughtworks.cn/eight-security-problems-in-front-end/)
[8 大前端安全问题（下）](https://insights.thoughtworks.cn/eight-security-problems-in-front-end-2/)

## 补充几个浏览器策略

### 导航策略(navigation policy)

允许策略`(permissive policy)`，"一个`frame`可以导航任何一个其他的`frame`"

### 窗口策略(Window Policy)

是指"一个`frame`只能导航本窗口里面的`frame`"。这样能防止跨窗口攻击。
窗口策略假设一个诚实的主体，不会包含一个不诚实主体的`frame`，但是`Mashup`的出现，使得窗口策略的这一安全假设失效，导致同窗口攻击。以`iGoogle`为例，这是典型的`Mashup`站点，里面包含多个`frame`，可以包含来自不同站点的页面。在`gadget`劫持攻击中，当前页面的一个恶意`gadget`可以将另一个`frame`导航至`attacker.com`，并伪装成那个`frame`欺骗用户，这就是同窗口攻击。

### 后代策略(Descendant Policy)

除了允许策略和窗口策略，浏览器还有后代策略和孩子策略`（child policy）`。后代策略是指，"一个`frame`只能导航它的后代`frame`"。孩子策略是指，"一个`frame`只能导航它的直接孩子"。孩子策略显然比后代策略更加严格，但是这没有比后代策略增加更多的安全性，反倒带来和各种站点的易用性和兼容性问题，所以大多数浏览器采用了后代策略。
在后代策略下，如果一个`frame`包含另一个`frame`，那么父`frame`就将子`frame`那部分屏幕代理给子`frame`。浏览器阻止子`frame`绘制它自身绑定区域以外的内容，但是允许父`frame`使用`position:absolution`绘制子`frame`。
浏览器可以根据当前活动`frame`的安全域，和它要导航的目标`frame`是否同属一个安全域，如果不属于，则拒绝导航，这样就可以抵御同窗口攻击了。

## CSRF（Cross-site request forgery）跨站请求伪造

攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

类型：

-   GET 类型：用户打开即可发送
-   POST 类型：用户打开即可发送
-   链接类型：需要用户点击

特点：

-   攻击一般发起在第三方网站，而不是被攻击的网站。被攻击的网站无法防止攻击发生。
-   攻击利用受害者在被攻击网站的登录凭证，冒充受害者提交操作；而不是直接窃取数据。
-   整个过程攻击者并不能获取到受害者的登录凭证，仅仅是"冒用"
-   跨站请求可以用各种方式：图片 URL、超链接、CORS、Form 提交等等。部分请求方式可以直接嵌入在第三方论坛、文章中，难以进行追踪。

### 解决方法

-   阻止不明外域的访问
    -   同源检测
    -   Samesite Cookie
-   提交时要求附加本域才能获取的信息
    -   CSRF Token
    -   双重 Cookie 验证

#### 同源检测

在 HTTP 协议中，每一个异步请求都会携带两个 Header，用于标记来源域名：

`Origin Header`：指示了请求来自于哪个站点。
`Referer Header`：请求头包含了当前请求页面的来源页面的地址，即表示当前页面是通过此来源页面里的链接进入的。(即包含前导页面)

这两个 `Header` 在浏览器发起请求时，大多数情况会自动带上，并且不能由前端自定义内容。
服务器可以通过解析这两个 `Header` 中的域名，确定请求的来源域。

#### CSRF Token

1. 将 CSRF Token 输出到页面中:每次页面加载时，使用 JS 遍历整个 DOM 树，对于 DOM 中所有的 a 和 form 标签后加入 Token。
2. 页面表单提交的请求携带这个 Token
3. 服务器验证 Token 是否正确：当用户从客户端得到了 Token，再次提交给服务器的时候，服务器需要判断 Token 的有效性，验证过程是先解密 Token，对比加密字符串以及时间戳，如果加密字符串一致且时间未过期，那么这个 Token 就是有效的。

#### 设置 SameSite

设置`cookie`的`SameSite`值为`lax/strict`

#### 分布式效验

采用 Encrypted Token Pattern 方式。这种方法的 Token 是一个计算出来的结果，而非随机生成的字符串。这样在校验时无需再去读取存储的 Token，只用再次计算一次即可。
这种 Token 的值通常是使用 UserID、时间戳和随机数，通过加密的方法生成。

[CSRF 防范](https://juejin.im/post/5bc009996fb9a05d0a055192)
[Is checking the Referer and Origin headers enough to prevent CSRF, provided that requests with neither are rejected?](https://security.stackexchange.com/questions/158045/is-checking-the-referer-and-origin-headers-enough-to-prevent-csrf-provided-that)
