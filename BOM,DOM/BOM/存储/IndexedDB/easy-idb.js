// 将 IDBRequest 包装为Promise
class EasyIDB {
    constructor(db) {
        this.db = db
    }

    transaction(...args) {
        this.db.transaction(...args)
        return this
    }

    createStore(name, options) {
        return new EasyStore(this.db.createObjectStore(name, options))
    }

    useStore(name, mode = 'readwrite') {
        // 查询当前的store
        return new EasyStore(this.db.transaction(name, mode).objectStore(name))
    }
}

class EasyStore {
    constructor(store) {
        this.store = store
    }

    add(value, key) {
        return wrapPromise((resolve, reject) => {
            const request = this.store.add(value, key)

            // source为该Store
            request.onsuccess = () => resolve(this)
            request.onerror = e => reject(e)
        })
    }

    put(value, key) {
        return wrapPromise((resolve, reject) => {
            const request = this.store.put(value, key)

            request.onsuccess = ({ target: { result } }) =>
                resolve(new EasyIDB(result), request)
            request.onerror = e => reject(e)
        })
    }

    get(key) {
        return wrapPromise((resolve, reject) => {
            const request = this.store.get(key)

            request.onsuccess = ({ target: { result } }) => resolve(result)

            request.onerror = e => reject(e)
        })
    }

    createIndex(...args) {
        return new EasyIndex(this.store.createIndex(...args))
    }

    index(name) {
        return new EasyIndex(this.store.index(name))
    }

    // 游标的使用方式不同，每次迭代的结果都在同一个事件订阅中处理，
    // 所以此时我们通过传入一个函数控制
    useCursor({ query, direction, next } = {}) {
        const request = this.store.openCursor(query, direction)

        request.onsuccess = ({ target: { result } }) => result && next(result)

        request.onerror = e => next(e)
    }
}

class EasyIndex {
    #MODE_TO_METHOD = {
        value: 'openCursor',
        key: 'openKeyCursor'
    }

    constructor(index) {
        this._index = index
    }

    count() {
        return wrapPromise((s, j) => {
            const r = this._index.count()

            r.onsuccess = ({ target: { result } }) => s(result)
            r.onerror = e => j(e)
        })
    }

    get(key) {
        return wrapPromise((s, j) => {
            const r = this._index.get(key)

            r.onsuccess = ({ target: { result } }) => s(result)
            r.onerror = e => j(e)
        })
    }

    getAll(...args) {
        return wrapPromise((s, j) => {
            const r = this._index.getAll(...args)

            r.onsuccess = ({ target: { result } }) => s(result)
            r.onerror = e => j(e)
        })
    }

    getAllKeys(...args) {
        return wrapPromise((s, j) => {
            const r = this._index.getAllKeys(...args)

            r.onsuccess = ({ target: { result } }) => s(result)
            r.onerror = e => j(e)
        })
    }

    useCursor({ query, direction, next, mode = 'value' } = {}) {
        const request = this._index[this.#MODE_TO_METHOD[mode]](
            query,
            direction
        )

        request.onsuccess = ({ target: { result } }) => result && next(result)

        request.onerror = e => next(e)
    }
}

// 赋予cb操作Promise能力
function wrapPromise(cb) {
    const p = new Promise((resolve, reject) => cb(resolve, reject))
    return p
}

function open(name, version, { upgrade, versionchange, blocking } = {}) {
    return wrapPromise((resolve, reject) => {
        const request = indexedDB.open(name, version)

        request.onsuccess = ({ target: { result } }) => {
            if (versionchange) {
                result.onversionchange = e => versionchange(e)
            }
            resolve(new EasyIDB(result), request)
        }

        request.onerror = e => reject(e)

        if (blocking) {
            request.onblocked = e => blocking(e)
        }

        // 处理数据库升级
        if (upgrade) {
            // 在升迁中创建对象存储空间
            request.onupgradeneeded = ({
                target: { result },
                newVersion,
                oldVersion
            }) => upgrade(new EasyIDB(result), oldVersion, newVersion)
        }
    })
}
