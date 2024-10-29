import new_scope from "../src/zrx.js"

const scope = new_scope()

export const batch = scope.batch

export const new_cell = scope.new_cell
export const new_tree = scope.new_tree

export const track = scope.track
export const trackx = scope.trackx