# 2021年第12次版本

快速浏览本次提案中新增功能：

- [`String.prototype.replaceAll()`](#stringprototypereplaceallsearchvalue-replacevalue)
- [`Promise.any()`](#promiseanyiterable)，当任意一个`Promise`被`fulfilled`时，该函数返回的`Promise`也会被`fulfilled`
- [`AggregateError`一种新的错误类型](#aggregateerrorerrors-message)，表示多个错误的集合
- [`??=`、`&&=`、`||=`](#逻辑赋值操作符)，新的逻辑赋值操作符
- [`WeakRef`](#weakref)引用一个对象，但该对象会被垃圾回收机制回收，同时[`FinalizationRegistry`](#finalizationregistry)来管理目标对象在垃圾回收执行时的行为
- [`1_000`数字的分隔符](#数字分隔符)
- `Array.prototype.sort()`现在更加精准

## String.prototype.replaceAll(searchValue, replaceValue)

该方法类似于`String.prototype.replace`，用法都一样，它会将原字符串所有匹配`searchValue`的值替换为`replaceValue`。`searchValue`可以为一个字符串`String`也可以为一个正则表达式`RegExp`(注意为正则表达式时，必须带有`g flag`否者会报错)，`replaceValue`可以为一个字符串或者一个每次方法替换匹配时执行的函数，函数的返回值将作为替换的值(非字符串值将被`String`)。

执行该函数后返回一个新的字符串，不会`mute`原字符串

```js
const str = 'abcda',
    A_G_REG = /a/g
    A_REG = /a/

const b = str.replaceAll('a', '1'), // b = '1bcd1'
    c = str.replaceAll(A_G_REG, '1'), // c = '1bcd1' 等价于 str.replace(A_G_REG, '1')
    d = str.replaceAll(A_REG, '1') //  Uncaught TypeError: String.prototype.replaceAll called with a non-global RegExp argument
```

[MDN String.prototype.replaceAll()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll)
[ES String.prototype.replaceAll](https://tc39.es/ecma262/#sec-string.prototype.replaceall)

## Promise.any(iterable)

`Promise.any()`会返回一个`Promise`对象，当传入的可遍历对象(数组或者`iterable`的对象)中`Promise`对象任意一个被`fulfilled`时，就会`fulfilled`返回的`Promise`对象；当传入的可遍历对象中的所有`Promise`对象都被`rejected`时，返回的`Promise`的对象就会被`rejected`，其`rejected`的值为一个带有所有`rejected`原因的`AggregateError`对象。

当调用该函数时，其会将`iterable`对象中的所以值转化为`Promise`对象。

```js

// 全部rejected时
Promise.any([
    new Promise((resolve, reject) => {
       reject(1)
    }),
    new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(2)
        })
    })

// 错误原因在e.errors数组中
])).catch(e => console.log(e.errors))

// 部分reject时，返回的Promise处于pending状态
Promise.any([
    new Promise(() => {}),
    new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(2)
        })
    })
])

// 任意一个fulfilled时，返回的Promise会被fulfilled
Promise.any([
    new Promise((resolve, reject) => reject(1)),
    new Promise(resolve => {
        setTimeout(() => {
            resolve(2)
        })
    })
])
```

## AggregateError(errors[, message])

利用该构造函数创建一个所有错误的集合错误，第一个参数你需要传入一个可遍历(`iterable`)的对象，第二个可选参数则是对该集合的描述。该函数会返回一个错误对象，你可以通过下面属性访问其信息：

- `e.message`创建该对象时传入的第二个参数，默认值为`''`
- `e.name`错误名称，默认为`AggregateError`
- `e.errors`错误对象的集合，即我们传入的第一个参数(会被转化为数组)

```js
new AggregateError(new Set()).errors // 为数组
```

## `??=`、`&&=`、`||=`逻辑赋值操作符

[ES AssignmentExpression](https://tc39.es/ecma262/#sec-assignment-operators-runtime-semantics-evaluation)

### &&= 逻辑与赋值

逻辑与赋值运算符(`x &&= y`)**仅**在`x`为`truthy`时对其进行赋值。在为`falsy`时返回返回`x`的值

```js
let a = false
a &&= 1 // 返回false

a = 2
a &&= 3 // a = 3
```

以下语法是等价的：

```js
x && (x = y) // 等价于 x &&= y
```

[MDN Logical AND assignment (&&=)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Logical_AND_assignment)

### ??= 逻辑空赋值

逻辑空赋值运算符(`x ??= y`)**仅**在`x`为`nullish`(`null`或`undefined`)时对其赋值。在为`nullish`时返回返回`x`的值

```js
let a
a ??= 1 // a = 1

const b = { v: void 0 }
b.v ??= 2 // b = { v: 2 }
```

以下语法是等价的：

```js
x ?? (x = y) // 等价于 x ??= y
```

[MDN Logical nullish assignment (??=)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_nullish_assignment)

### ||= 逻辑或赋值

逻辑或赋值运算符(`x ||= y`)**仅**在`x`为`falsy`时对其赋值。在为`truthy`时返回返回`x`的值。

```js
let a
a ||= 1 // a = 1
a || = 2 // a = 1,此时返回1
```

以下语法等价：

```js
x || (x = y)
```

[MDN Logical OR assignment (||=)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR_assignment)

## WeakRef

`WeakRef`用于将一个对象在不被使用时可以被垃圾回收机制回收掉。如果目标对象没有被回收，那么`WeakRef`可以间接引用来访问目标对象。

>通俗来讲，`WeakRef`对象允许你对另一个对象进行弱引用，不会影响对该对象进行垃圾回收。
弱引用指该引用不会阻止该对象被垃圾回收(即不会产生引用标记)，一个正常(强)的引用会阻止该对象被垃圾回收(即会标记该对象被引用了，不能进行垃圾♻️)
当一个对象没有正常(强)引用时，该对象就会在下次浏览器垃圾回收时被销毁和清除并释放内存。

### 作为构造函数

作为构造函数，在实例化该构造函数时，需要传入一个对象，之后会返回一个对该对象的弱引用。

```js
new WeakRef({}) // WeakRef Object
```

### WeakRef.prototype.deref()

返回该`WeakRef`引用的**目标对象**或者`undefined`(如果该对象被垃圾回收机制回收掉了就会返回`undefined`)

### 一些说明

- 多个`WeakRef`引用同一个目标，调用`deref()`返回的行为是一样的。(不会有些返回`undefined`有些返回原目标对象)
- `WeakRef`的`target`无法被二次修改
- 如果一个对象是`WeakRef`的`target`，又是`FinalizationRegistry`，那么`target`会在调用与注册表关联的任何清理回调之前或同时被清理掉。

## FinalizationRegistry

一个`FinalizationRegistry`对象会管理目标对象在进行垃圾回收时的行为。当注册表中一个注册对象被垃圾回收机制回收时，就会调用清理回调函数。

```js
const registry = new FinalizationRegistry(heldValue=>{
    // ...
})
```

### FinalizationRegistry.prototype.register(target, heldValue [ , unregisterToken ] )

你可以通过`FinalizationRegistry.prototype.register()`来注册你想要在执行垃圾回收时执行清理回调的对象，可以传入三个参数分别为对应的目标对象、持有的信息值、用于取消注册的凭证。(`FinalizationRegistry`对其上注册的目标对象只有弱引用)。

其中`heldValue`可以为任何值，如果其为一个对象，那么`FinalizationRegistry`会对其产生一个强引用。

第三个参数可以用来注销注册在表中的对象，你可以通过下面的函数来注销。(`FinalizationRegistry`对象对该凭证保持弱引用)

### FinalizationRegistry.prototype.unregister ( unregisterToken )

该函数用于注销之前注册在注册表中的目标对象，你需要传入注册时的凭证来注销。

```js
registry.register(theObject, "some value", theObject);
// ...some time later, if you don't care about `theObject` anymore...
registry.unregister(theObject);
```

[ES FinalizationRegistry](https://tc39.es/ecma262/#sec-finalization-registry-objects)
[MDN FinalizationRegistry](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry)

## 数字分隔符

现在你在书写数字值时可用用`_`来分割这些数字以更好的阅读。

```js
const a = 100_000 // 100000
```

它不会有其他作用仅仅作为分隔符，注意`_`只能书写在数字之间。
