import { new_signal, track, untrack } from "./scope.js"

const [use1, set1] = new_signal(0)
const [use2, set2] = new_signal(0)


console.log("[[[init]]]")
track(() => {
    console.log(`tracked: ${use1()}`)
    untrack(() => { console.log(`untracked: ${use2()}`) })
})

console.log("[[[modify]]]")
console.log("set1")
set1(1)
console.log("set2")
set2(5)
console.log("set1")
set1(2)
console.log("set2")
set2(10)