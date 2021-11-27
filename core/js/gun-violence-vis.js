

us_chart = function (us,gun) {
    var margin = {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
    }, width = 960,
        width = width - margin.left - margin.right
        , mapRatio = 0.5
        , height = width * mapRatio
        , active = d3.select(null);

    var projection = d3.geoAlbersUsa()
        .scale(1000)
        .translate([width / 2, height / 2]);
    var path = d3.geoPath()
        .projection(projection);
    var svg = d3.select(".uStates").append("svg")
        .attr("width", width)
        .attr("height", height);
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
        .on("click",function(){
            console.log("lllll")
        })
    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path)
        .on("click", function(d){
            console.log(d.id)

        })



    const g2 = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "black");


    const dot = g2.selectAll("circle")
        .data(gun.filter(d => projection([d['longitude'], d['latitude']])))
        
        .enter()
        
        .append("circle")
          .attr("transform", d => `translate( ${ projection([d['longitude'], d['latitude']])   } )`)
          .on("mouseover", function(d){
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
            .filter(d => parseTime(d.date) > previousDate && parseTime(d.date) <= date )
            .transition().attr("r", d=>radius(d.n_killed)).attr("fill","red");
          dot // exit
            .filter(d => parseTime(d.date) <= previousDate && parseTime(d.date) > date)
            .transition().attr("r", 0);
          previousDate = date;
        }
      });
}

function drawShootingEventCircle(svg, data){

}




function clicked(d) {

}

function drawCircle(svg, position) {
    const format = d3.format(",.0f")
    const radius = d3.scale.sqrt([5, d3.max(position, d => d.n_killed)], [10, 60])
    svg.selectAll("mycircle")
        .data(position
            .filter(d => d.position)
            .sort((a, b) => d3.descending(a.n_killed, b.n_killed)))
        .enter()
        .append("circle")
        .attr("transform", d => `translate(${d.position})`)
        .attr("r", d => radius(d.n_killed + d.n_injured))
        .attr("class", "circle")
        .attr("fill", "red")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .append("title")
        .text(d => `${d.title}${format(d.n_killed + d.n_injured)}`)
    //   .on("mouseover", mouseover)
    //   .on("mousemove", mousemove)
    //   .on("mouseleave", mouseleave)
    //   .on("click",mousemove)
    return svg
    // d => radius(d.n_killed)
}
// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function (d) {
    Tooltip.style("opacity", 1)
    // console.log('--0-0-0-')
}
var mousemove = function (d) {
    Tooltip
        .html(d.title + "<br>" + "long: " + d.n_killed + "<br>" + "lat: " + d.n_injured)
        .style("left", (d3.mouse(this)[0] + 10) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
}
var mouseleave = function (d) {
    Tooltip.style("opacity", 0)
}




function drasShootingEvent(svg, data) {
    // const format = d3.format(",.0f")
    // const radius = d3.scale.sqrt([0, d3.max(data, d => d.value)], [0, 40])
    const length = 239677;
    var current = 0, interval = 1, end = 0, timeInterval = 2000, index = 0
    var projection = d3.geo.albersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);
    var drawTimeInterval = function () {
        // console.log(current)
        end = end + Math.pow(2, index)
        index = index + 1
        var tmp_data = []
        for (var i = current; i < end; i++) {
            if (i < length) {
                tmp_data.push(
                    {
                        id: i,
                        date: data[i]['date'],
                        position: projection([data[i]['longitude'], data[i]['latitude']]),
                        title: data[i]['state'],
                        n_killed: data[i]['n_killed'],
                        n_injured: data[i]['n_injured']
                    }
                )
            }
        }
        // console.log(tmp_data)
        drawCircle(svg, tmp_data)
        timeInterval = timeInterval - 50

        current = end;
        if (current > length) {

            $(".progress-bar").width(100 + "%")
            clearTimeout(drawTimeInterval);
        } else {
            $(".progress-bar").width(current / length + "%")
            setTimeout(drawTimeInterval, timeInterval)
        }
    }
    setTimeout(drawTimeInterval, 1000)



}



function Calendar(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    width = 928, // width of the chart, in pixels
    cellSize = 17, // width and height of an individual day, in pixels
    weekday = "monday", // either: weekday, sunday, or monday
    formatDay = i => "SMTWTFS"[i], // given a day number in [0, 6], the day-of-week label
    formatMonth = "%b", // format specifier string for months (above the chart)
    yFormat, // format specifier string for values (in the title)
    colors = d3.interpolatePiYG
  } = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const I = d3.range(X.length);
    console.log(X)
  
    const countDay = weekday === "sunday" ? i => i : i => (i + 6) % 7;
    const timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
    const weekDays = weekday === "weekday" ? 5 : 7;
    const height = cellSize * (weekDays + 2);
  
    // Compute a color scale. This assumes a diverging color scheme where the pivot
    // is zero, and we want symmetric difference around zero.
    const max = d3.quantile(Y, 0.9975, Math.abs);
    const color = d3.scaleSequential([-max, +max], colors).unknown("none");
  
    // Construct formats.
    formatMonth = d3.utcFormat(formatMonth);
  
    // Compute titles.
    if (title === undefined) {
      const formatDate = d3.utcFormat("%B %-d, %Y");
      const formatValue = color.tickFormat(100, yFormat);
      title = i => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
    } else if (title !== null) {
      const T = d3.map(data, title);
      title = i => T[i];
    }
  
    // Group the index by year, in reverse input order. (Assuming that the input is
    // chronological, this will show years in reverse chronological order.)
    const years = d3.groups(I, i => X[i].getUTCFullYear()).reverse();
  
    function pathMonth(t) {
      const d = Math.max(0, Math.min(weekDays, countDay(t.getUTCDay())));
      const w = timeWeek.count(d3.utcYear(t), t);
      return `${d === 0 ? `M${w * cellSize},0`
          : d === weekDays ? `M${(w + 1) * cellSize},0`
          : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${weekDays * cellSize}`;
    }
  
    // const svg = d3.create("svg")
    //     .attr("width", width)
    //     .attr("height", height * years.length)
    //     .attr("viewBox", [0, 0, width, height * years.length])
    //     .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", 10);


    const svg = d3.select(".calendar").append("svg")
        .attr("width", width)
        .attr("height", height * years.length)
        .attr("viewBox", [0, 0, width, height * years.length])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);
  
    const year = svg.selectAll("g")
      .data(years)
      .join("g")
        .attr("transform", (d, i) => `translate(40.5,${height * i + cellSize * 1.5})`);
  
    year.append("text")
        .attr("x", -5)
        .attr("y", -5)
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .text(([key]) => key);
  
    year.append("g")
        .attr("text-anchor", "end")
      .selectAll("text")
      .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7))
      .join("text")
        .attr("x", -5)
        .attr("y", i => (countDay(i) + 0.5) * cellSize)
        .attr("dy", "0.31em")
        .text(formatDay);
  
    const cell = year.append("g")
      .selectAll("rect")
      .data(weekday === "weekday"
          ? ([, I]) => I.filter(i => ![0, 6].includes(X[i].getUTCDay()))
          : ([, I]) => I)
      .join("rect")
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("x", i => timeWeek.count(d3.utcYear(X[i]), X[i]) * cellSize + 0.5)
        .attr("y", i => countDay(X[i].getUTCDay()) * cellSize + 0.5)
        .attr("fill", i => color(Y[i]));
  
    if (title) cell.append("title")
        .text(title);
  
    const month = year.append("g")
      .selectAll("g")
      .data(([, I]) => d3.utcMonths(d3.utcMonth(X[I[0]]), X[I[I.length - 1]]))
      .join("g");
  
    month.filter((d, i) => i).append("path")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 3)
        .attr("d", pathMonth);
  
    month.append("text")
        .attr("x", d => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
        .attr("y", -5)
        .text(formatMonth);
  
    return Object.assign(svg.node(), {scales: {color}});
  }


  function BarChart(data){
    //   console.log(d3.group(data, d=> d.date, d=>d.participant_gender, d=>d.participant_type))
    var parseTime = d3.timeParse("%Y-%m-%d");
    lineData = [
    {
        key: "Male-Subject-Suspect",
        light: "#fb9a99",
        dark: "#e31a1c",
        data: []
    },
    {
        key: "Female-Subject-Suspect",
        light: "#fb9c31",
        dark: "#e31322",
        data: []
    },{
        key: "Male-Victim",
        light: "#a6cee3",
        dark: "#1f78b4",
        data: []
    },{
        key: "Female-Victim",
        light: "#fdbf6f",
        dark: "#ff7f00",
        data: []
    }]

    colors = [{
        "Female-Subject-Suspect": {
          light: "#fb9a99",
          dark: "#e31a1c"
        },
        "Male-Subject-Suspect": {
          light: "#a6cee3",
          dark: "#1f78b4"
        },
         "Male-Victim": {
          light: "#a6cee3",
          dark: "#1f78b4"
        },
         "Female-Victim": {
            light: "#fdbf6f",
            dark: "#ff7f00"
          },
      }]

    var start = parseTime("2013-01-01")
    var end = parseTime("2018-03-31")

    
    const span = d3.timeDay.every(2).range(start,end)

    data.forEach(element => {

        for (let val of lineData){
            if (val['key'] ===  element['participant_gender'] +'-'+element['participant_type']){
                // console.log(element['date'])
                val['data'].push(
                    {
                        date:element['date'],
                        value: element['participant_status']
                    }
                )
                // console.log('--------------')
            }
        }
    });

    console.log(lineData)

      var width =1400,
      height = 680,
      chartWidth = 1072,
     chartHeight = 546,
      margin = {
        left: 20,
        bottom: 20,
        right: 60,
        top: 10,
      }

      const svg = d3.select(".calendar").append("svg")
      .attr("width", width)
      .attr("height", height )
      .attr("viewBox", [0, 0, width, height ])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);


      const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

      xScale = d3.scaleTime()
                .domain([new Date(2013, 1, 1), new Date(2018, 3, 31)])
                .range([0, chartWidth]);
      yScale = d3.scaleLinear()
                .domain([0, 20])
                .range([chartHeight, 0]);

      xAxisGenerator = d3.axisBottom(xScale).tickValues(d3.range(0, 70).map(d => d));

      yAxisGenerator = d3.axisLeft(yScale).tickValues(d3.range(0, 30, 5));

   

      lineGenerator = d3.line().x(d => xScale(parseTime(d.date))).y(d => yScale(d.value));

      g.append("g")
      .call(xAxisGenerator)
      .attr("transform", `translate(0, ${chartHeight})`);

        
        g.append("g")
        .call(yAxisGenerator);

      g.selectAll(".line")
        .data(lineData)
        .enter().append("path")
        .attr("d", d => lineGenerator(d.data))
        .style("fill", "none")
        .style("stroke", d => d.light)
        .style("stroke-width", 2)
        .style("stroke-linejoin", "round");

        var last = array => array[array.length - 1]

    // const valueLabel = g.selectAll(".label")
    //     .data(lineData)
    //   .enter().append("g")
    //     .attr("transform", d => `translate(${xScale(parseTime(last(d.data).date))}, ${yScale(last(d.data).value)})`);
    // valueLabel.append("circle")
    //   .attr("r", 4)
    //   .style("stroke", "white")
    //   .style("fill", d => d.light);
    
    // valueLabel.append("text")
    //   .text(d => last(d.data).value)
    //   .attr("dy", 5)
    //   .attr("dx", 10)
    //   .style("font-family", "monospace")
    //   .style("fill", d => d.dark);

  }