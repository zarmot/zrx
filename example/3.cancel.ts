import { new_cell, trackx } from "./scope.js"

const c = new_cell(0)

console.log("[init]")
const cancel = trackx(() => {
    console.log(c.use())
})

console.log("[modify]")
setInterval(() => {
    console.log("set!")
    c.set(c.use() + 1) 
}, 1000)
setTimeout(() => {
    console.log("canceled!")
    cancel()
}, 5500)