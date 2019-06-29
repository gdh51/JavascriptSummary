# iframe详解

## iframe元素常用属性
+ frameborder:是否显示边框，1(显示),0(不显示)
+ height:框架作为一个普通元素的高度，建议在使用css设置。
+ width:框架作为一个普通元素的宽度，建议使用css设置。
+ name:框架的名称，`window.frames[name]`时专用的属性。
+ scrolling:框架的是否滚动。`yes,no,auto`。
+ src：内框架的地址，可以使页面地址，也可以是图片的地址。
+ srcdoc: 用来替代原来HTML body里面的内容。但是IE不支持
+ sandbox: 启用一系列对` <iframe> `中内容的额外限制。，IE10+支持

## 获取文档中iframe元素的顶层对象(window)
这里的意思就是在拥有该元素的文档怎么访问iframe元素的window对象(前提是同域),有两种方法：
1. 直接通过`document.frames[name]`或`document.frames[index]`就可以访问窗体的`window`对象,`document.frame`是文档中所有`iframe`元素`window`对象的集合
2. 通过具体的元素的`contentWindow`或`contentDocument`属性访问,它们分别获得窗体的`Window`对象和`Document`对象

## 在iframe元素中获取外层父文档的顶层对象(window)
同样是同源的情况下, 可以通过`window.parent`或`window.top`获取,具体情况看它们的嵌套关系, `window.parent`获取的为上一层窗体,`window.top`获取的是最顶层窗体, 当只有一个嵌套关系时两者相等

## iframe的轮询
由来：为了兼容IE8+等低级浏览器, 防止提交表单时跳转网页, 需要用iframe作为表单提交的工具。

实现：通过在`ajax`的`readyState = 4`时,再次执行原异步请求函数。在`iframe`中通过`iframe.onload`事件与`reload`反复触发来进行数据获取, 当然也可以通过直接删除、添加该元素来达到目的

## iframe来进行广告刊登
原因：文档自带广告会引入额外的css文件和js文件,带来一系列安全问题, 这个问题在iframe中被很好的解决

### 自适应iframe
默认情况下,iframe会自带滚动条且为一个小窗体,然后在设置iframe高度为src指定文档的高度即可：
```html
<iframe src='target.html' scrolling='no'></iframe>
<script>
let iw = document.frames[0];
let ifr = document.querySelector('iframe');
ifr.height = iw.body.offsetHeight;
</script>
```

另外还有一个allowfullscreen(attribute)属性,当true时表示允许iframe全屏, 关于它的兼容性, 我测过的浏览器都没体现出来能行(Chorme,firefox)

## iframe安全问题

### 防嵌套网页
因为iframe享有着click的最优先权，当有人在伪造的主页中进行点击的话，如果点在iframe上，则会默认是在操作iframe的页面。

相关的安全问题如**clickhacking**,这种问题你在网吧里面可以见到,软件里面各种内嵌广告.

### 解决方法

#### 通过检查window.top等属性
在iframe src指向的文档中,添加以下逻辑
```js
//查看是否为顶层窗口,这个代码用于不允许窗口嵌套于任何文档中
if(window != window.top){
    window.top.location.href = correctURL;
}
```

```js
//只允许同源窗体
if (top.location.host != window.location.host) {
　　top.location.href = window.location.href;
}
```

#### X-Frame-Options
`X-Frame-Options`是一个响应头，主要是描述服务器的网页资源的`iframe`权限。目前的支持度是IE8+,有3个选项:

+ DENY：当前页面不能被嵌套iframe里，即便是在相同域名的页面中嵌套也不允许,也不允许网页中有嵌套`iframe`
+ SAMEORIGIN：`iframe`页面的地址只能为同源域名下的页面
+ ALLOW-FROM：可以在指定的`origin url`的`iframe`中加载

`X-Frame-Options`其实就是将前端js对`iframe`的把控交给服务器来进行处理。

#### CSP网页防护
和`X-Frames-Options`一样，都需要在服务器端设置好相关的响应头。 CSP的作用， 真的是太大了，他能够极大的防止你的页面被XSS攻击，而且可以制定js,css,img等相关资源的`origin`，防止被恶意注入。不过他的兼容性,较差。目前支持Edge12+ 以及 IE10+。

而且目前市面上，流行的是3种CSP头，以及各种浏览器的兼容性

使用主要是在后端服务器上配置，在前端，我们可以观察`Response Header`里是否有这样的一个Header:`Content-Security-Policy: default-src 'self'`

这就表明，你的网页是启用CSP的。通常我们可以在CSP后配置各种指定资源路径，有
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

child-src就是用来指定iframe的有效加载路径。其实和X-Frame-Options中配置allow-origin是一个道理。不过,allow-origin 没有得到厂商们的支持。
而，sandbox其实就和iframe的sandbox属性（下文介绍）,是一样一样的，他可以规定来源能够带有什么权限.

例如：
`Content-Security-Policy: child-src 'self' http://example.com; sandbox allow-forms allow-same-origin`

此时，iframe的src就只能加载同域和`example.com`页面。 最后再补充一点: 使用CSP 能够很好的防止XSS攻击，原理就是CSP会默认`escape`掉内联样式和脚本，以及`eval`执行。但是，你可以使用`srcipt-src`进行降低限制.

`Content-Security-Policy: script-src 'unsafe-inline'`
如果想更深入的了解CSP,可以参阅:[CSP](https://imququ.com/post/content-security-policy-reference.html)

**以上针对的是iframe自己的网页**

#### sandbox属性
在iframe元素上设置该属性可以限制iframe元素中的内容,具体有以下属性(IE10+):
配置|效果
----|----
allow-forms|允许进行提交表单
allow-scripts|运行执行脚本
allow-same-origin|允许同域请求,比如ajax,storage
allow-top-navigation|允许iframe能够主导window.top进行页面跳转
allow-popups|允许iframe中弹出新窗口,比如,window.open,target="_blank"
allow-pointer-lock|在iframe中可以锁定鼠标，主要和鼠标锁定有关