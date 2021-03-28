# cli
我的前端cli

市面上优秀的脚手架：vue-cli、create-react-app、dva-cli...

实现要点：

- 交互式命令行
- 可插拔的插件系统

必备模块：

- commander：参数解析
- inquirer：交互式命令行工具
- download-git-repo：在git中下载模板
- metalsmith：

## 新建命令

1. 建bin目录，在该目录下建可执行文件tang，并在文件中写如下脚本：

```javascript
#! /usr/bin/env node
```

这行代码表示：用本机系统的node环境执行该文件

在这行代码下增加测试代码

```javascript
#! /usr/bin/env node

console.log('tang-cli')
```

2. 在package.json 配置bin选项

```json
{
  "name": "tang-cli",
  "version": "1.0.0",
  "description": "cli",
  "bin": "./bin/tang",
  "scripts": {}
}
```

表示执行命令要执行的文件是哪个。

3. 链接到全局

此时，我们的命令还是无法执行的，还需要把这个命令链接到全局下。就如 vue creat xxx一样，vue命令已经被我们安装到了全局包中。

```bash
npm link
# 若已经有该命令，可以使用下面代码强制覆盖
npm link --force
```

执行完命令后，全局就产生了一个包，名字叫tang-cli，和我package.json中的name一致。这个tang-cli包链接到了我现在开发的本地包，此时在cmd中执行 tang-cli，便可以执行本地文件/bin/tang这个可执行文件。执行后便可打印出tang-cli字符串。

另外，我们也可以在package.json中把bin选项配置成对象，为命令取别名

```json
// package.json
{
  "name": "tang-cli",
  "version": "1.0.0",
  "description": "cli",
  "bin": {
    "tang1": "./bin/tang",
    "tang2": "./bin/tang"
  },
  "scripts": {}
}
```

三个命令tang-cli、tang1和tang2都是执行的同一个命令文件，效果一样。

vue-cli全局安装后，我们会发现cli包统一在@vue文件夹下，或者在你的node_modules中也发现了vue官方包，都是安装在@vue目录下的。参考[vue-cli的package.json](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli/package.json)

我也希望像vue一样，把自己的cli包都放在@tang目录下，方便管理@tang系列的包。

修改package.json

```json
{
  "name": "@tang/cli",
  "version": "1.0.0",
  "description": "cli",
  "bin": {
    "tang": "./bin/tang"
  },
  "scripts": {}
}
```

然后cmd中执行npm link，即可达到我们的目的。

特别注意，@tang/cli不会被link为命令，而是tang-cli被link为命令了。

若是这样配置的package.json

```json
{
  "name": "@tang/cli",
  "version": "1.0.0",
  "description": "cli",
  "bin": "./bin/tang",
  "scripts": {}
}
```

npm link后，则生成的命令是cli，@tang/cli不会被link为命令。

对于我们前面已经安装的，已经没有用处的命令，怎么删除呢？

```bash
npm unlink tang-cli
```

npm unlink发现删除不了，不知道为什么，TODO待解决，或者手动去全局包里删除。

## 命令行交互

vue create [projectName] 会出现很多交互式的操作，接下来我们也实现这个交互式的操作。

思路分析：

1. 配置可执行命令
2. 命令交互
3. 下载模板
4. 根据用户选择动态生成内容

### 配置可执行命令

使用[commander](https://github.com/tj/commander.js)包实现配置可执行命令。

安装包：

```bash
npm install commander
```

在tang.js中写入代码

```javascript
#! /usr/bin/env node

const { program } = require('commander')

// 解析命令传入的参数
// 如 tang create vuedemo
// 命令tang后面的便是参数了 
program.parse(process.argv)
```

此时我们输入命令：tang --help 便可以看见

```bash
$ tang --help
Usage: tang [options]

Options:
  -h, --help  display help for command
```

是不是似曾相识的感觉？

### 配置版本查看

```javascript
#! /usr/bin/env node

const { program } = require('commander')
const pkg = require('../package.json')

program
  .version(`tang-cli@${pkg.version}`)
  .usage(`<command> [option]`)

program.parse(process.argv)
```

此时我们输入命令：tang -V

```bash
$ tang -V
tang-cli@1.0.0
```

### 配置创建项目

```javascript
#! /usr/bin/env node

const { program } = require('commander')
const pkg = require('../package.json')

// 配置创建项目 tang create app
program
  // 表示tang命令后的第一个参数是create时，会走这里的逻辑
  .command('create <app-name>')
  // 命令描述
  .description('Create a new project')
  // 配置选项，配置tang create app后面的参数，
  // option第一个参数是字符串，(其中逗号是简写、逗号后是全写)
  .option('-f, --force', 'If the target file exists, force it to be overwritten')
  .action((name, option) => {
    // 在此处写命令的逻辑
    console.log(name, option)
    // name 就是 <app-name>； option 是个对象
    // 若是 tang create app，则是打印 app {}
    // 若是 tang create --force，则是打印 app {force: true}
    // 若是 tang create -f，则是打印 app {force: true}
  })


program
  .version(`tang-cli@${pkg.version}`)
  .usage(`<command> [option]`)

program.parse(process.argv)
```

执行命令

```bash
$ tang create app
app {}

$ tang create app --force
app { force: true }

$ tang create app -f
app { force: true }
```



### 配置config

```javascript
// 配置文件相关，查看、设置、删除
program
  .command('config [value]')
  .description('inspect and modify the config')
  .option('-g, --get <path>', 'get value from option')
  .option('-s, --set <path> <value>', 'set option value')
  .option('-d, --delete <path>', 'delete option from config')
  .option('-e, --edit', 'open config with default editor')
  .option('--json', 'outputs JSON result only')
  .action((value, options) => {
    console.log(value, options)
  })
```

执行命令

```bash
$ tang config --set name xiaotang
xiaotang { set: 'name' }

$ tang config --get name
undefined { get: 'name' }

$ tang config --delete name
undefined { delete: 'name' }
```

基本上就是需要什么命令就配置什么命令

### 配置--help

```javascript
// --help  对命令的help
program
  .on('--help', () => {
    console.log()
    console.log('Run tang <command> --help for detailed usage of given command')
    console.log()
  })
```

执行命令

```bash
$ tang create --help
Usage: tang create [options] <app-name>

Create a new project

Options:
  -f, --force  If the target file exists, force it to be overwritten
  -h, --help   display help for command


$ tang config --help
Usage: tang config [options] [value]

View config, or modify config, or set config

Options:
  -g, --get <key>          Get key value
  -s, --set <key> <value>  Set key value
  -d, --delete <key>       Delete key value
  -h, --help               display help for command
```





## 提示着色

安装chalk

```bash
npm install chalk
```

使用

```javascript
const chalk = require('chalk')
console.log(`Run ${chalk.cyan('tang <command> --help')} for detailed usage of given command`)
```

更多[chalk](https://github.com/chalk/chalk)相关的颜色方法查看其github文档。



## 参考资料

- [commander](https://github.com/tj/commander.js)
- [chalk](https://github.com/chalk/chalk)
- fs-extra
- [inquirer](https://github.com/SBoudrias/Inquirer.js)
- 

## TODO

- [ ] 本地缓存模板，删除模板
- [ ] config
- [ ] 模板中的模板解析
- [ ] 发布npm









