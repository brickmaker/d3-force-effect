const INIT_RADIUS = 100; // init range of random position of nodes
const TIME_INTERVAL = 1; // time interval of tick
const DEFALUT_EDGE_LEN = 0; // rest length of spring
const SPRING_K = 1000; // spring stiffness factor
const REPULSE_K = 200000; // repulse force factor
const CENTRIPETAL_K = 100; // centripetal force factor
const D_T = 0.001; // delta time
const MASS = 10; // mass value of nodes
const VELOCITY_DECAY = 0.99; // decay of velocity of each iteration

class ForceSimulation {
    constructor(nodes, links, enableWeightLink) {
        this.nodes = nodes;
        this.links = links;
        this.tickFunc = () => { };
        this.hasWeightLink = enableWeightLink;

        this._init();
    }

    onTick(callback) {
        this.tickFunc = callback;
    }

    start() {
        this.timer = setInterval(() => {
            this.step();
        }, TIME_INTERVAL);
    }

    stop() {
        clearInterval(this.timer);
    }

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

    _lenTwoNodes(source, target) {
        return Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2);
    }

    _normalTwoNodes(source, target) {
        const len = this._lenTwoNodes(source, target);
        return {
            x: (target.x - source.x) / len,
            y: (target.y - source.y) / len,
        };
    }

    _lenLink(link) {
        return this._lenTwoNodes(link.source, link.target);
    }

    _normalLink(link) {
        return this._normalTwoNodes(link.source, link.target);
    }

    _computeSpring(link, hasWeight = false) {
        const len = this._lenLink(link);
        const normal = this._normalLink(link);
        const f = (len - DEFALUT_EDGE_LEN) * SPRING_K;

        // NOTE: weight method, linear or log
        // const weightFactor = hasWeight ? 1 + Math.log(link.value) : 1;
        const weightFactor = hasWeight ? link.value : 1;
        return {
            x: f * normal.x * weightFactor,
            y: f * normal.y * weightFactor,
        }
    }

    _computeRepulse(center) {
        const f = { x: 0, y: 0 };

        this.nodes.forEach(node => {
            if (node !== center) {
                const fv = REPULSE_K * MASS * MASS / this._lenTwoNodes(center, node) ** 2;
                const normal = this._normalTwoNodes(node, center);
                f.x += fv * normal.x;
                f.y += fv * normal.y;
            }
        })

        return f;
    }

    _computeCentripetal(node) {
        const f = { x: 0, y: 0 };
        const center = { x: 0, y: 0 }; // TODO: default center is zero
        const fv = CENTRIPETAL_K * this._lenTwoNodes(node, center);
        const normal = this._normalTwoNodes(node, center);
        f.x += fv * normal.x;
        f.y += fv * normal.y;
        return f;
    }

    _computeVelocities() {
        this.links.forEach(link => {
            const springForce = this._computeSpring(link, this.hasWeightLink);
            const repulseForceSource = this._computeRepulse(link.source);
            const repulseForceTarget = this._computeRepulse(link.target);
            const centripetalForceSource = this._computeCentripetal(link.source);
            const centripetalForceTarget = this._computeCentripetal(link.target);

            const fSource = {
                x: springForce.x + repulseForceSource.x + centripetalForceSource.x,
                y: springForce.y + repulseForceSource.y + centripetalForceSource.y,
            };
            const fTarget = {
                x: -springForce.x + repulseForceTarget.x + centripetalForceTarget.x,
                y: -springForce.y + repulseForceTarget.y + centripetalForceTarget.y,
            };

            // force to velocity, explicit Euler method
            link.source.vx += fSource.x / MASS * D_T;
            link.source.vy += fSource.y / MASS * D_T;
            link.target.vx += fTarget.x / MASS * D_T;
            link.target.vy += fTarget.y / MASS * D_T;

            // NOTE: speed decay, maybe not proper
            link.source.vx *= VELOCITY_DECAY;
            link.source.vy *= VELOCITY_DECAY;
            link.target.vx *= VELOCITY_DECAY;
            link.target.vy *= VELOCITY_DECAY;
        });
    }

    _computePositions() {
        this.nodes.forEach(node => {
            node.x += node.vx * D_T;
            node.y += node.vy * D_T;
        });
    }
}