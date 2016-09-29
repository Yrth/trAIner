 $(window).scroll(function (event) {
        var scroll = $(window).scrollTop();
        if(scroll>20){
            //d3.select
        }

    });
    var active = 'role';
    var availableTags = [
          {% for key, values in data.items %}
              "{{ key }}",
          {% endfor %}
        ];
    $(document).ready(function(){
        $( "#tags" ).autocomplete({
          source: availableTags
        });
        $('#switch').on('click',function(){
            sw_val = $(this).prop('checked');
            if(sw_val){
                $('#roleDropdown').hide();
                $('#characterDropdown').show();
                active = 'champion';
            }
            else{
                $('#roleDropdown').show();
                $('#characterDropdown').hide();
                 active = 'role';
            }
        });
    });
    
    /*$.ajax({
                url: '/getsummonerdata/'+'Yrthgze',
                type: 'GET',
                success: function (json) {
                   goldAnalysis(json);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                  }
            });*/
    var continue_status = 0;
    var margin = { top: 10, right: 10, bottom: 10, left: 10 },
        width = $('#loadProgress').width() - margin.left - margin.right,
        height = 70 - margin.top - margin.bottom;
    
    var svg = d3.select('#loadProgress').append('svg')
        .attr('id', 'progressSvg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + 0 + ',' + margin.top + ')');
    svg.append("linearGradient")
              .attr("id", "temperature-gradient")
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

    var loadRect = svg.append('rect')
                        .attr('x', 0)
                        .attr('id','loadRect' )
                        .attr('y', margin.top )
                        .attr('height', 20)
                        .attr('width',100 );
    var loadScale; 
    function get_status(){
        $.ajax({
            url:'/status',
            type:'GET',
            success:function(json){
                
                var value = json['status'] + json['status_complete'];
                if(json['status'] == 0){
                    text = 'el usuario...';
                }
                else if(json['status'] == 1){
                    text = 'estadísticas...';
                }
                else if(json['status'] == 2){
                    text = 'partidas de usuario...';
                }
                else{
                    text = 'análisis...';
                }
                if(value>=3){
                    value = 10;
                }
                if(value>2 && value <3){
                    value = value*3;
                }
                percentage = (value/10*100).toFixed(2)+'%';
                $('#loadProgressText').html(percentage+'   Cargando '+text);
                loadRect.transition()
                    .attr('width', function(){
                        return loadScale(value);
                    })
            },
            error:function (xhr, ajaxOptions, thrownError) {
                    
                    console.log(xhr.status);
                    console.log(thrownError);
                  }
        });
        if(continue_status == true){
            setTimeout(function(){
                get_status();
            },200);
        }
        else{
            $.ajax({
                url:'/init_status',
                type:'GET'});
        }
    }
    function summonerLookUp() {
        $('#progressSvg').width($('#modal1').width()-margin.left*4);
        loadScale = d3.scale.linear().domain([0,10]).range([0,$('#progressSvg').width()-margin.left*1.7]);
        $('#modal1').openModal({
          dismissible: false
        });
        var s_n = "";
        s_n = $("#userName").val();

        if(active == 'role'){
            var label = $("label[for='"+$('input[name=group1]:checked').attr('id')+"']").text();
        }
        else{
            var label = $('#tags').val();
        }

        if (s_n !== "") {
            $.ajax({
                url: '/getsummonerdata/'+s_n+'/'+active+'/'+label,
                beforeSend:function(){
                    continue_status = 1;
                    get_status();
                },
                type: 'GET',
                success: function (json) {
                    continue_status = 0;
                    goldAnalysis(json);
                    $('#modal1').closeModal();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    continue_status = 0;
                    console.log(xhr.status);
                    console.log(thrownError);
                  }
            });
        } 
        else {
            
        }
    }