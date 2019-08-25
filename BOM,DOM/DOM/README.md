# DOM

## DOM概览
HTML文档的树状结构包含表示HTML标签或元素和表示文本字符串的节点，它也可能包含表示HTML注释节点。
`Document`、`Element`和`Text`是`Node`的子类
```js
Document.prototype instanceof Node //true
```
Node及子类原型链大致结构:

|--Node
   |--Document
   |  |--HTMLDocument
   |
   |--Attr
   |--CharacterData
   |  |--Text
   |  |--Comment
   |
   |--Element
      |--HTMLElement
         |--HTMLTitleElement
         |--HTMLHeadElement
         |--HTMLBodyElement
         |--HTMLParagraphElement
         |--HTMLInputElement
         |--etc...

`Document`类型代表一个HTML或XML文档，`Element`类型代表该文档的一个元素。`HTMLDocument`和`HTMLElement`子类只是针对于HTML文档和元素。

选取文档的元素
+ 用指定的`id`属性
+ 用指定的`name`属性
+ 用指定的标签名字
+ 用指定的`css`类
+ 匹配指定的`css`选择器

### DOM操作方法

#### getElementsByName()
`getElementsByName()`定义在`HTMLDocument`类中，而不在`Document`类中，所有它只对HTML文档有用，在XML中不能用。返回一个`NodeList`对象，一个包含若干`Element`对象的只读数组。（在IE9及其以下版本中会同时返回`id`为此的元素） 设置了`name`的元素也会在`document`对象上创建一个属性。

#### getElementsByTagName()
`getElementsByTagName()`：`document`对象和`Element`对象都有的方法，但`Element`对象只能查找后代元素。

#### document.createElement()
创建新的`Element`节点，参数为元素的标签名字符串表达式。

#### document.createTextNode()
创建一个文本节点，参数为文本内容

#### Element.cloneNode()
每个节点有`cloneNode()`方法来返回该节点的一个全新的副本，可以传入一个`boolean`值表示是否深度复制节点内容（深复制复制所有后代节点）

#### document.importNode()
给它传入另一个文档的一个节点，它将返回适合当前文档插入的节点的副本，传入第二个参数`true`时，会复制节点的子节点。

#### 以下开始，调用的节点为要操作节点的父节点

#### Element.appendChild(node)
插入指定的节点成为调用节点的最后一个子节点

#### Element.insertBefore(beInsertNode,insertNode)
接收两个参数，第一个是待插入的节点,第二个是已存在的节点;新节点将插入到该节点的前面; 第二个参数传入`null`时插入到最后一个节点。

该方法应该在新节点的父节点上调用，因为第二个参数必须是调用节点的子节点

*当用以上方法来操作已存在于文档的节点时，会从它所在的位置删除并插入到新的位置*

#### removeChild()
从文档树中删除一个节点，该方法必须在删除节点的父节点上调用。

#### replaceChild()
删除一个子节点并用一个新节点取而代之。，第一个参数是新节点，第二个参数是需要代替的节点。

#### 到此结束，调用的节点为要操作节点的父节点

#### 使用DocumentFragment
`DocumentFragment`是一种特殊的`Node`，它作为其他节点的一个临时容易。
可以用`document.createDcoumentFragment()`创建。它的特殊之处在于在被添加到其他文档时，该文档的所有子节点会被插入到文档中，而不是整个文档本身。

#### Element集合
`document`对象由于历史原因定义了一些快捷属性来访问各种各样的节点，如`images`、`links`、`img`、*只包含href属性的a*、*form元素的HTMLColection对象*。除此之外还有`embeds`、`plugins`、`script`、`anchors`属性。（anchors指有name属性的a标签）

`NodeList`与`HTMLCollection`对象都定义了`item`方法，该方法和数组索引一样。`HTMLCollection`定义了`namedItem`方法，它返回指定属性名的值。而且这两个对象是动态更新的。

HTML元素有一个`className`字符串属性来保存`class`属性的值，可以通过
`getElementsByClassName()`传入`class`名来查询有该名的元素，多个`class`属性之间用空格分隔。
```js
//查询具有两个class的元素
document.getElementsByClassName("woio wdsd");
```
`querySelectorAll()`返回的`Nodelist`对象不是实时的。（IE8及其以下未实现）

### 节点的属性及其特性
在定义HTML元素时,会有两种属性：
+ `property`是DOM中的属性，是JavaScript里的对象；(会动态更新)
+ `attribute`是HTML标签上的特性，它的值只能够是字符串；

#### HTML元素特性(attribute)
HTML元素的属性值代表了这些元素的`HTMLElement`对象的属性值（`attribute`）中是可用的。

该属性定义在Element的attribute属性上,返回一个NameNodeMap对象,表示属性集合

`HTMLElement`定义了通用的`HTTP`属性，以及事件处理程序属性；特定的`Element`子类型为其元素定义了特定的属性：例如`img`元素的`HTMLElement`对象的`src`属性;
一些HTML属性在Javascript中是保留字，如HTML的`for`属性（`<label>`元素）在javascript中变为`htmlFor`，`class`属性变为`className`; 任何HTML元素的`style`属性是`CSSStyleDeclaration`对象。

##### 获取和设置非标准HTML属性
`Element`定义了`getAttribute()`和`setAttribute()`方法来查询和设置非标准的HTML属性(`attribute`)，也可以用来查询和设置XML文档元素的属性; `Element`元素还定义了`hasAttribute()`和`removeAttribute()`方法，用来检测命名属性是否存在和完全删除属性。

如果操作包含来自其他命名空间属性的XML文档，可以使用这4个方法的命名空间版本：*后加NS*。这些方法需要两个参数，第一个为标识命名空间的URI; 第二个通常是属性的本地名字，在命名空间中是无效的。但特别的是，`setAttributeNS()`的第二个参数应该是属性的有效名字，它包含命名空间的前缀。

#### DOM中的属性(property)
`document`对象、它的`Element`对象和文档中表示文本的`Text`对象都是Node对象。Node定义了以下重要的属性：

+ `parentNode`: 该节点的父节点，`document`对象没有，值为`null`

+ `childNodes`: 只读的类数组对象（`NodeList`），它是该节点的子节点的实时表示。

+ `firstChild`、`lastChild`: 该节点的子节点的第一个和最后一个，如果该节点没有子节点则为`null`

+ `nextSibling`、`previoursSibling`: 该节点的兄弟节点中的前一个和下一个。

+ `nodeType`: 该节点的类型，9代表*文档*，1表示`Element`节点，3表示`text`节点，8表示`comment`节点，11表示`documentFragment`节点。

+ `nodeValue`: `Text`节点或`Comment`节点的文本内容

+ `nodeName`: 元素的标签名，以*大写形式*表示

+ `innerHTML`:读取`Element`的`innerHTML`属性作为字符串标记返回那个元素的内容。在元素上设置该属性调用来了Web浏览器解析器，用新字符串内容的解析展现形式替换元素的当前内容。（XML元素上也可以使用）。注意对`innerHTML`属性用`+=`操作符重复追加一小段文本通常**效率低下**，因为它既要序列化又要解析。

+ `outerHTML`:返回同`innerHTML`字符串还包含了被查询元素的开头和结尾标签。*只有Element节点定义了该属性，document没有*。

+ `Element.insertAdjacentHTML()`:将任意的HTML标记字符串插入到指定的元素相邻位置。第一个参数是插入的位置，可以是`beforebegin`（元素之前）、`afterbegin`（子节点第一个）、`beforeend`（子节点最后一个）、`afterend`（元素之后），第二个参数是标记的HTML字符串。

+ `textContent`:查询纯文本形式的元素内容，或者在文档中插入纯文本，标准方法是使用`Node`的`textContent`属性。（IE8及其以下无）这个属性和`innerText`相似，但有区别`textContent`属性会将元素中，所有文本包括子元素文本拼接在一起，按在文档中出现的格式。而`innerText`会将子元素中文本进行换行，通常没有确定的行为。
  ```html
  <div id='box1'>
    <p>???</p>!!!
  </div>
  <script>
  document.getElementById('box1').innerText;//
  //???
  // 空格空格
   //!!!
  document.getElementById('box1').textContent;//???!!!
  </script>
  ```
+ **特例**——`script`元素中的文本:`scrip`元素有一个`text`属性用来获取它们的文本。浏览器不现实`script`元素的内容，并且HTML解析器忽略脚本的尖括号和星号，所以可以用`script`元素来存放文本数据。只需要简单的将元素的type属性设置为某些值如：(`text/x-custom-data`)，这样设置后`javascript`解释器会忽略该脚本。
`Text`和`CDATASection`都是`CharacterData`的子类型，`CharacterData`定义了`Data`属性，它和`nodeValue`的文本相同。

#### 数据集属性
HTML5在`Element`对象上定义了`dataset`属性。它的各个属性对应去掉前缀`data—属性`。所以`dataset.name`保存着`data-name`的值。带连字符的属性对应于驼峰命名法属性名：`data-name-id`属性就变成`data.nameId`。

#### 一些特殊的元素的属性
+ 表单和元素属性
`Form`对象中有`action`、`encoding`、`method`、`target`属性对应其HTML属性，还有一个`elements`数组，存放着该元素内所有的表单元素

每个`Form`元素都有一个`onsubmit`事件处理程序来检测表单提交，还有一个`onreset`属性来检查表单重置。表单提交前调用`onsubmit`程序；它通过返回`false`能取消提交动作。（验证用户错误）注意：`onsumit`只能通过点击提交按钮提交，通过js方法调用会触发该事件。

`onreset`事件同理。（在IE中`focus`事件无法通过js触发）

+ 选择框和选项元素
`Select`元素定义了`options`属性，它是一个包含了多个`Option`元素的类数组对象，针对单选，`Select`元素的`selectedIndex`中指定了哪个选项当前被选中。针对多选，该属性只会显示选中第一个值的索引，只有通过`selected`属性查找选中项。每个`Option`对象有一个`text`属性表示它们的文本值，`value`属性表示提交表单时发送的值。通过设置`options.length`可以截断数组，将数组中某个值设置为`null`可以移除某个`Option`对象，其他会自动填充。

用`Option`的构造函数创建一个`option`对象：接收4个参数，`text`属性、`value`属性、`defaultSelected`属性、`selected`属性。然后可以通过数组添加的方法像`options`类数组添加该对象。

+ Document的属性
  + `cookie`：允许javascript读写`HTTP cookie`的特殊属性
  + `domain`：运行Web页面交互时，相同域名下互相信任的web服务器之间协作放宽同源策略安全限制。
  + `lastModified`：最后一次修改文档的时间
  + `refferer`：如果有，表示是导航到当前文档的上一个文档
  + `title`：元素`title`间的文本
  + `URL`：文档的URL，只读字符串而不是对象。属性与location.href的初始值相同，不会动态变化。
  + `document.write()`:该方法会将字符串参数连接起来，然后将结果字符串插入到文档中调用它的脚本元素的位置。当脚本结束，浏览器解析生成的输出并显示它。只有在解析文档时才能使用write方法输出HTML到当前文档，所以能在script元素中的顶层代码中调用该方法。如果将该方法用于事件处理程序，那么它会擦除当前文档和它包含的脚本；第一次调用其他文档的
  + `write()`:会擦除该文档的所有内容。


### 作为元素树的文档
将文档看成是`Element`树，忽略部分文档：忽略`Text`和`Comment`节点。
`Element`对象的`children`属性，返回一个`HTMLCollection`对象。如此的还有：
`firstElementChild`，`lastElementChild`、`nextElementSibling`、`previoursElementSibling`、`childElementCount`。`childElementCount`属性b表示子元素个数，与`children.length`相等。（IE8及其以下不支持后面的属性）。

`Element`和`HTMLDocument`等类型是类，它们不是构造函数，但它们有原型对象，可以用自定义方法拓展它们（IE8支持`Element`、`HTMLDocument`和`Text`的可扩展性，但不支持`Node`、`Document`、`HTMLElement`或子类性的扩可在的属性）

### 文档坐标和视口坐标
元素的位置是以像素来度量的，向右代表X坐标的增加，向下代表Y坐标的增加。
但是有两个不同的点可以用作为坐标系的源点：元素的X和Y坐标或相对于在其中显示文档的视口的左上角。

如果文档比视口小，或者说它还未出现滚动，则文档的左上角就是视口的左上角，文档和视口坐标系统是同一个。

**文档坐标在用户滚动时不会发生变换**

#### 获取滚动位置
*正常情况*下，通过`document.documentElement`来获取`scrollLeft`和`scrollTop`。*怪异模式*下，在`document.body`获取

**实际上两个属性在不同浏览器表示都不一样,为了兼容请用条件选择同时检查两个的值**

也可以通过`window.pageXOffset`、`window.pageYOffset`来获取。（IE8及其以下无此属性）

#### 查询元素的几何尺寸
判断一个元素尺寸和位置最简单的方法是调用它的`getBoundingClientRect()`方法，没有参数。返回一个`DOMRect`对象，`left`和`top`属性表示元素左上角的`(left, top)`坐标，`right`和`bottom`表示元素右下角的`(rgith, bottom)`坐标，同时也表示相对于*起始坐标*的位移。这个方法返回的是相对于*视口坐标*的位置。

**返回的矩形包含边框与内边距**。
在内联元素中，特别是被分为几行的的内联元素被调用时矩形会包含每行的宽度；如果要查询每个内联元素中那个独立的矩形，可以通过`getClientRects()`方法，返回一个只读的类数组。
（两个方法返回的都是静态快照）

#### 判断元素在某点
使用Document对象的`elementFromPoint()`方法来判定视口指定位置有什么元素，接收两个参数，表示视口的`(x, y)`坐标，返回指定位置的一个元素。

#### 滚动
+ `window.scrollTo(x, y)`方法，使指定坐标尽量出现在视口的左上角。

+ `window.scrollBy(x, y)`方法，相对于前位置进行滚动

+ `Elemennt.scrollIntoView(boolean)`方法，使元素进入视口，传入`true`时，试图使元素上边缘与视口上边缘接近，反之下边缘接近。该方法视为和`window.location.hash`命名锚点产生的行为类似。

#### 元素尺寸、位置和溢出的更多信息
任何元素的只读属性`offsetWidth`和`offsetHeight`以CSS像素返回它们的屏幕尺寸。返回的尺寸*包含元素的边框和内边距，除去外边距*。

所有HTML元素都有`offsetLeft`与`offsetTop`属性来返回元素的X和Y坐标，该坐标是相对于**离该元素最近的已定位祖先元素的坐标**。`offsetParent`属性就指定了这些的相对的父元素。

当然*可以通过叠加算出离文档的距离*。

内容区是视口，当实际内容比视口更大时，需要把元素的滚动条位置考虑进去。

元素的`clientWidth`和`clientHeight`只包含内边距与边框（不包含滚动条且内联元素此属性为0）`clientLeft`与`clientTop`通常返回元素边框的宽度，如果有滚动条则包括滚动条宽度。

`scrollWidth`与`scrollHeight`是元素的内容区域加上它的内边距加上任何溢出内容的尺寸。没有溢出时和`clientWitdh`相等。

`scrollTop`与`scrollLeft`指定元素离文档最上方和最左变的位置。（设置它可以使元素滚动）

### 元素大小
这一段本该记录在节点属性中,但因为比较重要单独抽了出来

+ `document.body`:代表`body`元素
+ `document.documentElement`:代表`html`元素

#### Element.offsetHeight/Element.offsetWidth, Element.offsetTop/Element.offsetLeft
先给出解释：
`Element.offsetHeight`与`Element.offsetWidth`的长度为元素在可视区域中的  **内容+内边距+边框**的大小

`Element.offsetTop/Element.offsetLeft`根据目标元素距离最近的`Element.offsetParent`来测量距离，而`Element.offsetParent`为离该元素最近的已定位的父元素（没有则为`body`）

可以看出`Element.offsetTop/Element.offsetLeft`实际为子与父`border`中间的距离（以上属性只为可读，每次访问都需要重新计算消耗内存巨大）

#### Element.clientWidth/Element.clientHeight
为指定元素在可视区域中的 **内边距+内容** 的大小

当使用`document.documentElement.clientWidth/clientHeight`用于确认浏览器视窗的大小（不包括工具栏/滚动条）

#### Window.innerHeight/Window.innerWidth,Window.outerHeight/Window.outerWidth
`Window.innerHeight/Window.innerWidth`返回当前可视窗口的大小（各大主流浏览器，**包含滚动条**）

`Window.outerHeight/Window.outerWidth`返回当前整个浏览器窗口的大小

Note:国内部分浏览器内核为早期的chrome版本` innerHeight = outerHeight `即视口大小，如下方的搜狗浏览器

IE8及其以下时，上述无效（IE中无以上属性），必须使用`document.documentElement.clientHeight/clientWidth`获取视口大小（不包含滚动条宽度）

#### Element.scrollHeight/Element.scrollWidth, Element.scrollTop/Element.scrollLeft
`Element.scrollHeight/Element.scrollWidth`为元素在文档中的真实的内容区域大小——**内容+内边距**,但当查询`document.documentElement.scrollHeight`有些浏览器为整个HTML元素的*内边距+内容+边框+外边距*,但各个浏览器的行为都不同,应避免使用查询html元素

`Element.scrollTop/Element.scrollLeft`表示该元素被隐藏的上侧或左侧的长度（设置这个属性可以改变元素的滚动位置）

#### Element.getBoundingClientRect()
每个元素都拥有一个该方法,调用后返回一个表示自身矩形对象,它的`left`和`top`属性表示元素左上角的`(left, top)`坐标，`right`和`bottom`表示元素右下角的`(rgith, bottom)`坐标，同时也表示相对于*起始坐标*的位移。

`height`、`width`表示 **内容+内边距+边框**

这些属性表示元素相对于*视口坐标*的位置（可见的位置），
x、y表示矩形的左上角起点位置左边（IE7及其以下的初始位置为(2, 2)），

**返回的矩形包含边框与内边距**。
在内联元素中，特别是被分为几行的的内联元素被调用时矩形会包含每行的宽度；如果要查询每个内联元素中那个独立的矩形，可以通过`getClientRects()`方法，返回一个只读的类数组。
（两个方法返回的都是静态快照）

#### 总结查看视口大小
1. （视窗）不包含滚动条、工具栏的情况
主流浏览器：`document.documentElement.clientWidth`
IE8及其以下: `document.documentElement.clientHeight`

2. （视窗）包含滚动条（无工具栏）的情况主流浏览器：window.innerHeight
IE8及其以下：无

3. 整个浏览器的大小
主流浏览器：`window.outerHeight`
IE8及其以下：无

### 遍历(该段可以忽略,基本上不会用)
遍历DOM元素的原生遍历器

#### NodeIterator
用`document.createNodeIterator（root,whatToShow，filter，entity..）`来创建一个它的新实例，一共接受4个参数
`root`表示开始搜索的起点结点

`whatToShow`表示需要访问的结点的代码（位掩码），可以用 | 或 & 同时进行多个组合筛选。（可以为数值位掩码，也可以为源码，如`1 = NodeFilter.SHOW_ELEMENT`）

`filter`是一个`NodeFilter`对象，表示应接受或拒绝某种特定节点的函数。不指定时填`null`。

`entityReferenceExpansion：true `或者`false` 表示是否要扩展实体的引用（HTML网页中无用）每个`NodeFilter`对象只有一个方法——`acceptNode()`：如果要访问该节点，该方法返回`NodeFilter.FILTER_ACCEPT`，不访问返回`NodeFilter.FILTER_SKIP`，跳过指定节点（也可以用`NodeFilter.FILTER_REJECT`）。不能直接创建`NodeFilter`对象，如果需要时，可以创建一个包含`acceptNode()`方法的对象，并在`createNodeIterator()`中的`filter`参数传入即可:
```js
let filter = {
    acceptNode: function (node) {
      return node.tagName.toLowerCase() == 'p'? NodeFilter.FILTER_ACCEPT: NodeFilter.FILTER_SKIP;
    }
  }
let Node1 = document.createNodeIterator(document, NodeFilter.SHOW_ELEMENT, filter, false);
```

也可以将`filter`直接写为`acceptNode()`函数:
```js
let filter = function(node){
  return node.tagName.toLowerCase() == 'p'? NodeFilter.FILTER_ACCEPT: NodeFilter.FILTER_SKIP;
}
```

`NodeIterator`类型有两个主要的方法为`nextNode()`与`previousNode()`顾名思义。初次调用`nextNode()`会返回根节点，当遍历到最后个节点时返回`null`
```js
  let iterator = document.createNodeIterator(document, NodeFilter.SHOW_ELEMENT, null, false);
  let node = Node1.nextNode();
  while (node!== null) {
    console.log(node.tagName);
    node = iterator.nextNode();
  }
```

#### TreeWalker
为`NodeIterator`的升级版，拥有`NodeIterator`的相同的方法（nextNode()与`previousNode()`），除此之外还拥有`NodeIterator`在不同方向上遍历DOM结构的方法。如下:

`parentNode()` `firstChild()` `lastChild()` `nextSibling()` `previousSibling()`

使用`document.createTreeWalker(root,whatToShow,filter,entity..)`创建一个实例，参数同`NodeIterator`。

在`TreeWalker`中 使用`NodeIterator`对象时，参数`NodeFilter.FILTER_SKIP`会跳过相应节点进入下一个节点，但是`NodeFilter.FILTER_REJECT`会跳过相应节点及该节点的*整个子树*

`TreeWalker`还有一个属性为`currentNode`，表示上一次遍历中返回的节点（及当前节点），可以用该属性修改遍历继续的起点。

### 范围(Range)
DOM2级中定义了`createRange()`

用`document.createRange()`可以创建一个DOM范围，拥有以下属性

+ `startContainer`与`endContainer`就是范围起点（终点）的父节点（第一个（最后一个）节点的父节点）

+ `startOffset`范围的偏移量。在文本、注释、CDATA节点中，此属性为范围起点跳过的字符数量。在其他中为范围中第一个子节点的索引。

+ `endOffset` 范围中最后一个子节点所在位置+1的位置。`startOffset+范围中子节点长度 = endOffset`

+ `commonAncestorContainer`:`startContainer`与`endContainer`的共同祖先节点中，最近的那个节点。

#### DOM范围简单选择（注意换行符也为文本节点）
+ `selectNode(node)`选择一个`node`节点来作为范围。
+ `selectNodeContainers(node)`选择一个`node`中的所有**子节点**来作为范围。

并拥有以下方法来设置起始节点与终点节点：
+ `setStartBefore(refNode)`在`refNode`前设置起点，**refNode作为第一个节点**。
+ `setStartAfter(refNode)`在`refNode`后设置起点，**refNode的下一个同辈节点作为第一个节点**。
+ `setEndBefore(refNode)`在`refNode`前设置终点，**refNode的上一个同辈节点作为最后一个节点**。
+ `setEndAfter(refNode)`在`refNode`后设置终点，所以**refNode为最后一个节点**。

#### DOM范围复杂选择
+ `setStart(参照节点，偏移量)`
+ `setEnd(参照节点，偏移量)`
以上两个方法都是直接设置起点与终点位置，参照节点为`startContainer/endContainer`即范围的父元素，偏移量为`startOffset(endOffset)`。

#### 操作DOM范围的内容
首先须知：范围会知道自身缺失什么开标签与闭标签，会重新构建有效的DOM结构。

它具有以下三个方法来直接操作DOM范围：
+ `deleteContents()`从文档中删除范围中中内容，无返回值（直
接反应到DOM上）（删除后自动补充了标签）

+ `extractContents()`从文档中删除范围中内容，返回删除的dom结构片段（自动补齐标签）                 可以用该片段插入到DOM其他地方

+ `cloneContents()`创建范围对象的一个副本，返回一个DOM节点

#### 插入DOM范围的内容
+ `insertNode(node)`可以在范围的开始处插入一个node节点

+ `surroundContents(node)`在范围处，先提取出范围的内容，然后覆盖在node节点上，在将node节点插入以前范围所在位置。（将范围替换为node节点，范围中内容放在node节点中）。

#### 折叠DOM范围（感觉没什么用）
用`collapse(true or false)`方法将范围中的`startOffset = endOffset`，`true`时两个值都等于起点的值，`false`时为终点值。

#### 比较DOM范围
用`compareBoundaryPoints(比较方式，比较的范围)`来比较两个范围的位置。
比较方式有4种 如下：
-|-
`Range.START_TO_START(0)` | 比较两个的起点
`Range.START_TO_END(1)` | 比较第一个的起点与第二个终点
`Range.END_TO_END(2)` | 比较两个的终点
`Range.END_TO_START(3)` | 比较第一个的终点与第二个的起点

当调用范围在参数范围对象之前时，返回-1，当调用范围在参数范围对象之后时，返回1，当两个在同一个位置时，返回0。

#### 复制范围副本
`cloneRange()`复制一个范围的副本，`cloneContents()`复制的是范围中的节点

#### IE8及其以下的范围
使用`document.body.createTextRange()`创建一个文本范围

1. 简单选择
使用`findText(文本内容，[数值])`方法，该方法会找到传入的文本内容并作为范围，没找到时返回`false`，找到时返回`true`，包含以下属性。还可以传入一个数值，表示向前（正数）继续搜索（负值向后）。（这些值都不会动态更新）

利用范围的`text`属性，可以查看范围中的文本。可以**修改直接反应在DOM上**

利用`htmlText`查看文本范围中HTML情况,利用`boundingWidth`查看范围的宽度

同时他也拥有同`selectNode()`方法相似的方法 `moveToElementText(element)`，该方法会选择`element`为范围。

2. 复杂选择
+ `move(移动单位，移动数值)`先折叠当前范围（同以前），然后在移动。（需重新设置起点终点）
+ `moveStart(同上)`移动范围起点
+ `moveEnd(同上)`移动范围终点
+ `expand(同上)`将范围中的部分选择的文本全部选中，如

移动单位为一种字符串值：
+ `character` 逐个字符地移动
+ `word` 逐个单词地移动（非空格字符）
+ `sentence` 逐个句子的移动（一系列以句号、问号、感叹号结尾的字符）
+ `textedit` 移动到当前范围的开始或结束位置

`pasteHTML(element)`向范围中插入html代码（将范围文本替换为HTML代码）

4. 折叠范围
`collapse(true of false)`同dom中方法一样。
5. 范围比较
`compareEndPotints(比较类型，比较的范围)` 返回结果与之前一样
比较类型有'StartToStart'、'StartToEnd'、'EndToEnd'、'EndToStart'

`isEqual(范围)`方法用于确认两个范围是否相等

`isRange(范围)`来确认一个范围是否包含另一个范围
6. 复制范围
`duplicate()`复制文本范围，返回一个副本

#### 查询选取的文本
`window/document.getSelection()`方法返回一个`Selection`对象。它的`toString()`方法返回选区的纯文本内容。

在IE8及其以下中该对象为`document.selection`属性，该对象的`createRange`方法返回一个`TextRange`对象，它的`text`属性包含了选区的文本

## MutationObserver
DOM4标准,监控DOM树所做的更改。它用来取代DOM3级事件中的`MutationEvent`,即`DOMNodeInserted`、`DOMNodeRemoved`、`DOMSubtreeModified`、`DOMAttrModified`、
`DOMCharacterDataModified`、`DOMNodeInsertedIntoDocument`和`DOMNodeRemovedFromDocument`事件,这些事件已经废弃,如使用请做好兼容

### 向后兼容,MutationEvent兼容性
+ `MutationEvent`在IE浏览器中最低支持到**IE9**
+ 在webkit内核的浏览器中，不支持`DOMAttrModified`事件
+ IE,Edge以及Firefox浏览器下不支持`DOMNodeInsertedIntoDocument`和`DOMNodeRemovedFromDocument`事件

`MutationEvent`中的所有事件都被设计成无法取消，如果可以取消`MutationEvent`事件则会导致现有的DOM接口无法对文档进行改变

### MutationObserver兼容性
IE11及其以上即可

### MutationObserver构造函数
```js
new MutationObserver(function(mutations, observer){
 //do somethings
});
```

创建并返回一个新的` MutationObserver `对象, 它会在指定的DOM发生变化时被调用, 接收一个回调函数, 每当被指定的节点或子树以及配置项有Dom变动时会被调用。

回调函数拥有两个参数：一个是描述所有被触发改动的`MutationRecord`对象数组，另一个是调用该函数的`MutationObserver`对象。

### MutationObserver对象方法
通过构造函数实例化会返回一个`MutationObserver`对象, 它有以下方法

#### MutationObserver.prototype.observe(target[, options])
配置了`MutationObserver`对象的回调方法以开始接收与给定选项匹配的DOM变化的通知。

+ target: 必选参数,表示DOM树中的一个要观察变化的DOM Node (可能是一个Element), 或者是被观察的子节点树的根节点。
+ options: 一个可选的`MutationObserverInit`对象，此对象的配置项描述了DOM的哪些变化应该提供给当前观察者的`callback`。

options对象参数里面有以下选项：
+ childList：设置`true`，表示观察目标子节点的变化，比如添加或者删除目标子节点，不包括修改子节点以及子节点后代的变化

+ attributes：设置`true`，表示观察目标属性的改变

+ characterData：设置`true`，表示观察目标数据的改变

+ subtree：设置为`true`，目标以及目标的后代改变都会观察

+ attributeOldValue：如果属性为`true`或者省略，则相当于设置为`true`，表示需要记录改变前的目标属性值，设置了`attributeOldValue`可以省略`attributes`设置

+ characterDataOldValue：如果`characterData`为`true`或省略，则相当于设置为`true`,表示需要记录改变之前的目标数据，设置了`characterDataOldValue`可以省略`characterData`设置

+ attributeFilter：如果不是所有的属性改变都需要被观察，并且`attributes`设置为`true`或者被忽略，那么设置一个需要观察的属性本地名称（不需要命名空间）的列表

#### MutationObserver.prototype.disconnect()
要停止这个`MutationObserver` （以便不再触发它的回调方法），需要调用`MutationObserver.disconnect()`方法。

#### MutationObserver.prototype.takeRecords()
返回已检测到但尚未由观察者的回调函数处理的所有匹配DOM更改的列表，使变更队列保持为空。

此方法最常见的使用场景是在断开观察者之前立即获取所有未处理的更改记录，以便在停止观察者时可以处理任何未处理的更改。

返回一个`MutationRecord`对象列表，每个对象都描述了应用于DOM树某部分的一次改动。

### MutationObserver 与 MutationEvent各事件的关系
|MutationEvent|	MutationObserver options|
|-------------|-------------------------|
|DOMNodeInserted|	{ childList: true, subtree: true }|
|DOMNodeRemoved|	{ childList: true, subtree: true }|
|DOMSubtreeModified|	{ childList: true, subtree: true }|
|DOMAttrModified|	{ attributes: true, subtree: true }|
|DOMCharacterDataModified|	{ characterData: true, subtree: true }|

### MutationRecord
变动记录中的属性如下：

+ type：如果是属性变化，返回"`attributes`"，如果是一个`CharacterData`节点（`Text`节点、`Comment`节点）变化，返回"`characterData`"，节点树变化返回"`childList`"
+ target：返回影响改变的节点
+ addedNodes：返回添加的节点列表
+ removedNodes：返回删除的节点列表
+ previousSibling：返回分别添加或删除的节点的上一个兄弟节点，否则返回null
+ nextSibling：返回分别添加或删除的节点的下一个兄弟节点，否则返回`null`
+ attributeName：返回已更改属性的本地名称，否则返回`null`
+ attributeNamespace：返回已更改属性的名称空间，否则返回`null`
+ oldValue：返回值取决于`type`。对于"`attributes`"，它是更改之前的属性的值。对于"`characterData`"，它是改变之前节点的数据。对于"`childList`"，它是`null`

其中 `type`、`target`这两个属性不管是哪种观察方式都会有返回值，其他属性返回值与观察方式有关，比如只有当`attributeOldValue`或者`characterDataOldValue`为`true`时`oldValue`才有返回值，只有改变属性时，`attributeName`才有返回值等。

[参考1](https://segmentfault.com/a/1190000012787829)
[参考2](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)