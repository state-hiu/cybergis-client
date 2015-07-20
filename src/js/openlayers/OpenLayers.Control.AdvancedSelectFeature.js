OpenLayers.Control.AdvancedSelectFeature = OpenLayers.Class(OpenLayers.Control.SelectFeature,
{
	stopDown: true,
	animate: true,
	over: undefined,//[]
	out: undefined,//[]
	//popups: undefined, //[]
	wheelStyleMaps: undefined,//[{'point':stylemap1,'line':stylemap2}];
	wheelOpenListeners: undefined,
	wheelCloseListeners: undefined,
	
	defaultAnchorPosition: "bottom-left",
	
	hoverDelay: 100,
    hoverTimer: undefined,

    jitQueue: undefined,//Features to PopupFunction On
    
    popupTimers: undefined, //[]
    snapshotTimers: undefined, //[]
    chartTimers: undefined, //[]
    
    currentPopup: undefined, //Function For calling a popup
    
    targetFeature: undefined,
    targetLocation: undefined,
    
    zoomEndTargetLevel: undefined,
    
    lock: false,
    
    //Secondary Selection Variables
    wheel: undefined,
    wheelTimer: undefined,
    wheelDelay: 4000,
    
    //JIT
    jit_listeners: [],//{"url":"","id":#,"context","listener":function}
    
    bFocusFeature: true,
    bFocusLocation: true,
    
    popupFunction: undefined,
    popupContext: undefined,
    
    isAnimated: function()
	{
		return this.animate;
	},	
    setLock: function()
    {
    	this.lock = true;
    },
    clearLock: function()
    {
    	this.lock = false;
    },
    isLocked: function()
    {
    	return this.lock;
    },

    getLayerIndex: function(layer)
    {
    	return $.inArray(layer,this.layers);
    },
  
    hasWheelOpenListener: function(layer)
    {
    	if(this.wheelOpenListeners!=undefined)
    	{
    		var index = this.getLayerIndex(layer);
        	if(index!=-1)
        	{
        		return this.wheelOpenListeners[index]!=undefined;
        	}
        	else
        	{
        		return false;
        	}
    	}
    	else
    	{
    		return false;    	
    	}    	
    },
    triggerWheelOpenListener: function(layer)
    {
    	if(this.hasWheelOpenListener(layer))
    	{
    		this.wheelOpenListeners[this.getLayerIndex(layer)]();
    	}
    },
    hasWheelCloseListener: function(layer)
    {
    	if(this.wheelCloseListeners!=undefined)
    	{
    		var index = this.getLayerIndex(layer);
        	if(index!=-1)
        	{
        		return this.wheelCloseListeners[index]!=undefined;
        	}
        	else
        	{
        		return false;
        	}
    	}
    	else
    	{
    		return false;    	
    	}    	
    },
    triggerWheelCloseListener: function(layer)
    {
    	if(this.hasWheelCloseListener(layer))
    	{
    		this.wheelCloseListeners[this.getLayerIndex(layer)]();
    	}
    },
    
    //Over and Out Functions
    hasOverFunction: function(layer)
    {
    	if(this.over!=undefined)
    	{
    		var index = this.getLayerIndex(layer);
        	if(index!=-1)
        	{
        		return this.over[index]!=undefined;
        	}
        	else
        	{
        		return false;
        	}
    	}
    	else
    	{
    		return false;    	
    	}
    },
    getOverFunction: function(layer)
    {
    	return this.over[this.getLayerIndex(layer)];
   	},   
	execOverFunction: function(f)
   	{
   		this.getOverFunction(f.layer)(f);
   	},
   	hasOutFunction: function(layer)
   	{
   		if(this.out!=undefined)
   		{
   			var index = this.getLayerIndex(layer);
   	   		if(index!=-1)
   	   		{
   	   			return this.out[index]!=undefined;
   	   		}
   	   		else
   	   		{
   	   			return false;
   	   		}
   		}
   		else
   		{
   			return false;
   		}
   	},
   	getOutFunction: function(layer)
   	{
   		return this.out[this.getLayerIndex(layer)];
   	},
   	execOutFunction: function(f)
   	{
   		this.getOutFunction(f.layer)(f);
   	},
 	overFeature: function(f)
   	{
 		this.stopHoverTimer();
		
 		if(f.attributes.hover==undefined||f.attributes.hover=='off')
		{
			if(this.hasOverFunction(f.layer))
			{
				this.execOverFunction(f);
			}
	        
	        f.attributes.hover = 'on';
	        f.layer.redraw();
	    }
    },
    outFeature: function(f)
    {
    	if(f.attributes.hover=='on')
    	{
    		if(this.hasOutFunction(f.layer))
            {
            	this.execOutFunction(f);
            }

    		f.attributes.hover = 'off';
    		f.layer.redraw();
    	}
    },
    stopHoverTimer: function()
    {
    	if(this.hoverTimer!=undefined)
    	{
    		clearTimeout(this.hoverTimr);
    		this.hoverTimer = undefined;
    	}
    },
    delayHoverTimer : function(f)
    {
    	var that = this;
    	that.stopHoverTimer();
       	that.hoverTimer = setTimeout(function(){that.onHover();},that.hoverDelay);
    },
    onHover: function(f)
    {
    	f.layer.redraw();
    },
    onZoomEnd: function()
    {
    	var layers = this.layers || [this.layer];
    	for(var i = 0; i < layers.length; i++)
    	{
    		var layer = layers[i];
    		if(!layer.inRange)
    		{
    			this.unFocusLayer(layer, true);
    		}
    	}
    	if(this.isWheelOpen())
    	{
    		var wheel = this.getWheel();
    		if(!wheel.target.layer.inRange)
    		{
        		this.finishWheelTimer();
    		}
    	}
    },   		
   	//Popup Functions
   	hasPopup: function(layer)
   	{
   		return layer.options.popup&&this.popupFunction!=undefined&&this.popupContext!=undefined;
   	},
   	getPopupFunction: function(layer)
   	{
   		return this.popupFunction;
   	},
	getPopupContext: function(layer)
   	{
   		return this.popupContext;
   	},
   	execPopupFunction: function(f,layer,attributes,anchorLocation,anchorPosition,onClose)
   	{
   		this.closeCurrentPopup();
   		if(this.hasPopup(layer))
   		{
   			var pf = this.getPopupFunction(layer);
   			var pc = this.getPopupContext(layer);
   			var p = pf.apply(pc,[f,layer,attributes,anchorLocation,anchorPosition,onClose]);
   			this.setCurrentPopup(p);
   		}
   	},
	wrapPopupFunction: function(f,layer,attributes,anchorLocation,anchorPosition,onClose)
   	{
   		var that = this;
   		var p = function()
   		{
   			that.execPopupFunction.apply(that,[f,layer,attributes,anchorLocation,anchorPosition,onClose]);
   		};
   		return p;
   	},
   	queuePopupFunction: function(f,anchorLocation)
   	{
   		var that = this;
   		var onClose = function(){setTimeout(function(){that.unselect(f);},0);};
   		this.queuePopupFunction_Core(f,f.layer,f.attributes,anchorLocation,"bottom-left",onClose);
   	},
   	queuePopupFunction_Core: function(f,layer,attributes,anchorLocation,anchorPosition,onClose)
   	{
   		var p = this.wrapPopupFunction(f,layer,attributes,anchorLocation,anchorPosition,onClose);
   		if(this.popupTimers==undefined)
   		{
   			this.popupTimers = [];
   		}
   		this.popupTimers.push(setTimeout(p,0));
   	},
    getCurrentPopup: function()
    {
    	return this.currentPopup;
    },
    setCurrentPopup: function(p)
    {
    	this.currentPopup = p;
    },
    hasCurrentPopup: function()
    {
    	return this.currentPopup!=undefined;
    },  
    closeCurrentPopup: function()
    {
    	if(this.hasCurrentPopup())
    	{
    		var p = this.getCurrentPopup();
    		p.hide();
    		p.purgeListeners();//hiu.p.on({close:function(){}});//Stops Cycle
    		p.close();
    		this.currentPopup = undefined;
    	}
    },
   	
    //JIT
    clearJITQueue: function()
    {
    	this.jitQueue = [];
    },
    queueJIT: function(f,layer,a,g,anchorPosition)
    {
    	this.jitQueue.push({'f':f,'layer':layer,'a':a,'g':g,'anchorPosition':anchorPosition});
    }, 
    isJITLayer: function(layer)
    {
    	var jit = false;
    	if(layer.options.jit!=undefined)
    	{
    		jit = true;
    	}
    	return jit;
    },
    jit_request_backup: function(f,bFocusOnItem)
    {
    	var j = f.layer.options.jit;
    	
    	var context = this;
    	
    	console.log('OpenLayers.Layer.AdvancedVector.jit_request()');
    	if(this.isJITLayer(f.layer))
    	{
    		var id = undefined;
    		var u = undefined;
    		if(j.join!=undefined)
    		{
    			if(j.join.left!=undefined)
    			{
    				id = f.attributes[""+j.join.left];
    			}
    		}
    		if(j.file!=undefined)
    		{
    			if(j.file.url!=undefined)
    			{
    				u = j.file.url;
    			}
    		}
    		if(id!=undefined&&u!=undefined)
        	{
        		var that = this;
            	
            	var layer = f.layer;
            	if(bFocusOnItem)
            	{
            		this.jit_listeners.push({"id":id,"url":u,"layer":layer,"context":context,"listener":this.jit_response});
            	}
        		$.ajax({url: u,type: "GET",contentType: "application/json; charset=\"utf-8\"",beforeSend: hiu.beforeSend,complete: function(xData,status)
        		{
        			//var layer = that;//"id":j.id,"join":j.join,"delimiter":j.delimiter,
        			console.log('jit complete status: '+status);
        			var j2 = layer.options.jit;
        			if(j2!=undefined)
        			{
        				var left = undefined;
            			var right = undefined;
            			var t2 = undefined;
            			var level = undefined;
            			var d2 = undefined;
            			var u2 = undefined;
            			if(j2.join!=undefined)
                		{
            				left = j2.join.left;
            				right = j2.join.right;
            				t2 = j2.join.type;
            				level = j2.join.level;
                		}
            			if(layer.options.jit!=undefined)
            			{
            				if(layer.options.jit.file!=undefined)
            				{
            					d2 = layer.options.jit.file.delimiter;
            					u2 = layer.options.jit.file.url;
            				}
            			}
            			if(left!=undefined&&d2!=undefined)
            			{
                			var rows = xData.responseText.split("\n");//$.grep(candidateFeatures,function(candidateFeature,i)
                			rows = $.grep(rows,function(row,i){return $.trim(row).length>0;});
                			if(rows.length>1)
                			{
                    			for(var j = 0; j < layer.features.length; j++) 
                				{
                					var f2 = layer.features[j];
                					layer.strategies[0].jit_feature(f2,rows,right,f2.attributes[""+left],d2,t2,level);
                				}
                			}
                			that.jit_trigger_listeners.apply(that,[u2,f.attributes[""+left]]);
                			layer.redraw();
            			}
        			}
        		}});
        	}
    	}
    }, 
    jit_request: function(f,bFocusOnItem)
    {
    	console.log('OpenLayers.Layer.AdvancedVector.jit_request()');
    	var layer = f.layer;
    	if(this.isJITLayer(layer))
    	{
        	var strategy = layer.strategies[0];
    		var context = this;
    		
        	for(var i = 0; i < strategy.getNumberOfJobs(); i++)
        	{
        		var j = strategy.getJob(i);
        		var bRefresh = false;
        		if(j.refresh!=undefined)
        		{
        			if(j.refresh.focus!=undefined)
        			{
        				bRefresh = j.refresh.focus==true;
        			}
        		}
        		var bJobLoaded = !(strategy.isFeatureCompiled.apply(strategy,[f,j.id]));
        		
        		if(bJobLoaded||bRefresh)
        		{
        			if(j.type=="simple")
            		{
            			layer.strategies[0].runTasks(j);
            		}
            		else if(j.type=="advanced")
            		{
                		var id = undefined;
                		var u = undefined;
                		if(j.join!=undefined)
                		{
                			if(j.join.left!=undefined)
                			{
                				id = f.attributes[""+j.join.left];
                			}
                		}
                		if(j.file!=undefined)
                		{
                			if(j.file.url!=undefined)
                			{
                				u = j.file.url;
                			}
                		}
                		if(id!=undefined&&u!=undefined)
                    	{
                    		var that = this;
                        	
                        	//var layer = f.layer;
                        	if(bFocusOnItem)
                        	{
                        		this.jit_listeners.push({"id":id,"url":u,"layer":layer,"context":context,"listener":this.jit_response});
                        	}
                    		$.ajax({url: u,type: "GET",contentType: "application/json; charset=\"utf-8\"",beforeSend: hiu.beforeSend,complete: function(xData,status)
                    		{
                    			console.log('jit complete status: '+status);
                    			var j2 = layer.options.jit;
                    			if(j2!=undefined)
                    			{
                    				var left = undefined;
                        			var u2 = undefined;
                        			
                        			if(j2.join!=undefined)
                            		{
                        				left = j2.join.left;
                            		}
                        			if(layer.options.jit!=undefined)
                        			{
                        				if(layer.options.jit.file!=undefined)
                        				{
                        					u2 = layer.options.jit.file.url;
                        				}
                        			}
                        			layer.strategies[0].jit_response(xData.responseText);            			
                        			that.jit_trigger_listeners.apply(that,[u2,f.attributes[""+left]]);
                    			}
                    		}});
                    	}
            		}
        		}
        	}
    	}
    }, 
    jit_trigger_listeners: function(url,id)
    {
    	var newListeners = [];
    	for(var i = 0; i < this.jit_listeners.length; i++)
    	{
    		var listener = this.jit_listeners[i];
    		if(listener.id=id&&listener.url==url)
    		{
    			//listener.listener.apply(listener.context,[]);
    			listener.listener.apply(listener.context,[listener.layer]);
    		}
    		else
    		{
    			newListeners.push(listener);
    		}
    	}
    	this.jit_listeners = newListeners;
    },
    jit_response_old_but_better: function(layer)
    {
    	var newQueue = [];
    	for(var i = 0; i < this.jitQueue.length; i++)
    	{
    		var obj = this.jitQueue[i];
    		if(layer==obj.layer)
    		{
    			//this.queuePopupFunction(obj.f,obj.g);
    			var that = this;
    			var onClose = function(){setTimeout(function(){that.unselect(obj.f);},0);};
    	   		//this.queuePopupFunction_Core(f,f.layer,f.attributes,anchorLocation,"bottom-left",onClose);
    			this.queuePopupFunction_Core(obj.f,obj.layer,obj.a,obj.g,"bottom-left",onClose);
    		}
    		else
    		{
    			newQueue.push(obj);
    		}
    	}
    	this.jitQueue = newQueue;
    },
    jit_response: function(layer)
    {
    	var newQueue = [];
    	for(var i = 0; i < this.jitQueue.length; i++)
    	{
    		var obj = this.jitQueue[i];
    		if(layer==obj.layer)
    		{
    			var that = this;
    			var onClose = function(){setTimeout(function(){that.unselect(obj.f);},0);};
    	   		//this.queuePopupFunction_Core(f,f.layer,f.attributes,anchorLocation,"bottom-left",onClose);
    			this.queuePopupFunction_Core(obj.f,obj.layer,obj.a,obj.g,obj.anchorPosition,onClose);
    		}
    		else
    		{
    			newQueue.push(obj);
    		}
    	}
    	this.jitQueue = newQueue;
    },
    //StyleMap Functions
   	hasStyleMap: function(layer)
    {
   		if(this.wheelStyleMaps!=undefined)
   		{
   			var index = this.getLayerIndex(layer);
   	   		if(index!=-1)
   	   		{
   	   			return this.wheelStyleMaps[index]!=undefined;
   	   		}
   	   		else
   	   		{
   	   			return false;
   	   		}
   		}
   		else
   		{
   			return false;
   		}
    },
    getWheelPointStyleMap: function(layer)
    {
    	var styleMap = new OpenLayers.StyleMap({'default':OpenLayers.Feature.Vector.style["default"],'select':OpenLayers.Feature.Vector.style["select"]});
    	if(this.wheelStyleMaps!=undefined)
    	{
    		var index = this.getLayerIndex(layer);
        	if(index!=-1 && index<this.wheelStyleMaps.length)
        	{
        		var layerStyleMaps = this.wheelStyleMaps[index];
        		if(layerStyleMaps!=undefined)
        		{
        			var pointStyleMap = layerStyleMaps.points;
        			if(pointStyleMap!=undefined)
            		{
            			styleMap = pointStyleMap;
            		}
        		}
        	}
    	}
    	return styleMap;
   	},
    getWheelLineStyleMap: function(layer)
    {
    	var styleMap = new OpenLayers.StyleMap({'default':OpenLayers.Feature.Vector.style["default"],'select':OpenLayers.Feature.Vector.style["select"]});
    	if(this.wheelStyleMaps!=undefined)
    	{
    		var index = this.getLayerIndex(layer);
        	if(index!=-1 && index<this.wheelStyleMaps.length)
        	{
        		var layerStyleMaps = this.wheelStyleMaps[index];
        		if(layerStyleMaps!=undefined)
        		{
        			var lineStyleMap = layerStyleMaps.lines;
        			if(lineStyleMap!=undefined)
            		{
            			styleMap = lineStyleMap;
            		}
        		}
        	}
    	}
    	return styleMap;
   	},
    getWheelCloseStyleMap: function(layer)
    {
    	var styleMap = new OpenLayers.StyleMap({'default':OpenLayers.Feature.Vector.style["default"],'select':OpenLayers.Feature.Vector.style["select"]});
    	if(this.wheelStyleMaps!=undefined)
    	{
    		var index = this.getLayerIndex(layer);
        	if(index!=-1 && index<this.wheelStyleMaps.length)
        	{
        		var layerStyleMaps = this.wheelStyleMaps[index];
        		if(layerStyleMaps!=undefined)
        		{
        			var closeStyleMap = layerStyleMaps.close;
        			if(closeStyleMap!=undefined)
            		{
            			styleMap = closeStyleMap;
            		}
        		}
        	}
    	}
    	return styleMap;
   	},
   	   	        
    clearPopupTimers: function()
    {
    	if(this.popupTimers!=undefined)
    	{
    		this.clearTimers(this.popupTimers);
        	this.popupTimers = undefined;
    	}
    },
    clearSnapshotTimers: function()
    {
    	if(this.snapshotTimers!=undefined)
    	{
    		this.clearTimers(this.snapshotTimers);
        	this.snapshotTimers = undefined;
    	}
    },
    clearChartTimers: function()
    {
    	if(this.chartTimers!=undefined)
    	{
    		this.clearTimers(this.chartTimers);
        	this.chartTimers = undefined;
    	}
    },
    clearTimers: function(timers)
    {
    	for(var i = 0; i < timers.length; i++)
    	{
    		if(timers[i]!=undefined)
        	{
        		clearTimeout(timers[i]);
        		timers[i] = undefined;
        	}
    	}
    },
    /**
     * 
     * @param jumped - did OpenLayers "tween" there or just jump to the point with setCenter
     */
    panComplete: function(jumped) // Although this is called from a listener to the baseLayer, this function is wrapped and "applied" with the AdvancedSelectFeature object as this
    {
    	console.log('panComplete()');
    	//if(this.atCenter(this.targetFeature))
    	var z = this.zoomEndTargetLevel;
		if(z!=undefined&&z!=this.map.getZoom()&&this.map.isValidZoomLevel(z))
		{
			this.zoomEndTargetLevel = undefined;
			this.zoomTo(z,true);
			this.map.events.triggerEvent("zoomend");
		}
    	
    	if(this.targetFeature!=undefined)
		{
    		this.moveEndListener = null;
    		var f = this.targetFeature;
    		var g = this.targetLocation;
    		if(this.isJITLayer(f.layer))
	    	{
	    		if(this.isCompiled(f))
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
    	if(f!=undefined)
    	{
    		var a = f.attributes;
        	if(g==undefined)
        	{
        		g = f.geometry;
        	}        	
        	var c = undefined;        	
        	if(g.CLASS_NAME=="OpenLayers.LonLat")
        	{
        		c = g;
        	}
        	else
        	{
        		c = g.getBounds().getCenterLonLat();
        	}
        	this.focusOnFeature(f,a,c,g,z);
    	}
    	else
    	{
    		this.clearLock();
    		//this.targetFeature = undefined;
        	//this.targetLocation = undefined;
    		this.moveEndListener = null;
    		
    		if(g.CLASS_NAME=="OpenLayers.LonLat")
        	{
    			this.focusOnLocation(g,z,t);
        	}
        	else
        	{
        		this.focusOnLocation(g.getBounds().getCenterLonLat(),z,t);
        	}
    	}
    },
    focusOnFeature: function(f,a,c,g,z)
    {
    	var btn = a.btn;
    	
    	if(this.isJITLayer(f.layer))
    	{
    		this.clearJITQueue();
    		this.jit_request(f,true);
    	}
    	
    	if(btn!=undefined)
    	{
    		OpenLayers.Element.addClass(btn,"x-btn-pressed");
    	}
    	
    	this.clearLock();
    	if(this.atCenter(c))
    	{
    		if(z!=undefined&&z!=this.map.getZoom()&&this.map.isValidZoomLevel(z))
			{
    			this.zoomTo(z,true);
    			this.map.events.triggerEvent("zoomend");
			}
    		
    		if(this.hasPopup(f.layer))
   			{
    			if(this.isJITLayer(f.layer))
    	    	{
    	    		if(this.isCompiled(f))
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
    	}
    	else if(this.closeToCenter(c))
    	{
    		if(z!=undefined&&z!=this.map.getZoom()&&this.map.isValidZoomLevel(z))
			{
    			this.map.moveTo(c, z, {'dragging': undefined,'forceZoomChange': undefined, 'silent':true});
			}
    		
    		if(this.hasPopup(f.layer))
   			{
    			if(this.isJITLayer(f.layer))
    	    	{
    	    		if(this.isCompiled(f))
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
    	}
    	else
    	{
    		//this.targetFeature = undefined;
        	//this.targetLocation = undefined;
    		this.moveEndListener = null;
    		if(this.animate)
    		{
    	    	this.targetFeature = f;
    	    	this.targetLocation = g;
    	    	if(z!=undefined&&z!=this.map.getZoom()&&this.map.isValidZoomLevel(z))
     			{
    	    		if(z>this.map.getZoom())
        			{
    	    			this.zoomEndTargetLevel = z;
        			}
        			else if(z<this.map.getZoom())
        			{
        				this.zoomTo(z,true);
        				this.map.events.triggerEvent("zoomend");
        			}
     			}
    	    	this.map.panTo(c,this);
    		}
    		else
    		{
    			this.targetFeature = f;
    	    	this.targetLocation = g;
    	    	if(z!=undefined&&z!=this.map.getZoom()&&this.map.isValidZoomLevel(z))
     			{
    	    		this.map.moveTo(c, z, {'dragging': undefined,'forceZoomChange': undefined, 'silent':false});
     			}
    	    	else
    	    	{
    	    		this.map.setCenter(c,this);
    	    	}
    		}
    	}
    },
    focusOnLocation: function(c,z,t)
    {
    	this.clearLock();
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
    			//this.map.setCenter(c,z);
    			this.map.moveTo(c, z, {'dragging': undefined,'forceZoomChange': undefined, 'silent':true});
            }
    		else
    		{
        		//The whole point is that you don't need to move, b/c you're already so close.
    			//this.map.setCenter(c);
    		}
    	}
    	else
    	{
    		if(this.animate)
    		{
    			if(z!=undefined&&z!=this.map.getZoom()&&this.map.isValidZoomLevel(z))
    			{
    	    		if(z>this.map.getZoom())
        			{
    	    			this.zoomEndTargetLevel = z;
        			}
        			else if(z<this.map.getZoom())
        			{
        				this.zoomTo(z,true);
        				this.map.events.triggerEvent("zoomend");
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
        				//this.map.setCenter(c,z);
    					this.map.moveTo(c, z, {'dragging': undefined,'forceZoomChange': undefined});
    				}
    				else
    				{
    					//this.map.setCenter(c);
    					this.map.moveTo(c, null, {'dragging': undefined,'forceZoomChange': undefined});
    				}
     			}
    			else
    			{
    				//this.map.setCenter(c);
    				this.map.moveTo(c, null, {'dragging': undefined, 'forceZoomChange': undefined});
    			}
    		}
    	}
    },
    unFocusAll: function(silent)
    {
    	var layers = this.layers || [this.layer];
    	for(var i = 0; i < layers.length; i++)
    	{
    		var layer = layers[i];
    		this.unFocusLayer(layer,silent);
    	}
    },
    unFocusLayer: function(layer,silent)
    {
    	if(layer.selectedFeatures != null)
		{
			for(var j = 0; j < layer.selectedFeatures.length; j++)
	    	{
	    		var feature = layer.selectedFeatures[j];
				if(feature != null)
	    		{
					//Unselect
					//this.unselect(feature);
					this.unhighlight(feature);
			        OpenLayers.Util.removeItem(layer.selectedFeatures, feature);
			        if(!silent)
			        {
			        	layer.events.triggerEvent("featureunselected", {feature: feature});
			        }
			        this.onUnselect.call(this.scope, feature);
					//UnFocus
					this.unFocusOnItem(feature);
	    		}
	    	}
		}	
    },
    unFocusOnItem: function(f)
    {
    	var a = f.attributes;
    	var btn = a.btn;
    	
    	if(btn!=undefined)
    		OpenLayers.Element.removeClass(btn,"x-btn-pressed");
    	
    	this.targetFeature = undefined;
    	this.targetLocation = undefined;
    	this.moveEndListener = null;
    	this.clearPopupTimers();
    	this.clearSnapshotTimers();
    	this.clearChartTimers();
    	this.closeCurrentPopup();
    },
	isCompiled: function(f)
	{
    	var bCompiled = true;
    	var layer = f.layer;
    	var strategy = layer.strategies[0];
    	for(var i = 0; i < strategy.getNumberOfJobs(); i++)
    	{
    		var j = strategy.getJob(i);
    		bCompiled = bCompiled && strategy.isFeatureCompiled.apply(strategy,[f,j.id]);
    	}
    	return bCompiled;
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
  
    //Wheel/Explode Functions
    getMaxDistance: function()
    {
    	var z = this.map.getZoom();
    	var maxDistance = undefined;
    	if(this.map.getProjection()=="EPSG:900913")
	    {
	    	if(z==18)//14
				maxDistance = 15;
	    	else if(z==17)//14
				maxDistance = 25;
	    	else if(z==16)//14
				maxDistance = 50;
	    	else if(z==15)//14
				maxDistance = 100;
	    	else if(z==14)//14
				maxDistance = 200;
	    	else if(z==13)//13
				maxDistance = 400;
	    	else if(z==12)//12
				maxDistance = 800;
	    	else if(z==11)//11
				maxDistance = 1600;
	    	else if(z==10)//10
				maxDistance = 3200;
	    	else if(z==9)//9
				maxDistance = 6400;
	    	else if(z==8)//8
				maxDistance = 10000;
	    	else if(z==7)//7
				maxDistance = 20000;
	    	else if(z==6)//6
				maxDistance = 40000;//1
	        else if(z==5)//5
				maxDistance = 60000;
	        else if(z==4)//4
				maxDistance = 80000;
	        else if(z==3)//3
	        	maxDistance = 100000;
			else if(z==2)//2
				maxDistance = 120000;
			else //if(this.layer.map.getZoom()===1)//1
				maxDistance = 240000;
	    }
	    else
	    {
	    	if(z==8)
				maxDistance = .25;//1
	        else if(z==7)
				maxDistance = .5;
	        else if(z==6)
				maxDistance = 1;//1
	        else if(z==5)
				maxDistance = 1.5;
	        else if(z==4)
				maxDistance = 2;
	        else if(z==3)
	        	maxDistance = 2.5;
			else if(z==2)
				maxDistance = 3;
			else //if(this.layer.map.getZoom()==1)
				maxDistance = 6;
	    }
    	return maxDistance;
    },
    getNearbyFeatures: function(center,candidateFeatures)
    {
    	var maxDistance = this.getMaxDistance();
    	var nearbyFeatures = $.grep(candidateFeatures,function(candidateFeature,i)
    	{
    		var nearby = false;
    		if(candidateFeature.geometry.CLASS_NAME=="OpenLayers.Geometry.Collection"||candidateFeature.geometry.CLASS_NAME=="OpenLayers.Geometry.Polygon"||candidateFeature.geometry.CLASS_NAME=="OpenLayers.Geometry.MultiPolygon")
    		{
    			if(candidateFeature.geometry.intersects(center))
    			{
    				nearby = true;
    			}
    		}
    		
    		if(nearby==false)
    		{
    			var distance = center.distanceTo(candidateFeature.geometry);
        		nearby = distance < maxDistance;
    		}
    		
    		return nearby;
    	});
    	return nearbyFeatures;
    },
    getRadius: function(n)
    {
    	var radius = undefined;
    	var z = this.map.getZoom();
		if(this.map.getProjection()=="EPSG:900913")
		{
			radius = (614400/Math.pow(2,z))*(((n-1)-((n-1)%4))/4)+((7500000)/Math.pow(2,z));
		}	
		else
			radius = (1.0/z)*(((n-1)-((n-1)%4))/4)+(8.0/z);
		return radius;
    },
    createWheel: function(center,targetFeature,nearbyFeatures)
    {
    	var features = this.createWheelFeatures(center,targetFeature,nearbyFeatures);
    	var pointsLayer = this.createWheelPointLayer(targetFeature,features.points);
    	var linesLayer = this.createWheelLineLayer(targetFeature,features.lines);
    	var closeLayer = this.createWheelCloseLayer(targetFeature,features.close);
		return {"target":targetFeature,"points":pointsLayer,"lines":linesLayer,"close":closeLayer,"select":this.createWheelControl(pointsLayer,closeLayer)};
    },
    createWheelPointLayer: function(targetFeature,aFeatures)
    {
    	var points = new OpenLayers.Layer.Vector
    	(
			"Selection Points",
			{
				'styleMap': this.getWheelPointStyleMap(targetFeature.layer),
				'popupWidth': targetFeature.layer.options.popupWidth,
				'popupHeight': targetFeature.layer.options.popupHeight
			}
    	);
    	points.addFeatures(aFeatures);
    	return points;
    },
    createWheelLineLayer: function(targetFeature,aFeatures)
    {
		
    	var lines = new OpenLayers.Layer.Vector("Selection Lines",{'styleMap':this.getWheelLineStyleMap(targetFeature.layer)});
		lines.addFeatures(aFeatures);
		return lines;
    },
    createWheelCloseLayer: function(targetFeature,aFeatures)
    {
    	var closeLayer = new OpenLayers.Layer.Vector
    	(
			"Close Wheel",
			{
				'styleMap': this.getWheelCloseStyleMap(targetFeature.layer)
			}
    	);
    	closeLayer.addFeatures(aFeatures);
    	return closeLayer;
    },
	createWheelFeatures: function(center,targetFeature,nearbyFeatures)
	{
    	var aPoints = [];
    	var aLines = [];
		
    	var n = nearbyFeatures.length;
    	var radius = this.getRadius(n);
    	if(n<=4)
    	{
    		//var center = undefined;
    		var nearbyFeature = undefined;
    		var newFeature = undefined;
    		
    		//Point 1
    		nearbyFeature = nearbyFeatures[0];
        	nearbyFeature.attributes.wheel = 'on';
        	newFeature = nearbyFeature.clone();
        	newFeature.link = nearbyFeature;
    		newFeature.attributes = {'close':'off','anchorPosition':'top-right','wheel':'off','hover':'off'};
    		newFeature.attributes = OpenLayers.Util.applyDefaults(newFeature.attributes,nearbyFeature.attributes);
    		//newGeometry = newFeature.geometry;
    		//newGeometry.move(center.x-newGeometry.x-radius,center.y-newGeometry.y-radius);
    		//newGeometry.move(center.x-newGeometry.x-radius,center.y-newGeometry.y-radius);
    		newFeature.geometry = new OpenLayers.Geometry.Point(center.x-radius,center.y-radius);
    		aPoints.push(newFeature);
    		aLines.push(this.createWheelLine(center,newFeature.geometry));
    		//Point 2
    		nearbyFeature = nearbyFeatures[1];
        	nearbyFeature.attributes.wheel = 'on';
        	newFeature = nearbyFeature.clone();
        	newFeature.link = nearbyFeature;
    		newFeature.attributes = {'close':'off','anchorPosition':'top-left','wheel':'off','hover':'off'};
    		newFeature.attributes = OpenLayers.Util.applyDefaults(newFeature.attributes,nearbyFeature.attributes);
    		newFeature.geometry = new OpenLayers.Geometry.Point(center.x+radius,center.y-radius);
    		aPoints.push(newFeature);
    		aLines.push(this.createWheelLine(center,newFeature.geometry));
    		if(n>=3)
    		{
    			//Point 3
        		nearbyFeature = nearbyFeatures[2];
            	nearbyFeature.attributes.wheel = 'on';
            	newFeature = nearbyFeature.clone();
            	newFeature.link = nearbyFeature;
        		newFeature.attributes = {'close':'off','anchorPosition':"bottom-left",'wheel':'off','hover':'off'};
        		newFeature.attributes = OpenLayers.Util.applyDefaults(newFeature.attributes,nearbyFeature.attributes);
        		newFeature.geometry = new OpenLayers.Geometry.Point(center.x+radius,center.y+radius);
        		aPoints.push(newFeature);
        		aLines.push(this.createWheelLine(center,newFeature.geometry));
    			if(n>=4)
        		{
    				//Point 4
            		nearbyFeature = nearbyFeatures[3];
                	nearbyFeature.attributes.wheel = 'on';
                	newFeature = nearbyFeature.clone();
                	newFeature.link = nearbyFeature;
            		newFeature.attributes = {'close':'off','anchorPosition':"bottom-right",'wheel':'off','hover':'off'};
            		newFeature.attributes = OpenLayers.Util.applyDefaults(newFeature.attributes,nearbyFeature.attributes);
            		newFeature.geometry = new OpenLayers.Geometry.Point(center.x-radius,center.y+radius);
            		aPoints.push(newFeature);
            		aLines.push(this.createWheelLine(center,newFeature.geometry));
        		}
    		}
    	}
    	else
    	{
            var degrees = 0.0;
            var delta = 360/n;
            for(var i = 0; i < n; i++)
            {
            	var nearbyFeature = nearbyFeatures[i];
            	nearbyFeature.attributes.wheel = 'on';
            	
            	var section = this.createWheelSection(center,nearbyFeature,radius,degrees);
            	aPoints.push(section.point);
            	aLines.push(section.line);
            	degrees += delta;
            }
    	}
    	var closeFeature = this.createCloseFeature(center,targetFeature);
    	
    	return {"points":aPoints,"lines":aLines,"close":closeFeature};
	},
	createCloseFeature: function(center,targetFeature)
	{
		var closeFeature = targetFeature.clone();
		closeFeature.attributes = {'close':'on'};
		closeFeature.geometry = center.clone();
		return closeFeature;
	},
	createWheelSection: function(center,nearbyFeature,radius,degrees)
	{
		var newFeature = nearbyFeature.clone();
		newFeature.link = nearbyFeature;
		newFeature.attributes = {'close':'off','anchorPosition':this.getAnchorPosition(degrees),'wheel':'off','hover':'off'};
		newFeature.attributes = OpenLayers.Util.applyDefaults(newFeature.attributes,nearbyFeature.attributes);
		newFeature.geometry = new OpenLayers.Geometry.Point(center.x,center.y);
    	this.placeWheelPoint(center,newFeature,degrees,radius);
    	var line = this.createWheelLine(center,newFeature.geometry);
		return {"point":newFeature,"line":line};
	},
	getAnchorPosition: function(degrees)
	{
		var position = "";
		
		if(degrees<45)
			position = "top-left";
    	else if (degrees<135)
    		position = "left";
    	else if(degrees<180)
    		position = "bottom-left";
    	else if(degrees<225)
    		position = "bottom-right";
    	else if(degrees < 315)
    		position = "right";
    	else
    		position = "top-right";
		
		return position;
	},
    placeWheelPoint: function(center,point,degrees,radius)
    {
    	point.geometry.move(0,-radius);
    	point.geometry.rotate(degrees,center);
    },
    createWheelLine: function(targetGeometry,newGeometry)
    {
    	return new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([targetGeometry.clone(),newGeometry.clone()]));
    },
    setWheel: function(wheel)
    {
    	this.wheel = wheel;
    	this.map.addLayer(wheel.points);
    	this.map.addLayer(wheel.lines);
    	this.map.addLayer(wheel.close);
    	this.map.addControl(wheel.select);
    	wheel.select.activate();
    },
    getWheel: function(wheel)
    {
    	return this.wheel;
    },
    isWheelOpen: function()
    {
    	return this.wheel!=undefined;
    },
    isWheelClosed: function()
    {
    	return this.wheel==undefined;
    },
    stopWheelTimer: function()
    {
    	if(this.wheelTimer!=undefined)
    	{
    		clearTimeout(this.wheelTimer);
    		this.wheelTimer = undefined;
    	}
    },
    delayWheelTimer : function()
    {
    	var that = this;
    	that.stopWheelTimer();
       	that.wheelTimer = setTimeout(function(){that.closeWheel();},that.wheelDelay);
    },
    finishWheelTimer: function()
	{
		this.stopWheelTimer();
		this.closeWheel();
	},
    closeWheel: function()
    {
    	if(this.isWheelOpen())
		{
			var w = this.getWheel();
			if(w.points.selectedFeatures.length>0)
			{
				//var f = w.points.selectedFeatures[0];
				//f.attributes.link.b.removeClass('x-btn-pressed');
				this.closeCurrentPopup();//If Exists
			}
			w.select.destroy();
			w.points.destroy();
			w.lines.destroy();	
			w.close.destroy();
			$.each(w.target.layer.features,function(i,f){f.attributes.wheel='off';});
			w.target.layer.redraw();
			this.wheel = undefined;
			this.triggerWheelCloseListener(w.target.layer);
		}
    },
    createWheelControl: function(pointsLayer,closeLayer)
    {
    	var control = new OpenLayers.Control.AdvancedSelectFeatureWheel([pointsLayer,closeLayer],{'primary':this});
		return control;
    },    
    clickFeature: function(f,a,b)
	{
		var that = this;
		
		if(this.isWheelClosed())
		{
			var indexOfLayer = this.getLayerIndex(f.layer);//var indexOfLayer = $.inArray(f.layer,this.layers);
			var selected = $.inArray(f,f.layer.selectedFeatures) > -1;
			if(selected)
			{
				if(this.toggleSelect())
				{
					this.unselect(f);
				}
				else if(!this.multipleSelect())
				{
					this.unselectAll({except: f});
				}
			}
			else
			{
				if(!this.multipleSelect())
					this.unselectAll({except: f});

				if(f.geometry.CLASS_NAME=="OpenLayers.Geometry.Point")
				{
					this.stopWheelTimer();

			        var c = f.geometry;		        
			        var nearbyFeatures = this.getNearbyFeatures(f.geometry,f.layer.features);
			        
			        var n = nearbyFeatures.length;
			        
			        if(n==1)
			        {
			        	this.select(f);
			        	this.focusOnItem(f,c);
			        }
			        else// n > 1
			        {
			        	this.map.panTo(c.getBounds().getCenterLonLat());
			        	var wheel = this.createWheel(c,f,nearbyFeatures);
			        	this.setWheel(wheel);
			        	f.layer.redraw();
						this.delayWheelTimer();
						this.triggerWheelOpenListener(f.layer);
			        }
				}
				else if(f.geometry.CLASS_NAME=="OpenLayers.Geometry.Collection"||f.geometry.CLASS_NAME=="OpenLayers.Geometry.Polygon"||f.geometry.CLASS_NAME=="OpenLayers.Geometry.MultiPolygon")
				{
					this.stopWheelTimer();
					
			        var lonlat = this.map.getLonLatFromPixel(this.handlers.feature.evt.xy);
			        var c = new OpenLayers.Geometry.Point(lonlat.lon,lonlat.lat);
			        var nearbyFeatures = this.getNearbyFeatures(c,f.layer.features);
			        var n = nearbyFeatures.length;	
			        
			        if(n==1)
			        {
			        	this.select(f);
			        	this.focusOnItem(f,c);
			        }
			        else// n > 1
			        {
			        	this.map.panTo(c.getBounds().getCenterLonLat());
			        	var wheel = this.createWheel(c,f,nearbyFeatures);
			        	this.setWheel(wheel);
			        	f.layer.redraw();
						this.delayWheelTimer();
						this.triggerWheelOpenListener(f.layer);
			        }
				}
				else
				{
					this.select(f);
					return;
				}
			}
		}
	},
    clickoutFeature: function(f)
    {
		this.unselectAll();
    },
    
    initialize: function(layers, options)
    {
    	var defaultOptions = {multiple:false,clickout:true,hover:true};
    	options = (options==undefined)?defaultOptions:OpenLayers.Util.applyDefaults(options,defaultOptions);    	
    	//OpenLayers.Control.SelectFeature.prototype.initialize.apply(this, [layers, options]);
    	
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        
        if(this.scope === null)
        {
            this.scope = this;
        }
        
        this.initLayer(layers);
        var callbacks =
        {
            click: this.clickFeature,
            clickout: this.clickoutFeature
        };
        if (this.hover)
        {
            callbacks.over = this.overFeature;
            callbacks.out = this.outFeature;
        }
             
        this.callbacks = OpenLayers.Util.extend(callbacks, this.callbacks);
        this.handlers =
        {
            feature: new OpenLayers.Handler.Feature(this, this.layer, this.callbacks,{stopDown: this.stopDown, geometryTypes: this.geometryTypes})
        };

        if(this.box)
        {
            this.handlers.box = new OpenLayers.Handler.Box(this, {done: this.selectBox},{boxDivClassName: "olHandlerBoxSelectFeature"}); 
        }
    	
    	this.init_layers(layers,options);
    },
    init_layers: function(layers,options)
   	{
    	for(var i = 0; i < layers.length; i++)
    	{
    		this.init_layer(layers[i],options);
    	}
   	},
    init_layer: function(layer,options)
   	{
    	var that = this;
    	layer.events.on(
    	{
    		featureunselected: function(e){that.onFeatureUnselected.apply(that,[e]);}
    	});
   	},
    activate: function()
    {
    	if(!this.active) 
    	{
        	if(this.handlers!=undefined)
            {
            	if(this.handlers.drag!=undefined)
            	{
            		this.handlers.drag.activate();
            	}
            }
    	}
        return OpenLayers.Control.SelectFeature.prototype.activate.apply(this, arguments);
    },
    deactivate: function()
    {
        if(this.active)
        {
        	if(this.handlers!=undefined)
            {
            	if(this.handlers.drag!=undefined)
            	{
            		this.handlers.drag.deactivate();
            	}
            }
        }
        return OpenLayers.Control.SelectFeature.prototype.deactivate.apply(this, arguments);
    },
    setMap: function(map)
    {
    	OpenLayers.Control.SelectFeature.prototype.setMap.apply(this, arguments);
    	if(this.handlers!=undefined)
    	{
    		if(this.handlers.drag!=undefined)
    		{
    	    	this.handlers.drag.setMap(map);	
    		}
    	}
    	/* Zoom End Listener */
    	var that = this;
    	map.events.register('zoomend',this,function()
      	{
			that.onZoomEnd.apply(that);
		});
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
   	
    onFeatureUnselected: function(e)
    {
    	if(!this.isLocked())
		{
			this.unFocusOnItem(e.feature);
		}
	},
   	CLASS_NAME: "OpenLayers.Control.AdvancedSelectFeature"
});
