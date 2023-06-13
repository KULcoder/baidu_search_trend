// step 1 define the dimension

let margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

transitionDuration = 150;

// step 2 define the svg
let svg_q1 = d3.select("#map-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right) // add margin when define the svg
    .attr("height", height + margin.top + margin.bottom) // add margin when define the svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// step 3 define the scale

min_raw = 0.0;
max_raw = 8785.0;

min_log = 4.0;
max_log = 9.080801;

min_norm = 0.0;
max_norm = 6.393755;

let colorScale = d3
.scaleLinear()
.domain([min_log, max_log])
.range(["white", "red"]);

// step 4 define the projection
let projection = d3
.geoMercator()
.scale(600)
.translate([-(width)/2 - 270 , height + 220])
.center([0, 0]);


let geoGenerator = d3.geoPath().projection(projection);



function drawMap(geojson, current_index) {
    let countries = svg_q1.selectAll("path").data(geojson.features);

    countries.join(
        enter => enter
            .append("path")
            .transition()
            .duration(transitionDuration)
            .attr("d", geoGenerator)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", (d) => colorScale(+d.fever['trend_log'][current_index])),
        update => update
            .transition()
            .duration(transitionDuration)
            .attr("d", geoGenerator)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", (d) => colorScale(+d.fever['trend_log'][current_index])),
        exit => exit
    )
    .on("mouseover", handleMouseover)
    .on("mousemove", handleMousemove)
    .on("mouseout", handleMouseout);

    countryText.raise();
}


// step 5: use the file to get scaler domain
d3.json("./data/q1plot.json").then(function (json) {

    current_index = 1;
    // console.log(json);
    date = json['Dates']

    drawMap(json, current_index);
    current_index = 1; // to decide which date to present

    // we want to make a slider to change the date
    // step 1: define the slider
    var slider = document.getElementById("myRange");


    // step 2: define the slider function
    slider.oninput = function() {
        current_index = this.value;
        d3.json("./data/q1plot.json").then(function (json) {
            drawMap(json, current_index);
            var output = document.getElementById("demo");
            output.innerHTML = date[current_index];
        });
    }
  });

// step 6, create tooltips

let tooltip = d3.select("#new-map-container")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("border", "solid")
    .style("border-width", "0.5px");


let countryText = svg_q1.append("text").attr("id", "country-name");

countryText.style("pointer-events", "none");

function handleMouseover(e, d) {
    d3.select(this).transition().attr("stroke", "black")
    .attr("fill", "coral");
    let centroid = geoGenerator.centroid(d);

    tooltip.html(d.properties.name + " " + d.properties.EN + "<br/>" + Math.round(d.fever['trend_raw'][current_index]) + " ") 
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 10) + "px")
        .style("opacity", 1);
}

function handleMousemove(e, d) {
    tooltip.style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 10) + "px");
}

function handleMouseout(e, d) {
    d3.select(this)
        .transition()
        .attr("fill", (d) => colorScale(+d.fever['trend_log'][current_index]));
    tooltip.style("opacity", 0);
}

// step 7, create legend

let legend = svg_q1.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 150) + "," + (height - 20) + ")")
    .selectAll("g")
    .data(colorScale.ticks(6).slice(1).reverse())
    .enter()
    .append("g");

legend.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("y", function(d, i) { return -i*20; })
    .attr("fill", colorScale);

intensity = {
    5.0: "Low",
    6.0: "",
    7.0: "",
    8.0: "",
    9.0: "High"
}

legend.append("text")
    .attr("x", 26)
    .attr("y", function(d, i) { return -i*20 + 14; })
    .text(function(d) { return intensity[d]; });
















