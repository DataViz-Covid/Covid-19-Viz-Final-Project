function drawChart_v6() {
    const div_id = "#v6";
    // Arnaud - GPD Cartograph with slider

    // Static things
    function normalizeName(name){
        return name.replace(' ', '_');
    }

    // General formatting and setup
    d3.select(div_id)
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "flex-start")
        .style("justify-content", "space-between")
        .style("height", "70vh")
        .style("width", "100%");

    let main_win_size = 500; //d3.select(div_id).node().getBoundingClientRect().height;
    let main_win_width = d3.select(div_id).node().getBoundingClientRect().width;

    d3.json('../data/gdp_map.json').then(world => {
        // exclude antarctica
        world.objects.countries.geometries.splice(
            world.objects.countries.geometries.findIndex(d => d.properties.ISO_A2 === 'AQ'), 1);

        function drawCarto(year){

            const colorScale = d3.scaleSequential(d3.interpolatePlasma)
                .domain([0, Math.max(...world.objects.countries.geometries.map(getGDPPerCapita))]);

            d3.select(div_id).append('div').attr('id', 'cartogram_' + year);

            //let projection = d3.geoMercator().fitSize([main_win_size*2,main_win_size], topojson.feature(world, world.objects.countries).features)
            let projection = d3.geoMercator().scale(90, 90);
            Cartogram()
                .width((main_win_size*2))
                .height(main_win_size - 100)
                .topoJson(world)
                .topoObjectName('countries')
                .projection(projection)
                .value(getGDPPerCapita)
                .color(f => colorScale(getGDPPerCapita(f)))
                .label(({ properties: p }) => `GDP of ${p.NAME} (${p.ISO_A2})`)
                .units(' per capita')
                .valFormatter(d3.format('$,.0f'))
                (document.getElementById('cartogram_' + year))
                //.iterations(10)
            ;

            function getGDPPerCapita({ properties: p }) {
                const col = 'gdp_' + year;
                return p[col] > 0? p[col] / p.POP_EST : 50;
            }
        }

        drawCarto('2021');
        drawCarto('2019');


        d3.selectAll('.cartogram')
            .style('position', 'absolute')
            .style('top', '20vh');

        d3.selectAll('#cartogram_2019').selectAll('div')
            .style('background-color', 'white')
            .style('border-right-style', 'solid')
            .style('border-right-color', 'black')
            .style('border-right-width', '3px')
            .style('width', main_win_size + 'px');

        d3.selectAll('#cartogram_2019').selectAll('div').selectAll('svg')
            .style('width', (main_win_size) + 'px');

        let slider = d3.sliderBottom()
            .domain([200, (2*main_win_size) - 200])
            .default(500)
            .width((main_win_size*2) - 400)
            .ticks(0)
            .displayValue(false)
            .on('drag', v => setLeftDivWidth(v));

        // Add slider to svg
        const sliderG = d3.select(div_id).append('svg')
            .attr('width', 2*main_win_size)
            .append("g")
            .attr("transform", "translate(200,8)");
        sliderG.call(slider);

        function setLeftDivWidth(w){
            // Set div width (to change background)
            d3.selectAll('#cartogram_2019')
                .selectAll('div')
                .style('width', w + 'px');

            // Set map svg width to crop what is shown
            d3.selectAll('#cartogram_2019')
                .selectAll('div')
                .selectAll('svg')
                .style('width', w + 'px');
        }

        //left_div.style('width', (main_win_width * 50/100) - 10)

        //left_div.select('svg').attr('width', main_win_width * 50/100)

        //console.log(d3.selectAll('#cartogram_2021').select('div').node().getBoundingClientRect().width)

            //.style('border-right',

        /*
        d3.selectAll('svg')
            .attr("viewBox", "0 0 " + main_win_size + " " + main_win_size);
        */
    });





    /*

    d3.json("../data/countries.geojson").then( function(data) {

        d3.csv("../data/world_gdp.csv").then( function(gdp) {


            /*
            const projection = d3.geoNaturalEarth1().fitSize([main_win_size*2,main_win_size], data);

            svg.append('g').selectAll('.county')
                .data(data.features)
                .join('path')
                .attr('class', 'country')
                .attr('id', feature => normalizeName(feature.properties.ADMIN))
                .attr("d", d3.geoPath().projection(projection))
                .attr("fill", "green").attr('width', main_win_size);


            var topology = topojson.feature(data, data.objects.countries);

            var carto = d3.cartogram()
                .projection(projection)
                .value(function(d) {
                    const value = gdp.find(e => e['Country Code'] == d['ISO_A3']);
                    return +value;
                })
                .iterations(10);

            var cartogram = carto(topology, data);




            // Create a map of country codes to GDP values
            var gdpMap = {};
            gdp.forEach(function(d) {
                gdpMap[d.CountryCode] = +d.GDP;
            });

            // Create a cartogram layout based on GDP data
            var carto = d3.cartogram()
                .projection(d3.geoNaturalEarth1())
                .value(function(d) { return gdpMap[d.properties.ISO_A3]; });

            // Generate a cartogram map
            var features = carto(geojson.features);

            svg.selectAll(".country")
                .data(features)
                .enter().append("path")
                .attr("class", "country")
                .attr("id", function(d) { return normalizeName(d.properties.ADMIN); })
                .attr("d", d3.geoPath())
                .attr("fill", "green")
                .attr("width", main_win_size);


        });

    });

     */

}
drawChart_v6();
