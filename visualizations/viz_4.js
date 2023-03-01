function drawChart_v4() {
    const div_id = "#v4";
    // Arnaud - Flow graph

    d3.select(div_id)
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center")
        .style("height", "70vh")
        .style("width", "100%");

    // format variables
    var formatNumber = d3.format(",.0f"), // zero decimal places
        format = function(d) { return formatNumber(d); },
        color = d3.scaleOrdinal(d3.schemeCategory10);

    // append the svg object to the body of the page
    var svg = d3.select(div_id).append("svg")
        .attr("width", 1020)
        .attr("height", 520)
        .append("g")
        .attr("transform",
            "translate(" + "10" + "," + "10" + ")");

    // Set the sankey diagram properties
    var sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(40)
        .size([1000, 500]);

    var path = sankey.links();

    // load the data
    d3.json("data/sankley.json").then(function(sankeydata) {

        graph = sankey(sankeydata);

        // add in the links
        var link = svg.append("g").selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function(d) { return d.width; });

        // add the link titles
        link.append("title")
            .text(function(d) {
                return d.source.name + " → " +
                    d.target.name + "\n" + format(d.value); });

        // add in the nodes
        var node = svg.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node");

        // add the rectangles for the nodes
        node.append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) {
                return d.color = color(d.name.replace(/ .*/, "")); })
            .style("stroke", function(d) {
                return d3.rgb(d.color).darker(2); })
            .append("title")
            .text(function(d) {
                return d.name + "\n" + format(d.value); });

        // add in the title for the nodes
        node.append("text")
            .attr("x", function(d) { return d.x0 - 6; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x0 < 1000 / 2; })
            .attr("x", function(d) { return d.x1 + 6; })
            .attr("text-anchor", "start");

    });

}
drawChart_v4();
