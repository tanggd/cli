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

vue create project 会出现很多交互式的操作，接下来我们也实现这个交互式的操作。

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
C:\Users\tanggd\Desktop\github\cli> tang --help
Usage: tang [options]

Options:
  -h, --help  display help for command
```



## 参考资料

- [commander](https://github.com/tj/commander.js)
- 1-23













