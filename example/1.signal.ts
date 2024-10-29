import { new_signal, track } from "./scope.js"

const [use, set] = new_signal(0)

console.log("[[[init]]]")
track(() => {
    console.log(use())
})

console.log("[[[modify]]]")
setInterval(() => {
    set(use() + 1) 
}, 1000)