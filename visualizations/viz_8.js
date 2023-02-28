const margin = { top: 30, right: 100, bottom: 50, left: 300 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
// Load data from JSON file
d3.json("visualizations/viz8.json").then(function(data) {
    // Extract countries from data
    var countries = data.data.map(function(d) { return d.Country; });

    // Populate dropdown menu
    var select = d3.select("#country-select");
    select.selectAll("option")
        .style("position", "absolute")
        .style("top", margin.top + "px")
        .style("left", margin.left + "px")
        .data(countries)
        .enter()
        .append("option")
        .text(function(d) { return d; });

    function drawPieChart(country) {
        // Extract data for selected country
        var selectedData = data.data.find(function(d) { return d.Country === country; });
        var vaccines = JSON.parse(selectedData.vaccines.replace(/'/g, '"'));

        // Compute total number of doses
        var totalDoses = parseInt(selectedData.totalDoses);


        // Compute data for pie chart
        var pieData = vaccines.map(function(d) {
            return {
                label: d.name,
                value: d.count
            };
        });

        // Compute percentages for each vaccine type
        var totalVaccineDoses = d3.sum(pieData, function(d) { return d.value; });
        pieData.forEach(function(d) {
            d.percent = Math.round(d.value / totalVaccineDoses * 100);
            d.value = d.value / totalDoses;
        });

        // Set dimensions for pie chart
        var width = 300;
        var height = 300;
        var radius = Math.min(width, height) / 2;

        // Set color scale for pie chart
        var color = d3.scaleOrdinal()
            .domain(pieData.map(function(d) { return d.label; }))
            .range( d3.schemePaired );



        // Define arc for pie chart
        var arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        // Define pie layout
        var pie = d3.pie()
            .sort(null)
            .value(function(d) { return d.value; });

        // Clear previous chart
        d3.select("#pie-chart").selectAll("*").remove();

        // Append main SVG element
        var svg = d3.select("#pie-chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
            .append("g")
            .attr("transform", "translate(" + (margin.left + width / 2) + "," + (margin.top + height / 2) + ")");

        // Append pie slices
        var arcs = svg.selectAll(".arc")
            .data(pie(pieData))
            .enter()
            .append("g")
            .attr("class", "arc");

        var hoverColor = d3.scaleOrdinal()
            .domain(pieData.map(function(d) { return d.label; }))
            .range(pieData.map(function(d) { return d3.rgb(color(d.label)).darker(); }));


        arcs.append("path")
            .attr("d", arc)
            .attr("fill", function(d) { return color(d.data); })
            .on("mouseover", function(d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", "darkgreen");
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", function(d) { return color(d.data); });
            })



            .append("title")
            .text(function(d) {
                var doses = d.data.label + ": " + Math.round(d.data.value * totalDoses) + " doses";
                return doses + " (" + d.data.percent + "%)";
            })
            .attr("transform", function(d) {
                var pos = arc.centroid(d);
                pos[1] += 20; // adjust vertical position of tooltip
                return "translate(" + pos + ")";
            })
            .attr("dy", "0.35em");


        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }
    }





    // Initialize pie chart with first country
    drawPieChart(countries[0]);

// Redraw pie chart when dropdown selection changes
    select.on("change", function() {
        // Clear previous chart
        d3.select("#pie-chart").selectAll("*").remove();

        var country = d3.select(this).property("value");
        drawPieChart(country);
    });

});