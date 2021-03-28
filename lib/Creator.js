const downloadGitRepo = require('download-git-repo')
const path = require('path')
const axios = require('axios')
const inquirer = require('inquirer')
const {loading} = require('./utils')
const util = require('util')

class Creator {
  constructor(appName, targetDir) {
    this.appName = appName
    this.targetDir = targetDir
    // downloadGitRepo不支持async/await,需要转换
    this.downloadGitRepo = util.promisify(downloadGitRepo)
  }

  async create() {
    // 获取到自己github上的template
    const templateName= await this.getTemplate()
    // console.log(templateName)
    // 获取分支选择
    const brancheName = await this.getTemplateBranche(templateName)
    // console.log(brancheName)
    // 下载
    await this.downloadTemplate(templateName, brancheName)
    // TODO 模板里的模板语法处理
    // 。。。。。。。。。。。
  }

  async getTemplateRepos() {
    // 获取到自己github上的template
    // TODO 通过配置文件 1其他仓库 2个人或组织 3xxxx
    const res = await axios.get('https://api.github.com/users/tanggd/repos')
    // 以-template结束的都被认为是模板
    const templates = res.data.filter(item => item.name.endsWith('-template'))
    return templates
  }

  async getTemplate() {
    const templates = await loading(this.getTemplateRepos, {
      start: '正在拉取模板中...',
      succeed: '拉取模板成功',
      fail: '拉取模板失败'
    })
    if (!templates) {
      return console.log('没有模板数据')
    }
    const templateNames = templates.map(item => item.name)
    console.log()
    const { action } = await inquirer.prompt([
      {
        name: 'action', 
        type: 'list', 
        message: '请选择你需要的模板',
        choices: templateNames
      }
    ])
    return action
  }

  async getTemplateBranche(templateName) {
    const getTempBranches = async () => {
      const res = await axios.get(`https://api.github.com/repos/tanggd/${templateName}/branches`)
      return res.data
    }
    const branches = await loading(getTempBranches, {
      start: '正在拉取模板分支数据...',
      succeed: '拉取模板分支成功',
      fail: '拉取模板分支失败'
    })
    if (!branches) {
      return console.log('没有模板数据')
    }
    const brancheNames = branches.map(item => item.name)
    console.log()
    const { action } = await inquirer.prompt([
      {
        name: 'action', 
        type: 'list', 
        message: '请选择你需要的模板分支',
        choices: brancheNames
      }
    ])
    return action
  }

  async downloadTemplate(templateName, brancheName) {
    // 下载代码
    // TODO 下载后缓存在本地  
    // 思路：记录提交时间，可以判断缓存是否是最新的
    // downloadGitRepo时，先下载到本地，并记录提交时间和分支
    // 然后复制一份到当前目标目录
    const downloadGitRepo = async () => {
      return await this.downloadGitRepo(`tanggd/${templateName}#${brancheName}`, this.targetDir)
    }
    loading(downloadGitRepo, {
      start: '正在下载模板...',
      succeed: '下载模板成功',
      fail: '下载模板失败'
    })
  }
}

module.exports = Creator