# 媒体元素

## audio元素
顾名思义即音频元素，可以通过它的构造函数创建它
```js
new Audio('./Matt Cab - 前前前世 (RADWIMPS Cover).mp3').play();
```
`Audio`构造函数的返回值和文档中的`audio`元素或创建的`audio`元素都是同一类对象。

当设置媒体`src`属性时，就开始加载媒体了，除非将`preload`属性设置为`auto`，否则只加载少量内容，如果此时有其他媒体文件在加载或播放，则会中断它们。当通过`src`指定媒体源时，媒体元素**无法知道`source`元素是否都添加完毕**。因此不会加载`source`元素的媒体文件，除非显式调用`load`方法。

## video元素
这个元素至少应包含`src`属性，指向要加载的媒体文件; 还可以设置`width`、`height`来指定`video`的大小。`poster`属性指定一幅图像，在加载视频内容期间显示; `controls`属性表示是否显示控制视频的UI控件。
```html
<video src=""
poster="D://QQ音乐/picture/1470213378560.png" width="600" height="400" controls>不支持</video>
<!-- 在不支持该元素的浏览器，会显示标签中的文字。
并非所有的浏览器都支持所有的媒体格式，所以可以指定多个不同的媒体来源-->
<video>
  <source src="" type="video/webm;codecs='vp8,vorbis'">
  <source src="conference.mpg">
</video>
```

## 两者的公共属性

### 选值属性
+ preload：表示预加载，`none`表示不需要加载; `metadata`表示加载元数据; `auto`表示加载适当的媒体内容。

+ autoplay：表示当已经缓存足够多的内容时是否自动播放。设置为`true`时表示需要预加载媒体年内容。

### 布尔值属性
+ paused：播放器暂停。
+ seeking：正在跳转一个新的播放点
+ ended：是否播放完媒体。（当设置`loop`为`true`时，`ended`属性永不为`true`）
+ muted：是否静音，`false`时会以之前的音量继续播放。

### 数值属性
+ duration：指定了媒体的时长，单位是秒。未加载时读取为NaN
+ currentTime:当前播放的时间
+ initialTime：媒体开始的时间，单位是秒。对于流媒体，该属性表示已缓存的数据的最早时间以及能够回退的最早时间。设置`currentTime`时，不能小于该值。
+ played：返回表示已经播放的时间段。
+ buffered：返回当前已经缓冲的时间段。
+ seekable：返回当前播放器需要跳到的时间段。
+ volume：播放音量，介于0~1之间。
+ playbackRate：指定媒体播放速度倍速。正值为以1.0为基础的倍数播放，你懂的。负值时是倒放。（`audio`不行）。未设置时，取用`defaultPlaybackRate`的值。
+ readyState：指定当前已经加载了多少媒体内容。有以下值：
  + 0：没有加载任何
  + 1：元数据已经加载完毕，但媒体内容未加载。这时可以获取媒体时长或视频文件的纬度，以及可以设置`currentTime`来定点播放，但无法从设置的`currentTime`开始播放。
  + 2：`currentTime`的媒体内容已经加载完毕，但还没有加载足够的内容播放媒体。对于视频，表示当前帧加载完成，下一帧还未加载。
  + 3：已经加载一些媒体内容。
  + 4：已经全部加载完毕。
+ NetworkState：媒体元素是否使用网络或者为什么媒体文件不使用网络：
  + 0：媒体元素还没有开始使用网络。比如未设置`src`属性
  + 1：媒体当前没有通过网络来加载内容。
  + 2：当前通过网络加载媒体内容
  + 3：无法获取媒体源
+ errer：当加载或播放发生错误时，就会设置媒体元素的`error`属性。没有发生错误时未`null`，发生错误时该属性是一个对象，其中`code`属性表示错误的数值：
  + 1：用户要求浏览器停止加载媒体内容
  + 2：媒体类型正确，但方式网络错误导致无法加载
  + 3：媒体类型正确，但是由于编码错误导致无法正常解码和播放
  + 4：通过`src`属性指定的媒体文件浏览器不支持，无法播放。

其中`played`、`buffered`、`seekable`都属于`TimeRange`对象，每个对象都有一个`length`属性与`start(index)`、`end(index)`方法，`length`表示当前的一个时间段的数量，`start`返回`index`时间段的开始时间，`end`返回`index`时间段结束时间。

### 相关事件
以下事件都不能通过属性来注册：
+ loadstart：媒体元素开始请求媒体数据内容时触发。此时`NetworkState`值为2。
+ progress：正在通过网络加载媒体内容。此时`NetworkState`值未2。此事件每两秒触发2~8次
+ loadedmetadata：媒体元数据已经加载完毕，对应的媒体和纬度数据已经获取。此时`readyState`为1.
+ lloadeddate：当前播放位置的媒体内容首次加载完毕，同时`readyState`值变为2.
+ canplay：已经加载一些媒体内容，可以开始播放，但是还需要继续缓存更多数据。此时`readyState`值为3.
+ canplaythrough：所有媒体内容加载完毕，可以流畅播放。此时`readyState`值为4
+ suspend：已经缓存大量数据，暂时停止下载。此时`NetworkState`值为1
+ stalled：尝试加载数据，但是无法获取到数据。此时`NetworkState`始终为2
+ play：调用`play()`方法或设置相应`autoplay`属性。如果已经加载足够多的数据，紧接着会触发`playing`事件；否则触发`waiting`事件.
+ waiting：由于未缓存足够数据导致播放未能开始或者播放停止。当缓存足够多数据后，接着触发`playing`事件
+ playing：已经开始播放媒体文件
+ timeupdate：`currentTime`值发生改变了。在一般播放过程中，此事件每秒会触发4~60次，具体次数取决于系统加载速度以及事件处理程序完成时间。
+ pause：调用来了`pause()`方法，暂停了播放
+ seeking：通过脚本或者用户通过控件将当前播放时间跳到一个还未缓存的时间点，导致内容没有加载完时，停止播放。此时`seeking`未`true`。
+ ended：媒体播放完毕，停止播放。
+ durationchange：`duration`属性值发生变换
+ volumechange：`volume`或`muted`属性值发生变换
+ ratechange：`playbackRate`或`defaultPlaybackRate`发生变化
+ abort：通常是用户停止加载媒体内容。此时`error.code`未1
+ error：发生网络错误或其他错误阻止媒体加载。`error.code`不会是1.
+ emptied：发生错误或中止，导致`NetworkState`属性值变回0




## 两者共有方法
两个媒体元素都有一个`canPlayType()`方法，该方法接收一种格式/编解码器字符串，返回的值可能为`probably`、`maybe`、`''`（空字符串）

编解码器必须要用引号引起来才行。下表列出了已知支持的音频格式和编解码器
音频 | 字符串 | 支持的浏览器
-|-|-
AAC | audio/mp4;codecs=”mp4a.40.2” | IE9+、Safari 4+
MP3 | audio/mpeg | IE9+、Chrome
Vorbis | audio/ogg;codecs=”vorbis” | Firefox 3.5+、Chrome、Opera 10.5+
WAV | audio/wav;codecs=”1” | Firefox 3.5+、Chrome、Opera 10.5+

视频 | 字符串 | 支持的浏览器
-|-|-
H.264 | video/mp4;codecs=”avc1.42E01E,mp4a.40.2” | IE9+、Safari 4+
Theora | video/ogg;codecs=”theora” | Firefox 3.5+、Chrome、Opera 10.5+
WebM | video/webm;codecs=”vp8,vorbis” | Firefox 4+、Chrome、Opera 10.6+

