# fast-route
这是一个基于正则表达式实现的快速URL路由类。
和 PHP 中知名快速路由类 [nikic/fast-route](https://github.com/nikic/FastRoute) 的原理一致。  
通过把多条路由的正则表达式合并后在进行正则判断，以获得更好的性能。

## 安装
```
npm install fast-route --save
// or
yarn add fast-route
```

## 示例
```
const FastRoute = require('fast-route');  // ES6 import FastRoute from 'fast-route';
const route = new FastRoute;

route.addRoute('GET', '/post', 'Post.Index');
route.addRoute('POST', '/post', 'Post.Store');
route.addRoute('GET', '/post/{id:int}', 'Post.Show');
route.addRoute('PUT', '/post/{id:int}', 'Post.Update');
route.addRoute('DELETE', '/post/{id:int}', 'Post.Destroy');

const result = route.dispatch('GET', '/post/123');

console.log(result);  // { handler: 'Post.Show', params: { id: '123' } }
```

## 参数类型
目前支持 `int` 和 `string` 这两种参数类型约束。如需其他类型可以在路由中直接写正则表达式。