import { new_signal, trackx } from "./scope.js"

const [use, set] = new_signal(0)

console.log("[[[init]]]")
const cancel = trackx(() => {
    console.log(use())
})

console.log("[[[modify]]]")
setInterval(() => {
    console.log("set!!!")
    set(use() + 1) 
}, 1000)
setTimeout(() => {
    console.log("canceled!!!")
    cancel()
}, 5500)