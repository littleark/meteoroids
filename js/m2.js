	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

	var moz=!!navigator.userAgent.match(/firefox/i);
	var chrome=window.chrome || false;

	var DEG2RAD=Math.PI/180;

	var	WIDTH=window.innerWidth,
	   	HEIGHT=200;

	var metorites;

	var duration=60*1000;
	var	apikey="VeKnm4WYzbUPhWSpcVs6lFrde-bNeBTI",
	   	query="{'year':{$ne:'',$gt:0},'fell_found':'Fell','mass_g':{$gt:0},'type_of_meteorite':{$nin:[/Doubt/]}}",
	   	fields="{'mass_g':1,'year':1,'place':1}",
	   	sorting="{'year':1}";
	query="{'year':{$ne:'',$gt:0},'fell_found':'Fell','mass_g':{$gt:0}}";
	//var mongolab_uri="https://api.mongolab.com/api/1/databases/meteoroids/collections/meteorites/?q="+encodeURI(query)+"&f="+encodeURI(fields)+"&s="+encodeURI(sorting)+"&l=35000&apiKey="+apikey;
	//d3.json("http://localhost:8081/data?t="+(new Date().getTime()),function(json){
	d3.json("data/meteors.json?"+(new Date().getTime()),function(json){
	//d3.json(mongolab_uri,function(json){
		/*
		console.log(json);
		json.forEach(function(d){
			d.y=d.year;
			d.m=d.mass_g;
			d.p=d.place;
		})
		*/
		metorites=new Metorites(json);

	});

	function Metorites(data){

		var status=0;
		var big_format=d3.format(",.0f");

		var weight_format=function(n){
			var n=d3.format(".2s")(n);
			n=(n.search(/[kM]+/g)>-1)?(n.replace("k"," kg").replace("M"," ton")):n+" gr";
			return n;
		};

		var year_dom=d3.select("#year h3 span");
		var views_dom=d3.select("#year h3 b");
		var t_year_dom=d3.select("#year h4 span");

		var	canvas = document.createElement( 'canvas' ),
		   	ctx = canvas.getContext( '2d' );


		ctx.font = "bold 16px Arial";

		var ground_height=300;

		canvas.width=WIDTH;
		canvas.height=HEIGHT+ground_height;
		document.getElementById("canvas").appendChild(canvas);

		var particles = [];
		var current_particles=[];

		var year_extents=d3.extent(data,function(d){
			return d.y;
		})
		//var x_scale=d3.scale.pow().exponent(3).range([100,1100]).domain(year_extents);
		var x_scale=d3.scale.pow().exponent(5).range([0+50,WIDTH-50]).domain([year_extents[0],year_extents[1]]);//.nice();

		var svg=d3.select("#canvas")
			.append("svg")
				.attr("id","#years")
				.attr("width",canvas.width)
				.attr("height",canvas.height);

		var ground=svg.append("g")
					.attr("id","ground");

		ground.append("rect")
			.attr("x",0)
			.attr("y",HEIGHT)
			.attr("width",WIDTH)
			.attr("height",ground_height)

		/*
		ground.append("line")
			.attr("x1",0)
			.attr("y1",HEIGHT)
			.attr("x2",WIDTH)
			.attr("y2",HEIGHT)
		*/
		//console.log(parseInt(x_scale(-56)),parseInt(x_scale(0)))
		var v_years=[year_extents[0],1400,1500,1600,1700,1800,1900,1950,2000,2012];
		
		var isto=svg.append("g")
					.attr("id","istograms");

		var m_groups=svg.append("g")
					.attr("id","circles");

		var axis=svg.append("g")
				.attr("id","axis");



		var views_g=svg.append("g")
				.attr("id","views");

		axis.selectAll("text")
					.data(v_years)
					.enter()
					.append("text")
						.style("text-anchor",function(d,i){
							if(d==2012) {
								return "start";
							}
							return "end";
						})
						.attr("dx",function(d,i){
							if(d==2012) {
								return 5;
							}
							return -5;
						})
						.attr("x",function(d){
							return parseInt(x_scale(d))
						})
						.attr("y",HEIGHT + 20)
						.text(String);
		/*
		svg.selectAll("line.tick")
					.data(v_years)
					.enter()
					.append("line")
						.attr("class","tick")
						.attr("x1",function(d){
							return parseInt(x_scale(d))
						})
						.attr("y1",HEIGHT)
						.attr("x2",function(d){
							return parseInt(x_scale(d))
						})
						.attr("y2",HEIGHT + 5);
		*/
		var mass_extents=d3.extent(data,function(d){
			return d.m;
		})
		var r_scale=d3.scale.sqrt().range([1.5,20]).domain(mass_extents);
		var r_scale2=d3.scale.sqrt().range([4,60]).domain(mass_extents);

		var h_scale=d3.scale.sqrt().range([5,100]).domain(mass_extents);
		var h_scale2=d3.scale.sqrt().range([2,20]).domain(mass_extents);
		var h_scale3=d3.scale.pow().exponent(1/3).range([0.5,30]).domain(mass_extents);

		var time_scale=d3.scale.pow().exponent(-1).range([0,1]).domain([year_extents[0],year_extents[1]+100]);
		
		var time_scale_delta=d3.scale.pow().exponent(10).range([1,duration]).domain([year_extents[0],year_extents[1]+100]) //pow().exponent(10)
		

		var	year=year_extents[0],
		   	t=0,
		   	min_year=year_extents[1],
		   	max_year=min_year;
		var gravity=0.01;
		var time=0;

		var nested_data = d3.nest()
				.key(function(d) { return d.y; })
				.rollup(function(ms) {
					return {
						count:ms.length,
						mass:d3.max(ms, function(d) {return d.m;})
					} 
				})
				.entries(data);
		//console.log(nested_data)

		var nested_data2 = d3.nest()
				.key(function(d) { return d.y; })
				.entries(data);
		//console.log(nested_data2)

		//return 0;

		

		isto.selectAll("rect")
				.data(nested_data)
				.enter()
					.append("rect")
						.attr("x",function(d){
							return parseInt(x_scale(+d.key)-1);
						})
						.attr("y",function(d){
							return HEIGHT;// - h_scale(d.values.mass);
						})
						.attr("width",1)
						.attr("height",function(d){
							return h_scale(d.values.mass);
						})
		

		function showMeteorites(year,left,mdata) {

		}

		var details={
			container:d3.select("#details"),
			list:d3.select("#details ul"),
			year:d3.select("#details h2 span#dYear"),
			count:d3.select("#details h2 span#dCount")
		};
		function createDetails2(d_data){
			console.log(d_data);
			//details_container.selectAll()
			details.year.text(d_data.key);
			details.count.text(d_data.values.length);
			var items=details.list.selectAll("li")
					.remove()
					.data(d_data.values)
					.enter()
					.append("li");

			items.append("div")
					.attr("class","meteorite")
					.append("b")
						.style("width",function(d){
							console.log(d)
							return r_scale2(d.m)+"px"
						})
						.style("height",function(d){
							return r_scale2(d.m)+"px"
						});

			
			
			items.append("h3")
					.html(function(d){
						return d.p+"<br/><span>"+d.c+"</span>";
					});
			items.append("h4")
					.text(function(d){
						return weight_format(d.m);
					});
		}
		var selected_years=[];

		function createDetails(data){

			//console.log(data)
			//details.list.selectAll("li").remove();

			var items=details.list
					.selectAll("li")
						
						.data(function(){
							var a=[];
							selected_years.forEach(function(y){
								a=a.concat(data.filter(function(d){
									return +d.y == y;
								}))
							});
							return a;
						}())
						
						//.data(data.filter(function(d){
						//	return selected_years.indexOf(+d.y)>-1;
						//}));

			//items.exit().remove();

			var lis=items.enter()
					.append("li");
			
			lis.append("div")
					.attr("class","meteorite")
					.append("b")
						.style("width",function(d){
							return 0;
						})
						.style("height",function(d){
							return 0;
						});

			lis.append("h3")
					.html(function(d){
						return d.y+"<br/><b>"+d.p+"</b><br/><span>"+d.c+"</span>";
					});
			lis.append("h4")
					.text(function(d){
						return weight_format(d.m);
					});


			var current_mass_extents=d3.extent(items.data(),function(d){
				return d.m;
			});
			console.log(current_mass_extents)
			r_scale2.domain([0,current_mass_extents[1]]);
			items.selectAll("div.meteorite")
					.select("b")
						.transition()
						.duration(1000)
							.style("width",function(d){
								return r_scale2(d.m)+"px"
							})
							.style("height",function(d){
								return r_scale2(d.m)+"px"
							});
			
		}
		//createDetails(nested_data2[173]);
		createDetails(data);

		d3.select("#restart")
			.on("click",function(){
				d3.event.preventDefault();
				metorites.restart();
			});

		var controls=d3.select("#controls");
		controls.on("click",function(){
				d3.event.preventDefault();
				if(status==0) {
					metorites.start();
					controls.classed("paused",false);
				} else {
					metorites.pause();
					controls.classed("paused",true);
				}
			});

		var bisectDate = d3.bisector(function(d) { return d.key; }).right;
		var __year=0;
		svg.on("mousemove",function(){
			var	x=d3.mouse(this)[0]+50,
			   	year=x_scale.invert(x);
			year=year|year;

			var	i=bisectDate(nested_data2,year,1),
			   	el=nested_data2[i-1];

			d3.selectAll("g#circles g.visible").classed("visible",false);
			d3.select("g#circles g[data='"+el.key+"']").classed("visible",true);

			__year= +el.key;
		})
		.on("click",function(){
			if(selected_years.indexOf(__year)>-1) {
				selected_years=selected_years.filter(function(d){
					return d!=__year;
				})
			} else {
				selected_years.push(__year);	
			}
			console.log(selected_years)
			createDetails(data);
		})

		svg.on("touchmove", function(){
			d3.event.preventDefault();
			var	x=d3.touches(this)[0][0],
			   	year=x_scale.invert(x);
			year=year|year;

			var	i=bisectDate(nested_data2,year,1),
			   	el=nested_data2[i-1];

			d3.selectAll("g#circles g.visible").classed("visible",false);
			d3.select("g#circles g[data='"+el.key+"']").classed("visible",true);
		});

		views=views_g.selectAll("g.views")
				.data(nested_data)
				.enter()
					.append("g")
					.attr("class","view")
						.attr("transform",function(d){
							return "translate("+parseInt(x_scale(+d.key))+","+(HEIGHT-5)+")"
						})
						/*
						.on("mouseover",function(d){
							d3.select("g#circles g[data='"+d.key+"']").classed("visible",true);
						})
						.on("mouseout",function(d){
							d3.select("g#circles g[data='"+d.key+"']").classed("visible",false);
						})
						.on("click",function(d){
							var	el=d3.select("g#circles g[data='"+d.key+"']"),
							   	fixed=el.classed("fixed");
							el.classed("fixed",!fixed);
						})
						*/

		views.append("rect")
					.attr("class","bg")
					.attr("x",-1)
					.attr("y",function(d,i){
						return -60;
					})
					.attr("width",3)
					.attr("height",60+ground_height);
									
		views.selectAll("rect.sq")
				.data(function(d){
					var data = [];
					var length = 5; // user defined length

					for(var i = 0; i < d.values.count; i++) {
					    data.push(i);
					}

					return data;
				})
				.enter()
				.append("rect")
					.attr("class","sq")
					.attr("x",-1)
					.attr("y",function(d,i){
						return -(i*2+i*2);
					})
					.attr("width",1)
					.attr("height",1);


		
		
		var m_groups=m_groups.selectAll("g")
							.data(nested_data2)
							.enter()
							.append("g")
								.attr("data",function(d){
									return d.key;
								})
								.attr("transform",function(d){
									return "translate("+(parseInt(x_scale(+d.key))-1)+","+(HEIGHT+100)+")"
								})

		m_groups.append("line")
					.attr("x1",0)
					.attr("y1",-100)
					.attr("x2",0)
					.attr("y2",function(d){
						//console.log(d.key,d.values[0])
						return -(h_scale2(d.values[0].m)+5)
					});
		m_groups.append("text")
					.attr("class","m-title")
					.attr("x",0)
					.attr("y",0)
					.attr("dx",function(d){
						if(d.key==year_extents[0]) {
							return 10;
						}
						return -10;	
					})
					.attr("dy",-15)
					.style("text-anchor",function(d){
						if(d.key==year_extents[0]) {
							return "start";
						}
						return "end";	
					})
					.text(function(d){
						var l=d.values.length;
						return "YEAR "+d.key+": "+l+" LANDING"+(l>1?"S":"");
					})
		var meteorite_g=m_groups.selectAll("circle")
					.data(function(d){
						return d.values.sort(function(a,b){
							return b.m - a.m;
						}).map(function(g){
							g.y=d.key;
							return g;
						});
					})
					.enter()
						.append("g")
							.attr("class","meteorite")
							.attr("transform",function(d,i){
								return "translate(0,"+(i*16)+")"
							});

		meteorite_g.append("circle")
				.attr("cx",function(d){
					return h_scale2(d.m);
				})
				.attr("cy",function(d,i){
					return 0;
				})
				.attr("r",function(d){
					return h_scale3(d.m);
				});

		
		meteorite_g.append("text")
				.attr("x",function(d){
					return 0
				})
				.attr("y",function(d,i){
					return 0;
				})
				.attr("dx",function(d){
					if(d.y==year_extents[0]) {
						return 10;
					}
					return -10;	
				})
				.attr("dy",function(d){
					return "0.3em";
				})
				.style("text-anchor",function(d){
					if(d.y==year_extents[0]) {
						return "start";
					}
					return "end";	
				})
				.text(function(d){
					if(d.y==year_extents[0]) {
						return weight_format(d.m)+" - "+ d.p+", "+d.c;
					}
					return d.p+", "+d.c+" - "+weight_format(d.m);
				});


		function init() {
			particles=[];

			for(var i=0;i<data.length;i++) {
				var d=data[i];
				
				var	vel=new Vector2(2.5,1),
				   	angle=vel.angle(),
				   	dist=vel.clone().reverse();
				
				dist.normalise().multiplyEq(200);

				var	n=dist.magnitude()/vel.magnitude(),
				   	vel2=vel.clone();

				//vel2.x+=(n*gravity);
				//vel2.y+=(n*gravity);

				//218.165652444099 ==> 0
				//184.76971706298647 ==> 0.01
				//115.3391667841787 ==> 0.1

				//dist.normalise().multiplyEq(200+vel2.magnitude())

				//vel2.normalise().multiplyEq(dist.magnitude());

				//console.log("dist",dist.magnitude(),n,vel2.magnitude())

				//+ (dist.magnitude()/vel.magnitude())*gravity
				//if(d.year<500)
				//	console.log(d.year,x_scale(d.year))

				var particle=new Particle(x_scale(d.y)+dist.x + 36,HEIGHT+dist.y,r_scale(d.m));
				//console.log((+d.y)+Math.random())
				particle.t=time_scale_delta((+d.y)+Math.random());
				particle.year=d.y;
				particle.gravity=gravity;

				particle.vel=vel;// +  (mouseVelX*0.4) ;
				//particle.vel.y = 1;//randomRange(-6,6);// +  (mouseVelY*0.4) ;
				


				particle.explode=false;

				/*
				particle.ovel.x=particle.vel.x;
				particle.ovel.y=particle.vel.y;

				particle.delta=1;

				particle.spin=0;//randomRange(0,Math.PI/180)
				*/
				if(chrome) {
					particle.compositeOperation = 'lighter';	
				}
				

				particles.push(particle);

			}
			time=new Date().getTime();
			status=1;
		}
		init();
		loop();

		var fell=1,
			current_year=0,
			raf_id=-1;

		this.restart=function(){
			cancelAnimationFrame(raf_id);
			controls.classed("paused",false);
			fell=1;
			year=year_extents[0];
			current_year=0;
			t=0;
			clean();
			init();
			loop();
		}
		this.pause=function(){
			status=0;
			cancelAnimationFrame(raf_id);
		}
		this.start=function(){
			if(status==0) {
				time=new Date().getTime();
				status=1;
				loop();	
			}
		}

		function clean(){
			ctx.fillStyle="rgba(0,0,0,1)";
			ctx.fillRect(0,0, canvas.width,canvas.height);
		}
		function loop() {

			//ctx.fillStyle="rgb(0,0,0)";
			ctx.fillStyle="rgba(0,0,0,0.2)";
			//ctx.fillRect(x_scale(min_year),0, (x_scale(max_year)+100)-x_scale(min_year), HEIGHT);
			ctx.fillRect(0,0, WIDTH, HEIGHT);

			var x=(time_scale_delta.invert(t));

			ctx.save();
			ctx.strokeStyle ="#fff";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0,HEIGHT);
			ctx.lineTo(WIDTH,HEIGHT);
			ctx.stroke();
			ctx.restore();

			if(x<=year_extents[1]) {
				/*
				ctx.save();
				ctx.fillStyle="#22abef";
				//ctx.fillText(t+" ==> "+parseInt(time_scale_delta.invert(t)),10,HEIGHT-10);
				ctx.font="20px Arial";
				ctx.fillText("YEAR "+parseInt(x),10,40+20);
				ctx.restore();
				*/
				ctx.save();
				ctx.fillStyle="#000";
				ctx.fillRect(x_scale(x)-18,HEIGHT-1,2,2);
				ctx.restore();
				
				t_year_dom.text(parseInt(x))
			}
			/*
			ctx.save();
			ctx.font="40px Arial";
			ctx.fillStyle="rgb(255,255,255)";
			ctx.fillText(year+((year<0)?"BC":"AD"),10,40);
			ctx.restore();
			*/
			if(current_year!=year) {
				year_dom.text(year)
				views_dom.text(big_format(fell)+" metorite"+((fell>1)?"s":""))	
				current_year=year;
			}
			//update();
			//min_year=year_extents[1];
			//max_year=0;
			//update();
			draw();

			var current_time=new Date().getTime();
			t+=(current_time-time);
			time=current_time;

			if(t<duration+5000) {
				raf_id=requestAnimationFrame(loop);
			}
		}

		function draw() {
			
			for (var i=0; i<particles.length; i++) {
				var particle = particles[i]; 

				//if(particle.alpha>0.1) {

					if(particle.pos.y<HEIGHT-1 && particle.t<t && !particle.explode) {

						particle.update(canvas);
						year=particle.year;
						particle.draw(ctx);
						fell=i+1;
						//if(particle.year<0)
						//		console.log(particle)
					} else {
						//if(i==3 && !particle.explode)
						//	console.log(particle.pos);

						if(!(particle.pos.y<HEIGHT-1)) {
							
							particle.explode=true;
							particle.vel.x=0;
							particle.vel.y=0;
							particle.radius*=1.1;
							particle.update(canvas);
							particle.draw(ctx);
						}
						
					}
					
				//}
				
				
				// render it
				//console.log(particle)
				
			}

		}

	}