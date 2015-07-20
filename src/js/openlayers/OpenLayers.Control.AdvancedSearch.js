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

$.widget( "custom.autocompleteLayer", $.ui.autocomplete,
{
	_renderMenu: function( ul, items ) 
	{
		var that = this;
		var currentLayer = undefined;
		$.each( items, function(index, item ) 
		{
			if ( item.layer != currentLayer ) 
			{
				ul.append( "<li class='cybergis-search-layer'>" + item.layer + "</li>" );
				currentLayer = item.layer;
			}
			that._renderItem(that.options.control, ul, item );
		});
	},
	/*
	 * WARNING this _renderItem override only works on jQueryUI 1.8.14.  It is not compatible with the most recenet api. 
	 */
	_renderItem: function (control, ul, item)
	{	
		var anchor = $("<a></a>");
		if(control.bCarto)
		{
			var sLayer = item.proto;
			var symbol = undefined;
			if(control.hasClassification(sLayer,"basic"))
			{
				var iClassifier = control.getDefaultLegendClassifier(sLayer,"basic");
				var oClassifier = CyberGIS.getJSON(["layers",sLayer,"classifications",""+iClassifier],control.carto);
				var sClass = item.feature.attributes[""+oClassifier.field];
				symbol = control.createLegendItemSymbol.apply(control,[{sLayer:sLayer, sType:control.getSymbolType(item.proto),iClassifier:iClassifier,sClass:sClass}]);	
			}
			else
			{
				symbol = control.createLegendItemSymbol.apply(control,[{sLayer:sLayer, sType:control.getSymbolType(sLayer)}]);
			}
			
			if(symbol)
			{
				anchor.append(symbol);
			}
		}
		anchor.append(item.label);
		return $("<li></li>").data("item.autocomplete",item).addClass("cybergis-search-feature").append(anchor).appendTo(ul);

	}	
});
$.extend($.ui.autocomplete,
{
	filterLayer: function(array, term,limit)
	{
		var matches = undefined;
		var matcher = new RegExp($.ui.autocomplete.escapeRegex(term),"i");		
		if(limit>0)
		{
			matches = [];
			for(var i = 0; i <array.length; i++)
			{
				var match = false;
				var values = array[i].values;
				for(var j = 0; j < values.length; j++)
				{
					if(matcher.test(values[j]))
					{
						match = true;
						break;
					}
				}
				if(match)
				{
					matches.push(array[i]);
					if(matches.length==limit)
					{
						break;
					}
				}
			}
		}
		else if(limit==-1)
		{
			matches = $.grep(array, function(value)
			{
				var match = false;
				var values = value.values;
				for(var i = 0; i < values.length; i++)
				{
					if(matcher.test(values[i]))
					{
						match = true;
						break;
					}
				}
				return match;
			});
		}
		else if(limit==0)
		{
			matches = [];
		}
		return matches;
	}
});

OpenLayers.Control.AdvancedSearch = OpenLayers.Class(OpenLayers.Control,
{
	//Constant Variables
	daysoftheweek:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	monthsoftheyear:['January','February','March','April','May','June','July','August','September','October','November','December'],
	
	//Singularity Variables
	type: 'static',//static or time
	mainDiv: undefined,
    mode: "flexible",
    middle: undefined,
    mainLabel: undefined,
    searchInput: undefined,
	
    listener: undefined,    
   
    updateDelay: 2000,
	    
	expandedMaxWidth: 380,
	collapsedMaxWidth: 220,
	padding: 20,
		
    layer: null,
    layers: null,    
    
    bCarto: false,
    bGroup: true,
    bLimit: false,
    iLimit: 10,
    bFold: true,
    bHide: false,//Hide layer from legend if not visible on map
    bFade: true,//Fade layer from legend if not visible on map    
    bAppendLayer: false,
    
    passthroughEvents: false,
    blackholeEvents: false,
      
    acLabel: undefined,
    acLabels: ["label"],
    acFeatures: [],
    acSource: [],
    
    targetFeature: undefined,
    targetZoom: undefined,
    currentStatus: undefined,
    
    selectControl: undefined,
     
  
    isFlexible: function()
    {
    	return this.mode=="flexible";
    },
    isFixed: function()
    {
    	return this.mode=="fixed";
    },
    
    setSelectControl: function(selectControl)
    {
    	this.selectControl = selectControl;
    },
    hasSelectControl: function()
    {
    	return this.selectControl!=undefined; 
    },
    getSelectControl: function()
    {
    	return this.selectControl;
    },
       
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
    	if(!OpenLayers.Element.hasClass(this.mainDiv,"collapsed"))
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
    	layer.events.register('featuresadded',layer,function()
      	{
			that.refresh.apply(that);
		});
    	layer.events.on(
    	{
    		featureunselected: function(e){that.onFeatureUnselected.apply(that,[e]);}
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
    		layer.events.register('featuresadded',layer,function()
	      	{
				that.refresh.apply(that);
			});
        	layer.events.on(
	    	{
	    		featureunselected: function(e){that.onFeatureUnselected.apply(that,[e]);}
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
    createSearch: function()
    {
    	this.createHeading(this.searchContainer);
    	
    	if(this.layer!=undefined)
       	{
    		this.createSearchInput([this.layers],this.searchContainer);  
       	}
        else if(this.layers!=undefined)
        {
        	this.createSearchInput(this.layers,this.searchContainer);   	
        }
    },
    createHeading: function(searchContainer)
    {
    	var searchHeading = this.createSearchHeading();
    	$(searchHeading).data('olControlAdvancedSearch',this);
    	$(searchHeading).click(function(){var search = $(this).data('olControlAdvancedSearch');search.onSearchHeadingClick.apply(search);});
    	searchContainer.appendChild(searchHeading);
    },   
    createSearchInput: function(layers,searchContainer)
    {
    	if(true)
    	{
    		var item = document.createElement('div');
        	item.className = "olControlAdvancedSearchItem olControlAdvancedSearchInputContainer";
        	var div = document.createElement('div');
        	div.className = "olControlAdvancedSearchInput";
        	this.searchInput = document.createElement('input');
        	this.searchInput.type = "text";
        	$(this.searchInput).attr({"placeholder":"Search ..."});
        	
        	//$(this.searchInput).data("acSource",[]);
        	this.initializeAutocompleteInput(this.searchInput,"single",false,this.validateAutocomplete,function(){});
        	
        	div.appendChild(this.searchInput);
        	item.appendChild(div);
        	searchContainer.appendChild(item);
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
    	this.refreshAutocomplete();
    },
    refreshLayers: function(layers,legendContainer)
    {
    	this.acFeatures = [];
    	this.acSource = [];
    	for(var i = 0; i < layers.length; i++)
    	{
    		var layer = layers[i]; 
        	if(layer!=undefined)
        	{
        		for(var j = 0; j < layer.features.length; j++)
        		{
        			var f = layer.features[j];
        			var labels = this.buildAutocompleteLabels(f,layer);
        			for(var k = 0; k < labels.length; k++)
        			{
        				var label = labels[k];
        				if(this.bGroup||this.bFold||this.bCarto)
    					{
    						var layerName = layer.name;
    						this.acFeatures.push(f);
    						this.acSource.push({values:[(this.bFold?this.fold(label):label)],label:label,proto:layer.proto,layer:layerName,feature:f});
    					}
    					else
    					{
    						this.acFeatures.push(f);
    						this.acSource.push(label);
    					}
        			}        			
        		}
        	}
    	}
    },
   
    refreshLayer: function(layer,legendContainer)
    {
    	this.acFeatures = [];
    	this.acSource = [];
    	if(layer!=undefined)
    	{
    		for(var i = 0; i < layer.features.length; i++)
    		{
    			var f = layer.features[i];
    			var labels = this.buildAutocompleteLabels(f,layer);
    			for(var k = 0; k < labels.length; k++)
    			{
    				var label = labels[k]; 
        			this.acFeatures.push(f);
        			this.acSource.push(label);
    			}
    		}
    	}
    },
    
    refreshAutocomplete: function()
    {
    	$(this.searchInput).data("acSource",this.acSource);
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
    /**
     * @since 1.0
     */
    collapse : function()
    {
    	this.collapseTimer = undefined;
    	if(!OpenLayers.Element.hasClass(this.mainDiv,'collapsed'))
		{
    		OpenLayers.Element.addClass(this.mainDiv, "collapsed");
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
    		this._resizeSearch();
    	}
    	
    	$(this.searchInput).val("");
    	this.clearTarget();
    	
    	$(this.searchInput).blur();
    	$(this.map).focus();
    },
    /**
     * @since 1.0
     */
    expand: function()
    {
    	if(OpenLayers.Element.hasClass(this.mainDiv,'collapsed'))
		{
    		OpenLayers.Element.removeClass(this.mainDiv, "collapsed");
		}
    	$(this.mainDiv).stop(true,false);//Kills any current animations, and does NOT complete them.
    	
    	$(this.searchInput).val("");
    	this.clearTarget();
    	
    	$(this.map).blur();
    	$(this.searchInput).focus();
    	
    	if(this.isAnimated())
		{
        	var m = this.map;
        	var w = Math.min(m.getCurrentSize().w-this.padding,this.getMaxWidth());
        	var marginLeft = (-1*(w/2))-(this.padding/4);
        	$(this.mainDiv).animate({"width":w,"margin-left":marginLeft});
		}
    	else
    	{
    		this._resizeSearch();
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
        
        if(CyberGIS.isString(this.acLabel))
        {
            this.acLabels = [this.acLabel];
        }
        
        
        if(options!=undefined)
        {
        	if(options.selectControl!=undefined)
            {
            	this.setSelectControl(options.selectControl);
            }
        }
    },
    /**
     * @since 1.0
     * @returns
     */
    draw: function()
    {
    	var div = OpenLayers.Control.prototype.draw.apply(this);
    	if(this.isFlexible())
    	{
    		OpenLayers.Element.addClass(div,"flexible");
    	}
    	else if(this.isFixed())
    	{
    		OpenLayers.Element.addClass(div,"fixed");
    	}
    	
    	if(this.isSingle())
    	{
    		OpenLayers.Element.addClass(div,"single");
    	}
    	else if(this.isRange())///if(this.isRange())
    	{
    		OpenLayers.Element.addClass(div,"range");
    	}

    	var middle = document.createElement('div');
        middle.className = "olControlAdvancedSearchMiddle olControlMiddle";
        
	        var mainLabel = document.createElement('div');
	        mainLabel.className = "olControlAdvancedSearchLabel";
	        $(mainLabel).data('olControlAdvancedSearch',this);
	        
		        var mainLabelSpan = document.createElement('span');
		        mainLabelSpan.innerHTML = "Search";
		        mainLabel.appendChild(mainLabelSpan);
		    
		    middle.appendChild(mainLabel);
        
	        this.searchContainer = document.createElement('div');
	        this.searchContainer.className = "olControlAdvancedSearchContainer";
	        
	        this.createSearch();
	        
	        middle.appendChild(this.searchContainer);
        
        div.appendChild(middle);
        
        this.mainDiv = div;
        
        
        $(mainLabel).click(function(){var search = $(this).data('olControlAdvancedSearch');search.onMainLabelClick.apply(search);});
        
        var events = this.map.events;
		events.registerPriority("click",this,this.onMapClick);
        
		$(div).on('click dblclick',null,this,this.onSearchClick);
		$(div).on('click dblclick','input',this,this.onSearchInputClick);
		//$(this.searchInput).on('click dblclick',null,this,this.onSearchInputClick);		
		
        return div;
    },
    
    onSearchClick: function(evt)
    {
    	var that = evt.data;
    	if(that.blackholeEvents)
    	{
    		that.blackhole(evt);
    	}
    	else if(that.passthroughEvents)
    	{
    		that.passthrough(evt);
    	}
    	else
    	{
    		that.map.events.bypassOnce = true;
    	}
    },
    onSearchInputClick: function(evt)
    {
    	var that = this;
    	var m = evt.data.map;
    	m.events.bypassOnce = true;
    	setTimeout(function()
    	{
    		$(m.div).blur();
    		$(that).focus();
    	},0);
    	//that.blackhole(evt);
    },
    passthrough: function(evt)
    {
    	return false;
    },
    /**
     * @since 1.0
     * @param evt
     */
    blackhole: function(evt)
    {
    	evt.stopPropagation();
    },
    onSearchHeadingClick: function()
    {
    	if(this.isFlexible())
    	{
        	this.collapse();
    	}
    	/*if(this.isAnimated())
		{
    		this.collapse();
		}
    	else
    	{
    		if(!OpenLayers.Element.hasClass(this.mainDiv,'collapsed'))
    		{
        		OpenLayers.Element.addClass(this.mainDiv, "collapsed");
    		}
    	}*/
    },
    onMainLabelClick: function()
    {
    	this.expand();
    	/*if(this.isAnimated())
		{
    		this.expand();
		}
    	else
    	{
    		if(OpenLayers.Element.hasClass(this.mainDiv,'collapsed'))
    		{
        		OpenLayers.Element.removeClass(this.mainDiv, "collapsed");
    		}
    	}*/
    },
    onMapClick: function()
    {
    	if(this.isFlexible())
		{
    		this.collapse();
		}
    },
    /**
     * @since 1.0
     */
    onMapResize: function()
    {
    	this._resizeSearch();
    	//this._resizeHandles();
    },
    /**
     * @since 1.0
     */
    _resizeSearch: function()
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
    createLegendItems: function(sLayer,inRange)
    {
    	var items = [];
    	if(this.hasClassification(sLayer,"basic"))
    	{
    		var iClassifier = this.getDefaultLegendClassifier(sLayer,"basic");
    		var classnames = this.getClassNames(sLayer,iClassifier);
    		if(classnames.length==0)
    		{
    			
   			}
    		else if(classnames.length==1)
    		{
    			items.push(this.createLegendItem({"sLayer":sLayer,"iClassifier":iClassifier,"sClass":classnames[0],"inRange":inRange}));
    		}
    		else
    		{
    			items.push(this.createLegendBreak());
    			items.push(this.createLegendSubHeading(sLayer));
    			for(var i = 0; i < classnames.length; i++)
        		{
        			items.push(this.createLegendItem({"sLayer":sLayer,"iClassifier":iClassifier,"sClass":classnames[i],"inRange":inRange}));
        		}
    		}
    	}
    	else
    	{
    		items.push(this.createLegendItem({"sLayer":sLayer,"inRange":inRange}));
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
   
    createSearchHeading: function()
    {
    	var item = document.createElement('div');
    	item.className = "olControlAdvancedSearchItem olControlAdvancedSearchHeadingContainer";
    	$(item).css("height","auto");
    	var heading = document.createElement('div');
    	heading.className = "olControlAdvancedSearchHeading";
    	$(heading).html("<div><span>Search</span></div>");  	
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
    	if(sType=="ellipse")
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
        		var classMarker =  this.getClassStyleAttribute(sLayer,iClassifier,sClass,"externalGraphic");
        		if(classMarker!=undefined)
        		{
        			marker = classMarker;
        		}
        		else
        		{
        			marker = defaultMarker;
        		}
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
	
	/*---------------------------------------------------- Autocomplete Functions ---------------------------------------------------*/
	onFeatureUnselected: function(f)
	{
		this.clearAutocompleteTarget();
	},
	buildTargetZoom: function(f,map)
    {
    	var targetZoom = undefined;
    	
    	var layer = f.layer;
		
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
    	return targetZoom;
    },
	clearAutocompleteTarget: function()
	{
		this.targetFeature = undefined;
		$(this.searchInput).val("");
		this.validateAutocomplete.apply(this,[this.searchInput]);
	},
	initializeAutocompleteInput: function(element,sType,bUnique,fSortable)
	{
		var jqElement = $(element);
		
		
		if(sType.toLowerCase()=="multiple")
		{
			
		}
		else if(sType.toLowerCase()=="single")
		{
			//Bind Context
			jqElement.data("context",this);
			
			//Bind Events
			jqElement.change(function(event){var c = $(this).data('context'); c.validateAutocomplete.apply(c,[this]);});
			//jqElement.blur(function(event){var c = $(this).data('context'); c.validateAutocomplete.apply(c,[this]);});
			//jqElement.focus(function(event){var c = $(this).data('context'); c.validateAutocomplete.apply(c,[this]);});

			var options = {minLength:0};					
			if(this.bGroup||this.bFold||this.bLimit)
			{
				options.source = function(request,response)
				{
					var c = this.options.control;
					var aSource = $(this.element).data('acSource');
					if(aSource!=undefined)
					{
						response($.ui.autocomplete.filterLayer(aSource,c.bFold?c.fold(request.term):request.term,c.bLimit?c.iLimit:-1));
					}
					else
					{
						response([]);
					}
				};
				options.select = function(event,ui)
				{
					this.value = ui.item.value;
					var c = $(this).data('context');
					var status = c.setFeatureTarget.apply(c,[ui.item.feature]);
					c.setStatus.apply(c,[status]);
					//c.validateAutocomplete.apply(c,[this]);
					return false;
				};
				options.control = this;
				jqElement.autocompleteLayer(options);				
			}
			else
			{
				options.source = function(request,response)
				{
					var aSource = $(this.element).data('acSource');
					if(aSource!=undefined)
					{
						response($.ui.autocomplete.filter(aSource,request.term));
					}
					else
					{
						response([]);
					}
				};
				options.select = function(event,ui)
				{
					this.value = ui.item.value;					
					var c = $(this).data('context');
					c.validateAutocomplete.apply(c,[this]);					
					return false;
				};
				jqElement.autocomplete(options);
			}
		}
	},
	buildAutocompleteLabels: function(feature,layer)
    {
    	var labels = [];
    	for(var i = 0; i < this.acLabels.length; i++)
    	{
    		var field = this.acLabels[i];
    		var value = feature.attributes[""+field];
    		if(CyberGIS.isString(value))
    		{
    			var label = value;
            	if(this.bAppendLayer)
            	{
            		label += " ("+layer.name+")";
            	}
            	labels.push(label);
    		}
    	}
		return labels;
    },
    validateAutocomplete: function(input)
    {
		var jqInput = $(input);
		
		var status = 0;
		var type = $(this).data('ac-multiple')==true?"multiple":"single";
		var line = $.trim(jqInput.val());
		
		if(line=="")
		{
			jqInput.removeData('ac-id');
			status = 0;
		}
		else if(line.match(new RegExp("^(\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)$")))
		{
			jqInput.removeData('ac-id');
			status = 0;
			
			var coord = line.split(",");
			var strLon = coord[1].trim();
			var strLat = coord[0].trim();
			
			var lon = parseFloat(strLon);
			var lat = parseFloat(strLat);
			
			//var lonLat = new OpenLayers.LonLat( lon,lat );
			var selectControl = this.getSelectControl();
			
			var sourceProjection = new OpenLayers.Projection("EPSG:4326");
			var point = new OpenLayers.LonLat(lon,lat);
			var targetLocation = point.transform(sourceProjection, this.map.getProjectionObject());
			
			if(!targetLocation.equals(this.targetLocation))
			{
				this.targetLocation = targetLocation;
				this.targetZoom = null;
				this.targetFeature = null;
				selectControl.focusOnItem.apply(selectControl,[undefined,targetLocation]);
				//$(input).val("");
			}
		}
		else if(line.match(new RegExp("^([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)(\\d{1,2})(\\s*)$")))
		{
			jqInput.removeData('ac-id');
			status = 0;
			
			var coord = line.split(",");
			var strLon = coord[1].trim();
			var strLat = coord[0].trim();
			var strZoom = coord[2].trim();
			
			var lon = parseFloat(strLon);
			var lat = parseFloat(strLat);
			var targetZoom  = parseInt(strZoom,10);
			
			//var lonLat = new OpenLayers.LonLat( lon,lat );
			var selectControl = this.getSelectControl();
			
			var sourceProjection = new OpenLayers.Projection("EPSG:4326");
			var point = new OpenLayers.LonLat(lon,lat);
			var targetLocation = point.transform(sourceProjection, this.map.getProjectionObject());
			
			selectControl.focusOnItem.apply(selectControl,[undefined,targetLocation,targetZoom]);
			
			if((!targetLocation.equals(this.targetLocation))&&(this.targetZoom!=targetZoom))
			{
				this.targetLocation = targetLocation;
				this.targetZoom = targetZoom;
				this.targetFeature = null;
				selectControl.focusOnItem.apply(selectControl,[undefined,targetLocation,targetZoom]);
				//$(input).val("");
			}
		}
		else if(line.match(new RegExp("^(\\s*)zoom(\\s*):(\\s*)(\\d{1,2})(\\s*)$","i"))||line.match(new RegExp("^(\\s*)z(\\s*):(\\s*)(\\d{1,2})(\\s*)$","i")))
		{
			jqInput.removeData('ac-id');
			status = 0;
			
			var lineParts = line.split(":");
			var zoomLevel  = parseInt(lineParts[1],10);
			
			var g = this.map.center;
			
			var selectControl = this.getSelectControl();
			selectControl.focusOnItem.apply(selectControl,[undefined,g,zoomLevel]);
		}
		else
		{
			if(type=="single")
			{
				//var index = $.inArray(line,jqInput.data('acSource'));//{values,label,layerName}
				var index = this.inSource(line,jqInput.data('acSource'));
				if(index!=-1)
				{
					status = this.setFeatureTarget(this.acFeatures[index]);
				}
				else
				{
					jqInput.removeData('ac-id');
					status = -1;
				}
			}
			else //if multiple
			{
				
			}
		}
		this.setStatus(status);
	},
	setFeatureTarget: function(f)
	{
		if(this.targetFeature!=f)
		{
			this.targetLocation = null;
			this.targetZoom = null;
			this.targetFeature = f;
			this.targetZoom = this.buildTargetZoom(f,this.map);
			
			if(this.hasSelectControl())
			{
				var c = f.geometry;				
				var selectControl = this.getSelectControl();							
				selectControl.unFocusAll.apply(selectControl,[true]);				
				selectControl.select.apply(selectControl,[f]);
				selectControl.focusOnItem.apply(selectControl,[f,c,this.targetZoom]);
			}
		}
		return 1;
	},
	fold: function(str)
	{
		return (CyberGIS.Diacritics!=undefined&&CyberGIS.Diacritics.removeDiacritics!=undefined)?CyberGIS.Diacritics.removeDiacritics(str):str;
	},
	setStatus: function(status)
	{
		if(this.currentStatus!=status)
		{
			if(status==1)
			{
				$(this.searchInput).addClass('valid');
				$(this.searchInput).removeClass('invalid');
			}
			else if(status==-1)
			{
				$(this.searchInput).removeClass('valid');
				$(this.searchInput).addClass('invalid');
			}
			else
			{
				$(this.searchInput).removeClass('valid');
				$(this.searchInput).removeClass('invalid');
			}
		}
	},
	inSource: function(line, source)
	{
		var index = -1;
		if(CyberGIS.isArray(source))
		{
			if(this.bGroup)
			{
				//var matcher = new RegExp(CyberGIS.escapeRegex(line), "i" );
				for(var i = 0; i < source.length; i++)
				{
					var a = source[i].values;
					for(var j = 0; j < a.length; j++)
					{
						if(line.toLowerCase()==a[j].toLowerCase())
						{
							index = i;
							break;
						}
					}
					if(index!=-1)
					{
						break;
					}
				}
			}
			else
			{
				index = $.inArray(line,source);
			}
		}
		return index;
	},
	clearTarget: function()
	{
		this.targetLocation = null;
    	this.targetZoom = null;
    	this.targetFeature = null;
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
    CLASS_NAME: "OpenLayers.Control.AdvancedSearch"
});
