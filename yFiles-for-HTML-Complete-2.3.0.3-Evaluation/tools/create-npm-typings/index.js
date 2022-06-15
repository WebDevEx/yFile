/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.0.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
const path = require('path')
const fs = require('fs')

const createEsmNpmTypings = require('./create-esm-npm-typings')
const createUmdNpmTypings = require('./create-umd-npm-typings')

const root = path.join(__dirname, '../../')
const ideSupport = path.join(root, 'ide-support')
const es6MappingsPath = path.join(__dirname, '../common/ES6ModuleMappings.json')

const mode = process.argv[2]
if (process.argv.length < 3 || !(mode === 'webstorm' || mode === 'vscode')) {
  console.error('Usage: node index.js webstorm|vscode')
  return
}

const config = {
  esm: {
    inFiles: {
      webstorm: path.join(ideSupport, 'yfiles-api-es-modules-webstorm.d.ts'),
      vscode: path.join(ideSupport, 'yfiles-api-es-modules-vscode.d.ts')
    },
    outFileName: 'yfiles-api-npm.d.ts',
    get outFile() {
      return path.join(root, 'lib/es-modules/typings/', this.outFileName)
    },
    get nodeModulesPath() {
      return path.join(root, 'demos/node_modules/yfiles/typings', this.outFileName)
    },
    transform: createEsmNpmTypings
  },
  umd: {
    inFiles: {
      webstorm: path.join(ideSupport, 'yfiles-api-umd-webstorm.d.ts'),
      vscode: path.join(ideSupport, 'yfiles-api-umd-vscode.d.ts')
    },
    outFileName: 'yfiles-api-umd-npm.d.ts',
    get outFile() {
      return path.join(root, 'lib/umd/typings/', this.outFileName)
    },
    get nodeModulesPath() {
      return path.join(root, 'demos/node_modules/yfiles-umd/typings', this.outFileName)
    },
    transform: contents => createUmdNpmTypings(contents, es6MappingsPath)
  }
}

for (const [variant, cfg] of Object.entries(config)) {
  const inFile = cfg.inFiles[mode]
  const contents = fs.readFileSync(inFile, 'utf8')
  const transformed = cfg.transform(contents)
  console.log(`writing transformed ${variant} typings to\n  ${cfg.outFile}`)
  fs.writeFileSync(cfg.outFile, transformed)
  if (fs.existsSync(cfg.nodeModulesPath)) {
    console.log(
      `typings found in node_modules - also writing transformed typings to\n  ${cfg.nodeModulesPath}`
    )
    fs.writeFileSync(cfg.nodeModulesPath, transformed)
  }
}
