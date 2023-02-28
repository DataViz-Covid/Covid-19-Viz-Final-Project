function drawChart_v12() {
    const div_id = "#v12";
    // Arnaud - Map of measure adopted over time per country

    // Static things
    function normalizeName(name){
        return name.replace(' ', '_');
    }

    // Fields details
    const stay_home = {
        'StayHomeOrder': 'red',
        'StayHomeGen': 'red',
        'StayHomeRiskG': 'orange',
        'RegionalStayHomeOrder': 'orange',
        'StayHomeOrderPartial': 'orange',
        'RegionalStayHomeOrderPartial': 'orange',
        'StayHomeRiskGPartial': 'orange'
    };

    const measure_colorings = {
        'StayHome': stay_home
        //, 'StayHome2': stay_home
    }

    const rangeStart = new Date("2020-01-01");
    const rangeEnd = new Date("2022-07-31");
    const formatTickDate = d3.timeFormat("%Y-%m-%d");

    let selectedMeasure = Object.keys(measure_colorings)[0];
    let selectedDate = rangeStart;
    let playButton;

    const day_in_ms = 1000 * 60 * 60 * 24; // 1000ms, 60s, 60m, 24h = 1Day

    // General formatting and setup
    d3.select(div_id)
        .style("display", "flex")
        .style("justify-content", "center")
        .style("flex-direction", "column")
        .style("align-items", "center")
        .style("height", "70vh")
        .style("width", "100%");

    let main_win_size = 500; //d3.select(div_id).node().getBoundingClientRect().height;

    d3.select(div_id)
        .append('select')
        .on("change", function(d){
            selectedMeasure = d3.select(this).property("value");
            visualizeMeasure(selectedMeasure, selectedDate);
        })
        .selectAll('myOptions')
        .data(Object.keys(measure_colorings))
        .enter()
        .append('option')
        .text(d => d) // text showed in the menu
        .attr("value", d => d);

    let svg = d3.select(div_id)
        .append("svg")
        .attr("viewBox", "0 0 " + main_win_size + " " + main_win_size);

    // Retrieving European countries
    let european_country_data;
    let european_country_codes;
    d3.csv("data/continents.csv").then(function (data) {
        european_country_data = data.filter(country => country["Continent"] === "Europe");
        european_country_codes = european_country_data.map(country => country["Code"]);
    });

    // Drawing the map
    d3.json("data/countries.geojson").then( function(data) {
        //const european_data
        data.features =  data.features.filter(element => european_country_codes.includes(element.properties["ISO_A3"]));

        // Europe Projection
        const projection = d3.geoAlbers()
            .rotate([-10, 0])
            .center([2, 47])
            .parallels([35, 55])
            .scale(600)
            .translate([main_win_size / 2, main_win_size / 2]);

        svg.append('g').selectAll('.county')
            .data(data.features)
            .join('path')
            .attr('class', 'country')
            .attr('id', feature => normalizeName(feature.properties.ADMIN))
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", "green");

        // Add Play/Pause button
        let moving = false;
        let timer;

        playButton = d3.select(div_id).append('button')
            .text('Play')
            .on("click", val => togglePause());

        function togglePause(){
            //const button = d3.select(this);

            if (playButton.text() == "Pause") {
                playButton.text("Play");
                resetTimer();
            } else {
                moving = true;
                timer = setInterval(update, 50);
                playButton.text("Pause");
            }
        }

        // Create the scale using the domain for slider
        let sliderTime = d3.sliderBottom()
            .domain([rangeStart, rangeEnd])
            .ticks(0)
            .step(day_in_ms)
            .tickFormat(formatTickDate)
            .width(main_win_size/1.5)
            .on("drag", val => resetTimer())
            .on("onchange", val => visualizeMeasure(selectedMeasure, val));

        // Start animation
        togglePause();

        function update() {
            const offset = sliderTime.value().valueOf() + day_in_ms;
            sliderTime.value(offset);

            // Update selected date
            selectedDate = sliderTime.value();

            //pause, uncomment to restart
            if(offset >= rangeEnd.valueOf()) {
                resetTimer();
                sliderTime.value(rangeStart.valueOf());
            }
        }

        function resetTimer() {
            moving = false;
            clearInterval(timer);
            playButton.text("Play");
        }

        // Add slider to svg
        const gTime = svg
            .append("g")
            .attr("transform", "translate(100," + (main_win_size - 50) + ")");
        gTime.call(sliderTime);

        // Set initial value of the map
        visualizeMeasure(selectedMeasure, rangeStart);

    });

    function visualizeMeasure(measure, date){
        d3.csv("data/europe_response_to_covid.csv").then( function(data) {
            // Filtering the data to the current measure
            data = data.filter(row => row['Response_measure'].includes(measure));

            european_country_data.forEach(function(country) {
                const country_data = data.filter(row => row['Country'] == country['Entity']);

                // Checking if there is data for the current measure
                if(country_data.length > 0 ){
                    // Filtering the data to the day of interest
                    const country_measures = country_data.filter(row => (new Date(row['date_start']) < new Date(date)) &&
                        (new Date(date) < new Date(row['date_end'])));

                    if(country_measures.length > 0){
                        const measure_state = country_measures[0]['Response_measure'];
                        d3.select('#' + normalizeName(country['Entity']))
                            .attr('fill', measure_colorings[measure][measure_state] || 'orange');
                    }
                    else {
                        d3.select('#' + normalizeName(country['Entity']))
                            .attr('fill', 'green');
                    }
                }
                else {
                    d3.select('#' + normalizeName(country['Entity']))
                        .attr('fill', 'gray');
                }
            });
        });
    }
}
drawChart_v12();
