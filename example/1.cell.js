import { new_cell, track } from "../lib/main.js"

const c = new_cell(0)

console.log("[init]")
track(() => {
    console.log(c.use())
})

console.log("[modify]")
setInterval(() => {
    c.set(c.use() + 1) 
}, 1000)