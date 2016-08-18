require("should");

describe('路由解析', function() {
  const routeParser  = require('../lib/routeParser');

  it('带参数 "/user/{name}"', function() {
    const route = '/user/{name}';
    const result = routeParser(route);

    result.should.eql([
      '/user/',
      { varName: 'name', regexPart: '[^/]+' }
    ]);
  });

  it('带参数并类型约束 "/user/{id:int}"', function() {
    const route = '/user/{id:int}';
    const result = routeParser(route);

    result.should.eql([
      '/user/',
      { varName: 'id', regexPart: '\\d+' }
    ]);
  });

  it('带参数并正则约束 "/user/{id:\\d+}"', function() {
    const route = '/user/{id:\\d+}';
    const result = routeParser(route);

    result.should.eql([
      '/user/',
      { varName: 'id', regexPart: '\\d+' }
    ]);
  });

  it('两个参数混合 /user/{name}/{id:\\d+}', function() {
    const route = '/user/{name}/{id:\\d+}';
    const result = routeParser(route);

    result.should.eql([
      '/user/',
      { varName: 'name', regexPart: '[^/]+' },
      '/',
      { varName: 'id', regexPart: '\\d+' }
    ]);
  });
});

describe('路由数据编译', function() {
  const routeDataBuild  = require('../lib/routeDataBuild');

  it('组合正则表达式并提取变量', function() {
    const routeData = [
      '/user/',
      { varName: 'name', regexPart: '[^/]+' },
      '/',
      { varName: 'id', regexPart: '\\d+' }
    ];
    const result = routeDataBuild(routeData);

    result.should.eql({
      regex: '/user/([^/]+)/(\\d+)',
      variables: [
        'name',
        'id'
      ]
    });
  });
});

describe('完整测试', function() {
  const FastRoute  = require('../lib/route');

  const route = new FastRoute;

  route.addRoute('GET', '/post', 'Post.Index');
  route.addRoute('POST', '/post', 'Post.Store');
  route.addRoute('GET', '/post/{id:int}', 'Post.Show');
  route.addRoute('PUT', '/post/{id:int}', 'Post.Update');
  route.addRoute('DELETE', '/post/{id:int}', 'Post.Destroy');

  const result = route.dispatch('GET', '/post/123');

  it('路由处理结果正确', function() {
    const handler = result.handler;
    handler.should.eql('Post.Show');
  });

  it('路由参数变量正确', function() {
    const variables = result.variables;
    variables.should.eql({
      id: '123'
    });
  });
});
