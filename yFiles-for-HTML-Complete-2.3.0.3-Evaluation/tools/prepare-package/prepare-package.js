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
const fs = require('fs-extra')
const path = require('path')
const { prepareDevLib, maybeCopyLicense, devLibSuffix } = require('./prepare-dev-lib')
const runNpm = require('./runNpm')

const packageRoot = path.join(__dirname, '..', '..')
const force = process.argv.includes('--force')

for (const libBasePath of [path.join(packageRoot, 'lib'), path.join(packageRoot, 'lib.debug')]) {
  for (const libName of ['es-modules', 'umd']) {
    prepareDevLib(libBasePath, libName, force)
    packLib(libBasePath, libName, force)
    packLib(libBasePath + devLibSuffix, libName, force)
  }

  maybeCopyLicense(libBasePath)
}

function packLib(libBasePath, libName, force) {
  const libPath = path.join(libBasePath, libName)
  if (!fs.existsSync(libPath) || !fs.existsSync(path.join(libPath, 'package.json'))) {
    return
  }
  const packageJson = require(path.join(libPath, 'package.json'))
  const packedName = `${packageJson.name}-${packageJson.version}.tgz`
  if (!force && fs.existsSync(path.join(libPath, packedName))) {
    return
  }

  const libType = path.basename(libBasePath)
  process.stdout.write(`Running npm pack for ${libType}/${libName}... `)
  runNpm(libPath, ['pack', '--quiet'])
}
