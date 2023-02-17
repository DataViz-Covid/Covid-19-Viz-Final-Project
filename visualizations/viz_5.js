function drawChart_v5() {
    const div_id = "#v5";
    // Clara - Death % / county

    //Width and height
    let win_width = d3.select(div_id).node().getBoundingClientRect().width;
    let win_height = win_width/1.8;

    let normalize_name = function (name) {
        return name.replaceAll(' ', '').replaceAll('.', '');
    }


    // create a tooltip
    let Tooltip = d3.select(div_id)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("padding", "5px");

    let margin = {top: 0, right: win_width/4, bottom: 0, left: win_width/4};
    let width = win_width - margin.right - margin.left;
    let height = win_height - margin.top - margin.bottom;
    
    
    
    let svg = d3.select(div_id)
        .append("svg")
        .attr("viewBox", "0 0 " + win_width + " " + win_height)
    
    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");     

    // Load external data and boot
    d3.json("../data/countries.json").then( function(data) {

        function getGroupedVal (func, ax) {
            return func(data.features, function (d){
                return func(d.geometry.coordinates, function (d1) {
                    return d1[0][ax];
                    
                })
            })
        }

        const max_x = getGroupedVal(d3.max, 0);
        const max_y = getGroupedVal(d3.max, 1);
        const min_x = getGroupedVal(d3.min, 0);
        const min_y = getGroupedVal(d3.min, 1);

        const ratio = (max_x-min_x) / (max_y-min_y);

        // Map and projection
        const projection = d3.geoMercator().translate([width/2, height/1.8]);
        const path = d3.geoPath(projection);

        let countries;

        // Draw the map
        countries = g.append("g")
            .attr("width", width)
            .attr("height", height)
            .append("g")    
            .selectAll("path")
            .data(data.features)
            .enter()
            .append('path')
            .attr("id", function (d){ return normalize_name("country_" + d.properties["ADMIN"]); } )
            .attr("d", path)
            .attr("fill", "white")
            .style("stroke", "black")
            

    })



}
drawChart_v5();
