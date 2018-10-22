/**
 * Created by yevheniia on 03.10.18.
 */
var selectedElColor = "#3695d8";

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var my_data;
var selectedIndicator;

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
        
    })
}

//ширина-висота svg

var width;
if (window.innerWidth < 825) {
    width = window.innerWidth;
}
else {
    width = window.innerWidth * 0.7;
}

var height;
if (window.innerWidth > 2000) {
    height = width / 3;
}
else {
    height = width / 2;
}

var color = d3.scale.linear()
    .domain([1, 20])
    .clamp(true)
    .range(['#fff', '#409A99']);

var projection;

if (window.innerWidth > 2000) {
    projection = d3.geo.mercator()
        .scale([width * 1.5])
        .center([31.5, 48.5])
        .translate([width / 2, height / 2]);
}
else {
    projection = d3.geo.mercator()
        .scale([width * 2])
        .center([31.5, 48.5])
        .translate([width / 2, height / 2]);
}


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
        top: 0,
        right: window.innerWidth * 0.2,
        bottom: 0,
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
                return "3.8px"
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
            var linkToFile = d.linkToFile;
            drawBarsSide(filter, linkToFile);
            $("#hint_0").css("display", "block");

        })
        .on("mouseover", function(d){
            if(d.district === "no"){
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.city +" - <b>"+ d.share + "</b>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 18) + "px");
            } else {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<b>"+ d.share + "</b>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 18) + "px");
            }




        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            // $('.label').css("display", "block")
        });


    if (window.innerWidth > 825) {
        mapLayer.selectAll("text")
            .data(subset).enter()
            .append("text")
            .attr("class", "label")
            .attr("x", function (d) {
                return projection([d.lon, d.lat])[0] + 7 + "px";
            })
            .attr("y", function (d) {
                return projection([d.lon, d.lat])[1] + 3 + "px";
            })
            .text(function (d) {
                if (d.district === "yes") {
                    return d.city
                }

            })
            .attr("fill", "grey");

    }



    //----------resize-------------------
    window.addEventListener("resize", function () {
        var width;
        if (window.innerWidth < 825) {
            width = window.innerWidth;
        }
        else {
            width = window.innerWidth * 0.7;
        }

        var height;
        if (window.innerWidth > 2000) {
            height = width / 3;
        }
        else {
            height = width / 2;
        }


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

        var effectLayerRect = $('svg#map > g')[0].getBoundingClientRect();
        var colorLegendMarginLeft =  (width - effectLayerRect.width) / 2;

        if (window.innerWidth < 825) {
            colorLegend.selectAll("circle")
                .attr('transform', 'translate(' + (margin.left / 1.5) + ',' + (height) + ')');
            colorLegend.selectAll("text")
                .attr('transform', 'translate('+ ((margin.left / 1.5) + 20) + ','+ (height) + ')');
            sizeLegend.selectAll("circle")
                .attr('transform', 'translate('+ colorLegendMarginLeft + ',' + (height - height + 20) + ')');
            sizeLegend.selectAll("text")
                .attr('transform', 'translate('+ (colorLegendMarginLeft + 15) + ',' + (height - height + 20) + ')');

        }
        else {
            colorLegend.selectAll("circle")
                .attr('transform', 'translate(' + (margin.left / 1.5) + ',' + (height - (height/3.5)) + ')');
            colorLegend.selectAll("text")
                .attr('transform', 'translate('+ ((margin.left / 1.5) + 20) + ','+ (height - (height/3.5)) + ')');
            sizeLegend.selectAll("circle")
                .attr('transform', 'translate('+ (width - margin.right) + ',' + (height - height + 20) + ')');
            sizeLegend.selectAll("text")
                .attr('transform', 'translate('+ (width - margin.right + 15) + ',' + (height - height + 20) + ')');

        }



        var tableContainerRect = document.getElementById('tableContainer').getBoundingClientRect();
        var tableContainerHeight =  tableContainerRect.height - 35;
        var tableRowHeight = tableContainerHeight / 35;

        $(".citiesColumn").attr("height", tableRowHeight);


    });




    //малюємо бокову панель
if(window.innerWidth > 825) {
    var sideBarsData = data.filter(function (k) {
        return k.city === "Київ"
    });

    sideBarsData = sideBarsData.sort(function (a, b) {
        return d3.descending(+a.value, +b.value)
    });

    var table = d3.select('#cityIndicators')
        .append('table')
        .attr("id", "sideTable");

    var thead = table.append('thead');
    var tbody = table.append('tbody');

    // thead.append('tr').selectAll('th')
    //     .data(["Індикатори:", ""]).enter()
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

        .on("click", function (p) {
            $('.indicatorsArray').parent().css("background-color", "transparent");
            $(this).parent().css("background-color", "yellow");
            var filter = p.usage;
            if(window.innerWidth > 825) {
                drawTable(filter)
            }
            $("#hint_0").css("display", "block");


        });


}
    else {
    drawBarsSide("Івано-Франківськ", "xls/Івано_Франківськ.xlsx")
}

    //------- змінює показники міста --------

    function drawBarsSide(filter, linkToFile) {
        $('#excel').css("display", "grid");
        $("#sideTable").remove();
        $("#theCity").html(filter);
        var currentData = data.filter(function(k) {
            return k.city === filter
        });

        currentData = currentData.sort(function (a,b){
            return d3.descending(+a.value, +b.value)
        });

        $('#cityFilter').html(filter);
        $('a#downloadLink').attr("href", linkToFile);
        $('.selectedCity.desk').html("Клікайте на індикатори нижче, аби порівняти обране місто з іншими");

        var table = d3.select('#cityIndicators').append('table').attr("id", "sideTable");
        var thead = table.append('thead');
        var tbody = table.append('tbody');


        // thead.append('tr').selectAll('th')
        //     .data(["Індикатор", "Оцінка"]).enter()
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
            .style("background-color", function(d) {
                if(d.usage === selectedIndicator) {
                    $(this).parent().css('background-color', "yellow");
                    return "yellow"
                }
                else {
                    return false
                }
            })
            .attr("class", "indicatorsArray")
            .style("height", 20)
            .text(function (d) {
                return d.usage
            })
            .on("click", function(p) {
                $('td.indicatorsArray').css("background-color", "transparent");
                $('.indicatorsArray').parent().css("background-color", "transparent");
                $(this).parent().css("background-color", "yellow");
                console.log(p.usage);
                var filter = p.usage;
                if(window.innerWidth > 825) {
                    drawTable(filter)
                }
                selectedIndicator = p.usage;
            });


        rows.append('td')
            .attr("class", "indicatorsArray")
            .style("background-color", function(d) {
                if(d.usage === selectedIndicator) {
                    $(this).parent().css('background-color', "yellow");
                    return "yellow"
                }
                else {
                    return false
                }
            })
            .datum(function (d) {
                return d
            })
            .call(drawBars("white"))
            .on("click", function(p) {
                var filter = p.usage;
                if(window.innerWidth > 825) {
                    drawTable(filter)
                }
                $('td.indicatorsArray').css("background-color", "transparent");
                d3.selectAll('.indicatorsArray').style("color", "grey");
                d3.selectAll('.indicatorsArray').style("font-weight", "normal");
                $('.indicatorsArray').parent().css("background-color", "transparent");
                $(this).parent().css("background-color", "yellow");
                selectedIndicator = p.usage;
                $("#hint_0").css("display", "block")
            });

        rows.append('td')
            .attr("class", "citiesColumn")
            .style("height", 10)
            .text(function (d) {
                return d.value
            });
    }


    var select = d3.select('#dropDown')
        .append('select')
        .attr('class','select')
        .on('change', onchange);

    var options = select
        .selectAll('option')
        .data(data).enter()
        .append('option')
        .attr("value", function (d) { return d.linkToFile; })
        .text(function (d) { return d.city; });

    function onchange() {
        var selected = $(this).find('option:selected');
        var filter = selected.text();
        var linkToFile = selected.val();
        drawBarsSide(filter, linkToFile)
    }

    //----- малює таблицю міст на місці карти
    function drawTable(filter) {
        d3.select('svg#map').style("display", "none");
        d3.select('#logo').style("display", "none");
        d3.selectAll('.tableForRemove').remove();
        d3.select('#tableContainer').style("display", "grid");
        var tableContainerRect = document.getElementById('tableContainer').getBoundingClientRect();
        var tableContainerHeight =  tableContainerRect.height - 50;
        var tableRowHeight = tableContainerHeight / 35;

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
            .style("height", tableRowHeight)
            .text(function (d) {
                return d.city
            })
            .on("click", function(d) {
                $(".citiesColumn").css('background-color', "white");
                $(this).parent().find('.citiesColumn').css('background-color', "yellow");

                var filter = d.city;
                var linkToFile = d.linkToFile;
                drawBarsSide(filter, linkToFile);
                $("#hint_0").css("display", "block");
            });


        rows.append('td')
            .attr("class","citiesColumn")
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
            .call(drawBars("#EBEBEB", tableRowHeight))
            .on("click", function(d) {
                $(".citiesColumn").css('background-color', "white");
                $(this).parent().find('.citiesColumn').css('background-color', "yellow");
                var filter = d.city;
                var linkToFile = d.linkToFile;
                drawBarsSide(filter, linkToFile);
                $("#hint_0").css("display", "block");

            });


        rows.append('td')
            .attr("class", "citiesColumn")
            .style("height", tableRowHeight)
            .text(function (d) {
                return d.value
            })
            .on("click", function(d) {
                $(".citiesColumn").css('background-color', "white");
                $(this).parent().find('.citiesColumn').css('background-color', "yellow");
                var filter = d.city;
                var linkToFile = d.linkToFile;
                drawBarsSide(filter, linkToFile);
                $("#hint_0").css("display", "block");

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


    var effectLayerRect = $('svg#map > g')[0].getBoundingClientRect();
    var colorLegendMarginLeft =  (width - effectLayerRect.width) / 2;


    var colorLegendContainer = svg.selectAll('.legend').append('g')
        .data([
            {"color":"#134162", "text": "20-15 балів"},
            {"color":"#2171a9", "text": "15-10"},
            {"color":"#3695d8", "text": "10-5"},
            {"color":"#8bc2e9", "text": "5-0"}
        ]);

    colorLegendContainer.enter().append('g').attr('class', 'legend')
        .append('g');
    var colorLegend;


        colorLegend = colorLegendContainer.select('g').style("width",100)
            .attr("transform", function(d, i) { return "translate(0,"+ i * 18  +")"; });

        colorLegend.append("circle")
            .style("fill", function(d) {return d.color})
            .attr('r', 5)
            .attr('transform', 'translate('+ colorLegendMarginLeft + ','+ (height - (height/3)) + ')');

        colorLegend.append("text")
            .attr("dy", ".35em")
            .attr('transform', 'translate('+ (colorLegendMarginLeft + 20) + ','+ (height - (height/3)) + ')')
            .attr("font-size", "13px")
            .text(function(d) { return d.text;});



    var sizeLegendContainer = svg.selectAll('.sizeLegend').append('g')
        .data([
            {"r":6, "text": "обласні центри"},
            {"r":4, "text": "інші міста (наведіть мишею на"},
            {"r":0, "text": "точки, щоб побачити назву)"}

        ]);

    sizeLegendContainer.enter().append('g').attr('class', 'sizeLegend')
        .append('g');
    var sizeLegend = sizeLegendContainer.select('g').style("width",100)
        .attr("transform", function(d, i) { return "translate(0,"+ i * 18  +")"; });

    sizeLegend.append("circle")
        .style("fill", "none")
        .style("stroke", "grey")
        .style("stroke-width", "1px")
        .attr('r', function(d) {return d.r})
        .attr('transform', 'translate('+ (width - margin.right ) + ',' + (height - height + 20) + ')');

    sizeLegend.append("text")
        .attr("dy", ".35em")
        .attr('transform', 'translate('+ (width - margin.right  + 15) + ',' + (height - height + 20) + ')')
        .attr("font-size", "12px")
        .text(function(d) { return d.text;});


});


$('#toMap').on("click", function() {
    $('svg#map').css("display", "block");
    d3.select('#logo').style("display", "grid");
    $('.tableForRemove').remove();
    $('#tableContainer').css("display", "none");
    $('#selectedIndicator').html('Оберіть місто');

});







