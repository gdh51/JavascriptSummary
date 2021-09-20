# Navigator 对象

`window`的`navigator`属性引用的是包含浏览器厂商和版本信息的`Navigator`对象：

当需要解决存在某个特定的浏览器的特定版本中的特殊的 bug 时，`Navigator`对象有 4 个属性用于提供关于运行中的浏览器的版本，并且可以使用这些属性进行浏览器嗅探：

-   `appName`：web 浏览器全称 _IE 为 Microsoft Internet Explorer_ _Firefox 为 Netscape_ _其他浏览器通常为 Netscape_
-   `appVersion`：以数字开头，并跟着包含浏览器厂商和版本信息的详细字符串。字符串前面的数字一般为 4.0 或 5.0 由于该属性没有标准的格式，所以没有办法用它来判断浏览器类型。
-   `userAgent`：通常包含`appVersion`中的所有信息，还有其他细节。没有标准的格式，一般靠这个属性来嗅探
-   `platform`：在其上运行浏览器的操作系统的字符串
    该对象还有一些比较常用的属性：
-   `onLine`：表示浏览器是否连接到网络
-   `geolocation`：用于确定用户地理位置信息的接口
-   `javaEnabled()`：当浏览器可以运行 Java 小程序时返回`true`
-   `cookieEnable`：布尔值，浏览器可以永久保存`cookie`时返回`true`。

## 离线检测(navigator.onLine)

有一个`navigator.onLine`属性，当值为`true`时表示设备能上网，`false`表示设备离线。

同时 HTML5 还定义两个事件：`online`和`offline`，当从离线或在线互相转换时，会触发对应的事件（_在`window`对象上触发_）

## 地理位置定位(navigator.geolocation)

地理位置定位，Javascript 代码能够访问用户的当前位置,最早实现于`navigator.geolocation`对象，该对象有 3 个方法：
`geolocation.getCurrentPosition()`：触发请求用户共享地理定位信息的对话框。该方法接收 3 个参数：成功的回调函数、可选的失败回调函数和可选的选项对象。
其中*成功*的回调函数会接收一个`Position`对象参数如下：

-   latitude：以十进制表示纬度
-   longitude：以十进制度数表示经度
-   accuracy：经纬度坐标的精度，以米为单位
-   altitude：以米为单位的海拔高度
-   altitudeAccuracy：海拔高度的精度
-   heading：指南针的方向，0 度表示正北。
-   speed：每秒移动多少米

在*失败*的回调中也会收到一个参数对象。包含两个属性：`message`和`code`，其中`message`保存着给人看的文本消息，解释为什么会出错，`code`保存一个数值，表示错误的类型：

1. 用户拒绝共享
2. 位置无效
3. 位置超时

第三个参数是一个选项对象，用于设定信息的类型，可选的选项有 3 个：

-   enableHighAccuray：是一个布尔值，表示必须尽可能使用最精确的位置信息；
-   timeout：是以毫秒数表示的等待位置信息的最长时间；
-   maximumAge：上一次获取的坐标信息的有效时间，以毫秒表示。可以设置为`Infinity`始终用上一次的坐标信息

```js
navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 25000
})
```

`geolocation.watchPosition()`追踪用户的位置。接收三个参数同上面的方法，实际上该方法就是定时调用上面的方法。调用该方法会返回一个数值标识符，传入`geolocation.clearWatch()`方法可取消监控操作。
