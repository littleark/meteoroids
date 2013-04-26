	
	var DEG2RAD=Math.PI/180;

	var	width=960,
	   	height=400;

	var metorites;

	d3.json("http://localhost:8081/data",function(json){
		console.log(json);

		metorites=new Metorites(json);

	});

	function Metorites(data){
		var a=-135;
		var angle={
			sin:Math.sin((a)*DEG2RAD),
			cos:Math.cos((a)*DEG2RAD)
		};

		var fall_angle={
			sin:Math.sin(45*DEG2RAD),
			cos:Math.cos(45*DEG2RAD)
		}

		var svg=d3.select("#canvas")
				.append("svg")
					.append("g")
					.attr("transform","translate(0,0)")

		var metorites_group=svg.append("g")
							.attr("id","meteorites");


		var year_extents=d3.extent(data,function(d){
			return d.year;
		})
		var x_scale=d3.scale.linear().range([100,860]).domain(year_extents);

		var mass_extents=d3.extent(data,function(d){
			return d.mass_g;
		})
		var r_scale=d3.scale.linear().range([3,30]).domain(mass_extents);

		var time_scale=d3.scale.linear().range([0,5000]).domain(year_extents);

		var all_meteorites=metorites_group.selectAll("g.m")
						.data(data)
						.enter()
						.append("g")
							.attr("class","m")
							.attr("transform",function(d){
								return "translate("+x_scale(d.year)+",100)"
							});

		all_meteorites.append("line")
				.attr("x1",function(d){
					return r_scale(d.mass_g) * angle.cos;
				})
				.attr("y1",function(d){
					return r_scale(d.mass_g) * angle.sin;
				})
				.attr("x2",-50)
				.attr("y2",-50)



		all_meteorites.append("circle")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",function(d){
					return r_scale(d.mass_g)
				});

		var step=0;
		this.transition=function(){
			var duration=1000,
				n=all_meteorites.data().length;
			all_meteorites
				.transition()
				.ease("quad-in")
				.delay(function(d, i) { 
					//return i / n * duration; 
					return time_scale(d.year)
				})
				.duration(500)
					.attr("transform",function(d){
						var x=x_scale(d.year)+300*fall_angle.cos,
							y=100+300*fall_angle.sin;

						return "translate("+x+","+y+")"
					});
		}

	}