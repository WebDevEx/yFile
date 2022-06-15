<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This demo file is part of yFiles for HTML 2.3.0.3.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Vue.js Template Node Style Demo

[You can also run this demo online](https://live.yworks.com/demos/style/vuejstemplatenodestyle/index.html).

This demo presents the Vue.js Template Node Style that leverages the powerful data binding and condition rendering features of the [Vue.js framework](https://vuejs.org/v2/guide/index.html).

With this style, node visualizations are defined by SVG templates, similar to the template styles that are included in the library. However, since the templates of this style can use the powerful data binding of Vue.js, complex requirements are more easy to realize.

This style provides the following properties for data binding:

- **layout:** The layout of the styled node, consisting of x, y, width and height
- **tag:** The user data associated with the node
- **zoom:** The zoom level of the graph component
- **selected:** Whether the node is selected
- **focused:** Whether the node is focused
- **highlighted:** Whether the node is highlighted

## Things to Try

Change the template of one or more nodes. Bind colors or text to properties in the tag. Then, apply the new template by pressing the button. Or modify the tag and see how the style changes.

## Related Documentation

- [Vue.js Templates in Styles](https://docs.yworks.com/yfileshtml/#/dguide/custom-styles_vuejs-template-styles)
- [SVG Templates in Styles](https://docs.yworks.com/yfileshtml/#/dguide/custom-styles_template-styles)

## Template Designer

For interactive creation of templates you can use [Node Template Designer](https://www.yworks.com/node-template-designer/).

Graphs containing this node style are compatible with [yEd Live](https://www.yworks.com/yed-live/).
