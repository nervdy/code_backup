// link：https://www.v2ex.com/t/509253#reply21
// 挑战目标：获取 key 的值
(function () {
  // 一个内部变量，外部无法获取
  var key = Math.random()

  console.log('[test] key:', key)

  // 一个内部函数
  function internal(x) {
    return x
  }

  // 对外暴露的函数
  apiX = function (x) {
    try {
      return internal(x)
    } catch (err) {
      return key
    }
  }
})()

// 你的代码写在此处：
// ...

function d() {
  try {
    return d()
  } catch (e) {
    return apiX()
  }
}

console.log(d());