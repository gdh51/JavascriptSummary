# File API

## Blob

Blob：是对大数据块的不透明引用或者句柄。Blob 通常表示二进制数据，也可以表示一个小型文本文件的内容。

Blob 是不透明的：能对它们进行直接操作的就只有获取它们的大小（以字节为单位）、`MIME`类型以及它们分隔成更小的`Blob`。

-   Blob 支持结构性复制算法（深复制），可以通过`message`事件从其他窗口或线程中获取`Blob`。
-   可以从客户端数据库获取 Blob
-   通过脚本化 HTTP 从 Web 中下载 Blob
-   可以使用`Blob`构造函数来从字符串、`ArrayBuffer`对象以及其他 Blob 来创建自己的 Blob。
-   客户端`File`对象是`Blob`的子类：File 对象其实就是有名字和修改日期的 Blob 数据。通过`<input type='file'>`元素以及拖放可以获取 File 对象。

Blob 类型有一个`size`属性和一个`type`属性，并定义有`slice()`方法，进一步切割数据。
也可以通过 FileReader 的方法中传入切割后的文件内容，读取 Blob 的数据。

### File 对象

File 对象提供一种安全的方式，以便在客户端访问用户计算机的文件，并更好的对这些文件执行操作,它是 Blob 的子类型。在通过文件输入字段选择了一个或多个文件时，`files`集合中将包含一组`File`对象，每个`File`对象对应一个文件且拥有以下可读属性：

-   name：本地文件系统中的文件名
-   size：文件的字节大小
-   type：字符串，文件的 MIME 类型
-   lastModifiedDate：字符串，上一次文件被修改的时间

File 对象支持一个`slice()`方法(继承自 Blob 类型)，接收两个参数：起始字节以及要读取的字节数。返回一个`Blob`实例，`Blob`是`File`类型的父类型。

#### 其他方式获取 File 对象

##### 读取拖放的文件

从桌面拖放文件到浏览器中也会触发`drop`事件，而且可以通过`event.dataTransfer.files`中读取到放置的文件。

##### 使用 XHR 上传文件

用`FormData`对象装填`File`对象。

### FileReader 对象

FileReader 类型：实现异步文件读取机制，提供了以下方法，将文件信息存入`reader`中：

-   `readAsText(file,encoding)`：以纯文本形式读取文件，将读取到的文本保存在`FileReader`对象的`result`属性中。第二个参数用于指定编码类型，可选默认为 ASCII 和 UTF-8。

-   `readAsDataURL(file)`：读取文件并将文件以数据 URI 的形式保存在`FileReader`对象的`result`属性中

-   `readAsBinaryString(file)`：读取文件并将一个字符串保存在`FileReader`对象的`result`属性中，字符串中的每个字符表示一字节（该方法 IE 未实现）

-   `readAsArrayBuffer(file)`：读取文件并将一个包含文件内容的`ArrayBuffer`保存在`FileReader`对象的`result`属性中。

必须通过上述某个方法将文件内容存入`result`属性中

#### FileReader 对象事件

因为读取过程是异步的，所以提供了几个事件：
`progress`、`error`、`load`分别表示是否又读取了新数据、是否发生了错误、是否已经读完了整个文件。
每过 50ms 左右，就会触发一次`progress`事件，通过事件对象可以获得 XHR 的`progress`事件相同的信息

当无法读取文件时，就会触发`error`事件，相关的信息会保存到`FileReader`的`error`属性中，该属性保存着一个对象，只有一个`code`属性，即错误码：

1. 表示未找到文件
2. 表示安全性错误
3. 表示读取中断
4. 表示文件不可读
5. 表示编码错误

文件加载成功后触发`load`事件；如果发生了`error`事件就不会发生`load`事件。
如果想中断读取过程，可以调用`abort()`方法，这样就会触发`abort`事件。在触发`load`、`error`或`abort`事件后，会触发另一个`loadend`事件，该事件意味着已经读取完整个文件，或读取时发生了错误，或读取过程被中断。

```js
var reader = new FileReader()
reader.readAsArrayBuffer(filez.files[0]) //接收Blob对象
reader.onload = function () {
    console.log(reader)
}
```

### 对象 URL

指的是引用保存在`File`或`Blob`中数据的 URL。

要创建 URL 对象，可以使用`window.URL.createObjectURL()`方法并传入一个`File`或`Blob`对象，返回一个字符串，_指向一块内存的地址_。（为了浏览器兼容要在 URL 加前缀）。返回的字符串可以直接作为`img`或其他 DOM 元素的`src`地址。

在不需要相应的数据时，应用`window.URL.revokeObjectURL()`方法**释放内存**，接受一个参数表示要释放的对象 URL。页面卸载时都会自动释放对象 URL 占用的内存

使用`URL.createObjectURL()`创建一个`Blob URL`。传递一个 Blob 给该方法会返回一个 URL 字符串，以`blob://*`开始并紧跟一串文本字符串，该字符串用不透明的唯一标识符来标识 Blob。`Blob URL`只是对浏览器存储在内存中或磁盘上的 Blob 的一个简单的引用。

```html
<input type="file" onchange="show()" multiple />
<img src="" />
<script>
    var news = window.URL.createObjectURL(filez.files[0])
    filez.nextElementSibling.setAttribute('src', news)
</script>
```

以上表示将选择的文件在 img 元素中展示出来。Blob URL 仅在**同源窗口**有效。

可以通过调用`URL.revokeObjectURL()`方法来让 Blob URL 失效
