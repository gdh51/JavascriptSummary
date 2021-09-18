# 引擎执行过程

*Javascript*引擎执行分为 3 个阶段：

1. **语法分析**：检查脚本语法是否正确，不正确就抛出语法错误(`SyntaxError`)，停止执行脚本代码；然后继续检查下一个代码块(每一个`<script>`标签就是一个代码块)；如果语法正确，则进入预编译阶段
2. **预编译阶段**：当语法分析正确时就会进入预编译阶段,预编译阶段主要做了一件事：**创建执行上下文与相关变量**
3. **执行阶段**：顾名思义就是对代码进行解释执行

> 浏览器首先按顺序加载由`<script>`标签分割的 js 代码块，加载 js 代码块完毕后，立刻进入以上三个阶段，然后再按顺序查找下一个代码块，再继续执行以上三个阶段

在这执行过程中，会涉及到一个抽象概念环境记录，它用于将标识符和变量们进行管理，并管理与其相关的环境记录。首先我们来康康环境记录是什么：

## 环境记录 Environment Records

环境记录(`Environment Records`)是一种基于当前源代码结构，用于定义标识符到变量、函数间联系的规范类型。

通常情况下它与一些特殊结构相关，比如函数声明(`FunctionDeclaration`)、块状声明(`BlockStatement`)、`try`声明(`TryStatement`)的子语句`Catch`。每当上述代码计算时，一个用于记录标识符与相关变量的绑定关系的新的环境记录会被创建。

每一个环境记录都有一个`[[OuterEnv]]`字段，它保存着对上层环境记录的引用(或`null`，比如全局环境就是)。由这一系列环境记录形成的抽象链状结构就是我们常说的*作用域链*了。

### 环境记录的层次结构 The Environment Record Type Hierarchy

环境记录是一个抽象结构，它具有三个实际的子类，而其中一个子类还具有两个子类型，它们的结构如下：

-   声明环境记录`declarative Environment Record`：它与`ECMAScript`的作用域关联，包含`var/constant/let/class/module/import/function`声明，它将标识符与这些声明在这个作用域中进行关联。
    -   函数环境记录`function Environment Record`：函数环境对象对应`ECMAScript`中函数的调用，同时包含函数内的顶级声明。它可能会创建一个`this`绑定(箭头函数不会)。
    -   模块环境记录`module Environment Record`：它记录着模块中的顶级声明，同时包含导入`import`的模块。其`[[OuterEnv]]`为全局环境记录。
-   对象环境记录`object Environment Record`：用于联系标识符与对象属性的绑定，比如`with`语句声明(`WithStatement`)。
-   全局环境记录`global Environment Record`：即用于全局声明，它的`[[OuterEnv]]`为`null`。它通过全局环境记录上的标识符来与全局对象保持联系。

## 执行上下文

执行上下文是*ECMAScript*代码**被解析和执行时所在环境**的抽象概念。一个执行上下文**至少**有以下列表中`4`个状态组件：

| 组件                                  | 作用                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 代码计算状态(`code evaluation state`) | 执行、挂起和恢复与此执行上下文关联的代码的计算所需的任何状态。                                               |
| 函数(`Function`)                      | 如果当前计算的代码为函数调用，那么函数组件值就为这个函数对象；如果当前在计算的代码为脚本或模块，则其为`null` |
| 领域(`Realm`)                         | 关联`ECMAScript`资源                                                                                         |
| 脚本或模块(`ScriptOrModule`)          | 当前代码的来源，没有时为`null`                                                                               |

> 上述 4 个组件和代码位置信息、加载资源信息、执行信息等等有关

对于`ECMAScript`代码所创建的执行上下文，它还具有两个额外的状态组件：

| 组件                                | 作用                                                                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 词法环境(`LexicalEnvironment`)      | 标识并维护环境记录中的标识符引用。[通过`let/const`定义的变量会存储在这里。](https://262.ecma-international.org/12.0/#sec-declarations-and-the-variable-statement) |
| 变量环境组件(`VariableEnvironment`) | 标识并维护环境记录中的变量声明(_VariableStatement_)，即通过`var`声明的变量                                                                                        |

**词法环境组件和变量环境组件都是环境记录**。词法环境组件

> 这里对于`Generator`还有一个种状态组件就不列举了

### 执行栈

执行栈(_execution context stack_)也称为调用栈，具有**栈**结构(先进先出)，用于存储在代码执行期间创建的所有执行上下文。

大致运行的过程为：首次运行*Javascript*代码时，会创建一个全局执行上下文并推入当前执行栈中。**每当函数调用，就创建一个函数执行上下文并推入当前执行栈的最顶层。每当栈顶函数运行完成后，就会把对应的函数上下文弹出当前执行栈，并将上下文控制权转交给当前执行栈的下一个执行上下文**。

![Call Stack](./imgs/call%20stack.png)

### 词法环境 LexicalEnvironment

`2021`规范中关于词法环境的描述较少，仅给出刚刚的定义：

> Identifies the Environment Record used to resolve identifier references made by code within this execution context.

即用于处理执行上下文中标识符与变量引用的关系。通过对于规范文档的搜索我们还可以发现以下信息：

-   [词法环境中绑定有`this`标识符](https://262.ecma-international.org/12.0/#sec-getthisenvironment)
-   [通过`let/const`声明的变量是作用在词法环境中的。](https://262.ecma-international.org/12.0/#sec-declarations-and-the-variable-statement)

### 变量环境 VariableEnvironment

变量环境是一种用于识别当前执行上下文中由变量声明(`VariableStatements`)创建的变量。

> Identifies the Environment Record that holds bindings created by VariableStatements within this execution context.

通过`var`定义的变量会作用于变量环境中。

### 作用域

作用域在`ECMAScript`中实际并不存在，确切的说它指代了对应执行上下文中的环境记录(`Environment Record`)。

#### 作用域链

作用域链由当前执行上下文的环境记录与一系列上层环境记录组成，**它保证了当前执行上下文环境对符合访问权限的变量和函数的有序访问**。(也即上述中当前的词法环境与其上级一系列词法环境形成的抽象链式结构)

当访问一个变量时，解释器会首先在当前作用域查找标识符，如果没有找到，就去父作用域查找，如此往复找到为止，直到全局作用域，如果还没找到就会抛出`ReferenceError`。与原型链区别：对象上的属性在自身和原型上不存在时会显示为`undefined`。

举个例子：

```js
var a = 5
function test() {
    var a = 10

    function innerTest() {
        var b = 20

        return a + b
    }

    innerTest()
}

test()
```

当刚刚执行到`innerTest()`时(已进入该函数)，此时活动对象就为`global`、`test`，变量对象为`innerTest`。所以调用`test()`时的作用域链为：`innerTest -> test -> global`(由内到外)，所以我们访问在执行`a + b`时，会先从`test`的变量对象中寻找`a`变量，而不是`global`。

## 变量提升

首先规范中并未有变量提升的概念。涉及到变量提升问题的变量声明有 3 个`var/let/const`。首先我们要明确，`var`会作用于变量环境，`let/const`会作用于词法环境。

当包含`var`的变量环境实例化时，其会被初始化为`undefined`，并且对多个相同标识符的声明只会生成一个变量。当其执行对应的赋值语句时，其才会进行赋值；

当包含`let/const`的词法环境进行实例化时，声明的变量会被创建，但是无法被访问直到对于的声明代码执行(即初始化，此时访问会报错，即网传说法`TDZ temporal dead zone`暂时性死区)。当`let`语句执行时没有进行赋值那么其会被赋值为`undefined`。

Reference:

[ECMAScript 2021 14.3.1 Let and Const Declarations](https://262.ecma-international.org/12.0/#sec-let-and-const-declarations)

## 闭包

[MDN 定义：闭包指那些能访问自由变量的函数。](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)(自由变量指在函数中使用，但既不是函数参数`aruguments`也不是函数的局部变量的变量，而是另一个函数作用域中的变量)

> 目前 MDN 已经更改为一个函数和对其周围状态(`lexical environment`，词法环境)的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包(`closure`)。

即：

1. 是一个函数
2. 能访问上级函数作用域的变量(即使上级函数上下文已经销毁)

原理：函数与对其状态即词法环境（`lexical environment`）的引用共同构成闭包（`closure`）。也就是说，闭包可以让你从内部函数访问外部函数作用域。

闭包的产生是因为**词法环境**。

## this 绑定

`ECMAScript`代码中对于`this`的访问实际上是访问当前执行上下文的环境记录中是否有`this`字段。整个访问操作实际上这样的：

1. 当前执行上下文的环境记录中是否有`this`
2. 有，则返回
3. 没有，访问当前环境记录的外层环境记录`[[OuterEnv]]`，跳转到步骤`1`

上述过程一定会停止，因为最外层存在全局环境记录，此时会返回全局环境记录的`this`。

对于箭头函数的`this`，实际上在创建函数对象环境记录时，箭头函数不会具有`this`这个字段，所以其会返回外部环境的`this`。

## 关于规范版本问题

上述的描述都是基于`ECMAScript 2021`版本进行书写。目前流传的版本大概出于一个中间的版本，会与上述描述有一些差异。比如[`Medium`的这篇文章中词法环境由环境记录与对外部词法环境的引用组成](https://amnsingh.medium.com/lexical-environment-the-hidden-part-to-understand-closures-71d60efac0e0)；其与[BY 的前端笔记](https://www.bruceyj.com/front-end-interview-summary/front-end/JavaScript/6-environment-record.html#%E7%BB%86%E8%8A%82)的总结比较相近。

这里还有一篇关于`ECMAScript 6`执行上下文与执行栈的说明[2018 - Understanding Execution Context and Execution Stack in Javascript](https://blog.bitsrc.io/understanding-execution-context-and-execution-stack-in-javascript-1c9ea8642dd0)，每篇文章中的说法都有相识点但也有不同点，大家根据情况酌情吸收。

Reference:
[ES2021 10.3 Execution Contexts](https://262.ecma-international.org/12.0/#sec-execution-contexts)

## 内存空间

`Javascript`内存空间分为栈、堆、池。其中栈存放变量，堆存放复杂对象，池存放常量。

### 变量的存放

内存中有栈和堆，变量更具类型分别存储在两个地方：

-   **基本类型**：保存在栈内存中，因为这些类型在内存中分别占有**固定大小**的空间，通过按值来访问。基本类型一共 7 种：`Undefined`、`Null`、`Boolean`、`Number`、`String`、`Symbol`、`BigInt`

-   **引用类型**：保存在堆内存中，因为这种值的大小不固定，因此不能把它们保存在栈内存，但内存地址大小是固定的，因此对象中的值保存在堆内存中。**当查询引用类型的变量时，先从栈中读取内存地址，然后再通过地址找到堆中的值**。

### 内存空间管理

`Javascript`内存生命周期为：

1. 分配所需内存
2. 使用分配到的内存(读、写)
3. 不需要时释放、归还

`Javascript`有自动垃圾收集机制，最常用的是标记清除算法，当一个对象不再被引用时，在下一次垃圾回收时就会被回收。

#### 内存回收

`Javascript`有自动垃圾收集机制，垃圾收集器会每隔一段时间就执行一次释放操作。

-   局部变量和全局变量的销毁
    -   局部变量：局部作用域中，当函数执行完毕，局部变量会被垃圾收集器回收
    -   全局变量：全局变量的回收需要判断，要避免使用全局变量
-   `Google V8`引擎中所有对象都是通过堆来进行内存分配的
    -   初始分配：当声明变量并赋值时，V8 引擎就会在堆内存中分配给这个变量
    -   继续申请：当已申请内存不足以存储这个变量时，V8 就会继续申请内存，直到堆的大小达到 V8 引擎内存上限
-   V8 对堆内存中的对象进行分代管理
    -   新生代：存活周期较短的对象，如临时变量、字符串等
    -   老生代：经过多次垃圾回收仍然存活，存活周期较长的对象。

#### 垃圾回收算法

-   引用计数（已不再使用）：当一个对象没有引用指向它时就在下一轮垃圾回收时清除。
    这种算法存在的**问题就是当两个对象互相引用时，即使它们不在被使用也不会回收**(IE 还在继续使用)
-   标记清除(常用)：标记清除将*不再使用的对象*定义为*无法到达的对象*，即从根部(在 JS 中为全局对象)出发定时扫描内存中的对象，凡是能从根部到达的对象，保留。无法到达的对象被标记为不再使用，稍后回收。

[V8 引擎垃圾的垃圾回收机制详解](./浏览器内存管理/README.md)

#### 内存泄漏

持续运行的服务进程，必须及时释放不再用到的内存。否则内存占用会越来越高，轻则影响系统性能，重则导致进程崩溃。对于不再用到的内存，没有及时释放，就在内存泄漏。

##### 常见的内存泄漏

1. 意外的全局变量：函数中未使用`var`定义的变量或不正确使用`this`定义的变量

    > 解决方法：全局使用严格模式

2. 被遗忘的计时器或回调函数：计时器引用了已经被移除的对象或移除了一个对象但回调中该对象被引用

    > 解决方法：停止计数器，第二种情况现在除旧版 IE 外不存在了

3. 脱离`DOM`的引用：当把`DOM`作为变量或对象属性存储时，此时该`DOM`元素存在两个引用：一个在`DOM`树中，一个作为变量。在不用时，必须都要解除这两个引用

4. 闭包：可以访问父级作用域的变量
    > 解决方法：在不用时清除父级作用域中的变量

##### 内存泄漏识别方法

1. 浏览器(由于浏览器更新可能不在当前位置, 目前在`Performance`)

    1. 打开开发者工具，选择`Performance`
    2. 在下方的多选中勾选`Memory`
    3. 点击左上角的录制按钮
    4. 在页面上进行操作，模拟用户使用情况
    5. 一段时间后点击左上角`stop`按钮，面板上会显示这段时间内存占用情况

2. 命令行方法
   使用`Node.js`提供的`process.memoryUsage`方法

    ```js
    process.memoryUsage();
    //输出：一个对象
    {
      rss:111111,//所有内存占用，包括指令区和堆栈
      heapTotal: 56565,//堆占用的内存
      heapUsed: 33333,//用到的堆内存
      external: 8888 //V8引擎内部的C++对象占用的内存
    }
    ```

[更详细的内存泄漏排除方法](./浏览器内存管理/内存泄漏排查/README.md)

## 浏览器的进程与线程

[浏览器的进程与线程](./浏览器线程与进程/README.md)
