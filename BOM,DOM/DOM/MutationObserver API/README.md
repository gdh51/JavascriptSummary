# MutationObserver

DOM4 标准,监控 DOM 树所做的更改。它用来取代 DOM3 级事件中的`MutationEvent`,即`DOMNodeInserted`、`DOMNodeRemoved`、`DOMSubtreeModified`、`DOMAttrModified`、
`DOMCharacterDataModified`、`DOMNodeInsertedIntoDocument`和`DOMNodeRemovedFromDocument`事件,这些事件已经废弃,如使用请做好兼容

## 向后兼容,MutationEvent 兼容性

-   `MutationEvent`在 IE 浏览器中最低支持到**IE9**
-   在 webkit 内核的浏览器中，不支持`DOMAttrModified`事件
-   IE,Edge 以及 Firefox 浏览器下不支持`DOMNodeInsertedIntoDocument`和`DOMNodeRemovedFromDocument`事件

`MutationEvent`中的所有事件都被设计成无法取消，如果可以取消`MutationEvent`事件则会导致现有的 DOM 接口无法对文档进行改变

## MutationObserver 兼容性

IE11 及其以上即可

## MutationObserver 构造函数

```js
new MutationObserver(function (mutations, observer) {
    //do somethings
})
```

创建并返回一个新的`MutationObserver`对象, 它会在指定的 DOM 发生变化时被调用, 接收一个回调函数, 每当被指定的节点或子树以及配置项有 Dom 变动时会被调用。

回调函数拥有两个参数：一个是描述所有被触发改动的`MutationRecord`对象数组，另一个是调用该函数的`MutationObserver`对象。

## MutationObserver 对象方法

通过构造函数实例化会返回一个`MutationObserver`对象, 它有以下方法

### MutationObserver.prototype.observe(target[, options])

配置了`MutationObserver`对象的回调方法以开始接收与给定选项匹配的 DOM 变化的通知。

-   target: 必选参数,表示 DOM 树中的一个要观察变化的 DOM Node (可能是一个 Element), 或者是被观察的子节点树的根节点。
-   options: 一个可选的`MutationObserverInit`对象，此对象的配置项描述了 DOM 的哪些变化应该提供给当前观察者的`callback`。

options 对象参数里面有以下选项：

-   childList：设置`true`，表示观察目标子节点的变化，比如添加或者删除目标子节点，不包括修改子节点以及子节点后代的变化

-   attributes：设置`true`，表示观察目标属性的改变

-   characterData：设置`true`，表示观察目标数据的改变

-   subtree：设置为`true`，目标以及目标的后代改变都会观察

-   attributeOldValue：如果属性为`true`或者省略，则相当于设置为`true`，表示需要记录改变前的目标属性值，设置了`attributeOldValue`可以省略`attributes`设置

-   characterDataOldValue：如果`characterData`为`true`或省略，则相当于设置为`true`,表示需要记录改变之前的目标数据，设置了`characterDataOldValue`可以省略`characterData`设置

-   attributeFilter：如果不是所有的属性改变都需要被观察，并且`attributes`设置为`true`或者被忽略，那么设置一个需要观察的属性本地名称（不需要命名空间）的列表

### MutationObserver.prototype.disconnect()

要停止这个`MutationObserver` （以便不再触发它的回调方法），需要调用`MutationObserver.disconnect()`方法。

### MutationObserver.prototype.takeRecords()

返回已检测到但尚未由观察者的回调函数处理的所有匹配 DOM 更改的列表，使变更队列保持为空。

此方法最常见的使用场景是在断开观察者之前立即获取所有未处理的更改记录，以便在停止观察者时可以处理任何未处理的更改。

返回一个`MutationRecord`对象列表，每个对象都描述了应用于 DOM 树某部分的一次改动。

## MutationObserver 与 MutationEvent 各事件的关系

| MutationEvent            | MutationObserver options               |
| ------------------------ | -------------------------------------- |
| DOMNodeInserted          | { childList: true, subtree: true }     |
| DOMNodeRemoved           | { childList: true, subtree: true }     |
| DOMSubtreeModified       | { childList: true, subtree: true }     |
| DOMAttrModified          | { attributes: true, subtree: true }    |
| DOMCharacterDataModified | { characterData: true, subtree: true } |

## MutationRecord

变动记录中的属性如下：

-   type：如果是属性变化，返回"`attributes`"，如果是一个`CharacterData`节点（`Text`节点、`Comment`节点）变化，返回"`characterData`"，节点树变化返回"`childList`"
-   target：返回影响改变的节点
-   addedNodes：返回添加的节点列表
-   removedNodes：返回删除的节点列表
-   previousSibling：返回分别添加或删除的节点的上一个兄弟节点，否则返回 null
-   nextSibling：返回分别添加或删除的节点的下一个兄弟节点，否则返回`null`
-   attributeName：返回已更改属性的本地名称，否则返回`null`
-   attributeNamespace：返回已更改属性的名称空间，否则返回`null`
-   oldValue：返回值取决于`type`。对于"`attributes`"，它是更改之前的属性的值。对于"`characterData`"，它是改变之前节点的数据。对于"`childList`"，它是`null`

其中 `type`、`target`这两个属性不管是哪种观察方式都会有返回值，其他属性返回值与观察方式有关，比如只有当`attributeOldValue`或者`characterDataOldValue`为`true`时`oldValue`才有返回值，只有改变属性时，`attributeName`才有返回值等。

[了解 HTML5 中的 MutationObserver](https://segmentfault.com/a/1190000012787829)
[MDN MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)
