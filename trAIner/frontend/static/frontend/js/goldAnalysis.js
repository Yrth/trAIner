function goldAnalysis(data,data_general,user_objects,avg_objects,uao,aao,list_sim,mini_sim){
    $('#canvasGold').html('');
    
    $('#goldAnalysisDiv2').html('');

    $('#goldAnalysisDiv').html('');
    if(list_sim <= 5000){
        var goldtip = '¡Consigues oro al ritmo de los campeones! Está claro que no descuidas tu obtención de oro durante la partida.';
    }
    else if(list_sim <=10000){
        var goldtip = 'Consigues oro de una manera muy parecida a los mejores. Sigue así y podras competir con ellos.';
    }
    else if(list_sim <= 15000){
        var goldtip = 'Consigues oro de una manera normal. No lo haces especialmente mal ni especialmente bien. Puedes intentar mejorar en algún aspecto de obtención de oro.';
    }
    else if(list_sim <= 20000){
        var goldtip = 'Consigues oro de una manera un poco escasa. No lo haces del todo mal pero no descuides este aspecto porque sin oro no podras mantenerte al nivel de la partida.';
    }
    else if(list_sim <= 30000){
        var goldtip = 'Deberías entrenar este aspecto. Es obvio que tienes una carencia a la hora de conseguir oro en comparación a los demás.';
    }
    var g_html = '<div class="col s12"><div class="card teal lighten-3"><div class="card-content white-text"><span class="card-title"></span><p>'+goldtip+'</p></div></div></div>';
    $('#goldAnalysisDiv').append(g_html);
    
    if(mini_sim <= 200){
        var goldtip = '¡No se te escapa un solo minion! El lasthiteo no tiene ningún misterio para ti. Los jugadores como tu son los que consiguen partidas.';
    }
    else if(mini_sim <=400){
        var goldtip = 'Eres de lo mejorcito. Pocos minions escapan a tu mirada y menos todavia a tus ataques. ';
    }
    else if(mini_sim <= 800){
        var goldtip = 'Aunque no realizas mal el concepto del lasthiteo, deberías entrenarlo un poco.';
    }
    else if(mini_sim <= 1600){
        var goldtip = 'Se te escapan una cantidad de minions considerable. Ya seas support o sobre todo carry, no debes descuidar el conseguir oro cada vez que puedas.';
    }
    else if(mini_sim <= 3200){
        var goldtip = 'Tienes que entrenar el lasthit. Es obvio que no se te da del todo bien si te estas quedando tan rezagado en la comparativa de minions.';
    }
    var g_html = '<div class="col s12"><div class="card teal lighten-3"><div class="card-content white-text"><span class="card-title"></span><p>'+goldtip+'</p></div></div></div></div>';
    $('#goldAnalysisDiv').append(g_html);


    //mirar la progresión de minions 

    var margin = { top: 30, right: 30, bottom: 30, left: 50 },
        width = $('#goldAnalysisDiv').width() - margin.left - margin.right,
        height = 320 - margin.top - margin.bottom;
    
    var svg = d3.select('#goldAnalysisDiv').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append("linearGradient")
          .attr("id", "temperature-gradient2")
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", 0).attr("y1", "0%")
          .attr("x2", 10).attr("y2", "100%")
            .selectAll("stop")
              .data([
                {offset: "0%", color: "#e0f2f1","stop-opacity":0.2},
                {offset: "100%", color: "#00695c"}
              ])
            .enter().append("stop")
              .attr("offset", function(d) { return d.offset; })
              .attr("stop-color", function(d) { return d.color; });
    var defs = svg.append("defs");

    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    var filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "120%")
        .attr('width',"120%" );

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 6)
        .attr("result", "blur");

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 0)
        .attr("dy", 0)
        .attr("result", "offsetBlur");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");



    var max_length = Math.max(data.gold_average.length,data_general.gold_average.length);

    var fakeData = [];
    for (var i = 0; i < max_length; i++) {
      fakeData.push(0);
    }

    var x = d3.scale.linear().domain([0,max_length]).range([0,width]);

    var y = d3.scale.linear().domain([0,Math.max(d3.max(data_general.gold_average,function(d){ return d}),d3.max(data.gold_average,function(d){ return d}))])
        .range([height, 0]);

    var line = d3.svg.line()
      .x(function(d,i) { return x(i); })
      .y(function(d) { return y(d); })
      .interpolate("monotone");
        
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");


    var area = d3.svg.area()
        .x(function(d,i) { return x(i); })
        .y0(height)
        .y1(function(d) { return y(d); })
        .interpolate("monotone");

    svg.append('g').attr('id', 'goldAreaG').append('rect').attr('id','goldRect')
      .attr('height',height )
      .style('fill', 'rgba(0,0,0,0)')
      .attr('width', width);

    svg.select('#goldAreaG').append("path")
        .attr('id', 'goldArea')
        .datum(fakeData)
        .attr("class", "area")
        .attr("d", area);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Oro conseguido");
    svg.select('#goldArea').datum(data.gold_average)
      .transition()
      .duration(1200)
      .attr("d", area);

    svg.append('rect')
      .attr('id','goldFollower' )
      .attr('class', 'follower')
      .style('opacity', 0)
      .attr('fill', 'rgba(255,255,255,0.85)')
      .style("filter", "url(#drop-shadow)")
      .style('width', function(){
          return x(6)
      })
      .style('height', height)
      .attr('x', 0);

    svg.append('text')
      .attr('class', 'textFollower')
      .attr('x', 5)
      .attr('y', 20)
      .text('Minuto: 22');
    svg.append('text')
      .attr('class', 'textFollower')
      .attr('x', 5)
      .attr('y', 35)
      .text('Nivel: 22');
    svg.append('text')
      .attr('class', 'textFollower')
      .attr('x', 5)
      .attr('y', 50)
      .text('Oro: 22');

    svg.append('text')
      .attr('class', 'textFollower')
      .attr('x', 5)
      .attr('y', 65)
      .text('Minions: 22');

    svg.append('text')
      .attr('class', 'textFollower')
      .attr('x', 5)
      .attr('y', 80)
      .text('Minions jungla: 22');



    svg.append("path")
      .datum(data_general.gold_average)
      .attr("class", "line")
      .attr("d", line);


    svg.select('#goldAreaG')
      .on('mousemove',function(d,i){
          var x0 = x.invert(d3.mouse(this)[0]);
          x0 = Math.round(x0);
          x_t = 0;
          if(x0 > max_length/2){
              x_t = -x(6);
          }
          //data_ft = data.gold_average[x0];
          data_ft = ['Minuto: '+x0,'Nivel: '+data.level_average[x0],'Oro: '+data.gold_average[x0],'Minions: '+data.minion_average[x0],'Minions jungla: '+data.j_minion_average[x0]];
          svg.select('#goldFollower').transition().duration(80)
            .attr('transform', 'translate(' + x_t + ',' + 0 + ')')
            .style('opacity', 1)
            .attr('x', function(){
                return x(x0);
            });
          svg.selectAll('.textFollower').transition().duration(80)
            .attr('transform', 'translate(' + x_t + ',' + 0 + ')')
            .style('opacity', 1)
            .text(function(d,j){
              return data_ft[j];
            })
            .attr('x', function(){
                return x(x0) + 13.5;
            });
      })
      .on('mouseleave',function(d,i){
          svg.select('#goldFollower').transition().style('opacity', 0);
          svg.selectAll('.textFollower').transition().style('opacity', 0);
      });



    var sortable1 = [];
    var sortable2 = [];
    for (var obj in user_objects){
        sortable1.push([obj, user_objects[obj]]);
    }
    sortable1.sort(function(a, b) {
        return b[1] - a[1];
    });
    for (var obj in avg_objects){
        sortable2.push([obj, avg_objects[obj]]);
    }
    sortable2.sort(function(a, b) {
        return b[1] - a[1];
    });
    sortable1 = sortable1.slice(0,7);
    sortable2 = sortable2.slice(0,7);
    same = [];
    differs = {'user':[],'avg':[]};
    for (var i = 0; i < sortable1.length; i++) {
        var elem = sortable1[i];
        for (var j = 0; j < sortable2.length; j++) {
            if(elem[0] == sortable2[j][0]){
                same.push(elem[0]);
                break;
            }               
        }
        if(same.indexOf(elem[0]) < 0){
            differs['user'].push(elem[0]);
        }
    }
    for (var i = 0; i < sortable2.length; i++) {
        if(same.indexOf(sortable2[i][0]) < 0){
            differs['avg'].push(sortable2[i][0]);
        }
    }
    if(same.indexOf("0")>-1){
      same.splice(same.indexOf("0"),1);
    }
    if(differs['user'].indexOf("0")>-1){
      differs['user'].splice(differs['user'].indexOf("0"),1);
    }
    if(differs['avg'].indexOf("0")>-1){
      differs['avg'].splice(differs['avg'].indexOf("0"),1);
    }
    var columns = 4;

    //var g_html = '<div class="col s12"><div class="card teal lighten-3"><div class="card-content white-text"><span class="card-title"></span><p>'+goldtip+'</p></div></div></div></div>';
    //$('#goldAnalysisDiv').append(g_html);

    var obj_divi = same.length/Math.min(sortable1.length,sortable2.length);
    var message = "";
    if(obj_divi == 0){
        message = "No sueles escoger ningún objeto de manera acertada. Te recomendamos que mires que objetos se utilizan de manera más común en tus selecciones."
    }
    else if(obj_divi < 0.15){
        message = "Sueles escoger un solo objeto de la manera en la que lo hace la mayoría. Es cierto que los objetos muchas veces son situacionales pero suele haber unos estándares para cada temporada del juego. "
    }
    else if(obj_divi < 0.29){
        message = "Aciertas con dos objetos finales de entre los que escoges. No esta del todo mal teniendo en cuenta el cambio habitual en los metas pero no estaría de más que revisases guías de tu rol y/o personajes favoritos.";
    }
    else if(obj_divi < 0.43){
        message = "Aciertas casi la mitad de los objetos que debes utilzar al final de la partida. Esto te da más versatilidad porque no te riges a una norma estandas y te dejas influir más por la situación. Sin embargo, no te olvides de mirar que objetos son los recomendados para tu rol y/o personaje."
    }
    else if(obj_divi < 0.58){
        message = "La mayoría de objetos que escoges se ajustan a los objetos que utilizan los mejores jugadores. Sin embargo ten cuidado, porque el no ser flexible durante la partida puede llevarte a ser demasiado predecible y provocar que tus contrincantes te contraresten facilmente."
    }
    else if(obj_divi < 0.72){
        message = "Solo fallas dos objetos de siete. Pese a que en divisiones inferiores como BRONCE es adecuado seguir los objetos por los que optan los mejores jugadores, en las divisiones superiores deberás adaptarte mejor a cada partida."
    }
    else if(obj_divi < 0.86){
        message = "Sigues a rajatabla los objetos que utilizan los mejores. Esto no es ni bueno ni malo en sí. Mientras tengas versatilidad a la hora de elegir los objetos dependiendo del contexto todo te irá bien."
    }
    else{
        message = "Calcas los objetos a los campeones. Tu elección de objetos es muy acertada. Sin embargo, no te olvides que la selección de objetos es muchas veces situacional y que la necesidad de tu equipo cambiará dependiendo de la partida que estes jugando. No puedes anclarte a coger siempre los mismos objetos."
    }
    var g_html = '<div class="col s12"><div class="card teal lighten-3"><div class="card-content white-text"><span class="card-title"></span><p>'+message+'</p></div></div></div></div><div class="col s12"><div class="card teal lighten-3"><div class="card-content white-text"><span class="card-title"></span><p>A continuación dispones de los objetos que sueles escoger normalmente. Puedes pinchar en los que estan en verde para comparar en que rango de tiempo compras tu esos objetos y el rango del tiempo en el que lo compran los demás. Puedes pinchar en el icono situado en la esquina superior derecha en aquellos que estan en rojo para averiguar por que otro objeto podrías cambiarlo en comparación a otros jugadores.</p></div></div></div></div>';
    $('#goldAnalysisDiv2').append(g_html);
    for (var i = 0; i < same.length; i++) {
        var id_s = same[i];
        $.ajax({
            url: '/get_object_by_id/'+id_s,
            type: 'GET',
            success: function (json2) {
                $('#goldAnalysisDiv2').append('<div class=" col s'+columns+'"><div class="hoverable usedObsCol cardsObject card green lighten-2" id="'+json2['id_o']+'"><div class="card-content white-text"><img width="35px" class="circle" src="http://ddragon.leagueoflegends.com/cdn/6.18.1/img/item/'+json2['image']['full']+'"><span class="card-title" style="position:relative;top:-9px;left:5px;font-size:20px !important;line-height:1.2 !important;font-weight:bold">'+utf8_decode(json2['name'])+'</span><p>'+utf8_decode(json2['plaintext'])+'</p></div></div></div></div>')
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            }
        });
    }
    var differs_user = [];
    var differs_avg = [];
    for (var i = 0; i < differs['user'].length; i++) {
        var id_s = differs['user'][i];
        $.ajax({
            url: '/get_object_by_id/'+id_s,
            type: 'GET',
            success: function (json2) {
              differs_user.push(json2);
                $('#goldAnalysisDiv2').append('<div class=" col s'+columns+'"><div class="incorrects hoverable cardsObject card red lighten-2" id="'+json2['id_o']+'"><div class="card-content white-text"><img class="refreshImg" width="20px" src="/static/frontend/img/refresh.png"><img width="35px" class="circle" src="http://ddragon.leagueoflegends.com/cdn/6.18.1/img/item/'+json2['image']['full']+'"><span class="card-title" style="position:relative;top:-9px;left:5px;font-size:20px !important;line-height:1.2 !important;font-weight:bold">'+utf8_decode(json2['name'])+'</span><p>'+utf8_decode(json2['plaintext'])+'</p></div></div></div></div>')
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            }
        });
    }
    for (var i = 0; i < differs['avg'].length; i++) {
        var id_s = differs['avg'][i];
        $.ajax({
            url: '/get_object_by_id/'+id_s,
            type: 'GET',
            success: function (json2) {
              differs_avg.push(json2);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            }
        });
    }
    function getMaxOfArray(numArray) {
      return Math.max.apply(null, numArray);
    }
    setTimeout(function(){
      var heights = [];
      var usedObsCol = $('.cardsObject');
      for (var i = 0; i < usedObsCol.length; i++) {
          heights.push($(usedObsCol[i]).height());
      }
      the_height = getMaxOfArray(heights);
      $('.cardsObject').height(the_height);
      $('.cardsObject').attr('real_w',function(){
          return $(this).width();
      });
      $('.usedObsCol').on('click',function(){
          expandGold($(this).attr('id'));
      });

      d3.selectAll('.refreshImg').on('click',function(d,i){
          $(this).fadeOut();
          var elem = $(this).parent();
          elem.parent().removeClass('red');
          elem.parent().addClass('green');
          $(elem.find('img')[1]).attr('src', 'http://ddragon.leagueoflegends.com/cdn/6.18.1/img/item/'+differs_avg[i]['image']['full']);
          elem.find('span').html(utf8_decode(differs_avg[i]['name']));
          elem.find('p').html(utf8_decode(differs_avg[i]['plaintext']));
      }); 
    },1000);
    
    function expandGold(this_id){
        $('#'+this_id).off('click');
        $('.cardsObject').hide();

        $('#'+this_id).animate({'width':$('#goldAnalysisDiv').width()});
        $('#'+this_id).show();
        $('#'+this_id).append('<div class="goldActions card-action"><a href="#" id="you">Mostrar cuando lo compras tu</a><a id="the_rest" href="#" style="float:right">Mostrar cuando lo compran los demás</a><br><br><a id="getBack" class="waves-effect waves-light btn">Volver atrás</a></div>');
        var data_u = uao[this_id];
        var data_a = aao[this_id];
        $('#you').on('mouseenter',function(){
            drawGold(data_u);
        });
        $('#the_rest').on('mouseenter',function(){
            drawGold(data_a);
        });
        $('#getBack').on('click',function(){
            $('.cardsObject').show();
            $('.usedObsCol').animate({'width':$('.usedObsCol').attr('real_w')});
            $('.goldActions').remove();
            setTimeout(function(){
                $('#'+this_id).on('click',function(){
                    expandGold($(this).attr('id'));
                });
            },1000);
            
        });
    }

    function drawGold(data){
        $('#canvasGold').html('');
        var ddwidth = parseFloat(d3.select('#goldRect').attr('width'));
        var ddheight = parseFloat(d3.select('#goldRect').attr('height'));
        var xScal = d3.scale.linear().domain([0,max_length*60*1000]).range([0,ddwidth]);
        var yScal = d3.scale.linear().domain([0,ddheight]).range([ddheight,0]);
        var finalData = [];
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < ddheight; j+=4) {
                finalData.push({x:Math.round(xScal(data[i])),y:j,value:1});
            }
        }
        //var data = deaths.map(function(d){
         //   return {x:Math.round(xScal(d.x)),y:Math.round(yScal(d.y)),value:1};
        //});
        $('#canvasGold').width(ddwidth);
        $('#canvasGold').height(ddheight);
        $('#canvasGold').css('top',window.pageYOffset + document.getElementById('goldRect').getBoundingClientRect().top);
        $('#canvasGold').css('left',document.getElementById('goldRect').getBoundingClientRect().left);
        var heatmap = h337.create({
          container: document.getElementById('canvasGold')
        });
        heatmap.setData({
            min:0,
            max: 100,
            data: finalData
        });
        $('#canvasGold').css('position','absolute');
    }
    
}
























