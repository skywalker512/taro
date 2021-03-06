---
title: 使用 CSS-in-JS
id: version-3.0.0-beta.2-css-in-js
original_id: css-in-js
---

在 React 社区有一个著名的 CSS-in-JS 解决方案: [styled-components](https://github.com/styled-components/styled-components)。但遗憾的是，`styled-components` 使用 `<style>` 标签来动态地控制样式，在小程序没有类似的方案。但我们可以通过 [linaria](https://github.com/callstack/linaria) 实现同样的功能，`linaria` 主要提供以下特性：

* 近似于 `styled-components` 的 API
* 完整的 TypeScript 支持
* 零运行时

使用 `linaria` 也非常简单，首先通过 NPM 安装依赖：

```bash
$ npm i linaria
```

其次配置项目根目录的 `babel.config.js`:

```js
module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true
    }],
    'linaria/babel' // 添加到 babel-preset
  ]
}
```

在业务代码中我们可以这样使用：

<!--DOCUSAURUS_CODE_TABS-->

<!--JavaScript-->

```jsx
import React from 'react'
import { View } from '@tarojs/components'
import { styled } from 'linaria/react'

const Title = styled(View)`
  color: ${props => props.color}
`;

const Index = () => {
  return <Title color='red'>
    Hello World!
  </Title>
}

export default Index
```
<!--TypeScript-->

```tsx
import React from 'react'
import { View } from '@tarojs/components'
import { styled } from 'linaria/react'

const Title = styled(View)<{ color: string }>`
  color: ${props => props.color}
`;

const Index: React.FC = () => {
  return <Title color='red'>
    Hello World!
  </Title>
}

export default Index
```

<!--END_DOCUSAURUS_CODE_TABS-->
