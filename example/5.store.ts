import { new_store, track } from "./scope.js"

const sx = new_store({
    x0: {
        y0: 0,
        y1: 1,
    },
    x1: {
        y0: 2,
        y1: 3,
    }
})
console.log("[[[init]]]")
track(() => { 
    console.log(`root: ${JSON.stringify(sx.use())}`)
})
for (let x = 0; x < 2; x++) {
    track(() => { 
        //sx.x0.use()
        console.log(`x${x}: ${JSON.stringify((sx as any)[`x${x}`].use())}`)
    })
    for (let y = 0; y < 2; y++) {
        track(() => { 
            //sx.x0.y0.use()
            console.log(`x${x}y${y}: ${JSON.stringify((sx as any)[`x${x}`][`y${y}`].use())}`) 
        })
    }
}

console.log("[[[mod x0y1]]]")
sx.x0.y0.set(7)

console.log("[[[mod x1]]]")
sx.x1.set(sx.x1.use())