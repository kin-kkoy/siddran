// Event-emitter based toast system
// Can be called from anywhere (hooks, components, utils) without needing React context
let listeners = []

export const toast = {
  _emit(message, type) {
    listeners.forEach(fn => fn({ message, type, id: Date.now() }))
  },
  success: (message) => toast._emit(message, 'success'),
  error:   (message) => toast._emit(message, 'error'),
  warning: (message) => toast._emit(message, 'warning'),
  subscribe: (fn) => {
    listeners.push(fn)
    return () => { listeners = listeners.filter(l => l !== fn) }
  }
}
