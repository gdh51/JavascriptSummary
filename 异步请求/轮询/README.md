# 轮询

轮询即服务器定时向客户端发起询问，给予其服务，结束后接着不断重复的过程。

那么轮询一般分为两种：

- [长轮询](#%e9%95%bf%e8%bd%ae%e8%af%a2)
- [短轮询](#%e7%9f%ad%e8%bd%ae%e8%af%a2)

## 短轮询

短轮询即客户端向服务器发送请求，服务器无论是否有数据都要立即进行响应。

### Ajax短轮询

即每个一段时间向服务器发送一个`Ajax`请求以获取信息。

可以利用定时器来实现：

```js
setTimeout(() => {l
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

长轮询即服务器在收到客户端请求后，如果有数据则立即响应；如果没有数据，则维持这个连接而不进行响应直到有数据进行响应。当然这个维持有一段时间限制，时间到后需要对客户端进行响应告诉客户端重新建立连接。

### Comet——服务器推送

点击查看具体长轮询的显示——[Comet详情](./Comet/README.md)
