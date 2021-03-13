# 2020年第11次版本

今年新增`feature`总结:

- `String.prototype.matchAll()`会生成一个匹配符合正则表达式的所有字符串片段的遍历器
- `import()`异步动态导入模块
- `BigInt`一种新的原始值，可以是任何精度的整数
- `Promise.allSettled`
- `globalThis`一种统一通用的方式是访问全局的`this`
- `export * as ns from 'module'`在模块内导出另一个模块变量
- `import.meta`一个模块中的对象，包含了该模块的上下文信息
- `nullish`一种新的概念，表示`null`或`undefined`
- [`??`可选链操作符](#可选链操作符optional-chains)，当操作符左侧结果为`nullish`时，返回右侧表达式结果
- [`?.`可选链操作符](#可选链操作符optional-chains)，一种属性访问或函数调用方式，如果该属性或函数为`nullish`则不会继续执行。

**首先公布一个新的概念，[`nullish`](https://developer.mozilla.org/en-US/docs/Glossary/nullish)表示`null`或`undefined`**

## globalThis

`globalThis`包含全局的`this`的值，它类似于全局对象。

在不同的环境实现中，全局的`this`是不同的，比如浏览器中为`window/self/frames`，`WebWorker`中为`self`，`nodejs`中为`global`。现在`globalThis`提供一个标准来获取它们，你不需要去关注它们在不同环境中的差异。

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
