# 样式表

## 元素样式表(link and style)
当使用`style`和`link`元素表示*css样式*时，可以用`document.styleSheets`查询当前文档的所有样式表,它是一个只读的类数组(`StyleSheetList对象`)对象，它包含`CSSStyleSheet`对象，表示与文档关联在一起的样式表。

>当然也可以直接通过该元素的sheet属性来查询`CSSStyleSheet`(IE8及其以下为`styleSheet`属性)

如果定义或引用了`style`或`link`元素设置`title`属性值，则该属性值对应`CSSStyleSheet`对象的`title`属性。这个对象定义了一个`disabled`的属性，表示是否禁用该样式表。

`CSSStyleSheet`对象有`insertRule()`和`deleteRule()`方法来添加和删除规则（IE为`addRule()`、`removeRule()`）第一个参数为添加的样式字符串，第二个为插入的位置。如：
```js
document.styleSheets[0].insertRule("H1{font-weight:bold;}", 0);
//（IE中参数为选择器文本，和样式的文本）
```

`CSSStyleSheet`对象有一个`cssRuleList`类数组对象，包含样式表的所有样式（IE中该属性为`rules`，实际上主流浏览器两个属性都有）

`cssRuleList`类数组对象中的元素为`CSSStyleRule`对象，每一个代表一个具体的CSS样式

`CSSStyleRule`对象的`selectText`属性是CSS选择器的字符串,它的`cssText`属性表示整个完整的样式表达式

下面梳理下结构：
<pre>
|--StyleSheetList
   |--CSSStyleSheet
      |--cssRuleList
         |--CSSStyleRule
</pre>
### CSSStyleSheet对象
表示文档中`<link>`元素或`<style>`元素的样式表信息,拥有以下几个常用方法

#### insertRule(str, index)
向当前样式表插入一条样式规则,两个参数都是必须的,第一个表示一条样式信息,第二个表示插入的位置。(IE8+才存在,IE8及其之下为`addRule()`)

#### deleteRule(index)
删除样式表中 下标为index的样式(IE8+才存在,IE8及其之下为`removeRule()`)

## 脚本化内联样式
元素的`style`属性是一个`CSSStyleDeclaration`对象，代表了HTML代码中通过`style`指定的CSS的属性。

*所有的属性都要包含单位*

通过`Element.style.cssText`或`element.getAttribute('style')`可以查看元素设置所有的内联属性,但要注意通过` - `连接的属性,需要用驼峰的形式表示,还需要注意`float`属性,因为它在Javascript为保留字所以要用`cssFloat`代替,较新版本浏览器中不存在这个问题。

`Element.style.cssText`查询的属性与`link/style`元素不一样,它不会包含*选择器*与`{}`,所以可以通过`+=`操作来一次性高性能写入样式:
```js
document.querySelector('div').style.cssText += 'color: red; font-size: 14px;';
```

### style.getPropertyValue(propertyName)
返回元素给定名称的内联样式的字符串值

### getPropertyPriority(propertyName)
查看元素的某内联样式是否使用`!important`，设置时返回`important`，未设置返回空字符串。

### removeProperty(propertyName)
删除调用元素的指定内联样式

## 查询一个元素的最终样式信息
通过`window.getCompputedStyle(ele,[:ele])`方法可以获得一个元素的计算样式。接收两个参数第一个为要查询的元素，第二个是`null`或*命名CSS伪元素的字符串*如`(:before)`,该方法返回一个`CSSStyleDeclaration`对象，代表对应元素的所有样式，与内联样式的对象的区别为：
+ 计算样式的属性只读
+ 计算样式的值是绝对值，全以`px`表示，颜色以`rgb`或`rgba`格式返回
+ 计算样式的`cssText`未定义

IE8及其以下该属性为`element.currentStyle`

## ClassList
HTML5中为每个元素定义了`classList`属性。这个属性是`DOMTokenList`对象：一个可读的类数组对象。

### Class的操作方法

#### add(arg1, arg2...)
该方法接受一个或多个参数参数,添加到调用的`classList`

### remove(arg1, arg2...)
该方法接受一个或多个参数参数,删除`classList`里的类

### contain(arg)
检查一个`ClassList`是否含有某个类，可以接受多个参数,但只会检查第一个参数是否存在,返回`Boolean`值

### toggle(arg)
检查一个类是否存在，不存在时就添加;存在时就删除。当传入1个以上参数时只会添加第一个参数的类名，且只执行添加操作
