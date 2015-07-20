/**
 * @author U.S. Department of State, Humanitarian Information Unit
 * @version 1.0
 */

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.AdvancedLegend
 * The TimeSlider control selects refreshes TimeVector layers based on the date selected.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 *  
 *  @author U.S. Department of State, Humanitarian Information Unit
 *  @version 1.0
 */
OpenLayers.Control.Bookmarks = OpenLayers.Class(OpenLayers.Control,
{
	//Constant Variables
	daysoftheweek:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	monthsoftheyear:['January','February','March','April','May','June','July','August','September','October','November','December'],
	
	//Singularity Variables
	type: 'static',//static or time
	mainDiv: undefined,
	bookmarks: undefined,//OpenLayers.Bookmark (Defined below)
	bookmarkContainers: undefined,//Array of BookmarkDivs
	
    listener: undefined,    

    passthroughEvents: false,
    blackholeEvents: false,
 
    layer: null,
    layers: null,
    
    focusControl: undefined,
    
    bHide: false,
    bFade: true,
        
    setFocusControl: function(focusControl)
    {
    	this.focusControl = focusControl;
    },
    hasFocusControl: function()
    {
    	return this.focusControl!=undefined; 
    },
    getFocusControl: function()
    {
    	return this.focusControl;
    },
    
    setLayer: function(layer)
    {
    	var that = this;
    	this.layer = layer;
    	layer.events.register('featuresadded',layer,function()
      	{
			that.refresh.apply(that);
		});
    },
    setLayers: function(layers)
    {
    	var that = this;
    	this.layers = layers;
    	for(var i = 0; i < layers.length; i++)
    	{
    		var layer = layers[i];
    		layer.events.register('featuresadded',layer,function()
	      	{
				that.refresh.apply(that);
			});
    	}
    },
    
    refresh: function()
    {
    	if(this.layer!=undefined)
       	{
        	this.refreshLayers([this.layer],this.bookmarks,this.bookmarkContainers);
       	}
        else if(this.layers!=undefined)
        {
        	this.refreshLayers(this.layers,this.bookmarks,this.bookmarkContainers);   	
        }
        else
        {
        	this.refreshLayers(undefined,this.bookmarks,this.bookmarkContainers);
        }
    },
    refreshLayers: function(layers,bookmarks,containers)
    {
    	for(var i = 0; i < bookmarks.length; i++)
    	{
    		var bookmark = bookmarks[i];
    		var container = $(containers[i]);
        	if(bookmark!=undefined)
        	{
        		bookmark.refresh.apply(bookmark,[this.map,layers,this.map.getProjectionObject()]);
        		if(container!=undefined)
        		{
        			var hasTarget = bookmark.hasTarget.apply(bookmark);
            		if(hasTarget)
            		{
            			container.removeClass("hidden fade");
            		}
            		else
            		{
            			if(this.bHide)
			    		{
            				container.removeClass("fade");
            				container.addClass("hidden");
			    		}
			    		else if(this.bFade)
			    		{
			    			container.removeClass("hidden");
			    			container.addClass("fade");
			    		}
			    		else
			    		{
			    			container.removeClass("hidden fade");
			    		}
            		}
        		}       		
        	}
    	}
    },
    
    setBookmarks: function(bookmarks)
    {
    	var a = [];
    	if(bookmarks!=undefined)
    	{
    		for(var i = 0; i < bookmarks.length; i++)
        	{
        		a.push(new OpenLayers.Bookmark(bookmarks[i]));
        	}
    	}
    	this.bookmarks = a;
    },
    
    
    isAnimated: function()
	{
		return this.animate;
	},
	
    getMaxWidth: function()
    {
    	if(!OpenLayers.Element.hasClass(this.mainDiv,"collapsed"))
    	{
    		return this.expandedMaxWidth;
    	}
    	else
    	{
    		return this.collapsedMaxWidth;
    	}
    },

    setMap: function(map)
    {
    	OpenLayers.Control.prototype.setMap.apply(this, [map]);
    	var that = this;
    	map.events.register('changebaselayer',map,function()
      	{
			that.refresh.apply(that);
		});
    	 
    	/*var that = this;
    	if(this.layers!=undefined)
        {
    		for(var i = 0; i < this.layers.length; i++)
        	{
            	map.events.register('zoomend',this.layers[i],function()
    	      	{
    				that.refresh.apply(that);
    			});
        	}
        }
        else
        {
        	map.events.register('zoomend',this.layer,function()
	      	{
				that.refresh.apply(that);
			});
        }*/
    },  
    initialize: function(layers, bookmarks, options)
    {
    	OpenLayers.Control.prototype.initialize.apply(this, [options]);
    	
        if(bookmarks!=undefined)
        {
        	if(OpenLayers.Util.isArray(bookmarks))
            {
                this.setBookmarks(bookmarks);
            }
            else
            {
                this.setBookmarks([bookmarks]);
            }
        }
        else
        {
        	 this.setBookmarks(undefined);
        }
        
        if(OpenLayers.Util.isArray(layers))
        {
            this.setLayers(layers);
        }
        else
        {
            this.setLayer(layers);
        }
        
        if(options!=undefined)
        {
        	if(options.focusControl!=undefined)
            {
            	this.setFocusControl(options.focusControl);
            }
        }
    },
    draw: function()
    {
    	var div = OpenLayers.Control.prototype.draw.apply(this);
        this.bookmarkContainers = this.createBookmarkContainers(this.bookmarks);
	    for(var i = 0; i < this.bookmarkContainers.length; i++)
	    {
	    	div.appendChild(this.bookmarkContainers[i]);
	    }
        this.mainDiv = div;
        
        
        $(div).on('click dblclick','.olControlBookmark',function(e)
        {
        	var that = $(this).data('olControlBookmarks');
        	var bookmark = $(this).data('bookmark');
        	that.onBookmarkClick.apply(that,[e,bookmark]);
        	that.blackhole.apply(that,[e]);
        });
        
        var events = this.map.events;
		events.registerPriority("click",this,this.onMapClick);

		//this.refresh();
		//this.refreshLayers(undefined,this.bookmarks,this.bookmarkContainers);//Bypass layers, since we know they don't have any data in them yet.
		
        return div;
    },
    createBookmarkContainers: function()
    {
    	var bookmarks = [];
    	if(this.bookmarks!=undefined)
    	{
    		for(var i = 0; i < this.bookmarks.length; i++)
     	    {
     	    	var bookmark = this.createBookmarkContainer(this.bookmarks[i]);
     	    	bookmarks.push(bookmark);
     	    }
    	}
    	return bookmarks;
    },
    createBookmarkContainer: function(bookmark)
    {
    	var container = document.createElement('div');
    	container.className = "olControlBookmarkContainer";
        $(container).data('olControlBookmarks',this);
        $(container).data('bookmark',bookmark);
        
    	var div = document.createElement('div');
    	div.className = "olControlBookmark";
        $(div).data('olControlBookmarks',this);
        $(div).data('bookmark',bookmark);
        container.appendChild(div);
        
        var label = document.createElement('span');
        label.className = "olControlBookmarkLabel";
        label.innerHTML = bookmark.getLabel();
        div.appendChild(label);
	    
        var arrow = document.createElement('span');
        arrow.className = "olControlBookmarkArrow";
        arrow.innerHTML = "&rarr;";
        div.appendChild(arrow);
        
	    return container;
    },
    onBookmarkClick: function(evt,bookmark)
    {
    	if(this.hasFocusControl())
		{
			if(bookmark.isLocationBookmark())
			{
				if(bookmark.hasTarget())
				{
					var c = bookmark.getTargetLocation();
					var z = bookmark.getTargetZoom(this.map);
					var t = bookmark.getTargetTime();
					
					var focusControl = this.getFocusControl();
					focusControl.unFocusAll.apply(focusControl,[true]);
					focusControl.focusOnItem.apply(focusControl,[undefined,c,z,t]);
				}
			}
			else if(bookmark.isFeatureBookmark())
			{
				if(bookmark.hasTarget())
				{
					var f = bookmark.getTargetFeature();
					var c = bookmark.getTargetLocation();
					var z = bookmark.getTargetZoom(this.map);
					var t = bookmark.getTargetTime();
					
					var focusControl = this.getFocusControl();
					focusControl.unFocusAll.apply(focusControl,[true]);
					focusControl.select.apply(focusControl,[f]);
					focusControl.focusOnItem.apply(focusControl,[f,c,z,t]);
				}
			}
		}
    },
    
    setZIndex: function(zIndexBase,numberOfControls)
    {
    	var divs = this.bookmarkContainers;
    	for(var i = 0; i < divs.length; i++)
    	{
    		var div = divs[i];
    		div.style.zIndex = zIndexBase + numberOfControls;
    	}
    },
    
   
    passthrough: function(evt)
    {
    	return false;
    }, 
    blackhole: function(evt)
    {
    	evt.stopPropagation();
    },
    onMapClick: function()
    {
    },
    onMapResize: function()
    {
    	this._resizeBookmarks();
    },
    _resizeBookmarks: function()
    {
    },
   
	/*---------------------------------------------------- Autocomplete Functions ---------------------------------------------------*/
	onFeatureUnselected: function(f)
	{
		this.clearAutocompleteTarget();
	},
	setAutocompleteTarget: function(f)
	{
		if(this.acTarget!=f)
		{
			this.acTarget = f;
			
			if(this.hasFocusControl())
			{
				var c = f.geometry;
				
				var focusControl = this.getFocusControl();
				
				//focusControl.unFocusOnItem.apply(focusControl);//Removes popup and timers immediately
				//focusControl.unselectAll.apply(focusControl);
				
				focusControl.unFocusAll.apply(focusControl,[true]);
				
				focusControl.select.apply(focusControl,[f]);
				focusControl.focusOnItem.apply(focusControl,[f,c]);
			}
			
			//var focusControl = this.map.
			
			
			//this.select(f);
	    	//this.focusOnItem(f,c);
		}
	},
	clearAutocompleteTarget: function()
	{
		this.acTarget = undefined;
		$(this.searchInput).val("");
		this.validateAutocomplete.apply(this,[this.searchInput]);
	},
    destroy: function()
    {
    	  this.sliderEvents.un
    	  ({
              "touchstart": this.zoomBarDown,
              "touchmove": this.zoomBarDrag,
              "touchend": this.zoomBarUp,
              "mousedown": this.zoomBarDown,
              "mousemove": this.zoomBarDrag,
              "mouseup": this.zoomBarUp
          });
          this.sliderEvents.destroy();
    },
    CLASS_NAME: "OpenLayers.Control.Bookmarks"
});


OpenLayers.Bookmark = OpenLayers.Class
({
	config: undefined,
	//
	allLayers: undefined,
	//
	targetSelector: undefined,
	targetProjection: undefined,
	targetLayer: undefined,
	targetFeature: undefined,
	targetLocation: undefined,
	targetZoom: undefined,
	targetTime: undefined,
	
	
	initialize: function (config, options)
	{
		this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		OpenLayers.Util.extend(this, options);
		if (this.id == null)
		{
			this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
		}
		
		this.config = config;
	},
	getType: function()
	{
		return this.config.type;
	},
	isLocationBookmark: function()
	{
		return this.config.type=="location";
	},
	isFeatureBookmark: function()
	{
		return this.config.type=="feature";
	},
	getLabel: function()
	{
		return this.config.label;
	},
	refresh: function(map, layers, targetProjection)
	{
		this.allLayers = layers;
		this.targetProjection = targetProjection;
		if(this.isFeatureBookmark())
		{
			this.targetSelector = this.config.selector;
			this.targetLayer = this.buildTargetLayer();
			this.targetFeature = this.buildTargetFeature();
		}
		this.targetLocation = this.buildTargetLocation();
		if(this.isLocationBookmark())
		{
			this.targetZoom = this.buildTargetZoom(map);
		}
		this.targetTime = this.buildTargetTime(map);
	},
	buildTargetLayer: function()
	{
		var targetLayer = undefined;
		for(var i = 0; i < this.allLayers.length; i++)
		{
			var layer = this.allLayers[i];
			if(layer.options.proto==this.targetSelector.layer)
			{
				targetLayer = layer;
				break;
			}
		}
		return targetLayer;
	},
	buildTargetFeature: function()
	{
		var targetFeature = undefined;
		if(this.targetLayer!=undefined)
		{
			for(var i = 0; i < this.targetLayer.features.length; i++)
			{
				var f = this.targetLayer.features[i];
				if(this.isCandidateFeature(f,this.targetSelector.where))
				{
					targetFeature = f;
					break;
				}
			}
		}
		return targetFeature;
	},
	isCandidateFeature: function(f,w)
	{
		var a = f.attributes;
		if(w.op=="="||w.op=="==")
		{
			return a[""+w.field]==w.value;
		}
		else if(w.op=="!="||w.op=="<>")
		{
			return a[""+w.field]!=w.value;
		}
		else if(w.op=="not in"||w.op=="notin"||w.op=="not_in")
		{
			return $.inArray(a[""+w.field],w.values)==-1;
		}
		else
		{
			return false;
		}
	},
	buildTargetLocation: function()
    {
    	var targetLocation = undefined;
    	if(this.config.location!=undefined)
    	{
    		if(typeof this.config.location == "string")
    		{
    			var a = this.config.location.split(",");
    			var lon = parseFloat(a[0]);
    			var lat = parseFloat(a[1]);
    			var zoom = parseInt(a[2],10);
    			if(lon!=undefined&&lat!=undefined)
    			{
    				var sourceProjection = new OpenLayers.Projection("EPSG:4326");
    				var point = new OpenLayers.LonLat(lat,lon);
    				targetLocation = point.transform(sourceProjection, this.targetProjection);
    			}
    		}
    		else
    		{
    			var lon = this.config.location.longitude;
    			var lat = this.config.location.latitude;
    			var x = this.config.location.x;
    			var y = this.config.location.y;
    			if(lon!=undefined&&lat!=undefined)
    			{
    				var sourceProjection = new OpenLayers.Projection("EPSG:4326");
    				var point = new OpenLayers.LonLat(lon,lat);
    				targetLocation = point.transform(sourceProjection,this.targetProjection);
    			}
    			else if(x!=undefined&&y!=undefined)
    			{
    				targetLocation =  new OpenLayers.LonLat(x,y);
    			}
    		}
    	}
    	
    	if(targetLocation==undefined)
    	{
    		if(this.isFeatureBookmark())
        	{
        		if(this.targetFeature!=undefined)
        		{
        			targetLocation = this.targetFeature.geometry.getBounds().getCenterLonLat();
        		}
        	}
    	}
    	return targetLocation;
    },
    buildTargetZoom: function(map)
    {
    	var targetZoom = undefined;
    	if(this.config.location!=undefined)
    	{
    		if(typeof this.config.location == "string")
    		{
    			var a = this.config.location.split(",");
    			var zoom = parseInt(a[2],10);
    			if(zoom!=undefined)
    			{
    				targetZoom = zoom;
    			}
    		}
    		else
    		{
    			var zoom = this.config.location.zoom;
    			if(zoom!=undefined)
    			{
    				targetZoom = zoom;
    			}
    		}
    	}
    	
    	if(targetZoom==undefined)
    	{
    		if(this.isFeatureBookmark())
        	{
        		var layer = this.getTargetLayer();
        		
        		var currentZoom = map.getZoom();
        		
        		if(layer.inRange)
        		{
        			targetZoom = currentZoom;
        		}
        		else
        		{
        			var maxZoom = $.inArray(layer.minResolution,map.resolutions);
        			var minZoom = $.inArray(layer.maxResolution,map.resolutions);
        			if(currentZoom>maxZoom)
        			{
        				targetZoom = maxZoom;
        			}
        			else if(currentZoom<minZoom)
        			{
        				targetZoom = minZoom;
        			}
        		}
        	}
    	}
    	return targetZoom;
    },
    buildTargetTime: function(map)
    {
		var targetTime =  undefined;
    	if(this.config.time!=undefined)
    	{
    		if(typeof this.config.time == "string")
    		{
        		targetTime = CyberGIS.Date.parseDate(this.config.time);
    		}
    	}
		return targetTime;
    },
    
    getTargetLayer: function()
    {
    	return this.targetLayer;
    },
    getTargetFeature: function()
    {
    	return this.targetFeature;
    },
    getTargetLocation: function()
    {
    	return this.targetLocation;
    },
    getTargetZoom: function(map)
    {
    	if(this.isLocationBookmark())
    	{
    		//built in refresh
    	}
    	else if(this.isFeatureBookmark())
    	{
    		this.targetZoom = this.buildTargetZoom(map);
    	}
    	return this.targetZoom;
    },
    getTargetTime: function()
    {
    	return this.targetTime;
    },
    
    hasTarget: function()
    {
    	var bTarget = false;
    	if(this.isLocationBookmark())
    	{
    		bTarget = this.targetLocation!=undefined;
    	}
    	else if(this.isFeatureBookmark())
    	{
    		bTarget = this.targetFeature!=undefined&&this.targetLocation!=undefined;
    	}
    	return bTarget;
    },
    buildTargets: function()
    {
    	var c = undefined;
    	if(bookmark.type=="location")
    	{
    		if(typeof bookmark.location == "string")
    		{
    			var a = bookmark.location.split(",");
    			var lon = parseFloat(a[0]);
    			var lat = parseFloat(a[1]);
    			var zoom = parseInt(a[2],10);
    			if(lon!=undefined&&lat!=undefined)
    			{
    				var proj = new OpenLayers.Projection("EPSG:4326");
    				var point = new OpenLayers.LonLat(lat,lon);
    				c = point.transform(proj, this.map.getProjectionObject());
    			}
    		}
    		else
    		{
    			var lon = bookmark.location.longitude;
    			var lat = bookmark.location.latitude;
    			if(lon!=undefined&&lat!=undefined)
    			{
    				var proj = new OpenLayers.Projection("EPSG:4326");
    				var point = new OpenLayers.LonLat(lat,lon);
    				c = point.transform(proj, this.map.getProjectionObject());
    			}
    		}
    	}
    	else if(bookmark.type=="feature")
    	{
    		var lonlat = this.map.getLonLatFromPixel(this.handlers.feature.evt.xy);
            c = new OpenLayers.Geometry.Point(lonlat.lon,lonlat.lat);
    	}
    	return c;
    },
	destroy: function ()
	{
		
	},
	CLASS_NAME: "CyberGIS.DataSources"
	
});
