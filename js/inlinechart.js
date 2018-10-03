/**
 * Created by yevheniia on 03.10.18.
 */
var drawBars = function (color) {

    var barWidth = 60;
    var barHeight = 10;
    var margin = {top: 0, bottom: 0, left:0, right:0};

    function chart(selection) {

        selection.each(function (data) {

            var div = d3.select(this),
                multiple = div.selectAll('svg').data([data]);

            multiple.enter()
                .append('svg')
                .attr('width', barWidth)
                .attr('height', barHeight)
                .style("overflow", "visible")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var inlineBars = multiple.append('g').attr('class', 'bars');

            inlineBars.append('rect')
                .attr('class', 'underlay')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', function() { return 100 + "%" })
                .attr('height', 10)
                .style('fill', color)
                .style("pointer-event", "none")
                ;

            inlineBars.append('rect')
                .attr('class', 'overlay')
                .attr('x', 0)
                .attr('y', 0)
                .attr("fill", "#3695d8")
                .attr("width", "0%")
                .transition()
                .duration(500)
                .attr('width', function() { return data.share + "%"})
                .attr('height', 10)
                .style('fill', "#3695d8")
                .style("pointer-event", "none");

        });

    }

    return chart;

};