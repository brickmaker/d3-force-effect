# d3-force-effect

Self implementation of core functions of d3-force.

---

## 简介

实现了一个类似`d3-force`的一个力引导布局库，具体代码见`/src/force.js`。当然，这只是一个 Demo 性质的库，旨在用最少的代码展示力引导布局效果，有很多不完备的地方。

### 用法(API References)

本库的 API 参考`d3-force`，在使用的时候配合`d3`也比较方便。目前实现了最基础的几个 API。另外，具体用法可以参考例子`/src/index.html`.

#### `new ForceSimulation(nodes, links, enableWeightLink)`

创建一个力引导对象，用以进行后续操作

params:

-   nodes: `[{ x: number, y: number, id: string }]`
    -   nodes of graphs
-   links: `[{ source: string, target: string, value: number }]`
    -   edges of graph, source and target specify ids of source node and target node, value is used for weight of edge
-   enableWeightLink: `boolean`
    -   specify whether use weighted edge or not

#### `simulation.onTick(cb)`

设定每次计算后的回调函数

params:

-   cb: `() => {}`
    -   callback function after each tick

#### `simulation.step()`

进行一次迭代计算

#### `simulation.start()`

开始连续的计算

### 配置项

目前除了可以设置是否使用 weighted edge，没有任何其它配置项入口，所有的参数，都在`force.js`文件起始位置的常数定义中，可自行修改。

```js
const INIT_RADIUS = 100; // init range of random position of nodes
const TIME_INTERVAL = 1; // time interval of tick
const DEFALUT_EDGE_LEN = 0; // rest length of spring
const SPRING_K = 1000; // spring stiffness factor
const REPULSE_K = 200000; // repulse force factor
const CENTRIPETAL_K = 100; // centripetal force factor
const D_T = 0.001; // delta time
const MASS = 10; // mass value of nodes
const VELOCITY_DECAY = 0.99; // decay of velocity of each iteration
```

## 实现

### 力的来源

作为力引导，最先想到的是弹簧质点模型(Mass-Spring Model)，当两个点有边连接，那么就相当于有弹簧连接两个边，当距离小于弹簧静止长度排斥，大于静止长度则吸引。弹簧的力遵循[胡克定律](https://en.wikipedia.org/wiki/Hooke%27s_law)，是一个随长度线性变化的力。

但是实践发现，仅仅有弹簧力还是不够的，如果两个点没有连接，就无法保证他们之间保持一定距离，力引导的初衷就是为了解决布局时点的重叠问题，因此，我们需要给点与点之间添加斥力。斥力遵循[库伦斥力](https://en.wikipedia.org/wiki/Coulomb%27s_law)，与两点距离的平方成反比。

实现了上述两个力之后，发现实际表现并不是很好，可能图相对已经稳定，但有一个绝对的整体速度偏移出窗口，因此需要添加一个向心力将整个图尽可能固定在中心位置。因此，这里添加了一个向心力，向心力只是一个辅助的力，不用很大，具体的公式也不用很讲究，这里用了一个点与虚拟的中心点之间的万有引力。

### 力改变位置

通过力改变位置应该时高中物理的知识，即遵循 _力->加速度->速度->位置_ 的转变过程。

故整个库的计算逻辑如下：

```python
loop:
    computeForces()
    computeAcceleration()
    computeVelocities()
    computePositions()

    tickFunc()
```

注意计算力的时候是矢量计算，需要计算合力。
