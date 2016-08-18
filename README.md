# fast-route
这是一个基于正则表达式实现的快速URL路由类。
和 PHP 中知名快速路由类 [nikic/fast-route](https://github.com/nikic/FastRoute) 的原理一致。  
通过把多条路由的正则表达式合并后在进行正则判断，以获得更好的性能。

## 安装
```
npm install fast-route --save
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

console.log(result);  // { handler: 'Post.Show', variables: { id: '123' } }
```
