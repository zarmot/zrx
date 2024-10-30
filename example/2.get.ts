import { new_cell, track } from "../src/lib.js"

const c1 = new_cell(0)
const c2 = new_cell(0)

console.log("[init]")
track(() => {
    console.log(`tracked: ${c1.use()}`)
    console.log(`untracked: ${c2.get()}`)
})

console.log("[modify]")
console.log("c1.set")
c1.set(1)
console.log("c2.set")
c2.set(5)
console.log("c1.set")
c1.set(2)
console.log("c2.set")
c2.set(10)