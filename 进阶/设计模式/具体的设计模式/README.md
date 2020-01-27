# 具体的设计模式

目录：

- `Constructor`(构造器)模式
- `Module`(模块)模式
- `Revealing Module`(揭示)模式
- `Singleton`(单例)模式
- `Observer`(观察者)模式
- `Mediator`(中介者)模式
- `Prototype`(原型)模式
- `Command`(命令)模式
- `Facade`(外观)模式
- `Factory`(工厂)模式
- `Mixin`(混入)模式
- `Decorator`(装饰者)模式
- `Flyweight`(享元)模式

## Constructor(构造器)模式

`Constructor`是一种在内存已分配给对象的情况下，用于初始化新创建对象的特殊方法。在`Javascript`中，几乎所有东西都是对象，我们通常最感兴趣的是`object`构造器。

### 基本Constructor(构造器)

`Javascript`不支持类的概念，但它确实支持与对象一起用的特殊constructor(构造器)函数。通过在构造器前面加`new`关键字，告诉`Javascript`像使用构造器一样实例化一个新对象，并且对象成员由该函数定义。

在构造器内，关键字`this`引用新创建的对象。

### 带原型的Constructor(构造器)

`Javascript`中有一个名为`prototype`的属性。调用`Javascript`构造器创建一个对象后，新对象就会具有构造器原型的所有属性。

## Module(模块)模式

模块是任何强大应用程序架构中不可或缺的一部分，它通常能够帮组我们清晰地分离和组织项目中的代码单元。

在`Javascript`中，有几种用于实现模块的方法，包括：

- 命名空间
- `Module`模式
- `AMD`模块
- `CommonJS`模块
- `ECMAScript Harmony`模块

### Module模式

`Module`模式最初被定义为一种在传统软件工程中为类提供私有和公有封装的方法。在Javascript中，`Module`模式用于进一步模拟类的概念，通过这种方式，能够使一个单独的对象拥有公有/私有方法和变量，从而屏蔽来自全局作用域的特殊部分。产生的结果是：函数名与在页面上其他脚本定义的函数冲突的可能性降低。

#### 私有

`Module`模式使用闭包封装私有状态和组织。它提供一种包装混合公有/私有方法和变量的方式，防止其泄露至全局作用域，只需要返回一个公有`API`，而其他一切规则都维持在私有闭包中。该模式除返回一个对象而不是一个函数之外，非常类似于一个立即调用的函数表达式。

```js
var testModule = (function () {
    var counter = 0;

    return {
        incrementCounter: function () {
            return counter++;
        }
    };
})();
```

### Revealing Module(揭示模块)模式

产生原因：当我们想从另一个方法调用一个公有方法或访问公有变量时，必须要重复主对象的名称。这就会导致创建一个更新的模式，能够在私有范围内简单定义所有的函数和变量，并返回一个匿名对象，它拥有指向私有函数的指针，并且该函数是我们希望共有的方法，如：

```js
var myRevealingModule = function () {
    var privateVar = 'p';

    function privateFunction (str) {
        privateVar = str;
    }

    return {
        setName: privateFunction
    }
}
```

这里可以理解为揭示模式就是在模块模式的基础上，返回的对象中的方法直接是**指向内部私有函数的指针**。

#### 优点

这种模式的优点是可以使代码语法更加一致。在模块代码的底部，它会较清晰的指出哪些函数和变量可以被公开访问，从而改善可读性。

#### 缺点

这种模式的缺点就是如果一个私有函数引用一个公有函数，那么在更新这个私有函数时，公有函数是不能被覆盖的。因为私有函数将继续引用私有函数的实现，所以该模式不适用于公有成员，只适用于函数。

具体意思如下例子：

```js
var api = (function () {
    function privateFn () {
        Fn1();
    }

    function Fn1 () {

    }

    return {
        f: Fn1
    };
})();
```

这里我们将`Fn1`作为共有函数暴露，但我们可以看到在内部，`privateFn`私有函数引用了`Fn1`函数，即使我们重写接口中的`f`函数，`privateFn`仍然会调用内部的`Fn1`函数。

## Singleton(单例)模式

单例模式限制了类的实例化次数，且只能为一次。从经典意义上来说，`Singleton`模式，在该实例不存在的情况下，可以通过一个方法创建一个类来实现创建类的新实例；如果实例已经存在，它会简单返回该对象的引用。

`Singleton`不同于静态类(或对象)，因为我们可以**延迟它们的初始化**，这通常是因为它们需要一些信息，而这些信息在初始化期间可能无法获得。在`Javascript`中，`Singleton`充当共享资源命名空间，从全局命名空间中隔离出代码实现，从而为函数提供单一访问点。这里举出一个具体的例子：

```js
function Singleton () {

    let instance = null;

    function _init () {
        // ...
    }

    return {
        init: function () {
            if (instance) {
                return instance;
            } else {
                instance = _init();
            }
        }
    }
}
```

`Singleton`模式很有使用价值，但通常当我们要使用它时，就说明我们可能需要重新评估我们的设计了，这个模式的存在往往表明系统中的模块要么是系统紧密耦合，要么是其逻辑过于分散在代码库的多个部分。
