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

## Observer(观察者)模式

该模式是一种设计模式，具体为：一个对象(称为`subject`/被观察的主题)维持一系列依赖于它(观察者Observer)的对象，并将有关状态的任何变动信息自动通知给它们。

当一个目标需要告诉观察者发生了什么有趣的事情，它会向观察者广播一个通知(并包含与该主题有关的某些数据)；当我们不再希望某个观察者获取其观察的目标发出的改变通知时，该主题对象可以将它从观察者列表中删除。

按上述逻辑我们可以使用以下的组件来实现`Observer`模式：

*Subject(主题)*
维护一系列的观察者，方便添加或删除观察者

*Observer(观察者)*
为那些在主题状态发生改变时需获得通知的对象提供一个更新接口

*ConcreteSubject(具体主题)*
状态发生改变时，想`Observer`发出通知，存储`ConcreteObserver`的状态

*ConcreteObserver(具体观察者)*
存储一个指向`ConcreteSubject`的引用，实现`Observer`的更新接口，以使自身状态与主题的状态保持一致

这里举一个小例子：

```js
function ObserverList () {
    this.list = [];
}

ObserverList.prototype.add = function (observer) {
    this.list.push(observer);
}

ObserverList.prototype.del = function (observer) {
    const list = this.list;
    return this.list.splice(list.indexOf(observer), 1);
}

// 观察者对象
function Observer () {
    // ....
}

Observer.prototype.update = function (payload) {
    // ....更新时的逻辑
}

// 主题
function Subject () {
    this.observers = new ObserverList();
}

// 主题发生变化时，手动调用该函数，触发通知所有观察者更新
Subject.prototype.notify = function (payload) {
    this.observers.forEach(observer => {
        observer.update(payload);
    });
}
```

上述代码未涉及到具体的观察者与主题，只涉及到了抽象的两者，具体的实现要将两者附加于具体的主题与观察者之上，如果你使用过Vue库并对其原理有一定了解，那么你应该知道其中的`Watcher`与`Dep`就是应用的这种模式。

## Publish/Subscribe(发布/订阅)模式

该模式使用了一个主体/事件管道，这个管道介于希望接收到通知(订阅者)的对象和激活事件的对象(发布者)之间。该事件系统运行代码定义应用程序的特定事件，这些事件可以传递自定义参数，自定义参数包含订阅者所需的值。其目的是**避免订阅者和发布者之间产生依赖关系**。

这里给出一个经典的例子：

```js
class EventChannel {
    constructor () {
        this.channel = {};
    }

    // 这里可以理解为发布事件
    on (name, callback) {
        if (typeof name === 'string') {
            if (Array.isArray(this.channel.name)) {
                this.channel.name.push(callback);
            } else {
                this.channel.name = [callback];
            }
        }
    }

    // 这里可以理解为订阅事件
    emit (name, payload) {
        if (typeof name === 'string') {
            (this.channel.name || []).forEach(callback => callback(payload))
        }
    }

    // 这里可以理解为解除订阅
    off (name, callback) {
        if (typeof name === 'string') {
            if (callback === void 0) {
                this.channel.name = [];
            } else {
                this.channel.name.splice(this.channel.name.indexOf(callback), 1)
            }
        }
    }
}
```

## Mediator(中介者)模式

中介者是一种行为设计模式，它允许我们公开一个统一的接口，系统的不同部分可以通过该接口进行通信。

如果一个系统的各个组件之间看起来有太多的直接关系，也许是时候需要一个中心控制点了，以便各个组件可以通过这个中心控制点进行通信。`Mediator`模式促进松散耦合的方式是：确保组件的交互是通过这个中心点来处理的，而不是通过显式地引用彼此。

>这里举个简单例子，假如有三个系统，分别为`a`、`b`、`c`，当我们操作`a`时，如果想要同时操作`b`，那么此时一般的解决方法就是在`a`的逻辑中，书写操作`b`的逻辑。但这样就会出现个问题：如果`b`需要更换或有新的操作需要添加，则需重写`a`逻辑，相关的逻辑被过分的耦合在了`a`的逻辑中。

所以此时引入一个中间管家来处理它们之间的关系，负责为它们传达相互之间的操作。就是实现上而言，`Mediator`模式本质上是`Observer`模式的共享目标。它假设该系统中对象或模块之间的订阅和发布关系被牺牲掉了，从而维护中心联络点。

### 优点与缺点

该模式的最大好处就是：它能将系统中对象或组件之间所需的通信渠道从多对多减少到多对一。同样这也导致了它的缺点：它会引入单一故障点，且模块之间的通信性能会下降，因为它们总是间接通信。

这里就不具体实现了，具体实现和发布订阅者模式相似，但它描述的是对象之间的交互行为。

## Prototype(原型)模式

该模式是一种基于现有对象模版，通过克隆方式创建对象的模式。

恰好在Javascript为我们提供了Object.create()方法来实现该模式，当然我们也可以自行实现：

```js
function create (proto) {
    function M () {};
    M.prototype = proto;
    return new M();
}
```

## Command(命令)模式

该模式旨在将方法调用、请求或操作封装到单一对象中，从而根据我们不同的请求对客户进行参数化和传递可供执行的方法调用。此外，这种模式将调用操作的对象与知道如何实现该操作的对象解耦，并在交换出具体类(对象)方面提供更大的整体灵活性。

Command模式背后的主要思想是：它为我们提供一种分离职责的手段，这些职责包括从执行命令的任意地方发布命令以及将该职责转而委托给不同对象。实施明智的、简单的命令对象将把执行操作的动作和调用该动作的对象绑定在一起。它们始终包含一个执行操作(如run()或execute())。所有具有相同接口的Command对象可以根据需要轻松交换，这也是该模式的一个优点，这里举个简单的例子：

```js
// 有个如下的汽车购买服务
(function () {
    var CarManager = {
        requestInfo (model, id) {
            // ...
        },

        buyVehicle (model, id) {
            // ...
        },

        arrangeViewing (model, id) {
            // ...
        },
    }
})();
```

将上述转化为Command模式，以便我们能通过以下方式执行对应的函数：

```js
CarManager.execute('requestInfo', 'xxx', 1);
CarManager.execute('buyVehicle', 'xxx', 1);
CarManager.execute('arrangeViewing', 'xxx', 1);
```

所以对应的模式应该为：

```js
CarManager.execute = function (method, model, id) {
    return CarManager[method] && CarManager[method](model, id);
}
```
