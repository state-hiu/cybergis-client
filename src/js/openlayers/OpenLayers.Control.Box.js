OpenLayers.Control.Box = OpenLayers.Class(OpenLayers.Control,
{
	//Singularity Variables
	mainDiv:undefined,
    middle: undefined,
    mainLabel: undefined,
	
    listener: undefined,    
      
    updateDelay: 2000,
    
	animate: true,    
    	
	expandedMaxWidth: 380,
	collapsedMaxWidth: 220,
	padding: 40,
	
    layer: null,
    sLayer: null,
    sBox: null,
    boxData: undefined,
    boxPadding:
    {
    	"vertical": 16,
    	"horizontal":0
    },
    boxWidth: 340,
    boxHeight: 248,
    boxFields: undefined,
   
    isAnimated: function()
	{
		return this.animate;
	},

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
    collapse : function()
    {
    	this.collapseTimer = undefined;
    	if(OpenLayers.Element.hasClass(this.mainDiv,'expanded'))
		{
    		OpenLayers.Element.removeClass(this.mainDiv, "expanded");
		}
    	$(this.mainDiv).stop(true,false);
    	
    	if(this.isAnimated())
		{
        	var m = this.map;
        	var w = Math.min(m.getCurrentSize().w-this.padding,this.getMaxWidth());
        	var marginLeft = (-1*(w/2))-(this.padding/4);
        	$(this.mainDiv).animate({"width":w,"margin-left":marginLeft});
		}
    	else
    	{

    	}
    	
    },
    expand: function()
    {
    	if(!OpenLayers.Element.hasClass(this.mainDiv,'expanded'))
		{
    		OpenLayers.Element.addClass(this.mainDiv, "expanded");
		}
    	$(this.mainDiv).stop(true,false);
    	
    	if(this.isAnimated())
		{
        	var m = this.map;
        	var w = Math.min(m.getCurrentSize().w-this.padding,this.getMaxWidth());
        	var marginLeft = (-1*(w/2))-(this.padding/4);
        	$(this.mainDiv).animate({"width":w,"margin-left":marginLeft});
		}
    	else
    	{

    	}
    	
    },
    setLayer: function(layer)
    {
    	var that = this;
    	this.layer = layer;
    	this.layer.events.register('loadend',this.layer,function()
      	{
			that.refresh.apply(that);
		});
    	this.layer.events.register('featuresadded',this.layer,function()
      	{
			that.refresh.apply(that);
		});
    },
    initialize: function(layer, sLayer, sBox, options)
    {
    	OpenLayers.Control.prototype.initialize.apply(this, [options]);
    	
    	try
    	{
    		this.setLayer(layer);
        	this.sLayer = sLayer;
        	this.sBox = sBox;
        	this.boxData = {};
    	}
    	catch(err)
		{
			console.log(err);
			throw err;
		}
    },
    draw: function()
    {
    	var div = OpenLayers.Control.prototype.draw.apply(this);
    	
    	var middle = document.createElement('div');
        middle.className = "olControlBoxMiddle olControlMiddle";
        
	        var mainLabel = document.createElement('div');
	        mainLabel.className = "olControlBoxLabel";
	        $(mainLabel).data('olControlBox',this);
	        
		        var mainLabelSpan = document.createElement('span');
		        mainLabelSpan.innerHTML = "Box - Click to Open";
		        mainLabel.appendChild(mainLabelSpan);
		    
		    middle.appendChild(mainLabel);
        
	        var boxContainer = document.createElement('div');
	        boxContainer.className = "olControlBoxContainer";
	        
	        	var boxHeading = this.createBoxHeading();
	        	$(boxHeading).data('olControlBox',this);
	        	$(boxHeading).click(function(){var box = $(this).data('olControlBox');box.onBoxHeadingClick.apply(box);});
	        	boxContainer.appendChild(boxHeading);
	        	
	        	this.boxFields = this.createBoxFields();
	        	for(var i = 0; i < this.boxFields.length; i++)
	        	{
		        	boxContainer.appendChild(this.boxFields[i]);
	        	}	        	
	        	        
	        middle.appendChild(boxContainer);
        
        div.appendChild(middle);
        
        this.mainDiv = div;
        
        $(mainLabel).click(function(){var box = $(this).data('olControlBox');box.onMainLabelClick.apply(box);});

        return div;
    },
    refresh: function()
    {
    	this.refreshBoxData();
    	this.refreshBoxFields();
    },
    refreshBoxData: function()
    {
    	if(CyberGIS.isString(this.sLayer)&&CyberGIS.isString(this.sBox))
    	{
        	var newBoxData = {};
    		var tasks = CyberGIS.getJSON(["layers",this.sLayer,"boxes",this.sBox,"tasks"],this.carto);
        	if(tasks!=undefined)
        	{
            	for(var i = 0; i < tasks.length; i++) 
        		{
        			var task = tasks[i];
            		var output = this.calc(task,this.layer); 
            		newBoxData[""+task.output] = output;
        		}
        	}
        	this.boxData = newBoxData;
    	}
    	else
    	{
    		this.boxData = {};
    	}
    	return this.boxData;
    },
    refreshBoxFields: function()
    {
    	if(CyberGIS.isArray(this.boxFields))
    	{
    		for(var i = 0; i < this.boxFields.length; i++)
        	{
        		var boxField = this.boxFields[i];
        		this.refreshBoxField(boxField,$(boxField).data('boxField'));
        	}
    	}	   
    },
    refreshBoxField: function(boxFieldElement,boxFieldObject)
    {
    	if(boxFieldElement!=undefined)
    	{
    		if(boxFieldObject!=undefined)
        	{
    			if(CyberGIS.isString(boxFieldObject.name))
    			{
    				var sValue = "";
    		    	if(this.boxData[""+boxFieldObject.name]!=undefined)
    		    	{
    		    		sValue = this.formatValue(this.boxData[""+boxFieldObject.name],boxFieldObject.type,boxFieldObject.format);
    		    	}
    		    	else
    		    	{
    		    		sValue = "Not given";
    		    	}
        	    	$(".olControlBoxItemValue",boxFieldElement).html("<span>"+sValue+"</span>");
    			}
    			else
    			{
        			$(".olControlBoxItemValue",boxFieldElement).html("<span>Not given</span>");	
    			}
        	}
    		else
    		{
    	    	$(".olControlBoxItemValue",boxFieldElement).html("<span>Not given</span>");
    		}
    	}    	
    },
    calc: function(task,layer)
    {
    	if(task.op=="concat")
    	{
    		//this.calc_concat(feature,task.output,task.input,task.where);
    	}
    	else if(task.op=="count")
    	{
    		//return this.calc_count(layer,task.where);
    	}
    	else if(task.op=="sum")
    	{
    		return this.calc_sum(layer.features,task.input,task.where);
    	}
    	else if(task.op=="min")
    	{
    		//this.calc_min(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="max")
    	{
    		//this.calc_max(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="avg")
    	{
    		//this.calc_avg(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="strip_fields")
    	{
    		//this.calc_strip_fields(feature,task.fields,task.characters);
    	}
    	else if(task.op=="strip_array")
    	{
    		//this.calc_strip_array(feature,aData,task.array_input,task.array_output,task.fields,task.field_input,task.field_output,task.characters);
    	}
    	else if(task.op=="first")
    	{
    		return this.calc_first(layer.features,task.input,task.where);
    	}
    },
    calc_sum: function(features,input,w)
    {
    	var sum = 0;
    	if(w!=undefined)
    	{
    		if(w.op=="="||w.op=="==")
			{
    			for(var i = 0; i < features.length; i++)
            	{
            		var a = features[i].attributes;
    				if(a[""+w.field]==w.value)
            		{
            			sum += parseInt(a[""+input]);	
            		}
            	}
			}
			else if(w.op=="!="||w.op=="<>")
			{
				for(var i = 0; i < features.length; i++)
            	{
					var a = features[i].attributes;
					if(a[""+w.field]!=w.value)
	        		{
	        			sum += parseInt(a[""+input]);	
	        		}
            	}
			}
			else if(w.op=="not in"||w.op=="notin"||w.op=="not_in")
			{
				for(var i = 0; i < features.length; i++)
            	{
					var a = features[i].attributes;
					if($.inArray(a[""+w.field],w.values)==-1)
	        		{
	        			sum += parseInt(a[""+input]);
	        		}
            	}
			}
			else
			{
				for(var i = 0; i < features.length; i++)
	        	{
					var a = features[i].attributes;
					sum += parseInt(a[""+input]);
	        	}
			}
    	}
    	else
    	{
        	for(var i = 0; i < features.length; i++)
        	{
        		var a = features[i].attributes;
        		sum += parseInt(a[""+input]);
        	}
    	}
    	return sum;
    },
    calc_first: function(features,input,w)
    {
    	var first = undefined;
    	if(features.length>0)
    	{
    		if(w!=undefined)
        	{
        		if(w.op=="="||w.op=="==")
    			{
        			for(var i = 0; i < features.length; i++)
                	{
                		var a = features[i].attributes;
        				if(a[""+w.field]==w.value)
                		{
    						first = a[""+input];
    						break;
                		}
                	}
    			}
    			else if(w.op=="!="||w.op=="<>")
    			{
    				for(var i = 0; i < features.length; i++)
                	{
    					var a = features[i].attributes;
    					if(a[""+w.field]!=w.value)
    	        		{
    						first = a[""+input];
    						break;
    	        		}
                	}
    			}
    			else if(w.op=="not in"||w.op=="notin"||w.op=="not_in")
    			{
    				for(var i = 0; i < features.length; i++)
                	{
    					var a = features[i].attributes;
    					if($.inArray(a[""+w.field],w.values)==-1)
    	        		{
    						first = a[""+input];
    						break;
    	        		}
                	}
    			}
    			else
    			{
    				first = features[0].attributes[""+input];
    			}
        	}
        	else
        	{
        		first = features[0].attributes[""+input];
        	}
    	}    	
    	return first;
    },
    onBoxHeadingClick: function()
    {
    	if(this.isAnimated())
		{
    		this.expand();
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
    onMapResize: function()
    {
    	
    },
    getMaximumboxWidth: function(mapWidth)
    {
    	var boxWidth = 340;
    	if(mapWidth!=undefined)
    	{
    		if(mapWidth>1000)
        	{
        		boxWidth = 340;
        	}
        	else
        	{
        		boxWidth = 240;
        	}
    	}	
    	return boxWidth;
    },    
    getMaximumboxHeight: function(mapHeight)
    {
    	var boxHeight = 248;
    	if(mapHeight!=undefined)
    	{
    		if(mapHeight>700)
        	{
        		boxHeight = 248;
        	}
        	else if(mapHeight>360)
        	{
        		boxHeight = 168;
        	}
        	else
        	{
        		boxHeight = 138;
        	}
    	}
    	return boxHeight;
    },
    createBoxHeading: function()
    {
    	var sTitle = CyberGIS.getJSON(["layers",this.sLayer,"boxes",this.sBox,"title"],this.carto);
    	//////////////////////
    	var item = document.createElement('div');
    	item.className = "olControlBoxItem";
    	var heading = document.createElement('div');
    	heading.className = "olControlBoxHeading";
    	$(heading).html("<div><span>"+sTitle+"</span></div>");  	
    	item.appendChild(heading);
    	return item;
    },
    createBoxFields: function()
    {
    	var boxFields = CyberGIS.getJSON(["layers",this.sLayer,"boxes",this.sBox,"fields"],this.carto);
    	//////////////////////
    	var elements = [];
    	if(CyberGIS.isArray(boxFields))
    	{
    		for(var i = 0; i < boxFields.length; i++)
        	{
    			elements.push(this.createBoxField(boxFields[i]));
        	}
    	}   	
    	return elements;
    },
    createBoxField: function(boxField)
    {
    	var item = document.createElement('div');
    	item.className = "olControlBoxItem";
    	$(item).data('olControlBox',this);
    	$(item).data('boxField',boxField);
    	if(boxField.label!=undefined)
    	{
    		item.appendChild(this.createBoxFieldLabel(boxField));
    	}
    	if(boxField.name!=undefined)
    	{
    		item.appendChild(this.createBoxFieldValue(boxField));
    	}
    	return item;
    },
    createBoxFieldLabel: function(boxField)
    {
    	var sLabel = boxField.label || "";
    	var label = document.createElement('div');
    	label.className = "olControlBoxItemLabel";
    	$(label).html("<span>"+sLabel+":</span>");
    	return label;
    },
    createBoxFieldValue: function(boxField)
    {
    	var sValue = "";
    	if(this.boxData[""+boxField.name]!=undefined)
    	{
    		sValue = this.formatValue(this.boxData[""+boxField.name],boxField.type,boxField.format);
    	}
    	else
    	{
    		sValue = "Not given";
    	}
    	
    	var value = document.createElement('div');
    	value.className = "olControlBoxItemValue";
    	$(value).html("<span>"+sValue+"</span>");
    	return value;
    },
    formatValue: function(value,type,format)
    {
    	if(type=="integer"||type=="int")
		{
			if(format==1)
			{
				return CyberGIS.Number.formatInteger(value);
			}
			else if(format==2)
			{
				return CyberGIS.Number.formatInteger2(value);
			}
			else if(format==3)
			{
				return CyberGIS.Number.formatInteger3(value);
			}
			else
			{
				return CyberGIS.Number.formatInteger(value);
			}
		}
		else
		{
			return value;
		}
    },
    
    
    
    destroy: function()
    {
    },
    CLASS_NAME: "OpenLayers.Control.Box"
});
