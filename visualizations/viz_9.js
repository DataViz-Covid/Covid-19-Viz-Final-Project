function drawChart_v9() {
    const div_id = "#v9";

    var list1 = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"];
    var list2 = ["China", "India", "United States", "Japan", "Brazil"];
    var all = false

    document.getElementById('radio3').onchange = function() {
        var markedradio = document.querySelector('input[type="radio"]:checked'); 
        if (markedradio.id == "Countries")
        {
            document.getElementById('check').style="display: block"
            document.getElementById('cont').style="display: none"
            d3.selectAll("#svg9").remove()
            draw_viz(); 
            
        }
        else {
            document.getElementById('cont').style="display: block"
            document.getElementById('check').style="display: none"
            d3.selectAll("#svg9").remove()
            draw_continents(); 
        }
        
    }
    document.getElementById('check').onchange = function() { 
        all = false;
        console.log("changed")
        list2 = []
        var markedCheckbox = document.querySelectorAll('input[type="checkbox"]:checked');  
        for (var checkbox of markedCheckbox) {  
            if (checkbox.id == "Countries") {
                all = true;
            }
          list2.push(checkbox.id);  
        } 
        d3.selectAll("#svg9").remove()
        draw_viz();                 
    }  

    document.getElementById('cont').onchange = function() {  
        list1 = []
        var markedCheckbox = document.querySelectorAll('input[type="checkbox"]:checked');  
        for (var checkbox of markedCheckbox) { 
          list1.push(checkbox.id);  
        }  
        d3.selectAll("#svg9").remove()
        draw_continents(); 
      }  
    
    
      
      // Clara - Line graph Daily vax doses given per day per country
  
      let ratio = 2.5; // 3 width = 1 height
      let win_width = d3.select(div_id).node().getBoundingClientRect().width;
      let win_height = win_width / ratio;
  
      // set the dimensions and margins of the graph
      let margin = {top: 30, right: 30, bottom: 50, left: 70};
      let width = win_width - margin.right - margin.left;
      let height = win_height - margin.top - margin.bottom;
      draw_continents();
    
    function draw_viz() {

	let svg = d3.select(div_id)
		.append("svg")
		.attr("viewBox", "0 0 " + win_width + " " + win_height)
        .attr("id","svg9")

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");     


    let normalize_name = function (name) {
        return name.replaceAll(' ','').replaceAll('.', '').replaceAll('\'', '');
    }
    
    
    d3.csv("data_clean/viz9.csv", function(d){
        return { date : d3.timeParse("%Y-%m-%d")(d.date), location : d.location , new_vaccinations : d.new_vaccinations }
      }).then( function(data) {

        data.forEach(function(d) {
            d['new_vaccinations'] = +d['new_vaccinations'];
        });
        
        if (all == false) {
        data=data.filter(function(d){return (list2.includes(d.location)) })}
        //console.log(dat)

        var x = d3.scaleTime().domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
      
        g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)))
        .selectAll("text")  
		 .style("text-anchor", "end")
		 .attr("dx", "-.8em")
		 .attr("dy", "-.6em")
		 .attr("transform", "rotate(-45)" );


            
        g.append("text")
            .attr("text-anchor", "end")
            .attr("x", width +20)
            .attr("y", height+20)
            .text("Date");

        // Add Y axis        
        var y = d3.scaleLinear().range([height, 0])
            .domain([0, d3.max(data, function(d) { return d.new_vaccinations; })])
            .range([height,0 ]);

        g.append("g")
            .call(d3.axisLeft(y))
        g.append("text")
            .attr("text-anchor", "end")
            .attr("x", 10)
            .attr("y", 10 )
            .text("New Vaccinations")
            .attr("text-anchor", "start")

        var sumstat = d3.groups(data, d => d.location)
        var countries = sumstat.map(function(d){return d[0]});
       
    
        var color = d3.scaleOrdinal()
                .domain([countries])
                .range(['#16f306', '#feff1e', '#1ec9ff', '#f80187', '#8e8e8e', '#ff9b42', '#cd0a08', '#7c27d2', '#94fc8c', '#feff89', '#89e2ff', '#fe8ac9', '#c4c4c4', '#ffae66', '#f62927', '#b27ee6']);



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
        

        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip

        
        let mouseover = function (d) {
            Tooltip.style("opacity", 1);
        }
        let mousemove = function (event, d) {
            

            Tooltip.html(d.location + ': <br>'+ d.date + ': <br> vaccinations:'+ d.new_vaccinations )
            .style("left", (event.pageX+20) + "px")
            .style("top", (event.pageY) + "px");
        }
        let mouseleave = function (d) {
            Tooltip.style("opacity", 0);
        }

        var highlight = function(event, d){
            // reduce opacity of all groups
            d3.selectAll(".point").style("opacity", 0)
            // expect the one that is hovered
            d3.selectAll("."+ normalize_name(d[0])).style("opacity", 1)
        }

        // And when it is not hovered anymore
        var noHighlight = function(event, d){
            d3.selectAll(".point").style("opacity", 1)
        }

        var highlight1 = function(event, d){
            // reduce opacity of all groups
            d3.selectAll(".point").style("opacity", 0)
            // expect the one that is hovered
            d3.selectAll("."+ normalize_name(d)).style("opacity", 1)
        }

            
        g.selectAll(".line")
            .data(sumstat)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d[0]) })
            .attr("class", function(d) { return "point "+ normalize_name(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function(d) {  return x(d.date); })
                    .y(function(d) { return y(d.new_vaccinations); })
                    (d[1])
            
            })

        g.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function(d) { return "point "+ normalize_name(d.location) })
            .attr("cx", function(d) { return x(d.date); } )
            .attr("cy", function(d) { return y(d.new_vaccinations);})
            .attr("r", 2)
            .attr("fill", function(d){ return color(d.location)})
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
        

        if (all == false) {

         svg.selectAll("myrect")
            .data(countries)
            .enter()
            .append("circle")
            .attr("cx", width - 135)
            .attr("cy", function(d,i){ return  20+ i*25})
            .attr("r", 7)
            .style("fill", function(d){ return color(d)})
            .on("mouseover", highlight1)
            .on("mouseleave", noHighlight)


        // Add labels beside legend dots
        svg.selectAll("mylabels")
            .data(countries)
            .enter()
            .append("text")
            .attr("x", width-120)
            .attr("y", function(d,i){ return i * 25 + 20})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight1)
            .on("mouseleave", noHighlight) 

        }

        });

    }


    function draw_continents() {
        d3.selectAll("#svg9").remove()
        let svg = d3.select(div_id)
		.append("svg")
		.attr("viewBox", "0 0 " + win_width + " " + win_height)
        .attr("id","svg9")

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");     


    let normalize_name = function (name) {
        return name.replaceAll(' ','').replaceAll('.', '').replaceAll('\'', '');
    }
    d3.csv("data_clean/viz9_cont.csv", function(d){
        return { date : d3.timeParse("%Y-%m-%d")(d.date), continent : d.continent , new_vaccinations : d.new_vaccinations }
      }).then( function(data) {

        data.forEach(function(d) {
            d['new_vaccinations'] = +d['new_vaccinations'];
        });
        
        data=data.filter(function(d){return (list1.includes(d.continent)) })

        var x = d3.scaleTime().domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
      
        g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)))
        .selectAll("text")  
		 .style("text-anchor", "end")
		 .attr("dx", "-.8em")
		 .attr("dy", "-.6em")
		 .attr("transform", "rotate(-45)" );


            
        g.append("text")
            .attr("text-anchor", "end")
            .attr("x", width +20)
            .attr("y", height+20)
            .text("Date");

        // Add Y axis        
        var y = d3.scaleLinear().range([height, 0])
            .domain([0, d3.max(data, function(d) { return d.new_vaccinations; })])
            .range([height,0 ]);

        g.append("g")
            .call(d3.axisLeft(y))
        g.append("text")
            .attr("text-anchor", "end")
            .attr("x", 10)
            .attr("y", 10 )
            .text("New Vaccinations")
            .attr("text-anchor", "start")

        var sumstat = d3.groups(data, d => d.continent)
        var continents = sumstat.map(function(d){return d[0]});
       
    
        var color = d3.scaleOrdinal()
                .domain([continents])
                .range(['#16f306', '#feff1e', '#1ec9ff', '#f80187', '#8e8e8e', '#ff9b42', '#cd0a08']);



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
        

        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip

        
        let mouseover = function (d) {
            Tooltip.style("opacity", 1);
        }
        let mousemove = function (event, d) {
            

            Tooltip.html(d.continent + ': <br>'+ d.date + ': <br> vaccinations:'+ d.new_vaccinations )
            .style("left", (event.pageX+20) + "px")
            .style("top", (event.pageY) + "px");
        }
        let mouseleave = function (d) {
            Tooltip.style("opacity", 0);
        }

        var highlight = function(event, d){
            // reduce opacity of all groups
            d3.selectAll(".point").style("opacity", 0)
            // expect the one that is hovered
            d3.selectAll("."+ normalize_name(d[0])).style("opacity", 1)
        }

        // And when it is not hovered anymore
        var noHighlight = function(event, d){
            d3.selectAll(".point").style("opacity", 1)
        }

        var highlight1 = function(event, d){
            // reduce opacity of all groups
            d3.selectAll(".point").style("opacity", 0)
            // expect the one that is hovered
            d3.selectAll("."+ normalize_name(d)).style("opacity", 1)
        }

            
        g.selectAll(".line")
            .data(sumstat)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d[0]) })
            .attr("class", function(d) { return "point "+ normalize_name(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function(d) {  return x(d.date); })
                    .y(function(d) { return y(d.new_vaccinations); })
                    (d[1])
            
            })

        g.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function(d) { return "point "+ normalize_name(d.continent) })
            .attr("cx", function(d) { return x(d.date); } )
            .attr("cy", function(d) { return y(d.new_vaccinations);})
            .attr("r", 2)
            .attr("fill", function(d){ return color(d.continent)})
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        svg.selectAll("myrect")
            .data(continents)
            .enter()
            .append("circle")
            .attr("cx", width - 135)
            .attr("cy", function(d,i){ return  20+ i*25})
            .attr("r", 7)
            .style("fill", function(d){ return color(d)})
            .on("mouseover", highlight1)
            .on("mouseleave", noHighlight)

        var click = function(event, d){
            list3 = [d]
            d3.selectAll("#svg9").remove()
            // Clara - Line graph Daily vax doses given per day per country
        
            let ratio = 2.5; // 3 width = 1 height
            let win_width = d3.select(div_id).node().getBoundingClientRect().width;
            let win_height = win_width / ratio;
        
            // set the dimensions and margins of the graph
            let margin = {top: 30, right: 30, bottom: 50, left: 70};
            let width = win_width - margin.right - margin.left;
            let height = win_height - margin.top - margin.bottom;
      
            let svg = d3.select(div_id)
            .append("svg")
            .attr("viewBox", "0 0 " + win_width + " " + win_height)
            .attr("id","svg9")
      
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 
            d3.csv("data_clean/viz9.csv", function(d){
                return { date : d3.timeParse("%Y-%m-%d")(d.date), continent: d.continent, location : d.location , new_vaccinations : d.new_vaccinations }
                }).then( function(data) {
        
                data.forEach(function(d) {
                    d['new_vaccinations'] = +d['new_vaccinations'];
                });
                
                
                data=data.filter(function(d){return (list3.includes(d.continent)) })
                //console.log(dat)
        
                var x = d3.scaleTime().domain(d3.extent(data, function(d) { return d.date; }))
                .range([ 0, width ]);
              
                g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)))
                .selectAll("text")  
                 .style("text-anchor", "end")
                 .attr("dx", "-.8em")
                 .attr("dy", "-.6em")
                 .attr("transform", "rotate(-45)" );
        
        
                    
                g.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", width +20)
                    .attr("y", height+20)
                    .text("Date");
        
                // Add Y axis        
                var y = d3.scaleLinear().range([height, 0])
                    .domain([0, d3.max(data, function(d) { return d.new_vaccinations; })])
                    .range([height,0 ]);
        
                g.append("g")
                    .call(d3.axisLeft(y))
                g.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", 10)
                    .attr("y", 10 )
                    .text("New Vaccinations")
                    .attr("text-anchor", "start")
        
                var sumstat = d3.groups(data, d => d.location)
                var countries = sumstat.map(function(d){return d[0]});
               
            
                var color = d3.scaleOrdinal()
                        .domain([countries])
                        .range(['#16f306', '#feff1e', '#1ec9ff', '#f80187', '#8e8e8e', '#ff9b42', '#cd0a08', '#7c27d2', '#94fc8c', '#feff89', '#89e2ff', '#fe8ac9', '#c4c4c4', '#ffae66', '#f62927', '#b27ee6']);
        
        
        
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
                
        
                // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        
                
                let mouseover = function (d) {
                    Tooltip.style("opacity", 1);
                }
                let mousemove = function (event, d) {
                    
        
                    Tooltip.html(d.location + ': <br>'+ d.date + ': <br> vaccinations:'+ d.new_vaccinations )
                    .style("left", (event.pageX+20) + "px")
                    .style("top", (event.pageY) + "px");
                }
                let mouseleave = function (d) {
                    Tooltip.style("opacity", 0);
                }
        
                var highlight = function(event, d){
                    // reduce opacity of all groups
                    d3.selectAll(".point").style("opacity", 0)
                    // expect the one that is hovered
                    d3.selectAll("."+ normalize_name(d[0])).style("opacity", 1)
                }
        
                // And when it is not hovered anymore
                var noHighlight = function(event, d){
                    d3.selectAll(".point").style("opacity", 1)
                }
        
                var highlight1 = function(event, d){
                    // reduce opacity of all groups
                    d3.selectAll(".point").style("opacity", 0)
                    // expect the one that is hovered
                    d3.selectAll("."+ normalize_name(d)).style("opacity", 1)
                }
        
                    
                g.selectAll(".line")
                    .data(sumstat)
                    .join("path")
                    .attr("fill", "none")
                    .attr("stroke", function(d){ return color(d[0]) })
                    .attr("class", function(d) { return "point "+ normalize_name(d[0]) })
                    .attr("stroke-width", 1.5)
                    .attr("d", function (d) {
                        return d3.line()
                            .x(function(d) {  return x(d.date); })
                            .y(function(d) { return y(d.new_vaccinations); })
                            (d[1])
                    
                    })
        
                g.append('g')
                    .selectAll("dot")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", function(d) { return "point "+ normalize_name(d.location) })
                    .attr("cx", function(d) { return x(d.date); } )
                    .attr("cy", function(d) { return y(d.new_vaccinations);})
                    .attr("r", 2)
                    .attr("fill", function(d){ return color(d.location)})
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)

                g.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", width +20)
                    .attr("y", height + 40)
                    .text("Back")
                    .on("click", draw_continents);

        
                });
        
        }
        // Add labels beside legend dots
        svg.selectAll("mylabels")
            .data(continents)
            .enter()
            .append("text")
            .attr("x", width-120)
            .attr("y", function(d,i){ return i * 25 + 20})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight1)
            .on("mouseleave", noHighlight) 
            .on("click", click)
        });
    }

}
drawChart_v9();
