# 函数

如果函数挂载在一个对象上，作为对象的一个属性，就称它为对象的方法。

一条函数声明语句实际上声明了一个变量，并把一个函数对象赋值给它; 如果函数定义表达式包含名称，函数的局部作用域将会包含一个绑定到函数对象的名称(通过`name`属性可以访问)。

```js
var i = function a() {}
console.log(i.name); // a
```

实际上，函数的名称将会成为函数内部的一个局部变量。有一些函数用做内部函数或私有函数，这种函数通常以_为前缀。

## 函数调用的形式

4种方式来调用Javascript函数：

+ 作为函数
+ 作为方法
+ 作为构造函数
+ 通过它们的`call()`和`apply()`方法调用

### 函数调用

在函数体中存在一个形参的引用，指向当前传入的实参列表，通过它可以获得参数的值。
对函数调用上下文（`this`的值）是全局对象; 在严格模式下`this`为`undefined`。

可以通过`this`来判断是否为严格模式：

```js
var isStrict = (function () {
    return !this;
})();
```

### 方法调用

方法调用和函数调用的区别，调用上下文不同。任何函数只要作为方法调用实际上都会传入一个隐式的实参 —— 调用该方法的对象

在嵌套函数中调用函数则`this`值不是全局对象就是`undefined`（严格模式）

```js
var isStrict=(function () {
    f();
    function f() {
        console.log(this);//window
    }
    return !this;
})();
```

### 构造函数调用

如果构造函数在调用时圆括号内包含一组形参列表，先计算这些实参表达式，然后传入函数内，在按函数调用规则即可。没有参数时，可以省略括号。

```js
// 传入a, b, c三个参数
Contructor(a, b, c);
```

>构造函数调用创建一个新的空对象，这个对象继承自构造函数的`prototype`属性。构造函数试图初始化这个新创建的对象，并将这个对象用作其调用上下文，因此构造函数可以使用`this`关键字来引用这个新创建的对象。

如果构造函数显式地使用`return`语句返回一个对象，那么调用表达式的返回值就是这个对象; 如果调用`return`但没有返回值或返回值是原始值，则会忽略这个值，以创建的新对象作为返回值。

### 间接调用

`call()`和`apply()`方法可以用来间接调用函数，两个函数都允许显式指定调用所需的`this`值。

## 函数的属性和方法和函数的构造函数

### 函数的属性

#### 函数的形参和实参、arguments对象

形参：定义函数时，定义的参数
实参：调用函数时传递的参数

当参入的实参个数超过定义的形参个数时，在函数体内，标识符`arguments`是指向实参的引用，是一个类数组对象。

##### arguments对象属性

`arguments`对象具有`callee`和`caller`(该属性已经删除,可以通过`函数名.caller`调用)属性
`callee`指代当前正在执行的函数。

`caller`指代调用当前正在执行的函数的函数，通过该属性可以访问调用栈。（非标准）

严格模式下，这两个属性为`undefined`,因为调用两个属性的开销比较大,如要调用函数自身直接调用函数名即可。

#### 函数自定义属性(静态属性)

当函数需要一个静态变量来在调用时保持某个值不变，最方便的方式就是给函数定义属性。

自定义函数属性常常用来作为缓存。

```js
//将上次计算结果缓存起来以便下次计算同样值时直接返回。
function momorize (f) {
    var cache = {};
    return function () {
        var key = arguments.length + Array.prototype.join.call(arguments, ",");
        if (key in cache) return cache[key];
        else return cache[key] = f.apply(this, arguments);
    };
}
```

#### length属性

在函数体中，`arguments.length`表示传入函数的实参的个数。*函数的length属性是只读属性，它代表函数形参的数量*(定义函数时给出的实参个数，有默认值的参数不在其中。)

#### prototype属性

每一个函数都包含一个`prototype`属性，该属性指向该函数原型对象。当将函数作为构造函数时，新创建的对象会从原型对象上继承属性。

### 函数的方法

#### call() and apply()

`call`和`apply`的第一个实参是要调用函数的对象，它表示调用上下文，在函数体内通过`this`来获得对它的引用。

在ES5严格模式中，`call()`和`apply()`传入的第一个任何值的实参都会变为`this`的值，即使是`null`和`undefined`或原始值; 在ES3和非严格模式中，传入`null`和`undefined`会被全局对象代替，而其他原始值则会被相应的包装对象替代。

对于`call()`来说，从第一个参数之后的所有实参就是要传入调用函数的值; 而`apply()`则是将实参放入一个数组中传入，传入该方法的数组可以是类数组对象也可以是真实数组。

#### bind()

将函数的调用对象绑定至某个对象并返回一个函数。

真正的`bind()`方法返回一个函数对象，这个函数对象的`length`属性是绑定函数（调用函数的形参个数）的形参个数减去绑定的实参（`bind()`方法第一个参数后的参数个数）的个数。

```js
function test(a, b, c) {
  console.log(this);
}
let i = test.bind(obj, 1, 2);
i.length;    // 3(a, b, c) - 2(1, 2) = 1
```

如果`bind()`返回的函数用作构造函数，将忽略传入的`this`对象，原始函数会以构造函数的形式调用，其实参也已经绑定（在运行`bind()`返回函数做构造函数时，传入的实参会原封不动得传入原始函数）。

```js
var obj = {
    a: 4,
    b: 5,
    c: 6
};
function test(a, b, c, d) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.d = d;
}
let Test = test.bind(obj, 7, 8, 9);
let test = new Test(1, 2, 3);
//test {a: 7, b: 8, c: 9, d: 1}
```

#### toString()

自定义函数返回函数的完整代码，内置函数返回`function [名字]() { [native code] }`

### 函数的构造函数

函数可以通过`new Function()`;可以传入任意数量的字符串参数，最后一个实参表示文本就是函数体；它可以包含任意的Javascript语句，每两条语句之间用分号分隔。如果不包含参数，则只传入一个表示函数体的字符串即可。

```js
var f = new Function("x", "y", "z", "return x * y; ");
```

该构造函数注意点：

+ 允许在运行时动态创建编译函数(导致二次编译性能开销大，不建议使用)
+ 每次调用构造函数会解析函数体，并创建新的函数对象。
+ 创建的函数不是词法作用域，**编译总会在全局环境中执行**。

## 作为命名空间的函数

在函数中定义的局部变量只存在于函数中。利用这个原理可以防止全局污染

## 闭包

Javascript采用**词法作用域**，函数与对其状态即[词法环境](../语言规则/引擎执行过程/README.md#%e8%af%8d%e6%b3%95%e7%8e%af%e5%a2%83%e7%bb%84%e4%bb%b6-%e5%88%9b%e5%bb%ba)（`lexical environment`）的引用共同构成闭包（`closure`）。也就是说，闭包可以让你从内部函数访问外部函数作用域。在JavaScript，函数在每次创建时生成闭包。

定义大多数函数时的作用域链在调用时依然有效，但不影响闭包。

```js
var scope = "global scope";
function checkscope() {
    var scope = "local scope";
    function f() {
        return scope;
    };
    return f;
}
checkscope()();//返回"local scope"
```

每次调用Javascript函数的时候，都会为之创建一个新的变量对象(`OA`)用来保存局部变量，把这个对象添加至作用域链中。当函数返回的时候，就从作用域链中将这个绑定变量的对象删除。

+ 如果不存在嵌套的函数，也没有其他引用指向这个对象，它就会被当作垃圾回收掉。

+ 如果定义了嵌套的函数，那么每个嵌套的函数都各自对应一个作用域链，并且这个作用域链的每个作用域都指向一个变量对象。

+ 但如果这些嵌套的函数对象在外部函数中保存下来，那么它们也会和所指向的变量绑定对象一样当作垃圾回收。

+ 但是如果这个函数定义了嵌套的函数，并将它*作为返回值返回*或者*存储在某处的属性里*，这时就会有一个外部引用指向这个嵌套的函数。它就不会被当作垃圾回收，并且它所指向的变量绑定对象也不会被当垃圾回收。

### 闭包常见问题及其产生原因

下面给出一个面试中经常出现的闭包问题：

```js
let btns = document.querySelectorAll('button');
for (var i = 0; i < 5; i++) {
    btns[i].onclick = function () {
        console.log(i);
    }
}
```

上面的代码想要表达的意思是为每一个按钮绑定一个与其位置相关的值，而真实绑定的值却是，全部都为`4`。会出现这种情况的原因是因为，**此处为一个闭包，事件处理函数中的`i`是与变量`i`绑定，而不是与变量`i`的值绑定！**

## 高阶函数

所谓高阶函数就是操作函数的函数，它接受一个或多个函数为参数，并返回一个函数。

```js
function compose(f, g){
    return function () {
        return f.call(this, g.apply(this, arguments));
    };
}
var square = function(x){ return x * x };
var sum = function(x, y){ return x + y; };
var squareofsum = compose(square, sum);
squareofsum(2,3);// =>25
```

### 函数柯里化(不完全函数)

```js
function curry (fn, ...arg1) {
    return function (...arg2) {
        let args = [...arg1, ...arg2];
        return fn.call(null, ...args);
    }
}
```
