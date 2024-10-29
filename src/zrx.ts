export type Act = () => void
export type Store<T> = { [Key in keyof T]: Store<T[Key]> } & {
    use: () => T
    set: (nval: T) => T
}

type Sub = Act | [Act, Set<Set<Act>>]
export default function new_scope() {
    let f_batch = false
    let ls_batch_act = new Set<Act>()
    let sub_current: Sub | null = null

    const batch = (fn: () => void) => {
        f_batch = true
        fn()
        for (const act of ls_batch_act) {
            act()
        }
        f_batch = false
        ls_batch_act.clear()
    }

    const new_signal = <T>(ival: T): [() => T, (nval: T) => void] => {
        let val = ival
        const st_sub = new Set<Act>()
        const use = () => {
            if (sub_current) {
                if (typeof sub_current === "function") {
                    st_sub.add(sub_current)
                } else {
                    st_sub.add(sub_current[0])
                    sub_current[1].add(st_sub)
                }
            }
            return val
        }
        const set = (nval: T) => {
            if (val === nval) {
                return
            }
            val = nval
            for (const sub of st_sub) {
                if (f_batch) {
                    ls_batch_act.add(sub)
                } else {
                    sub()
                }
            }
        }
        return [use, set]
    }

    type _Node = {
        nodes?: Record<string | number | symbol, _Node>
        st_sub?: Set<Act>
    }
    type _Path = (string | number | symbol)[]
    const _sub_node = (node: _Node) => {
        if (!node.st_sub) {
            node.st_sub = new Set()
        }
        if (typeof sub_current === "function") {
            node.st_sub.add(sub_current)
        } else {
            node.st_sub.add(sub_current![0])
            sub_current![1].add(node.st_sub)
        }
    }
    const _sub = (root: _Node, path: _Path | undefined) => {
        if (!path) {
            _sub_node(root)
            return
        }
        let n = root
        for (let i = 0; i < path!.length; i++) {
            const path_cur = path![i];
            if (!n.nodes) {
                n.nodes = {}
            }
            let nn = n.nodes[path_cur]
            if (!nn) {
                nn = {}
                n.nodes[path_cur] = nn
            }
            n = nn
        }
        _sub_node(n)
    }
    const _dispath_node = (node: _Node) => {
        if (node.st_sub) {
            for (const sub of node.st_sub) {
                if (f_batch) {
                    ls_batch_act.add(sub)
                } else {
                    sub()
                }
            }
        }
    }
    const _dispath_all = (node: _Node) => {
        _dispath_node(node)
        if (node.nodes) {
            for (const [_, value] of Object.entries(node.nodes)) {
                _dispath_all(value)
            }
        }
    }
    const _dispath = (path: _Path | undefined, pi: number, cur: _Node) => {
        if (!path || path.length === 0) {
            _dispath_all(cur)
        } else {
            _dispath_node(cur)
            const path_cur = path[pi]
            const node_nxt = cur.nodes?.[path_cur]
            if (pi == path.length - 1) {
                node_nxt && _dispath_all(node_nxt)
            } else {
                node_nxt && _dispath(path, pi + 1, node_nxt)
            }
        }
    }
    const _new_store_base = (ival: any): [(path?: _Path) => any, (path: _Path | undefined, nval: any) => void] => {
        let val = ival
        const root: _Node = {}

        const _get = (path?: _Path) => {
            if (!path || path.length == 0) {
                return val
            }
            const ix_last = path.length - 1
            let v = val
            for (let i = 0; i < ix_last; i++) {
                v = v[path[i]]
            }
            return v[path[ix_last]]
        }
        const use = (path?: _Path) => {
            if (sub_current) {
                _sub(root, path)
            }
            return _get(path)
        }
        const set = (path: _Path | undefined, nval: any) => {
            if (!path || path.length === 0) {
                val = nval
            }
            const ix_last = path!.length - 1
            let v = val
            for (let i = 0; i < ix_last; i++) {
                v = v[path![i]]
            }
            v[path![ix_last]] = nval
            _dispath(path, 0, root)
        }
        return [use, set]
    }

    type _Temp = {
        path: _Path
        proxy?: any
        nodes?: Record<string | number | symbol, _Temp>
        use?: () => any
        set?: (nval: any) => void
        ref?: () => any
    }
    const new_store = <T>(ival: T): Store<T> => {
        const temp: _Temp = { path: [] }
        const [buse, bset] = _new_store_base(ival)
        const _store_handler: ProxyHandler<_Temp> = {
            get: (t, prop) => {
                if (prop === "use") {
                    if (!t.use) {
                        t.use = () => {
                            return buse(t.path)
                        }
                    }
                    return t.use
                }
                if (prop === "set") {
                    if (!t.set) {
                        t.set = (nval: any) => {
                            bset(t.path, nval)
                        }
                    }
                    return t.set
                }
                if (!t.nodes) {
                    t.nodes = {}
                }
                let n = t.nodes[prop]
                if (!n) {
                    n = { path: [...t.path!, prop] }
                    t.nodes[prop] = n
                }
                let p = n.proxy
                if (!p) {
                    p = new Proxy(n, _store_handler)
                    n.proxy = p
                }
                return p
            },
        }
        const p = new Proxy(temp, _store_handler)
        temp.proxy = p
        return p as any
    }

    const track = (act: Act) => {
        const presub = sub_current
        sub_current = act
        act()
        sub_current = presub
    }
    const trackx = (act: Act) => {
        const st_pub = new Set<Set<Act>>()
        const presub = sub_current
        sub_current = [act, st_pub]
        act()
        sub_current = presub
        return () => {
            for (const pub of st_pub) {
                pub.delete(act)
            }
        }
    }
    const untrack = <T>(fn: () => T) => {
        const presub = sub_current
        sub_current = null
        const val = fn()
        sub_current = presub
        return val
    }

    return {
        batch,

        new_signal,
        new_store,

        track,
        trackx,
        untrack,
    }
}