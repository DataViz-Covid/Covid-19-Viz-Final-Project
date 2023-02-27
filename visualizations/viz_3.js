const drawChart = async () => {
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    const first_dose = await d3.csv("first_dose_by_age.csv");
    const second_dose = await d3.csv("second_dose_by_age.csv");
    const third_dose = await d3.csv("third_dose_by_age.csv");

    let selected_age = "60-69";
    let selected_dose = first_dose;

    const first_dose_svg = d3
        .select("#dose-one")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 20)
        .style("border", "1px solid #9900ff")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const second_dose_svg = d3
        .select("#dose-two")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 20)
        .style("border", "1px solid #9900ff")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const third_dose_svg = d3
        .select("#dose-three")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 20)
        .style("border", "1px solid #9900ff")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const firstDoseX = d3
        .scaleBand()
        .domain(first_dose.map((d) => d.Entity))
        .range([0, width])
        .padding(0.1);

    const firstDoseY = d3
        .scaleLinear()
        .domain([0, d3.max(first_dose, (d) => +d[selected_age])])
        .range([height, 0]);

    const firstDoseXAxis = d3.axisBottom(firstDoseX).tickSize(0);

    const firstDoseYAxis = d3.axisLeft(firstDoseY).tickSize(0);

    const secondDoseX = d3
        .scaleBand()
        .domain(second_dose.map((d) => d.Entity))
        .range([0, width])
        .padding(0.1);

    const secondDoseY = d3
        .scaleLinear()
        .domain([0, d3.max(second_dose, (d) => +d[selected_age])])
        .range([height, 0]);

    const secondDoseXAxis = d3.axisBottom(secondDoseX).tickSize(0);

    const secondDoseYAxis = d3.axisLeft(secondDoseY).tickSize(0);

    const thirdDoseX = d3
        .scaleBand()
        .domain(third_dose.map((d) => d.Entity))
        .range([0, width])
        .padding(0.1);

    const thirdDoseY = d3
        .scaleLinear()
        .domain([0, d3.max(third_dose, (d) => +d[selected_age])])
        .range([height, 0]);

    const thirdDoseXAxis = d3.axisBottom(thirdDoseX).tickSize(0);

    const thirdDoseYAxis = d3.axisLeft(thirdDoseY).tickSize(0);

    first_dose_svg
        .append("g")
        .attr("class", "first-dose-x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(firstDoseXAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    first_dose_svg
        .append("g")
        .attr("class", "first-dose-y-axis")
        .call(firstDoseYAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Percentage of Population");

    second_dose_svg
        .append("g")
        .attr("class", "second-dose-x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(secondDoseXAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    second_dose_svg
        .append("g")
        .attr("class", "second-dose-y-axis")
        .call(secondDoseYAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Percentage of Population");

    third_dose_svg
        .append("g")
        .attr("class", "third-dose-x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(thirdDoseXAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    third_dose_svg
        .append("g")
        .attr("class", "third-dose-y-axis")
        .call(thirdDoseYAxis);

    first_dose_svg
        .selectAll(".first-dose-bars")
        .data(first_dose)
        .join("rect")
        .attr("class", "first-dose-line")
        .attr("x", (d) => firstDoseX(d.Entity))
        .attr("y", (d) => firstDoseY(+d[selected_age]))
        .attr("width", firstDoseX.bandwidth())
        .attr("height", (d) => height - firstDoseY(+d[selected_age]))
        .attr("fill", "#b3b3ff")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#6b00b3")
        .style("cursor", "pointer")
        .on("mousemove", function (e, d) {
            let tooltip = d3
                .select(".tooltip")
                .transition()
                .duration(100)
                .style("opacity", 1)
                .style("display", "block");

            d3.select(".tooltip")
                .html(
                    `<div class="tooltip-header">${d.Entity}</div>
      <div class="tooltip-body">${d[selected_age]}</div>`
                )
                .style("left", e.pageX + 10 + "px")
                .style("top", e.pageY + "px");
        })
        .on("mouseout", function (d) {
            d3.select(".tooltip")
                .transition()
                .duration(100)
                .style("opacity", "0")
                .style("display", "none");
        });

    // x axis label
    first_dose_svg
        .append("text")
        .attr("class", "x axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom + 15)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("Country");

    // y axis label
    first_dose_svg
        .append("text")
        .attr("class", "y axis-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left / 2)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Percentage of Population");

    // title
    first_dose_svg
        .append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2 + 5)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text(`First Dose`);

    second_dose_svg
        .selectAll(".second-dose-bars")
        .data(second_dose)
        .join("rect")
        .attr("class", "second-dose-line")
        .attr("x", (d) => secondDoseX(d.Entity))
        .attr("y", (d) => secondDoseY(+d[selected_age]))
        .attr("width", secondDoseX.bandwidth())
        .attr("height", (d) => height - secondDoseY(+d[selected_age]))
        .attr("fill", "#b3b3ff")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#6b00b3")
        .style("cursor", "pointer")
        .on("mousemove", function (e, d) {
            let tooltip = d3
                .select(".tooltip")
                .transition()
                .duration(100)
                .style("opacity", 1)
                .style("display", "block");

            d3.select(".tooltip")
                .html(
                    `<div class="tooltip-header">${d.Entity}</div>
      <div class="tooltip-body">${d[selected_age]}</div>`
                )
                .style("left", e.pageX + 10 + "px")
                .style("top", e.pageY + "px");
        })
        .on("mouseout", function (d) {
            d3.select(".tooltip")
                .transition()
                .duration(100)
                .style("opacity", "0")
                .style("display", "none");
        });

    // x axis label
    second_dose_svg
        .append("text")
        .attr("class", "x axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom + 15)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("Country");

    // y axis label
    second_dose_svg
        .append("text")
        .attr("class", "y axis-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left / 2)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Percentage of Population");

    // title
    second_dose_svg
        .append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2 + 5)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text(`Second Dose`);

    third_dose_svg
        .selectAll(".third-dose-bars")
        .data(third_dose)
        .join("rect")
        .attr("class", "third-dose-line")
        .attr("x", (d) => thirdDoseX(d.Entity))
        .attr("y", (d) => thirdDoseY(+d[selected_age]))
        .attr("width", thirdDoseX.bandwidth())
        .attr("height", (d) => height - thirdDoseY(+d[selected_age]))
        .attr("fill", "#b3b3ff")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#6b00b3")
        .style("cursor", "pointer")
        .on("mousemove", function (e, d) {
            let tooltip = d3
                .select(".tooltip")
                .transition()
                .duration(100)
                .style("opacity", 1)
                .style("display", "block");

            d3.select(".tooltip")
                .html(
                    `<div class="tooltip-header">${d.Entity}</div>
      <div class="tooltip-body">${d[selected_age]}</div>`
                )
                .style("left", e.pageX + 10 + "px")
                .style("top", e.pageY + "px");
        })
        .on("mouseout", function (d) {
            d3.select(".tooltip")
                .transition()
                .duration(100)
                .style("opacity", "0")
                .style("display", "none");
        });

    // x axis label
    third_dose_svg
        .append("text")
        .attr("class", "x axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom + 15)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("Country");

    // y axis label
    third_dose_svg
        .append("text")
        .attr("class", "y axis-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left / 2)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Percentage of Population");

    // title
    third_dose_svg
        .append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2 + 5)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text(`Third Dose`);

    d3.select("#age-select").on("change", function () {
        selected_age = d3.select(this).property("value");

        firstDoseX.domain(first_dose.map((d) => d.Entity)).range([0, width]);

        firstDoseY
            .domain([0, d3.max(first_dose, (d) => +d[selected_age])])
            .range([height, 0]);

        secondDoseX.domain(second_dose.map((d) => d.Entity)).range([0, width]);

        secondDoseY
            .domain([0, d3.max(second_dose, (d) => +d[selected_age])])
            .range([height, 0]);

        thirdDoseX.domain(third_dose.map((d) => d.Entity)).range([0, width]);

        thirdDoseY
            .domain([0, d3.max(third_dose, (d) => +d[selected_age])])
            .range([height, 0]);
        first_dose_svg
            .selectAll(".first-dose-x-axis")
            .transition()
            .duration(1000)
            .call(firstDoseXAxis);
        first_dose_svg
            .selectAll(".first-dose-y-axis")
            .transition()
            .duration(1000)
            .call(firstDoseYAxis);

        second_dose_svg
            .selectAll(".second-dose-x-axis")
            .transition()
            .duration(1000)
            .call(secondDoseXAxis);
        second_dose_svg
            .selectAll(".second-dose-y-axis")
            .transition()
            .duration(1000)
            .call(secondDoseYAxis);

        third_dose_svg
            .selectAll(".third-dose-x-axis")
            .transition()
            .duration(1000)
            .call(thirdDoseXAxis);
        third_dose_svg
            .selectAll(".third-dose-y-axis")
            .transition()
            .duration(1000)
            .call(thirdDoseYAxis);

        first_dose_svg
            .selectAll("rect")
            .data(first_dose)
            .join("rect")
            .attr("class", ".first-dose-bars")
            .transition()
            .duration(1000)
            .attr("x", (d) => firstDoseX(d.Entity))
            .attr("y", (d) => firstDoseY(+d[selected_age]))
            .attr("width", firstDoseX.bandwidth())
            .attr("height", (d) => height - firstDoseY(+d[selected_age]))
            .attr("fill", "#9999ff")
            .attr("fill-opacity", 0.5)
            .attr("stroke", "#9999ff")
            .style("cursor", "pointer");

        second_dose_svg
            .selectAll("rect")
            .data(second_dose)
            .join("rect")
            .attr("class", ".second-dose-bars")
            .transition()
            .duration(1000)
            .attr("x", (d) => secondDoseX(d.Entity))
            .attr("y", (d) => secondDoseY(+d[selected_age]))
            .attr("width", secondDoseX.bandwidth())
            .attr("height", (d) => height - secondDoseY(+d[selected_age]))
            .attr("fill", "#9999ff")
            .attr("fill-opacity", 0.5)
            .attr("stroke", "#9999ff")
            .style("cursor", "pointer");

        third_dose_svg
            .selectAll("rect")
            .data(third_dose)
            .join("rect")
            .attr("class", ".third-dose-bars")
            .transition()
            .duration(1000)
            .attr("x", (d) => thirdDoseX(d.Entity))
            .attr("y", (d) => thirdDoseY(+d[selected_age]))
            .attr("width", thirdDoseX.bandwidth())
            .attr("height", (d) => height - thirdDoseY(+d[selected_age]))
            .attr("fill", "#9999ff")
            .attr("fill-opacity", 0.5)
            .attr("stroke", "#9999ff")
            .style("cursor", "pointer");
    });
};

drawChart();
