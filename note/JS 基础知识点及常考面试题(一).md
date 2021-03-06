# 原始（Primitive）类型

```js
boolean
null
undefined
number
string
symbol
```
> typeof **null** 会输出 **object**

# 引用类型

```js
function test(person) {
  person.age = 26
  person = {
    name: 'yyy',
    age: 30
  }

  return person
}
const p1 = {
  name: 'yck',
  age: 25
}
const p2 = test(p1)
console.log(p1.age)  // -> 26
console.log(p2.age)  // -> 30
```

# typeof vs instanceof

**typeof** 对于原始类型来说，除了 **null** 都可以显示正确的类型

```js
typeof 1  // 'number'
typeof '1'  // 'string'
typeof undefined  // 'undefined'
typeof true  // 'boolean'
typeof Symbol()  // 'symbol'
```

**typeof** 对于对象来说，除了函数都会显示 **object**

```js
typeof []  // 'object'
typeof {}  // 'object'
typeof console.log  // 'function'
```

如果我们想判断一个对象的正确类型，这时候可以考虑使用 **instanceof**，因为内部机制是通过原型链来判断的

```js
const Person = function() {}
const p1 = new Person()
p1 instanceof Person  // true

var str = 'hello world'
str instanceof String  // false

var str1 = new String('hello world')
str1 instanceof String  // true
```

对于原始类型来说，你想直接通过 **instanceof** 来判断类型是不行的，当然我们还是有办法让 **instanceof** 判断原始类型的

```js
class PrimitiveString {
  static [Symbol.hasInstance](x) {
    return typeof x === 'string'
  }
}
console.log('hello world' instanceof PrimitiveString)  // true
```
> [Symbol.hasInstance](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance)

# 类型转换

在 JS 中类型转换只有三种情况，分别是：

- 转换为布尔值
- 转换为数字
- 转换为字符串

![](https://user-gold-cdn.xitu.io/2018/11/15/16716dec14421e47?imageslim)

## 转Boolean

**undefined**、**null**、**false**、**NaN**、**""**、**0**、**-0** 转换为 **false**

其余所有情况，包括对象，转换为 **true**

## 对象转原始类型

对象在转换类型的时候，会调用内置的 **[[ToPrimitive]]** 函数

- 如果已经是原始类型，则不需要转换
- 调用 x.valueOf()，如果转换为基础类型，则返回转换的值
- 调用 x.toString()，如果转换为基础类型，则返回转换的值
- 如果都没有返回原始类型，就会报错

也可以重写 Symbol.toPrimitive ，该方法在转原始类型时调用优先级最高

```js
let a = {
  valueOf() {
    return 0
  },
  toString() {
    return '1'
  },
  [Symbol.toPrimitive]() {
    return 2
  }
}
1 + a  // => 3
```

## 四则运算

加法运算特点：  

- 运算中有字符串时，其他值也会被转换成字符串
- 运算中有不是字符串或者数字的值时，这些值会被转换成字符串或者数字

```js
1 + '1'  // '11'
true + true  // 2
4 + [1,2,3]  // '41,2,3'
```

```js
// 一元运算符操作字符串时会转换成数值
'a' + + 'b'  // 'aNaN'
// 等同于
'a' + (+'b')
// 解析：第一个加号是算数运算符，第二个加号是字符串'b'的一元运算符
```

> 输入 `'a' + + 'b'` 查看解析后的AST Tree  
> 参考：[astexplorer](https://astexplorer.net/)  
> 可以使用 `+'1'` 的形式来快速获取 `Number` 类型

除加法运算外的其他运算，只要其中一方是数字，另一方就会被转为数字

```js
4 * '3'  // 12
4 * []  // 0
4 * [1,2]  // NaN
```

## 比较运算符

- 对象通过 **toPrimitive** 转换后比较
- 字符串通过 **unicode** 字符索引比较

```js
let a = {
  valueOf() {
    return 0
  },
  toString() {
    return '1'
  }
}

a > -1  // true
a == 0  // true

//  因为 a 是对象，所以会通过 valueOf 转换为原始类型再比较值
```

# this

```js
function foo() {
  console.log(this.a)
}
var a = 1
foo()  // 1

const obj = {
  a: 2,
  foo: foo
}
obj.foo()  // 2

const c = new foo()  // undefined
```

## 箭头函数

- 函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象。

- 不可以当作构造函数，也就是说，不可以使用new命令，否则会抛出一个错误。

- 不可以使用arguments对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替。

- 不可以使用yield命令，因此箭头函数不能用作 Generator 函数。

```js
function foo() {
  return () => {
    return () => {
      console.log(this)
    }
  }
}
console.log(foo()()())  // Window
```

将上述代码中的函数 **foo** 输入到 [babel转换器](https://babeljs.io/repl) 中查看转换成 **ES5** 的代码

```js
function foo() {
  var _this = this;

  return function () {
    return function () {
      console.log(_this);
    };
  };
}
```

箭头函数自身并没有 **this** ，实际执行时引用的是外部作用域的 **this** 。  
因为箭头函数自身没有 **this** ，所以既无法作为构造函数也无法使用 **bind** 、**apply** 、**call** 等函数绑定 **this** 。

对一个函数进行多次 **bind** 绑定之后 **this** 的指向是什么

```js
let a = {}
let fn = function () { console.log(this) }
fn.bind().bind(a)() // => window
```

**bind** 实际上相当于对原函数进行了一层包装，对 **bind** 返回的包装函数继续调用 **bind** 时，改变的是包装函数的 **this** 指向，而不是原始函数的 **this** 指向。  
参考 [Function.prototype.bind Polyfill](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility)

**this** 的优先级： **new** > **bind** > **obj.foo()** > **foo()**  
同时，箭头函数的 **this** 一旦被绑定，就不会再被任何方式所改变。

![](https://user-gold-cdn.xitu.io/2018/11/15/16717eaf3383aae8?imageslim)
