# DOM

其余内容快速链接:

-   [Range 范围对象](./Range范围对象)，用于范围操作`DOM`(目前基本上没有使用，如果你做符文本编辑器那么你需要了解它)
-   [关于文档与视口大小、元素大小计算](./文档、视口/README.md)
-   [DOM 节点遍历](<./NodeIterator(节点遍历器)/README.md>)
-   [MutationObserver API](./MutationObserver%20API/README.md)
-   [Intersection Observer API](./Intersection%20Observer%20API/README.md)
-   [ResizeObserver API](./ResizeObserver%20API/README.md)，观察元素尺寸变化
-   [一些特殊的元素需要关注的地方](#一些特殊的元素需要关注的地方)

## DOM 概览

HTML 文档的树状结构包含表示 HTML 标签或元素和表示文本字符串的节点，它也可能包含表示 HTML 注释节点。诸如`Document`、`Element`和`Text`是`Node`的子类

```js
Document.prototype instanceof Node //true
```

`Node` 及子类原型链大致结构:

<pre>
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
</pre>

`Document`类型代表一个 _HTML_ 或 _XML_ 文档，`Element`类型代表该文档的一个元素。`HTMLDocument`和`HTMLElement`子类只是针对于 _HTML_ 文档和元素。

选取文档的元素

-   用指定的`id`属性
-   用指定的`name`属性
-   用指定的标签名字
-   用指定的`css`类
-   匹配指定的`css`选择器

### DOM 操作方法

#### document.getElementsByName()

`getElementsByName()`定义在`HTMLDocument`类中，而不在`Document`类中，所有它只对 HTML 文档有用，在 XML 中不能用。返回一个`NodeList`对象，一个包含若干`Element`对象的只读数组。（在 IE9 及其以下版本中会同时返回`id`为此的元素） 设置了`name`的元素也会在`document`对象上创建一个属性。

#### document.getElementsByTagName()

`getElementsByTagName()`：`document`对象和`Element`对象都有的方法，但`Element`对象只能查找后代元素。

#### document.querySelector()

通过`CSS`选择器来匹配某个元素，返回匹配到的第一个元素。

> `document.querySelectorAll()`可以返回匹配的所有元素

#### document.createElement()

创建新的`Element`节点，参数为元素的标签名字符串表达式。

#### document.createTextNode()

创建一个文本节点，参数为文本内容

#### Node.cloneNode()

每个节点有`cloneNode()`方法来返回该节点的一个全新的副本，可以传入一个`boolean`值表示是否深度复制节点内容（深复制会复制所有后代节点）

#### document.importNode()

给它传入另一个文档的一个节点，它将返回适合当前文档插入的节点的副本，传入第二个参数`true`时，会复制节点的子节点。

#### Node.appendChild(node)

插入指定的节点成为调用节点的最后一个子节点

#### Node.insertBefore(beInsertNode, insertNode)

接收两个参数，第一个是待插入的节点,第二个是已存在的节点;新节点将插入到该节点的前面; 第二个参数传入`null`时插入到最后一个节点。

该方法应该在新节点的父节点上调用，因为第二个参数必须是调用节点的子节点

_当用以上方法来操作已存在于文档的节点时，会从它所在的位置删除并插入到新的位置_

#### Node.removeChild(childNode)

从文档树中删除一个节点，该方法必须在删除节点的父节点上调用，并指定被删除的节点。删除完成后该方法会返回被删除的节点。

```js
let oldChild = node.removeChild(child)
```

#### Node.replaceChild(newChild, oldChild)

删除一个子节点并用一个新节点取而代之。，第一个参数是新节点，第二个参数是需要代替的节点。

#### 使用 DocumentFragment

`DocumentFragment`是一种特殊的`Node`，它作为其他节点的一个临时容器。
可以用`document.createDcoumentFragment()`创建。它的特殊之处在于在被添加到其他文档时，该文档的所有子节点会被插入到文档中，而不是整个文档本身。

### Element 集合

`document`对象由于历史原因定义了一些快捷属性来访问各种各样的节点，如`images`、`links`、`img`、_只包含 href 属性的 a_、_form 元素的 HTMLColection 对象_。除此之外还有`embeds`、`plugins`、`script`、`anchors`属性。（anchors 指有 name 属性的 a 标签）

`NodeList`与`HTMLCollection`对象都定义了`item`方法，该方法和数组索引一样。`HTMLCollection`定义了`namedItem`方法，它返回指定属性名的值。而且这两个对象是动态更新的。

_HTML_ 元素有一个`className`字符串属性来保存`class`属性的值，可以通过
`getElementsByClassName()`传入`class`名来查询有该名的元素，多个`class`属性之间用空格分隔。

```js
//查询具有两个class的元素
document.getElementsByClassName('woio wdsd')
```

`document.querySelectorAll()`返回的`Nodelist`对象不是实时的。（IE8 及其以下未实现）

### 节点的属性及其特性

在定义 HTML 元素时,会有两种属性：

-   `property`是 DOM 中的属性，是 Javascript 里的对象；(会动态更新)
-   `attribute`是 HTML 标签上的特性，它的值只能够是字符串；

#### HTML 元素特性(attribute)

HTML 元素的属性值代表了这些元素的`HTMLElement`对象的属性值（`attribute`）中是可用的。

> 该属性定义在`Element`的`attribute`属性上,返回一个`NameNodeMap`对象,表示属性集合

`HTMLElement`定义了通用的`HTTP`属性，以及事件处理程序属性；特定的`Element`子类型为其元素定义了特定的属性：例如`img`元素的`HTMLElement`对象的`src`属性;

一些 HTML 属性在 Javascript 中是保留字，如 HTML 的`for`属性（`<label>`元素）在 Javascript 中变为`htmlFor`，`class`属性变为`className`; 任何 HTML 元素的`style`属性是`CSSStyleDeclaration`对象。

##### 获取和设置非标准 HTML 属性

`Element`定义了`getAttribute()`和`setAttribute()`方法来查询和设置非标准的 HTML 属性(`attribute`)，也可以用来查询和设置 XML 文档元素的属性; `Element`元素还定义了`hasAttribute()`和`removeAttribute()`方法，用来检测命名属性是否存在和完全删除属性。

> 如果操作包含来自其他命名空间属性的 XML 文档，可以使用这 4 个方法的命名空间版本：_后加 NS_。这些方法需要两个参数，第一个为标识命名空间的 URI; 第二个通常是属性的本地名字，在命名空间中是无效的。但特别的是，`setAttributeNS()`的第二个参数应该是属性的有效名字，它包含命名空间的前缀。

#### DOM 中的属性(property)

`document`对象、它的`Element`对象和文档中表示文本的`Text`对象都是 _Node_ 对象。_Node_ 定义了以下重要的属性：

-   `parentNode`: 该节点的父节点，`document`对象没有，值为`null`

-   `childNodes`: 只读的类数组对象（`NodeList`），它是该节点的子节点的实时表示。

-   `firstChild`、`lastChild`: 该节点的子节点的第一个和最后一个，如果该节点没有子节点则为`null`

-   `nextSibling`、`previoursSibling`: 该节点的兄弟节点中的前一个和下一个。

-   `nodeType`: 该节点的类型，9 代表*文档*，1 表示`Element`节点，3 表示`text`节点，8 表示`comment`节点，11 表示`documentFragment`节点。

-   `nodeValue`: `Text`节点或`Comment`节点的文本内容

-   `nodeName`: 元素的标签名，以*大写形式*表示

-   `innerHTML`:读取`Element`的`innerHTML`属性作为字符串标记返回那个元素的内容。在元素上设置该属性调用来了 Web 浏览器解析器，用新字符串内容的解析展现形式替换元素的当前内容。（XML 元素上也可以使用）。注意对`innerHTML`属性用`+=`操作符重复追加一小段文本通常**效率低下**，因为它既要序列化又要解析。

-   `outerHTML`:返回同`innerHTML`字符串还包含了被查询元素的开头和结尾标签。_只有 Element 节点定义了该属性，document 没有_。

-   `Element.insertAdjacentHTML()`:将任意的 HTML 标记字符串插入到指定的元素相邻位置。第一个参数是插入的位置，可以是`beforebegin`（元素之前）、`afterbegin`（子节点第一个）、`beforeend`（子节点最后一个）、`afterend`（元素之后），第二个参数是标记的 HTML 字符串。

-   `textContent`:查询纯文本形式的元素内容，或者在文档中插入纯文本，标准方法是使用`Node`的`textContent`属性。（IE8 及其以下无）这个属性和`innerText`相似，但有区别`textContent`属性会将元素中，所有文本包括子元素文本拼接在一起，按在文档中出现的格式。而`innerText`会将子元素中文本进行换行，通常没有确定的行为。
    ```html
    <div id="box1">
        <p>???</p>
        !!!
    </div>
    <script>
        document.getElementById('box1').innerText //
        //???
        // (空格空格)
        //!!!
        document.getElementById('box1').textContent //???!!!
    </script>
    ```
-   **特例**——`<script>`元素中的文本:`<script>`元素有一个`text`属性用来获取它们的文本。浏览器不显示`<script>`元素的内容，并且 HTML 解析器忽略脚本的尖括号和星号，所以可以用`<script>`元素来存放文本数据。只需要简单的将元素的`type`属性设置为某些值如：(`text/x-custom-data`)，这样设置后`javascript`解释器会忽略该脚本。
    `Text`和`CDATASection`都是`CharacterData`的子类型，`CharacterData`定义了`Data`属性，它和`nodeValue`的文本相同。

#### 数据集属性

HTML5 在`Element`对象上定义了`dataset`属性。它的各个属性对应去掉前缀`data—属性`。所以`dataset.name`保存着`data-name`的值。带连字符的属性对应于驼峰命名法属性名：`data-name-id`属性就变成`data.nameId`。

#### 一些特殊的元素的属性

-   表单和元素属性
    `Form`对象中有`action`、`encoding`、`method`、`target`属性对应其 HTML 属性，还有一个`elements`数组，存放着该元素内所有的表单元素

每个`Form`元素都有一个`onsubmit`事件处理程序来检测表单提交，还有一个`onreset`属性来检查表单重置。表单提交前调用`onsubmit`事件, 通过返回`false`能取消提交动作。（验证用户错误）注意：`onsumit`事件只能通过点击提交按钮提交，通过 js 方法调用会触发该事件。

`onreset`事件同理。（在 IE 中`focus`事件无法通过 js 触发）

-   选择框和选项元素
    `Select`元素定义了`options`属性，它是一个包含了多个`Option`元素的类数组对象，针对单选，`Select`元素的`selectedIndex`中指定了哪个选项当前被选中。针对多选，该属性只会显示选中第一个值的索引，只有通过`selected`属性查找选中项。每个`Option`对象有一个`text`属性表示它们的文本值，`value`属性表示提交表单时发送的值。通过设置`options.length`可以截断数组，将数组中某个值设置为`null`可以移除某个`Option`对象，其他会自动填充。

用`Option`的构造函数创建一个`option`对象：接收 4 个参数，`text`属性、`value`属性、`defaultSelected`属性、`selected`属性。然后可以通过数组添加的方法像`options`类数组添加该对象。

-   Document 的属性
    -   `cookie`：允许 Javascript 读写`HTTP cookie`的特殊属性
    -   `domain`：运行 Web 页面交互时，相同域名下互相信任的 web 服务器之间协作放宽同源策略安全限制。
    -   `lastModified`：最后一次修改文档的时间
    -   `refferer`：如果有，表示是导航到当前文档的上一个文档
    -   `title`：元素`title`间的文本
    -   `URL`：文档的 URL，只读字符串而不是对象。属性与 location.href 的初始值相同，不会动态变化。
    -   `document.write()`:该方法会将字符串参数连接起来，然后将结果字符串插入到文档中调用它的脚本元素的位置。当脚本结束，浏览器解析生成的输出并显示它。只有在解析文档时才能使用 write 方法输出 HTML 到当前文档，所以能在 script 元素中的顶层代码中调用该方法。如果将该方法用于事件处理程序，那么它会擦除当前文档和它包含的脚本；第一次调用其他文档的
    -   `write()`:会擦除该文档的所有内容。

### 作为元素树的文档

将文档看成是`Element`树，忽略部分文档：忽略`Text`和`Comment`节点。
`Element`对象的`children`属性，返回一个`HTMLCollection`对象。如此的还有：
`firstElementChild`，`lastElementChild`、`nextElementSibling`、`previousElementSibling`、`childElementCount`。`childElementCount`属性表示子元素个数，与`children.length`相等。（IE8 及其以下不支持后面的属性）。

`Element`和`HTMLDocument`等类型是类，它们不是构造函数，但它们有原型对象，可以用自定义方法拓展它们（IE8 支持`Element`、`HTMLDocument`和`Text`的可扩展性，但不支持`Node`、`Document`、`HTMLElement`或子类性的扩可在的属性）

## 一些特殊的元素需要关注的地方

-   [表单元素](./表单元素/README.md)
-   [媒体元素](./媒体元素/README.md)
-   [iframe 元素](./iframe元素/README.md)
-   [样式表](./样式表/README.md)
