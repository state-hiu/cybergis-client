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
OpenLayers.Control.AdvancedLegend = OpenLayers.Class(OpenLayers.Control,
{
	//Constant Variables
	daysoftheweek:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	monthsoftheyear:['January','February','March','April','May','June','July','August','September','October','November','December'],
	
	//Singularity Variables
	type: 'static',//static or time
	mainDiv:undefined,
    middle: undefined,
    mainLabel: undefined,
	
    listener: undefined,    
   
    updateDelay: 2000,

	animate: true,    
    currentDate: undefined,
    currentDateRange: undefined,//Not Implemented Yet []
	currentTime: undefined,
	currentTimeRange: undefined,
	value: undefined,
	values: undefined, //Not implemented Yet, Only for Date Ranges
	minDate: undefined,
	minTime: undefined,
	maxDate: undefined,
	maxTime: undefined,
	days: undefined,
	
	expandedMaxWidth: 380,
	collapsedMaxWidth: 220,
	padding: 20,
		
    layer: null,
    layers: null,
    
    
    bHide: false,//Hide layer from legend if not visible on map
    bFade: true,//Fade layer from legend if not visible on map
    
    legendItems: undefined,//{"proto" --> array of legend items for each layer}
    
    
    /**
     * @since 1.0
     * @returns {Boolean}
     */
    isAnimated: function()
	{
		return this.animate;
	},
	/**
	 * @since 1.0
	 * @returns {Number}
	 */
    getMaxWidth: function()
    {
    	if(OpenLayers.Element.hasClass(this.mainDiv,"expanded"))
    	{
    		return this.expandedMaxWidth;
    	}
    	else
    	{
    		return this.collapsedMaxWidth;
    	}
    },

    setLayer: function(layer)
    {
    	var that = this;
    	this.layer = layer;
    	layer.events.register('loadend',layer,function()
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
    		layer.events.register('loadend',layer,function()
	      	{
				that.refresh.apply(that);
			});
    	}
    },
    setMap: function(map)
    {
    	OpenLayers.Control.prototype.setMap.apply(this, [map]);
    	var that = this;
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
        }
    },
    createLegend: function()
    {
    	this.createHeading(this.legendContainer);
    	
    	if(this.layer!=undefined)
       	{
        	this.createLayer(this.layer,this.legendContainer);
       	}
        else if(this.layers!=undefined)
        {
        	this.createLayers(this.layers,this.legendContainer);   	
        }
    },
    createHeading: function(legendContainer)
    {
    	var legendHeading = this.createLegendHeading();
    	$(legendHeading).data('olControlAdvancedLegend',this);
    	$(legendHeading).click(function(){var legend = $(this).data('olControlAdvancedLegend');legend.onLegendHeadingClick.apply(legend);});
    	legendContainer.appendChild(legendHeading);
    },
    createLayers: function(layers,legendContainer)
    {
    	for(var i = 0; i < layers.length; i++)
    	{
    		this.createLayer(layers[i],legendContainer,(((i+1)>=layers.length)?undefined:layers[i+1]));
    	}
    },
    createLayer: function(layer,legendContainer,nextLayer)
    {
    	if(this.hasLegendItem(layer.proto))
    	{
    		var items = this.createLegendItems(layer.proto,layer.inRange,(nextLayer!=undefined?nextLayer.proto:undefined));
    		for(var j = 0; j < items.length; j++)
    		{
    			legendContainer.appendChild(items[j]);
    		}
    		this.setLegendItems(layer.proto,items);
    	}
    },
    refresh: function()
    {
    	if(this.layer!=undefined)
       	{
        	this.refreshLayer(this.layer,this.legendContainer);
       	}
        else if(this.layers!=undefined)
        {
        	this.refreshLayers(this.layers,this.legendContainer);   	
        }
    },
    refreshLayers: function(layers,legendContainer)
    {
    	for(var i = 0; i < layers.length; i++)
    	{
    		this.refreshLayer(layers[i],legendContainer);
    	}
    },
    refreshLayer: function(layer,legendContainer)
    {
    	if(this.legendItems!=undefined)
    	{
    		var items = this.legendItems[""+layer.proto];
    		if(items!=undefined)
    		{
    			if(items.length>0)
    			{
    				for(var i = 0; i < items.length; i++)
    				{
    					if(layer.inRange)
    					{
    						$(items[i]).removeClass("hidden fade");
    					}
    					else
    					{
    						if(this.bHide)
    			    		{
    							$(items[i]).removeClass("fade");
    							$(items[i]).addClass("hidden");
    			    		}
    			    		else if(this.bFade)
    			    		{
    			    			$(items[i]).removeClass("hidden");
    							$(items[i]).addClass("fade");
    			    		}
    			    		else
    			    		{
    			    			$(items[i]).removeClass("hidden fade");
    			    		}
    					}
    				}
    			}
    		}
    	}
    },
    setLegendItems: function(proto,items)
    {
    	if(this.legendItems==undefined)
    	{
    		this.legendItems = {};
    	}
    	this.legendItems[""+proto] = items;
    },
    
    /**
     * @since 1.0
     * @returns {Boolean}
     */
    isSingle: function()
	{
		return this.type=='single';
	},
	/**
	 * @since 1.0
	 * @returns {Boolean}
	 */
	isRange: function()
	{
		return this.type=='range';
	},
	/**
	 * @since 1.0
	 * @param d - original {Date}
	 * @returns {Date}
	 */
	copyDate: function(d)
	{
		return new Date(d.getFullYear(),d.getMonth(),d.getDate());
	},
	/**
	 * @since 1.0
	 * @param format
	 * @returns
	 */
    formatCurrentDate: function(format)
    {
    	return this.formatDate(this.getCurrentDate(),format);
    },
    /**
     * @since 1.0
     * @param format
     * @returns
     */
    formatCurrentStartDate: function(format)
    {
    	return this.formatDate(this.getCurrentStartDate(),format);
    },
    /**
     * @since 1.0
     * @param format
     * @returns
     */
    formatCurrentEndDate: function(format)
    {
    	return this.formatDate(this.getCurrentEndDate(),format);
    },
    /**
     * @since 1.0
     * @param d
     * @param format
     * @returns {String}
     */
    formatDate: function(d,format)
    {
    	if(d!=undefined)
    	{
    		if(format=="label")
        	{
        		return this.monthsoftheyear[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();    		
        	}
        	else if(format=="wfs")
        	{
        		return d.getFullYear()+"-"+((d.getMonth()<9)?("0"+(d.getMonth()+1)):(d.getMonth()+1))+"-"+((d.getDate()<10)?("0"+d.getDate()):d.getDate());
        	}
    	}
    	else
    	{
    		return "";
    	}
    },
    /**
     * @since 1.0
     * @param date
     * @param updateUI
     */
    setCurrentDate: function(date,updateUI)
    {
    	_setCurrentDate(date);
    	if(updateUI)
    	{
    		this._updateUI();
    	}
    },
    /**
     * @since 1.0
     * @param start
     * @param end
     * @param updateUI
     */
    setCurrentDateRange: function(start,end,updateUI)
    {
    	_setCurrentDateRange(start,end);
    	if(updateUI)
    	{
    		this._updateUI();
    	}
    },
    /**
     * @since 1.0
     * @param date
     */
    _setCurrentDate: function(date)
    {
    	date = this.boundDate(date);
    	
    	this.currentDate = date;
    	this.currentTime = date.getTime();
    	this.value = Math.floor((this.currentTime-this.minTime)/86400000);
    },
    /**
     * @since 1.0
     * @param startDate
     * @param endDate
     */
    _setCurrentDateRange: function(startDate,endDate)
    {
    	startDate = this.boundDate(startDate);
    	endDate = this.boundDate(endDate);
    	this.currentDateRange = [startDate,endDate];
    	
    	var startTime = startDate.getTime();
    	var endTime = endDate.getTime();
    	this.currentTimeRange = [startTime,endTime];
    	
    	var startValue = Math.floor((this.currentTimeRange[0]-this.minTime)/86400000);
    	var endValue = Math.floor((this.currentTimeRange[1]-this.minTime)/86400000);
    	this.values = [startValue,endValue];
    },
    /**
     * @since 1.0
     * @param startDate
     */
    _setCurrentStartDate: function(startDate)
    {
    	startDate = this.boundDate(startDate);
    	this.currentDateRange[0] = startDate;
    	
    	var startTime = startDate.getTime();
    	this.currentTimeRange[0] = startTime;
    	
    	var startValue = Math.floor((startTime-this.minTime)/86400000);
    	this.values[0] = startValue;
    },
    /**
     * @since 1.0
     * @param endDate
     */
    _setCurrentEndDate: function(endDate)
    {
    	endDate = this.boundDate(endDate);
    	this.currentDateRange[1] = endDate;
    	
    	var endTime = endDate.getTime();
    	this.currentTimeRange[1] = endTime;
    	
    	var endValue = Math.floor((endTime-this.minTime)/86400000);
    	this.values[1] = endValue;
    },
    /**
     * @since 1.0
     * @param date
     * @returns
     */
    boundDate: function(date)
    {
    	var newDate = undefined;
    	if(date.getTime()>this.getMaxTime())
    	{
    		newDate = this.copyDate(this.getMaxDate());
    	}
    	else if(date.getTime()<this.getMinTime())
    	{
    		newDate = this.copyDate(this.getMinDate());
    	}
    	else
    	{
    		newDate = this.copyDate(date);
    	}
    	return newDate;
    },
    /**
     * @since 1.0
     * @returns
     */
    getCurrentDate: function()
    {
    	return this.currentDate;
    },
    /**
     * @since 1.0
     * @returns
     */
    getCurrentStartDate: function()
    {
    	if(this.currentDateRange!=undefined)
    	{
    		return this.currentDateRange[0];
    	}
    	else
    	{
    		return undefined;
    	}
    },
    /**
     * @since 1.0
     * @returns
     */
    getCurrentEndDate: function()
    {
    	if(this.currentDateRange!=undefined)
    	{
    		return this.currentDateRange[1];
    	}
    	else
    	{
    		return undefined;
    	}
    },
    /**
     * @since 1.0
     * @returns
     */
    getValue: function()
    {
    	return this.value;
    },
    /**
     * @since 1.0
     * @returns
     */
    getStartValue: function()
    {
    	return this.values[0];
    },
    /**
     * @since 1.0
     * @returns
     */
    getEndValue: function()
    {
    	return this.values[1];
    },
    /**
     * @since 1.0
     * @returns {Array}
     */
    getValues: function()
    {
    	return this.values;
    },
    /**
     * @since 1.0
     * @returns
     */
    getMinDate: function()
    {
    	return this.minDate;
    },
    /**
     * @since 1.0
     * @returns
     */
    getMinTime: function()
    {
    	return this.minTime;
    },
    /**
     * @since 1.0
     * @returns
     */
    getMaxDate: function()
    {
    	return this.maxDate;
    },
    /**
     * @since 1.0
     * @returns
     */
    getMaxTime: function()
    {
    	return this.maxTime;
    },
    /**
     * @since 1.0
     * @returns
     */
    getDays: function()
    {
    	return this.days;
    },
    /**
     * @since 1.0
     * @returns
     */
    getUpdateDelay: function()
    {
    	return this.updateDelay();
    },
    /**
     * @since 1.0
     * @param delay
     */
    setUpdateDelay: function(delay)
    {
    	this.updateDelay = delay;
    },
    setDateRange: function(minDate,maxDate)
    {
    	this.minDate = minDate;
    	this.minTime = minDate.getTime();
    	
    	this.maxDate = maxDate;
    	this.maxTime = maxDate.getTime();
    	
    	this.days = Math.floor(((this.maxTime-this.minTime)/86400000)+1);//Floor truncates in case of daylight savings time changeover.
    },
    /**
     * @since 1.0
     */
    collapse : function()
    {
    	this.collapseTimer = undefined;
    	if(OpenLayers.Element.hasClass(this.mainDiv,'expanded'))
		{
    		OpenLayers.Element.removeClass(this.mainDiv, "expanded");
		}
    	$(this.mainDiv).stop(true,false);//Kills any current animations, and does NOT complete them.
    	
    	if(this.isAnimated())
		{
        	var m = this.map;
        	var w = Math.min(m.getCurrentSize().w-this.padding,this.getMaxWidth());
        	var marginLeft = (-1*(w/2))-(this.padding/4);
        	$(this.mainDiv).animate({"width":w,"margin-left":marginLeft});
		}
    	else
    	{
    		this._resizeSlider();
    	}
    	
    },
    /**
     * @since 1.0
     */
    expand: function()
    {
    	if(!OpenLayers.Element.hasClass(this.mainDiv,'expanded'))
		{
    		OpenLayers.Element.addClass(this.mainDiv, "expanded");
		}
    	$(this.mainDiv).stop(true,false);//Kills any current animations, and does NOT complete them.
    	
    	if(this.isAnimated())
		{
        	var m = this.map;
        	var w = Math.min(m.getCurrentSize().w-this.padding,this.getMaxWidth());
        	var marginLeft = (-1*(w/2))-(this.padding/4);
        	$(this.mainDiv).animate({"width":w,"margin-left":marginLeft});
		}
    	else
    	{
    		this._resizeSlider();
    	}
    	
    },
  
    initialize: function(layers, options)
    {
    	OpenLayers.Control.prototype.initialize.apply(this, [options]);
        if(OpenLayers.Util.isArray(layers))
        {
            this.setLayers(layers);
        }
        else
        {
            this.setLayer(layers);
        }
        this.initializeDateRange();
        this.initializeCurrentDate();
    },
    initializeDateRange: function()
    {
    	var minDate = this.getMinDate();
    	var maxDate = this.getMaxDate();
    	if(minDate==undefined||maxDate==undefined)
    	{
    		var now = new Date();
    		var today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    		
    		minDate = new Date(today.getFullYear(),today.getMonth(),today.getDate()-7);
    		maxDate = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    	}
    	this.setDateRange(minDate, maxDate);
    },
    initializeCurrentDate: function()
    {
    	if(this.isSingle())
    	{
    		var currentDate = this.getCurrentDate();
    		if(currentDate==undefined)
    		{
    			currentDate = this.copyDate(this.maxDate);
    		}
    		this._setCurrentDate(currentDate);
    	}
    	else if(this.isRange())
    	{
    		var startDate = this.getCurrentStartDate();
    		var endDate = this.getCurrentEndDate();
    		if(startDate==undefined||endDate==undefined)
    		{
    			startDate = new Date(this.maxDate.getFullYear(),this.maxDate.getMonth(),this.maxDate.getDate()-7);
    			endDate = this.copyDate(this.maxDate);
    		}
    		this._setCurrentDateRange(startDate,endDate);
    	}
    },
    /**
     * @since 1.0
     * @returns
     */
    draw: function()
    {
    	var div = OpenLayers.Control.prototype.draw.apply(this);
    	
    	if(this.isSingle())
    	{
    		OpenLayers.Element.addClass(div,"single");
    	}
    	else if(this.isRange())///if(this.isRange())
    	{
    		OpenLayers.Element.addClass(div,"range");
    	}

    	var middle = document.createElement('div');
        middle.className = "olControlAdvancedLegendMiddle olControlMiddle";
        
	        var mainLabel = document.createElement('div');
	        mainLabel.className = "olControlAdvancedLegendLabel";
	        $(mainLabel).data('olControlAdvancedLegend',this);
	        
		        var mainLabelSpan = document.createElement('span');
		        mainLabelSpan.innerHTML = "Legend - Click to Open";
		        mainLabel.appendChild(mainLabelSpan);
		    
		    middle.appendChild(mainLabel);
        
	        this.legendContainer = document.createElement('div');
	        this.legendContainer.className = "olControlAdvancedLegendContainer";
	        
	        this.createLegend();
	        
	        middle.appendChild(this.legendContainer);
        
        div.appendChild(middle);
        
        this.mainDiv = div;
        
        
        $(mainLabel).click(function(){var legend = $(this).data('olControlAdvancedLegend');legend.onMainLabelClick.apply(legend);});
        
        //olControlAdvancedLegendHeading
        
        
        return div;
    },
    onLegendHeadingClick: function()
    {
    	if(this.isAnimated())
		{
    		this.collapse();
		}
    	else
    	{
    		if(!OpenLayers.Element.hasClass(this.mainDiv,'collapsed'))
    		{
        		OpenLayers.Element.addClass(this.mainDiv, "collapsed");
    		}
    	}
    },
    onMainLabelClick: function()
    {
    	if(this.isAnimated())
		{
    		this.expand();
		}
    	else
    	{
    		if(OpenLayers.Element.hasClass(this.mainDiv,'collapsed'))
    		{
        		OpenLayers.Element.removeClass(this.mainDiv, "collapsed");
    		}
    	}
    },
    /**
     * @since 1.0
     */
    onMapResize: function()
    {
    	this._resizeLegend();
    	//this._resizeHandles();
    },
    /**
     * @since 1.0
     */
    _resizeLegend: function()
    {
    	//var m = this.map;
    	//var w = Math.min(m.getCurrentSize().w-this.padding,this.getMaxWidth());
    	//var left = "50%";//Should Be Set in CSSssss
    	//var marginLeft = (""+((-1*(w/2))-(this.padding/4))+"px");
    	//$(this.mainDiv).css({"left":left,"width":(w+"px"),"margin-left":marginLeft});
    	//$(this.mainDiv).css({"width":(w+"px"),"margin-left":marginLeft});
    },
     /**
     * @since 1.0
     * @returns {___slider5}
     */
    createLegendItems: function(sLayer,inRange,sNextLayer)
    {
    	var items = [];
    	if(this.hasClassification(sLayer,"basic"))
    	{
    		var iClassifier = this.getDefaultLegendClassifier(sLayer,"basic");
    		var classnames = this.getClassNames(sLayer,iClassifier);
    		if(classnames.length==0)
    		{
    			items.push(this.createLegendItem({"sLayer":sLayer,"inRange":inRange}));
   			}
    		else if(classnames.length==1)
    		{
    			items.push(this.createLegendItem({"sLayer":sLayer,"iClassifier":iClassifier,"sClass":classnames[0],"inRange":inRange}));
    		}
    		else
    		{
    			items.push(this.createLegendSubHeading(sLayer));
    			for(var i = 0; i < classnames.length; i++)
        		{
        			items.push(this.createLegendItem({"sLayer":sLayer,"iClassifier":iClassifier,"sClass":classnames[i],"inRange":inRange}));
        		}
    			
    			if(sNextLayer!=undefined)
    			{
    				items.push(this.createLegendBreak());
    			}
    		}
    	}
    	else
    	{
    		items.push(this.createLegendItem({"sLayer":sLayer,"inRange":inRange}));
    		
    		if(sNextLayer!=undefined)
    		{
    			if(this.hasClassification(sNextLayer,"basic")&&this.getClassNames(sNextLayer,this.getDefaultLegendClassifier(sNextLayer,"basic")).length>1)
        		{
        			items.push(this.createLegendBreak());
        		}
    		}
    	}
		
    	return items;
    },
    createLegendItem: function(args)
    {
    	var sLayer = args.sLayer;
    	var iClassifier = args.iClassifier;
    	var sClass = args.sClass;
    	var inRange = args.inRange;
    	
    	var item = document.createElement('div');
    	if(inRange)
    	{
    		item.className = "olControlAdvancedLegendItem";
    	}
    	else
    	{
    		if(this.bHide)
    		{
    			item.className = "olControlAdvancedLegendItem hidden";
    		}
    		else if(this.bFade)
    		{
    			item.className = "olControlAdvancedLegendItem fade";
    		}
    		else
    		{
    			item.className = "olControlAdvancedLegendItem";
    		}
    	}
    	
    	if(sClass==undefined)
    	{
    		var sSymbolType = this.getSymbolType(sLayer);
    		if(sSymbolType!=undefined)
    		{
        		item.appendChild(this.createLegendItemSymbol({"sLayer":sLayer,"sType":sSymbolType}));
    		}
    		var label = this.createLegendItemLabel({"sLayer":sLayer});
    		item.appendChild(label);
    	}
    	else
    	{
    		var sSymbolType = this.getSymbolType(sLayer);
    		if(sSymbolType!=undefined)
    		{
    			item.appendChild(this.createLegendItemSymbol({"sLayer":sLayer,"iClassifier":iClassifier,"sClass":sClass,"sType":sSymbolType}));
    		}
    		var label = this.createLegendItemLabel({"sLayer":sLayer,"iClassifier":iClassifier,"sClass":sClass});
    		item.appendChild(label);
    	}    	
    	return item;
    },
    createLegendBreak: function()
    {
    	var item = document.createElement('div');
    	item.className = "olControlAdvancedLegendBreak";
    	var innerDiv = document.createElement('div');
    	item.appendChild(innerDiv);
    	return item;
    },
    createLegendSubHeading: function(sLayer)
    {
    	var item = document.createElement('div');
    	item.className = "olControlAdvancedLegendItem";
    	var heading = document.createElement('div');
    	heading.className = "olControlAdvancedLegendSubHeading";
    	$(heading).html("<div><span>"+this.getDefaultLabel(sLayer)+"</span></div>");  	
    	item.appendChild(heading);
    	return item;
    },
    createLegendHeading: function()
    {
    	var item = document.createElement('div');
    	item.className = "olControlAdvancedLegendItem";
    	$(item).css("height","auto");
    	var heading = document.createElement('div');
    	heading.className = "olControlAdvancedLegendHeading";
    	$(heading).html("<div><span>Legend</span></div>");  	
    	item.appendChild(heading);
    	return item;
    },
    createLegendItemLabel: function(args)
    {
    	var sLayer = args.sLayer;
    	var iClassifier = args.iClassifier;
    	var sClass = args.sClass;
    	
    	var label = document.createElement('div');
    	label.className = "olControlAdvancedLegendItemLabel";
    	if(sClass==undefined)
    	{
    		$(label).html("<div><span>"+this.getDefaultLabel(sLayer)+"</span></div>");
    	}
    	else
    	{
    		$(label).html("<div><span>"+this.getClassLabel(sLayer,iClassifier,sClass)+"</span></div>");
    	}    	
    	return label;
    },
    createLegendItemSymbol: function(args)
    {
    	var sLayer = args.sLayer;
    	var sType = args.sType;
    	var iClassifier = args.iClassifier;
    	var sClass = args.sClass;
    	
    	var symbol = document.createElement('div');
    	symbol.className = "olControlAdvancedLegendItemSymbol";
    	if(sType=="asterisk")
    	{
    		$(symbol).html("*");
    	}
    	else if(sType=="ellipse")
    	{
    		var width = this.getWidth(sLayer);
    		var height = this.getHeight(sLayer);
    		var fillColor = this.getDefaultStyleAttribute(sLayer,"fillColor");
    		var strokeColor = this.getDefaultStyleAttribute(sLayer,"strokeColor");
    		
    		var html = "";
    		html += "<?xml version=\"1.0\" standalone=\"no\"?>";
    		html += "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
    		html += "<svg width=\"100%\" height=\"100%\" version=\"1.0\" xmlns=\"http://www.w3.org/2000/svg\">";
    		html += "<ellipse cx=\"50%\" cy=\"50%\" rx=\""+(width)+"\" ry=\""+(height)+"\" fill=\""+fillColor+"\" stroke-width=\"1\" stroke=\""+strokeColor+"\"/>";
    		html += "</svg> ";
    		$(symbol).html(html);
    	}
    	else if(sType=="circle")
    	{
    		var radius = this.getRadius(sLayer);
    		var fillColor = this.getDefaultStyleAttribute(sLayer,"fillColor");
    		var strokeColor = this.getDefaultStyleAttribute(sLayer,"strokeColor");
    		
    		var html = "";
    		html += "<?xml version=\"1.0\" standalone=\"no\"?>";
    		html += "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
    		html += "<svg width=\"100%\" height=\"100%\" version=\"1.0\" xmlns=\"http://www.w3.org/2000/svg\">";
    		html += "<circle cx=\"50%\" cy=\"50%\" r=\""+(radius)+"\" fill=\""+fillColor+"\" stroke-width=\"1\" stroke=\""+strokeColor+"\"/>";
    		html += "</svg> ";
    		$(symbol).html(html);
    	}
    	else if(sType=="line")
    	{
    		var length = this.getLength(sLayer);  
    		var width = this.getWidth(sLayer);    		
    		
    		var strokeColor = undefined;
    		var defaultStrokeColor = this.getDefaultStyleAttribute(sLayer,"strokeColor");
    		if(sClass==undefined)
    		{
    			strokeColor = defaultStrokeColor;
    		}
    		else
    		{
    			strokeColor = this.getClassStyleAttribute(sLayer,iClassifier,sClass,"strokeColor") || defaultStrokeColor;
    		}
    		
    		
    		var html = "";
    		html += "<?xml version=\"1.0\" standalone=\"no\"?>";
    		html += "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
    		html += "<svg width=\""+length+"px\" height=\"100%\" style=\"margin-left:auto;margin-right:auto;\" version=\"1.0\" xmlns=\"http://www.w3.org/2000/svg\">";
    		html += "<line x1=\"0\" y1=\"50%\" x2=\""+(length)+"\" y2=\"50%\" stroke-width=\""+width+"\" stroke=\""+strokeColor+"\"/>";
    		html += "</svg> ";
    		$(symbol).html(html);
    	}
    	else if(sType=="marker")
    	{
    		var defaultMarker = this.getDefaultStyleAttribute(sLayer,"externalGraphic");
    		var marker = undefined;
    		if(sClass==undefined)
    		{
    			marker = defaultMarker;
    		}
    		else
    		{
        		marker = this.getClassStyleAttribute(sLayer,iClassifier,sClass,"externalGraphic") || defaultMarker;
    		}
    		var width = this.getWidth(sLayer);
    		if(marker!=undefined)
    		{
    			var img = document.createElement('img');
    			if(width!=undefined)
    			{
    				$(img).attr({"width":(width+""),"border":"0","src":marker,"alt":marker});
    			}
    			else
    			{
    				$(img).attr({"border":"0","src":marker,"alt":marker});
    			}
    			symbol.appendChild(img);
    		}
    		else
    		{
    			$(symbol).html("<div><span>"+"Marker Does not Exist"+"</span></div>");
    		}
    	}
    	return symbol;
    },    
    getSymbolType: function(sLayer)
    {
    	var type = false;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["legend"]!=undefined)
            		{
    					if(this.carto.layers[""+sLayer]["legend"]["symbol"]!=undefined)
                		{
                			type = this.carto.layers[""+sLayer]["legend"]["symbol"];
                		}
            		}
        		}
    		}
    	}
    	return type;
    },
    getDefaultLabel: function(sLayer)
    {
    	var label = "No Label Specified";
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["legend"]!=undefined)
            		{
    					if(this.carto.layers[""+sLayer]["legend"]["label"]!=undefined)
                		{
                			label = this.carto.layers[""+sLayer]["legend"]["label"];
                		}
            		}
        		}
    		}
    	}
    	return label;
    },
    getClassLabel: function(sLayer,iClassifier,sClass)
    {
    	var label = "No Label Specified";
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["classifications"]!=undefined)
            		{
    					if(this.carto.layers[""+sLayer]["classifications"][iClassifier]!=undefined)
                		{
    						if(this.carto.layers[""+sLayer]["classifications"][iClassifier]["data"]!=undefined)
                    		{
        						if(this.carto.layers[""+sLayer]["classifications"][iClassifier]["data"][sClass]!=undefined)
                        		{
        							if(this.carto.layers[""+sLayer]["classifications"][iClassifier]["data"][sClass]["label"]!=undefined)
                            		{
        								label = this.carto.layers[""+sLayer]["classifications"][iClassifier]["data"][sClass]["label"];
                            		}
                        		}
                    		}
                		}
            		}
        		}
    		}
    	}
    	return label;
    },
    getEllipsis: function(sLayer)
    {
    	
    },
    
    getDefaultStyleAttribute: function(sLayer,sAttribute)
    {
    	var defaultSymbolizer = this.getDefaultSymbolizer(sLayer,OpenLayers.Feature.Vector.style["default"]);    	
    	var value = undefined;
    	if(defaultSymbolizer!=undefined)
    	{
    		if(defaultSymbolizer[sAttribute]!=undefined)
    		{
    			value = defaultSymbolizer[sAttribute];
    		}
    	}
    	return value;
    },
    getClassStyleAttribute: function(sLayer,iClassifier,sClass,sAttribute)
    {
    	var value = undefined;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["classifications"]!=undefined)
            		{
    					if(this.carto.layers[""+sLayer]["classifications"][iClassifier]!=undefined)
                		{
    						if(this.carto.layers[""+sLayer]["classifications"][iClassifier]["data"]!=undefined)
                    		{
        						if(this.carto.layers[""+sLayer]["classifications"][iClassifier]["data"][sClass]!=undefined)
                        		{
        							if(this.carto.layers[""+sLayer]["classifications"][iClassifier]["data"][sClass]["style"]!=undefined)
                            		{
        								if(this.carto.layers[""+sLayer]["classifications"][iClassifier]["data"][sClass]["style"]["default"]!=undefined)
                                		{
            								if(this.carto.layers[""+sLayer]["classifications"][iClassifier]["data"][sClass]["style"]["default"][sAttribute]!=undefined)
                                    		{
                                    			value = this.carto.layers[""+sLayer]["classifications"][iClassifier]["data"][sClass]["style"]["default"][sAttribute];
                                    		}
                                		}
                            		}
                        		}
                    		}
                		}
            		}
        		}
    		}
    	}
    	return value;
    },
    getRadius: function(sLayer)
    {
    	var radius = undefined;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["legend"]!=undefined)
            		{
    					if(this.carto.layers[""+sLayer]["legend"]["radius"]!=undefined)
                		{
    						radius = this.carto.layers[""+sLayer]["legend"]["radius"];
                		}
            		}
        		}
    		}
    	}
    	return radius;
    },
    getLength: function(sLayer)
    {
    	var width = undefined;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["legend"]!=undefined)
            		{
    					if(this.carto.layers[""+sLayer]["legend"]["length"]!=undefined)
                		{
    						width = this.carto.layers[""+sLayer]["legend"]["length"];
                		}
            		}
        		}
    		}
    	}
    	return width;
    },
    getWidth: function(sLayer)
    {
    	var width = undefined;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["legend"]!=undefined)
            		{
    					if(this.carto.layers[""+sLayer]["legend"]["width"]!=undefined)
                		{
    						width = this.carto.layers[""+sLayer]["legend"]["width"];
                		}
            		}
        		}
    		}
    	}
    	return width;
    },
    getHeight: function(sLayer)
    {
    	var height = false;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["legend"]!=undefined)
            		{
    					if(this.carto.layers[""+sLayer]["legend"]["height"]!=undefined)
                		{
    						height = this.carto.layers[""+sLayer]["legend"]["height"];
                		}
            		}
        		}
    		}
    	}
    	return height;
    },   
    hasLegendItem: function(sLayer)
    {
    	var item = false;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				item = this.carto.layers[""+sLayer]["legend"]!=undefined;
        		}
    		}
    	}
    	return item;
    },
    hasClassification: function(sLayer,sType)
    {
    	var classification = false;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["classifications"]!=undefined)
    				{
    					classification = $.grep(this.carto.layers[""+sLayer]["classifications"],function(oClassification,i){return oClassification.type==sType;}).length>0;
    				}
        		}
    		}
    	}
    	return classification;
    },
    getDefaultLegendClassifier: function(sLayer,sType)
    {
    	var iClassifier = -1;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["classifications"]!=undefined)
    				{
    					for(var i = 0; i < this.carto.layers[""+sLayer]["classifications"].length; i++)
    					{
    						if(this.carto.layers[""+sLayer]["classifications"][i]["type"]==sType)
    						{
    							iClassifier = i;
    							break;
    						}
    					}
    					//iClassifier = $.grep(this.carto.layers[""+sLayer]["classifications"],function(oClassification,i){return oClassification.type==sType;}).length>0;
    				}
        		}
    		}
    	}
    	return iClassifier;
    },
    getClassNames: function(sLayer,iClassifier)
	{
		var c = [];
		if(this.carto.layers[""+sLayer]!=undefined)
		{
			if(this.carto.layers[""+sLayer]["classifications"]!=undefined)
			{
				var classifications = this.carto.layers[""+sLayer]["classifications"];
				if(classifications[iClassifier]!=undefined)
				{
					var d = classifications[iClassifier]["data"];
					$.each(d,function(sClass,v)
					{
						if(sClass!="default")
						{
							c.push(sClass);
						}
					});
				}
			}
		}
		return c;
	},
	
	/*------------------------------------------------------- Carto Functions -------------------------------------------------------*/
	getDefaultSymbolizer: function(sLayer,defaultSymbolizerObject)
	{
		var style = undefined;
		var oIntent = undefined;
		
		if(this.carto.layers[""+sLayer]!=undefined)
		{
			if(this.carto.layers[""+sLayer]["style"]!=undefined)
			{
				if(this.carto.layers[""+sLayer]["style"]["intents"]["default"]!=undefined)
				{
					if(this.carto.layers[""+sLayer]["style"]["intents"]["default"]!=undefined)
					{
						oIntent = this.carto.layers[""+sLayer]["style"]["intents"]["default"];
					}
				}
			}
		}
		
		if(oIntent!=undefined)
		{
			var symbolizerObject = {};
			
			if(oIntent.templates!=undefined)
			{
				if($.isArray(oIntent.templates))
				{
					for(var i = 0; i < oIntent.templates.length; i++)
					{
						var oTemplate = oIntent.templates[i];
						var sTemplate = this.getStyleTemplate(oTemplate.ns,oTemplate.id);
						symbolizerObject = OpenLayers.Util.applyDefaults(OpenLayers.Util.extend({},symbolizerObject),sTemplate);
					}
				}
				else if(typeof oIntent.templates == "string")
				{
					var a = oIntent.templates.split(",");
					for(var i = 0; i < a.length; i++)
					{
						var b = a[i].split(":");
						var ns = $.trim(b[0]);
						var id = $.trim(b[1]);
						var sTemplate = this.getStyleTemplate(ns,id);
						symbolizerObject = OpenLayers.Util.applyDefaults(OpenLayers.Util.extend({},symbolizerObject),sTemplate);
					}
				}
			}
			
			if(oIntent.properties!=undefined)
			{
				symbolizerObject = OpenLayers.Util.applyDefaults(OpenLayers.Util.extend({},symbolizerObject),oIntent.properties);
			}
			
			if(defaultSymbolizerObject!=undefined)
			{
				symbolizerObject = OpenLayers.Util.applyDefaults(OpenLayers.Util.extend({},symbolizerObject),defaultSymbolizerObject);
			}
		}
		return symbolizerObject;
	},
	"getStyleTemplate": function(ns, id)
	{
		var symbolizerObject = undefined;
		if(this.carto!=undefined)
		{
			if(this.carto.library!=undefined)
			{
				if(this.carto.library.templates[""+ns]!=undefined)
				{
					if(this.carto.library.templates[""+ns][""+id]!=undefined)
					{
						symbolizerObject = this.carto.library.templates[""+ns][""+id];
					}
				}
			}
		}
		return symbolizerObject;
	},	
	
    /**
     * @since 1.0
     */
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
    CLASS_NAME: "OpenLayers.Control.AdvancedLegend"
});
