# JSON

## JSON 语法表示

JSON 语法可以表示下面三种类型的值：

-   **简单值**：可以表示字符串、数值、布尔值和`null`，不支持`undefined`。

```js
'Hello World';
```

JSON 字符串**必须使用双引号**（单引号会导致语法错误）

-   **对象**：表示一组无序的键值对。

```js
{
    "name": "Mihan",
    "age": 29
}
```

**JSON 中的对象要求给属性加引号**。
与 Javascript 的对象字面量相比，JSON 对象*没有声明变量而且没有末尾的分号*。

-   **数组**：表示一组有序的值的列表，可以通过数值索引来访问其中的值。

```js
[25, 'hi', true];
```

同对象一样，JSON 数组没有变量和末尾分号。

## JSON 对象

挂载于顶级对象的 JSON 属性之上。

### 方法

JSON 对象有两个方法：

1. `JSON.stringify()`
2. `JSON.parse()`

#### JSON.stringify()

`stringify()`：把 Javascript 对象序列化为 JSON 字符串。（不包含任何空格字符或缩进）

**在序列化过程中，所有函数及原型成员都会被忽略且值为`undefined`的任何属性也会被跳过**。

```js
var book = {
    title: 'Professional Javascript',
    authors: ['Nicholas C.ZAks'],
    edition: 3,
    year: 2011,
    method: function() {}
};
var jsonText = JSON.stringify(book);
//解析为字符串结果为: "{"title":"Professional Javascript","authors":["Nicholas C.ZAks"],"edition":3,"year":2011}"
```

该方法还可以接受另外两个参数：
第二个参数为可选参数,是个过滤器,可以为一个数组或者一个函数。

例如：当在上述方法中加入如下数组参数时：

```js
var jsonText = JSON.stringify(book, ['title', 'edition']);
//"{"title":"Professional Javascript","edition":3}"
```

**返回结果变更为只包含数组中所包含的元素**。

当在上述方法中加入如下函数参数时：

```js
var jsonText = JSON.stringify(book, function(key, value) {
    console.log(key, value);
    switch (key) {
        case 'authors':
            return value.join(',');

        case 'year':
            return 5000;

        case 'edition':
            return undefined;

        default:
            return value;
    }
});
//"{"title":"Professional Javascript","authors":"Nicholas C.ZAks","year":5000}"
```

**则每个被序列化参数的值为分别调用该回调函数的返回值**，注意这个地方很有意思，因为每个函数返回的值，会作为该值遍历的基础值，而不是原值，什么意思呢，我举个例子：

```js
let obj = {
    a: {
        c: 1
    }
};

JSON.stringify(obj, function (key, val) => {
    return 3;
});
```

大家可以先猜一下这个函数的结果是什么。

好吧，它的结果就是`3`，而不是`{a:{c:3}}`，原因很简单，第一次是从`obj`开始遍历，因为过滤器的原因，返回值为`3`，所以相当于`obj = 3`(当然并没有赋值)，此时就不能再次遍历了，因为`3`为不可遍历的值(这里可遍历的值指对象和数组，并不是具有遍历器的值)；所以如果你返回一个如下值，那么将会无限循环下去：

```js
function (key, val) {
    return {
        a: 1
    };
}
```

**这个遍历过程为`DFS`遍历**。

其次**数组类型**的过滤器只对对象的键值对有效(即数组无效)：

```js
let val = [1, 2,3, {
        c: 1,
        b: 2,
        0: '1'
    },
    [1, 2]
];
JSON.stringify(val, [0, 1, 'c']);

// 结果为
[1,2,3,{"0":1,"c":1},[1,2]]
```

第三个参数为一个可选参数，表示是否在`JSON`字符串中保留缩进。

> 当该参数为一个*数值*时，表示每个级别缩进的空格数。（只要传入有效的控制缩进的参数值，结果字符串就会包含换行符）

例如：

```js
var jsonText = JSON.stringify(book, null, 4);
/*"{
*    "title": "Professional Javascript",
*    "authors": [
*        "Nicholas C.ZAks"
*    ],
*    "edition": 3,
*    "year": 2011
}"*/
```

（数值的最大缩进空格数为 10，大于 10 的值会自动转换为 10）

当该参数为一个*字符串*时，则这个字符串将会在 JSON 字符串中被用作缩进字符（而不是使用空格缩进）缩进字符串的最长不能超过 10 个字符长，超过后只出现前 10 个。例如：

```js
var jsonText = JSON.stringify(book, null, 'wodessssddddf');
/*"{
*wodessssdd"title": "Professional Javascript",
*wodessssdd"authors": [
*wodessssddwodessssdd"Nicholas C.ZAks"
*wodessssdd],
*wodessssdd"edition": 3,
*wodessssdd"year": 2011
}"*/
```

结果为：**使用该方式后会破坏结构，导致无法再使用`JSON.parse()`方法**

通过该方法序列化出来的字符串可以通过`eval()`函数解析、解释并返回对应的 Javascript 对象和数组。

##### poly 原生实现

如果要原生实现该函数，那么要注意以下几点：

- `undefined`与`function`的键值对会被忽略
- 循环引用会报错
- 不会转换`symbol`的值
- 对象属性名全部用`""`包围
- 可以传入一个回调函数对每一个键值对或指定键值对进行干涉

其次是明确思路：

1. 优先处理过滤器
2. 其次处理值
3. 最后处理格式

过滤器和格式处理按序选取。

最后附上一个本人实现的垫片版本，模仿原生`JSON.stringify`函数，处理了各种情况，如果问题可以提`issue`。[polyStringify.js](./polyStringify.js)

#### JSON.parse()

`parse()`：把 `JSON` 字符串解析为原始 `Javascript` 值。

```js
var jsonObject = JSON.parse(jsonText);
```

返回为一个 js 对象：

该方法接收一个函数参数（还原函数），并在每个键值对上调用。基本同上面的回调函数一样，拥有一个`key`与`value`参数，分别表示 JSON 字符串的属性名与值。

**如果还原函数返回`undefined`，则表示要从结果中*删除*相应的键；返回其他值时表示将该值插入到结果中**。例如：

```js
var book = {
    title: 'Professional Javascript',
    authors: ['Nicholas C.ZAks'],
    edition: 3,
    year: 2011,
    releaseDate: new Date(2011, 11, 1)
};

var jsonText = JSON.stringify(book);
console.log(jsonText);

var jsonObject = JSON.parse(jsonText, function(key, value) {
    if (key == 'releaseDate') {
        return new Date(value);
    } else {
        return value;
    }
});
//原对象中releaseDate值为releaseDate:"2011-11-30T16:00:00.000Z"
//现对象中releaseDate值为releaseDate:"Thu Dec 01 2011 00:00:00 GMT+0800 (中国标准时间)"
```

#### toJSON()

给将要被序列化的对象定义有`toJSON()`方法时，在调用`JSON.stringify()`时会优先调用其自身的`toJSON()`序列化数据的格式, 之后在进一步将其转为 JSON 字符串。

原生 Date 对象有一个`toJSON()`方法，可以将 Javascript 的`Date`对象自动转换成`ISO 8601`日期字符串（与在`Date`对象上调用`toISOString()`结果一样）

```js
var book = {
    title: 'Professional Javascript',
    authors: ['Nicholas C.ZAks'],
    edition: 3,
    year: 2011,
    do: undefined,
    toJSON: function() {
        return this.title;
    }
};
var jsonText = JSON.stringify(book); //"Professional Javascript"
```

## 序列化的顺序规则

可以让`toJSON()`方法返回任何值，它都能正常工作。`toJSON()`方法可以作为函数过滤器的补充：当把一个对象传入`JSON.stringify()`方法时，序列化该对象的顺序为：

1. 如果存在`toJSON()`方法并且能得到有效的值，则调用该方法，然后返回调用该方法后过滤的对象，否则，返回对象本身。
2. 如果提供了第二个参数（过滤器参数）则应用这个过滤器，但是是在第一步返回对象的基础上。
3. 对第二步返回值逐个进行序列化
4. 如果提供了第三个参数，在执行相应的格式化。
