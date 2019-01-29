# merge-package-dependencies

合并不同 package.json 的依赖

- 支持 `default|union|intersection` 三种方式合并
- 支持远程package.json地址，如 `http://xxxx/package.json`
- 支持通过properties指定处理属性，默认 ['dependencies', 'devDependencies']

## usage
```js
var merge = require('merge-package-dependencies');

// package.a.json
// {a: '0.1.1', b: '1.1.2', d: '1.3.3'}
// package.b.json
// {a: '1.2.1', b: '1.0.0', c: '1.1.1'}

merge('package.a.json', 'package.b.json', ['dependencies'], 'default');
// output: {a: '1.2.1', b: '1.1.2', d: '1.3.3'}

merge('package.a.json', 'package.b.json', ['dependencies'], 'intersection');
// output: {a: '1.2.1', b: '1.1.2'}

merge('package.a.json', 'package.b.json', ['dependencies'], 'union');
// output: {a: '1.2.1', b: '1.1.2', c: '1.1.1', d: '1.3.3'}
```
