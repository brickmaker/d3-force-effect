const INIT_RADIUS = 100;
const TIME_INTERVAL = 10;
const DEFALUT_EDGE_LEN = 100;
const SPRING_K = 10;
const D_T = 0.1;
const MASS = 1;
const VELOCITY_DECAY = 0.9;

class ForceSimulation {
    constructor(nodes, links) {
        this.nodes = nodes;
        this.links = links;
        this.tickFunc = () => { };

        this._init();
    }

    onTick(callback) {
        this.tickFunc = callback;
    }

    start() {
        setInterval(() => {
            this.step();
        }, TIME_INTERVAL);
    }

    stop() { }

    step() {
        this._computeVelocities();
        this._computePositions();
        this.tickFunc();
    }

    _init() {
        const id2Node = new Map();
        this.nodes.forEach(node => {
            node.x = this._randomRange(-INIT_RADIUS, INIT_RADIUS);
            node.y = this._randomRange(-INIT_RADIUS, INIT_RADIUS);
            node.vx = 0;
            node.vy = 0;
            id2Node[node.id] = node;
        });

        this.links.forEach(link => {
            link.source = id2Node[link.source];
            link.target = id2Node[link.target];
        });
    }

    _randomRange(x, y) {
        return Math.random() * (y - x) + x;
    }

    _len(link) {
        return Math.sqrt((link.source.x - link.target.x) ** 2 + (link.source.y - link.target.y) ** 2);
    }
    _normal(link) {
        const len = this._len(link);
        return {
            x: (link.target.x - link.source.x) / len,
            y: (link.target.y - link.source.y) / len,
        };
    }

    _computeVelocities() {
        this.links.forEach(link => {
            const len = this._len(link);
            const normal = this._normal(link);
            const f = (len - DEFALUT_EDGE_LEN) * SPRING_K;

            link.source.vx += f / MASS * normal.x * D_T;
            link.source.vy += f / MASS * normal.y * D_T;
            link.target.vx -= f / MASS * normal.x * D_T;
            link.target.vy -= f / MASS * normal.y * D_T;

            // speed decay
            link.source.vx *= VELOCITY_DECAY;
            link.source.vy *= VELOCITY_DECAY;
            link.target.vx *= VELOCITY_DECAY;
            link.target.vy *= VELOCITY_DECAY;
        });

        // TODO: only for test
        /*
        this.nodes.forEach(node => {
            node.vx = 1.;
            node.vy = 1.;
        });
        */
    }

    _computePositions() {
        this.nodes.forEach(node => {
            node.x += node.vx * D_T;
            node.y += node.vy * D_T;
        });
    }
}