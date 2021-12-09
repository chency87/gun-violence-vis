initData = function (gun) {
    let mass_shot_arr = [], officer_shot_arr = [], drive_shot_arr = [], other_shot_arr = [];
    var parseDate = d3.timeParse("%Y-%m-%d");



    let time_span = ['2013-12-31', '2014-12-31', '2015-12-31', '2016-12-31', '2017-12-31', '2018-06-01']
    let pre_date = -Infinity;
    time_span.forEach(ele => {
        filtered_data = gun.filter(d => (parseDate(d.date) <= parseDate(ele)) && parseDate(d.date) > parseDate(pre_date))
        pre_date = ele
        mass_shot_arr.push(
            {
                'date': d3.timeYear(parseDate(ele)),
                'value': d3.sum(filtered_data, d => d.incident_characteristics.indexOf("Mass Shooting") != -1),
                name: 'Mass Shooting'
            }
        )
        officer_shot_arr.push(
            {
                'date': d3.timeYear(parseDate(ele)),
                'value': d3.sum(filtered_data, d =>
                    d.incident_characteristics.indexOf("Officer") != -1
                ),
                name: 'Officer Shooting'
            }
        )
        drive_shot_arr.push(
            {
                'date': d3.timeYear(parseDate(ele)),
                'value': d3.sum(filtered_data, d =>
                    d.incident_characteristics.indexOf("Drive-by") != -1
                ),
                name: 'Drive by Shooting'
            }
        )
        other_shot_arr.push(
            {
                'date': d3.timeYear(parseDate(ele)),
                'value': d3.sum(filtered_data, d =>
                    d.incident_characteristics.indexOf("Drive-by") === -1 && d.incident_characteristics.indexOf("Officer") === -1 && d.incident_characteristics.indexOf("Mass Shooting") === -1

                )
            }
        )

    })
    let data = [
        {
            "name": "Mass Shooting",
            "values": mass_shot_arr
        },
        {
            "name": "Officer Shooting",
            "values": officer_shot_arr
        },
        {
            "name": "Drive By",
            "values": drive_shot_arr
        }
    ]
    // ,
    //     {
    //         "name": "Others",
    //         "values": other_shot_arr
    //     }

    return data


}

draw_line_chart = function (gun) {

    var width = 1200;
    var height = 900;
    var margin = 100;
    var duration = 250;

    var lineOpacity = "0.85";
    var lineOpacityHover = "0.85";
    var otherLinesOpacityHover = "0.1";
    var lineStroke = "1.5px";
    var lineStrokeHover = "2.5px";

    var circleOpacity = '0.85';
    var circleOpacityOnLineHover = "0.25"
    var circleRadius = 3;
    var circleRadiusHover = 6;

    /* Format Data */
    var parseDate = d3.timeFormat("%Y");

    const data = initData(gun)
    // console.log(data)


    /* Scale */
    var xScale = d3.scaleTime()
        .domain(d3.extent(data[0].values, d => d.date))
        .range([0, width - margin]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data[1].values, d => d.value)])
        .range([height - margin, 0]);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    /* Add SVG */
    var svg = d3.select("#chart").append("svg")
        .attr("width", (width + margin) + "px")
        .attr("height", (height + margin) + "px")
        .append('g')
        .attr("transform", `translate(${margin}, ${margin})`);


    var line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value));

    let lines = svg.append('g')
        .attr('class', 'lines');

    var pathes = lines.selectAll('.line-group')
        .data(data).enter()
        .append('g')
        .attr('class', 'line-group')
        .on("mouseover", function (d, i) {
            svg.append("text")
                .attr("class", "title-text")
                .style("fill", color(i))
                .text(d.name)
                .attr("text-anchor", "middle")
                .attr("x", (width - margin) / 2)
                .attr("y", 5);
        })
        .on("mouseout", function (d) {
            svg.select(".title-text").remove();
        })
        .append('path')
        .attr('class', 'line')
        .attr('d', d => line(d.values))
        .style('stroke', (d, i) => color(i))
        .style('opacity', lineOpacity)
        .on("mouseover", function (d) {
            d3.selectAll('.line')
                .style('opacity', otherLinesOpacityHover);
            d3.selectAll('.circle')
                .style('opacity', circleOpacityOnLineHover);
            d3.select(this)
                .style('opacity', lineOpacityHover)
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer");
        })
        .on("mouseout", function (d) {
            d3.selectAll(".line")
                .style('opacity', lineOpacity);
            d3.selectAll('.circle')
                .style('opacity', circleOpacity);
            d3.select(this)
                .style("stroke-width", lineStroke)
                .style("cursor", "none");
        });

    var parseTime = d3.timeParse("%Y")
    /* Add circles in the line */
    var nodes = lines.selectAll("circle-group")
        .data(data).enter()
        .append("g")
        .style("fill", (d, i) => color(i))
        .selectAll("circle")
        .data(d => d.values).enter()
        .append("g")
        .attr("class", "circle")
        .on("mouseover", function (d) {
            d3.select(this)
                .style("cursor", "pointer")
                .append("text")
                .attr("class", "text")
                .text(d => 'In the year of ' + parseDate(d.date) + ', there were ' + d.value + ' ' + d.name + ' Events happened')
                .attr("x", d => xScale(d.date) + 5)
                .attr("y", d => yScale(d.value) - 10)
                ;
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("cursor", "none")
                .transition()
                .duration(duration)
                .selectAll(".text").remove();
        })
        .append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("r", circleRadius)
        .style('opacity', circleOpacity)
        .on("mouseover", function (d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadiusHover);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadius);
        });


    let rect = svg.append('rect')
        .attr("class", "shield_rect")
        .attr("x", 0)
        .attr("y", -3)
        .attr("width", width)
        .attr("height", height - margin)
        .style("fill", "#343a40");

    rect.transition()
        .duration(15000)
        .attr("x", width)
        .remove();

    /* Add Axis into SVG */
    var xAxis = d3.axisBottom(xScale).ticks(5);
    var yAxis = d3.axisLeft(yScale).ticks(5);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height - margin})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append('text')
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000")
        .text("Total values")
        .style('fill', 'white');

    /* Add Legend */
    svg.append("circle").attr("cx", 150).attr("cy", height - margin + 50).attr("r", 6).style("fill", color(0))
    svg.append("circle").attr("cx", 400).attr("cy", height - margin + 50).attr("r", 6).style("fill", color(1))
    svg.append("circle").attr("cx", 650).attr("cy", height - margin + 50).attr("r", 6).style("fill", color(2))
    svg.append("text").attr("x", 170).attr("y", height - margin + 50).text("Mass Shooting").style("font-size", "14px").style("fill", "white").attr("alignment-baseline", "middle")
    svg.append("text").attr("x", 420).attr("y", height - margin + 50).text("Officer Shooting").style("font-size", "14px").style("fill", "white").attr("alignment-baseline", "middle")
    svg.append("text").attr("x", 670).attr("y", height - margin + 50).text("Drive-by").style("font-size", "14px").style("fill", "white").attr("alignment-baseline", "middle")

}


initBarChartData = function (gun) {



    var parseDate = d3.timeParse("%Y-%m-%d");

    /* Format Data */
    var formatDate = d3.timeFormat("%Y-%m");



    let time_span = ['2013-6-31', '2013-12-31', '2014-6-31', '2014-12-31', '2015-6-31', '2015-12-31', '2016-6-31', '2016-12-31', '2017-6-31', '2017-12-31', '2018-06-01']
    let pre_date = -Infinity;
    let male_sus = [], female_sus = [], sus_dict = [];

    time_span.forEach(ele => {
        filtered_data = gun.filter(d => (parseDate(d.date) <= parseDate(ele)) && parseDate(d.date) > parseDate(pre_date))
        pre_date = ele
        let male_count = 0, female_count = 0;
        filtered_data.forEach(d => {
            let type_arr = d.participant_type.split("||")
            let gender_arr = d.participant_gender.split("||")

            gender_arr.forEach(element => {
                if (element.split("::")[1] === "Male") {
                    if (type_arr[element.split("::")[0]].split("::")[1] != "Victim") {
                        male_count = male_count + 1
                    }
                } else if (element.split("::")[1] === "Female") {
                    if (type_arr[element.split("::")[0]].split("::")[1] != "Victim") {
                        female_count = female_count + 1
                    }
                }
            })
        })
        sus_dict.push({
            "date": formatDate(parseDate(ele)),
            "Male": male_count,
            "Female": female_count
        })
    })
    return sus_dict


}


draw_bar_chart = function (gun) {
    var margin = { top: 30, right: 30, bottom: 70, left: 60 },
        width = 1200 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    let data = initBarChartData(gun)
    // console.log(data)
    let years = ["2013/01-2013/06", "2013/06 - 2013/12", "2014/01-2014/06", "2014/06-2014/12", "2015/01-2015/06",
        "2015/06-2015/12", "2016/01-2016/06", "2016/06-2016/12", "2017/01-2017/06", "2017/06-2017/12", "2018/01-2018/06"]
    let gender = ['Male', 'Female']


    stateages = gender.flatMap(g => data.map(d => ({ date: d.date, gender: g, value: d[g] })))
    console.log(stateages)
    chart = groupedBarChart(stateages, {
        x: d => d.date,
        y: d => d.value,
        z: d => d.gender,
        // xDomain: d3.groupSort(stateages, D => d3.sum(D, d => -d.value), d => d.date).slice(0, 22), // top 6
        yLabel: "↑ Suspect",
        zDomain: gender,
        colors: d3.schemeSpectral[gender.length],
        width,
        height: height
    })
    //   console.log(chart)
    len = Legend(chart.scales.color, {title: "Suspect Number(Gender)"})

}

function groupedBarChart(data, {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = d => d, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    title, // given d in data, returns the title text
    marginTop = 30, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = 50, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 960, // outer width, in pixels
    height = 600, // outer height, in pixels
    xDomain, // array of x-values
    xRange = [marginLeft, width - marginRight], // [xmin, xmax]
    xPadding = 0.1, // amount of x-range to reserve to separate groups
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [ymin, ymax]
    zDomain, // array of z-values
    zPadding = 0.05, // amount of x-range to reserve to separate bars
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    colors = d3.schemeTableau10, // array of colors
} = {}) {

    var duration = 250;
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);
    // console.log(X)

    // Compute default domains, and unique the x- and z-domains.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    if (zDomain === undefined) zDomain = Z;
    xDomain = new d3.InternSet(xDomain);
    zDomain = new d3.InternSet(zDomain);

    // Omit any data not present in both the x- and z-domain.
    const I = d3.range(X.length).filter(i => xDomain.has(X[i]) && zDomain.has(Z[i]));


    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).paddingInner(xPadding);
    const xzScale = d3.scaleBand(zDomain, [0, xScale.bandwidth()]).padding(zPadding);
    const yScale = yType(yDomain, yRange);
    const zScale = d3.scaleOrdinal(zDomain, colors);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);



    // Compute titles.
    if (title === undefined) {
        const formatValue = yScale.tickFormat(100, yFormat);
        title = i => `${X[i]}\n${Z[i]}\n${formatValue(Y[i])}`;
    } else {
        const O = d3.map(data, d => d);
        const T = title;
        title = i => T(O[i], i, data);
    }

    /* Add SVG */
    var svg = d3.select("#bar-chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));

    const bar = svg.append("g")
        .selectAll("rect")
        .data(I)
        .join("rect")
        .attr("x", i => xScale(X[i]) + xzScale(Z[i]))
        .attr("y", i => yScale(Y[i]))
        .attr("width", xzScale.bandwidth())
        .attr("height", i => yScale(0) - yScale(Y[i]))
        .attr("fill", i => zScale(Z[i]))
        

    // if (title) bar.append("title")
    //     .text(title);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .style("font-size","14px");
    // return svg.node()

    

    //  svg.append("text").attr("x", 170).attr("y", height - marginBottom + 50).text("Male Suspect").style("font-size", "10px").style("fill", "white").attr("alignment-baseline", "middle")
    //  svg.append("text").attr("x", 270).attr("y", height - marginBottom + 50).text("Female Suspect").style("font-size", "10px").style("fill", "white").attr("alignment-baseline", "middle")



    return Object.assign(svg.node(), { scales: { color: zScale } });

}

function legend({color, ...options}) {
    return Legend(color, options);
}

function Legend(color, {
    title,
    tickSize = 6,
    width = 820, 
    height = 54 + tickSize,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 550,
    ticks = width / 64,
    tickFormat,
    tickValues
  } = {}) {
  
    function ramp(color, n = 256) {
      const canvas = document.createElement("canvas");
      canvas.width = n;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      for (let i = 0; i < n; ++i) {
        context.fillStyle = color(i / (n - 1));
        context.fillRect(i, 0, 1, 1);
      }
      return canvas;
    }
  
    var svg = d3.select("#bar-chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");
  
    let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    let x;
  
    // Continuous
    if (color.interpolate) {
      const n = Math.min(color.domain().length, color.range().length);
  
      x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));
  
      svg.append("image")
          .attr("x", marginLeft)
          .attr("y", marginTop)
          .attr("width", width - marginLeft - marginRight)
          .attr("height", height - marginTop - marginBottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
    }
  
    // Sequential
    else if (color.interpolator) {
      x = Object.assign(color.copy()
          .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
          {range() { return [marginLeft, width - marginRight]; }});
  
      svg.append("image")
          .attr("x", marginLeft)
          .attr("y", marginTop)
          .attr("width", width - marginLeft - marginRight)
          .attr("height", height - marginTop - marginBottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", ramp(color.interpolator()).toDataURL());
  
      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
      if (!x.ticks) {
        if (tickValues === undefined) {
          const n = Math.round(ticks + 1);
          tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
        }
        if (typeof tickFormat !== "function") {
          tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
        }
      }
    }
  
    // Threshold
    else if (color.invertExtent) {
      const thresholds
          = color.thresholds ? color.thresholds() // scaleQuantize
          : color.quantiles ? color.quantiles() // scaleQuantile
          : color.domain(); // scaleThreshold
  
      const thresholdFormat
          = tickFormat === undefined ? d => d
          : typeof tickFormat === "string" ? d3.format(tickFormat)
          : tickFormat;
  
      x = d3.scaleLinear()
          .domain([-1, color.range().length - 1])
          .rangeRound([marginLeft, width - marginRight]);
  
      svg.append("g")
        .selectAll("rect")
        .data(color.range())
        .join("rect")
          .attr("x", (d, i) => x(i - 1))
          .attr("y", marginTop)
          .attr("width", (d, i) => x(i) - x(i - 1))
          .attr("height", height - marginTop - marginBottom)
          .attr("fill", d => d);
  
      tickValues = d3.range(thresholds.length);
      tickFormat = i => thresholdFormat(thresholds[i], i);
    }
  
    // Ordinal
    else {
      x = d3.scaleBand()
          .domain(color.domain())
          .rangeRound([marginLeft, width - marginRight]);
  
      svg.append("g")
        .selectAll("rect")
        .data(color.domain())
        .join("rect")
          .attr("x", x)
          .attr("y", marginTop)
          .attr("width", Math.max(0, x.bandwidth() - 1))
          .attr("height", height - marginTop - marginBottom)
          .attr("fill", color);
  
      tickAdjust = () => {};
    }
  
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
          .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
          .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
          .tickSize(tickSize)
          .tickValues(tickValues))
        .call(tickAdjust)
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
          .attr("x", marginLeft)
          .attr("y", marginTop + marginBottom - height - 6)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .attr("class", "title")
          .text(title));
  
    return svg.node();
  }