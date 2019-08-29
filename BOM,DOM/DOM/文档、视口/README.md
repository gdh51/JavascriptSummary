# 文档坐标和视口坐标
元素的位置是以像素来度量的，向右代表X坐标的增加，向下代表Y坐标的增加。
但是有两个不同的点可以用作为坐标系的源点：元素的X和Y坐标或相对于在其中显示文档的视口的左上角。

如果文档比视口小，或者说它还未出现滚动，则文档的左上角就是视口的左上角，文档和视口坐标系统是同一个。

**文档坐标在用户滚动时不会发生变换**

## 获取滚动位置
*正常情况*下，通过`document.documentElement`来获取`scrollLeft`和`scrollTop`。*怪异模式*下，在`document.body`获取

**实际上两个属性在不同浏览器表示都不一样,为了兼容请用条件选择同时检查两个的值**

也可以通过`window.pageXOffset`、`window.pageYOffset`来获取。（IE8及其以下无此属性）

## 查询元素的几何尺寸
判断一个元素尺寸和位置最简单的方法是调用它的`getBoundingClientRect()`方法，没有参数。返回一个`DOMRect`对象，`left`和`top`属性表示元素左上角的`(left, top)`坐标，`right`和`bottom`表示元素右下角的`(rgith, bottom)`坐标，同时也表示相对于*起始坐标*的位移。这个方法返回的是相对于*视口坐标*的位置。

**返回的矩形包含边框与内边距**。
在内联元素中，特别是被分为几行的的内联元素被调用时矩形会包含每行的宽度；如果要查询每个内联元素中那个独立的矩形，可以通过`getClientRects()`方法，返回一个只读的类数组。
（两个方法返回的都是静态快照）

## 判断元素在某点
使用Document对象的`elementFromPoint()`方法来判定视口指定位置有什么元素，接收两个参数，表示视口的`(x, y)`坐标，返回指定位置的一个元素。

## 滚动
+ `window.scrollTo(x, y)`方法，使指定坐标尽量出现在视口的左上角。

+ `window.scrollBy(x, y)`方法，相对于前位置进行滚动

+ `Elemennt.scrollIntoView(boolean)`方法，使元素进入视口，传入`true`时，试图使元素上边缘与视口上边缘接近，反之下边缘接近。该方法视为和`window.location.hash`命名锚点产生的行为类似。

## 元素尺寸、位置和溢出的更多信息
任何元素的只读属性`offsetWidth`和`offsetHeight`以CSS像素返回它们的屏幕尺寸。返回的尺寸*包含元素的边框和内边距，除去外边距*。

所有HTML元素都有`offsetLeft`与`offsetTop`属性来返回元素的X和Y坐标，该坐标是相对于**离该元素最近的已定位祖先元素的坐标**。`offsetParent`属性就指定了这些的相对的父元素。

当然*可以通过叠加算出离文档的距离*。

内容区是视口，当实际内容比视口更大时，需要把元素的滚动条位置考虑进去。

元素的`clientWidth`和`clientHeight`只包含内边距与边框（不包含滚动条且内联元素此属性为0）`clientLeft`与`clientTop`通常返回元素边框的宽度，如果有滚动条则包括滚动条宽度。

`scrollWidth`与`scrollHeight`是元素的内容区域加上它的内边距加上任何溢出内容的尺寸。没有溢出时和`clientWitdh`相等。

`scrollTop`与`scrollLeft`指定元素离文档最上方和最左变的位置。（设置它可以使元素滚动）

## 元素大小
这一段本该记录在节点属性中,但因为比较重要单独抽了出来

+ `document.body`:代表`body`元素
+ `document.documentElement`:代表`html`元素

### Element.offsetHeight/Element.offsetWidth, Element.offsetTop/Element.offsetLeft
先给出解释：
`Element.offsetHeight`与`Element.offsetWidth`的长度为元素在可视区域中的  **内容+内边距+边框**的大小

`Element.offsetTop/Element.offsetLeft`根据目标元素距离最近的`Element.offsetParent`来测量距离，而`Element.offsetParent`为离该元素最近的已定位的父元素（没有则为`body`）

可以看出`Element.offsetTop/Element.offsetLeft`实际为子与父`border`中间的距离（以上属性只为可读，每次访问都需要重新计算消耗内存巨大）

### Element.clientWidth/Element.clientHeight
为指定元素在可视区域中的 **内边距+内容** 的大小

当使用`document.documentElement.clientWidth/clientHeight`用于确认浏览器视窗的大小（不包括工具栏/滚动条）

### Window.innerHeight/Window.innerWidth,Window.outerHeight/Window.outerWidth
`Window.innerHeight/Window.innerWidth`返回当前可视窗口的大小（各大主流浏览器，**包含滚动条**）

`Window.outerHeight/Window.outerWidth`返回当前整个浏览器窗口的大小

Note:国内部分浏览器内核为早期的chrome版本` innerHeight = outerHeight `即视口大小，如下方的搜狗浏览器

IE8及其以下时，上述无效（IE中无以上属性），必须使用`document.documentElement.clientHeight/clientWidth`获取视口大小（不包含滚动条宽度）

### Element.scrollHeight/Element.scrollWidth, Element.scrollTop/Element.scrollLeft
`Element.scrollHeight/Element.scrollWidth`为元素在文档中的真实的内容区域大小——**内容+内边距**,但当查询`document.documentElement.scrollHeight`有些浏览器为整个HTML元素的*内边距+内容+边框+外边距*,但各个浏览器的行为都不同,应避免使用查询html元素

`Element.scrollTop/Element.scrollLeft`表示该元素被隐藏的上侧或左侧的长度（设置这个属性可以改变元素的滚动位置）

### Element.getBoundingClientRect()
每个元素都拥有一个该方法,调用后返回一个表示自身矩形对象,它的`left`和`top`属性表示元素左上角的`(left, top)`坐标，`right`和`bottom`表示元素右下角的`(rgith, bottom)`坐标，同时也表示相对于*起始坐标*的位移。

`height`、`width`表示 **内容+内边距+边框**

这些属性表示元素相对于*视口坐标*的位置（可见的位置），
x、y表示矩形的左上角起点位置左边（IE7及其以下的初始位置为(2, 2)），

**返回的矩形包含边框与内边距**。
在内联元素中，特别是被分为几行的的内联元素被调用时矩形会包含每行的宽度；如果要查询每个内联元素中那个独立的矩形，可以通过`getClientRects()`方法，返回一个只读的类数组。
（两个方法返回的都是静态快照）

### 总结查看视口大小
1. （视窗）不包含滚动条、工具栏的情况
主流浏览器：`document.documentElement.clientWidth`
IE8及其以下: `document.documentElement.clientHeight`

2. （视窗）包含滚动条（无工具栏）的情况主流浏览器：window.innerHeight
IE8及其以下：无

3. 整个浏览器的大小
主流浏览器：`window.outerHeight`
IE8及其以下：无