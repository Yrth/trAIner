function getQuadrant(point){
    y4x = point[0]*4;
    yx = point[0];
    yx4 = point[0]/4;
    if(point[1]>=y4x){
        return 1;
    }
    else if(point[1]>=yx){
        return 2;
    }
    else if(point[1]>=yx4){
        return 3;
    }
    else{
        return 4;
    }
}

function compareEucs(data) {
    var eu = data.eu_dis;
    var eu1 = data.eu_dis1;
    var eu2 = data.eu_dis2;
    if(eu>eu2){
        return 'Tu distancia euclidea al origen es menor que a los jugadores de la media. Esto quiere decir que aunque puedas estar en la reginón correcta, podrías mejorar tu juego.'
    }
    else{
        return 'Tu distancia euclidea al origen es mayor que a los jugadores de la media. Esto quiere decir que consigues unas buenas puntuaciones de media en las partidas.'
    }
}

function compareSlope(data){
    var eu = data.eu_dis;
    var eu1 = data.eu_dis1;
    var eu2 = data.eu_dis2;
    var division = (eu+eu2)*(eu+eu2)/(eu1*eu1);
    if(division < 1.01){
        return 'Respecto a los jugadores de media, te encuentras muy cerca de su línea de tendencia. Esto es un buen indicador, puesto que nos dice que te comportas como la mayoría de jugadores en el meta analizado.';
    }
    return 'Respecto a los jugadores de media, te encuentras un poco lejos de la línea de tendencia. Si te encuentras dentro del cuadrante que deberías, esto no importa demasiado.';

}

function compareQuads(qu,qa,mode,label,tags){
    if(mode!='role'){
        var tag = tags[0];
    }
    else{
        var tag = label;
    }
    var message = "";
    if(tag == 'Support'){
        if(qu == 1){
            message += 'Te encuentras dentro del área correcta para ser support. Tienes un ratio de asistencias/muertes superior al de asesinatos/muertes lo que refleja tu espiritu de ayuda a los demás.'
        }
        else if(qu == 2){
            message += 'Te encuentras muy cercano al área correcta (lo más a la izquierda posible). Sin embargo tu ratio de asistencias/muertes no es lo suficientemente superior al de asesinatos/muertes para considerarte un verdadero support.'
            if(qu == qa){
                message += 'De todas maneras, es cierto que te encuentras en el área en el que se encuentra la media con lo que no deberías preocuparte demasiado.'
            }
        }
        else{
            message += 'No podemos considerarte como un buen support. Tienes un ratio de asesinatos/muertes superior al de asistencias/muertes lo que quiere decir que no dejas tantas muertes como deberias a tu carry. Intenta no pensar tanto en tu progreso en la partida  y piensa más en el equipo.'
        }
    }
    else if(tag == 'Mage' || tag == 'Marksman'){
        if(qu==4){
            message += 'Eres el carry soñado por cualquier equipo. Tienes un ratio de asesiantos/muertes muy superior al de asistencias/muertes.'
        }
        else if(qu==3){
            message += 'No te encuentras lejos del área correcta. Sin embargo no te vendrian más algunos asesinatos más por partida. Si gue manteniendo el ratio de asesinatos/muertes superior al de asistencias/muertes para seguir mejorando.'
            if(qu == qa){
                message += 'De todas maneras, es cierto que te encuentras en el área en el que se encuentra la media con lo que no deberías preocuparte demasiado.'
            }
        }
        else{
            message += 'Fallas un poco como carry. Debes mejorar mucho tu ratio de asesinatos/muertes respecto al de asistencias/muertes para ser un buen carry. Debes ser quien decide la partida para tu equipo y para eso necesitas tener asesinatos a favor.'
            if(qu == qa){
                message += 'Aunque también es verdad que te mantienes en la región en la que se encuentran de media los usuarios alojados en la base de datos.'
            }
        }
    }
    else{
        if(qu==3 || qu ==2){
            if(qu==qa){
                message += 'Realizas un buen trabajo como '+tag+' ya que te situas en el cuadrante correcto.'
            }
            else if(Math.abs(qu-qa)){
                message += 'No desempeñas mal el rol de '+tag+' pero deberías comprobar en que área deberias situarte comparado con la media para mejorar tu juego.'
            }
            else{
                message += 'Realizas mal tu rol de '+tag+'. Estas lejos de la media.'
                if(qa==1){
                    message += 'Debes preocuparte más por asistir a tu equipo y menos por tu crecimiento personal.'
                }
                else{
                    message += 'Debes ayudar más a la hora de asesinar al equipo enemigo. Tu rol necesita los asesinatos para crecer.'
                }
            }
        }
        else{
            message += 'No realizas del todo bien el rol de '+tag+'.';
        }
    }
    return message;
}

function roleAnalysis(data,mode,label){
    console.log(mode)
    console.log(label)
    $('#roleAnalysisDiv').html('');
    var kill_deaths = data['pe']['kills'] / data['pe']['deaths'].length;
    var assist_deaths = data['pe']['assists'] / data['pe']['deaths'].length;
    var kill_deaths_avg = data['avg_events']['kills'] / data['avg_events']['deaths'].length;
    var assist_deaths_avg = data['avg_events']['assists'] / data['avg_events']['deaths'].length;
    var user_quad = getQuadrant([kill_deaths,assist_deaths]);
    var avg_quad = getQuadrant([kill_deaths_avg,assist_deaths_avg]);
    var max_x = Math.max(kill_deaths,kill_deaths_avg);
    var max_y = Math.max(assist_deaths,assist_deaths_avg);
    var max_t = Math.max(max_y,max_x);
    var margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = $('#roleAnalysisDiv').width()/2 - margin.left - margin.right,
        height = $('#roleAnalysisDiv').width()/2 - margin.top - margin.bottom;
    var xScale = d3.scale.linear().domain([0,max_t+2]).range([0,width]);
    var yScale = d3.scale.linear().domain([0,max_t+2]).range([height,0]);
    var svg = d3.select('#roleAnalysisDiv').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    var slope_analysis = compareSlope(data)
    var l1 = [[xScale(kill_deaths),yScale(assist_deaths)],[xScale(kill_deaths_avg),yScale(assist_deaths_avg)]];
    var l2 = [[0,yScale(0)],[xScale(kill_deaths),yScale(assist_deaths)]];
    var l3 = [[0,yScale(0)],[xScale(kill_deaths_avg),yScale(assist_deaths_avg)]];
    var union_line = d3.svg.line()
        .x(function(d,i) { return d[0]; })
        .y(function(d,i) { return d[1]; });

    svg.append("path")
      .datum(l1)
      .attr("class", "union_line")
      .attr("d", union_line);
    svg.append("path")
      .datum(l2)
      .attr("class", "union_line")
      .attr("d", union_line);
    svg.append("path")
      .datum(l3)
      .attr("class", "union_line")
      .attr("d", union_line);

    $('#roleAnalysisDiv').append('<div class="col s6 roleAnalysisMessages valign"></div>');

    var message = compareQuads(user_quad,avg_quad,mode,label,data.champ_tags);
    $('.roleAnalysisMessages').append('<div class="col s12"><div class="card teal lighten-3"><div class="card-content white-text"><span class="card-title"></span><p>'+message+'</p></div></div></div>');
    var message = slope_analysis;
    $('.roleAnalysisMessages').append('<div class="col s12"><div class="card teal lighten-3"><div class="card-content white-text"><span class="card-title"></span><p>'+message+'</p></div></div></div>');
    var message = compareEucs(data);
    $('.roleAnalysisMessages').append('<div class="col s12"><div class="card teal lighten-3"><div class="card-content white-text"><span class="card-title"></span><p>'+message+'</p></div></div></div>');

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    var xline = [];
    var fxline = [];
    var xfline = [{'data':0,'index':0},{'data':5,'index':1.25}];
    for (var k = 0; k < 6; k++) {
        xline.push(k);
        fxline.push(k/4);
    }
    for (var k = 0; k < 5; k++) {
        xfline.push(4*k);
    }
    var line = d3.svg.line()
        .x(function(d,i) { return xScale(i); })
        .y(function(d,i) { return yScale(d); });
    var line2 = d3.svg.line()
        .x(function(d,i) { return xScale(d.index); })
        .y(function(d,i) { return yScale(d.data); });
    svg.append("path")
      .datum(xline)
      .attr("class", "line line_p")
      .attr("id", "mline")
      .attr("d", line);

    svg.append("path")
      .datum(fxline)
      .attr("class", "line line_p")
      .attr("id", "bline")
      .attr("d", line);

    svg.append("path")
      .datum(xfline)
      .attr("class", "line line_p")
      .attr("id", "tline")
      .attr("d", line2);

    svg.append('rect')
        .attr('x', 0)
        .attr('y', yScale(1))
        .attr('width', xScale(1))
        .attr('height', xScale(1))
        .attr('rx', 0)
        .attr('ry', 0)
        .style('fill', 'rgba(255,100,50,0.5)');

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Asesinatos/Muertes");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Asistencias/Muertes");

    
    svg.append('circle')
        .attr('cx', xScale(kill_deaths))
        .attr('cy', yScale(assist_deaths))
        .attr('r', 7)
        .style('fill', 'rgba(85, 135, 140,0.7)');

    svg.append('circle')
        .attr('cx', xScale(kill_deaths_avg))
        .attr('cy', yScale(assist_deaths_avg))
        .attr('r', 7)
        .style('fill', 'rgba(255, 199, 0,0.7)');
    
    svg.selectAll('circle')
        .on('mouseenter',function(d,i){
            d3.select(this)
                .transition()
                .attr('r', 10)
                .style('fill', function(){
                    return ['rgba(85, 135, 140,1)','rgba(255, 199, 0,1)'][i];
                })
        })
        .on('mouseleave',function(d,i){
            d3.select(this)
                .transition()
                .attr('r', 7)
                .style('fill', function(){
                    return ['rgba(85, 135, 140,0.7)','rgba(255, 199, 0,0.7)'][i];
                })
        });
}




