# 继承

主要记录关于对象继承的一些模式

## 原型链继承(类式继承)

即继承父级类的原型链上的属性,该方法通过继承父类的实例来实现

```js
function Parent(age, hobby) {
    this.age = age
    this.hobby = hobby
}

Parent.prototype.getAge = function () {
    return this.age
}

function Child(name) {
    this.name = name
}

Child.prototype = new Parent()
Child.prototype.constructor = Child
```

从上面可以看到，其通过一个父类的实例来完成对父级的继承，但缺点也很明显，子类实例化的所有实例访问原型上的值都为同一个。

优点：

-   可以在父级原型对象上定义的公有属性和方法

缺点：

-   无法继承父类构造函数属性
-   父类的引用属性修改会影响其他子类
-   需要修改`constructor`指向

## 构造函数继承

即通过`Function.prototype.call/apply`来继承父类构造函数里的属性

通过该方法可以为子类定义**私有属性**与**公有属性**

```js
function Parent(age, hobby, private, common) {
    this.age = age
    this.hobby = hobby

    ///////////新增////////////
    this.private = private //定义私有属性即使是引用类型变量

    this.common = common //定义共有属性, 前提是传入的common变量是某一个公共的引用类型值,例如下面的common数组
    ///////////新增////////////
}

let common = [1, 2, 3]

Parent.prototype.getAge = function () {
    return this.age
}

function Child(age, hobby, private, common, name) {
    ///////////新增////////////
    Parent.call(this, age, hobby, private, common)
    ///////////新增////////////
    this.name = name
}

new Child(18, 'play', { size: 'big' }, common, 'Jolin')
//创建了一个child, 其中common属性是共有的, size所在对象是私有的
```

优点：

-   可以定义私有属性方法
-   子类可以继承父类构造函数属性

缺点：

-   公有属性必须提前定义在外，失去了封装性
-   无法继承父类原型属性和方法

## 组合继承

结合上述两种方式即是组合继承

```js
function Parent(age, hobby, private) {
    this.age = age
    this.hobby = hobby
    this.private = private
}

let common = [1, 2, 3]

Parent.prototype.getAge = function () {
    return this.age
}

///////////差异////////////
Parent.prototype.common = common
///////////差异////////////

function Child(age, hobby, private, name) {
    ///////////差异////////////
    Parent.call(this, age, hobby, private)
    ///////////差异////////////
    this.name = name
}

///////////差异////////////
Child.prototype = new Parent()
Child.prototype.constructor = Child
///////////差异////////////
```

优点：

-   公有属性存储于父级实例
-   私有属性存储于构造函数
-   可以继承父类构造函数属性

缺点：

-   重复 2 次调用父类构造函数, 消耗性能
-   需要修改`constructor`指向

## 原型式继承

利用一个中间的构造函数, 返回一个继承其父级原型属性的实例

```js
function Parent(age, hobby, private) {
    this.age = age
    this.hobby = hobby
    this.private = private
}

///////////差异////////////
//等同于Object.create()
function createObject(obj) {
    function Middle() {}
    Middle.prototype = obj

    return new Middle()
}

createObject(Parent.prototype)
///////////差异////////////
```

优点：

-   父类方法可以复用

缺点：

-   父类原型链上引用属性被共享
-   不能继承父类构造函数属性

## 寄生式继承

在原型式继承的基础上为子类添加额外的属性和方法

```js
function createObject(obj) {
    function Middle() {} //中间对象构造函数

    Middle.prototype = obj

    return new Middle()
}

function Parent(age, hobby, private) {
    this.age = age
    this.hobby = hobby
    this.private = private
}

///////////差异////////////
function Child(name) {
    let resObj = createObject(Parent.prototype)

    resObj.name = name

    return resObj
}
///////////差异////////////
```

优点：

-   给子类可自定义属性和方法
-   父类方法可以复用

缺点：

-   无法继承父类构造函数属性
-   父类引用类型属性被共享

## 寄生组合式继承

结合了组合继承与原型式继承

```js
function createObject(obj) {
    function Middle() {} //中间对象构造函数

    Middle.prototype = obj

    return new Middle()
}

function Parent(age, hobby, private) {
    this.age = age
    this.hobby = hobby
    this.private = private
}

///////////差异////////////
function Child(age, hobby, private, name) {
    Parent.call(this, age, hobby, private)

    this.name = name
}

Child.prototype = createObject(Parent.prototype)
Child.prototype.constructor = Child
///////////差异////////////
```

优点：

-   公有的属性写在原型
-   私有的属性写在构造函数
-   继承了父类构造函数属性
-   只会调用一个父类构造函数(即继承父类构造函数属性时)

缺点:

-   需要修改`constructor`指向
-   增加一个原型链长度

## ES6 class

通过`extends`来继承

### extends 继承

该种类型的继承 **等同于** 寄生组合式继承

```js
class Parent {
    constructor(age, hobby, privateProp) {
        this.age = age
        this.hobby = hobby
        this.private = privateProp
    }

    say() {
        return this.age
    }
}

class Child extends Parent {
    constructor(age, hobby, privateProp, name) {
        super(age, hobby, privateProp)
        this.name = name
    }
}
```

它与组合寄生式继承的主要区别在于：

-   父级构造函数的继承顺序。
-   `class`只能作为构造函数通过`new`操作符调用
-   `class`有私有方法和私有变量，通过`#`前缀标识
