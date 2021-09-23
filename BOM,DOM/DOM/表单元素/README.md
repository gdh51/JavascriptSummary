# 表单元素

form 元素在 js 中的具有的特殊属性：

-   acceptCharset：服务器能够处理的字符集（等价于 HTML 的`accept-charset`特性）
-   action：接受请求的 URL
-   elements：这个表单中所有控件的集合。
-   enctype：请求的编码类型
-   length：表单控件的数量
-   method：要发送 HTTP 请求的类型
-   name：表单名称
-   reset()：将所有表单域重置为默认值
-   submit()：提交表单
-   target：用于发送请求和接受响应的窗口名称

可以通过`document.forms`来取得页面所有的表单，也可以通过具体`document.name`或者索引来取得具体的表单

## 表单操作

### 提交表单

通过设置按钮的`type = 'submit'`可以同来提交表单，或者通过`<input type='image'>`来设置图片按钮来提交表单。当然还可以直接通过 js 调用表单对象的`form.submit()`方法，通过 HTML `submit`按钮提交会触发`submit`事件,阻止这个事件的默认行为可以取消表单提交。

### 重置表单

通过`type = 'reset'`来重置表单，表单恢复默认值。也可以用 js 的`reset()`方法重置表单，该方法会触发`reset`事件。（同样可以阻止默认行为来取消重置）

## 表单字段

在表单元素中，有一个`elements`属性，**保存着所有表单字段的集合**（`input`、`textarea`、`button`、`fieldset`元素的集合），他们的*顺序为文档中顺序*。可以用索引或者`name`来访问。

如果有多个表单控件使用相同的`name`，在通过`element[name]`来访问时，会返回一个该`name`表单控件的集合。

未指定`type`的`button`的默认`type`为`submit`; 未指定`type`的`input`的默认`type`为`text`

### 共有属性

除了`fieldset`元素外，其他表单字段都有相同的一组属性：
属性名|含义
-|-
`disabled` | 表示是否被禁用
`form` | 指向当前字段所属表单的指针
`name` | 当前字段的名字
`readOnly` | 当前字段是否只读
`tabIndex` | 当前字段的切换序号
`type` | 当前字段的类型，如 `checkbox`、`radio`
`value` | 要提交给服务器的值
`autofocus` | 自动将焦点移到对应字段（这个属性会优先与 focus 方法）

### 共有方法

每个表单字段都有两个方法：`focus()`与`blur()`使使用此方法的元素获得焦点
补充：（在其他元素的`tabIndex`属性设置为`-1`的情况下，也可以调用`focus()`方法）

### 共有事件

-   `blur`：失去焦点时触发
-   `change`：表单值改变时触发，对于`input`与`textarea`元素，在他们**失去焦点**且`value`发生变化时触发，对于`select`元素在选项改变时触发。
-   `focus`：获得焦点时触发

### 文本框脚本

input： 当`type`为`text`时为单行文本框，可以通过`size`设置能够显示的字符数，`value`设置初始值，`maxlength`设置接受的最大字符数。

textarea：多行文本框，通过`rows`设置行数，`cols`设置列数。值保留在`value`中
上述两个元素都支持`select()`方法，表示将焦点设置到文本框，**并选择其中所有内容**

`select`事件：在用户选择文本时（释放鼠标，IE8 及其以下不必释放）触发该事件。
在触发该事件时，目标文本框（选择的文本框的元素）有一个`selectionStart`属性与`selectionEnd`属性表示选中的文段的位移

在 IE8 及其以下版本中，只能通过`document.selection.createRange().text`方法创建一个选择文本的范围对象。

关于文本框还有一个立即选择文段的方法:`setSelectionRange(firstIndex,lastIndex+1)`立即获得焦点并选择`firstIndex`到`lastIndex`的字符。 （还需调用`focus()`方法设置焦点以显示出来）

IE8 及其以下要使用`range`选择,如：

```js
range.collapse(true)
range.moveStart('character', 0)
range.moveEnd('character', input.value.length)
range.select()
//最后还需获得焦点。
```

#### 文本框独有事件

剪贴板事件：

-   `copy`:在复制时发生,
    如要设置在粘贴板中需要在`setData()`方法后阻止默认行为：

    ```js
    //手动在剪贴板中设置复制内容为value
    e.clipboardData.setData('text/plain', value)
    e.preventDefault()
    ```

-   `cut`:在剪贴时发生,
    该事件中要改变剪贴板中内容，同上，但*不会清空选区内容*

    ```js
    e.clipboardData.setData('text/plain', 'set')
    e.preventDefault()
    ```

-   `paste`:在粘贴时发生. （在该事件中主流浏览器仅`getData()`方法有效）

三个事件都有三个共同的方法:

-   `getData(参数1)`:传入一个参数，表示要获得的数据的格式，可以是 text（text/ plain 的简写）或者 url。
-   `setData(参数1，参数2)`:传入两个参数，第一个参数同上，第二个参数为要放入剪 贴板的文本（在此处 IE 只能填`text`或`url`，而其他浏览器则要用`text/plain`） Note：在`paste`事件中，该方法只在 IE 中有效。

-   `clearData(参数1)`:传入数据类型，清空剪贴板。在`paste`事件中，该方法只有 IE 有效。

### 选择框脚本:通过 select 与 option 元素创建的多选框

拥有除其他表单字段共有的属性和方法外，还额外有下列属性和方法：

-   `add(新的选项，相关项)`：在控件相关项之前插入新的选项元素（option 元素）。当第二个值设置为`null`或不设置时会添加到选项最后

-   `mulitiple`：是否允许选择多个选项（等价于 HTML 中 multiple 特性）

-   `options`：返回一个`option`元素的 HTML 合集，包含一个`selectedIndex`属性表示被选中的元素的索引。

-   `remove(下标)`移除给定位置的选项

-   `selectedIndex`：一个基于 0 的索引，如果没有选中项则值为-1，当有多个选项选中时，只保存第一项的索引。

-   `size`：选择框中可见的行数（等价于 HTML 中`size`属性）

**选择框的值由选项的设置决定**：

1. `value`属性设置时，以`value`的值决定（即使`value`为空）
2. 无`value`属性设置时，以文本值为值
3. Note:在其他表单字段的`change`事件是在值被修改且焦点离开当前字段时触发，而选择框的`change`事件只要选中了选项就会触发（`select`元素上触发）

设置`selected`属性在多选的情况下不会取消对其他选中项的选择。

#### Option 构造函数

接受两个参数（文本、值），值可选（IE8 及其之前不支持）

可以利用该构造函数来创建 option 元素，例如：

```js
var newOption = new Option('new text', 'option value')
//结果为<option value='option value'>new text</option>
```

### 表单验证

所有的表单字段都有个方法`checkValidity()`来检测表单中某个字段是否有效，即跟表单上属性的约束条件是否符合; 当对整个表单使用时，只有当全部表单字段返回`true`时，该方法才会返回`true`。

每个表单字段都含有一个`validity`属性，这个属性返回一个对象，保存着有关字段为何有效或无效的信息，里面的每一个属性都会返回一个布尔值，有如下属性：

-   customError：如果设置了`setCustomValidity()`则为`true`

-   patternMissmatch：样式是否匹配

-   rangeOverflow/rangeUnderflow：值比 max 大或比 min 小

-   stepMismatch：min 与 max 之间的步长值不合理

-   tooLong、tooShort：超过或没有达到指定的长度。

-   typeMismatch：当值不是`mail`或`url`要求的格式时，则返回`true`

-   valid：其他值为 false，则返回 true

-   valueMissing：如果标注为`required`的字段中没有值，则为 true

`form`元素也有一个`novalidate`属性，用于查看或改变表单字段的验证状况，当为`true`时则无需验证即可提交表单。

对于表单字段有一个`formNoValidate`属性，用于查看或改变表单字段的验证状况，当为`true`时则无需验证即可提交表单。
.

### 表单序列化

浏览器发送数据给服务器的过程：

-   对表单字段的名称和值进行 URL 编码，使用`&`分隔
-   不发送禁用的表单字段
-   只发送勾选的复选框和单选按钮
-   不发送`type`为`reset`与`button`的按钮
-   多选选择框中的每个选中的值单独为一个条目
-   在单击提交按钮提交表单的情况下，也会发送提交按钮；否则，不发送。
-   `select`元素的值就是选中的`option`元素的`value`特性的值。

### 富文本编辑器

#### 可编辑的内容（两个方法）

1. 设置任何标签 HTML `contenteditable`属性;设置对应元素的 javascript `contentditable`属性
2. 将 iframe 的 Document 对象的`designMode`属性设置为字符串`on`表示整个文档可编辑

#### 操作富文本

使用`document.execCommand()`方法可以对文档执行预定义的命令。该方法接受 3 个参数：要执行的命令名称、表示浏览器是否应该为当前命令提供用户界面的一个布尔值（第二个参数应始终设置为`false`，因为 firefox 会在该参数为`true`时抛出错误）和执行命令必须的一个值（可以为`null`）（必须在可编辑区域或`designMode = 'on'`且`contentEditable =t rue`的文档使用，该方法使用时，被使用对象必须获得焦点）

`document.queryCommandEnabled()`：检测是否可以针对当前选择的文本，或者当前插入字符所在位置执行某个命令。接受一个参数，要检查的命令。

```js
console.log(frames['textedit'].document.queryCommandEnabled('bold'))
```

#### 富文本选区

使用 iframe 元素的`window.getSelection()`方法，可以确定实际选择的文本。这个方法是 window 对象和 document 对象的属性，它会返回表示当前选择文本的`Selection`对象。
`Selection`对象具有下列属性：

-   anchorNode：选区起点所在的节点。

-   anchorOffset：在到达选区起点位置之前跳过的 anchorNode 中的字符数量。

-   focusNode：选区终点所在的节点。

-   focusOffset：focusNode 中包含在选区之内的字符数量。
-   isCollapsed：布尔值，表示选区的起点和终点是否重合。

-   rangeCount：选区中包含的 DOM 范围的数量

还具有以下方法：

-   addRange(range)：将指定的 DOM 范围添加到选区中。

-   collapse(node，offset)：将选区折叠到指定节点中的相应的文本偏移位置。

-   collapseToEnd()：将选区折叠到终点位置

-   collapseToStart()：将选区折叠到起点位置。

-   containsNode(node)：确定指定的节点是否包含在选区中。

-   deleteFromDocument()：从文档中删除选区中的文本，与`document.execCommand('delete',false,null)`指令的结果相同

-   getRangeAt(index)：返回索引对应的选区中的 DOM 范围

-   extend(node，offset)：通过将`focusNode`与`focusOffset`移动到指定的值来扩展选区。

-   removeAllRanges()：从选区中移除所有 DOM 范围。实际上会移除选区，因为选区中至少要有一个范围。

-   removeRange(range)：从选区中移除指定的 DOM 范围
-   selectAllChildren(node)：清楚选区并选择指定节点的所有子节点。

-   toString()：返回选区所包含的文本内容，
