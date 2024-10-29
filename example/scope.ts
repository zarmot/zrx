import new_scope from "../src/zrx.js"

const scope = new_scope()

export const batch = scope.batch
export const new_signal = scope.new_signal
export const new_store = scope.new_store
export const track = scope.track
export const trackx = scope.trackx
export const untrack = scope.untrack