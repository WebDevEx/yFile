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
const ts = require('typescript')

function getEs6NameDiffMap(es6Mappings) {
  const result = {}
  for (const implMap of Object.values(es6Mappings)) {
    for (const nameMap of Object.values(implMap)) {
      for (const [fqn, es6Name] of Object.entries(nameMap)) {
        const es5Name = fqn.split('.').pop()
        if (es5Name !== es6Name) {
          result[fqn] = es6Name
        }
      }
    }
  }
  return result
}

module.exports = function createFlatUmdTypings(source, es6MappingsFile) {
  const es6NameMap = getEs6NameDiffMap(require(path.resolve(es6MappingsFile)))

  function getEs6Name(fqn) {
    return Object.prototype.hasOwnProperty.call(es6NameMap, fqn)
      ? es6NameMap[fqn]
      : fqn.split('.').pop()
  }

  const sourceFile = ts.createSourceFile('temp.d.ts', source, ts.ScriptTarget.Latest, true)

  const adaptTypeDeclarations = context => {
    return rootNode => {
      /**
       * @param {ts.Node} node
       */
      function visit(node) {
        node = ts.visitEachChild(node, visit, context)
        if (
          node.name &&
          (ts.isInterfaceDeclaration(node) ||
            ts.isEnumDeclaration(node) ||
            ts.isClassLike(node) ||
            ts.isVariableDeclaration(node) ||
            (ts.isTypeAliasDeclaration(node) &&
              // type LayoutStyleStringValues = "...";
              (node.name.text.endsWith('StringValues') ||
                // type IGroupBoundsCalculatorImplementation = Pick<yfiles.IGroupBoundsCalculator, "calculateBounds">;
                node.name.text.endsWith('Implementation'))))
        ) {
          const n = ts.isVariableDeclaration(node) ? node.parent.parent : node
          if (n.parent && n.parent.parent && ts.isModuleDeclaration(n.parent.parent)) {
            const nodeName = node.name.text

            const suffix = nodeName.endsWith('StringValues')
              ? 'StringValues'
              : nodeName.endsWith('Implementation')
              ? 'Implementation'
              : ''

            const typeName = ts.isTypeAliasDeclaration(node)
              ? nodeName.replace(suffix, '')
              : nodeName
            const fqn = `yfiles.${n.parent.parent.name.text}.${typeName}`
            const mapped = getEs6Name(fqn)
            const mappedName = ts.isTypeAliasDeclaration(node) ? `${mapped}${suffix}` : mapped
            node.name = ts.createIdentifier(mappedName)
          }
        } else if (
          // create?(implementation: IPortAssignmentImplementation)
          ts.isTypeReferenceNode(node) &&
          ts.isIdentifier(node.typeName) &&
          node.typeName.text.endsWith('Implementation')
        ) {
          const fqn = getFqn(node, node.typeName.text.replace('Implementation', ''))
          const mapped = getEs6Name(fqn) + 'Implementation'
          node.typeName = ts.createIdentifier(mapped)
        } else if (
          // thing:yfiles.orthogonal.LayoutStyleStringValues
          ts.isTypeReferenceNode(node) &&
          node.typeName.left &&
          ts.isQualifiedName(node.typeName.left) &&
          node.typeName.left.left.text === 'yfiles'
        ) {
          const simpleName = node.typeName.right.text
          const isStringValues = simpleName.endsWith('StringValues')
          const fqn = `yfiles.${node.typeName.left.right.text}.${simpleName.replace(
            /StringValues$/,
            ''
          )}`
          const mapped = getEs6Name(fqn) + (isStringValues ? 'StringValues' : '')
          node.typeName = ts.createQualifiedName(ts.createIdentifier('yfiles'), mapped)
        } else if (
          // extends yfiles.lang.Object
          ts.isPropertyAccessExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === 'yfiles'
        ) {
          const simpleName = node.name.text
          const fqn = `yfiles.${node.expression.name.text}.${simpleName}`
          const mapped = getEs6Name(fqn)
          node.expression = ts.createIdentifier('yfiles')
          node.name = ts.createIdentifier(mapped)
        } else if (
          // export = yfiles.lang; => export = yfiles;
          ts.isExportAssignment(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          ts.isIdentifier(node.expression.name) &&
          node.expression.expression.text === 'yfiles' &&
          node.expression.name.text === 'lang'
        ) {
          node.expression = ts.createIdentifier('yfiles')
        }

        return node
      }

      return ts.visitNode(rootNode, visit)
    }
  }

  const stripNamespaces = context => {
    return rootNode => {
      /**
       * @param {ts.Node} node
       */
      function visit(node) {
        node = ts.visitEachChild(node, visit, context)
        if (
          ts.isModuleDeclaration(node) &&
          (!node.modifiers || node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword))
        ) {
          return node.body.statements
        } else {
          return node
        }
      }
      return ts.visitNode(rootNode, visit)
    }
  }

  const seenCommentPositions = new Set()

  function synthesizeCommentRanges(sourceFile, parsedComments) {
    const synthesizedComments = []
    parsedComments.forEach(({ kind, pos, end, hasTrailingNewLine }) => {
      if (seenCommentPositions.has(pos)) {
        return
      }
      seenCommentPositions.add(pos)
      let commentText = sourceFile.text.substring(pos, end).trim()
      if (kind === ts.SyntaxKind.MultiLineCommentTrivia) {
        commentText = commentText.replace(/(^\/\*)|(\*\/$)/g, '')
      } else if (kind === ts.SyntaxKind.SingleLineCommentTrivia) {
        if (commentText.startsWith('///')) {
          // triple-slash comments are typescript specific, ignore them in the output.
          return
        }
        commentText = commentText.replace(/(^\/\/)/g, '')
      }
      synthesizedComments.push({ kind, text: commentText, hasTrailingNewLine, pos: -1, end: -1 })
    })
    return synthesizedComments
  }

  const replaceFqnsInComments = context => {
    return rootNode => {
      /**
       * @param {ts.Node} node
       */
      function visit(node) {
        const leadingCommentRanges = ts.getLeadingCommentRanges(sourceFile.text, node.pos)
        if (leadingCommentRanges) {
          const synthComments = synthesizeCommentRanges(sourceFile, leadingCommentRanges)

          synthComments.forEach(c => {
            c.text = c.text.replace(/yfiles\.\w+\.\w+/g, fqn => {
              const typeName = getEs6Name(fqn)
              return `yfiles.${typeName}`
            })
          })
          ts.setSyntheticLeadingComments(node, synthComments)
          ts.setEmitFlags(node, ts.EmitFlags.NoComments)
        }
        return ts.visitEachChild(node, visit, context)
      }
      return ts.visitNode(rootNode, visit)
    }
  }

  const result = ts.transform(sourceFile, [
    adaptTypeDeclarations,
    stripNamespaces,
    replaceFqnsInComments
  ])
  let transformedSource = print(result.transformed[0])
  transformedSource = transformedSource.replace(/^\s*/gm, '')
  return transformedSource
}

function getFqn(node, nodeName) {
  const fqn = [nodeName]
  let n = node
  while (n) {
    if (ts.isModuleDeclaration(n)) {
      fqn.unshift(n.name.text)
    }
    n = n.parent
  }
  return fqn.join('.')
}

function print(sourceFile) {
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  })
  return printer.printFile(sourceFile)
}
