function drawChart_v2() {
    const dataUrl = 'visualizations/viz2.json'; // Replace with the path to your JSON file
    const margin = {top: 30, right: 100, bottom: 50, left: 100};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create an SVG element
    const svg = d3.select ('#viz2').append ('svg')
        .attr ('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append ('g')
        .attr ('transform', `translate(${margin.left},${margin.top})`);

    // Define the scales
    const xScale = d3.scaleTime ().range ([0, width]);
    const y1Scale = d3.scaleLinear ().range ([height, 0]);
    const y2Scale = d3.scaleLinear ().range ([height, 0]);

    // Define the lines
    const lineCases = d3.line ()
        .x (d => xScale (new Date (d.date)))
        .y (d => y1Scale (d.cases));

    const lineHospitalized = d3.line ()
        .x (d => xScale (new Date (d.date)))
        .y (d => y2Scale (d.hospitalized));

    var tooltip = d3.select('#viz2')
        .append("div")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background-color", "rgb(211,211,211)")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .attr("class", "tooltip")
        .style("width", "auto")
        .style("height", "auto")
        .style("pointer-events", "none")

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    var showTooltip = function(event, d) {
        tooltip
            .transition()
            .duration(500)
        tooltip
            .style("opacity", 1)
            .html("date: " + d['date']+ '<br> Infected cases: '+ d['cases'] +  '<br> Hospitalized Cases: '+ d['hospitalized'])
            .style("left", event.pageX + "px")
            .style("top", (event.pageY - 28) + "px")
    }



    var hideTooltip = function(d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    // Load the data
    d3.json (dataUrl).then (data => {
        // Format the data
        data = data.data.map (d => ({
            date: d.date,
            cases: +d.cases,
            hospitalized: +d.hospitalized
        }));

        // Set the domain of the scales
        xScale.domain (d3.extent (data, d => new Date (d.date)));
        y1Scale.domain ([0, d3.max (data, d => d.cases)]);
        y2Scale.domain ([0, d3.max (data, d => d.hospitalized)]);

        // Add the x-axis
        svg.append ('g')
            .attr ('transform', `translate(0,${height})`)
            .call (d3.axisBottom (xScale)
                .tickValues (xScale.ticks (d3.timeMonth.every (2)))
                .tickFormat (d3.timeFormat ("%b %Y"))
                .tickSize (0)
                .tickPadding (8)
            )
            .selectAll ("text")
            .attr ("text-anchor", "end")
            .attr ("font-size", "8px")
            .attr ("transform", "rotate(-80)");

        // Add the y-axes
        svg.append ('g')
            .call (d3.axisLeft (y1Scale));
        svg.append ('g')
            .attr ('transform', `translate(${width}, 0)`)
            .call (d3.axisRight (y2Scale));

        // Add the legend
        const legend = svg.append ('g')
            .attr ('class', 'legend')
            .attr ('transform', `translate(${width - 100},${margin.top})`);



        legend.append ('rect')
            .attr ('x', 0)
            .attr ('y', 0)
            .attr ('width', 10)
            .attr ('height', 10)
            .attr ('fill', '#cc0099');

        legend.append ('text')
            .attr ('x', 15)
            .attr ('y', 10)
            .attr ('font-size', '8px')
            .text ('Infected Cases');

        legend.append ('rect')
            .attr ('x', 0)
            .attr ('y', 15)
            .attr ('width', 10)
            .attr ('height', 10)
            .attr ('fill', '#006699');

        legend.append ('text')
            .attr ('x', 15)
            .attr ('y', 25)
            .attr ('font-size', '8px')
            .text ('Hospitalized Cases');


        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#cc0099')
            .attr('stroke-width', 1)
            .attr('d', lineCases)
            .append("title")  // append a title element to the path
            .on("mouseover", showTooltip )
            .on("mouseleave", hideTooltip )


        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#006699')
            .attr('stroke-width', 1)
            .attr('d', lineHospitalized)
            .append("title")  // append a title element to the path


        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return xScale (new Date (d.date))}) 
            .attr("cy", function (d) { return y1Scale (d.cases); } )
            .attr("r",  0.5 )
            .style("fill", "#cc0099" )
            // -3- Trigger the functions for hover
            .on("mouseover", showTooltip )
            .on("mouseleave", hideTooltip )
        
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return xScale (new Date (d.date))}) 
            .attr("cy", function (d) { return y2Scale (d.hospitalized); } )
            .attr("r",  0.5 )
            .style("fill", "#006699" )
            // -3- Trigger the functions for hover
            .on("mouseover", showTooltip )
            .on("mouseleave", hideTooltip )


// Add a text element to the plot
        svg.append ("text")
            .attr ("x", width / 2)
            .attr ("y", height + margin.bottom)
            .attr ("font-size", "8px")
            .attr ("text-anchor", "middle")
            .text ("Time");

// add left y-axis label
        svg.append ("text")
            .attr ("class", "y-label")
            .attr ("text-anchor", "middle")
            .attr ("transform", "rotate(-90)")
            .attr ("font-size", "8px")
            .attr ("x", -height / 6)
            .attr ("y", margin.left / 6)
            .attr ("dy", "-1em")
            .text ("Infected Cases");

// add right y-axis label
        svg.append ("text")
            .attr ("class", "y-label")
            .attr ("text-anchor", "middle")
            .attr ("transform", "rotate(-90)")
            .attr ("font-size", "8px")
            .attr ("x", -height / 6)
            .attr ("y", width + margin.right / 18)
            .attr ("dy", "-1em")
            .text ("Hospitalized Cases");

    });




};

drawChart_v2();