# 结构型设计模式

这里记录着结构型设计模式

**目录：**

## Decorator(装饰者)模式

`Decorator`是一种结构型设计模式，同样旨在促进代码复用。与`Mixin`模式相似，它们可以被认为是另一个可行的对象子类化的代替方案。

通常，`Decorator`提供了将行为(函数)动态添加至系统的现有类的能力。它主要表达的意思是，**装饰者模式对于类原有的基本功能来说并不是必要的；否则，它就可以被合并到超类(父类)本身了**。

装饰者模式可以用于修改现有的系统，希望在系统中为对象添加额外的功能，而不需要大量修改使用它们的底层代码。该模式并不依赖于创建对象的方式，而是关注扩展其额外功能。

### 实现

我们使用一个单一的基本对象并逐步添加提供额外功能的`decorator`对象，而不是仅仅依赖于原型继承，简言之就是：向基本对象添加(装饰)属性或方法，而不是进行子类化，因此它较为精简。下面给出一个简单实现的例子：

```js
function vehicle (vehicleType) {
    this.vehicleType = vehicleType || 'car';
    this.model = 'default';
    this.license = '00000-000';
}

var testInstance = new vehicle('car');

// 给car装饰新的功能
testInstance.setModel = function (modelName) {
    this.model = modelName;
}
```

但上述例子并未体现装饰者所提供的所有优势。下面举出一个更具体的例子：

```js
function MacBook () {
    this.cost = function () { return 997; };
    this.screenSize = function () { return 11.6; };
}

// Decorator 1 第一个装饰器
function Memory (macbook) {
    var v = macbook.cost();
    macbook.cost = function () {
        return v + 75;
    };
}

// Decorator 2 第二个装饰器
function Engraving (macbook) {
    var v = macbook.cost();
    macbook.cost = function () {
        return v + 200;
    };
}

var mb = new MacBook();

// 调用函数为mb实例装饰新的方法
Memory(mb);
Engraving(mb);
```

在这个示例中，`Decorator`重写`MacBook`超类对象的`.cost()`函数来返回`MacBook`的当前价格加上特定的升级价格。

## Flyweight(享元)模式

该模式用于优化重复、缓慢及数据共享效率较低的代码。它旨在通过与相关的对象共享尽可能多的数据来减少应用程序中内存的使用。

Flyweight模式的应用一般有两种：第一种用于数据层，处理内存中保存的大量相似对象的共享数据；第二种是用于DOM层，用作中央事件管理器，来避免将事件处理器附加到父容器中的每个子元素上。(说白了就是事件委托)
