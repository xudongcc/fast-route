require("should");

const nRoutes = 100;
const nMatches = 30000;

describe('解析测试', function() {
  const FastRoute  = require('../lib/route');
  const route = new FastRoute;

  const routes = [
    ['GET', '/post', 'Post.Index', '/post'],
    ['POST', '/post', 'Post.Store', '/post'],
    ['GET', '/post/create', 'Post.Create', '/post/create'],
    ['GET', '/post/{id:int}', 'Post.Show', '/post/123'],
    ['PUT', '/post/{id:int}', 'Post.Update', '/post/123'],
    ['DELETE', '/post/{id:int}', 'Post.Destroy', '/post/123']
  ];

  routes.forEach((r) => {
    route.addRoute(r[0], r[1], r[2]);
  });

  it('检查结果', function() {
    routes.forEach((r) => {
      var result = route.dispatch(r[0], r[3]);
      result.handler.should.eql(r[2]);
    });
  });
});

describe('速度测试 (无变量)', function() {
  const FastRoute  = require('../lib/route');
  const route = new FastRoute;

  for (i = 0; i < nRoutes; i++) {
    route.addRoute('GET', '/'+ i, 'handler' + i);
  }

  const firstRoute = '/0';
  const lastRoute = '/' + (i - 1);
  const unknownRoute = '/unknown';

  it('第一条路由', function() {
    for (j = 0; j < nMatches; j++) {
      var result = route.dispatch('GET', firstRoute);
    }
  });

  it('最后一条路由', function() {
    for (j = 0; j < nMatches; j++) {
      var result = route.dispatch('GET', lastRoute);
    }
  });

  it('未定义路由', function() {
    for (j = 0; j < nMatches; j++) {
      var result = route.dispatch('GET', unknownRoute);
    }
  });
});

describe('速度测试 (一个变量)', function() {
  const FastRoute  = require('../lib/route');
  const route = new FastRoute;

  for (i = 0; i < nRoutes; i++) {
    route.addRoute('GET', '/'+ i + '/{arg}', 'handler' + i);
  }

  const firstRoute = '/0/foo';
  const lastRoute = '/' + (i - 1) + '/foo';
  const unknownRoute = '/unknown/foo';

  it('第一条路由', function() {
    for (j = 0; j < nMatches; j++) {
      var result = route.dispatch('GET', firstRoute);
    }
  });

  it('最后一条路由', function() {
    for (j = 0; j < nMatches; j++) {
      var result = route.dispatch('GET', lastRoute);
    }
  });

  it('未定义路由', function() {
    for (j = 0; j < nMatches; j++) {
      var result = route.dispatch('GET', unknownRoute);
    }
  });
});

describe('速度测试 (九个变量)', function() {
  const FastRoute  = require('../lib/route');
  const route = new FastRoute;

  for (i = 0; i < nRoutes; i++) {
    route.addRoute('GET', '/'+ i + '/{a}/{b}/{c}/{d}/{e}/{f}/{g}/{h}/{i}', 'handler' + i);
  }

  const firstRoute = '/0/a/b/c/d/e/f/g/h/i';
  const lastRoute = '/' + (i - 1) + '/a/b/c/d/e/f/g/h/i';
  const unknownRoute = '/unknown/a/b/c/d/e/f/g/h/i';

  it('第一条路由', function() {
    for (j = 0; j < nMatches; j++) {
      var result = route.dispatch('GET', firstRoute);
    }
  });

  it('最后一条路由', function() {
    for (j = 0; j < nMatches; j++) {
      var result = route.dispatch('GET', lastRoute);
    }
  });

  it('未定义路由', function() {
    for (j = 0; j < nMatches; j++) {
      var result = route.dispatch('GET', unknownRoute);
    }
  });
});
