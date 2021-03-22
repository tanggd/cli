#! /usr/bin/env node

const { program } = require('commander')
const pkg = require('../package.json')

program
  .version(`tang-cli@${pkg.version}`)
  .usage(`<command> [option]`)

// 解析命令传入的参数
// 如 tang create vuedemo
// 命令tang后面的便是参数了 
program.parse(process.argv)