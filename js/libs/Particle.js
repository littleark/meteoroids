function Particle(x,y,radius) {
	
	this.pos = new Vector2(x,y); 
	this.vel = new Vector2(1,0); 
	
	this.radius = radius;

	this.drag = 1.01; 
	
	this.explode=0;
	
	this.gravity = 0.001; 
	
	this.alpha = 1; 
	
	this.fade = 0;	

	this.rotation=0;

	this.spin=0;

	this.diff=new Vector2(0,0);

	this.reset = function (radius) {
		
		this.radius = radius; 
		
	};
	
	//this.reset(radius);
	
	this.update = function(canvas) {

		this.vel.multiplyEq(this.drag);
		
		// add gravity force to the y velocity 
		this.vel.y += this.gravity; 
			
		// and the velocity to the position
		this.pos.plusEq(this.vel);

		this.pos.plusEq(this.diff);
		
		/*  	
		    	// shrink the particle
		    	this.radius *= this.shrink;
		    	// if maxradius is set and we're bigger, reradius!
		    	if((this.maxradius>0) && (this.radius>this.maxradius))
		    		this.radius = this.maxradius; 
		    	
		    	// and fade it out
		    	this.alpha -= this.fade;	
		    	if(this.alpha<0) this.alpha = 0; 
		  */	
		    // rotate the particle by the spin amount. 
		this.rotation += this.spin;
		
		if(this.explode) {
		 	this.alpha-=0.03;
		}	

	 
	};
	this.draw = function(c) {
	
		// if we're fully transparent, no need to render!
		if(this.alpha <= 0) return;
		
		// save the current canvas state
		c.save(); 
		
		// move to where the particle should be
		c.translate(this.pos.x, this.pos.y);
		
		// scale it dependent on the radius of the particle
		//var s = this.shimmer ? this.radius * Math.random() : this.radius; //this.shimmer ? this.radius * 0 : this.radius; 
		//c.scale(s,s);
		
		// and rotate (multiply by Math.PI/180 to 
		// convert from degrees to radians)
		c.rotate(this.rotation * Math.PI/180);
		
		// move the draw position to the center of the image
		//c.translate(this.radius*-0.5, this.radius*-0.5);
		
		// set the alpha to the particle's alpha
		c.globalAlpha = this.alpha; 
		
		// set the composition mode
		c.globalCompositeOperation = this.compositeOperation;
				
		// and draw it! 
		//c.drawImage(img,0,0);
		c.strokeStyle = "#ffffff";
		//c.fillStyle='rgba(160,255,255,0.5)';
		c.fillStyle=this.color || 'rgba(255,140,30,0.5)';
		c.lineWidth = 0; 
		c.beginPath(); 
		c.arc(0,0,this.radius, 0, Math.PI*2, true);
		c.closePath();
		c.fill();
		// and restore the canvas state
		c.restore();
					
	};

	this.explosion = function(c) {
		// if we're fully transparent, no need to render!
		if(this.alpha <= 0) return;
		
		// save the current canvas state
		c.save(); 
		
		// scale it dependent on the radius of the particle
		//var s = this.radius *1.2; //this.shimmer ? this.radius * 0 : this.radius; 
		//c.scale(s,s);
		
		c.globalAlpha = this.alpha;

		c.globalCompositeOperation = this.compositeOperation;
				
		// and draw it! 
		//c.drawImage(img,0,0);
		c.strokeStyle = "#ffffff";
		c.fillStyle='rgba(255,255,0,0.5)';
		c.lineWidth = 0; 
		c.beginPath(); 
		c.arc(0,0,this.radius, 0, Math.PI*2, true);
		c.closePath();
		c.fill();
		// and restore the canvas state
		c.restore();
	}


}