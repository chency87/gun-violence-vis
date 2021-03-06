

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
                .style("fill", "#CC0000")
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
        .attr("class", "state-borders")

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


            var tooltip = d3.select('body').append('div')
            .attr('class', 'hidden tooltip');

    const radius = d3.scaleSqrt() // instead of scaleLinear()
        .domain([0, d3.max(gun, d => d.n_killed)])
        .range([0, 7])
    const g2 = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#7952b3")
        .attr("stroke-width","0.8px")

    const dot = g2.selectAll("circle")
        .data(gun.filter(d => projection([d['longitude'], d['latitude']])))
        .enter()
        .append("circle")
        .attr("transform", d => `translate( ${projection([d['longitude'], d['latitude']])} )`)
        .attr("r", radius(gun[0]['n_killed']))
        .on("mousemover", function (d) {
            console.log('-ijjoijiojoi')
            var mouse = d3.mouse(svg.node()).map(function(d) {
                return parseInt(d);
            });
            tooltip.classed('hidden', false)
                .attr('style', 'left:' + (mouse[0] + 15) +
                        'px; top:' + (mouse[1] - 35) + 'px')
                .html(d.date);
                
        })
        .on("mouseout", function (d) {
            tooltip.classed('hidden', true);
        })
        ;
    let previousDate = -Infinity;

    return Object.assign(svg.node(), {
        update(date) {
            var parseTime = d3.timeParse("%Y-%m-%d");
            date = parseTime(date)
            dot // enter
                .filter(d => {

                    return parseTime(d.date) > previousDate && parseTime(d.date) <= date
                })
                .attr("display", "block")
                .transition().attr("r", d => radius(d.n_killed )).attr("fill", "#CC0000")
                
          
            dot // exit
                .filter(d => parseTime(d.date) <= previousDate && parseTime(d.date) > date)
                .attr("display", "none")
            previousDate = date;
        }
    });
}

async function updatePeopleCount(gun, endDate) {
    var parseTime = d3.timeParse("%Y-%m-%d");
    let killed_count = 0, injured_count = 0, total_count = 0;
    date = parseTime(endDate)
    filtered_data = gun.filter(d => parseTime(d.date) <= date)
    let male_killed_count = 0, female_killed_count =0, male_injured_count = 0, female_injured_count = 0;
    killed_count = d3.sum(filtered_data, d => {
        let gender_arr = d.participant_gender.split("||")
        let status_arr = d.participant_status.split("||")
        let gender_dict = []
        gender_arr.forEach(element => {
            gender_dict[element.split("::")[0]] = element.split("::")[1]
            
        });  
        status_arr.forEach(ele =>{
            let tmp = ele.split("::")
            if(tmp[1] === "Injured"){
                if(gender_dict[tmp[0]] !== "Male"){
                    female_injured_count = female_injured_count + 1
                }else{
                    male_injured_count = male_injured_count + 1
                }
            }else if (tmp[1] === "Killed"){
                if(gender_dict[tmp[0]] !== "Male"){
                    female_killed_count = female_killed_count + 1
                }else{
                    male_killed_count = male_killed_count + 1
                }
            }
        })
        return d.n_killed
    })
    injured_count = d3.sum(filtered_data, d => {
        return d.n_injured
    })

    total_count = killed_count + injured_count

    d3.select("body")
        .selectAll("#peoplecount")
        .datum(total_count)
        .text(function (d) {
            return thousands(d);
        })
    d3.select("body")
        .selectAll("#peoplekilledcount")
        .data([killed_count])
        .text(function (d) {
            return thousands(d);
        })
    d3.select("body")
        .selectAll("#peopleinjuredcount")
        .data([injured_count])
        .text(function (d) {
            return thousands(d);
        })
    $("#progresstotalcount").css({
        height: (male_killed_count + male_injured_count) / total_count * 100 +'%'
    })
    $("#progresskilledcount").css({
        height: (male_killed_count) / killed_count * 100 +'%'
    })
    $("#progressinjuredcount").css({
        height: (male_injured_count) / injured_count * 100 +'%'
    })
    $("#tooltiptotalcount").text(((male_killed_count + male_injured_count) / total_count * 100).toFixed(2) +'%')
    
    $("#tooltiptotalfemalecount").text((100 - ((male_killed_count + male_injured_count) / total_count * 100).toFixed(2)) +'%')

    $("#tooltipkilledcount").text(((male_killed_count ) / killed_count * 100).toFixed(2) +'%')
    
    $("#tooltipkilledfemalecount").text((100 - ((male_killed_count ) / killed_count * 100).toFixed(2)) +'%')

    $("#tooltipinjuredcount").text(((male_injured_count ) / injured_count * 100).toFixed(2) +'%')
    
    $("#tooltipinjuredfemalecount").text((100 - ((male_injured_count ) / injured_count * 100).toFixed(2)) +'%')
}


function thousands(num) {
    var str = num.toString();
    var reg = str.indexOf(".") > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
    return str.replace(reg, "$1,");
}

