# Javascript的模块化

在可扩展Javascript的世界里，如果我们说一个应用程序是模块化的，那么通常意味着它是由一系列存储于模块中的高度解耦、不同的功能片段组成。

在模块化的发展中，一共出现了几个比较有名的模块化解决方案，它们是`AMD`和`CommonJS`，当然还有现在尚未成熟的`ES6 Harmony`。

## AMD

异步模块定义(`AMD`)的整体目标是提供模块化的`Javascript`解决方案，以便开发人员使用。

`AMD`模块格式本身就是对定义模块的建议，其模块和依赖都可以进行**异步加载**。

### AMD模块入门

关于AMD有两个关键的概念值得我们注意的，它们是用于模块定义的`define()`方法和用于处理依赖加载的`require()`方法。

使用`define()`方法可以定义已命名或未命名模块：

```js
define(module__id, // 模块名称，可选
    [dependencies], // 依赖的模块数组，可选
    definition function // 实例化模块或对象的函数
);
```

其中`module_id`为可选参数，代表该模块的名称，未传入该参数时会被命名为`anonymous`(匿名)，当使用匿名模块时，模块身份的概念是DRY(不重复)，**可以将`module_id`理解为文件路径**。

`dependencies`参数表示我们定义模块所需的依赖数组，第三个参数是用于执行实例化为模块的函数。一个标准的模块可能如下：

```js
define('./my_module',
    ['./a.js', './b.js'],
    function (a, b) {
        var my_module = {
            name: 1
        };

        return my_module;
    });
```

其具体实现有[`RequireJS`](https://requirejs.org/docs/download.html)

## CommonJS

`CommonJS`模块建议指定一个简单的`API`来声明在浏览器外部(服务器)工作的模块。与`AMD`不同，它视图包含更广泛的引人关注的问题，如`IO`、文件系统。

**CommonJS是对服务器JS规范的实现**。

### CommonJS模块入门

从结构的角度来看，`CommonJS`模块是`Javascript`中的可复用部分，导出特定对象，以便可以用于任何依赖代码。与`AMD`不同，在这种模块周围通常是没有函数封装器的(所以没有`AMD`的`require()`方法)。

`CommonJS`模块基本上包含两个主要部分：自由变量`exports`，它包含了一个模块希望其他模块能够使用的对象，以及`require()`函数，模块可以使用该函数来导入其他模块导出(`export`)的对象。

```js
// 导入其他模块的接口
var lib = require('./other_module');

// 导出这个模块
module.exports.a = xxx;

// 也可以直接使用exports变量导出，但注意不要重写了exports对象
exports.b = 1;
```

等效于AMD模块的如下的写法：

```js
define(function (require) {
    // 导入其他模块的接口
    var lib = require('./other_module');

    return {
        a: xxx,
        b: 1
    }
});
```

现在在`NodeJS`中，该规范被实现。

## AMD和CommonJS：互相竞争，标准同效

`AMD`和`CommonJS`都是有效的模块格式，有不同的最终目标。

`AMD`采用浏览器优先的开发方法，选择**异步行为**和简化的向后兼容性，但是它没有任何文件`I/O`的概念。它支持对象、函数、构造函数、字符串、`JSON`以及很多其他类型的模块，在浏览器中原生运行，非常灵活。

另一方面，`CommonJS`采用服务器优先方法，假定**同步行为**，没有全局概念这个精神包袱，并试图服务器`JS`规范。由于**_`CommonJS`支持非包装模块**，它可以更接近下一代`ES Harmony`规范，让我们摆脱`AMD`强制执行的`define()`包装器。但`CommonJS`模块仅将对象作为模块给予支持。

## ES Harmony

TC39用于定义`ECMAScript`语法和语义的标准体，为了支持更高级的模块，它已经起草了一份模块系统规范。

在这份规范中，使用`import`关键字指定其依赖项；使用`export`来导出一个模块接口；通过`import`来导入一个模块，其内部的局部变量可以被重命名以避免名称冲突；通过`export`声明来声明一个外部可见模块的本地绑定，这样其他模块可以获取该导出接口，但不能修改它们。

该模块还建议支持基于远程的模块(第三方库)，以便使从外部位置载入模块简单化。
