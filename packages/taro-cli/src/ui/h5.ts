import { Compiler } from '../h5'
import chalk from 'chalk'
import * as path from 'path'
import * as fs from 'fs-extra'
import wxTransformer from '@tarojs/transformer-wx'

import * as npmProcess from '../util/npm'
import { printLog, resolveScriptPath } from '../util'
import { processTypeEnum, REG_TYPESCRIPT } from '../util/constants'
import { IBuildData, IH5BuildConfig } from './ui.types'
import { copyFileToDist, analyzeFiles, parseEntryAst, analyzeStyleFilesImport, H5_OUTPUT_NAME } from './common'

async function buildForH5 (uiIndex = 'index', buildData: IBuildData) {
  const { appPath } = buildData
  const compiler = new Compiler(appPath, uiIndex)
  console.log()
  console.log(chalk.green('开始编译 H5 端组件库！'))
  await (compiler as any).buildTemp()
  if (process.env.TARO_BUILD_TYPE === 'script') {
    await buildH5Script(buildData)
  } else {
    await buildH5Lib(uiIndex, buildData)
  }
}

async function buildH5Script (buildData: IBuildData) {
  const { appPath, projectConfig, entryFileName, sourceDirName, tempPath } = buildData
  let { outputDirName } = buildData
  const h5Config: IH5BuildConfig = Object.assign({}, projectConfig.h5)
  const entryFile = path.basename(entryFileName, path.extname(entryFileName)) + '.js'
  outputDirName = `${outputDirName}/${H5_OUTPUT_NAME}`
  h5Config.env = projectConfig.env
  h5Config.defineConstants = projectConfig.defineConstants
  h5Config.plugins = projectConfig.plugins
  h5Config.designWidth = projectConfig.designWidth
  if (projectConfig.deviceRatio) {
    h5Config.deviceRatio = projectConfig.deviceRatio
  }
  h5Config.sourceRoot = sourceDirName
  h5Config.outputRoot = outputDirName
  h5Config.entry = Object.assign({
    app: [path.join(tempPath, entryFile)]
  }, h5Config.entry)
  h5Config.isWatch = false
  const webpackRunner = await npmProcess.getNpmPkg('@tarojs/webpack-runner', appPath)
  webpackRunner(appPath, h5Config)
}

async function buildH5Lib (uiIndex, buildData: IBuildData) {
  try {
    const { appPath, outputDirName, tempPath } = buildData
    const outputDir = path.join(appPath, outputDirName, H5_OUTPUT_NAME)
    const tempEntryFilePath = resolveScriptPath(path.join(tempPath, uiIndex))
    const outputEntryFilePath = path.join(outputDir, path.basename(tempEntryFilePath))
    const code = fs.readFileSync(tempEntryFilePath).toString()
    const transformResult = wxTransformer({
      code,
      sourcePath: tempEntryFilePath,
      isNormal: true,
      isTyped: REG_TYPESCRIPT.test(tempEntryFilePath)
    })
    const { styleFiles, components, code: generateCode } = parseEntryAst(transformResult.ast, tempEntryFilePath)
    const relativePath = path.relative(appPath, tempEntryFilePath)
    printLog(processTypeEnum.COPY, '发现文件', relativePath)
    fs.ensureDirSync(path.dirname(outputEntryFilePath))
    fs.writeFileSync(outputEntryFilePath, generateCode)
    if (components.length) {
      components.forEach(item => {
        copyFileToDist(item.path as string, tempPath, outputDir, buildData)
      })
      analyzeFiles(components.map(item => item.path as string), tempPath, outputDir, buildData)
    }
    if (styleFiles.length) {
      styleFiles.forEach(item => {
        copyFileToDist(item, tempPath, path.join(appPath, outputDirName), buildData)
      })
      analyzeStyleFilesImport(styleFiles, tempPath, path.join(appPath, outputDirName), buildData)
    }
  } catch (err) {
    console.log(err)
  }
}

export { buildForH5, buildH5Lib, buildH5Script }
