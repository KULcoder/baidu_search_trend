// step 0 load the data
Promise.all([
    d3.json("./data/q2plotraw.json"),
    d3.json("./data/q2plotstd.json")
]).then(function (files) {
    raw_json = files[0];
    standard_json = files[1];

    // parse the date
    raw_json.forEach(function (d) {
        d.Date = new Date(d.Date);
    });

    standard_json.forEach(function (d) {
        d.Date = new Date(d.Date);
    });

    // console.log(raw_json);
    // console.log(standard_json);

    // step 1 define the constants and the svg
    let margin_plot2 = { top: 20, right: 20, bottom: 20, left: 40 },
    width_plot2 = 900 - margin_plot2.left - margin_plot2.right,
    height_plot2 = 500 - margin_plot2.top - margin_plot2.bottom;

    transitionDuration = 200;
    standardized = false;

    let svg_plot2 = d3
    .select("#chart-container")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 900 500") // seems like the graph needs to move to right a little bit
    .append("g")
    .attr("transform", "translate(" + (margin_plot2.left+10) + "," + margin_plot2.top + ")");


    // .attr("width", width_plot2 + margin_plot2.left + margin_plot2.right) // add margin when define the svg
    // .attr("height", height_plot2 + margin_plot2.top + margin_plot2.bottom) // add margin when define the svg
    // .append("g")
    // .attr("transform", "translate(" + margin_plot2.left + "," + margin_plot2.top + ")");

    // step 2 define the scale

    // x scale: domain: 2022-10-31 to 2023-02-28
    let xScale = d3.scaleTime()
    .domain([new Date(2022, 9, 31), new Date(2023, 1, 26)])
    .range([20, width_plot2-20]);

    // y scale raw: find domain first
    const stacked_y_raw = [];


    for (let i = 0; i < raw_json.length; i++){
        stack = raw_json[i]['Fever'] +
        raw_json[i]['Cough'] +
        raw_json[i]['Headache'] +
        raw_json[i]['Insomnia'] +
        raw_json[i]['ICU'];
        stacked_y_raw.push(stack);
    }

    let yScaleRaw = d3.scaleLinear()
    .domain([0, d3.max(stacked_y_raw)])
    .range([height_plot2 - 20, 20]);

    // y scale standard
    const stacked_y_standard = [];

    for (let i = 0; i < standard_json.length; i++){
        stack = standard_json[i]['Fever'] +
        standard_json[i]['Cough'] +
        standard_json[i]['Headache'] +
        standard_json[i]['Insomnia'] +
        standard_json[i]['ICU'];
        stacked_y_standard.push(stack);
    }

    let yScaleStandard = d3.scaleLinear()
    .domain([0, d3.max(stacked_y_standard)])
    .range([height_plot2 - 20, 20]);

    // step 3 define the axis
    let xAxis = d3.axisBottom(xScale);
    let yAxisRaw = d3.axisLeft(yScaleRaw);

    // step 4 draw the axis
    svg_plot2
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height_plot2 + ")")
    .call(xAxis);

    svg_plot2
    .append("g")
    .attr("class", "y axis")
    .call(yAxisRaw);

    // step 5 create color scale
    let colorScale = d3
    .scaleOrdinal()
    .domain(["Fever", "Cough", "Headache", "Insomnia", "ICU"])
    .range(["#FFCA28", "#9575CD", "#8BC34A", "#FF7043", "#5C6BC0"]);

    // append legend
    let legend = svg_plot2
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width_plot2 - 100) + "," + 10 + ")")
    .selectAll("g")
    .data(colorScale.domain().slice().reverse())
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
        return "translate(0," + i * 20 + ")";
    }
    );

    legend
    .append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", colorScale);

    legend
    .append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(function (d) {
        return d;
    }
    );

    // step 6 draw the line
    // Create steacked area chart
    let stackGenerator = d3.stack().keys(colorScale.domain());

    let stackedData = stackGenerator(raw_json);

    let areaGenerator = d3.area()
    .x((d) => xScale(d.data.Date))
    .y0((d) => yScaleRaw(d[0]))
    .y1((d) => yScaleRaw(d[1]))
    .curve(d3.curveBasis);

    let layer = svg_plot2
    .selectAll(".layer")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("class", "layer");
    
    layer
    .append("path")
    .attr("class", "area chart-line")
    .style("fill", (d) => colorScale(d.key))
    .attr("d", areaGenerator);


    // step 7 switch between raw and standardized

    let button = d3.select("#toggleButton");
    button.on("click", toggleData);

    function toggleData() {
        // Step 1: Switch the dataset
        standardized = !standardized;
        
        // Step 2: Redraw the stacked area chart
        let stackedData;
        let yScale;
        
        if (standardized) {
            stackedData = stackGenerator(standard_json);
            yScale = yScaleStandard;
        } else {
            stackedData = stackGenerator(raw_json);
            yScale = yScaleRaw;
        }
        
        layer.data(stackedData);
        
        layer.select(".area")
            .transition()
            .duration(transitionDuration)
            .attr("d", areaGenerator.y0((d) => yScale(d[0])).y1((d) => yScale(d[1])));
        
        // Step 3: Update the y-axis
        let yAxis = d3.axisLeft(yScale).ticks(5);
        svg_plot2.select(".y.axis")
            .transition()
            .duration(transitionDuration)
            .call(yAxis);
    }

    // step 8 add axis label

    svg_plot2
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .style("font-weight", "bold")
    .text("Search Volumn");

    // step 9 interaction: highlight the area when mouseover

    svg_plot2.selectAll(".chart-line")
    .on("mouseover", handleMouseover)
    .on("mouseout", handleMouseout);

    function handleMouseover(e, d) {

        layer.select(".area").style("opacity", 0.5);

        d3.select(this).style("opacity", 1);
        d3.select(this).style("stroke", "white");
    }

    function handleMouseout(e, d) {
        layer.select(".area").style("opacity", 1);
        d3.select(this).style("stroke", "none");
    }





    
});


