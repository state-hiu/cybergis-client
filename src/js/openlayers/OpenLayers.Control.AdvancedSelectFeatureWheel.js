OpenLayers.Control.AdvancedSelectFeatureWheel = OpenLayers.Class(OpenLayers.Control.SelectFeature,
{
	 /** 
     * APIProperty: fallThrough 
     * {<OpenLayers.Control.AdvancedSelectFeatureWheel>}
     */
	primary: undefined,
	
	isAnimated: function()
	{
		return this.primary.isAnimated.apply(this.primary);
	},
	getPrimary: function()
	{
		return this.primary;
	},
	closeCurrentPopup: function()
	{
		this.primary.closeCurrentPopup.apply(this.primary);
	},
	clearLock: function()
	{
		this.primary.clearLock.apply(this.primary);
	},
	isLocked: function()
	{
		this.primary.isLocked.apply(this.primary);
	},
	isJITLayer: function(layer)
	{
		return this.primary.isJITLayer.apply(this.primary,[layer]);
	},
	clearJITQueue: function()
	{
		return this.primary.clearJITQueue.apply(this.primary);
	},
	jit_request: function(f,bFocusOnItem)
	{
		return this.primary.jit_request.apply(this.primary,[f,bFocusOnItem]);
	},
	isCompiled: function(f)
	{
		return this.primary.isCompiled.apply(this.primary,[f]);
	},
	queueJIT: function(f,layer,attributes,anchorLocation,anchorPosition)
	{
		return this.primary.queueJIT.apply(this.primary,[f,layer,attributes,anchorLocation,anchorPosition]);
	},
	focusOnItem: function(f)
	{
		this.clearLock();
		
		this.stopWheelTimer();		
		
		var a = f.attributes;
    	var btn = f.link.attributes.btn;
    	
    	/*if(this.isJITLayer(f.link.layer))
    	{
    		this.clearJITQueue();
    		if(!this.isCompiled(f.link))
        	{
    			this.jit_request(f.link,true);
        	}
    	}*/
    	if(this.isJITLayer(f.link.layer))
    	{
    		this.clearJITQueue();
    		this.jit_request(f.link,true);
    	}
    	
    	if(btn!=undefined)
    	{
    		OpenLayers.Element.addClass(btn,"x-btn-pressed");
    	}
    	
    	if(this.hasPopup(f.link.layer))
		{
    		if(this.isJITLayer(f.link.layer))
        	{
        		if(this.isCompiled(f.link))
            	{
        			var that = this;
    	    		var onClose = function(){setTimeout(function(){that.unselect(f);},0);};
    	    		this.queuePopupFunction_Core(f,f.link.layer,f.link.attributes,f.geometry,a.anchorPosition,onClose);
            	}
        		else
        		{
        			this.queueJIT(f,f.link.layer,f.link.attributes,f.geometry,a.anchorPosition);
        			//queuePopupFunction_Core: function(f,layer,attributes,anchorLocation,anchorPosition,onClose)
        		}
        	}
    		else
    		{
    			var that = this;
	    		var onClose = function(){setTimeout(function(){that.unselect(f);},0);};
	    		this.queuePopupFunction_Core(f,f.link.layer,f.link.attributes,f.geometry,a.anchorPosition,onClose);
    		}
		}
    	
	},
	unFocusOnItem: function(f)
	{
		this.primary.unFocusOnItem.apply(this.primary,[f]);
	},
	atCenter: function(f)
	{
		return this.primary.atCenter.apply(this.primary,[f]);
	},
	hasPopup: function(layer)
	{
		return this.primary.hasPopup.apply(this.primary,[layer]);
	},
	queuePopupFunction_Core: function(f,layer,attributes,anchorLocation,anchorPosition,onClose)
	{
		return this.primary.queuePopupFunction_Core.apply(this.primary,[f,layer,attributes,anchorLocation,anchorPosition,onClose]);
	},
	stopWheelTimer: function()
	{
		this.primary.stopWheelTimer.apply(this.primary);
	},
	delayWheelTimer: function()
	{
		this.primary.delayWheelTimer.apply(this.primary);
	},
	finishWheelTimer: function()
	{
		this.primary.finishWheelTimer.apply(this.primary);
	},
	isCloseFeature: function(f)
	{
		if(f.attributes.close!=undefined)
		{
			return f.attributes.close=='on';
		}
		else
		{
			return false;
		}
	},
	overFeature: function(f)
   	{
 		if(f.attributes.hover==undefined||f.attributes.hover=='off')
		{
	        f.attributes.hover = 'on';
	        f.layer.redraw();
	    }
    },
    outFeature: function(f)
    {
    	if(f.attributes.hover=='on')
    	{
    		f.attributes.hover = 'off';
    		f.layer.redraw();
    	}
    },
	clickFeature: function(f)
	{
		if(this.isCloseFeature(f))
		{
			this.finishWheelTimer();
		}
		else
		{
			var selected = (OpenLayers.Util.indexOf(f.layer.selectedFeatures, f) > -1);
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
                {
                	this.unselectAll({except: f});
                }
                this.select(f);
                this.focusOnItem(f);
            }
		}
	},
	initialize: function(layers, options)
    {
    	var defaultOptions = {multiple:false,clickout:true,hover:true};
    	options = (options==undefined)?defaultOptions:OpenLayers.Util.applyDefaults(options,defaultOptions);    	
    	OpenLayers.Control.SelectFeature.prototype.initialize.apply(this, [layers, options]);
    	
    	this.init_layers(layers,options);//layers is not an array
    },
    init_layers: function(layers,options)
   	{
    	for(var i = 0; i < layers.length; i++)
    	{
    		this.init_layer(layers[i],options);
    	}
   	},
    init_layer: function(layer, options)
   	{
    	var that = this;
    	layer.events.on(
    	{
    		featureselected: function(e){that.onFeatureSelected.apply(that,[e]);},
    		featureunselected: function(e){that.onFeatureUnselected.apply(that,[e]);}
    	});
   	},
	onFeatureSelected: function(e)
   	{
   	},
   	onFeatureUnselected: function(e)
   	{
		if(!this.isLocked())
		{
			this.unFocusOnItem(e.feature);
			this.delayWheelTimer();
		}
   	},
    CLASS_NAME: "OpenLayers.Control.AdvancedSelectFeatureWheel"
});
