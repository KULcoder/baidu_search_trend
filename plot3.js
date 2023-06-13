// plot 3: Network Graph describe convariance between different provinces

// step 1: define the size of the svg
let margin_plot3 = { top: 20, right: 20, bottom: 20, left: 20 };
let width_plot3 = 1000 - margin_plot3.left - margin_plot3.right;
let height_plot3 = 600 - margin_plot3.top - margin_plot3.bottom;

// step 2 define the svg
let svg_q3 = d3
    .select("#network-container")
    .append("svg")
    .attr("width", width_plot3 + margin_plot3.left + margin_plot3.right) // add margin when define the svg
    .attr("height", height_plot3 + margin_plot3.top + margin_plot3.bottom) // add margin when define the svg
    .append("g")
    .attr("transform", "translate(" + margin_plot3.left + "," + margin_plot3.top + ")");

// step 3: Read the data
d3.json("data/q3plot.json").then(function (data) {

    // step 4 link, node, text elements
    links = data.links;
    nodes = data.nodes;

    // set the style of the links
    // const linkColorScale = d3
    // .scaleSequential(d3.interpolateBlues)
    // .domain(d3.extent(links, (link) => link.value));

    const colorScale = d3.scaleLinear()
    .domain(d3.extent(links, (link) => link.value))
    .range([0, 1]);

    const LinkColor = function(linkValue) {
        let baseColor = d3.interpolateBlues(colorScale(linkValue));
        return d3.interpolateRgb(baseColor, "white")(0.5);
    }

    const linkWidthScale = d3
    .scaleLinear()
    .domain(d3.extent(links, (link) => link.value))
    .range([1, 7]);

    const linkElements = svg_q3
    .selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke-width", d => linkWidthScale(d.value))
    .attr("stroke", d => LinkColor(d.value));

    const nodeElements = svg_q3
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", (node) => node.size * 20)
    .attr("fill", "red");

    const textElements = svg_q3
    .selectAll(".text")
    .data(nodes)
    .enter()
    .append("text")
    .text((node) => node.name)
    .attr("font-size", 15)
    .attr("dx", 20)
    .attr("dy", 5);

    // step 5: define the simulation
    const simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width_plot3 / 2 - 50, height_plot3 / 2))
    .force("collide", d3.forceCollide().radius(50));

    const linkForce = d3.forceLink(links)
    .id(d => d.id)
    .distance(100)
    .strength((links) => links.value * 1.5);

    simulation.force("links", linkForce);

    simulation.on("tick", () => {
        linkElements
        .attr("x1", (link) => link.source.x)
        .attr("y1", (link) => link.source.y)
        .attr("x2", (link) => link.target.x)
        .attr("y2", (link) => link.target.y);

        nodeElements
        .attr("cx", (node) => node.x)
        .attr("cy", (node) => node.y);

        textElements
        .attr("x", (node) => node.x)
        .attr("y", (node) => node.y);
    });





});

