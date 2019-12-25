# 对象

一个对象由多个键值对组成。

## 对象的创建方式

可以通过*对象直接量*、关键字`new`和`Object.create()`函数来创建对象。

### 对象直接量

对象直接量是一个表达式，每次运算都会创建并初始化一个新的对象。

```js
var obj = {};
```

该对象的原型对象指向`Object.prototype`

### new 关键字 实例化构造函数创建对象

通过关键字`new`和构造函数调用创建的对象的原型指向构造函数的`prototype`

所有通过对象直接量`{}`或`new Object()`创建的对象都具有同一个原型对象(通过
`Object.prototype`访问)。

### Ojbect.create()

`Object.create(原型对象,[配置])`：第一个参数表示这个对象原型，第二个参数是一个表示配置属性及其特性的对象。(创建没有原型的对象第一个参数可以传入`null`，但这种方式创建的对象没有任何方法，可以传入`Object.prototype`来创建一个有基础方法的对象)

当指定第二个参数的配置属性时，配置属性中**未指定的属性描述符**默认为`false`,如：

```js
var i = Object.create({ x: 1, y: 2 });
//以上创建了一个空对象，该对象的原型为{x: 1, y: 2}

var e = Object.create({ x: 1 }, { y: { value: 2 }});
//以上创建了一个{y: 2}的对象，该对象的原型为{x: 1}
//该对象的y属性的配置属性除value为2外，其余为false，如：
/*     y: { value: 2
*           configurable: false,
*           enumerable: false,
*           writable: false   }
*/
```

### 通过new Object()构造函数创建对应包装对象

当通过该方法创建对象时，会根据传入的第一个参数来决定调用哪个内置对象的构造对象来创建对象，如

```js
new Object(1); // 等价于 new Number(1), 实际上调用了Number的构造函数
new Ojbect([1, 2]); // 等价于 new Array([1, 2])
```

但在`null/undefined`上, 调用该方法不会报错, 会返回一个空对象(特殊情况)

## 浏览器中的三类Javascript对象

+ 内置对象：由ES规范定义的对象或类。如：数组、函数、日期和正则表达式都是内置对象。
+ 宿主对象：由Javascript解释器所嵌入的宿主环境（比如浏览器）定义的。客户端Javascript中表示网页结构的HTMLElement对象均是宿主对象。既然宿主环境定义的方法可以当成普通的Javascript函数对象，那么宿主对象也可以当成内置对象。
+ 自定义对象：由运行中的Javascript代码创建的对象

## 对象属性

属性由键值对组成,一个键值对除名字和值之外，每个属性还有一些与之相关的值，称为'*属性特性(属性描述符)*'：

+ `writable`(可写性)：表明该属性的值是否可以设置
+ `enumerable`(可枚举)：表明是否可以通过`for/in`循环返回该属性
+ `configurable`(可配置)：表明是否可以删除或修改该属性的属性特性
+ `value`(值)：即键值
+ `get`(读取器):当查询存取器属性时，会调用该方法
+ `set`(存储器):当修改存取器属性时，会调用该方法
(当定义存取器`set/get`时,不能同时定义`value`与`writable`属性)

除包含属性之外，每个对象还拥有三个相关的*对象特性*：

+ 对象的*原型*：指向另一个对象，本对象的属性继承自它的原型对象
+ 对象的*类*：是一个标识对象类型的字符串
+ 对象的*扩展标记*：指明了是否可以向该对象添加新属性

### 按属性存在位置命名的两类属性

+ 自有属性：直接在对象中定义的属性
+ 继承属性：在对象的原型对象中定义的属性

### 属性特性(属性描述符)

一个对象的属性除了拥有值外，另外还具有以下几个特性(描述符)：

+ `writable`(可写性)：表明该属性的值是否可以设置
+ `enumerable`(可枚举)：表明是否可以通过`for/in`循环返回该属性
+ `configurable`(可配置)：表明是否可以删除或修改该属性的属性特性
+ `value`(值)：即键值
+ `get`(读取器):当查询存取器属性时，会调用该方法
+ `set`(存储器):当修改存取器属性时，会调用该方法
(当定义存取器`set/get`时,不能同时定义`value`与`writable`属性)

#### enumerable(可枚举性)

`for/in`循环可以在循环体内遍历对象中所有*可枚举*的属性（**包括自有属性和继承属性**）
对象继承的*内置方法*是不可枚举的，代码中给对象添加的属性都是可枚举的。

`Object.keys(obj)`：返回一个数组，这个数组由对象中*可枚举*的*自有属性*的名称字符串组成。

`Object.getOwnPropertyNames()`：返回对象的所有*自有属性*的名称，*包括不可枚举特性的*。

总结所有对象方法：最好直接理解名称含义

+ 带有`own`字眼的，表示自有属性
+ 遍历型方法只能遍历可枚举的

#### 属性特性的查询

为了实现属性特性的查询与设置操作，ES5定义了属性描述符的对象，这个对象代表那4个特性。通过`Object.getOwnPropertyDescriptor(obj, property)`可以获得某个对象特定属性的属性描述符，接受两个参数，第一个为要查看的对象，第二个为要查看属性的字符串表达式。该方法只能查看`自有属性`。

#### 属性特性的设置

##### 定义单个属性的属性特性

想要设置属性特性，可以调用`Object.defineProperty(obj, property, descriptor)`，传入要修改的对象、要创建或修改的属性名称，以及属性描述符对象，如：

```js
Object.defineProperty(p, "x", {
    value: 5,
    writable: true,
    enumerable: false,
    configurable: true
});
```

接受三个参数，第一个为要定义的对象，第二个为定义对象的属性名的字符串表达式，第三个为定义属性的属性特性(属性描述符)

传入该方法的属性描述符对象不必包含所有4个特性。对于新创建的属性来说，未指定的特性(属性描述符)默认的值是`false`或`undefined`；对于修改的已有属性来说，默认的特性值没有做任何修改。*这个方法不能修改继承属性*。

##### 一次性定义多个属性及其属性特性

同时修改或创建多个属性，则需要用`Object.defineProperties(obj, descriptorOjb)`。第一个参数是要修改的对象，第二个参数是一个映射表，它包含要新建或修改的属性的名称，以及它们的属性描述符：

```js
Object.defineProperties(p, {
    x: { value: 5 },
    y: { value: 6 },
    r: {
        get: function () {
            return 88;
        },
        configurable: true
    }
});
```

##### 两个定义属性描述符方法的使用规则

下面是`Object.defineProperty()`与`Object.defineProperties()`使用规则：

+ 如果对象是*不可扩展*的，则可以编辑已有的自有属性，但不能给它们添加新属性。

+ 如果属性是*不可配置*的，则不能修改它的可配置性和可枚举性。

+ 如果存取器属性是*不可配置*的，则不能修改其`getter`和`setter`方法，也不能将它转为数据属性。

+ 如果数据属性是*不可配置*的，则不能将它转换为存取器属性。

+ 如果数据属性是*不可配置*的，则不能将它的可写性从`false`修改为`true`，但可以从`true`修改为`false`

+ 如果数据属性是*不可配置且不可写*的，则不能修改它的值。然而可配置但不可写属性的值可以修改（先将标记为可写，然后修改值后变为不可写即可）

#### 可扩展对象

表示是否可以给对象添加新属性。*所有内置对象和自定义对象都是可扩展的*。

+ `Object.preventExtensions(obj)`来使对象变得*不可扩展*，一但转换就不能在转换回来。（不能在该对象上添加新属性，但自有属性可以修改和删除，该对象的原型还是可以添加属性）。可以使用`Object.isExtensible(obj)`来确定对象是否可以扩展。

+ `Object.seal(obj)`将对象设置为*不可扩展且该对象所有属性都设置为不可配置*。设置后，不能添加新属性，已有属性不能删除或配置特性，但已有的可写特性可以改写为`false`，已有的可写的值仍可以改写。可以用`Object.isSealed(obj)`来检测是否封闭。

  ```js

  //使用该方法后的对象的属性
  let Obj = {
    value: 1,
    writable: true,
    enumerable: true,
    configurable: false //改变的描述符
  }
  ```

+ `Object.freeze(obj)`将对象设置为不可扩展和其属性设置为*不可配置且可写特性设置为`false`*，将自有的所有数据属性设置为只读。设置后，对象不可配置不可改值，不可添加值，不可删除属性，但如果定义了`[[set]]`函数，访问器仍然是可写的。可以通过`Object.isFrozen(obj)`检测

  ```js
  //使用该方法后的对象的属性
  Obj = {
      value: 1,
      writable: false, //改变的描述符
      enumerable: true,
      configurable: false //改变的描述符
  }
  ```

#### 序列化对象

*对象序列化是指将对象的状态转换为字符串，也可将字符串还原为对象*。

JSON语法支持对象、数组、字符串、无穷大数字、`true`、`false`和`null`，并且它们可以序列化和还原。`NaN`和`Infinity`序列化的结果为`null`。函数、`RegExp`、`Error`对象和`undefined`值不能序列化和还原。`JSON.stringify()`只能序列化对象**可枚举的自有属性**。对于不能序列化的属性，会将该属性**省略**掉。

`toString()`
在需要将对象转换为字符串时都会调用该方法。

`toLocaleString()`
返回一个表示对象的本地化字符串。`Object.prototype`中默认的`toLocaleString()`方法仅调用`toString()`方法。`Data`和`Number`对象会对数字、日期和时间做了本地化的转换

`toJSON()`
如果在待序列化的对象存在该方法，就好调用它，返回值就是序列化的对象。然后再在该对象基础上调用`JSON.stringify()`方法

`valueOf()`
往往是当Javascript将对象转换为原始值而非字符串时才会调用它，尤其当转换为数字时。

### 对象的属性的相关操作

#### 对象属性的查询和设置

当用方括号`[]`访问属性时，方括号内表达式必须返回*字符串*或返回一个*可以转换为字符串的值*。

#### 删除对象属性

`delete`只是*断开属性和宿主对象的联系*，而不会去操作属性中的属性。如下，已删除属性的引用依然存在。所以在销毁对象时，要遍历属性中的属性依次删除。

```js
var a = {
  p: {
    x: 1
  }
};
b = a.p;//{ x: 1 }
delete a.p;
console.log(a,b);
//a为{},b为{ x: 1 }
```

`delete`运算符*只能删除自有属性，不能删除继承属性*。当`delete`表达式删除成功或没有任何副作用时（比如删除不存在属性）时，它会返回`true`。
当`delete`删除的值不为左值时，直接返回`true`，不进行任何操作。

```js
delete a.toString  //返回true a.toString并不存在
```

`delete`不能删除那些`configurable`可配置属性为`false`的属性（可以删除不可扩展对象的可配置属性）
在非严格模式下删除全局对象的可配置属性时，可以省略对全局对象的引用（`this`）。

#### 检查属性是否存在

可以通过`in`运算符、`hasOwnPreperty`、`propertyIsEnumerable`。

##### in运算符

`in`运算符左侧是属性名（字符串），右侧是对象。如果对象的自有属性或继承属性中包含这个属性则返回`true`

##### obj.hasOwnProperty

对象的`obj.hasOwnProperty`方法用来检查给定名字是否是对象的*自有属性*，继承属性将返回`false`。

##### obj.propertyIsEnumerable

`obj.propertyIsEnumerable`只有在检测的*自有属性*且是可枚举性为`true`时才返回`true`。

##### 利用属性访问

除了上述方法外，还可以通过属性（`!==`）是否等于`undefined`来判断，如：

```js
var o = { x: 1 };
o.x !== undefined;
```

这里使用`!==`而不是`!=`是因为要区分`null`和`undefined`（`null == undefined`返回`true`）

但有一种场景只能使用`in`运算符，而不能使用上面的属性访问的方式。`in`可以区分*不存在的属性*和*存在但是值为`undefined`的属性*。

```js
var o = {x: undefined};
o.x !== undefined;//false
"x" in o;//true
```

### 属性设置错误

这些情况下给*对象o*设定*属性p*会失败：

+ `o`中属性`p`是只读的：不能给只读属性重新赋值（`Object.defineProperty()`方法中   有一个例外，可以对属性特性为`configurable`(可配置)的只读属性重新赋值）

  ```js
  var obj = {
    a: 1,
    b: 2
  };
  var another = Object.create(obj, {
    x:{
        writable: false,
        configurable: true,
        enumerable: false,
        value: 5
    }
  });
  another.x = 1;
  console.log(another); //Object { x: 5 }
  Object.defineProperty(another,'x',{
        writable: true
  });
  another.x =1;
  console.log(another); //Object { x: 1 }
  ```

+ `o`中的属性`p`是继承属性，且它是只读的：不能通过同名自有属性覆盖只读的继承属性。

  ```js
  var obj = {
      a: 1,
      b: 2
  };
  var another = Object.create(obj, {
     x: {
        writable: false,
        configurable: true,
        enumerable: false,
        value: 5
     },
  });
  Object.defineProperty(obj,'b',{
       writable: false
  });
  another.b = 5;//这句话默认失败了
  console.log(another); //Object { x: 5 }  原型对象为{ a: 1, b: 2}
  ```

+ `o`中不存在自有属性`p：o`没有使用`setter`方法继承属性`p`，并且`o`的可扩展性是`false`;   如果`o`中不存在`p`，而且没有`setter`方法可供调用，则`p`一定会添加至`o`中;但如果o是不可扩展的，那么`o`中不能定义新属性。

### setter与getter属性

由`getter`和`setter`定义的属性称为存取器属性，不同于数据属性，数据属性只是一个简单的值。(这两个属性可以在属性特性中定义)

当程序查询存取器属性的值时，Javascript调用`getter`方法（无参数）。这个方法的返回值就是属性存取表达式的值;当程序设置一个存取器属性的值时，Javascript调用`setter`方法，将赋值表达式右侧的值当作参数传入`setter`。（可以忽略`setter`方法的返回值）

存取器属性不具有可写性，如果属性同时具有`getter`和`setter`方法，那么它是一个读/写属性。如果它只有`getter`方法，那么它是一个只读属性；如果它只有`setter`属性，那么它是一个只写属性。（读取只写属性总是返回`undefined`）。

```js
var p={
    x: 1.0,
    y: 1.0,
    get readAndSet(){
        return x * y;
    },
    set readAndSet(newvalue){
        let oldvalue = x * y;
        return oldvalue * newvalue;
    },

    // 只读属性的存取器，它只有getter方法
    get readonly(){return x + y;}
};
p.readAndSet; // 1
p.readAndSet = 5;// 返回5
p.readAndSet; //  还是为1

//setter与getter可以被继承
//使q继承p
var q={};
q.__proto__=p;
q.readAndSet;// 1
```

#### getter和setter的老式API

`__lookupGetter__()`与`__lookupSetter__()`返回一个命名属性的`getter`和`setter`方法。`__defineGetter__()`和`__defineSetter__()`用以定义`getter`和`setter`。这两个函数的第一个参数是属性名字，第二个参数是`getter`和`setter`方法。

### 对象的原型属性

#### 查询对象的原型对象

将要查询的对象作为参数传入`Object.getPrototypeOf(obj)`可以查询它们的原型。

通过`new`创建的对象，通常继承一个`constructor`属性，这个属性指代创建这个对象的构造函数。这个属性是原型对象的自有属性。

要检测一个对象是否是另一个对象的原型（或处于原型链中）可以使用`obj1.isPrototypeOf(obj2)`方法，例如检测`p`是否为`q`的原型：

```js
p.isPrototypeOf(q);
```

### 对象类属性

对象的类属性是一个字符串，用以表示对象的类型信息。只有一种间接的方式可以查询它。
可以通过对象的`toString`方法查询类，返回如下格式字符串`[object class]`。
其中`class`表示所属类名

```js
//可以通过以下方法查看任何对象的类属性,obj为你要查找的对象
Object.prototype.toString.call(obj);
```

#### 类和原型

在Javascript中，同一个类的所有实例对象都从同一个原型对象上继承属性。

#### 类和构造函数

构造函数用来初始化新创建的对象的，构造函数只需要初始化新对象的状态。

通过同一个构造函数创建的所有对象都继承自同一个原型对象。

**定义构造函数即是定义类，类名首字母要大写**。

#### 构造函数和类的标识

`instanceof`不会检查一个类是否由一个构造函数初始化而来会检查检查该类是否继承自构造函数的`prototype`属性。

#### constructor属性

对象继承的`constructor`属性均指代它们的构造函数。

## 继承

Javascript中只有查询属性时才会体会到继承的存在，一个对象会继承其原型对象上的所有属性————当访问一个对象属性时，若该属性不存在于对象自身上，则会沿着原型链在原型链的原型对象上一个一个向上查找，直到找到；没找到时返回`undefined`

[关于继承的方式](./继承/README.md)
