import { new_cell, track, batch } from "./scope.js"

const c = new_cell(0)

console.log("[init]")
track(() => {
    console.log(c.use())
})

console.log("[unbatch]")
c.set(1)
c.set(2)

console.log("[batch]")
batch(() => {
    c.set(3)
    c.set(4)
    c.set(5)
})