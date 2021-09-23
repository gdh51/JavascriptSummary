# DOM 节点遍历

遍历 DOM 元素的原生遍历器

## NodeIterator

用`document.createNodeIterator（root,whatToShow，filter，entity..）`来创建一个它的新实例，一共接受 4 个参数
`root`表示开始搜索的起点结点

`whatToShow`表示需要访问的结点的代码（位掩码），可以用 | 或 & 同时进行多个组合筛选。（可以为数值位掩码，也可以为源码，如`1 = NodeFilter.SHOW_ELEMENT`）

`filter`是一个`NodeFilter`对象，表示应接受或拒绝某种特定节点的函数。不指定时填`null`。

`entityReferenceExpansion：true`或者`false` 表示是否要扩展实体的引用（HTML 网页中无用）每个`NodeFilter`对象只有一个方法——`acceptNode()`：如果要访问该节点，该方法返回`NodeFilter.FILTER_ACCEPT`，不访问返回`NodeFilter.FILTER_SKIP`，跳过指定节点（也可以用`NodeFilter.FILTER_REJECT`）。不能直接创建`NodeFilter`对象，如果需要时，可以创建一个包含`acceptNode()`方法的对象，并在`createNodeIterator()`中的`filter`参数传入即可:

```js
let filter = {
    acceptNode: function (node) {
        return node.tagName.toLowerCase() == 'p'
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP
    }
}
let Node1 = document.createNodeIterator(
    document,
    NodeFilter.SHOW_ELEMENT,
    filter,
    false
)
```

也可以将`filter`直接写为`acceptNode()`函数:

```js
let filter = function (node) {
    return node.tagName.toLowerCase() == 'p'
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP
}
```

`NodeIterator`类型有两个主要的方法为`nextNode()`与`previousNode()`顾名思义。初次调用`nextNode()`会返回根节点，当遍历到最后个节点时返回`null`

```js
let iterator = document.createNodeIterator(
    document,
    NodeFilter.SHOW_ELEMENT,
    null,
    false
)
let node = Node1.nextNode()
while (node !== null) {
    console.log(node.tagName)
    node = iterator.nextNode()
}
```

## TreeWalker

为`NodeIterator`的升级版，拥有`NodeIterator`的相同的方法（nextNode()与`previousNode()`），除此之外还拥有`NodeIterator`在不同方向上遍历 DOM 结构的方法。如下:

`parentNode()` `firstChild()` `lastChild()` `nextSibling()` `previousSibling()`

使用`document.createTreeWalker(root,whatToShow,filter,entity..)`创建一个实例，参数同`NodeIterator`。

在`TreeWalker`中 使用`NodeIterator`对象时，参数`NodeFilter.FILTER_SKIP`会跳过相应节点进入下一个节点，但是`NodeFilter.FILTER_REJECT`会跳过相应节点及该节点的*整个子树*

`TreeWalker`还有一个属性为`currentNode`，表示上一次遍历中返回的节点（及当前节点），可以用该属性修改遍历继续的起点。
