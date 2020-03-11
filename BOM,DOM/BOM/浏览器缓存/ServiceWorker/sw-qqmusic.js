var cacheWhitelist = ['yqq_v1'];

// service worker 注册事件
this.addEventListener('install', function (e) {

    // 一般注册以后，激活需要等到再次刷新页面后再激活
    // 可防止出现等待的情况，这意味着服务工作线程在安装完后立即激活。
    // 直接跳过安装阶段，在fetch中去更新缓存
    self.skipWaiting();
});

// 运行触发的事件。
// 这里将更新缓存策略。
this.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {

            // 删除已不在缓存队列中的缓存
            return Promise.all(keyList.map(function (key) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }))
        })
    )
});

// 网络优先
function firstNet (cacheName, request) {
     return fetch(request).then(function(response) {
        caches.open(cacheName).then(function(cache) {

            // 更新缓存
            cache.put(request, response);
        });

        // 返回新的缓存
        return response.clone();
    }).catch(function() {

        // 请求错误时，返回缓存
        return caches.open(cacheName).then(function(cache) {
            return cache.match(request);
        });
    });
}

// 缓存优先
function firstCache (cacheName, request) {
    // request.mode = 'cors';
    // return caches.open(cacheName).then(function(cache) {
    //     return cache.match(request).then(function(response) {
    //         var fetchServer = function () {
    //             return fetch(request,{
    //                 mode: 'cors',
    //                 credentials: 'omit'
    //             }).then(function(newResponse) {
    //                 // 对比缓存
    //                 if (response && response.status == 200) {
    //                     var oldTime = new Date (response.headers.get('Last-Modified')),
    //                         newTime = new Date (newResponse.headers.get('Last-Modified'));

    //                     // 判断是否缓存是否有问题。
    //                     if (oldTime.valueOf() != newTime.valueOf()) {
    //                         newResponse.clone().blob().then(function (res) {
    //                             postMsg({
    //                                 src : request.url,
    //                                 blob : res
    //                             });
    //                         });
    //                     }
    //                 }

    //                 cache.put(request, newResponse.clone());
    //                 return newResponse;
    //             });
    //         };

    //         if (response && response.status == 200) {
    //             setTimeout(fetchServer, 1000);
    //             return response;
    //         } else {
    //             return fetchServer(true);
    //         }
    //     });
    // })

    return caches.open(cacheName).then(function(cache) {
        return cache.match(request).then(function(response) {

            // 轻易请求
            var fetchServer = function () {
                return fetch(request).then(function(newResponse) {
                    cache.put(request, newResponse.clone());
                    return newResponse;
                });
            };

            // 如果查询到了缓存，则返回缓存
            if (response) {
                setTimeout(fetchServer, 1000);
                return response;
            } else {
                return fetchServer(true);
            }
        });
    })
}

function postMsg (data) {

    // 返回所有的当前sw控制客户端
    self.clients.matchAll().then(function (clientList) {

        // 向每个客户端返回一个JSON对象信息
        clientList.forEach(function (client) {
            client.postMessage({
                src : data.src,
                blob : data.blob
            });
        });
    });
}

// 竞速模式
// 网络好的时候优先使用请求
function networkCacheRace (cacheName, request) {
    var timeId, TIMEOUT = 300,
        options = {};

    return Promise.race([new Promise(function(resolve, reject) {

        // 如果3m内没有获取到请求的返回，则使用缓存
        timeId = setTimeout(function() {
            caches.open(cacheName).then(function(cache) {
                cache.match(request).then(function(response) {
                    if (response) {
                        resolve(response);
                    }
                });
            });
        }, TIMEOUT);
    }), fetch(request).then(function(response) {

        // 请求成功返回时清除定时器
        clearTimeout(timeId);

        // 使用并更新缓存
        caches.open(cacheName).then(function(cache) {
            cache.put(request, response);
        });
        return response.clone();
    }).catch(function() {
        clearTimeout(timeId);
        return caches.open(cacheName).then(function(cache) {
            return cache.match(request);
        });
    })]);
}

// 返回匹配规则的url
function matchRules(url, rules) {
    var match = false;
    for (var i = 0, reg; !match && (reg = rules[i]); ++i) {
        match = match || reg.test && reg.test(url);
    }
    return match;
}

// 监听页面的请求。
// 只能缓存get请求。
this.addEventListener('fetch', function (e) {

    var request = e.request;

    // 重定向http协议，防止混用出错
	request.url = request.url.replace('http://', 'https://')
    var url = request.url,
        cacheName = cacheWhitelist[0];

    // 页面，js，css等资源网络优先
    // 当500毫秒还没返回就直接使用缓存。
    if (matchRules(url, [/.(js|css)(\?|#|$)/i]) && matchRules(url, [/^https:\/\/(y.qq.com|c.y.qq.com|y.gtimg)/i])) {
        e.respondWith(networkCacheRace(cacheName, request));
    }
    // 图片缓存优先
    else if (matchRules(url, [/.(png|jpg|jpeg|gif|webp)(\?|#|$)/i]) && matchRules(url, [/^https:\/\/(y.qq.com|c.y.qq.com|y.gtimg)/i])) {
        e.respondWith(firstCache(cacheName, request));
    }
});