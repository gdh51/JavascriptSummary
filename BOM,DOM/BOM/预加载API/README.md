# HTML5 prefetch
prefetch 即预加载，在用户需要前我们就将所需的资源加载完毕。

## 预加载的理由
即使有了浏览器缓存，我们也有出于以下理由来进行对资源的预加载：
+ 用户可能是第一次访问网站，此时还无缓存
+ 用户可能清空了缓存
+ 缓存可能已经过期，资源将重新加载
+ 用户访问的缓存文件可能不是最新的，需要重新加载

## DNS prefetch
当我们访问一个网站时，需要先将其域名转换为IP地址，这是一个很耗时的工作。

>通过DNS pretch可以提前解析这个页面，浏览器空闲时提前将这些域名转化为 IP 地址，真正请求资源时就避免了上述这个过程的时间。

```html
<meta http-equiv='x-dns-prefetch-control' content='on'>
<link rel='dns-prefetch' href='http://g-ecx.images-amazon.com'>
<link rel='dns-prefetch' href='http://z-ecx.images-amazon.com'>
<link rel='dns-prefetch' href='http://ecx.images-amazon.com'>
<link rel='dns-prefetch' href='http://completion.amazon.com'>
<link rel='dns-prefetch' href='http://fls-na.amazon.com'>
```

+ 应用场景1：我们的资源存在在不同的 CDN 中，那提前声明好这些资源的域名，就可以节省请求发生时产生的域名解析的时间。
+ 应用场景2：如果我们知道用户接下来的操作一定会发起一起资源的请求，那就可以将这个资源进行 DNS-Prefetch，加强用户体验。

## Resource prefetch
在Chrome中我们可以通过link来对特定的文件进行预加载
```html
<link rel='subresource' href='critical.js'>
<link rel='subresource' href='main.css'>

<link rel='prefetch' href='secondary.js'>
```

在Firefox中或用meta标签来声明
```html
<meta http-equiv="Link" content="<critical.js>; rel=prefetch">
```

`rel='subresource'`表示当前页面必须加载的资源，应该放到页面最顶端先加载，有最高的优先级。

`rel='prefetch'`表示当`subresource`所有资源都加载完后，开始预加载这里指定的资源，有最低的优先级。

注意：只有可缓存的资源才进行预加载，否则浪费资源！

## Pre Render
预渲染意味着我们提前加载好用户即将访问的下一个页面，否则进行预渲染这个页面将浪费资源，慎用！

```html
<link rel='prerender' href='http://www.pagetoprerender.com'>
```

>`rel='prerender' `表示浏览器会帮我们渲染但隐藏指定的页面，一旦我们访问这个页面，则秒开了！

在 Firefox 中或用` rel='next' `来声明
```html
<link rel="next" href="http://www.pagetoprerender.com">
```

##  不能预加载的资源
+ URL 中包含下载资源
+ 页面中包含音频、视频
+ POST、PUT 和 DELETE 操作的 ajax 请求
+ HTTP 认证(Authentication)
+ HTTPS 页面
+ 含恶意软件的页面
+ 弹窗页面
+ 占用资源很多的页面
+ 打开了 chrome developer tools 开发工具

## 技巧——手动预加载
在 head 中强势插入` link[rel='prerender'] `即可：
```js
var hint =document.createElement("link");
hint.setAttribute('rel', 'prerender');
hint.setAttribute('href', 'next-page.html');
document.getElementsByTagName('head')[0].appendChild(hint);
```

## 兼容性
这么好用的特性，当然要考虑各浏览器的兼容程度了(哭：

IE9 支持` DNS pre-fetching `但管它叫 prefetch。

IE10+ 中` dns-prefetch `和` prefetch `是等价的。

其他方面的测试，目前还没有很好的方案，暂且只能通过查看浏览器是否缓存来测试。

在 Chrome 中打开了` chrome developer tools `开发工具会阻止页面的预渲染，所以我们看不到这个过程，但可以在` chrome://cache/ `或` chrome://net-internals/#prerender `中查看。

Firefox 可以在` about:cache `中查看。