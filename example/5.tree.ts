import { new_tree, track } from "./scope.js"

const t = new_tree({
    x0: {
        y0: 0,
        y1: 1,
    },
    x1: {
        y0: 2,
        y1: 3,
    }
})
console.log("[init]")
track(() => { 
    console.log(`root: ${JSON.stringify(t.use())}`)
})
for (let x = 0; x < 2; x++) {
    track(() => { 
        //t.x0.use()
        console.log(`x${x}: ${JSON.stringify((t as any)[`x${x}`].use())}`)
    })
    for (let y = 0; y < 2; y++) {
        track(() => { 
            //t.x0.y0.use()
            console.log(`x${x}y${y}: ${JSON.stringify((t as any)[`x${x}`][`y${y}`].use())}`) 
        })
    }
}

console.log("[mod x0y1]")
t.x0.y1.set(7)

console.log("[mod x1]")
t.x1.set(t.x1.use())