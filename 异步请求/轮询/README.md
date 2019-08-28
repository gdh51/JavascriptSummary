# 轮询

## 短轮询

### Ajax短轮询
即每个一段时间向服务器发送一个Ajax请求以获取信息。

可以利用定时器来实现：
```js
setTimeout(() => {
    let xhr = new XMLHttpRequest();
    xhr.open(HttpMethods, URL, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            let status = xhr.status;
            if (status >= 200 && status < 300 && status === 304) {
                // dosomethings
            } else {
                // ...
            }
        }
    }
}, 1000);
```
缺点：无法满足即时通信等富交互式应用的实时更新数据的要求。

## 长轮询

### Comet
[Comet详情](./Comet)

