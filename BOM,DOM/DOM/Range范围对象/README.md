# 范围(Range)

DOM2 级中定义了`createRange()`

用`document.createRange()`可以创建一个 DOM 范围，拥有以下属性

-   `startContainer`与`endContainer`就是范围起点（终点）的父节点（第一个（最后一个）节点的父节点）

-   `startOffset`范围的偏移量。在文本、注释、CDATA 节点中，此属性为范围起点跳过的字符数量。在其他中为范围中第一个子节点的索引。

-   `endOffset` 范围中最后一个子节点所在位置+1 的位置。`startOffset+范围中子节点长度 = endOffset`

-   `commonAncestorContainer`:`startContainer`与`endContainer`的共同祖先节点中，最近的那个节点。

## DOM 范围简单选择（注意换行符也为文本节点）

-   `selectNode(node)`选择一个`node`节点来作为范围。
-   `selectNodeContainers(node)`选择一个`node`中的所有**子节点**来作为范围。

并拥有以下方法来设置起始节点与终点节点：

-   `setStartBefore(refNode)`在`refNode`前设置起点，**refNode 作为第一个节点**。
-   `setStartAfter(refNode)`在`refNode`后设置起点，**refNode 的下一个同辈节点作为第一个节点**。
-   `setEndBefore(refNode)`在`refNode`前设置终点，**refNode 的上一个同辈节点作为最后一个节点**。
-   `setEndAfter(refNode)`在`refNode`后设置终点，所以**refNode 为最后一个节点**。

## DOM 范围复杂选择

-   `setStart(参照节点，偏移量)`
-   `setEnd(参照节点，偏移量)`
    以上两个方法都是直接设置起点与终点位置，参照节点为`startContainer/endContainer`即范围的父元素，偏移量为`startOffset(endOffset)`。

## 操作 DOM 范围的内容

首先须知：范围会知道自身缺失什么开标签与闭标签，会重新构建有效的 DOM 结构。

它具有以下三个方法来直接操作 DOM 范围：

-   `deleteContents()`从文档中删除范围中中内容，无返回值（直
    接反应到 DOM 上）（删除后自动补充了标签）

-   `extractContents()`从文档中删除范围中内容，返回删除的 dom 结构片段（自动补齐标签） 可以用该片段插入到 DOM 其他地方

-   `cloneContents()`创建范围对象的一个副本，返回一个 DOM 节点

## 插入 DOM 范围的内容

-   `insertNode(node)`可以在范围的开始处插入一个 node 节点

-   `surroundContents(node)`在范围处，先提取出范围的内容，然后覆盖在 node 节点上，在将 node 节点插入以前范围所在位置。（将范围替换为 node 节点，范围中内容放在 node 节点中）。

## 折叠 DOM 范围（感觉没什么用）

用`collapse(true or false)`方法将范围中的`startOffset = endOffset`，`true`时两个值都等于起点的值，`false`时为终点值。

## 比较 DOM 范围

用`compareBoundaryPoints(比较方式，比较的范围)`来比较两个范围的位置。
比较方式有 4 种 如下：
-|-
`Range.START_TO_START(0)` | 比较两个的起点
`Range.START_TO_END(1)` | 比较第一个的起点与第二个终点
`Range.END_TO_END(2)` | 比较两个的终点
`Range.END_TO_START(3)` | 比较第一个的终点与第二个的起点

当调用范围在参数范围对象之前时，返回-1，当调用范围在参数范围对象之后时，返回 1，当两个在同一个位置时，返回 0。

## 复制范围副本

`cloneRange()`复制一个范围的副本，`cloneContents()`复制的是范围中的节点

## IE8 及其以下的范围

使用`document.body.createTextRange()`创建一个文本范围

1. 简单选择
   使用`findText(文本内容，[数值])`方法，该方法会找到传入的文本内容并作为范围，没找到时返回`false`，找到时返回`true`，包含以下属性。还可以传入一个数值，表示向前（正数）继续搜索（负值向后）。（这些值都不会动态更新）

利用范围的`text`属性，可以查看范围中的文本。可以**修改直接反应在 DOM 上**

利用`htmlText`查看文本范围中 HTML 情况,利用`boundingWidth`查看范围的宽度

同时他也拥有同`selectNode()`方法相似的方法 `moveToElementText(element)`，该方法会选择`element`为范围。

2. 复杂选择

-   `move(移动单位，移动数值)`先折叠当前范围（同以前），然后在移动。（需重新设置起点终点）
-   `moveStart(同上)`移动范围起点
-   `moveEnd(同上)`移动范围终点
-   `expand(同上)`将范围中的部分选择的文本全部选中，如

移动单位为一种字符串值：

-   `character` 逐个字符地移动
-   `word` 逐个单词地移动（非空格字符）
-   `sentence` 逐个句子的移动（一系列以句号、问号、感叹号结尾的字符）
-   `textedit` 移动到当前范围的开始或结束位置

`pasteHTML(element)`向范围中插入 html 代码（将范围文本替换为 HTML 代码）

4. 折叠范围
   `collapse(true of false)`同 dom 中方法一样。
5. 范围比较
   `compareEndPotints(比较类型，比较的范围)` 返回结果与之前一样
   比较类型有'StartToStart'、'StartToEnd'、'EndToEnd'、'EndToStart'

`isEqual(范围)`方法用于确认两个范围是否相等

`isRange(范围)`来确认一个范围是否包含另一个范围 6. 复制范围
`duplicate()`复制文本范围，返回一个副本

## 查询选取的文本

`window/document.getSelection()`方法返回一个`Selection`对象。它的`toString()`方法返回选区的纯文本内容。

在 IE8 及其以下中该对象为`document.selection`属性，该对象的`createRange`方法返回一个`TextRange`对象，它的`text`属性包含了选区的文本
