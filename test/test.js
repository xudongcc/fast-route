require("should");

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
