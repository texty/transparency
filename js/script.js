/**
 * Created by yevheniia on 03.10.18.
 */
var selectedElColor = "#3695d8";

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var my_data;

//завантаження даних в колбек
function retrieve_my_data(cb) {
    if (my_data) return cb(my_data);

    return d3.csv("data/geocoded.csv", function (err, data) {
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

//ширина-висота svg
var width = window.innerWidth * 0.7,
    height = width / 1.9;

var color = d3.scale.linear()
    .domain([1, 20])
    .clamp(true)
    .range(['#fff', '#409A99']);

var projection = d3.geo.mercator()
    .scale([width * 2])
    .center([31.5, 47.6])
    .translate([width / 2, height / 2]);


var path = d3.geo.path()
    .projection(projection);

var svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height);

var g = svg.append('g');


var effectLayer = g.append('g')
    .classed('effect-layer', true);

var mapLayer = g.append('g')
    .classed('map-layer', true);




// Load map data
retrieve_my_data(function(data){

    var subset = data.filter(function (d) {
        return d.usage === "Загальний бал"
    });

    queue()
        .defer(d3.json, 'data/simplifyed_ukr005.geojson')
        .defer(d3.csv, 'data/geocoded.csv')
        .await(makeMyMap);

    var margin = {
        top: 10,
        right: window.innerWidth * 0.2,
        bottom: 15,
        left: window.innerWidth * 0.2
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

    //малюємо мапу
    function makeMyMap(error, ukr_shape) {

        effectLayer.selectAll("path")
            .data(ukr_shape.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", "ukraine")
            .attr("fill", "white")
            .attr("stroke", "yellow")
            .attr("stroke-width", "4px");
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
        .attr("fill", function(d) {
            if (d.value >= 15){
                return "#134162"
            }
            else if (d.value < 15 && d.value >=10){
                return "#2171a9"
            }
            else if (d.value < 10 && d.value >=5){
                return "#3695d8"
            }
            else if (d.value < 5){
                return "#8bc2e9"
            }


        })
        .on("click", function(d){
            var filter = d.city;
            drawBarsSide(filter);
        })
        .on("mouseover", function(d){
            if(d.district === "no"){
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.city)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 18) + "px");
                // $('.label').css("display", "none")
            }



        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            // $('.label').css("display", "block")
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





    //----------resize-------------------
    window.addEventListener("resize", function () {
        var width = window.innerWidth * 0.7,
            height = width / 1.9;


        var margin = {
            right: window.innerWidth * 0.2,
            left: window.innerWidth * 0.2
        };

        var projection = d3.geo.mercator()
            .scale([width * 2])
            .center([31.5, 48.5])
            .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection);

        effectLayer.selectAll("#ukraine")
                .attr("d", path);

        mapLayer.selectAll(".point")
            .attr("cx", function (d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1];
            });

        mapLayer.selectAll(".label")
            .attr("x", function (d) {
                return projection([d.lon, d.lat])[0] + 5 + "px" ;
            })
            .attr("y", function (d) {
                return projection([d.lon, d.lat])[1] + 5 + "px" ;
            });

        colorLegend.selectAll("circle")
            .attr('transform', 'translate('+ (margin.left / 1.5) + ','+ (height - 150) + ')');

        colorLegend.selectAll("text")
            .attr('transform', 'translate('+ ((margin.left / 1.5) + 20) + ','+ (height - 150) + ')')
    });




    //малюємо бокову панель

    var sideBarsData = data.filter(function(k) {
        return k.city === "Київ"
    });

    sideBarsData = sideBarsData.sort(function (a,b){
        return d3.descending(+a.value, +b.value)
    });

    var table = d3.select('#cityIndicators')
        .append('table')
        .attr("id", "sideTable");

    var thead = table.append('thead');
    var tbody = table.append('tbody');

    thead.append('tr').selectAll('th')
        .data(["Індикатори:", ""]).enter()
        .append('th')
        .style("top", "10px")
        .text(function (d) {
            return d;
        });

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
            $('.indicatorsArray').parent().css("background-color", "transparent");
            $(this).parent().css("background-color", "yellow");
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

        $('#selectedCity').html('<span id="cityFilter">' + filter + "</span><span style='text-transform:lowercase; font-weight: 100'> (клікайте на індикатори <br> нижче, щоб порівняти міста)</span>");

        var table = d3.select('#cityIndicators').append('table').attr("id", "sideTable");
        var thead = table.append('thead');
        var tbody = table.append('tbody');


        thead.append('tr').selectAll('th')
            .data(["Індикатор", "Оцінка"]).enter()
            .append('th')
            .style("top", "10px")
            .text(function (d) {
                return d;
            });

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
                $('.indicatorsArray').parent().css("background-color", "transparent");
                $(this).parent().css("background-color", "yellow");
                console.log(p.usage);
                var filter = p.usage;
                drawTable(filter)

            });


        rows.append('td')
            .datum(function (d) {
                return d
            })
            .call(drawBars("white"))
            .on("click", function(p) {
                var filter = p.usage;
                drawTable(filter);
                d3.selectAll('.indicatorsArray').style("color", "grey");
                d3.selectAll('.indicatorsArray').style("font-weight", "normal");
                $('.indicatorsArray').parent().css("background-color", "transparent");
                $(this).parent().css("background-color", "yellow");
                
            });

        rows.append('td')
            .attr("class", "citiesColumn")
            .style("height", 10)
            .text(function (d) {
                return d.value
            });



    }

    //----- малює таблицю міст на місці карти
    function drawTable(filter) {
        d3.select('svg#map').style("display", "none");
        d3.select('#logo').style("display", "none");
        d3.selectAll('.tableForRemove').remove();
        d3.select('#tableContainer').style("display", "grid");

        $('#selectedIndicator').html(filter);
        var targetCity = $('#cityFilter').html();

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
        //     .data(["Місто", "Оцінка"]).enter()
        //     .append('th')
        //     .style("text-align", "left")
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
            .style("background-color", function(d) {
                if(d.city === targetCity) {
                    $(this).parent().css('background-color', "yellow");
                    return "yellow"
                }
                else {
                    return false
                }
            })
            .attr("class","citiesColumn")
            .style("height", 10)
            .text(function (d) {
                return d.city
            });


        rows.append('td')
            .style("background-color", function(d) {
                if(d.city === targetCity) {
                    return "yellow"
                }
                else {
                    return false
                }
            })
            .datum(function (d) {
                return d
            })
            .call(drawBars("#EBEBEB"));


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

    var colorLegendContainer = svg.selectAll('.legend').append('g')
        .data([
            {"color":"#134162", "text": "20-15 балів"},
            {"color":"#2171a9", "text": "15-10"},
            {"color":"#3695d8", "text": "10-5"},
            {"color":"#8bc2e9", "text": "5-0"}
        ]);

    colorLegendContainer.enter().append('g').attr('class', 'legend')
        .append('g');
    var colorLegend = colorLegendContainer.select('g').style("width",100)
        .attr("transform", function(d, i) { return "translate(0,"+ i * 20  +")"; });

    colorLegend.append("circle")
        .style("fill", function(d) {return d.color})
        .attr('r', 5)
        .attr('transform', 'translate('+ (margin.left / 1.5) + ','+ (height - 150) + ')');

    colorLegend.append("text")
        .attr("dy", ".35em")
        .attr('transform', 'translate('+ ((margin.left / 1.5) + 20) + ','+ (height - 150) + ')')
        .text(function(d) { return d.text;});



    var sizeLegendContainer = svg.selectAll('.sizeLegend').append('g')
        .data([
            {"r":6, "text": "областні центри"},
            {"r":4, "text": "інші міста"}

        ]);

    sizeLegendContainer.enter().append('g').attr('class', 'sizeLegend')
        .append('g');
    var sizeLegend = sizeLegendContainer.select('g').style("width",100)
        .attr("transform", function(d, i) { return "translate(0,"+ i * 20  +")"; });

    sizeLegend.append("circle")
        .style("fill", "none")
        .style("stroke", "grey")
        .style("stroke-width", "1px")
        .attr('r', function(d) {return d.r})
        .attr('transform', 'translate('+ (width - margin.right) + ',' + (height - height + 20) + ')');

    sizeLegend.append("text")
        .attr("dy", ".35em")
        .attr('transform', 'translate('+ (width - margin.right + 15) + ',' + (height - height + 20) + ')')
        .text(function(d) { return d.text;});


});





$('#toMap').on("click", function() {
    $('svg#map').css("display", "block");
    d3.select('#logo').style("display", "block");
    $('.tableForRemove').remove();
    $('#tableContainer').css("display", "none");
    $('#selectedIndicator').html('Оберіть місто');

});




