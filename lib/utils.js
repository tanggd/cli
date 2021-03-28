const ora = require("ora");
const inquirer = require("inquirer");

async function loading(fn, message) {
  const loader = ora();
  // 开启
  loader.start(message.start);
  try {
    const res = await fn();
    // 成功
    loader.succeed(message.succeed);
    return res;
  } catch (error) {
    console.error(error)
    loader.fail(message.fail);
    console.log()
    const { action } = await inquirer.prompt([
      {
        name: "action",
        type: "confirm",
        message: "是否继续",
      },
    ]);

    if (action) {
      // 重新执行
      return loading(fn, message)
    } else {
      // 结束程序
      process.exit(0)
    }
  }
}

module.exports = {
  loading,
};
