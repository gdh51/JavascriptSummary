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
        this.queue = []
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
}

// 赋予cb操作Promise能力
function wrapPromise(cb) {
    const p = new Promise((resolve, reject) => cb(resolve, reject))
    return p
}

function open(name, version, { upgrade } = {}) {
    return wrapPromise((resolve, reject) => {
        const request = indexedDB.open(name, version)

        request.onsuccess = ({ target: { result } }) =>
            resolve(new EasyIDB(result), request)
        request.onerror = e => reject(e)

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
