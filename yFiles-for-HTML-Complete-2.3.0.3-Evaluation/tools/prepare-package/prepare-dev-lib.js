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
const runNpm = require('./runNpm')

const packageRoot = path.join(__dirname, '../..')
const typeInfoDefaultPath = path.join(__dirname, 'yfiles-typeinfo.js')
const typeInfoDebugPath = path.join(__dirname, 'lang-debug.js')
const devLibSuffix = '-dev'

/**
 * @param {string} libBasePath
 * @param {string} libName
 * @param {boolean} force
 */
function prepareDevLib(libBasePath, libName, force = false) {
  if (!fs.existsSync(libBasePath)) {
    return
  }

  const libPath = path.join(libBasePath, libName)
  const libDevPath = path.join(libBasePath + devLibSuffix, libName)

  if (!force && fs.existsSync(libDevPath) && samePackageVersion(libPath, libDevPath)) {
    return
  }

  console.log(`Preparing development mode library in ${libDevPath}...`)

  fs.emptyDirSync(libDevPath)
  fs.copySync(libPath, libDevPath, {
    filter(src) {
      return !src.endsWith('.tgz')
    }
  })
  adjustPackageJson(path.join(libDevPath, 'package.json'))
  createTypeinfoLang(
    path.join(libDevPath, 'impl', 'lang.js'),
    libName === 'umd',
    libBasePath.endsWith('.debug')
  )
}

/**
 * @param {string} packageJsonPath
 */
function adjustPackageJson(packageJsonPath) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  packageJson.version += devLibSuffix
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8')
}

/**
 * @param {string} libPath
 * @return {string|null}
 */
function getPackageVersion(libPath) {
  const packageFilePath = path.join(libPath, 'package.json')
  return fs.existsSync(packageFilePath)
    ? JSON.parse(fs.readFileSync(packageFilePath, 'utf8')).version
    : null
}

/**
 * @param {string} libPath
 * @param {string} devLibPath
 * @return {boolean}
 */
function samePackageVersion(libPath, devLibPath) {
  const devLibVersion = getPackageVersion(devLibPath)
  return devLibVersion != null && devLibVersion === getPackageVersion(libPath) + devLibSuffix
}

/**
 * @param {string} langPath
 * @param {boolean} isUmd
 * @param {boolean} isDebug
 */
function createTypeinfoLang(langPath, isUmd, isDebug) {
  let langContent = fs.readFileSync(langPath, 'utf8').trim()
  const wrapperFile = path.join(__dirname, 'wrappers', isUmd ? 'umd-wrapper.js' : 'esm-wrapper.js')
  const wrapperContent = fs.readFileSync(wrapperFile, 'utf8')

  const typeinfoPath = isDebug ? typeInfoDebugPath : typeInfoDefaultPath
  const typeinfoContent = fs.readFileSync(typeinfoPath, 'utf8').trim()

  if (!isUmd) {
    langContent = langContent.replace(/export\s+default\s+lang;?/, '')
  }
  const result = processWrapper(wrapperContent, {
    typeinfoContent,
    langContent
  })

  fs.writeFileSync(langPath, result.trim(), 'utf8')
}

/**
 * @param {string} wrapperContent
 * @param {string} context
 * @return {string}
 */
function processWrapper(wrapperContent, context) {
  return wrapperContent.replace(/\/\/ \${([^}]+)}/g, (match, varName) => {
    if (!(varName in context)) {
      throw new Error(`${varName} could not be found in supplied context.`)
    }
    return context[varName]
  })
}

/**
 * @param {string} basePath
 */
function maybeCopyLicense(basePath) {
  const devBasePath = basePath + devLibSuffix

  const licenseJsonPath = path.join(basePath, 'license.json')
  const licenseJsonDevPath = path.join(devBasePath, 'license.json')
  if (fs.existsSync(licenseJsonPath) && !fs.existsSync(licenseJsonDevPath)) {
    fs.copySync(licenseJsonPath, licenseJsonDevPath)
  }
}

exports.prepareDevLib = prepareDevLib
exports.maybeCopyLicense = maybeCopyLicense
exports.devLibSuffix = devLibSuffix
