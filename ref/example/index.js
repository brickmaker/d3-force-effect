const data = {
  nodes: [
    { id: 'a', },
    { id: 'b', },
    { id: 'c', },
    { id: 'd', },
    { id: 'e', },
  ],
  links: [
    {
      source: 'a',
      target: 'b',
      value: 1,
    },
    {
      source: 'b',
      target: 'c',
      value: 1,
    },
    {
      source: 'c',
      target: 'd',
      value: 1,
    },
    {
      source: 'd',
      target: 'e',
      value: 1,
    },
    {
      source: 'e',
      target: 'a',
      value: 1,
    },
  ]
}

const width = 800;
const height = 600;

const chart = () => {
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody());

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])

  const link = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 2);

  const node = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 5)
    .attr("fill", "#000");

  // node.append("title")
  // .text(d => d.id);

  console.log(nodes);
  console.log(links);
  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  });

  return svg.node();
}

document.querySelector('body').appendChild(chart());