

us_chart = function (us) {
    var margin = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }, width = 960,
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
    
    // svg.append("rect")
    //     .attr("width", "100%")
    //     .attr("height", "100%")
        
        
    var g = svg.append("g")
        .attr('class', 'center-container center-items us-state')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")

    g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "state")
        .on("click", function () {
            console.log("lllll")
        })
    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path)
        .on("click", function (d) {
            console.log(d.id)

        })

    return svg   
}



gun_violence_chart = function (svg, gun){
    var margin = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }, width = 960,
        width = width - margin.left - margin.right
        , mapRatio = 0.8
        , height = width * mapRatio
        , active = d3.select(null);

    var projection = d3.geoAlbersUsa()
        .scale(1350)
        .translate([width / 2, height / 2]);

    const g2 = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#7952b3");


    const dot = g2.selectAll("circle")
        .data(gun.filter(d => projection([d['longitude'], d['latitude']])))

        .enter()

        .append("circle")
        .attr("transform", d => `translate( ${projection([d['longitude'], d['latitude']])} )`)
        .on("mouseover", function (d) {
            active = d3.select(this).classed("active", true);
            //   console.log("jiojioj")
        })


    let previousDate = -Infinity;
    // const radius = d3.scaleSqrt([5, d3.max(gun, d => d.n_killed)], [10, 60])
    const radius = d3.scaleSqrt() // instead of scaleLinear()
        .domain([0, d3.max(gun, d => d.n_killed)])
        .range([0, 5])

    svg.append("circle")
        .attr("fill", "blue")
        .attr("transform", `translate(${projection([gun[0]['longitude'], gun[0]['latitude']])})`)
        .attr("r", radius(gun[0]['n_killed']));

    return Object.assign(svg.node(), {
        update(date) {
            var parseTime = d3.timeParse("%Y-%m-%d");
            date = parseTime(date)
            dot // enter
                .filter(d => parseTime(d.date) > previousDate && parseTime(d.date) <= date)
                .transition().attr("r", d => radius(d.n_killed)).attr("fill", "red");
            dot // exit
                .filter(d => parseTime(d.date) <= previousDate && parseTime(d.date) > date)
                .transition().attr("r", 0);
            previousDate = date;
        }
    });

}




// function clicked(d) {

// }

// function drawCircle(svg, position) {
//     const format = d3.format(",.0f")
//     const radius = d3.scale.sqrt([5, d3.max(position, d => d.n_killed)], [10, 60])
//     svg.selectAll("mycircle")
//         .data(position
//             .filter(d => d.position)
//             .sort((a, b) => d3.descending(a.n_killed, b.n_killed)))
//         .enter()
//         .append("circle")
//         .attr("transform", d => `translate(${d.position})`)
//         .attr("r", d => radius(d.n_killed + d.n_injured))
//         .attr("class", "circle")
//         .attr("fill", "red")
//         .attr("fill-opacity", 0.5)
//         .attr("stroke", "#fff")
//         .attr("stroke-width", 0.5)
//         .append("title")
//         .text(d => `${d.title}${format(d.n_killed + d.n_injured)}`)
//     //   .on("mouseover", mouseover)
//     //   .on("mousemove", mousemove)
//     //   .on("mouseleave", mouseleave)
//     //   .on("click",mousemove)
//     return svg
//     // d => radius(d.n_killed)
// }
// // Three function that change the tooltip when user hover / move / leave a cell
// var mouseover = function (d) {
//     Tooltip.style("opacity", 1)
//     // console.log('--0-0-0-')
// }
// var mousemove = function (d) {
//     Tooltip
//         .html(d.title + "<br>" + "long: " + d.n_killed + "<br>" + "lat: " + d.n_injured)
//         .style("left", (d3.mouse(this)[0] + 10) + "px")
//         .style("top", (d3.mouse(this)[1]) + "px")
// }
// var mouseleave = function (d) {
//     Tooltip.style("opacity", 0)
// }




// function drasShootingEvent(svg, data) {
//     // const format = d3.format(",.0f")
//     // const radius = d3.scale.sqrt([0, d3.max(data, d => d.value)], [0, 40])
//     const length = 239677;
//     var current = 0, interval = 1, end = 0, timeInterval = 2000, index = 0
//     var projection = d3.geo.albersUsa()
//         .scale(1280)
//         .translate([width / 2, height / 2]);
//     var drawTimeInterval = function () {
//         // console.log(current)
//         end = end + Math.pow(2, index)
//         index = index + 1
//         var tmp_data = []
//         for (var i = current; i < end; i++) {
//             if (i < length) {
//                 tmp_data.push(
//                     {
//                         id: i,
//                         date: data[i]['date'],
//                         position: projection([data[i]['longitude'], data[i]['latitude']]),
//                         title: data[i]['state'],
//                         n_killed: data[i]['n_killed'],
//                         n_injured: data[i]['n_injured']
//                     }
//                 )
//             }
//         }
//         // console.log(tmp_data)
//         drawCircle(svg, tmp_data)
//         timeInterval = timeInterval - 50

//         current = end;
//         if (current > length) {

//             $(".progress-bar").width(100 + "%")
//             clearTimeout(drawTimeInterval);
//         } else {
//             $(".progress-bar").width(current / length + "%")
//             setTimeout(drawTimeInterval, timeInterval)
//         }
//     }
//     setTimeout(drawTimeInterval, 1000)

// }
