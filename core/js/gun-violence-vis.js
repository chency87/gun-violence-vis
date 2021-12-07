

us_chart = function (us) {
    var margin = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }, width = 975,
        width = width - margin.left - margin.right
        , mapRatio = 0.8
        , height = width * mapRatio
        , active = d3.select(null);


    var projection = d3.geoAlbersUsa()
        .scale(1350)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);
    var svg = d3.select(".uStates").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("background-color", "#7952b3");

    const g = svg.append("g")
    const states = g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "states")
        .on("mouseover", function (d) {
            d3.select(this)
                .style("fill", "red")
                .style("cursor", "pointer");
        })
        .on("mouseout", function (d, i) {
            d3.select(this)
                .style("fill", "rgb(212, 211, 211)")
                .style("cursor", "pointer");  
        })
        // .on("click",clicked)
        
    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path)
        .attr("class","state-borders")


    // const zoom = d3.zoom()
    //     .scaleExtent([1, 8])
    //     .on("zoom",  function (event) {
    //         const {transform} = event;
    //         g.attr("transform", transform);
    //         g.attr("stroke-width", 1 / transform.k);
    //       });
    // svg.call(zoom)
    // svg.on("click",function(){
    //     states.transition().style("fill", null);
    //     svg.transition().duration(750).call(
    //       zoom.transform,
    //       d3.zoomIdentity,
    //       d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    //     );
    // })

    // function clicked(event, d) {
    //     const [[x0, y0], [x1, y1]] = path.bounds(d);
    //     event.stopPropagation();
    //     states.transition().style("fill", null);
    //     d3.select(this).transition().style("fill", "red");
    //     svg.transition().duration(750).call(
    //       zoom.transform,
    //       d3.zoomIdentity
    //         .translate(width / 2, height / 2)
    //         .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
    //         .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
    //       d3.pointer(event, svg.node())
    //     );
    //   }
   
    return svg
}


gun_violence_chart = function (svg, gun) {
    var margin = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }, width = 960,
        width = width - margin.left - margin.right
        , mapRatio = 0.8
        , height = width * mapRatio;

    var projection = d3.geoAlbersUsa()
        .scale(1350)
        .translate([width / 2, height / 2]);

    const radius = d3.scaleSqrt() // instead of scaleLinear()
        .domain([0, d3.max(gun, d => d.n_killed)])
        .range([0, 7])
    const g2 = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#7952b3");

    const dot = g2.selectAll("circle")
        .data(gun.filter(d => projection([d['longitude'], d['latitude']])))
        .enter()
        .append("circle")
        .attr("transform", d => `translate( ${projection([d['longitude'], d['latitude']])} )`)
        .attr("r", radius(gun[0]['n_killed']));
    let previousDate = -Infinity;

    return Object.assign(svg.node(), {
        update(date) {
            var parseTime = d3.timeParse("%Y-%m-%d");
            date = parseTime(date)
            dot // enter
                .filter(d => {
                    
                    return parseTime(d.date) > previousDate && parseTime(d.date) <= date
                })
                .attr("display","block")
                .transition().attr("r", d => radius(d.n_killed)).attr("fill", "red");
            dot // exit
                .filter(d => parseTime(d.date) <= previousDate && parseTime(d.date) > date)
                .attr("display","none")
            previousDate = date;
        }
    });

}



