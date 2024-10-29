import { new_signal, track, batch } from "./scope.js"

const [use, set] = new_signal(0)

console.log("[[[init]]]")
track(() => {
    console.log(use())
})

console.log("[[[unbatch]]]")
set(1)
set(2)

console.log("[[[batch]]]")
batch(() => {
    set(3)
    set(4)
    set(5)
})