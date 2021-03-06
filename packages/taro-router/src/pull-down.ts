import type * as React from 'react'
// eslint-disable-next-line import/no-duplicates
import type Vue from 'vue'
// eslint-disable-next-line import/no-duplicates
import type { ComponentOptions } from 'vue'
import { injectPageInstance } from '@tarojs/runtime'

export type R = typeof React
export type V = typeof Vue

export const createPullDownRefresh = (
  el,
  type: 'react' | 'vue' | 'nerv',
  path: string,
  framework: R | V
): any => {
  return type === 'vue'
    ? createVuePullDown(el, path, framework as V)
    : createReactPullDown(el, framework as R)
}

const createReactPullDown = (el, R: R) => {
  return R.forwardRef((props, ref) => {
    return R.createElement('taro-pull-to-refresh', null, R.createElement(el, { ...props, ref }))
  })
}

const createVuePullDown = (el, path: string, vue: V) => {
  const injectedPage = vue.extend({
    props: {
      tid: String
    },
    mixins: [el, {
      created () {
        injectPageInstance(this, path)
      }
    }]
  })

  const options: ComponentOptions<Vue> = {
    name: 'PullToRefresh',
    render (h) {
      return h('taro-pull-to-refresh', { class: ['hydrated'] }, [h(injectedPage, this.$slots.default)])
    }
  }

  return options
}