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
	var is_touch_device = 'ontouchstart' in document.documentElement;

	var DEG2RAD=Math.PI/180;

	var	WIDTH=window.innerWidth,
	   	HEIGHT=200;

	var metorites;
	var playing=true;

	var duration=60*1000;
	var	query="{'year':{$ne:'',$gt:0},'fell_found':'Fell','mass_g':{$gt:0},'type_of_meteorite':{$nin:[/Doubt/]}}",
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
		
		d3.select("body").classed("touch",is_touch_device);

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
		//var t_year_dom=d3.select("#year h4 span");

		var	canvas = document.getElementById( 'falling' ),
		   	ctx = canvas.getContext( '2d' );


		ctx.font = "bold 16px Arial";

		var ground_height=300;

		canvas.width=WIDTH;
		canvas.height=HEIGHT+ground_height;
		document.getElementById("canvas");//.appendChild(canvas);

		var particles = [];
		var current_particles=[];

		var year_extents=d3.extent(data,function(d){
			return d.y;
		})
		//var x_scale=d3.scale.pow().exponent(3).range([100,1100]).domain(year_extents);
		var x_scale=d3.scale.pow().exponent(5).range([0+50,WIDTH-50]).domain([year_extents[0],year_extents[1]]);//.nice();

		
		var svg=d3.select("#canvas")
			//.insert("svg","#info")
			//	.attr("id","years")
			  	.append("svg")
			  	.attr("id","years")
			  	.attr("width",canvas.width)
			  	.attr("height",canvas.height+ground_height)
			  	//.attr("viewBox","0 0 "+canvas.width+" "+canvas.height+ground_height)
			  	//.attr("preserveAspectRatio","xMidYMid")
		d3.select(window).on("resize", function() {
			
			if(WIDTH==window.innerWidth)
				return;

			WIDTH=window.innerWidth;

		    svg.attr("width",WIDTH)
		    canvas.width=WIDTH;
			
			x_scale.range([0+50,WIDTH-50]);

			axis.selectAll("text")
						.attr("x",function(d){
							return parseInt(x_scale(d))
						})

			views_g.selectAll("g.view")
					.attr("transform",function(d){
						return "translate("+parseInt(x_scale(+d.key))+","+(HEIGHT-5)+")"
					});

			isto.selectAll("rect")
					.attr("x",function(d){
						return parseInt(x_scale(+d.key)-1);
					});

			info.el
				.style({
					"left":x_scale(__year)+"px"
				})

			//if(playing) {
				metorites.restart();
			//} else {
			//	drawEarth();
			//}

		});

		//workaround for safari 5.0.5 to support mouseposition
		svg.append("rect")
				.attr("x",0)
				.attr("y",0)
				.attr("width",canvas.width)
				.attr("height",canvas.height+ground_height)
				.style("fill-opacity",0)
		
		
		/*
		var ground=svg.append("g")
					.attr("id","ground");

		ground.append("rect")
			.attr("x",0)
			.attr("y",HEIGHT)
			.attr("width",WIDTH)
			.attr("height",ground_height)
		*/
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

		var views_g=svg.append("g")
				.attr("id","views");
		var m_groups=svg.append("g")
					.attr("id","circles");

		var axis=svg.append("g")
				.attr("id","axis");

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
		var r_scale2=d3.scale.sqrt().rangeRound([4,60]).domain(mass_extents);

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
			container:d3.select("#details>div"),
			list:d3.select("#details ul"),
			year:d3.select("#details h2 span#dYear"),
			count:d3.select("#details h2 span#dCount")
		};

		var selected_years=[];
		function updateDetails(){

			var current_mass_extents=d3.extent(data.filter(function(d){
											return selected_years.indexOf(+d.y)>-1;
											}),function(d){
										return d.m;
									});
			//console.log(current_mass_extents)
			r_scale2.domain([0,current_mass_extents[1]]);

			//details.list
			//	.selectAll("li")

			details.container.selectAll("ul")
					.classed("selected",function(d){
						console.log(d)
						return selected_years.indexOf(+d.key)>-1;
					})
					.selectAll("li.meteorite")
						.select("b")
							.style("width",function(d){
								return r_scale2(d.m)+"px"
							})
							.style("height",function(d){
								return r_scale2(d.m)+"px"
							});
					


		}
		var	body=d3.select("body"),
		   	stuff=d3.select("#stuff");

		function detectScrollTop(){
			//if(tm) {
			//	clearTimeout(tm);
			//}
			if(is_touch_device)
				return;

			var	top=window.scrollY || window.pageYOffset,
			   	fixed=body.classed("fixed");

			stuff.style("opacity",top/400);

			if(top>=299) {
					if(!fixed) {
						//setTimeout(function(){
							body.classed("fixed",true);	
							d3.select(".logo").style("opacity",0).transition().duration(1000).style("opacity",1);
							svg.attr("height",350-1);
						//},50)
					}
			} else {
					if(fixed) {
						//setTimeout(function(){
							d3.select(".logo").style("opacity",0);
							body.classed("fixed",false);
							svg.attr("height",500);
							d3.select(".logo").transition().duration(2000).style("opacity",1);	
						//},50)
					}
			}
		}
		d3.select(window).on("scroll",detectScrollTop)
		var data_for_details=[];
		function createDetails(data){

			//console.log("selected_years", selected_years)

			var data=data || nested_data2;
			/*
			var current_mass_extents=d3.extent(data.filter(function(d){
											return selected_years.indexOf(+d.y)>-1;
											}),function(d){
										return d.m;
									});
			//console.log(current_mass_extents)
			*/

			var ext=[];
			data.filter(function(d){
				return selected_years.indexOf(+d.key)>-1;
			}).forEach(function(d){
				var ex=d3.extent(d.values,function(y){
					return y.m;
				});
				ext=ext.concat(ex);
				
			});
			var current_mass_extents=d3.extent(ext);
			//console.log(current_mass_extents)
			r_scale2.domain([0,current_mass_extents[1]]);
			

			var divs=details.container.selectAll("div.meteorites")
						.data(selected_years)
						//.remove()
						/*
						.data(function(){
							var a=[];
							selected_years.forEach(function(y){
								a=a.concat(data.filter(function(d){
									return +d.key == y;
								}))
							});
							return a;
						}())
						*/
						//.data(data.filter(function(d){
						//	return selected_years.indexOf(+d.key)>-1;
						//}));
							//.insert("div", ":first-child")
			//divs.exit().style("opacity",0.2);

			divs=divs.enter().insert("div", ":first-child")//.append("div")
				.attr("class","meteorites clearfix")
				.attr("data",function(d){
					return +d;
				})
				.style("opacity",0.1)
				
			
			
			divs.append("div")
				.attr("class","m-year")
				.append("a")
					.attr("href","#")
					.attr("title",function(d){
						return "Remove year "+d;
					})
					.html(function(d){
						return "<b>"+d+"</b>"+"<span>x</span>";
					})
					.on("click",function(d){
						d3.event.preventDefault();
						
						//m_groups.select("g[data='"+d+"'] text.plus").attr("dy",0).text("+")
						d3.select("#info[data='"+d+"']").classed("selected",false);
						details.container.selectAll("div.meteorites[data='"+d+"']")
								.transition()
								.duration(1000)
									.style("opacity",0)
									.each("end",function(){
										d3.select(this).remove();
										selected_years.splice(selected_years.indexOf(d),1);
										createDetails();
									})
						
					});
			
			
			var lis=divs.append("ul")
						.selectAll("li.meteorite")
							//.data(function(d){
							//	return d.values;
							//})
							.data(function(y){
								var a=data.filter(function(d){
									return (+d.key)==y;
								});
								return a[0].values;
							})
							.enter()
							.append("li")
								.attr("class","meteorite clearfix");

			lis.append("div")
					.attr("class","shape")
					.append("b")
						.style("width",function(d){
							return "1px";//r_scale2(d.m)+"px"
						})
						.style("height",function(d){
							return "1px";//r_scale2(d.m)+"px"
						})
						.style("top",function(d){
							return "35px"
						})

			lis.append("h3")
					.html(function(d){
						return "<b>"+d.p+"</b><br/><span>"+countries[d.c]+"</span>"+"<br/><span>TYPE: "+d.t+"</span>";
					});
			lis.append("h4")
					.text(function(d){
						return "MASS: "+weight_format(d.m);
					});
			
			lis.append("div")
					.attr("class","links")
						.html(function(d){
							var	l1='<a href="http://here.com/map='+d.l+',8/title='+encodeURI(d.p+', '+d.c+' Type: '+d.t+" Mass: "+weight_format(d.m))+'" target="_blank"><i class="icon-location"></i></a>',
							   	l2='<a href="http://www.lpi.usra.edu/meteor/metbull.php?code='+d.u+'" title="Open at the Meteoritical Society" target="_blank"><i class="icon-link"></i></a>';
							
							return l1+l2;
						});
			
			

		 	divs.transition()
		 			.duration(1000)
		 			.style("opacity",1);

		 	setTimeout(function(){
		 		details.container.selectAll("li.meteorite")
		 			.select("b")
		 				.style("width",function(d){
		 					return r_scale2(d.m)+"px"
		 				})
		 				.style("height",function(d){
		 					return r_scale2(d.m)+"px"
		 				})
		 				.style("border-radius",function(d){
		 					return (r_scale2(d.m)/2)+"px"
		 				})
		 				.style("top",function(d){
		 					return 35 - (r_scale2(d.m)/2)+"px"
		 				})
		 	},50)
		}			

		//createDetails(nested_data2[173]);
		createDetails(nested_data2);

		d3.select("#restart")
			.on("click",function(){
				d3.event.preventDefault();
				metorites.restart();
			});

		var playPause=d3.select("#playPause");
		playPause.on("click",function(){
				d3.event.preventDefault();
				if(status==0) {
					metorites.start();
					playPause.classed("paused",false);
				} else {
					metorites.pause();
					playPause.classed("paused",true);
				}
			});

		var bisectDate = d3.bisector(function(d) { return d.key; }).right;
		var __year=0;
		var mousedown=false;
		var tm=null;
		var info={
			el:d3.select("#info"),
			ul:d3.select("#info ul"),
			h6:d3.select("#info h6"),
			plus:d3.select("#info #plus")
		}

		function setInfoBox(el){
			var first_year=(__year==year_extents[0]);
			
			d3.selectAll(".view.visible").classed("visible",false);
			d3.select(".view[data='"+el.key+"']").classed("visible",true);
				//d3.select(".view[data='"+el.key+"']").classed("visible",true);


			info.el
				.style({
					"display":"block",
					"left":x_scale(__year)+"px",
					"opacity":1
				})
				.attr("data",__year)
				.classed("selected",selected_years.indexOf(__year)>-1)
				.classed("ileft",first_year);

			info.h6.html("Year "+__year+", "+el.values.length+" landings");
			info.ul.selectAll("li").remove();
			info.ul.selectAll("li").data(el.values.slice(0,10))
						.enter()
						.append("li")
							.append("a")
								.attr("href","#")
									.html(function(d){
										var s=h_scale3(d.m)*2;
										s=s|s;
										return "<span>"+d.p+", "+countries[d.c]+"</span> - "+weight_format(d.m)+"<b style=\"width:"+s+"px;height:"+s+"px;top:-"+(s/2+8)+"px;"+(first_year?"left":"right")+":"+(-s/2)+"px;border-radius:"+s/2+"px\"></b>";
									})
									.on("click",function(d){
										//d3.event.stopPropagation();
										d3.event.preventDefault();
										
										if(selected_years.indexOf(+d.y)<0) {
											info.el.classed("selected",true);
											selected_years.push(+d.y);
											createDetails();
										}
											
										
									})
			info.plus
				.on("click",function(){
					d3.event.preventDefault();
						if(selected_years.indexOf(__year)>-1) {
							info.el.classed("selected",false);
							details.container.selectAll("div.meteorites[data='"+__year+"']")
								.transition()
								.duration(1000)
									.style("opacity",0)
									.each("end",function(){
										d3.select(this).remove();
										selected_years.splice(selected_years.indexOf(__year),1);
										createDetails();
									});
							d3.select(this).select("text").attr("dy",0).text("+");
						} else {
							selected_years.push(__year);
							info.el.classed("selected",true);
							createDetails();
							d3.select(this).select("text").attr("dy",-2).text("–");
						}
					});
		}

		svg.on("mousemove",function(){
			   	
			var	x=d3.mouse(this)[0]+4,//+50,
			   	year=x_scale.invert(x);
			year=year|year;

			var	i=bisectDate(nested_data2,year,1),
			   	el=nested_data2[i-1];
			//__year= +el.key;


			if(mousedown && __year != +el.key) {
				__year= +el.key;
				setInfoBox(el);

			} else {
				d3.selectAll(".view.visible").classed("visible",false);
				d3.select(".view[data='"+el.key+"']").classed("visible",true);
			}
		})
		.on("mousedown",function(){
			d3.event.preventDefault();
			//svg.classed("move",true);
			mousedown=true;
			if(tm) {
				clearTimeout(tm);
			}

		}).on("mouseup",function(){
			//setTimeout(function(){
			//	svg.classed("move",false);
			//},250);
			tm=setTimeout(function(){
				d3.selectAll("#circles g[data='"+__year+"']").classed("visible",false);
				info.el.style("opacity",0.1);
			},3000);
			mousedown=false;
		})
		.on("click",function(){

			var	x=d3.mouse(this)[0]+4,//+50,
			   	year=x_scale.invert(x);
			year=year|year;

			var	i=bisectDate(nested_data2,year,1),
			   	el=nested_data2[i-1];
			//__year= +el.key;


				__year= +el.key;
				setInfoBox(el);

		});

		d3.select(document)
			.on("mouseup",function(){
				//setTimeout(function(){
				//	svg.classed("move",false);
				//},250);
				tm=setTimeout(function(){
					//d3.selectAll("#circles g[data='"+__year+"']").classed("visible",false);
					info.el.style("opacity",0.1);
				},3000);
				mousedown=false;
			})
		

		svg.on("touchmove", function(){
			d3.event.preventDefault();
			var	x=d3.touches(this)[0][0],
			   	year=x_scale.invert(x);
			year=year|year;

			var	i=bisectDate(nested_data2,year,1),
			   	el=nested_data2[i-1];

			//console.log(x,year)

			var	x=d3.touches(this)[0][0],
			   		year=x_scale.invert(x);
			   	year=year|year;

				var	i=bisectDate(nested_data2,year,1),
				   	el=nested_data2[i-1];
				//__year= +el.key;


			if(mousedown && __year != +el.key) {
				__year= +el.key;
				setInfoBox(el);

			} else {
				//d3.selectAll(".view.visible").classed("visible",false);
				//d3.select(".view[data='"+el.key+"']").classed("visible",true);
			}

			//d3.selectAll("g#circles g.visible").classed("visible",false);
			//d3.select("g#circles g[data='"+el.key+"']").classed("visible",true);
			//d3.selectAll("g.visible").classed("visible",false);
			//d3.selectAll("g[data='"+el.key+"']").classed("visible",true);
			//setInfoBox(el);
			detectScrollTop();
		})
		.on("touchstart",function(){
			mousedown=true;
			if(tm) {
				clearTimeout(tm);
			}
		})
		.on("touchend",function(){
			d3.event.stopPropagation();
			tm=setTimeout(function(){
				//d3.selectAll(".view.visible").classed("visible",false);
				info.el.style("opacity",0.1);
			},3000);
			detectScrollTop();
		});


		views=views_g.selectAll("g.views")
				.data(nested_data)
				.enter()
					.append("g")
					.attr("class","view")
						.attr("data",function(d){
							return d.key;
						})
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
		/*
		views.append("rect")
		  			.attr("class","bg")
		  			.attr("x",-1)
		  			.attr("y",function(d,i){
		  				return -60;
		  			})
		  			.attr("width",3)
		  			.attr("height",60+ground_height);
		*/							
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

		var pi=Math.PI,
			arc = d3.svg.arc()
		    .innerRadius(0)
		    .outerRadius(0)
		    .startAngle(-90 * (pi/180)) //converting from degs to radians
		    .endAngle(90 * (pi/180)) //just radians

		views.append("path")
				.attr("d", function(d){
					arc.outerRadius(r_scale(d.values.mass)*3);
					return arc();
				})
				.attr("transform","translate(0,4)");
					//.attr("cx",0)
					//.attr("cy",5)
					//.attr("d",function(d){
//
//  						return h_scale3(d.values.mass)*3;
  //					});
    		
    		
    		/*
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
		*/
		/*
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
						}).slice(0,9);
					})
					.enter()
						.append("g")
							.attr("class","meteorite")
							.attr("transform",function(d,i){
								return "translate(0,"+(i*16)+")"
							});

		var plus=m_groups.append("g")
					.on("click",function(d){
						d3.event.stopPropagation();
						if(selected_years.indexOf(+d.key)>-1) {
							details.container.selectAll("div.meteorites[data='"+d.key+"']")
								.transition()
								.duration(1000)
									.style("opacity",0)
									.each("end",function(){
										d3.select(this).remove();
										selected_years.splice(selected_years.indexOf(+d.key),1);
										createDetails();
									});
							d3.select(this).select("text").attr("dy",0).text("+");
						} else {
							selected_years.push(+d.key);
							createDetails();
							d3.select(this).select("text").attr("dy",-2).text("–");
						}
						
					});

		plus.append("circle")
				.attr("class","plus")
				.attr("cx",0)
				.attr("cy",function(d){
					return d.values.slice(0,9).length*16+11;
				})
				.attr("r",12);

		plus.append("text")
				.attr("class","plus")
				.attr("x",0)
				.attr("y",function(d){
					return d.values.slice(0,9).length*16+20
				})
				.text("+")
		
		meteorite_g.append("circle")
				.attr("cx",function(d){
					return h_scale3(d.m);
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
						return weight_format(d.m)+" - "+ d.p+", "+countries[d.c];
					}
					return d.p+", "+countries[d.c]+" - "+weight_format(d.m);
				});
		*/

		function init() {
			particles=[];

			for(var i=0;i<data.length;i++) {
				var d=data[i];
				
				var	vel=new Vector2(2.5+(-0.5 + Math.random()*2),1),
				   	angle=vel.angle(),
				   	dist=vel.clone().reverse();
				
				dist.normalise().multiplyEq(200+(Math.random()*200));

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

				var particle=new Particle(x_scale(d.y)+dist.x,HEIGHT+dist.y,r_scale(d.m));
				//console.log((+d.y)+Math.random())
				particle.t=time_scale_delta((+d.y)+Math.random());
				particle.year=d.y;
				particle.gravity=0;//gravity;

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
			playPause.classed("paused",false);
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
			ctx.clearRect(0,0, canvas.width,canvas.height);
		}
		function drawEarth(){
			ctx.save();
			ctx.strokeStyle ="#fff";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0,HEIGHT);
			ctx.lineTo(WIDTH,HEIGHT);
			ctx.stroke();
			ctx.restore();
		}
		function loop() {

			ctx.fillStyle="rgba(0,0,0,0.2)";
			ctx.fillRect(0,0, WIDTH, HEIGHT);

			var x=(time_scale_delta.invert(t));

			drawEarth();

			if(x<=year_extents[1]) {
				ctx.save();
				ctx.fillStyle="#000";
				ctx.fillRect(x_scale(x)-18,HEIGHT-1,2,2);
				ctx.restore();
			}

			if(current_year!=year) {
				year_dom.text(year)
				views_dom.text(big_format(fell)+" metorite"+((fell>1)?"s":""))	
				current_year=year;
			}

			draw();

			var current_time=new Date().getTime();
			t+=(current_time-time);
			time=current_time;

			
			if(t<duration+5000) {
				playing=true;
				raf_id=requestAnimationFrame(loop);
			} else {
				playing=false;
			}
			
			//if(playing)
			//	loop();
		}
		this.isPlaying=function(){
			return playing;
		}
		function draw() {
			
			for (var i=0; i<particles.length; i++) {
				var particle = particles[i]; 
				if(particle.pos.y<HEIGHT-1 && particle.t<t && !particle.explode) {

					particle.update(canvas);
					year=particle.year;
					particle.draw(ctx);
					fell=i+1;

				} else {

					if(!(particle.pos.y<HEIGHT-1)) {
						
						particle.explode=true;
						particle.vel.x=0;
						particle.vel.y=0;
						particle.radius*=1.095;
						particle.update(canvas);
						particle.draw(ctx);
					}
					
				}

				// render it
				//console.log(particle)
				
			}

		}

	}



	var top_fell=[

/* 0 */
{
  "_id" : ("5177f1afe7cd083a5a9b22ef"),
  "country" : {
    "country" : "Russia"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=23593",
  "latitude" : 46.16,
  "longitude" : 134.65333,
  "mass_g" : (23000000),
  "place" : "Sikhote-Alin",
  "type_of_meteorite" : "Iron, IIAB",
  "year" : 1947
}

,/* 1 */
{
  "_id" : ("5177f1afe7cd083a5a9b22f9"),
  "country" : {
    "country" : "China"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=12171",
  "latitude" : 44.05,
  "longitude" : 126.16667,
  "mass_g" : 4000000,
  "place" : "Jilin",
  "type_of_meteorite" : "H5",
  "year" : 1976
}

,/* 2 */
{
  "_id" : ("5177f1afe7cd083a5a9b2304"),
  "country" : {
    "country" : "Mexico"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=2278",
  "latitude" : 26.96667,
  "longitude" : -105.31667,
  "mass_g" : 2000000,
  "place" : "Allende",
  "type_of_meteorite" : "CV3",
  "year" : 1969
}

,/* 3 */
{
  "_id" : ("5177f1afe7cd083a5a9b2314"),
  "country" : {
    "country" : "United States"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=17922",
  "latitude" : 39.68333,
  "longitude" : -99.86667,
  "mass_g" : 1100000,
  "place" : "Norton County",
  "type_of_meteorite" : "Aubrite",
  "year" : 1948
}

,/* 4 */
{
  "_id" : ("5177f1afe7cd083a5a9b2315"),
  "country" : {
    "country" : "Turkmenistan"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=12379",
  "latitude" : 42.25,
  "longitude" : 59.2,
  "mass_g" : 1100000,
  "place" : "Kunya-Urgench",
  "type_of_meteorite" : "H5",
  "year" : 1998
}

,/* 5 */
{
  "_id" : ("5177f1afe7cd083a5a9b232b"),
  "country" : {
    "country" : "China"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=12087",
  "latitude" : 30.80833,
  "longitude" : 109.5,
  "mass_g" : 600000,
  "place" : "Jianshi",
  "type_of_meteorite" : "Iron, IIIAB",
  "year" : 1890
}

,/* 6 */
{
  "_id" : ("5177f1afe7cd083a5a9b2337"),
  "country" : {
    "country" : "Slovakia"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=12335",
  "latitude" : 48.9,
  "longitude" : 22.4,
  "mass_g" : 500000,
  "place" : "Knyahinya",
  "type_of_meteorite" : "L/LL5",
  "year" : 1866
}

,/* 7 */
{
  "_id" : ("5177f1afe7cd083a5a9b2338"),
  "country" : {
    "country" : "Russia"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=17979",
  "latitude" : 57.78333,
  "longitude" : 55.26667,
  "mass_g" : 500000,
  "place" : "Ochansk",
  "type_of_meteorite" : "H4",
  "year" : 1887
}

,/* 8 */
{
  "_id" : ("5177f1afe7cd083a5a9b2343"),
  "country" : {
    "country" : "United States"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=18101",
  "latitude" : 36.06667,
  "longitude" : -90.5,
  "mass_g" : 408000,
  "place" : "Paragould",
  "type_of_meteorite" : "LL5",
  "year" : 1930
}

,/* 9 */
{
  "_id" : ("5177f1afe7cd083a5a9b234c"),
  "country" : {
    "country" : "Finland"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=5064",
  "latitude" : 60.4,
  "longitude" : 25.8,
  "mass_g" : 330000,
  "place" : "Bjurböle",
  "type_of_meteorite" : "L/LL4",
  "year" : 1899
}


];

var top_found=[
/* 0 */
{
  "_id" : ("5177f1afe7cd083a5a9b22e7"),
  "country" : {
    "country" : "Namibia"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=11890",
  "latitude" : -19.58333,
  "longitude" : 17.91667,
  "mass_g" : (60000000),
  "place" : "Hoba",
  "type_of_meteorite" : "Iron, IVB",
  "year" : 1920
}

,/* 1 */
{
  "_id" : ("5177f1afe7cd083a5a9b22e8"),
  "country" : {
    "country" : "Greenland"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=5262",
  "latitude" : 76.13333,
  "longitude" : -64.93333,
  "mass_g" : (58200000),
  "place" : "Cape York",
  "type_of_meteorite" : "Iron, IIIAB",
  "year" : 1818
}

,/* 2 */
{
  "_id" : ("5177f1afe7cd083a5a9b22e9"),
  "country" : {
    "country" : "Argentina"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=5247",
  "latitude" : -27.46667,
  "longitude" : -60.58333,
  "mass_g" : (50000000),
  "place" : "Campo del Cielo",
  "type_of_meteorite" : "Iron, IAB-MG",
  "year" : 1576
}

,/* 3 */
{
  "_id" : ("5177f1afe7cd083a5a9b22ea"),
  "country" : {
    "country" : "United States"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=5257",
  "latitude" : 35.05,
  "longitude" : -111.03333,
  "mass_g" : (30000000),
  "place" : "Canyon Diablo",
  "type_of_meteorite" : "Iron, IAB-MG",
  "year" : 1891
}

,/* 4 */
{
  "_id" : ("5177f1afe7cd083a5a9b22eb"),
  "country" : {
    "country" : "China"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=2335",
  "latitude" : 47,
  "longitude" : 88,
  "mass_g" : (28000000),
  "place" : "Armanty",
  "type_of_meteorite" : "Iron, IIIE",
  "year" : 1898
}

,/* 5 */
{
  "_id" : ("5177f1afe7cd083a5a9b22ec"),
  "country" : {
    "country" : "Namibia"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=10912",
  "latitude" : -25.5,
  "longitude" : 18,
  "mass_g" : (26000000),
  "place" : "Gibeon",
  "type_of_meteorite" : "Iron, IVA",
  "year" : 1836
}

,/* 6 */
{
  "_id" : ("5177f1afe7cd083a5a9b22ed"),
  "country" : {
    "country" : "Mexico"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=5363",
  "latitude" : 27,
  "longitude" : -105.1,
  "mass_g" : (24300000),
  "place" : "Chupaderos",
  "type_of_meteorite" : "Iron, IIIAB",
  "year" : 1852
}

,/* 7 */
{
  "_id" : ("5177f1afe7cd083a5a9b22ee"),
  "country" : {
    "country" : "Australia"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=16852",
  "latitude" : -30.78333,
  "longitude" : 127.55,
  "mass_g" : (24000000),
  "place" : "Mundrabilla",
  "type_of_meteorite" : "Iron, IAB-ung",
  "year" : 1911
}

,/* 8 */
{
  "_id" : ("5177f1afe7cd083a5a9b22ef"),
  "country" : {
    "country" : "Russia"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=23593",
  "latitude" : 46.16,
  "longitude" : 134.65333,
  "mass_g" : (23000000),
  "place" : "Sikhote-Alin",
  "type_of_meteorite" : "Iron, IIAB",
  "year" : 1947
}

,/* 9 */
{
  "_id" : ("5177f1afe7cd083a5a9b22f0"),
  "country" : {
    "country" : "Mexico"
  },
  "database" : "http://www.lpi.usra.edu/meteor/metbull.php?code=4919",
  "latitude" : 26.2,
  "longitude" : -107.83333,
  "mass_g" : (22000000),
  "place" : "Bacubirito",
  "type_of_meteorite" : "Iron, ungrouped",
  "year" : 1863
}];

function buildHTML(d,data) {
	var big_format=d3.format(",.0f");

	var weight_format=function(n){
		var n=d3.format(".2s")(n);
		n=(n.search(/[kM]+/g)>-1)?(n.replace("k"," kg").replace("M"," ton")):n+" gr";
		return n;
	};

	var	lat=(d.latitude / d.latitude.toFixed() > 1)?d.latitude:d.latitude.toFixed(1),
	   	lng=(d.longitude / d.longitude.toFixed() > 1)?d.longitude:d.longitude.toFixed(1);

	var mass_extents=d3.extent(data,function(d){
		return d.mass_g;
	})
	var	r_scale2=d3.scale.sqrt().rangeRound([5,100]).domain(mass_extents),
	   	r=r_scale2(d.mass_g);

	var str="<div class=\"m-shape\"><b style=\"width: "+r+"px; height: "+r+"px;border-radius:"+(r/2)+"px;-webkit-border-radius:"+(r/2)+"px;margin-top:"+parseInt(50-r/2)+"px\"></b></div>"
	+"<div class=\"m-info\">"
		+"<span class=\"place\">"+d.place+"</span>"
		+"<br/>"
		+"<span>"+d.country.country+", "+d.year+"</span>"
		+"<br/><span>TYPE: "+d.type_of_meteorite+"</span>"
		+"<br/>"
		+"<span>MASS: "+weight_format(d.mass_g)+"</span>"
		+"<br/>"
		+"<a href=\"http://here.com/map="+lat+","+lng+",8/title="+encodeURI(d.place+', '+d.country.country+' Type: '+d.type_of_meteorite+" Mass: "+weight_format(d.m))+"\" target=\"_blank\"><i class=\"icon-location\"></i></a>"
		+"<a href=\""+d.database+"\" title=\"Open at the Meteoritical Society\" target=\"_blank\"><i class=\"icon-link\"></i></a>"
	+"</div>";

	return str;
}

d3.select("div.half.right ul")
	.selectAll("li")
		.data(top_fell)
		.enter()
			.append("li")
			.attr("class","comparison")
			.html(function(d){
				return buildHTML(d,top_found.concat(top_fell));	
			});

d3.select("div.half.left ul")
	.selectAll("li")
		.data(top_found)
		.enter()
			.append("li")
			.attr("class","comparison")
			.html(function(d){
				return buildHTML(d,top_found.concat(top_fell));	
			})

