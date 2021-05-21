# IndexedDB - Indexed Database

当我们打开浏览器控制台的`Application - Storage(Chrome)/Storage(Firefox)`选项时，我们可以从存储类型中看到一个名为`IndexedDB`的选项。点击后我们可以看到一个类似表格的数据信息，这就是`IndexedDB`。

> 当我们打开控制台的对应表格时，查看的是当时生成的一个快照。`IndexedDB`是浏览器中保存结构化数据的一种数据库。（为了兼容最好使用浏览器前缀）。以前，`IE10`中为`msIndexedDB`，`Firefox`中为`mozIndexedDB`，`Chrome`中为`webkitIndexedDB`

`IndexedDB`就是一个数据库，最大特色是使用**对象**保存数据，而不是使用表来保存。一个`Indexed`数据库就是一组位于相同命名空间下的对象的集合。

> `IndexedDB`的所有操作都是**异步**的，所以我们需要用类似事件订阅的方式来进行数据库操作

每个数据库都具有以下的信息：

-   数据库名称(`Database Name`)
-   数据库存储类型(`Storage`)
-   数据库源头(`Origin`)
-   数据库版本(`Version`)
-   数据库存储空间集合(`Object Stores`) — 一个或多个对象存储空间

当我们选择一个数据库时(图中为名为`test`的数据库)，关于这个数据库的信息就会显示在右侧：

![selected a database](../imgs/database.png)

当我们选择具体的存储空间时(图中为`keyname`的存储空间)，一个对象命名空间会有如下信息：

-   对象命名空间名称(`Object Store Name`)
-   键名(`Key`) — 命名空间的键地址(`keyPath`)
-   自动递增(`Auto Increment`) — 是否允许键名自动递增
-   索引(`Indexes`) —

![](../imgs/a%20store.png)

## 创建数据库

使用`IndexedDB`的第一步是把要打开的数据库名传给`indexedDB.open(name,version)`，如果传入的数据库已经存在，就会发送应该打开它的请求，第二个参数为版本号，传入新的版本号是会升级数据库; 如果传入的数据库不存在，就会发送一个创建并打开它的请求，版本号默认为 1。（还可以接收第二个表示版本号的参数）

总之，调用`indexedDB.open()`返回一个`IDBRequest`对象，在这个对象上可以添加`onerror`（打开数据库失败）和`onsuccess`（成功打开）事件处理程序来查看是否打开或创建成功。（**要修改数据库只能通过升级数据库版本来完成**——增删改）

```js
var indexedDB =
        window.indexedDB ||
        window.msIndexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB,
    request,
    database
request = indexedDB.open('admin')
request.onerror = function (e) {
    console.log('发生了意外')
}
request.onsuccess = function (e) {
    database = e.target.result //通过result属性拿到数据库对象，因为为异步调用所以无法保存在全局变量database上。（只存在于该函数）
}
```

使用`success`事件时，`event.target.result`中将有一个数据库实例对象(`IDBDatabase`)，
`error`事件时，`event.target.errorCode`中保存着一个错误码，以下为可能的错误码：

-   `IDBDatabaseException.UNKNOWN_ERR(1)`：意外错误，无法归类
-   `IDBDatabaseException.NON_TRANSIENT_ERR(2)`：操作不合法
-   `IDBDatabaseException.NOT_FOUND_ERR(3)`：未发现要操作的数据库
-   `IDBDatabaseException.CONSTRAINT_ERR(4)`：违反了数据库约束
-   `IDBDatabaseException.DATA_ERR(5)`：提供给失误的数据不能满足要求
-   `IDBDatabaseException.NOT_ALLOWED_ERR(6)`：操作不合法
-   `IDBDatabaseException.TRANSACTION_INACTIVE_ERR(7)`：试图重用已完成的事务
-   `IDBDatabaseException.ABORT_ERR(8)`：请求中断，未成功
-   `IDBDatabaseException.READ_ONLY_ERR(9)`：试图在只读模式下写入或修改数据
-   `IDBDatabaseException.TIMEOUT_ERR(10)`：在有效时间内未完成操作
-   `IDBDatabaseException.QUOTA_ERR(11)`：磁盘空间不足

### 数据库版本升级

当调用`indexedDB.open()`方法传入版本号大于当前数据库的版本号就会触发`upgradeneeded`事件

```js
request.onupgradeneeded = function (e) {
    database = e.target.result
}
```

通过该事件拿到新的数据库（后续所有操作都必须在该事件中完成）

## 对象存储空间

在创建一个对象表格时，必须指定一个属性作为这个对象存储空间的键且必须全局唯一，如：

```js
var user = {
    username: '007',
    firstName: 'James',
    password: 'foo'
}
request.onupgradeneeded = function (e) {
    var database = e.target.result
    var store = database.createObjectStore('users', { keyPath: 'username' })
}
```

`database.createObjectStore()`:第一个参数为存储空间名称，第二个参数中的`keyPath`属性为空间中将要保存的对象的一个属性，而这个属性将**作为存储空间的主键**来使用。（该方法必须在`upgradeneeded`事件中使用）如果没有合适的主键可以通过传入`{autoIncrement:true}`来让`IndexedDB`自动生成主键

### 向存储空间添加数据

新建对象仓库后可以新建索引：使用`IDBObject.createIndex(索引的名称，索引的属性，配置对象（该属性是否含重复值）)`

```js
objStore = database.createObjectStore('users', { keyPath: 'username' })
objStore.createIndex('name1', 'name2', { unique: false })
objStore.createIndex('email1', 'email2', { unique: true })
//结果新增了值为name1、email1的两个元素，属性为name2
```

当有一个对存储空间的引用后，就可以用`add()`或`put()`方法来向其中添加数据，它们都接收一个参数：要保存的对象，之后这个对象就会被保存在存储空间中,这个对象必须包含一个键为当初创建的`keyPath`对应的值。

它们两的区别为：当空间中有重复值时，`put()`会重写该对象，`add()`会返回错误。所以具体来说`add()`为插入新值，`put()`为更新原值。（用`add()`方法插入值时，一定有一个属性要是命名空间的`keyPath`同名）

每次调用`add()`与`put()`都会创建一个新的针对这个对象存储空间的更新请求，可以根据请求的`error`与`success`事件处理程序判断。

## 事务

在数据库对象上调用`transaction()`方法可以创建事务。任何时候想要读取或修改数据，都要通过事务来组织所有操作。使用该方法必须指定表格名称，还可指定操作模式（"只读”或”读写”），
当只指定名称时操作模式为只读：（可以用数组指定多个表格）

```js
var request1 = database.transaction(['users'], 'readwrite')
```

返回查找的所有对象的集合的对象

之后通过上面返回的`request`对象查询对应名称的存储空间

```js
var IDBOjectStore = request1.objectStore('users')
```

返回`IDBOjectStore`对象,在该对象上可以通过之前的`add()`方法向表格插入一条数据:

```js
var re2 = IDBOjectStore.add(user)
var user = {
    username: '007',
    firstName: 'James',
    password: 'foo'
}
```

注意插入的数据**必须要有一个主键与最初创建的`keyPath`对应**，可以通过监听`re2`对象来判断是否添加成功

### 数据读取

读取操作也是通过事务来完成：

```js
var res1 = database.transaction('users')
var res2 = res1.objectStore('users')
res2.get('007')
```

存储对象空间上提供了一个`get()`方法，参数为一个键的值，返回一个`IDBrequest`对象

同样的通过安装事件处理程序来查看是否查看是否成功

另一种查找的方法通过存储空间的`index()`方法来进行查找,该方法接收一个参数,表示要查找的索引

```js
var res1 = database.transaction('users', 'readwrite')
var res2 = res1.objectStore('users')
res2.index('name1') //查找索引为name1的键值对
```

### 利用游标遍历并操作表格

遍历表格所有记录，要使用指针对象`IDBCursor`,可以通过对象存储空间的`openCursor()`方法创建游标，游标会指向结果中的第一项。
该方法可以接收两个参数，第一个表示一个范围的`IDBKeyRange`实例（没有则为`null`），第二个参数表示游标的方向。（此处的游标对象必须在`onsuccess`中监听）

```js
res2.openCursor().onsuccess = function (e) {
    //异步调用，必须监听success事件
    var cursor = e.target.result
    if (cursor) {
        console.log(cursor.key, cursor.value)
    }
}
```

此为指针对象的属性：

-   `direction`属性表示游标移动的方向，默认为`next`表示下一项，还可以有`nextunique`表示下一个不重复的项，`prev`从尾开始遍历，`prevunique`从尾开始遍历不重复，可以通过`openCursor()`方法传入第二个参数来指定（第一个参数为`null`，一旦指定了就不能改变）。
-   `key`：表示对象的键值。
-   `value`：表示实际的表格对象
-   `primaryKey`：表示游标使用的键。

指针对象查找的值处于`event.target.result`中

可以使用`update()`方法用指定的对象来更新当前的游标的`value`:

```js
var IDBCursorWithValue1 = e.target.result
var obj = IDBCursorWithValue1.value
obj.password = 'wowowo' //修改password值
var updateRequest = IDBCursorWithValue1.update(obj) //请求保存更新
updateRequest.onsuccess = function () {
    //处理成功之后的操作
}
```

同时也可以调用`delete`方法，用于删除当前项

```js
IDBCursorWithValue1.delete()
```

如果当前事务*没有修改对象存储空间的权限*，`update()`和`delete()`会抛出错误

默认情况每个游标只能发起一次请求。要想发起另一个请求，必须调用下面的一个方法,**调用后再次触发指针对象的事件**：

-   `continue(key)`：移动到结果集中的下一项。参数`key`可选，不填时默认下一项，指定这个参数移动到指定位置。（无返回值，直接在调用对象上变动）
-   `advance(count)`：向前移动`count`指定的项数。（无返回值，直接在调用对象上变动）

#### 游标范围控制

键范围：为使用游标增添了一些灵活性，指定游标范围。键范围由`IDBKeyRange`实例表示，共有 4 个定义键范围的方式:

-   `IDBKeyRange.only()`：创建一个`IDBKeyRange`对象,该函数接收一个参数表示想要取得的对象的主键。

```js
onlyRange = IDBKeyRange.only('007') //返回一个仅包含007的IDBKeyRange对象
```

-   `IDBKeyRange.lowerBound(name,boolean)`：指定结果集的下界。下界表示游标开始的位置。然后向前移动知道最后个对象。如果想直接从下一个对象开始，可以在第二个参数传入`true`（不填默认`false`）。

-   `IDBKeyRange.upperRange(name，boolean)`：同上，表示从上界开始，也就是游标不能超过哪个键。指定后可以保证游标从头开始，直到键位指定的对象终止。（不想有指定键值第二个值传入`true`）

-   `IDBKeyRange.bound()`：接收 4 个参数分别表示下界的键，上届的键和跳过下界的布尔值，跳过上界的布尔值。有如下的例子：

```js
IDBKeyRange.lowerBound('007') //指定007为下界并开始搜索
IDBKeyRange.bound('007', 'ace') //从007开始到ace。
IDBKeyRange.bound('007', 'ace', true) //从007的下一个开始到ace
IDBKeyRange.bound('007', 'ace', true, true) // 从007下一个开始到ace前一个
```

在定义了以上方法后在将它作为第一个参数传给`openCursor()`方法，就能得到一个符合相应约束条件的游标。

#### 通过索引创建游标

在索引上调用`openCursor()`方法也可以创建新的游标，除了将索引键而非主键保存在`event.result.key`之外，其他与在对象存储空间上调用一样。(接下来的内容会介绍游标的内容)

在索引上调用`openKeyCursor()`方法可以创建一个特殊的只返回每条记录主键的游标。
这种情况下`event.result.key`中保存着索引键，而`event.result.value`保存则是主键，而不是整个对象。

还可以直接从索引中取出一个对象，只需使用`get()`方法

```js
var res1 = database.transaction('users', 'readwrite')
var res2 = res1.objectStore('users').index('username')
request = res2.get('007')
```

要根据给定的索引键取得主键，可以使用`getKey()`。这个方法中`event.result.value`等于主键的值，而不是包含整个对象。
在任何时候通过`IDBIndex`对象的下列属性都可以获取有关索引的相关信息。

-   `name`：索引的名字
-   `keyPath`：传入`createIndex()`中的属性路径
-   `objectStore`：索引的对象存储空间
-   `unique`：表示索引键是否唯一的布尔值

另外通过对象存储对象的`indexName`属性可以访问到该空间建立的所有索引。
在对象存储空间上调用`deleteIndex()`方法并传入索引的名字可以删除索引

### 数据添加与删除

与之前的添加删除操作一样,通过存储空间的`put()`,`add()`,`delete()`三个方法来进行操作

## 并发问题

`IndexedDB`提供的是异步 API。但有时也有并发操作，当两个不同的标签页打开了同一个页面，那么一个页面试图更新另一个页面尚未准备就绪的数据库的问题就有可能发生。

处理这个问题就是刚打开数据库时，记得指定`onversionchange`事件，并在事件中关闭数据库。调用`close()`方法。
当正要更新版本但另一个标签页已经打开数据库的情况下，就会触发`onblocked`事件，此时最好通知用户关闭其他标签页。

## 完整例子

```js
var request = indexedDB.open('新建', 4)

request.onsuccess = function (e) {
    var db = e.target.result
    var transaction = db.transaction('米寒', 'readwrite')
    var store = transaction.objectStore('米寒')
    var request = store.get('峰哥') //查找峰哥这个对象
    var keyRange = IDBKeyRange.bound('峰哥', '米寒', false, false)
    //创建峰哥到米寒这个范围的对象
    // var request=store.add({niconame:'峰哥',sex:"girl"})

    var IDBRequest = store.openCursor(keyRange)
    IDBRequest.onsuccess = function (e) {
        //游标对象必须在该事件中监听
        var cursor = e.target.result //确定游标

        var currentObj = cursor.value //当前游标对象
        currentObj.hobby = '玩耍' //添加兴趣值
        cursor.update(currentObj).onsuccess = function (e) {
            //上传保存数据并查看
            console.log(e)
        }
        if (cursor) {
            //查看当前游标是否是最后一个
            cursor.continue() //游标移动至下一项（无返回值，不要赋值）
        } else {
            console.log('没有更多了')
        }
    }
    var index1 = store.index('索引名称1') //查找索引1
}

request.onupgradeneeded = function (e) {
    //创建数据仓库和索引
    var db = e.target.result //数据库实例
    var store = db.createObjectStore('米寒', { keyPath: 'niconame' })
    console.log(store)
    store.createIndex('索引名称1', '索引值1', { unique: true })
    store.createIndex('索引名称2', '索引值2', { unique: false })
    store.add(person) //添加初始对象
}
var person = {
    niconame: '米寒',
    name: 'fengJJ',
    age: '18',
    sex: 'boy'
}
```

Reference

1. Javascript 高级教程
2. [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Tools/Storage_Inspector/IndexedDB)
