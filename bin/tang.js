#! /usr/bin/env node

const { program } = require('commander')
const pkg = require('../package.json')
const chalk = require('chalk')
// 创建相关
program
  .command('create <app-name>')
  .description('Create a new project')
  .option('-f, --force', 'If the target file exists, force it to be overwritten')
  .action((appName, options) => {
    require('../lib/create')(appName, options)
  })

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

// --help  对命令的help
program
  .on('--help', () => {
    console.log()
    console.log(`Run ${chalk.cyan('tang <command> --help')} for detailed usage of given command`)
    console.log()
  })

// 版本
program
  .version(`tang-cli@${pkg.version}`)
  .usage(`<command> [option]`)

program.parse(process.argv)
