# 数组

Javascript 数组是*稀疏的*：数组元素的索引*不一定要连续*的，它们之间可以有空隙。每个 Javascript 数组都有`length`属性，**针对非稀疏数组，该属性就是数组元素的个数;针对稀疏数组，`length`比所有元素的索引要大。**

如果省略数组直接量中的某个值，省略的元素将被赋予`undefined`：

```js
var arr = [1, , , 3] // arr = [1,undefined x 2,3];

var arr = new Array(10) // arr = [undefined x 10]
```

当使用*小于 2 的 32 次方的非负整数作为属性名*时，数组会自动维护其`length`属性值。

_所有数组都是对象_，所以可以创建任意名字的属性。但如果使用的属性是数组的索引，数组的特殊行为就是将根据需要更新它们的`length`属性。

可以使用负数或非整数来索引数组，这种情况下，_数值转换为字符串_，字符串作为属性名来用;**当使用非负整数字符串或浮点整数时，它们转换为数字**。

## 稀疏数组

稀疏数组就是包含从 0 开始的*不连续索引*的数组。

## 数组长度自动维护规则

-   当为一个数组元素赋值，它的索引`i`大于或等于现有数组的长度时，`length`属性的值将设置为`i+1`。

-   设置`length`属性为一个小于当前长度的*非负整数 n*时，当前数组中那些索引大于或等于`n`的元素将从中删除。

可以使用`Object.defineProperty()`将数组长度设置为只读属性。

## 数组元素的添加与删除

### 数组元素添加

为数组添加新的元素有两种方式，一种通过实例方法，一种通过直接赋值：

-   为新索引赋值
-   用`push()`方法向数组末尾增加一个或**多个**元素。**这个操作和给数组`a[a.length]`赋值是等价的**，可以使用`unshift()`从数组首部插入一个元素或**多个**元素。

```js
let arr = []
arr.unshift(1, 2, 3)
// arr变为[1, 2, 3]
```

### 数组元素删除

删除数组元素有三种方式：

-   直接通过设置数组的长度(`length`)来截断`length`后的数组元素
-   可以像删除对象属性一样用`delete`运算符来删除数组元素，但删除后删除位置会没有元素显示为`undefined`，且该数组会成为稀疏数组。
-   `pop()`方法删除元素，使用后`length-1`并返回当前删除元素，`shift()`方法从数组头部删除一个元素并返回该元素。

### 一个特殊的方法——Array.prototype.splice()

`splice()`方法，根据传入的参数，用来插入、删除和替换数组元素。它可以接收三个参数，第一个参数表示选择的作为起始的数组元素在数组中的下标；第二个参数表示从开始下标后连续选择的数组元素个数；第三个元素表示要插入的新元素。[具体该方法会在之后细讲](#%e4%b8%80%e4%b8%aa%e7%89%b9%e6%ae%8a%e7%9a%84%e6%96%b9%e6%b3%95arrayprototypesplice)。

## 数组遍历

`ECMAScript 6`之前遍历数组的方法大多数(`forEach/map/filter/some/every`)的第一个参数都为一个回调函数,且该回调函数的前三个形参分别表示 **当前遍历的数组元素** , **当前遍历的数组元素的下标** , **当前遍历的数组** ;第二个**可选**参数为调用对象的上下文,可以省略,省略时为全局对象(严格模式下为`undefined`)

> 这些遍历函数对于稀疏数组中不存在(`undefined`)的元素不会调用该回调函数

### Array.prototype.forEach()

数组的`forEach()`方法，接收一个回调函数，该回调函数有三个参数，分别是当前值，当前值的索引和该数组。该函数无返回值。

```js
array.forEach(function (value, index, array) {
    // todo
})

//模拟forEach
Array.prototype.forEach = function (callback) {
    let length = this.length
    for (let i = 0; i < length; i++) {
        callback(this[i], i, this)
    }
}
```

这里要注意的是，我们动态改变了数组的长度(即使增加)，也不会改变数组遍历的次数。

### Array.prototype.map()

将调用的数组的每个元素传递给指定的函数，并返回一个数组，返回的数组的各个元素是每个元素调用回调函数的返回值（无返回值时，该元素为`undefined`）。**如果是稀疏数组,即使稀疏元素不会调用回调，但最终返回的数组也为稀疏数组**。

```js
let array = ['c', 'a', , 'd']
let newArr = array.map(function () {
    return 1
})
newArr //[1, 1, undefined × 1, 1]
```

### Array.prototype.filter()

返回数组的元素是调用的数组的一个子集。
传递的回调函数用来逻辑判断：回调函数返回`true`或`false`; 当返回值为`true`或能转化为`true`的值就将该值添加到返回的数组中。

**该方法可以压缩稀疏数组的空缺**。

### Array.prototype.every() and Array.prototype.some()

两个函数的回调函数都需要返回`true`或者`false`，**一旦当前满足条件时，不会进行之后的判断**。

`every()`：当且仅当针对数组中的所有元素调用判断函数返回`true`时，它才会返回`true`
`some()`：当数组至少有一个元素调用判断函数返回`true`，它就返回`true`。

### Array.prototype.reduce() and Array.prototype.reduceRight()

**这两个函数的回调函数，与其他参数与之前的遍历函数略有不同**

该函数指定函数将数组元素进行组合，生成单个值，一般来说`reduce()`用于将一个数组处理后生成其他类型的值。

`reduce()`：接受三个参数: 第一个是执行化简操作的回调函数，返回化简后的值;第二个参数(可选)是*传递给函数的初始值*(可省略,省略时以调用数组第一个元素作为`reduce()`的第二个参数，即遍历从第二个数组元素开始)；第三个参数(可选)表示调用回调函数的上下文对象。

_当前数组正在遍历的元素、元素的索引和数组本身作为第 2~4 个参数传入调用函数_;**第一个参数为上一个元素的回调函数返回的值**，可以通过`reduce()`方法的第二个参数设置第一个元素执行时的值。

(如果调用的数组只有一个元素且没有指定初始值，或指定了初始值的空数组，则`reduce()`方法简单的返回那个值而不会调用回调函数)

`reduceRight()`：工作原理和`reduce()`一样，但是它按数组索引从高到低处理数组。

## 数组的其他方法

### Array.prototype.join()

`join()`：将数组中所有最底层元素都转化为字符串并拼接在一起，返回最后生成的字符串。接收一个可选的字符串参数表示连接各元素时的间隔。(将顶层元素以 指定字符串 拼接,并对每个顶层元素调用`toString()`方法)

```js
let array = [1, 2, 3, 4]
array.join(';') //1;2;3;4
;[1, [2, 3, [4, 5, [6, 7]]]].join(';') //1;2,3,4,5,6,7

//可以用来处理一些简单的数组扁平化
function flat(arr) {
    return arr.join(',').split(',') //全为字符串
}
```

### Array.prototype.reverse()

将调用的数组元素逆序排列，返回调用的数组。

```js
let array = [1, 2, 3, 4]
array.reverse() == array //true
```

### Array.prototype.sort()

将调用数组中的元素排序并返回排序后的调用数组。

当不传入参数时，数组元素以字母表顺序排序（如果有必要将临时转换为字符串进行比较,数字以从小到大）;数组中如果有`undefined`元素，它们会被排到数组的尾部。

```js
let array = [1, 15, 12, 4, 3]
array.sort() == array // true [1, 12, 15, 3, 4]
```

该方法还可以接收一个回调函数，该函数有两个参数，分别表示当前元素和下一个元素。当要把较小的元素排在较大的元素前时，返回一个小于 0 的数值(即从到大排序)，反之。

```js
let array = ['c', ['b', 'a'], 'd']
array.sort() //[[b, a], c, d]

let array = ['c', ['e', 'a'], 'd']
array.sort() //[c, d, [e, a]]
```

当多维数组调用时，会以顶层数组元素为准，如果顶层元素为数组，则以其中第一个为准和其他的进行比较。

### Array.prototype.concat()

创建并返回一个新数组，新数组的元素包括`concat()`的原始数组元素和参数里面的所有元素。该方法不会改变参数和调用的数组。

```js
;[].concat([[1, 2, 3], 4, 5]) // [[1, 2, 3], 4, 5]
```

该函数如果传入参数是数组，那么该函数会取出该函数的元素来进行添加

### Array.prototype.slice(start, [end])

返回指定数组的一个片段或字数组。**接受两个参数分别表示开始和结束位置，返回从开始位置到结束位置前一个之间的元素**。
当只指定一个参数时，返回该参数索引位置到之后的所有元素组成的数组。当接收负参数时表示倒数第几个，-1 表示最后一个元素，以此类推。该方法不会修改调用的数组

### Array.prototype.splice(start, [length], [new item])

在数组插入或删除元素。

> 该方法会修改调用的数组。该方法接收至少 1 个参数，第一个表示要插入或删除的起始位置的索引;第二个参数表示要从数组删除元素的长度(0 表示不删除，即添加);第三个及其以后参数表示要插入的元素。

当参数小于 3 个时，表示删除，大于等于 3 个时前两个参数表示删除，后面的参数表示添加的元素，只接收一个参数时表示删除第一个参数索引后的全部元素。（不需要删除时，将第二个参数设置为 0 即可）

```js
array.splice(1, 1, 'a') //删除索引为2的元素，然后在该位置添加a元素
//（当第三个及其以后参数传入数组时，会将整个数组而不是数组中元素加入索引位置）
array.splice(1, 0, [1, 3]) //[1, [1,3], 2, 3, 4]
```

### Array.prototype.push() and Array.prototype.pop()

`push()`方法在数组的末尾添加一个或多个元素，并返回数组新的长度。（当传入参数为数组时，将该数组作为元素加入，同`splice()`）

`pop()`方法删除数组最后一个元素，减小数组长度并返回它删除的那个元素。

### Array.prototype.unshift() and Array.prototype.shift()

`unshift()`：在数组的头部添加一个或多个元素，返回数组新的长度。**插入多个元素时是一次性插入的，意味着插入元素的顺序和它们在参数中的顺序一致**。

`shift()`：删除数组的第一个元素并返回。

### Array.prototype.toString() and Array.prototype.toLocaleString()

`toString()`：将每个元素转换为字符串并用逗号隔开输出。只会输出元素的字符串（即使是嵌套在另一个数组里面）（输出结果和调用`join(',')`方法一样）

```js
;[1, [2, 3], { x: 5 }].toString() //1,2,3,[object Object]
```

### Array.prototype.indexOf() and Array.prototype.lastIndexOf()

`indexOf()`：搜索数组中具有给定值的元素，返回第一个找到的元素的索引，没有找到返回-1。

`lastIndexOf()`:从末尾向前开始搜索。接收两个参数，第一个表示需要搜索的值，第二个可选的参数表示开始搜索的起始位置索引。

### Array.isArray()

该方法是一个静态方法,用于检查一个数据类型是否为数组

`Array.isArray(obj)`可以判断一个对象是否为数组。也可以通过`({}).toString.call(obj)`来查看类属性。

## 类数组对象

数组有一些其他对象没有的特征：

-   有新元素添加时，自动更新`length`属性
-   设置`length`为一个较小值将截断数组
-   从`Array.prototype`中继承一些有用的方法
-   其类属性为`Array`

一个类数组，所有数组的方法在类数组上均有效

```js
var a = { 0: 1, 1: 2, 2: 3, length: 3 }
;[].unshift.call(a, 5) //a 为{0: 5, 1: 1, 2: 2, 3: 3, length: 4}
//（使用concat方法时，未将a中元素取出一个一个放入数组中，而是整个对象放入）
```

### 作为数组的字符串

字符串也类似数组，所有数组方法可以用于字符串上，但为只读数组，因为字符串为不可变值。

可以用方括号(`[]`)而不是`charAt()`方法来查找一个索引的字母。

## ArrayBuffer

`ArrayBuffer`有两种视图，一种是`TypedArray`视图，另一种是`DataView`视图，两者的区别主要是字节序，前者的数组成员都是*同一个数据类型*，后者的数组成员可以是*不同的数据类型*。

二进制数组由三个对象组成。

`ArrayBuffer`对象：代表内存之中的一段二进制数据，可以通过“视图”（`TypeArray`或`DataView`视图）进行操作。“视图”部署了数组接口，这意味着，可以用数组的方法操作内存。

`ArrayBuffer`也是一个构造函数，可以分配一段可以存放数据的连续内存区域。

```js
var buf = new ArrayBuffer(32)
```

上面创建了一个 32 字节的内存区域，每个字节默认值为 0。

`ArrayBuffer`的参数表示所需要的字节大小。要读写它必须要指定视图。

```js
var asints = new Int32Array(buf)
```

以上创建了一个 32 位带符号的视图

`ArrayBuffer`实例上只有一个返回它分配内存区域的字节长度的属性：`byteLength`。

```js
var ar = new ArrayBuffer(23)
ar.byteLength //23
```

当分配内存过大时可能失败，必须要检查该值是否与分配时大小相等。

### ArrayBuffer 静态方法

#### ArrayBuffer.prototype.slice()

`ArrayBuffer`有一个`slice()`方法，允许将内存区域的一部分，拷贝为一个新的`ArrayBuffer`对象。该方法包含两步，先开辟一个新内存，然后再拷贝过去。
该方法接收两个参数，第一个表示起始字节的索引，第二个表示结束位置前一个的索引。

```js
var buffer = new ArrayBuffer(23)
var newBuffer = buffer.slice(0, 3) //拷贝0~2号字节
```

#### ArrayBuffer.prototype.isView()

`ArrayBuffer`有一个静态方法`isView()`，返回一个布尔值，表示参数是否为`ArrayBuffer`的视图实例。这个方法大致相当于判断参数，是否为`TypedArray`实例或`DataView`实例。

```js
var buffer = new ArrayBuffer(23)
ArrayBuffer.isView(buffer) //false
var ints = new Int16Array(buffer)
ArrayBuffer.isView(ints) //true
```

### TypedArray 对象

`TypedArray`对象：同一段内存，不同数据有不同的解读方式，这就叫做“视图”（view）。`TypedArray`用来生成内存的视图，通过 9 个构造函数:

| 名称              | 含义                                          |
| ----------------- | --------------------------------------------- |
| Int8Array         | 有符号字节                                    |
| Uint8Array        | 无符号字节                                    |
| Uint8ClampedArray | 8 位无符号整数，长度 1 个字节，溢出处理不同。 |
| Int16Array        | 有符号 16 位短整数                            |
| Uinit16Array      | 无符号 16 位短整数                            |
| Int32Array        | 有符号 32 位整数                              |
| Unit32Array       | 无符号 32 位整数                              |
| Float32Array      | 32 位浮点数值                                 |
| Float64Array      | 64 位浮点数值：Javascript 中常规数值          |

通过以上构造函数生成的`TypedArray`函数，可以像数组一样用索引来读取数组元素，所有数组方法都能使用，并有`length`属性，这种称为类型化数组。

类型化数组是类数组对象，与常规数组区别：

-   类型化数组中的**元素都是数字**。使用构造函数在创建类型化数组的时候决定了数组中的数字（有符号或者无符号整数或者浮点数）的类型和大小

-   类型化数组有固定的长度，且成员是*连续的*，不会有空位

-   在创建类型化数组的时候，数组的元素总是*默认初始化为 0*

#### 作为构造函数

`TypedArray`的构造函数除了接受`ArrayBuffer`作为实例外，还可以接收数组作为参数直接分配内存生成底层`ArrayBuffer`实例，并给内存赋值：

```js
var ints = new Int16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
```

该构造函数接收三个参数，第一个（必选）表示视图对应底层的 ArrayBuffer 对象; 第二个参数（可选）表示视图开始的字节序号，默认为 0; 第三个参数表示视图包含的数据个数，默认为第二个参数后的全部。（三个参数对应的是该`TypedArray`对象的`buffer`、`byteOffset`、`length`属性, `byteOffset`参数必须能够被 2 整除）

```js
var buffer = new ArrayBuffer(8)
var v1 = new Int32Array(b)
var v2 = new Uint8Array(b, 2)
var v3 = new Int16Array(b, 2, 2)
//v1,v2,v3重叠，v1[0]表示32位整数，指向0~4字节
//v2[0]表示无符号8位整数，指向字节2
//v3[0]表示16位整数，指向字节2~字节3。
```

只要任何一个视图对内存有所修改，就会在另外两个视图上反应出来。

**当通过视图来生成视图时，新的视图会开辟新的内存空间，并复制原视图的值**。

```js
var x = new Int8Array([1, 1])
var y = new Int8Array(x)
x[0] // 1
y[0] // 1

x[0] = 2
y[0] // 1
```

可以通过引用同一个`buffer`来使两个视图引用同一个内存：

```js
var x = new Int8Array([1, 1])
var y = new Int8Array(x.buffer)
x[0] // 1
y[0] // 1

x[0] = 2
y[0] // 2
```

`TypedArray`拥有普通数组的所有方法。

每一种视图都有一个`BYTES_PER_ELEMENT`常数，表示这种数据类型占据的字节数。

```js
Int8Array.BYTES_PER_ELEMENT // 1
Uint8Array.BYTES_PER_ELEMENT // 1
Int16Array.BYTES_PER_ELEMENT // 2
Uint16Array.BYTES_PER_ELEMENT // 2
Int32Array.BYTES_PER_ELEMENT // 4
Uint32Array.BYTES_PER_ELEMENT // 4
Float32Array.BYTES_PER_ELEMENT // 4
Float64Array.BYTES_PER_ELEMENT // 8
```

`ArrayBuffer`转为字符串，或者字符串转为`ArrayBuffer`，有一个前提，即字符串的编码方法是确定的。通过将字符串编码后存入即可。

#### 实例方法

##### TypedArray.prototype.set()

该对象有`set()`方法用于将一个常规或者类型化数组复制到一个类型化数组。（**复制到新的内存**）接收两个参数，第一个为要添加的数值; 第二个为添加的位置。

```js
var bytes = new Uint8Array(1024) //1kb缓冲区
var pattern = new Uint8Array([0, 1, 2, 3]) //一个4字节的数组
bytes.set(pattern) //将pattern数组复制到bytes的最开始位置
bytes.set([0, 1, 2, 3], 4) //将0，1，2，3四个值从索引为4位置开始复制
```

##### TypedArray.prototype.subarray()

`subarray()`：返回部分数组，接收 2 个参数，第一个表示返回的起始位置，第二个表示返回的结束的位置的前一个。注意返回的是原数组的其中一部分内容。
该方法返回当前数组的一新视图，它们都是基本字节块的视图，称为一个 ArrayBuffer。

#### 静态方法

##### TypedArray.of()

`TypedArray.of()`：静态方法，用于将参数转换为`TypedArray`实例。如：

```js
Float32Array.of(0.151, -8, 3.7)
// Float32Array [ 0.151, -8, 3.7 ]
```

##### TypedArray.from()

`TypedArray.from()`：静态方法,接受一个可遍历的数据结构（比如数组）作为参数，返回一个基于这个结构的`TypedArray`实例。

```js
Uint16Array.from([0, 1, 2])
// Uint16Array [ 0, 1, 2 ]
```

该方法还可以将一种`TypedArray`实例转换为另一种。该方法还可以接收一个函数参数，用来对每一个数组元素遍历。

#### 优点

-   类型化数组在执行时间和内存使用上都要更加高效。
-   类型化数组允许将同意的字节序列看成 8 位、16 位、32 位或 64 位的数据块。

`TypedArray`数组只是一层视图，**本身不储存数据，它的数据都储存在底层的**`ArrayBuffer`对象之中，要获取底层对象必须使用`buffer`属性。

### DataView 对象

用来生成内存的视图，可以*自定义格式和字节序*，比如第一个字节是`Uint8`（无符号 8 位整数）、第二个字节是`Int16`（16 位整数）、第三个字节是`Float32`（32 位浮点数）等等。

#### 作为构造函数

`DataView`本身也是一个构造函数，可以接收三个参数: 第一个参数（必选）为`ArrayBuffer`对象，第二个参数(可选)为字节起始位置，第三个参数为字节长度(可选)。（同时对应`buffer`、`byteOffset`、`length`属性）

#### 实例方法

##### DataView.prototype.get\*()

`DateView`为 8 种不同的类型化数组分别定义了 8 种`get()`方法。如：`getInt16()`等。

这些方法第一个参数指定了`ArrayBuffer`的字节偏移量，表示从哪个值开始获取。除了`getInt8()`与`getUint8()`方法，其他的`get()`方法可以接收第二个可选布尔值参数，默认为`false`表示采用**高位优先字节顺序**。

另外还有 8 种`set()`方法，用于将值写入到那个基本缓存区`ArrayBuffer`中。第一个参数为指定偏移量，第二个参数为要写入的值。除`setInt8()`与`setUint8()`外，其他方法可以接收第三个参数，默认为`false`表示将值以**高位优先字节顺序**写入。

### 字节顺序

字节顺序: 字节序指的是数值在内存中的表示方式。为了高效，类型化数组采用底层硬件的原生顺序。在**低位优先系统**中，`ArrayBuffer`中的数字的字节是按照从低位到高位的顺序排列的; 在**高位优先系统**中，字节是按照从高位到低位的顺序排列的。可以用如下代码来检查系统的字节顺序：

```js
//如果整数0x00000001在内存中表示 01 00 00 00，则说明系统低位优先系统
//相反，在高位系统中，它会表示：00 00 00 01
var little_endian = new Int8Array(new Int32Array([1]).buffer)[0] //1
```

**大多数 CPU 架构都采用低位优先**。然而，_很多的网络协议以及有些二进制文件格式，是采用高位优先的字节顺序_。通常，处理外部数据时，可以使用`Int8Array()`和`Uint8Array()`将数据视为一个单字节数组，但是不应该使用其他的多字节类型化数组。取而代之的是可以使用`DataView`类，该类定义了采用*显式指定的字节顺序*从`ArrayBuffer`中读/写其值的方法:

```js
var buffer = new ArrayBuffer(16)
var int32View = new Int32Array(buffer)

for (var i = 0; i < int32View.length; i++) {
    int32View[i] = i * 2
}
//Int32Array(4) [0, 2, 4, 6]
```

以上建立了一个 32 位的整数视图，由 4 个 32 位整数占据，并依次写入 4 个整数`[0,2,4,6]`
在这段数据上在建立一个 16 位整数的视图:

```js
var int16View = new Int16Array(buffer)

for (var i = 0; i < int16View.length; i++) {
    console.log('Entry ' + i + ': ' + int16View[i])
}
// Entry 0: 0
// Entry 1: 0
// Entry 2: 2
// Entry 3: 0
// Entry 4: 4
// Entry 5: 0
// Entry 6: 6
// Entry 7: 0
```

由于每个 16 位整数占据 2 个字节，所以整个`ArrayBuffer`对象现在分成 8 段。然后，由于**x86 体系的计算机都采用小端字节序**（little endian），相对重要的字节排在后面的内存地址，相对不重要字节排在前面的内存地址，所以就得到了上面的结果。

比如，一个占据四个字节的 16 进制数`0x12345678`，决定其大小的最重要的字节是“12”，最不重要的是“78”。**小端字节序将最不重要的字节排在前面**，储存顺序就是`78563412`；**大端字节序则完全相反，将最重要的字节排在前面**，储存顺序就是`12345678`。目前，所有个人电脑几乎都是小端字节序，所以**TypedArray 数组内部也采用小端字节序读写数据**，或者更准确的说，按照本机操作系统设定的字节序读写数据。

另一个例子：

```js
// 假定某段buffer包含如下字节 [0x02, 0x01, 0x03, 0x07]
var buffer = new ArrayBuffer(4)
var v1 = new Uint8Array(buffer)
v1[0] = 2
v1[1] = 1
v1[2] = 3
v1[3] = 7

var uInt16View = new Uint16Array(buffer)

// 计算机采用小端字节序
// 所以头两个字节等于258
if (uInt16View[0] === 258) {
    //第一个为0102  第二个为0703
    console.log('OK') // "OK"
}

// 赋值运算  由于决定大小的位于后面所有  255为0xFF
uInt16View[0] = 255 // 字节变为[0xFF, 0x00, 0x03, 0x07]
uInt16View[0] = 0xff05 // 字节变为[0x05, 0xFF, 0x03, 0x07]
uInt16View[1] = 0x0210 // 字节变为[0x05, 0xFF, 0x10, 0x02]
```

#### 溢出

溢出：不同的视图类型，所能容纳的数值范围是确定的。超出这个范围，就会出现溢出。按如下规则溢出；

-   正向溢出（`overflow`）：当输入值大于当前数据类型的最大值，结果等于**当前数据类型的最小值加上余值，再减去 1**。

-   负向溢出（`underflow`）：当输入值小于当前数据类型的最小值，结果等于**当前数据类型的最大值减去余值，再加上 1**。

    ```js
    var uint8 = new Uint8Array(1)

    uint8[0] = 256 /*256的二进制形式是一个9位的值100000000
    根据规则，只会保留后8位，即00000000. uint8视图的解释规则是无符号的8位整数，所以00000000就是0*/
    uint8[0] // 0

    uint8[0] = -1
    uint8[0] // 255
    ```

负数在计算机内部采用“2 的补码”表示，也就是说，将对应的正数值进行否运算，然后加 1。比如，-1 对应的正值是 1，进行否运算以后，得到`11111110`，再加上 1 就是补码形式`11111111`。

uint8 按照无符号的 8 位整数解释`11111111`，返回结果就是 255。

`Uint8ClampedArray()`视图的溢出规则，与上面的规则不同。它规定，凡是发生正向溢出，该值一律等于当前数据类型的最大值，即 255；如果发生负向溢出，该值一律等于当前数据类型的最小值，即 0。

```js
var uint8c = new Uint8ClampedArray(1)

uint8c[0] = 256
uint8c[0] // 255

uint8c[0] = -1
uint8c[0] // 0
```

如果不确定字节序可以通过如下方法来判断：

```js
var littleEndian = (function () {
    var buffer = new ArrayBuffer(2)
    new DataView(buffer).setInt16(0, 256, true)
    return new Int16Array(buffer)[0] === 256
})() //返回true为小端字节序
```

#### 应用

-   Ajax 中的应用：当服务器返回二进制数据时，可以设置响应类型（responseType）为`arrayBuffer`，如果不知道类型可以设置为`Blob`

-   Websocket：设置`Websocket`实例的`binaryType`为`arraybuffer`来发送和接收二进制数据。
-   Fetch API：取回的数据就是`arrayBuffer`对象
