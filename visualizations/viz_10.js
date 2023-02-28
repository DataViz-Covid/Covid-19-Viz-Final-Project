function drawChart_v10() {
    const div_id = "#v10";
    // Clara - Scatter plot of hospital stay duration per age
    var choice = "age_70";

    document.getElementById('radio2').onchange = function() {
        var markedradio = document.querySelector('input[type="radio"]:checked'); 
        if (markedradio.id == "65 or older")
        {
            choice = "age_65";
            
        }
        else if (markedradio.id == "median age"){
            choice = "median_age";
        }
        else if (markedradio.id == "life expectancy"){
            choice = "life_exepctancy";
        }
        else { choice = "age_70";}

        d3.selectAll("#svg10").remove()
        draw_viz()
    }
    draw_viz()
    function draw_viz() {
    let ratio = 2.5; // 3 width = 1 height
    let win_width = d3.select(div_id).node().getBoundingClientRect().width;
    let win_height = win_width / ratio;

    // set the dimensions and margins of the graph
    let margin = {top: 30, right: 30, bottom: 30, left: 100};
    let width = win_width - margin.right - margin.left;
    let height = win_height - margin.top - margin.bottom;


	let svg = d3.select(div_id)
		.append("svg")
		.attr("viewBox", "0 0 " + win_width + " " + win_height)
        .attr("id","svg10")

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    let normalize_name = function (name) {
        return name.replaceAll(' ','').replaceAll('.', '').replaceAll('\'', '');
    }

        d3.csv("data_clean/viz10.csv").then( function(data) {

            data.forEach(function(d) {
                d['weekly_hosp_admissions_per_million'] = +d['weekly_hosp_admissions_per_million'];
                d['median_age'] = +d['median_age'];
                d["aged_65_older"] = +d["aged_65_older"] 
                d["aged_70_older"] = +d["aged_70_older"]
                d["life_expectancy"] = +d["life_expectancy"]
            });
    
            // Add X axis
            var x
            if(choice == "age_70"){
                x = d3.scaleLinear()
                .domain([0, 4+ d3.max(data, function(d) { return d["aged_70_older"]; })])
                .range([0, width ]);
            }
            else if(choice == "age_65")
            {
                x = d3.scaleLinear()
                .domain([0, 4+ d3.max(data, function(d) { return d["aged_65_older"]; })])
                .range([0, width ]);
            }
            else if(choice == "median_age")
            {
                x = d3.scaleLinear()
                .domain([25, 4+ d3.max(data, function(d) { return d["median_age"]; })])
                .range([0, width ]);
            }
            else
            {
                x = d3.scaleLinear()
                .domain([60, 4+ d3.max(data, function(d) { return d["life_expectancy"]; })])
                .range([0, width ]);
            }
            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                
            g.append("text")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height-10)
                .text("aged 70 or older (%)");
    
            // Add Y axis        
            var y = d3.scaleLinear()
                .domain([0, 1000])
                .range([height,0 ]);
    
            g.append("g")
                .call(d3.axisLeft(y))
            g.append("text")
                .attr("text-anchor", "end")
                .attr("x", 10)
                .attr("y", 10 )
                .text("Highest weekly hospitalization rate per million")
                .attr("text-anchor", "start")
    
    
            var unique = d3.groups(data, d => d.continent);
            var types = unique.map(function(d){return d[0]});
            var color = d3.scaleOrdinal()
                .domain([types])
                .range(d3["schemeCategory10"]);
    
            var tooltip = d3.select(div_id)
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
                if (choice == "age_70") {
                    tooltip
                    .style("opacity", 1)
                    .html("Country: " + d['location']+ '<br> Highest weekly hospital admission rate per million: '+ d['weekly_hosp_admissions_per_million'] +  '<br> 70 or older %: '+ d['aged_70_older'])
                    .style("left", event.pageX + "px")
                    .style("top", (event.pageY - 28) + "px")
                }
                else if (choice == "median_age") {
                    tooltip
                    .style("opacity", 1)
                    .html("Country: " + d['location']+ '<br> Highest weekly hospital admission rate per million: '+ d['weekly_hosp_admissions_per_million'] +  '<br> median age: '+ d['median_age'])
                    .style("left", event.pageX + "px")
                    .style("top", (event.pageY - 28) + "px")
                }
                else if (choice == "life_expectancy") {
                    tooltip
                    .style("opacity", 1)
                    .html("Country: " + d['location']+ '<br> Highest weekly hospital admission rate per million: '+ d['weekly_hosp_admissions_per_million'] +  '<br> Life Expectancy: '+ d['life_exepctancy'])
                    .style("left", event.pageX + "px")
                    .style("top", (event.pageY - 28) + "px")
                }
                else {
                    tooltip
                    .style("opacity", 1)
                    .html("Country: " + d['location']+ '<br> Highest weekly hospital admission rate per million: '+ d['weekly_hosp_admissions_per_million'] +  '<br> 65 or older %: '+ d['aged_65_older'])
                    .style("left", event.pageX + "px")
                    .style("top", (event.pageY - 28) + "px")
                }
            }
    
    
    
            var hideTooltip = function(d) {
                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0)
            }
    
    
            // Add dots
            g.append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", function(d) { return "bubbles "+ normalize_name(d.continent) })
                .attr("cx", function (d) { 
                    if(choice == "age_70") {return x(d["aged_70_older"]);}
                    else if (choice == "age_65") {return x(d["aged_65_older"]);} 
                    else if (choice == "median_age") {return x(d["median_age"]);}
                    else {return x(d["life_expectancy"])} 
                } )
                .attr("cy", function (d) { return y(d['weekly_hosp_admissions_per_million']); } )
                .attr("r",  5 )
                .style("fill", function (d) { return color(d.continent); } )
                // -3- Trigger the functions for hover
                .on("mouseover", showTooltip )
                .on("mouseleave", hideTooltip )
    
            // ---------------------------//
            //       HIGHLIGHT GROUP      //
            // ---------------------------//
    
            // What to do when one group is hovered
            var highlight = function(event, d){
                // reduce opacity of all groups
                d3.selectAll(".bubbles").style("opacity", 0)
                // expect the one that is hovered
                d3.selectAll("."+ normalize_name(d)).style("opacity", 1)
            }
    
            // And when it is not hovered anymore
            var noHighlight = function(event, d){
                d3.selectAll(".bubbles").style("opacity", 1)
            }
    
            // ---------------------------//
            //       LEGEND              //
            // ---------------------------//
    
    
            // Add one dot in the legend for each name.
    
            svg.selectAll("myrect")
                .data(types)
                .enter()
                .append("circle")
                .attr("cx", width - 100)
                .attr("cy", function(d,i){ return 20 + i*25})
                .attr("r", 5)
                .style("fill", function(d){ return color(d)})
                .on("mouseover", highlight)
                .on("mouseleave", noHighlight)
    
            // Add labels beside legend dots
            svg.selectAll("mylabels")
                .data(types)
                .enter()
                .append("text")
                .attr("x", width-100 + 16)
                .attr("y", function(d,i){ return i * 25 + 20})
                .style("fill", function(d){ return color(d)})
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .on("mouseover", highlight)
                .on("mouseleave", noHighlight)
        });
    }
}
drawChart_v10();
