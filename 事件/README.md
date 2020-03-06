# 事件

## 事件传播的三个阶段

DOM2 级事件规定事件流包括三个阶段：**事件捕获阶段**、**处于目标阶段**、事**件冒泡阶段**。

### 事件捕获

事件传播的捕获阶段就像反向的冒泡阶段。最先调用`window`对象的捕获处理程序，然后是`document`对象的捕获处理程序，接着是`body`对象，再然后是 DOM 树向下，以此类推，**直到调用事件目标的父元素的捕获事件处理程序,在目标对象本身上注册的捕获事件处理程序不会被调用**。(实时上事件目标上注册的捕获事件处理程序会调用,但调用显示的阶段为目标阶段，可以通过`event.Phase`查看)

## 事件处理程序等级

### DOM0 级事件处理

运用 `on + 事件名称` 来为元素指定事件，该事件会在冒泡阶段处理，如 为`btn`按钮指定一个点击事件。每个元素只能指定一个同类型事件

```js
btn.onclick = function() {
    alert(this.id);
};
```

此时`this`指向当前调用的元素（因该事件在元素作用域中运行）

利用`btn.onclick = null`可以清空事件处理程序

### DOM2 级事件处理

利用`addEventListener(事件名，callback，boolean)`来为 DOM 节点添加一个事件处理程序。
`boolean`值表示在什么阶段执行，`true`表示捕获阶段，`false`表示冒泡阶段。利用这个方法添加的类型事件可以有多个，**按添加顺序执行**。

上述添加的事件只能由`removeEventListener(事件名，callback)`移除添加的事件，注意这里的`callback`函数一定要不能为匿名函数，否则无法移除 应指定命名函数。

#### IE 中的事件处理程序

IE8 及其以下中添加事件只能使用`attachEvent(事件名[需要加on], callback)`来添加一个事件到冒泡阶段。（IE8 及其以前只支持事件冒泡） 在用该方法添加的事件会在全局作用域中运行，所以`this`指向`window`。 （该方法也可以添加多个同类型事件，但**执行顺序按反向执行**）

> 如想模拟在捕获阶段触发事件则需要调用`element.setCapture(retargetToElement);`
> 该方法接收一个布尔值,当设置为`true`时，所有事件被直接定向到这个元素; 如果是 `false`, 事件也可以在这个元素的子元素上触发。(该方法仅在鼠标事件中有效)

使用完后需要调用`document.releaseCapture()`来释放该指定元素
特别说明：该方法只在 IE8+与 firefox 中有效

通过`attachEvent()`方法添加的事件只能用`detachEvent(事件名，callback)`来删除。（不能删除匿名函数）

**DOM0 级每种事件只支持一个事件处理程序**。

## 直接在 HTML 上指定的
事件

当指定一串 Javascript 代码作为 HTML 事件处理程序属性时，浏览器会把代码串转换为如下的函数中：类似如下的作用域

```js
function (event) {
  with (document) {
    with (this.form || {}) {
      with (this) {
        //代码
      }
    }
  }
}
```

非 IE 浏览器通过`event`参数来构造函数，而 IE 在构造函数时没有要求参数。这样的函数中使用`event`标识符引用的正是`window.event`。

在元素上的事件，`this`就为事件的目标元素。在元素上的动态创建的函数（利用`onclick = null`可以移除事件）

### 该类事件处理程序的作用域

通过 HTML 属性来注册事件处理程序会使它们被转换为能存取全局变量的顶级函数而非任何本地变量。通过 HTML 属性定义的事件处理程序能像本地变量一样使用目标对象、容器`form`对象和`document`对象的属性

由此可以用`tagName`代替`this.tagName`，使用`getElementById()`代替`document.getElementById()`,对于`form`中的文档元素，能通过`id`引用任何其他的表单元素。

```js
<button id='btn' onclick="console.log(getElementById('btn'))">按钮</button>
//点击后打印该元素
<button id='btn' onclick="console.log(tagName)">按钮</button>
//点击后打印BUTTON
```

_而且作用域链中每个对象的属性在全局对象中都有相同名字的属性_。例如，由于`document`对象定义了`open()`方法，因此 HTML 事件处理程序想要调用`Window`对象的`open`方法就必须**显式**地写`window.open()`而不是`open`; 如果表单包含一个 ID 是`location`的元素，那么要是表单所有 HTML 事件处理程序想引用`window`的`location`对象就必须使用`window.location`而不能是`location`。

## 事件对象

在事件处理程序中`event`变量，保存着`event`对象（事件对象）
它具有以下常用属性：（只可读）

- bubbles：表明事件是否冒泡
- cancelable：表明是否可以取消事件默认行为
- **currentTarget**：安装事件处理器的元素(同`this`)
- defaultPrevented：是否调用`preventDefault()`函数
- eventPhase：调用事件处理程序时的阶段：
  - 1 表示捕获阶段
  - 2 表示处于目标
  - 3 表示冒泡阶段
  - (当 eventPhase 等于 2（处于目标阶段时），`this`、`target`、`currentTarget`始终都相等)
- target：触发事件处理程序作的目标
- isTrusted：`true`表示用户行为触发的事件，`false`表示浏览器自动触发
- type：事件类型
- view：事件关联的抽象视图，就是`window`对象

在事件处理程序内部 `this`始终等于`currentTarget`

如果直接将处理程序指定给目标元素，则`target`也等于`this`

但如果将事件处理程序添加给父节点 b 并通过冒泡传播触发，那么`target`则是触发事件的目标

### IE 中的事件对象

在 IE8 及其以下中使用 DOM0 级添加事件时，`event`对象作为`window`的一个属性存在，
所以*不能通过在参数中传入`event`来访问`event`对象*

只有通过`window.event`来访问`event`对象
（其他浏览器中`event`在任何方法中都作为`window`的一个属性存在）

IE 中的属性与 DOM 中不同，如下
属性名|含义
-|-
`cancelBubble` | 默认为`false`，设置为`true`时可以取消事件冒泡。
`returnValue` | 默认为`true`，设置为`false`时可以取消事件默认行为。
`srcElement` | 触发事件的目标（与 DOM `target`一样）
`type` | 被触发事件的类型

## 事件取消

### 取消事件默认行为

当通过 `on + eventName` 或直接在 HTML 标签上添加事件时,可以通过简单的返回`false`来取消事件的默认行为:

```js
btn.onclick = function() {
    return false;
};
```

```html
<a href="/" id="btn" onclick="return false">按钮</a>
```

当通过`Element.addEventListener()`添加事件处理程序时,需要通过`event.preventDeufault()`来显示取消默认行为(IE9 之前需要指定`event.returnValue = false;`来取消)。对应的可以通过`event.defaultPrevented`属性来查看事件是否取消默认行为(只有当`cancelable`为`true`时才可以使用。)

### 取消事件的继续传播

通过`event.stopPropagation()`方法来取消事件的传播。（IE9 之前中通过设置`cancelBubble = true`来达到效果）

`event.stopImmediatePropagation()`会阻止事件传播的同时并*阻止同一对象上的其他相同类型事件处理程序的调用*

**这里的事件传播指上述的三个阶段**

## 事件注册的调用顺序

1. 通过设置对象属性或 HTML 属性注册的处理程序一直优先调用
2. 使用`addEventListener()`注册的处理程序按照它们的注册属性调用
3. 使用`attachEvent()`注册的处理程序可能按照任何顺序调用

## 事件类型

### UI 事件

- load：当页面完全加载后在`window`上触发，当所有框架加载完毕时在框架集上触发
- unload：当页面完全卸载后在`window`上触发，当所有框架卸载完毕时触发，或镶入的内容卸载完毕后在`<object>`元素上触发
- abort：当用户停止下载过程时，如果镶入的内容没有加载完，则在`<object>`元素上触发
- error:当 js 错误时，在`window`上触发
- select：当用户选择文本框中的一个或多个时触发
- resize：当窗口或框架大小发生变化时在`window`或框架上触发
- scroll：当用户滚动带滚动条的元素时在元素上触发

#### load 事件

`onload`事件有两种定义方式，一种为`window`添加事件处理程序，另一种直接在`body`元素上添加`onload`特性。

_图像元素、script 元素、link 元素也可以添加该事件_。

在不属于 DOM 文档的图像上触发`load`事件时，_IE8 及其以下浏览器不会生成`event`对象_。
_IE8 及其之前不支持在`script`元素上的`load`事件_。

#### unload 事件

`unload`事件：当用户刷新或关闭时触发，利用这个事件最多的情况是*清除引用*，避免内存泄漏。同`load`一样有两种指定方式。（在主流浏览器使用这个功能进行弹窗时会被忽略）

#### resize 事件

`resize`事件:当浏览器窗口被调整到一个新高度或宽度时，即窗口大小（非滚轮），就会触发该事件。所以还是可以通过在`body`上指定`onresize`属性来触发。(触发这个事件对性能的开销较大,后面会介绍如何减少开销)

#### scroll 事件

`scroll`事件：当滚动条高度发生变化时触发。

### 焦点事件

- focusin：在元素获得焦点时触发。 这个事件会**冒泡**。
- focus：在元素获得焦点时触发。 这个事件不会冒泡。
- focusout：在元素失去焦点时触发。 这个事件会**冒泡**。
- blur：元素失去焦点时触发。 这个事件不会冒泡；

### 鼠标事件

- click：通过鼠标或回车触发。
    这个事件会冒泡。

- dbclick：双击鼠标触发。
    这个事件会冒泡。

---

- mouseenter：鼠标从元素外部首次移至内部时触发，首次是移到子元素上时也会触发绑定事件的父元素。
    这个事件**不冒泡**。

- mouseleave：鼠标从元素内部首次移到外部时触发，移到子元素上不触发。
    这个事件**不冒泡**。

```html
<div id="div">
    <button id="btn">按钮</button>
</div>
<!-- 点击btn会触发2次事件 -->
<script>
    let div = document.getElementById('div');
    div.addEventListener(
        'mouseenter',
        function(e) {
            console.log('enter', e.eventPhase, e.target);
        },
        true
    );
</script>
```

第一次触发是在 div 元素目标阶段触发,第二次在 btn 元素的捕获阶段触发

---

- mouseover：鼠标从一个元素外部首次进入另一个元素边界之内时触发。（移到子元素上也会触发）
    这个事件会冒泡。

mouseout：鼠标从一个元素移到另一个元素时触发。（移到子元素上也会触发）
这个事件会冒泡。

---

mousemove：鼠标在元素内部移动时重复地触发。
这个事件会冒泡。

---

mousedown：按下任意鼠标按钮时触发。
这个事件会冒泡。

mouseup：释放鼠标按钮时触发。
这个事件会冒泡。

#### 鼠标事件中的特有属性

`clientX`：事件发生时鼠标距离**视口**的水平位置。（所以当有滚动条时，不包括滚动距离）
`clientY`：事件发生时鼠标距离**视口**的垂直位置。

`pageX`：事件发生时鼠标**距离页面**的水平位置。（包含隐藏部分）
`pageY`：事件发生时鼠标**距离页面**的垂直位置。
（IE8 及其以下不支持 page 属性）

> 在没有滚动时，`page = client`

`screenX`：事件发生时鼠标相对于整个屏幕的水平位置。
`screenY`：事件发生时鼠标相对于整个屏幕的垂直位置。

`offsetX`:鼠标事件发生时，鼠标相对于目标元素的水平位置。（以目标元素 border 里层为起点）
`offsetY`:鼠标事件发生时，鼠标相对于目标元素的垂直位置。

- 修改键：
    `shiftKey`、`ctrlKey`、`altKey`、`metaKey`，这些属性中都为`boolean`值，当触发鼠标事件时相应键被按下时，变为`true`，否则为`false`。

- 相关元素:
    `relatedTarget`属性提供了相关元素的信息，这个属性是`mouseover`与`mouseout`事件的专属值,分别表示鼠标**来自的元素**和**鼠标去往的元素**（IE8 之前不支持，IE 中，`mouseover`的相关元素属性保存在`fromElement`中，在`mouseout`的相关元素属性保存在`toElement`属性中）

- 鼠标按钮：
    在`mousedown`与`mouseup`事件中，其`event`对象中存在一个`button`属性，记录着是哪一个鼠标按钮触发的事件，0 表示左键，1 表示鼠标中键，2 表示鼠标右键。
    在 IE8 及其以下版本中，`button`属性的值与`dom`不同（具体百度）

- `detail`属性：
    在鼠标事件中，这个属性表示发生了多少次单击。（在同一元素上相继发生一次`mousedown`与`mouseup`算一次单击，从`0`开始计数，如果鼠标在`mousedown`和`mouseup`间移动了位置或在短时间内未点击，则`detail`会被重置为`1`）
    在 firefox 浏览器中有 bug，超过`3`时会循环`2`与`3`

> IE 中鼠标事件还有以下属性：（DOM 中有，IE 名不同）
> `altLeft`、`ctrlLeft`、`shiftLeft`是否按下`alt`与`ctrl`，按下为`true`。

- 鼠标滚轮事件：
    `mousewheel`事件，当滚动鼠标滚轮时发生，其`event`对象包含所有鼠标事件属性外还包含一个`wheelDelta`属性，当向上滚时，`wheelDelta`是 120 的倍数，下时是-120 的倍数。（该事件会冒泡）

> firefox 中该事件名为`DOMMouseScroll`，向上滚为-3 的倍数，向下为 3 的倍数，这个属性保存在`detail`中（这个`detail`在该事件中与点击次数无关）。
> 该属性在 HTML5 中被规范为`wheel`，目前只有 IE 没有该标准属性

在鼠标事件中，IE 和 firefox(firefox 中有但是无效)有两个独有的方法，使用后可以捕获到移动到事件处理程序外的鼠标移动。（相当于事件捕获）该方法为`element.setCapture()`，该方法接收一个布尔值，`true`时表示该元素会捕获其子元素的的鼠标事件，当为`false`时，当前元素不会捕获其内子元素的鼠标事件
`element.releaseCapture()`:为指定元素接触事件锁定。

### 键盘事件

- `textInput`事件：在可编辑区域且用户按下实际能够输入字符的键时触发，也可以通过复制粘贴剪切和粘贴、拖放等方式触发。拥有一个`data`属性表示按下的是键的字符。（区分大小写）（firefox 不支持）

    > 在该事件中 IE 的事件名称为`textinput`且支持一个`inputMethod()`方法表示通过什么方式输出的字符。

- `input`事件：文本插入元素后触发事件。（IE 中为`propertychange`）

- `keydown`：当用户按下键盘任意键时触发。

- `keypress`：当用户按下键盘上的字符键并生成字符时触发，`esc`也会触发该事件。

- `keyup`：当用户释放键盘上的键时触发。

_当按下一个字符时，首先触发`keydown`，然后触发`keypress`，最后释放时触发`keyup`_

`keydown`与`keypress`会在文本框发生变换前触发

在键盘事件的`event`对象中也存在`shiftKey`、`ctrlKey`、`altKey`、`metaKey`属性（IE 无`metaKey`）

在发生`keydown`事件与`keyup`事件时，`event`对象中的`keyCode`属性会包含一个与**键盘上按键对应的键码**。（键码不区分大小写字母）（特殊情况在 firefox/Opera 浏览器中；的键码与其他浏览器不同）

> 注意：触发这几个事件时, 如果要获取对应挂载事件表单元素的 value 时，获取的 value 是改变前的值

**总结：`keydown`、`keyup`取按键值取`keyCode`值或`key`值，该事件可以生成任何值**

在发生`keypress`的事件时，有一个属性存有按下键的代表**字符的 ASCII 编码**：

1. Chormo、IE8 以上：保存在`keyCode`、`charCode`属性中，两者相同。
2. firefox：保存在`charCode`

总结`keypress`读取按键取`charCode`值，或`key`值，该事件只能生成字符

获得字符编码后，可以用`String.fromCharCode(ASCII编码)`来转化为字符。

该类事件还有一个`location`属性，表示按下了什么位置的键：1 表示左侧，2 表示右侧，3 表示数字小键盘，4 表示移动设备键盘，5 表示手柄。

I8 及其以上：`getModifierState(字符串)`接受一个字符串`Shift`、`Control`、`AltGraph`、`Meta`，指定的键如果是处于被按下的状态则返回`true`。

#### 关于 key 与 char 属性：（char 为 IE 独有）

在`keypress`事件中，全部浏览器都不支持非字符部分按键的`key`值。IE 中有一个`char`属性同`key`属性

在`keydown`与`keyup`事件中：
**全部浏览器**：`key`的值为 按下字符键的文本（如“k”），按下非字符键时为其键名（如 tab）。
**IE8 及其以上**：`char`的值字符部分为字符本身（同`key`），非字符部分为空。

### 复合事件

当我们通过输入法在可编辑文本框中输入拼音时, 会触发复合事件(也会触发`input`事件), 复合事件有 3 个：

- `compositionstart`：事件触发于一段文字的输入之前（类似于 `keydown`事件，但是该事件仅在若干可见字符的输入之前，而这些可见字符的输入可能需要一连串的键盘操作、语音识别或者点击输入法的备选词）。
- `compositionupdate`: 事件触发于字符被输入到一段文字的时候（这些可见字符的输入可能需要一连串的键盘操作、语音识别或者点击输入法的备选词）
- `compositionend`：当文本段落的组成完成或取消时, `compositionend` 事件将被触发 (具有特殊字符的触发, 需要一系列键和其他输入, 如语音识别或移动中的字词建议)。

当一开始输入时，相对于 input 事件, 它们的触发顺序为：
`compositionstart` -> `compositionupdate` -> `input` -> `compositionend`

我们常用`compositionstart`与`compositionend`来处理对中文拼音的输入, 因为当输入拼音时(并未完全拼入), 会不断触发`input`事件导致效验输入框的逻辑提前报错，通过复合事件的配合, 我们可以在输入拼音时，禁用`input`事件，在`compositionend`中来验证输入框中的值

### 变动事件(先已移除标准, 使用 MutationObserver 代替)

`DOMSubtreeModified`：当 DOM 结构发生变动时触发。任何其他事件都会触发该事件。
`DOMNodeInserted`：在一个节点作为子节点插入另一个节点中时触发。（冒泡）
`DOMNodeInsertedIntoDocument`：在一个节点插入文档之后触发。（不冒泡）
`DOMNodeRemoved`：在节点从其父节点中被移除时触发。（冒泡）
`DOMNodeRemovedFromDocument`：在一个节点从文档中移除之前触发。（不冒泡）
`DOMAttrModified`：在特性被修改后触发。
`DOMCharacterDataModified`：在文本节点值发生变化后触发。

当文档发生变换的事件中，有一个`relatedNode`属性保存着目标节点的父节点。
[MutationObserver 详情](.././BOM,DOM/DOM#MutationObserver)

### HTML5 新增事件

`contextmenu`事件，表示用鼠标右键显示元素菜单，属于鼠标事件。（冒泡）

`beforeunload`：当用户关闭窗口时提醒用户是否关闭，将提醒用户的话储存在`returnValue`属性中，并返回该值可以在提示框中显示（该属性仅 IE 有效）

`DOMContentLoaded`事件：当 DOM 树加载完毕且所有延迟脚本加载完毕后触发（不在乎 js、css、img 是否加载完毕），目前这是最快的加载事件的方法。(会在 load 事件前触发)

`readystatechange`事件：该事件包含一个`readyState`属性里面包含当前对象加载的状态。
当`readyState`为`interactive`（可以操作对象，但未完全加载）属性时可以达到`load`的效果（两者快慢看情况）。

`pageshow`事件：（事件在`document`触发，但必须添加到`window`对象）会在每次加载页面时触发（`onload`会在从缓存里面读取时不触发），该事件有一个`persisted`属性表示是否从浏览器缓存中读取。

`pagehide`事件：（事件在`document`触发，但必须添加到`window`对象）浏览器页面卸载时触发（在`unload`事件前），它也有一个与`pageshow`同名不同义的`persisted`属性，表示页面卸载后是否会被保存在缓存中，是则为`true`。

`haschange`事件：当 URL 中#后的字符串发生变换时触发。该事件的`event`额外包含两个属性——`oldURL` `newURL`

#### 原生拖放事件

任何设置有 HTML
`draggable`属性的文档元素都是拖放源。
在拖动元素时，将依次触发下列三个事件（事件目标都是*被拖动的元素*）

1. `dragstart`：按下鼠标并开始移动鼠标时触发。
2. `drag`：在元素被拖动期间会持续触发该事件。
3. `dragend`：当释放目标后会触发该事件。

> 当一个元素被拖放到一个有效的放置目标上时，会依次触发下列三个事件（事件目标都是作为*放置目标的元素*，这里的目标区域指注册该事件的元素）

1. `dragenter`：当目标进入放置目标区域就会触发该事件。（冒泡）
2. `dragover`：当目标在放置目标区域范围移动时就会持续触发该事件。
3. `dragleave`或`drop`：当元素被拖出目标区域就会触发`dragleave`事件，如果元素在目标区域被放置则会触发`drop`事件。（冒泡）

当拖动元素进入无效放置目标时，光标会显示为（圆环中一条反斜杠）表示不能放置。因为元素*默认是不允许放置*，在该类元素上永远不会触发`drop`事件。

> 为解决这个问题，只需要阻止`dragover`事件中的默认行为。（浏览器默认拖放行为是打开拖放元素相对应的链接）。

在拖放事件中，有一个`dataTransfer`对象用于实现在拖放操作中的数据交换，它拥有以下属性。（保存在该对象中的数据只能在`drop`事件中获取）

- dropEffect:获取/设置实际的放置效果，它应该始终设置成`effectAllowed`的可能值之一 用于知道被拖动的元素能够执行哪种放置行为。（这个属性只能在`ondragenter`事件中针对放置目标来设置，并且该值的表现形式为鼠标在放置目标上的样式）共有以下四个值：
  - none：不能把拖动元素放这里。（默认值）
  - move：应该把拖动的元素移动到放置目标
  - copy：应该把拖动的元素复制到放置目标
  - link：表示放置目标会打开拖动的元素（拖动元素必须是一个链接，有 URL）。
        。
- effectAllowed:用来指定拖动时被允许的效果,允许拖动元素的哪种`dropEffect`。（只能在`drapstart`事件中设置该属性）可能的值为：

  - uninitialized：没有给被拖动的元素设置任何放置行为。
  - none：被拖动的元素不能有任何行为。
  - copy：只允许值为`copy`的`dropEffect`。
  - link：只允许值为`link`的`dropEffect`。
  - mve：只允许值为`move`的`dropEffect`。
  - copyLink：允许值为`copy`和`link`的`dropEffect`
  - copyMove: 允许值为`copy`和`move`的`dropEffect`
  - linkMove: 允许值为`link`和`move`的`dropEffect`
  - all：允许任意`dropEffect`

- files:包含一个在数据传输上所有可用的本地文件列表。如果拖动操作不涉及拖动文件，此属性是一个空列表。此属性访问指定的`FileList`中无效的索引将返回未定义（`undefined`）。
- types:保存一个被存储数据的类型列表作为第一项，顺序与被添加数据的顺序一致。如果没有添加数据将返回一个空列表。
- items:表示一个放置操作中添加的数据的数据列表,只读,没有时为空

这个对象有两个主要的方法：
`setData(type,value)`该方法的第一个参数为一个字符串，表示要保存的数据类型，可取值为`text`或`URL`，第二个参数为要存放的值。（可以用`items.add()`代替）

在拖动文本框中的文本时，浏览器会调用`setData()`方法，将拖动的文本以`text`格式保存在`dataTransfer`对象中，类似的拖动链接或图像，会将`URL`调用`setData()`方法并保存，然后在放置目标时通过`getData()`方法读取。

`getData(type)`该方法可以用来取得 setData 方法中储存的数据，唯一的参数是储存数据的类型

该对象其他的方法：
`clearData(format)`：清除特定格式保存的数据。
`setDragImage(element,x,y)`：指定一幅图像，当拖动发生时，显示在光标下方。
共有三个参数，第一个表示要显示的 HTML 元素，后两个表示光标在图像中的 x、y 坐标。
HTML 元素可以为一幅图像，也可以为其他的元素。

### DOM模拟事件

[模拟事件前往](./模拟事件/README.md)
