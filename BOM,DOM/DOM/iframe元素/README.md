# iframe 详解

## iframe 元素常用属性

-   frameborder:是否显示边框，1(显示),0(不显示)
-   height:框架作为一个普通元素的高度，建议在使用 css 设置。
-   width:框架作为一个普通元素的宽度，建议使用 css 设置。
-   name:框架的名称，`window.frames[name]`时专用的属性。
-   scrolling:框架的是否滚动。`yes,no,auto`。
-   src：内框架的地址，可以使页面地址，也可以是图片的地址。
-   srcdoc: 用来替代原来 HTML body 里面的内容。但是 IE 不支持
-   sandbox: 启用一系列对`<iframe>`中内容的额外限制。，IE10+支持

## 获取文档中 iframe 元素的顶层对象(window)

这里的意思就是在拥有该元素的文档怎么访问 iframe 元素的 window 对象(前提是同域),有两种方法：

1. 直接通过`document.frames[name]`或`document.frames[index]`就可以访问窗体的`window`对象,`document.frame`是文档中所有`iframe`元素`window`对象的集合
2. 通过具体的元素的`contentWindow`或`contentDocument`属性访问,它们分别获得窗体的`Window`对象和`Document`对象

## 在 iframe 元素中获取外层父文档的顶层对象(window)

同样是同源的情况下, 可以通过`window.parent`或`window.top`获取,具体情况看它们的嵌套关系, `window.parent`获取的为上一层窗体,`window.top`获取的是最顶层窗体, 当只有一个嵌套关系时两者相等

## iframe 的轮询

由来：为了兼容 IE8+等低级浏览器, 防止提交表单时跳转网页, 需要用 iframe 作为表单提交的工具。

实现：通过在`ajax`的`readyState = 4`时,再次执行原异步请求函数。在`iframe`中通过`iframe.onload`事件与`reload`反复触发来进行数据获取, 当然也可以通过直接删除、添加该元素来达到目的

## iframe 来进行广告刊登

原因：文档自带广告会引入额外的 css 文件和 js 文件,带来一系列安全问题, 这个问题在 iframe 中被很好的解决

### 自适应 iframe

默认情况下,iframe 会自带滚动条且为一个小窗体,然后在设置 iframe 高度为 src 指定文档的高度即可：

```html
<iframe src="target.html" scrolling="no"></iframe>
<script>
    let iw = document.frames[0]
    let ifr = document.querySelector('iframe')
    ifr.height = iw.body.offsetHeight
</script>
```

另外还有一个 allowfullscreen(attribute)属性,当 true 时表示允许 iframe 全屏, 关于它的兼容性, 我测过的浏览器都没体现出来能行(Chorme,firefox)

## iframe 安全问题

见[BOM 浏览器安全问题](../../BOM/浏览器安全问题/README.md)

### sandbox 属性

在 iframe 元素上设置该属性可以限制 iframe 元素中的内容,具体有以下属性(IE10+):
配置|效果
----|----
allow-forms|允许进行提交表单
allow-scripts|运行执行脚本
allow-same-origin|允许同域请求,比如 ajax,storage
allow-top-navigation|允许 iframe 能够主导 window.top 进行页面跳转
allow-popups|允许 iframe 中弹出新窗口,比如,window.open,target="\_blank"
allow-pointer-lock|在 iframe 中可以锁定鼠标，主要和鼠标锁定有关
