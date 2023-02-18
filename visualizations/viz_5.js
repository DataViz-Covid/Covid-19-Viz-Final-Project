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

    let countries;

    // Load external data and boot
    d3.json("../data/countries.json").then( function(data) {
        
        // Map and projection
        const projection = d3.geoMercator().translate([width/2, height/1.8]);
        const path = d3.geoPath(projection);

        

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
            

    


        d3.csv("../data_clean/viz1.csv").then( function(dat) {

            dat.forEach(function(d) {
                d['total_deaths_per_million'] = +d['total_deaths_per_million'];
            });

            let data_dict = {}
            dat.forEach (function(d) {
                data_dict[d["location"]] = d["total_deaths_per_million"];
            });

            const max_count = d3.max(dat, d => d["total_deaths_per_million"]);
            

            const colors = d3.scaleThreshold()
                .domain([10, 50, 100, 300, 500, 1000, 2000, 3000, 4000, max_count])
                .range(d3.schemeGreens[9])


            // Three function that change the tooltip when user hover / move / leave a cell
            let mouseover = function (d) {
                Tooltip.style("opacity", 1);
            }
            let mousemove = function (event, d) {
                const loc = d.properties["ADMIN"];
                const death_count = data_dict[loc];
                Tooltip.html(loc + "<br>" + death_count)
                .style("left", (event.pageX+20) + "px")
                .style("top", (event.pageY) + "px");
                console.log(loc, death_count)
            }
            let mouseleave = function (d) {
                Tooltip.style("opacity", 0);
            }

            countries.attr("fill", function (d){ if (d.properties["ADMIN"] in data_dict) return colors(data_dict[d.properties["ADMIN"]]) ; else return "white" })
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave) 
           
            var legend = svg.selectAll('g.legendEntry')
                .data(colors.range())
                .enter()
                .append('g').attr('class', 'legendEntry');
        
            legend
                .append('rect')
                .attr("x", 100)
                .attr("y", function(d, i) {
                return 30+ i * 30;
                })
            .attr("width", 20)
            .attr("height", 20)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("fill", function(d){return d;}); 
               //the data objects are the fill colors
        
             legend
            .append('text')
            .attr("x", 130) //leave 5 pixel space after the <rect>
            .attr("y", function(d, i) {
               return 30+ i * 30;
            })
            .attr("dy", "0.8em") //place text one line *below* the x,y point
            .text(function(d,i) {
                var extent = colors.invertExtent(d);
                //extent will be a two-element array, format it however you want:
                var format = d3.format("0.2f");
                if( i == 0 ) return "< " + format(+extent[1]);
                if(i == 8) return ">" + format(+extent[0]);
                return format(+extent[0]) + " - " + format(+extent[1]);
            });
            legend.append('text')
            .attr("x", 100)
            .attr("y", 20)
            .text("Deaths per million") 


    })


    })
}
drawChart_v5();
