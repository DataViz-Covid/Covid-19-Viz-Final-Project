// Define the margins of the chart
var margin = { top: 10, right: 20, bottom: 50, left: 120 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
var container = d3.select("#chart").node().getBoundingClientRect();

// Create scales for the x and y axes
var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1);
var yScale = d3.scaleLinear().rangeRound([height, 2]);

// Create axes for the x and y scales
var xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.timeFormat("%b %Y"));
var yAxis = d3.axisLeft(yScale);

// Select the SVG element and set its dimensions and margins
var svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("viz11.json").then(function(data) {

    // Define the date parser
    var parseDate = d3.timeParse("%Y-%m");

    // Convert the Date strings to Date objects
    data.forEach(function(d) {
        d.Date = parseDate(d.Date);
    });

    // Create axes for the x and y scales
    var xAxis = d3.axisBottom(xScale)
        .tickValues(data.filter(function(d, i) {
            var month = d.Date.getMonth();
            return month % 2 === 0;
        }).map(function(d) { return d.Date; }))
        .tickFormat(d3.timeFormat("%b %Y"));

    // Extract the list of countries from the JSON data
    var countries = [...new Set(data.map(d => d.Country))];

    // Create a dropdown menu for selecting the country
    var dropdown = d3.select("#dropdown")
        .append("select")
        .on("change", updateChart);

    dropdown.selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(function(d) { return d; });

    // Set the initial country to display
    var initialCountry = countries[0];

    function updateChart() {
        // Get the selected country from the dropdown menu
        var selectedCountry = dropdown.property("value");

        // Filter the data to include only the data for the selected country
        var filteredData = data.filter(function(d) {
            return d.Country === selectedCountry;
        });

        // Set the domain of the x and y scales
        xScale.domain(filteredData.map(function(d) {
            return d.Date;
        }));

        // Use d3.extent() to get the min and max inflation rates from filteredData
        var [minRate, maxRate] = d3.extent(filteredData, function(d) {
            return d.InflationRate;
        });

        // Set the domain of the y scale to include negative values if minRate is negative
        yScale.domain(minRate < 0 ? [minRate, maxRate] : [0, maxRate]);


            // Remove the old chart elements
        svg.selectAll("*").remove();

        // Append a group element for the chart
        var chartGroup = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Append the x and y axes to the chart
        chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)") // change the rotation angle here
            .attr("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "-0.15em");

// Add a label for the x axis
        chartGroup.append("text")
            .attr("class", "x-axis-label")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom +10)
            .style("text-anchor", "middle")
            .text("Date");

// Add a label for the y axis
        chartGroup.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -height / 2)
            .attr("y", -margin.left+70)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Inflation Rate");

        chartGroup.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // Define a color scale based on the inflation rate
        var colorScale = d3.scaleSequential()
            .interpolator(d3.interpolatePlasma);



        // Add rectangles to the SVG
        chartGroup.selectAll(".bar")
            .data(filteredData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return xScale(d.Date);
            })
            .attr("y", function(d) {
                return yScale(Math.max(0, d.InflationRate));
            })
            .attr("width", xScale.bandwidth())
            .attr("height", function(d) {
                return Math.abs(yScale(d.InflationRate) - yScale(0));
            })
            .style("fill", function(d) {
                return colorScale(d.InflationRate);
            })

    }
    updateChart(initialCountry);

});
