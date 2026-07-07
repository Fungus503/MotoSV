const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')
const fs = require('fs')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.disableHierarchicalLookup = true
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-router/entry') {
    const entryFile = path.resolve(workspaceRoot, 'node_modules', 'expo-router', 'entry.js')
    if (fs.existsSync(entryFile)) {
      return { filePath: entryFile, type: 'sourceFile' }
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
