import { navigator } from './navigator'
import { document } from './document'
import { isBrowser, win } from '../env'
import { raf, caf } from './raf'

export const window = isBrowser ? win : {
  navigator,
  document
}

if (process.env.TARO_ENV === 'tt' || process.env.TARO_ENV === 'swan') {
  (window as any).requestAnimationFrame = raf;
  (window as any).cancelAnimationFrame = caf;
  (window as any).Date = Date;
  (window as any).setTimeout = setTimeout
}
