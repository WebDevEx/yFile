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
/* eslint-disable no-var,no-eval */
;(function () {
  var enableES6warning =
    window.location.hostname.indexOf('yworks.') < 0 &&
    window.location.pathname.indexOf('es5/demos') < 0 &&
    !hasEs6Support()

  if (enableES6warning) {
    document.getElementById('no-ecmascript6').removeAttribute('style')
    var tutorials = document.getElementById('tutorials')
    tutorials && blockEs6Demos(tutorials.getElementsByTagName('a'))
    var demoGrid = document.querySelector('.demo-grid')
    demoGrid && blockEs6Demos(demoGrid.getElementsByTagName('a'))
    var sidebar = document.getElementById('sidebar')
    sidebar && blockEs6Demos(sidebar.getElementsByTagName('a'))
  }

  function hasEs6Support() {
    try {
      // ES6 features that we want to detect
      eval('class Foo {}')
      eval('const foo = "bar"')
      eval('let bar = (x) => x+1')
    } catch (ignored) {
      return false
    }
    return true
  }

  function blockEs6Demos(aElementList) {
    for (var i = 0; i < aElementList.length; i++) {
      var link = aElementList[i]
      if (link.getAttribute('href').indexOf('index.html') > 0) {
        link.addEventListener('click', function (e) {
          window.scrollTo(0, 0)
          var notice = document.getElementById('no-ecmascript6')
          notice.setAttribute('class', notice.getAttribute('class') + ' highlight-important')
          window.setTimeout(function () {
            notice.setAttribute(
              'class',
              notice.getAttribute('class').replace(' highlight-important', '')
            )
          }, 600)
          e.preventDefault()
        })
      }
    }
  }
})()
;(function () {
  // Check whether the demo data is available. Otherwise, this is used in a README file of the tutorials
  if (window.getDemoData == null) {
    return
  }

  var isTsReadme = window.tsReadme

  document.body.className += isTsReadme ? ' ts' : ' js'

  var categoryNames = {
    'tutorial-getting-started': 'Tutorial: Getting Started',
    'tutorial-custom-styles': 'Tutorial: Custom Styles',
    'tutorial-application-features': 'Tutorial: Application Features',
    layout: 'Layout',
    complete: 'Complete',
    view: 'View',
    analysis: 'Analysis',
    style: 'Style',
    input: 'Input',
    databinding: 'Data Binding',
    integration: 'Integration',
    loading: 'Loading',
    testing: 'Testing'
  }

  var tutorialIds = [
    'tutorial-application-features',
    'tutorial-custom-styles',
    'tutorial-getting-started'
  ]

  var isViewerPackage = document.title.indexOf('Viewer') > -1
  var isLayoutPackage = document.title.indexOf('Layout') > -1
  var isCompletePackage = !isViewerPackage && !isLayoutPackage
  var viewerCategories = [
    'tutorial-getting-started',
    'tutorial-custom-styles',
    'tutorial-application-features',
    'input',
    'style',
    'integration',
    'testing',
    'view'
  ]

  var demos = window.getDemoData()

  if (isTsReadme) {
    var tsDemosFirst = function (a, b) {
      if (a.ts && !b.ts) {
        return -1
      } else if (b.ts && !a.ts) {
        return 1
      } else {
        return 0
      }
    }
    demos.sort(tsDemosFirst)

    demos.forEach(function (demo) {
      if (demo.thumbnailPath != null) {
        demo.thumbnailPath = '../demos-js/' + demo.thumbnailPath
      }
    })
  }

  demos.forEach(function (item) {
    item.availableInPackage =
      isCompletePackage ||
      (isViewerPackage &&
        viewerCategories.indexOf(item.category) !== -1 &&
        item.packageType !== 'no-viewer') ||
      (isLayoutPackage && item.packageType === 'layout')
  })

  var gridItemTemplate = document.querySelector('#grid-item-template')
  var accordionItemTemplate = document.querySelector('#accordion-template')

  function createGridItem(demo, index) {
    var gridItem = document.createElement('div')
    gridItem.className = 'grid-item'
    gridItem.innerHTML = gridItemTemplate.innerHTML.replace(/{{([^}]+)}}/gi, function (
      match,
      propertyName
    ) {
      if (propertyName === 'demoPath' && isTsReadme && !demo.ts) {
        return '../demos-js/' + demo.demoPath
      } else if (propertyName === 'index') {
        return index + 2
      } else if (propertyName === 'video' && demo.thumbnailPath.indexOf('.mp4') > -1) {
        return '<video src="' + demo.thumbnailPath + '" loop="true" autoplay="true">'
      } else if (Object.prototype.hasOwnProperty.call(demo, propertyName)) {
        return demo[propertyName]
      } else {
        return ''
      }
    })
    if (demo.tags) {
      var tagContainer = gridItem.querySelector('.tags')
      demo.tags.forEach(function (tag) {
        var tagItem = document.createElement('span')
        var anchor = document.createElement('a')
        anchor.setAttribute('href', '#' + tag)
        tagItem.className += ' tag'
        anchor.textContent = tag
        tagItem.appendChild(anchor)
        tagContainer.appendChild(tagItem)
      })
    }
    if (demo.ts) {
      var tsBadge = document.createElement('span')
      tsBadge.className = 'ts-badge'
      tsBadge.textContent = 'TS'
      tsBadge.setAttribute('title', 'Available as TypeScript')
      gridItem.querySelector('.thumbnail').appendChild(tsBadge)
    }
    if (isTsReadme && !demo.ts) {
      var jsBadge = document.createElement('span')
      jsBadge.className = 'js-badge'
      jsBadge.textContent = 'JS Only'
      jsBadge.setAttribute('title', 'Available only as JavaScript')
      gridItem.querySelector('.thumbnail').appendChild(jsBadge)
    }
    if (!demo.availableInPackage) {
      gridItem.className += ' not-available'
      var notAvailableNotice = document.createElement('div')
      notAvailableNotice.className = 'not-available-notice'
      notAvailableNotice.innerHTML =
        'Not available in "' +
        (isViewerPackage ? 'Viewer' : 'Layout') +
        '" packages.<br><a href="https://live.yworks.com/demos/' +
        demo.demoPath +
        '">See online version.</a>'
      gridItem.appendChild(notAvailableNotice)
    }
    return gridItem
  }

  function createAccordionItem(category) {
    var tmpDiv = document.createElement('div')
    tmpDiv.innerHTML = accordionItemTemplate.innerHTML.replace(/{{([^}]+)}}/gi, function (
      match,
      propertyName
    ) {
      if (Object.prototype.hasOwnProperty.call(category, propertyName)) {
        return category[propertyName]
      } else {
        // console.warn("Property '" + propertyName + "' not found in demo: " + demo.name);
        return ''
      }
    })
    var item = tmpDiv.firstElementChild
    item.querySelector('.accordion-title').addEventListener('click', function () {
      if (item.className.indexOf('expanded') >= 0) {
        item.className = item.className.replace(' expanded', '')
        if (searchBox.value.indexOf(category.identifier) === 0) {
          searchBox.value = searchBox.value.replace(category.identifier, '').trim()
          searchBoxChanged()
        }
      } else {
        item.className += ' expanded'
        if (/tutorial/i.test(category.title)) {
          searchBox.value = category.identifier
          searchBoxChanged()
        }
      }
    })
    return item
  }

  function createSidebarItem(demo) {
    var sidebarItem = document.createElement('div')
    sidebarItem.className = 'demo-sidebar-item'
    if (!demo.availableInPackage) {
      sidebarItem.className += ' not-available'
      sidebarItem.className += isViewerPackage ? ' viewer-package' : ' layout-package'
    }
    var link = document.createElement('a')
    link.textContent = demo.name
    link.setAttribute('href', demo.demoPath)
    if (demo.ts) {
      var tsBadge = document.createElement('span')
      tsBadge.className = 'ts-badge'
      tsBadge.textContent = 'TS'
      tsBadge.setAttribute('title', 'Available in TypeScript')
      link.appendChild(tsBadge)
    }
    if (isTsReadme && !demo.ts) {
      var jsBadge = document.createElement('span')
      jsBadge.className = 'js-badge'
      jsBadge.textContent = 'JS Only'
      jsBadge.setAttribute('title', 'Available only as JavaScript')
      link.appendChild(jsBadge)
      link.setAttribute('href', '../demos-js/' + link.getAttribute('href'))
    }
    sidebarItem.appendChild(link)
    return sidebarItem
  }

  function insertSortedChild(parent, newChild) {
    var children = parent.querySelectorAll('div')
    parent.appendChild(newChild)
    for (var i = 0; i < children.length; i++) {
      var child = children[i]
      if (child.textContent > newChild.textContent) {
        parent.insertBefore(newChild, child)
        break
      }
    }
  }

  /**
   * @param {object} demo The JSON data of a demo
   * @param {string} needle A whitespace-separated list of search terms
   */
  function matchDemo(demo, needle) {
    var words = needle.split(/[^.\w]/)
    return words
      .map(function (word) {
        return matchWord(demo, word)
      })
      .reduce(function (prev, curr) {
        return prev && curr
      }, true)
  }

  /**
   * @param {object} demo The JSON data of a demo
   * @param {string} word A single search term
   */
  function matchWord(demo, word) {
    var regex = new RegExp(word, 'gi')
    if (regex.test(demo.name)) {
      return true
    }
    if (
      demo.tags.some(function (tag) {
        return regex.test(tag)
      })
    ) {
      return true
    }
    if (
      demo.keywords &&
      demo.keywords.some(function (tag) {
        return regex.test(tag)
      })
    ) {
      return true
    }
    if (regex.test(demo.category)) {
      return true
    }
    return regex.test(demo.summary)
  }

  var demoGrid = document.getElementById('non-tutorial-grid')
  var tutGettingStartedGrid = document.getElementById('tutorial-getting-started-grid')
  var tutCustomStylesGrid = document.getElementById('tutorial-custom-styles-grid')
  var tutApplicationFeaturesGrid = document.getElementById('tutorial-application-features-grid')
  var searchBox = document.querySelector('#search')
  var noSearchResultsElement = document.querySelector('#no-search-results')
  var resetSearchButton = document.querySelector('.reset-search')
  var unAvailableGrid = document.getElementById('unavailable-grid')
  var unAvailableGridHeader = document.getElementById('unavailable-header')

  if (isViewerPackage || isLayoutPackage) {
    unAvailableGrid.style.display = 'block'
    unAvailableGridHeader.style.display = 'block'
  }

  demos.forEach(function (demo, index) {
    var gridItem = createGridItem(demo, index)
    if (demo.category === 'tutorial-getting-started') {
      tutGettingStartedGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-custom-styles') {
      tutCustomStylesGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-application-features') {
      tutApplicationFeaturesGrid.appendChild(gridItem)
    } else if (!demo.availableInPackage) {
      unAvailableGrid.appendChild(gridItem)
    } else {
      demoGrid.appendChild(gridItem)
    }
    demo.element = gridItem
    var sidebarItem = createSidebarItem(demo)
    var element = document.querySelector('.demo-items-' + demo.category)
    if (!element) {
      var categoryName = categoryNames[demo.category] || demo.category
      document.querySelector('.sidebar').appendChild(
        createAccordionItem({
          title: categoryName,
          identifier: demo.category
        })
      )
      element = document.querySelector('.demo-items-' + demo.category)
    }
    insertSortedChild(element, sidebarItem)
    demo.sidebarElement = sidebarItem
  })

  searchBox.addEventListener('input', searchBoxChanged)
  searchBox.addEventListener('click', searchBoxClicked)
  searchBox.addEventListener('blur', function (e) {
    searchBox.addEventListener('click', searchBoxClicked)
  })
  resetSearchButton.addEventListener('click', function () {
    searchBox.value = ''
    searchBoxChanged()
  })

  function onHashChange() {
    if (location.hash && location.hash.length > 1 && location.hash.charAt(0) === '#') {
      var text = decodeURIComponent(location.hash.substr(1))
      searchBox.value = text
    } else {
      searchBox.value = ''
    }
    searchBoxChanged()
  }

  window.onhashchange = onHashChange
  onHashChange()
  searchBoxChanged()

  function searchBoxClicked(evt) {
    searchBox.select()
    searchBox.removeEventListener('click', searchBoxClicked)
    location.hash = searchBox.textContent
  }

  function searchBoxChanged(evt) {
    var noSearchResults = true
    tutorialIds.forEach(function (id) {
      document.getElementById(id).style.display = 'none'
      document.getElementById(id + '-header').style.display = 'block'
    })
    document.getElementById('general-intro').style.display = 'block'
    demos.forEach(function (demo) {
      if (matchDemo(demo, searchBox.value)) {
        demo.element.className = demo.element.className.replace(' filtered', '')
        demo.sidebarElement.className = demo.sidebarElement.className.replace(' filtered', '')
        noSearchResults = false
      } else {
        if (demo.element.className.indexOf('filtered') === -1) {
          demo.element.className += ' filtered'
          demo.sidebarElement.className += ' filtered'
        }
      }
    })
    tutorialIds.forEach(function (id) {
      var children = document.getElementById(id + '-grid').childNodes
      var allHidden = true
      for (var i = 0; i < children.length; i++) {
        if (children[i].getAttribute('class').indexOf('filtered') === -1) {
          allHidden = false
        }
      }
      if (allHidden) {
        document.getElementById(id + '-header').style.display = 'none'
      } else {
        document.getElementById(id + '-header').style.display = 'block'
      }
    })
    noSearchResultsElement.style.display = noSearchResults ? 'block' : 'none'
    changeTextContent(searchBox.value)
  }

  function changeTextContent(text) {
    tutorialIds.forEach(function (id) {
      document.getElementById(id).style.display = 'none'
    })
    if (text.indexOf('tutorial-') === 0) {
      var content = document.getElementById(text)
      if (content != null) {
        tutorialIds.forEach(function (id) {
          document.getElementById(id + '-header').style.display = 'none'
        })
        document.getElementById('general-intro').style.display = 'none'
        document.getElementById(text + '-header').style.display = 'block'
        content.style.display = 'block'
        return
      }
    }
    document.getElementById('general-intro').style.display = 'block'
  }
})()
