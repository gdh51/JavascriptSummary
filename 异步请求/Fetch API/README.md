# Fetch API

`Fetch API`提供了一个获取资源的接口(包括跨域资源)。相比于以往的`XMLHttpRequest`对象其更加灵活和强大，类似于`axios`(一个获取资源的三方库，基于`Promise`)。

`Fetch API`提供了对`Request`与`Response`对象的通用定义，这使它们能在更多场景中使用：`Service Worker/Cache API`又或者是其他处理请求和响应的方式，甚至是任何一种需要你自己在程序中生成响应的方式。

## 调用 fetch()

要发送请求需要使用在`Window/WorkerGlobalScope`上的`fetch()`方法。

> 你可以直接通过`globalThis.fetch()`获取

它必须接受至少一个参数，即请求的资源的路径，无论成功与否它都会返回一个`Promise`对象，该`Promise`会`resolve`请求对应的`Response`对象。当然我们还可以传入第二个参数，其为一个配置对象。

```js
fetch('www.url.com', {
    /* ... */
})
```

一个完整的配置对象相包括：

```js
fetch(url, {
    // 荷载，必须匹配Content-Type头部
    body: JSON.stringify(data),

    // 是否缓存，可选项有no-cache, reload, force-cache, only-if-cached
    cache: 'no-cache', // *default

    // 是否携带凭证(cookie)，默认不携带
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
        'user-agent': 'Mozilla/4.0 MDN Example',
        'content-type': 'application/json'
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer' // *client, no-referrer
})
```

具体含义即可用值如下：

`method`：表示请求的方法，可选值即我们常用的请求值：`GET, POST, PUT, DELETE`等。

`headers`：表示任何你想加到请求中的头，其值可以为`Header`对象或对象字面量。

`body`：表示请求携带的主体(`GET/HEAD`请求没有请求主体)，可以下面类型值的一种：

-   `Blob`
-   `BufferSource`
-   `FormData`
-   `URLSearchParams`
-   `USVString`
-   `ReadableStream`

`mode`：用于确定跨域请求是否能得到有效的响应，以及响应的哪些属性是可读的，可选值为：

-   `cors`：接受跨域响应；
-   `no-cors`：请求方法只允许`HEAD/GET/POST`，请求头部只允许[简单请求头](https://fetch.spec.whatwg.org/#simple-header)；
-   `same-origin`仅接受同源响应。
-   `navigate`：表示这是一个浏览器的页面切换请求。 `navigate`请求仅在浏览器切换页面时创建，该请求应该返回`HTML`。

`credentials`：用户代理是否应该在跨域请求的情况下向其他域发送`cookies`，有以下值

-   `'include'`：任何请求都携带`cookie`；
-   `'same-origin'`：只有同源的请求才携带`cookie`；
-   `'omit'`：任何请求不携带`cookie`(默认值，但之后版本有修改)

`cache`：控制请求与浏览器`HTTP`缓存的交互方式，有以下值。

-   `default`：浏览器会从`HTTP`缓存中查找，如果当前缓存未过时，那么会直接返回；如果过时了，则按协商缓存的方式查询；新发送的请求后会缓存返回的资源。
-   `no-store`：浏览器不会从缓存中获取并且请求的响应的资源不会进行缓存。
-   `reload`：同`no-store`一样，但是它会将响应的资源进行缓存。`no-cache`：浏览器强制进行协商缓存，并将返回的资源进行缓存。
-   `force-cache`：浏览器强行返回缓存中的资源，仅在没有时进行新的请求。
-   `only-if-cache`：浏览器强行返回缓存中的资源，没有时代替服务器返回`504`

Reference:

[MDN cache](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)

`redirect`：对重定向的处理方式，有以下值

-   follow：浏览器自动跳转
-   error：不允许重定向跳转
-   manual：用户手动操作

> 文档自己也没写意思逆天，不过应该就是字面意思

[MDN redirect](https://developer.mozilla.org/en-US/docs/Web/API/Request/redirect)

其余部分字段未罗列出来，**建议在实际使用时，对每个字段先预定义一个默认值**，因为由于浏览器实现原因，很多字段的默认值在前后发生了变化。

`fetch()`函数的调用结果的`Promise`在除网络发生错误外的任何时候都会被`fulfilled`，反之其会被`reject`。对于一个请求是否成功，即未收到表示错误的状态码，其会在其返回的`Response`对象的`ok`字段上通过`Boolean`值表示。

```js
fetch(url, options)
    .then(response => {
        //处理返回的请求,这里的返回请求只要不是网络错误都在这里
        if (response.ok) {
            // 成功收到服务器的正常响应
            return
        }

        // 其余情况可以直接丢错，强制进入catch中统一处理
        throw Error('Network not ok')
    })
    .catch(error => {
        //处理网络错误和其他业务错误
    })
```

### 另一种调用方式

除了给`fetch()`传递一个资源地址，我们还可以直接传入一个`Request()`对象来作为参数：

```js
const headers = new Headers()
const options = {
    method: 'GET',
    headers,
    mode: 'cors',
    cache: 'default'
}
const request = new Request('url', options)

// 发送请求了
fetch(request)
```

`Request()` 和 `fetch()` 接受同样的参数。你甚至可以传入一个已存在的 `Request` 对象来创造一个拷贝：

```js
// 承接上面的代码
const anotherRequest = new Request(request, options)
```

这样是有意义的，因为`request`与`response bodies`只能被使用一次(因为设计成了 `stream` 的方式，所以它们只能被读取一次)。创建一个拷贝就可以再次使用`request/response`。

> 还可以通过`request/response.clone()`的方法创建一个拷贝。它与上述方法一样如果响应体`Body`被使用过的话，那么`clone()`会导致错误。区别在于，`clone()`出来的`Body`对象被读取不会导致原`Body`被标记读取。`clone()`的主要作用就是支持`Body`对象的多次使用。

## Header 对象

使用 `Headers` 的接口，你可以通过 `Headers()` 构造函数来创建一个你自己的 `headers` 对象。一个 `headers` 对象是一个简单的多名值对：

```js
const headers = new Headers()
headers.append('Content-Type', 'text/plain')
headers.append('X-Custom-Header', 'ProcessThisImmediately')

// 等价于
new Headers({
    'Content-Type': 'text/plain',
    'X-Custom-Header': 'ProcessThisImmediately'
})
```

创建的`headers`内容可以进行查询、删除、修改：

```js
headers.has('Content-Type') // true

headers.append('X-Custom-Header', 'ProcessThisImmediately')
headers.append('X-Custom-Header', 'AnotherValue')

// 查询
headers.get('X-Custom-Header') // ProcessThisImmediately
headers.getAll('X-Custom-Header') // ["ProcessThisImmediately", "AnotherValue"]

// 删除
headers.delete('X-Custom-Header')
headers.getAll('X-Custom-Header') // [ ]
```

如果使用了一个不合法的 `HTTP Header` 属性名，那么 `Headers` 的方法通常都抛出 `TypeError` 异常。如果不小心写入了一个不可写的属性，也会抛出一个 `TypeError` 异常。除此以外的情况，失败了并不抛出异常。

## Body 主体

无论是`Request`还是`Response`，它们都能够包含`body`。`body`是下面任意类型值的实例：

-   `ArrayBuffer`
-   `ArrayBufferView`
-   `Blob/File`
-   `string`
-   `URLSearchParams`
-   `FormData`

`Body` 类定义了以下方法(这些方法都被 `Request` 和`Response`所实现)以获取 `body` 内容。这些方法都会返回一个被解析后的`Promise`对象和数据。

-   `arrayBuffer()`
-   `blob()`：将主体解析为`Blob`类型值
-   `json()`：将主体解析为`JSON`字符串
-   `text()`
-   `formData()`：解析为`formData`对象，主要用于`Service Worker`拦截请求，并对其中的字段做出修改。

以上方法调用都返回`Promise`对象，比起`XHR`来，这些方法让非文本化的数据使用起来更加简单。

## Request 对象

`fetch()`和`Request`对象的构造函数接受同样的参数。所以我们可以直接通过`Request()`构造函数来创建请求，但不推荐这么做。它们**应该**被用于其他`API`的结果(比如`Service Worker`中缓存响应时需要创建一个新的响应，`FetchEvent.respondWith`)。

Reference:

[MDN Request](https://developer.mozilla.org/zh-CN/docs/Web/API/Request/Request)

## Response 对象

常用的`Response`属性有：

-   `status`：`http`的状态码
-   `statusText`：字符串，默认值为`OK`，是`http`状态码对应的文本
-   `ok`：该属性用来表示`status`是否在`200~299`之间(包含)，是一个布尔值。

它的构造函数用法跟`Request`对象一样，但是其第一个参数，因为为一个`Body`类型的值或一个`Response`。

Reference:
[1. MDN Response](https://developer.mozilla.org/zh-CN/docs/Web/API/Response/Response)

## 中止 fetch()

`AbortController`接口表示一个控制器对象，允许你根据需要中止一个或多个 `Web`请求。你可以使用 `AbortController()` 构造函数创建一个新的 `AbortController`，并通过`AbortSignal`对象来完成与`DOM`请求的通信。

```js
const controller = new AbortController()
```

在`controller.signal`属性下，会返回一个`AbortSignal`对象实例，通过它我们可以来中断一个请求。

```js
const signal = controller.signal

// 发送请求并将信号作为参数
fetch('url', { signal }).catch(e => console.log(e))
```

通过调用`AbortController.abort()`方法，我们就可以中止这个请求，被中止的请求的`Promise`会被`reject`掉并返回对应的错误。

```js
controller.abort()
```

Reference:

[1. MDN AbortSignal](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortSignal)
[2. MDN AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController)

---

`fetch` 是一个相当**底层**的 API，在实际项目使用中，需要做各种各样的封装和异常处理，而并非开箱即用。且其并未广泛支持，所以使用前你需要考察，必要时你需要使用`poly`来支持其功能。

Reference:
[1. 使用 Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
[2. Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
