export type Act = () => void
export type Cell<T> = {
    use: () => T
    set: (nval: T) => void
    get: () => T
}
export type Node<T> = { [Key in keyof T]: Node<T[Key]> } & Cell<T>

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

    const new_cell = <T>(ival: T): Cell<T>  => {
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
            val = nval
            for (const sub of st_sub) {
                if (f_batch) {
                    ls_batch_act.add(sub)
                } else {
                    sub()
                }
            }
        }
        const get = () => {
            return val
        }
        return { use, set, get }
    }

    type _Path = (string | number | symbol)[]
    type _Vnode = {
        path: _Path
        proxy?: any
        nodes?: Record<string | number | symbol, _Vnode>
        st_sub?: Set<Act>
        use?: () => any
        get?: () => any
        set?: (nval: any) => void
    }
    const _sub_node = (node: _Vnode) => {
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
    const _sub = (root: _Vnode, path: _Path) => {
        let n = root
        for (let i = 0; i < path!.length; i++) {
            const path_cur = path![i];
            if (!n.nodes) {
                n.nodes = {}
            }
            let nn = n.nodes[path_cur]
            if (!nn) {
                nn = { path: [...n.path, path_cur] }
                n.nodes[path_cur] = nn
            }
            n = nn
        }
        _sub_node(n)
    }
    const _dispath_node = (node: _Vnode) => {
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
    const _dispath_all = (node: _Vnode) => {
        _dispath_node(node)
        if (node.nodes) {
            for (const [_, value] of Object.entries(node.nodes)) {
                _dispath_all(value)
            }
        }
    }
    const _dispath = (path: _Path, pi: number, cur: _Vnode) => {
        if (path.length === 0) {
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
    const new_tree = <T>(ival: T): Node<T> => {
        let val = ival
        const root: _Vnode = { path: [] }
        const _get = (path: _Path) => {
            if (path.length === 0) {
                return val
            }
            const ix_last = path.length - 1
            let v: any = val
            for (let i = 0; i < ix_last; i++) {
                v = v[path[i]]
            }
            return v[path[ix_last]]
        }
        const _use = (path: _Path) => {
            if (sub_current) {
                _sub(root, path)
            }
            return _get(path)
        }
        const _set = (path: _Path, nval: any) => {
            if (path.length === 0) {
                val = nval
            } else {
                const ix_last = path!.length - 1
                let v: any = val
                for (let i = 0; i < ix_last; i++) {
                    v = v[path![i]]
                }
                v[path![ix_last]] = nval
            }
            _dispath(path, 0, root)
        }
        const _store_handler: ProxyHandler<_Vnode> = {
            get: (t, prop) => {
                switch (prop) {
                    case "get":
                        if (!t.get) {
                            t.get = () => {
                                return _get(t.path)
                            }
                        }
                        return t.get
                    case "use":
                        if (!t.use) {
                            t.use = () => {
                                return _use(t.path)
                            }
                        }
                        return t.use
                    case "set":
                        if (!t.set) {
                            t.set = (nval: any) => {
                                _set(t.path, nval)
                            }
                        }
                        return t.set
                    default:
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
                }
            },
        }
        const p = new Proxy(root, _store_handler)
        root.proxy = p
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

    return {
        batch,

        new_cell,
        new_tree,

        track,
        trackx,
    }
}