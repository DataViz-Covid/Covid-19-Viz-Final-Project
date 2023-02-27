const dataUrl = 'viz2.json'; // Replace with the path to your JSON file
const margin = { top: 30, right: 100, bottom: 50, left: 100 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create an SVG element
const svg = d3.select('#line-chart').append('svg')
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// Define the scales
const xScale = d3.scaleTime().range([0, width]);
const y1Scale = d3.scaleLinear().range([height, 0]);
const y2Scale = d3.scaleLinear().range([height, 0]);

// Define the lines
const lineCases = d3.line()
    .x(d => xScale(new Date(d.date)))
    .y(d => y1Scale(d.cases));

const lineHospitalized = d3.line()
    .x(d => xScale(new Date(d.date)))
    .y(d => y2Scale(d.hospitalized));

// Load the data
d3.json(dataUrl).then(data => {
    // Format the data
    data = data.data.map(d => ({
        date: d.date,
        cases: +d.cases,
        hospitalized: +d.hospitalized
    }));

    // Set the domain of the scales
    xScale.domain(d3.extent(data, d => new Date(d.date)));
    y1Scale.domain([0, d3.max(data, d => d.cases)]);
    y2Scale.domain([0, d3.max(data, d => d.hospitalized)]);

// Add the x-axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .tickValues(xScale.ticks(d3.timeMonth.every(2)))
            .tickFormat(d3.timeFormat("%b %Y"))
            .tickSize(0)
            .tickPadding(8)
        )
        .selectAll("text")
        .attr("text-anchor", "end")
        .attr("font-size", "8px")
        .attr("transform", "rotate(-80)");



    // Add the y-axes
    svg.append('g')
        .call(d3.axisLeft(y1Scale));
    svg.append('g')
        .attr('transform', `translate(${width}, 0)`)
        .call(d3.axisRight(y2Scale));

    // Add the cases line
    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1)
        .attr('d', lineCases);

    // Add the hospitalized line
    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'green')
        .attr('stroke-width', 1)
        .attr('d', lineHospitalized);





// Add a text element to the plot
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + margin.bottom )
        .attr("font-size", "8px")
        .attr("text-anchor", "middle")
        .text("Time");

// add left y-axis label
    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "8px")
        .attr("x", -height /6)
        .attr("y", margin.left /6)
        .attr("dy", "-1em")
        .text("Infected Cases");

// add right y-axis label
    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "8px")
        .attr("x", -height/6 )
        .attr("y", width + margin.right /18)
        .attr("dy", "-1em")
        .text("Hospitalized Cases");




// Define the bisector function to find the nearest data point
    const bisectDate = d3.bisector(d => new Date(d.date)).left;

// Create a tooltip
    const tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

// Add a vertical line that follows the mouse position
    tooltip.append("line")
        .attr("class", "x-line")
        .attr("y1",0 )
        .attr("y2", height)
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "3");

// Add a circle to highlight the data point
    const circle = tooltip.append("circle")
        .attr("class", "circle")
        .attr("r", 4)
        .attr("fill", "white")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2);

// Add a text element to display the data value
    const text = tooltip.append("text")
        .attr("class", "tooltip-text")
        .attr("x", 5)
        .attr("y", 5)
        .attr("font-size", "6px")
        .attr("font-weight", "bold")
        .text("Tooltip text");

// Add a background rectangle to the tooltip text
    const background = tooltip.insert("rect", "text")
        .attr("class", "tooltip-background")
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", "white")
        .attr("stroke", "gray")
        .attr("stroke-width", 1);

// Add the mouseover event to show the tooltip
    svg.on("mouseover", () => {
        tooltip.style("display", null);
    })
        .on("mousemove", function(event) {
            // Get the x-coordinate of the mouse pointer relative to the chart
            const x0 = xScale.invert(d3.pointer(event, this)[0]);

            // Find the index of the data point that is closest to the x-coordinate
            const i = bisectDate(data, x0, 1);

            // Get the data points to the left and right of the index
            const d0 = data[i - 1];
            const d1 = data[i];

            // Determine which data point is closer to the mouse pointer
            const d = x0 - new Date(d0.date) > new Date(d1.date) - x0 ? d1 : d0;

            // Set the position of the tooltip and update the data value
            tooltip.attr("transform", `translate(${xScale(new Date(d.date))},${y1Scale(d.cases)})`);

            // Update the text and background of the tooltip
            text.text(`Date: ${d.date}\nCases: ${d.cases}\nHospitalized: ${d.hospitalized}`);
            const bbox = text.node().getBBox();
            background.attr("x", bbox.x - 2)
                .attr("y", bbox.y - 2)
                .attr("width", bbox.width + 4)
                .attr("height", bbox.height + 4);

            // Update the position of the circle
            circle.attr("transform", `translate(${bbox.width / 2 + 5}, ${bbox.height / 2 + 5})`);
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });


    d3.json(dataUrl).then(draw);
});








