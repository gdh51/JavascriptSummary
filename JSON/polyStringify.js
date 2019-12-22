let isObject = isType('Object'),
    isString = isType('String'),
    isFunction = isType('Function'),
    isNumber = isType('Number'),
    isArray = isType('Array');

function isType(type) {
    return function (val) {
        return Object.prototype.toString.call(val).slice(8, -1) === type;
    }
}

/**
 * 通过iterator()函数可以看出流程比较清晰，大约按以下顺序：
 * 1. 处理过滤器(可选)
 * 2. 处理当前值(即是否递归)
 * 3. 格式化结果(可选)
 */

function stringify(val, filter, indentation) {

    // 检测循环引用
    const map = new Map();

    // 处理数组形filter中的值，使其为字符串
    if (isArray(filter)) {
        filter = filter.map(key => String(key));
    }

    return iterator(val, undefined, 0);

    /**
     * 遍历给于的值，进行序列化，按DFS的方式
     * @param {any} val 当前遍历的键值
     * @param {String, undefined} key 当前遍历的键名
     * @param {Number} level 当前键值在对象中的嵌套深度(用于处理缩进)
     * @param {Boolean} inArray 是否为数组第一层元素
     */
    function iterator(val, key, level, inArray) {
        let res = '';

        // 确认当前处理的值是否为数组元素，因为数组元素在数组过滤器下不被处理
        // 优先继承指定的情况，其次自行判断当前处理值是什么
        inArray = inArray || isArray(val);

        // 这里我们要对值首先进行过滤后才开始处理
        val = handleFilter(val, key, inArray);

        if (isObject(val)) {

            // 处理循环引用
            if (map.has(val)) {
                throw Error('???');
            }
            map.set(val);

            // 对象中的键的数组
            keys = Object.keys(val);

            res = keys.reduce((res, key) => {

                // 直接是格式化后的最终结果的字符串！
                return res += iterator(val[key], key, level + 1);
            }, '');

            return format2String(res, key, level, ['{', '}']);
        }

        // 虽然之前有，但是之前处理的是未过滤前的值
        if (isArray(val)) {
            res = val.reduce((res, val) => {
                return res += iterator(val, void 0, level + 1, true);
            }, '');

            return format2String(res, key, level, ['[', ']']);
        }

        // 原始值情况
        // 这里字符串要特殊处理下，要为其加上引号
        if (isString(val)) {
            val = `"${val}"`;
        }

        return format2String(val, key, level);
    }

    // 检查是否为要忽略的值，即undefined和function
    function isIgnoreVal(val) {
        return val === undefined || isFunction(val);
    }

    /**
     * 处理过滤器
     * @param {any} val 键值
     * @param {String} key 键名
     * @param {Boolean} inArray 是否为数组元素(第一层)
     * 拥有两种形式的过滤器，数组和回调函数
     * 1. 数组形式时，不对数组中的第一层元素进行过滤
     * 2. 函数形式时，返回值将作为该字段继续遍历的基础
     */
    function handleFilter(val, key, inArray) {

        // function 和 undefined直接忽视
        if (isIgnoreVal(val)) {
            return void 0;
        }

        // 这里的过滤器比较特殊

        // 处理过滤器
        if (filter) {

            // 处理数组类型的过滤器
            if (isArray(filter)) {

                // 不处理数组
                if (inArray) return val;
                return filter.indexOf(key) === -1 ? void 0 : val;
            }

            // 处理回调函数类型的过滤器
            if (isFunction(filter)) {

                // 这里和我们平时的顺序不一样
                return filter(key, val);
            }
        }

        // 原始值直接返回
        return val;
    }

    /**
     * 处理格式缩进，同样是两种情况
     * @param {String} result 键值对结果
     * @param {Number} level 当前对象嵌套的深度
     * @param {Array} bracket 对象或数组的左右括号
     * 1. 字符串情况：用给定字符串*深度填充
     * 2. 数字情况：用给定数字\*空格个数\*深度进行填充
     */
    function handleIndentation(result, level, bracket) {
        if (isNumber(indentation)) {

            // 处理对象的情况，要为其反括号缩进
            if (bracket) {
                result = result + ' '.repeat(level * indentation);
            } else {
                result = ' '.repeat(level * indentation) + result;
            }
        }

        if (isString(indentation)) {
            if (bracket) {
                result = result + indentation.repeat(level);
            } else {
                result = indentation.repeat(level) + result;
            }
        }

        // 不是对象的情况，只需要在最后换行就可以，即 a: 1,\n
        if (!bracket) {
            result += '\n';

            // 当为对象时，需要为前括号换行，即 {\n }
        } else {
            result = '\n' + result;
        }

        return result;
    }

    /**
     *
     * @param {any} val 当前处理的值，可以为任何值
     * @param {String, undefined} key 当前处理值的键名，数组时无键名
     * @param {Number} level 当前对象嵌套的深度
     * @param {Array} bracket 对象或数组的左右括号
     *
     * 将给定键值对象转换为格式后的字符串，如name: "jojo",则转换为
     * ("name": "jojo",)，会根据上下文环境判断是否添加最后的(,)号
     */
    function format2String(val, key, level, bracket) {
        if (val === undefined) return '';

        let result = '';

        if (bracket) {

            // 这里防止这种情况：{1,2,3,4,}
            // 因为每个通过format2String的原始值都为x,的形式
            if (val.slice(-1) === ',') {
                val = val.slice(0, -1);

                // 这里是格式化时，最后一个位置会添加一个换行符\n，所以, 在倒数第二个位置
            } else if (indentation && val.slice(-2, -1) === ',') {

                // 这里最简单的方法就是连同(,\n)一起删掉然后在添加
                val = val.slice(0, -2) + '\n';
            }

            // 这里必须要单独做一次处理
            if (indentation) {
                val = handleIndentation(val, level, true);
            }

            val = bracket[0] + val + bracket[1];
        }



        if (indentation) {

            // 处理数组和对象的原始值(这里单独写出来是：后的缩进)
            if (level === 0) {
                result = key ? `"${key}": ${val}` : `${val}`;
            } else {
                result = key ? `"${key}": ${val},` : `${val},`;
            }

            result = handleIndentation(result, level, false);
        } else {
            // 处理数组和对象的原始值

            if (level === 0) {
                result = key ? `"${key}":${val}` : `${val}`;
            } else {
                result = key ? `"${key}":${val},` : `${val},`;
            }
        }

        return result;
    }
}

stringify({
    a: [1, 2, {
        b: {
            c: [5, 6, 7]
        }
    }]
}, null, 4);