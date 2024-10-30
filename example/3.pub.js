import { new_pub, new_cell } from "../lib/main.js"

const pub = new_pub()

const c = new_cell(0)

console.log("[init]")
pub.track(() => {
    console.log(c.use())
})

console.log("[modify]")
setInterval(() => {
    console.log("set!")
    c.set(c.use() + 1) 
}, 1000)
setTimeout(() => {
    console.log("cancel!")
    pub.cancel()
}, 5500)