# BOM
BOM(Browser Object Model)即浏览器对象模型。

由于BOM主要用于管理窗口与窗口之间的通讯，因此其核心对象是`window`.

一些浏览器API:
+ [浏览器存储](./存储)
+ [定时器](./定时器)
+ [跨域通信](./跨域通信)
+ [历史状态管理](./历史状态管理)
+ [FileAPI](./FileAPI)

## 客户端Javascript
Window对象是所有客户端Javascript特性和API的主要接入点。它表示Web浏览器的一个窗口或窗体，并且可以用标识符`window`来引用它。

### HTML中嵌入Javascript

#### script标签
在设置`src`属性时，`<script>`标签中的任何内容都会忽略。

当浏览器遇到`<script>`元素时，并且该元素包含不被识别的`type`属性时，它会解析该元素但不会显示或执行它的内容。（可以用该方法来嵌入文本数据）

#### a标签
URL后面跟一个`javascript:协议限定符`，是另一种嵌入javascript代码到客户端的方式。

这种特殊的协议类型指定URL内容为任意字符串。`javascript:URL`能识别的资源是转换成字符串的执行代码的返回值。如果返回`undefined`，那么这个资源没有内容的。
```html
<a href="javascript:new Date().toLocaleTimeString();">What time is it</a>
<!-- 点击后部分浏览器会执行URL中的代码，并使用返回的字符串显示新文档的内容，浏览器会擦除当前文档并显示新文档。 -->
```

如果要确保`javascript:URL`不会覆盖当前页面，可以用`void`操作符强制给表达式赋予`undefined`。
```html
  <a href="javascript:void window.open('about:blank');">
```
如果此处没有`void`，那么该函数返回值会在一些浏览器中转换为字符串显示，当前文档也会被覆盖。

如果书签是`javascript:URL`那么就保存的是一个小段脚本，只要书签不返回值，就可以操作当前显示的任何文档。

如果一个脚本定义了新的全局变量或函数，那么这个变量或函数会在脚本执行之后对任意javascript代码可见。

### 同步、异步和延迟脚本
当文档还在载入时，Javascript影响文档内容的唯一方法是快速生成内容。它使用`document.write()`方法完成。

脚本的执行只在默认情况下是同步和阻塞的。通过给`<script>`标签设置`defer`属性使浏览器在文档载入和解析完毕时执行；`async`使浏览器在加载文档和脚本时同时解析；当两个属性同时存在时，会忽略`defer`属性。
延迟的脚本会按它们在文档的顺序执行，异步脚本在它们载入就执行。

### 客户端Javascript时间线
1. Web浏览器创建`Document`对象，并开始解析Web页面，解析`HTML`元素和它们的文本内容后添加`Element`对象和`Text`节点到文档中。此时
```js
document.readyState = 'loading';
```

2. 当HTML解析器解析到没有`async`和`defer`属性的`script`元素时，它把这些元素添加到文档中，然后执行行内或外部脚本。这些脚本会同步执行，并且在脚本下载和执行时解析器会暂停。这样脚本可以用`document.write`把文本插入到输出流中。同步脚步可以看见它自己的`script`元素和它们之前的文档内容。

3. 当解析到设置`async`属性的`script`元素时，它开始下载脚本文本，并继续解析文档。脚本会在它下载完成后尽快执行。异步脚本禁用`document.write`方法。它们可以看到自己的`script`元素和之前的文档元素，可能或不能访问到其他的文档内容。

4. 当文档完成解析，`document.readyState`属性变成`interactive`

5. 所有有`defer`属性的脚本，会按它们在文档中的顺序执行。延迟脚本能够访问完整的文档树，禁止使用`document.wirte`方法。

6. 浏览器在`Document`对象上触发`DOMContentLoaded`事件，这标志着程序执行从同步脚本执行阶段转换到异步事件驱动阶段。（此时异步脚本可能未执行完成）

7. 文档已经完全解析完成，但浏览器可能还在等待其他内容载入，如图片。当所有内容载入完成时，并且所有异步脚本完成载入和执行，`document.readyState = complete`，web浏览器触发`window`对象`load`事件。

8. 从此开始调用异步事件

### 怪异模式和标准模式
`document.compatMode`属性，当值为`CSS1Compat`说明为标准模式，值为`BackCompat`或`undefined`时为怪异模式。

### Navigator对象
[详情](./Navigator对象)

### Screen对象

`Window`的`screen`属性引用的是`Screen`对象。它提供有关窗口显示的大小和可用的颜色数量的信息。该对象的`availHeight`和`Height`相关属性分别表示的是电脑显示屏的可视区域（不包含工具栏）和可视区域（包含工具栏），可用该对象来判断是否在小屏幕设备上运行。

### 对话框
`window`对象提供了`alert()`、`confirm()`、`prompt()`方法。`confirm()`和`prompt()`方法会产生阻塞。
```js
for(let i = 0; i < 5; i++){
  setTimeout(()=>{
    alert(i);
  }, 40);
}
//因为会造成堵塞,所以在输出1后,会乱序
```

### 错误处理
`window`对象的`onerror`属性是一个事件处理程序，当未捕获的异常传播到调用栈上时就会调用它，并把错误信息输出到浏览器的Javascript控制台上。给这个属性赋值一个函数，在发生错误时会调用该函数。

由于历史原因，`window`的`onerror`事件处理函数的调用通过三个字符串参数，而不是通过传递一个事件对象。第一个参数是描述错误的一个消息，第二个参数是字符串，存放引发错误Javascript代码所在文档的URL，第三个参数是文档发生错误的行数。

### 作为window对象属性的文档元素
如果HTML文档中用`id`属性来为元素命名，并且如果`Window`对象没有这个名字的属性，那么`window`对象会赋予一个属性，它的名字就是`id`属性的值，它的值指向表示文档元素的`HTMLElement`对象。多个相同`id`时会存放在一个类数组中(首先的问题就是id是唯一的不应该有多个)。如果`window`对象已有该属性，或声明了该名的变量，那么这个`id`不会生成该元素的引用。

同样当以下元素有`name`属性时，也会发生同样的事：
`a`,`area`,`embed`,`form`,`iframe`,`img`,`object`
两者区别在于`id`是唯一的，`name`可以有多个，**但有一个特例，具有`name`属性的`iframe`元素的该变量引用的是嵌套窗口的`window`对象**。

### 打开和关闭窗口
`window.open()`方法可以打开一个新的浏览器窗口。该方法载入指定的URL到新的窗口或已存在的窗口，返回代表那个窗口的`window`对象，接收4个可选参数，**第一个要在新窗口显示的文档的URL**，如果没有传入参数，则新页面不显示任何文档;

**第二个参数为新打开窗口的名字**（`window.name`），如果是一个已存在的窗口，则跳转到那个窗口（前提是允许跳转），如果省略该参数则会指定名为`_blank`打开一个新的未命名的窗口。该值可以作为`a`和`form`元素上HTML `target` 属性的值，用来表示引用的文档（或表单提交的结果）应该显示在命名的窗口中。这个`target`属性值可以设置为`_blank` `_parent` `_top`，从而使引用的文档显示在新的空白窗口、父窗口、顶级窗口。（如果`iframe`有`name`属性，那么会作为`window`的`name`属性）

如果其中一个窗口是内嵌在另一个窗口里的窗口，那么在它们的脚本之间就可以相互导航，这种情况下可以用`_top`（顶级祖先窗口）和`_parent`（直接父级窗口）来获取彼此的上下文;

**第三个参数是一个以逗号分隔的列表**，包括大小和各种属性，以表明新窗口是如何打开的
第三个参数在大多数浏览器中会被忽略
```js
window.open("RegExp.html", "wode", "width = 400, height = 400; status=yes; resizable = yes");
```

**第四个参数只在第二个参数命名是一个存在的窗口时才有用**，是一个布尔值，`true`表示第一个参数中URL替换历史记录中当前条目，`false`表示添加一条新的历史记录(默认值)

>在调用`open()`方法返回的`window对象`中，`opener`属性为原窗口的引用。其他`window`中该属性为`null`。
>同样该方法返回的窗口对象有一个`close()`方法来进行对其关闭

在表示窗体而不是顶级窗口或标签页上的`Window`对象上执行`close()`方法不会有任何效果，它不能关闭一个窗体。即使一个窗口关闭了，但这个`Window`对象也还存在，有一个`closed`属性为`true`表示，它的`document`会是`null`。

#### 窗体之间的关系

任何窗口都可以将自己的窗口引用为`window`或`self`。窗体可以用`parent`属性引用包含它的窗口的`window`对象; 一个窗口是顶级窗口或标签，而不是窗体，那么`parent`属性等于`self`属性; `top`属性引用都是指向包含它的顶级窗口。**窗体指通过irame元素创建的**。

`iframe`元素有一个`contentWindow`属性，引用该窗体的`window`对象。在窗体中有一个`frameElement`属性引用该窗体的`iframe`元素; 窗口也可以用`frame`属性直接来引用`iframe`的`window`对象，该属性是一个数组，还可以通过`frame[name、id]`来访问具体`name`或`id`的窗体；此时也可以直接用窗体的名字来引用该窗体；也可以用`window[index]`来引用窗体对象。

### WinodwProxy对象
客户端Javascript有两个重要的对象，客户端全局对象处于作用域链顶级，并且是全局变量和函数所定义的地方。
但**全局对象会在窗体或窗口载入时被替换为全局对象的代理即我们称的Window对象**，每当查询或设置`Window`对象属性时，就会正真的全局对象上设置或查询，我们称代理对象为*WindowProxy*。**没有办法可以引用到真正的全局对象**。

### 安全类型检测
```js
var isArray = value instanceof Array;
```
要使以上代码返回`true`，`value`必须与`Array`构造函数来自**同个全局作用域**（同一框架）。

#### 安全的检查方法
在任何值上调用`Object`原生的`toString()`方法，都会返回一个`[Object NativeConstructorName]`格式的字符串。每个类在内部都有一个`[[Class]]`属性，这个属性中就指定了上述字符串中的构造函数名，如：
```js
var value = [];
console.log({}.toString.call(value));
//返回:    [object Array]
```

由于原生数组的构造函数与全局作用域无关，因此使用对象的`toString()`方法可以检查任何类型（在某些浏览器 用`typeof`方法检查正则表达式会返回`function`），但自定义的构造函数都将返回`[object Object]`

在IE中以COM对象形式实现的任何函数，`isFunction()`都将返回`false`（因为它们并非原生函数）且在低级IE版本中,`typeof node`可能返回`function`需要同时检测`nodeType`属性

### requestAnimationFrame()——更平滑的动画体验
最平滑动画的最佳循环间隔是1000ms/60≈17ms 但浏览器定时器最小时间间隔为40ms,且浏览器计数器精度没法确保浏览器按时绘制下一帧。

`requestAnimationFrame()`告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行
```js
//传入一个元素p 自动开始执行动画
function move(p) {
       var left = p.offsetLeft;
       left += 1;
       p.style.left = left + 'px';
       requestAnimationFrame(move);
     }
```

### 页面可见性 Page Visibility API
[详情](./页面可见性PageVisibilityAPI)

### Web计时/浏览器渲染性能
[详情](./浏览器性能API)