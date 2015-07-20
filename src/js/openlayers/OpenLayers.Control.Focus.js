OpenLayers.Control.Focus = OpenLayers.Class(OpenLayers.Control,
{
	stopDown: true,
	animate: true,
    moveEndTargetLocation: undefined,
    zoomEndTargetLevel: undefined,

    bFocusFeature: false,
    bFocusLocation: true, 
    
    isAnimated: function()
	{
		return this.animate;
	},
    panComplete: function(jumped) // Although this is called from a listener to the baseLayer, this function is wrapped and "applied" with the AdvancedSelectFeature object as this
    {
    	console.log('panComplete()');
    	var z = this.zoomEndTargetLevel;
		if(z!=undefined&&z!=this.map.getZoom()&&this.map.isValidZoomLevel(z))
		{
			this.zoomEndTargetLevel = undefined;
			this.zoomTo(z,true);
			this.map.events.triggerEvent("zoomend");
		}
    	
    	if(this.moveEndTargetFeature!=undefined)
		{
    		this.moveEndListener = null;
    		var f = this.moveEndTargetFeature;
    		var g = this.moveEndTargetLocation;
    		if(this.isJITLayer(f.layer))
	    	{
	    		if(this.isLoaded(f))
	        	{
	    			this.queuePopupFunction(f,g);
	        	}
	    		else
	    		{
	    			this.queueJIT(f,f.layer,f.attributes,g,"bottom-left");
	    		}
	    	}
			else
			{
				this.queuePopupFunction(f,g);
			}
		}
    },
    /**
     * This custom version of OpenLayers just jumps.  We need to migrate to a newer version of 2.13 to have smooth animated zoomin/zoomout.
     * @param jumped - did OpenLayers "tween" there or just jump to the point with setCenter
     */
    zoomComplete: function(jumped)
    {
    	/* Not used until zoomTweening is activated */
    },
    zoomTo: function(z,silent)
    {
    	this.map.moveTo(null, z, {'dragging': undefined, 'forceZoomChange': undefined, 'silent': silent});
    },
    focusOnItem: function(f,g,z,t)
    {
    	this.moveEndListener = null;
		
		if(g.CLASS_NAME=="OpenLayers.LonLat")
    	{
			this.focusOnLocation(g,z,t);
    	}
    	else
    	{
    		this.focusOnLocation(g.getBounds().getCenterLonLat(),z,t);
    	}
    },
    focusOnLocation: function(c,z,t)
    {
    	if(this.atCenter(c))
    	{
    		if(z!=undefined&&z!=this.map.getZoom()&&this.map.isValidZoomLevel(z))
			{
    			this.zoomTo(z,true);
    			this.map.events.triggerEvent("zoomend");
			}
    	}
    	else if(this.closeToCenter(c))
    	{
    		if(z!=undefined&&z!=this.map.getZoom()&&this.map.isValidZoomLevel(z))
    		{
    			this.map.moveTo(c, z, {'dragging': undefined,'forceZoomChange': undefined, 'silent':true});
            }
    		//else Don't do anything, since that you don't need to move, b/c you're already so close.
    	}
    	else
    	{
    		if(this.animate)
    		{
    			if(z!=undefined&&z!=this.map.getZoom()&&this.map.isValidZoomLevel(z))
    			{
        			if(z>this.map.getZoom())
        			{
        				this.zoomTo(z,true);
        				this.map.events.triggerEvent("zoomend");
        			}
        			else if(z<this.map.getZoom())
        			{
            			this.zoomEndTargetLevel = z;
        			}
        			this.map.panTo(c,this);
    			}
    			else
    			{
        			this.map.panTo(c,this);	
    			}
    		}
    		else
    		{
    			if(z!=undefined&&z!=this.map.getZoom())
     			{
    				if(this.isValidZoomLevel(zoom))
    				{
    					this.map.moveTo(c, z, {'dragging': undefined,'forceZoomChange': undefined});
    				}
    				else
    				{
    					this.map.moveTo(c, null, {'dragging': undefined,'forceZoomChange': undefined});
    				}
     			}
    			else
    			{
    				this.map.moveTo(c, null, {'dragging': undefined, 'forceZoomChange': undefined});
    			}
    		}
    	}
    },
    atCenter: function(c)
    {
    	return c.equals(this.map.getCenter());
    },
    closeToCenter: function(c1)
    {
    	var close = false;
    	var r = undefined;
    	var z = this.map.getZoom();
		if(this.map.getProjection()=="EPSG:900913")
		{
			r = (.01)/Math.pow(2,z);
		}
				
		if(r!=undefined)
		{
            var c2 = this.map.getCenter();
            var d = Math.sqrt(Math.pow(c1.lat - c2.lat, 2) + Math.pow(c1.lon - c2.lon, 2));			
			close = d < r;
		}
		return close;
    },
    unFocusOnItem: function(f)
    {
    	this.moveEndTargetFeature = undefined;
    	this.moveEndTargetLocation = undefined;
    	this.moveEndListener = null;
    },
    unFocusAll: function(silent)
    {
    },
    initialize: function(options)
    {
    	var defaultOptions = {multiple:false,clickout:true,hover:true};
    	options = (options==undefined)?defaultOptions:OpenLayers.Util.applyDefaults(options,defaultOptions);    	
    	
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        
        if(this.scope === null)
        {
            this.scope = this;
        }
    },
    panMapStart: function()
    {
    	return true;
    },
    panMap: function(xy)
    {
    	return true;
    },
    panMapDone: function(xy)
    {
    	return true;
    },    
   	CLASS_NAME: "OpenLayers.Control.Focus"
});
