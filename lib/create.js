
const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const chalk = require('chalk')
const Creator = require('./Creator')

async function create(appName, options) {
  // console.log(appName, options)
  // 获取命令执行时的工作目录
  const cwd = process.cwd()
  const targetDir = path.resolve(cwd, appName)
  // console.log(targetDir)

  // 判断目标目录是否存在
  if (fs.existsSync(targetDir)) {
    // 存在时
    if (options.force) {
      // 有force参数时，强行删除目标目录
      await fs.remove(targetDir)
    } else {
      // 没有force参数时，提示用户是否要覆盖目录
      // 使用inquirer配置询问
      const { action } = await inquirer.prompt([
        { 
          name: 'action', 
          type: 'list', 
          message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
          // 选择：覆盖、取消
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: false }
          ]
        }
      ])
      // console.log(action)
      if (!action) {
        return
      } else if (action === 'overwrite') {
        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
        await fs.remove(targetDir)
      }
    }
  }

  // 创建
  const creator = new Creator(appName, targetDir)
  creator.create()

}

module.exports = (appName, options) => {
  return create(appName, options)
}