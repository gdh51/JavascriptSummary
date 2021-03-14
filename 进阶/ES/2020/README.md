# 2020年第11次版本

今年新增`feature`总结:

- [`String.prototype.matchAll()`](#stringprototypematchallregexp)会生成一个匹配符合正则表达式的所有字符串片段的遍历器
- [`import()`异步动态导入模块](#import运行时动态引入模块)
- [`BigInt`](#bigint)一种新的原始值，可以是任何精度的整数
- [`Promise.allSettled`](#promiseallsettlediterable)，当所有`Promise`元素的状态改变时，改变返回的`Promise`状态
- [`globalThis`](#globalthis)一种统一通用的方式是访问全局的`this`
- [`export * as ns from 'module'`](#export-from模块内重导出)在模块内导出另一个模块变量
- [`import.meta`](#importmeta模块元信息)一个模块中的对象，包含了该模块的上下文信息
- `nullish`一种新的概念，表示`null`或`undefined`
- [`??`可选链操作符](#可选链操作符optional-chains)，当操作符左侧结果为`nullish`时，返回右侧表达式结果
- [`?.`可选链操作符](#可选链操作符optional-chains)，一种属性访问或函数调用方式，如果该属性或函数为`nullish`则不会继续执行。

**首先公布一个新的概念，[`nullish`](https://developer.mozilla.org/en-US/docs/Glossary/nullish)表示`null`或`undefined`**

## String.prototype.matchAll(regexp)

该函数调用后会返回一个遍历器(`iterator`)，其中每一个遍历值为一个包含当前匹配内容的数组，如果没有匹配的话则该函数返回`null`。(注意使用的正则表达式需要具有`g flag`)

```js
const str = 'blink/green/day',
    REG = /(blink)|(green)/g

const result = [ ...str.matchAll(REG) ] // [ ['blink', 'blink', undefined],  ['green', undefined, 'green'] ]
```

Reference:
[ES String.prototype.matchAll ( regexp )](https://tc39.es/ecma262/#sec-string.prototype.matchall)
[MDN String.prototype.matchAll()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll)

## BigInt

`BigInt`类型的值是一种新的原始值，它表示大于2<sup>53</sup> - 1的任意精度整数。这是`Number`类型所能表示的最大的值，而`BigInt`可以表示任意大的整数。

>目前原始类型值就有`7`种：`Undefined`, `Null`, `Boolean`, `Number`, `BigInt`, `String`, and `Symbol`。

可以在任意一个整数后加上`n`或直接调用`BigInt()`来定义一个`BigInt`

```js
const a = 10n
const b = BigInt(10)

a === b // true

const hugeHex = BigInt("0x1fffffffffffff") // 9007199254740991n
```

**注意：`BigInt`不能与`Number`混合运算，也不能使用`Math`中的方法。并且在`Number`与`BigInt`的转化中，可能会存在精度丢失的问题。**

### 运算

`BigInt`可以使用的运算符有`+`、`-`、`*`、`/`、`%`...除`>>>`(无符号右移)之外的位运算。(原因是`BigInt`有符号)。且`BigInt`不支持单目`+`运算符。

```js
+5n // 报错Cannot convert a BigInt value to a number
```

不过在进行`/`运算时，操作的结果会向下取整:

```js
5n / 2n // 2n
```

### 比较

相同的`Number`和`BigInt`的值不严格相等(`===`)，但宽松相等(`==`)

```js
1n === 1 // false
1n == 1 // true
```

在混合`Number`与`BigInt`的数组中使用`Array.prototype.sort()`进行排序会正常排序：

```js
[1, 3n, 2n, 5].sort() // [1, 2n, 3n, 5]
```

### 静态方法

`BigInt`一共有两个静态方法：

#### BigInt.asIntN(bits, bigInt)

该方法将传入的`bigInt`值转化为-2<sup>bits-1</sup>与2<sup>bits-1</sup>-1之间的有符号整数。其中第一个参数`bits`表示可存储整数的位数，第二个参数`bigInt`表示要存储指定位数上的整数，改函数返回值为`bigInt`的模2<sup>bits</sup>(模`X`表示该数除以`X`的余数)作为有符号整数的值。

```js
BigInt.asIntN(12, 12n) // 12n
BigInt.asIntN(3, 12n) // -4n
```

Reference:
[ES BigInt.asIntN(bits, bigInt)](https://tc39.es/ecma262/#sec-bigint.asintn)
[MDN BigInt.asIntN(bits, bigInt)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt/asIntN)

#### BigInt.asUintN(bits, bigint)

该方法将传入的`bigInt`值转化为0与2<sup>bits</sup>-1之间的无符号整数。其中第一个参数`bits`表示可存储整数的位数，第二个参数`bigInt`表示要存储指定位数上的整数，改函数返回值为`bigInt`的模2<sup>bits</sup>(模`X`表示该数除以`X`的余数)作为无符号整数的值。

Reference:
[ES BigInt.asIntN(bits, bigInt)](https://tc39.es/ecma262/#sec-bigint.asintn)
[MDN BigInt.asUintN(bits, bigint)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt/asUintN)

BigInt Reference:
[ES BigInt](https://tc39.es/ecma262/#sec-bigint-objects)
[MDN BigInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

## Promise.allSettled(iterable)

该函数接受一个迭代器对象(或具有其标识符)作为参数，返回一个`Promise`对象。当迭代器中所有的`Promise`对象(不是`Promise`对象时会被转化为)的状态发生变化时，该返回的`Promise`对象会被`fulfilled`，并将迭代器中所有的`Promise`对象的结果作为数组元素传递到下一个`Promise`对象。

对于每一个传入下一个`Promise`对象的结果，其为一个对象，它们都具有`status`值，表示其对应`Promise`的最终状态；另外还有一个`value/reason`表示其`resolve/reject`的值。

```js
const p1 = Promise.resolve(1),
    p2 = Promise.reject(2),
    p3 = new Promise(resolve => setTimeout(() => resolve(3)), 300)

Promise.allSettled([p1, p2, p3]).then(result => console.log(result)) 
// [{ status: 'fulfilled', value:1 }, { status: 'rejected', reason: 2 }, { status: 'fulfilled', value: 3 }]
```

Reference:
[ES Promise.allSettled(iterable)](https://tc39.es/ecma262/#sec-promise.allsettled)
[MDN Promise.allSettled()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)

## export from模块内重导出

为了是模块导入变得可用，在父模块中导入/导出这些模块也可行。即我们可以单独创建一个模块来集中导入导出一些模块。

```js
export {
    default as function1,
    function2
} from 'module1'

// 等价于
import {
    default as function1,
    function2
} from 'module1'
export {
    function1,
    function2
}
```

[ES ResolveExport ( exportName [ , resolveSet ] ) Concrete Method](https://tc39.es/ecma262/#sec-resolveexport)
[MDN Using export from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_export_from)

## import()运行时动态引入模块

通过该函数可以动态的加载模块，其参数部分可以为动态的模块路径。但是注意尽量用静态的方式导入模块，因为它有利于初始化依赖和静态分析工具和`tree shaking`

```js
import(AssignmentExpression)
```

调用该函数后会返回`Promise`对象，其会将导入的模块作为参数。

```js
import('/a.js').then(module => {
    // ...
})

// or
const module = await import('/a.js')
```

Reference:
[ES Import Calls](https://tc39.es/ecma262/#sec-import-calls)
[MDN import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)

## import.meta模块元信息

`import.meta`是一个给`JavaScript`模块暴露特定上下文的元数据属性的对象。它包含了这个模块的信息，比如说这个模块的`URL`。

Reference:
[MDN import.meta](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/import.meta)
[ES HostGetImportMetaProperties](https://tc39.es/ecma262/#sec-hostgetimportmetaproperties)

## globalThis

`globalThis`包含全局的`this`的值，它类似于全局对象。

在不同的环境实现中，全局的`this`是不同的，比如浏览器中为`window/self/frames`，`WebWorker`中为`self`，`nodejs`中为`global`。现在`globalThis`提供一个标准来获取它们，你不需要去关注它们在不同环境中的差异。

Reference:
[ES Value Properties of the Global Object](https://tc39.es/ecma262/#sec-global-object)
[MDN globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis)

## ??空值合并操作符(Nullish coalescing operator)

```js
leftExpression ?? rightExpression
```

空值合并操作符会在左侧的表达式的结果为`nullish`时返回右侧的值，否则返回左侧值。

>与`||`操作符不一样，`||`操作符在左侧表达式计算结果为`falsy`时就会返回右侧的值

```js
const foo = null ?? 'blink182' // foo = blink182

const zoo = 0 ?? 'sum41' // zoo = 0
```

Reference:
[ES CoalesceExpression](https://tc39.es/ecma262/#sec-binary-logical-operators-runtime-semantics-evaluation)
[MDN Nullish coalescing operator (??)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)

## ?.可选链操作符(Optional Chains)

`?.`可选链操作符可以在访问一个属性或调用一个函数时确保其访问/调用的安全性。当访问的属性的主体或调用的函数为`nullish`值时，则会短路，不再继续执行。

```js
obj?.prop
obj?.[expression]
array?.[index]
function?.()
```

`?.`操作符类似于`.`操作符，但不同的是如果访问的属性的主体为`nullish`，则不会引起错误并返回`undefined`。

```js
const a = { b: null, d: 1 }

a.b?.c // 返回undefined
a.b?.() // 返回undefined，因为这是一个nullish值
a.d?.() // 报错，d不是函数
```

Reference:
[ES Optional Chains](https://tc39.es/ecma262/#sec-optional-chains)
[MDN Optional Chains](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
