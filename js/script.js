/**
 * Created by yevheniia on 03.10.18.
 */
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var my_data;

function retrieve_my_data(cb) {
    if (my_data) return cb(my_data);

    return d3.csv("data/geocoded2.csv", function (err, data) {
        if (err) throw err;

        data.forEach(function (d) {
            d.value = +d.value;
            d.share = +d.share;
            d.maxV = +d.maxV;
            d.lat = +d.lat;
            d.lon = +d.lon;
        });

        my_data = data;
        if (cb) return cb(data);
        return;
    })
}


var width = window.innerWidth * 0.6,
    height = window.innerHeight,
    centered;

var color = d3.scale.linear()
    .domain([1, 20])
    .clamp(true)
    .range(['#fff', '#409A99']);

var projection = d3.geo.mercator()
    .scale(2300)
    .center([31, 47.2])
    .translate([width / 2, height / 2]);



var path = d3.geo.path()
    .projection(projection);

//    var zoom = d3.behavior.zoom()
//            .translate([0, 0])
//            .scale(1)
//            .scaleExtent([1, 8])
//            .on("zoom", zoomed);

var svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height)
//            .call(zoom)
    ;

var g = svg.append('g')
    ;




var effectLayer = g.append('g')
    .classed('effect-layer', true);

var mapLayer = g.append('g')
    .classed('map-layer', true);




// Load map data

retrieve_my_data(function(data){

    var subset = data.filter(function (d) {
        return d.usage === "Загальний.бал"
    });

    queue()
        .defer(d3.json, 'data/simplifyed_ukr.geojson')
        //                    .defer(d3.json, 'data/simplifyed_regions.geojson')
        .defer(d3.csv, 'data/geocoded2.csv')
        .await(makeMyMap);

    var margin = {
        top: 10,
        right: 50,
        bottom: 15,
        left: 300
    };

    var bwidth = 400 - margin.left - margin.right,
        bheight = window.innerHeight / 1.8 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, bwidth])
        .domain([0, 100]);

    var y = d3.scale.ordinal()
        .rangeRoundBands([bheight, 0], .1)
        .domain(subset.map(function (d) {
            return d.usage;
        }));

    //make y axis to show bar names
    var yAxis = d3.svg.axis()
        .scale(y)
        //no tick marks
        .tickSize(0)
        .orient("left");


    function makeMyMap(error, ukr_shape) {

        effectLayer.selectAll("path")
            .data(ukr_shape.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", "ukraine")
            .attr("fill", "white")
            .attr("stroke", "#61ace0")
            .attr("stroke-width", "2px");

//                effectLayer.selectAll("path")
//                        .data(ukr_regions.features)
//                        .enter()
//                        .append("path")
//                        .attr("d", path)
//                        .attr("fill", "white")
//                        .attr("id", "regions")
//                        .attr("stroke", "#3695d8")
//                        .attr("stroke-width", "0.5px");
    }

    mapLayer.selectAll("circle")
        .data(subset).enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", function (d) {
            return projection([d.lon, d.lat])[0];
        })
        .attr("cy", function (d) {
            return projection([d.lon, d.lat])[1];
        })
        .attr("r", function (d) {
            if(d.district === "yes") {
                return "5px"
            }
            else {
                return "3px"
            }

        })
        .attr("fill", "#2684c6")
        .on("click", function(d){
            var filter = d.city;
            drawBarsSide(filter);
        });



    mapLayer.selectAll("text")
        .data(subset).enter()
        .append("text")
        .attr("class", "label")
        .attr("x", function (d) {
            return projection([d.lon, d.lat])[0] + 5 + "px" ;
        })
        .attr("y", function (d) {
            return projection([d.lon, d.lat])[1] + 5 + "px" ;
        })
        .text(function (d) {
            if(d.district === "yes") {
                return d.city
            }

        })
        .attr("fill", "grey");


    var sideBarsData = data.filter(function(k) {
        return k.city === "Київ"
    });

    var table = d3.select('#cityIndicators')
        .append('table')
        .attr("id", "sideTable");

    var thead = table.append('thead');
    var tbody = table.append('tbody');

    // thead.append('tr').selectAll('th')
    //     .data(["Місто", "Індикатор"]).enter()
    //     .append('th')
    //     .style("top", "10px")
    //     .text(function (d) {
    //         return d;
    //     });

    // create a row for each object in the data
    var rowsWithIndicators = tbody.selectAll('tr')
        .data(sideBarsData)
        .enter()
        .append('tr')
        ;

    rowsWithIndicators.append('td')
        .attr("class", 'indicatorsArray')
        .style("height", 10)
        .text(function (d) {
            return d.usage
        })
        .on("click", function(p) {
            var filter = p.usage;
            drawTable(filter)

        });





    //------- змінює показники міста --------

    function drawBarsSide(filter) {
        $("#sideTable").remove();
        $("#theCity").html(filter);
        var currentData = data.filter(function(k) {
            return k.city === filter
        });

        currentData = currentData.sort(function (a,b){
            return d3.descending(+a.value, +b.value)
        });

        var table = d3.select('#cityIndicators').append('table').attr("id", "sideTable");
        var thead = table.append('thead');
        var tbody = table.append('tbody');


        // thead.append('tr').selectAll('th')
        //     .data(["Місто", "Індикатор"]).enter()
        //     .append('th')
        //     .style("top", "10px")
        //     .text(function (d) {
        //         return d;
        //     });

        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
            .data(currentData)
            .enter()
            .append('tr');

        rows.append('td')
            .attr("class", "indicatorsArray")
            .style("height", 20)
            .text(function (d) {
                return d.usage
            })
            .on("click", function(p) {
                console.log(p.usage);
                var filter = p.usage;
                drawTable(filter)

            });


        var chart = rows.append('td')
            .attr("class", "chart")
            .attr("width", 60)
            .style("position", "relative")
            .on("click", function(p) {
                var filter = p.usage;
                drawTable(filter)

            });


        chart.append("div")
            .style("height", 10)
            .attr("class", "underlay")
            .style("background-color", "white")
        ;



        chart.append("div")
            .attr("class", "overlay")
            .style("background-color", "#3695d8")
            .style("height", 10)
            .style("width", "0%")
            .transition()
            .duration(500)
            .style("width", function(d) {
                return d.share + "%"
            })
            .style("background-color", "#3695d8");




        
    }

    //----- малює таблицю міст на місці карти
    function drawTable(filter) {
        d3.select('svg#map').style("display", "none");
        d3.selectAll('.tableForRemove').remove();
        d3.select('#tableContainer').style("display", "grid");

        var table = d3.select('#table1').append('table').attr("class", "tableForRemove");
        var thead = table.append('thead');
        var tbody = table.append('tbody');

        var dataForTable = data.filter(function (d) {
            return d.usage === filter;
        });

        dataForTable = dataForTable.sort(function (a, b) {
            return +b.share - +a.share;
        });

        // thead.append('tr').selectAll('th')
        //     .data(["Місто", "Індикатор"]).enter()
        //     .append('th')
        //     .style("top", "10px")
        //     .text(function (d) {
        //         return d;
        //     });

        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
            .data(dataForTable)
            .enter()
            .append('tr')
            .attr('class', 'oneRow');

        rows.append('td')
            .attr("class", "citiesColumn")
            .style("height", 10)
            .text(function (d) {
                return d.city
            });


        var chart = rows.append('td')
                .attr("class", "chart")
                .attr("width", 60)
                .style("position", "relative")
            ;

        chart.append("div")
            .style("height", 10)
            .attr("class", "underlay")
            .style("background-color", "#EBEBEB");


        chart.append("div")
            .attr("class", "overlay")
            .style("background-color", "#3695d8")
            .style("height", 10)
            .style("width", "0%")
            .transition()
            .duration(500)
            .style("width", function (d) {
                return d.share + "%"
            })
            .style("background-color", "#3695d8");

        rows.append('td')
            .attr("class", "citiesColumn")
            .style("height", 10)
            .text(function (d) {
                return d.value
            });


        var splitBy = 34;

        var $mainTable = $("#table1");
         //TODO кількість рядків у змінну
        //$mainTable.find ( "tr" ).slice( splitBy ).css( "background-color", "red" );
        var tr1 = $mainTable.find ( "tr" ).slice( splitBy );
        var $secondTable = $("#table2").append("<table id='secondTable' class='tableForRemove'><tbody></tbody></table>");
        $secondTable.find("tbody").append(tr1);
        $mainTable.find ( "tr" ).slice( splitBy ).remove();

        var tr2 = $secondTable.find ( "tr" ).slice( splitBy );
        var $thirdTable = $("#table3").append("<table id='thirdTable' class='tableForRemove'><tbody></tbody></table>");
        $thirdTable.find("tbody").append(tr2);
        $secondTable.find ( "tr" ).slice( splitBy ).remove();



    }

});


$('#toMap').on("click", function() {
    $('svg#map').css("display", "block");
    $('.tableForRemove').remove();
    $('#tableContainer').css("display", "none");

});

function zoomed() {
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    g.select("#ukraine").style("stroke-width", 1.5 / d3.event.scale + "px");
    g.select(".bar").style("stroke-width", 1.5 / d3.event.scale + "px");
//        drawBarsOnMap(filter);
}



