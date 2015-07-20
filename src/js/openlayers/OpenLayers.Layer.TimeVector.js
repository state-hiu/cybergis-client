OpenLayers.Layer.TimeVector = OpenLayers.Class(OpenLayers.Layer.Vector,
{
	time_type: undefined,
	time_property: undefined,
	time_property_start: undefined,
	time_property_end: undefined,
	time_state: undefined,

	isDateObject: function(d)
	{
		return Object.prototype.toString.call(d) === "[object Date]";
	},
	isDateNumbered_Full: function(d)
	{
		var reg = new RegExp("^\\d{8}$","gi");
		return reg.test(d);
	},
	isDateNumbered_Short: function(d)
	{
		var reg = new RegExp("^\\d{6}$","gi");
		return reg.test(d);
	},
	isDateSplit: function(d)
	{
		var reg = new RegExp("^\\d{2,4}[-]\\d{1,2}[-]\\d{1,2}$","gi");
		return reg.test(d);
	},
	isDateSplit_Full: function(d)
	{
		var reg = new RegExp("^\\d{4}[-]\\d{2}[-]\\d{2}$","gi");
		return reg.test(d);
	},
	isDateSplit_Short: function(d)
	{
		var reg = new RegExp("^\\d{2}[-]\\d{2}[-]\\d{2}$","gi");
		return reg.test(d);
	},
	cleanDateString: function(d)
	{
		var str = "";
		if(this.isDateObject(d))
		{
			str = d.getFullYear()+"-"+((d.getMonth()<9)?("0"+(d.getMonth()+1)):(d.getMonth()+1))+"-"+((d.getDate()<10)?("0"+d.getDate()):d.getDate());
		}
		else if(this.isDateNumbered_Full(d))
		{
			str = d.substring(0,4)+"-"+d.substring(4,6)+"-"+d.substring(6);
		}
		else if(this.isDateNumbered_Short(d))
		{
			var year = parseInt(d.substring(0,2),10);
			year = (year<20)?(2000+year):(1900+year);
			str = year+"-"+d.substring(2,4)+"-"+d.substring(4);
		}
		else if(this.isDateSplit(d))
		{
			if(this.isDateSplit_Full(d))
			{
				str = d;
			}
			else if(this.isDateSplit_Short(d))
			{
				var a = d.split(",");
				var iYear = parseInt(a[0],10);
				iYear = (iYear<20)?(2000+iYear):(1900+iYear);				
				var iMonth = parseInt(a[1],10);
				var iDate = parseInt(a[2],10);
				str = iYear+"-"+((iMonth<9)?("0"+(iMonth+1)):(iMonth+1))+"-"+((iDate<10)?("0"+iDate):iDate);		
			}
		}
		return str;
	},
	getTimeType: function()
	{
		return this.time_type;
	},
	isTime: function()
	{
		return this.getTimeType()!=undefined;
	},	
	isSingle: function()
	{
		return this.getTimeType()=="single";
	},
	isRange: function()
	{
		return this.getTimeType()=="range";
	},
	getTimeProperty: function()
	{
		return this.isSingle()?this.time_property:undefined;
	},
	getTimeStartProperty: function()
	{
		return this.isRange()?this.time_property_start:undefined;
	},
	getTimeEndProperty: function()
	{
		return this.isRange()?this.time_property_end:undefined;
	},	
	refreshTimeFilter: function(state)
	{
		this.filter = this.getTimeFilter(state);
		this.refresh({force: true});
	},
	getTimeFilter: function(state)
    {
    	var filter = undefined;
    	if(this.isTime())
    	{
    		if(state!=undefined)
        	{
        		if(state.date!=undefined)
            	{
            		var d = this.cleanDateString(state.date);
        			if(this.isSingle())
            		{
            			filter = new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.EQUAL_TO, property: this.getTimeProperty(), value: d});
            		}
            		else if(this.isRange())
            		{
            			filter = new OpenLayers.Filter.Logical
            			({
            				type: OpenLayers.Filter.Logical.AND,
            				filters:
            				[
								new OpenLayers.Filter.Logical
								({
									type: OpenLayers.Filter.Logical.OR,
									filters:
									[
									 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.IS_NULL, property: this.getTimeStartProperty()}),
									 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO, property: this.getTimeStartProperty(), value: d})
								    ]
								}),
								new OpenLayers.Filter.Logical
		            			({
		            				type: OpenLayers.Filter.Logical.OR,
		            				filters:
		            				[
		            				 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.IS_NULL, property: this.getTimeEndProperty()}),
		            				 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO, property: this.getTimeEndProperty(), value: d})
		            			    ]
		            			})
            			    ]
            			});
            		}
            	}
            	else if(state.start!=undefined)
            	{
            		var start = this.cleanDateString(state.start);
            		var end = this.cleanDateString(state.end);
            		if(this.isSingle())
            		{
            			filter = new OpenLayers.Filter.Comparison
        				({
        					type: OpenLayers.Filter.Comparison.BETWEEN,
        					property: "entered",
        					lowerBoundary: start,
        					upperBoundary: end
        				});
            		}
            		else if(this.isRange())
            		{
            			filter = new OpenLayers.Filter.Logical
            			({
            				type: OpenLayers.Filter.Logical.AND,
            				filters:
	            			[
								new OpenLayers.Filter.Logical
								({
									type: OpenLayers.Filter.Logical.OR,
									filters:
									[
									 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.IS_NULL, property: this.getTimeStartProperty()}),
									 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO, property: this.getTimeStartProperty(), value: end})
								    ]
								}),
								new OpenLayers.Filter.Logical
		            			({
		            				type: OpenLayers.Filter.Logical.OR,
		            				filters:
		            				[
		            				 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.IS_NULL, property: this.getTimeEndProperty()}),
		            				 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO, property: this.getTimeEndProperty(), value: start})
		            			    ]
		            			})
							]
            			});
            		}
            	}
        	}
    	}    	
    	return filter;
    },   
    initialize: function(name, options)
    {
    	options.filter = (options.time_state!=undefined)?this.init_filter(options):undefined;
    	OpenLayers.Layer.Vector.prototype.initialize.apply(this, arguments);        
    },
    init_filter: function(options)
    {
    	var filter = undefined;
    	var pType = options.time_type;
    	if(pType!=undefined)
    	{
        	var pDate = options.time_property;
        	var pStart = options.time_property_start;
        	var pEnd = options.time_property_end;
        	var pState = options.time_state;
        	
    		if(pState!=undefined)
        	{
        		if(pState.date!=undefined)
            	{
            		var vDate = this.cleanDateString(pState.date);
        			if(pType=="single")
            		{
            			filter = new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.EQUAL_TO, property: pDate, value: vDate});
            		}
            		else if(pType=="range")
            		{
            			filter = new OpenLayers.Filter.Logical
            			({
            				type: OpenLayers.Filter.Logical.AND,
            				filters:
            				[
								new OpenLayers.Filter.Logical
								({
									type: OpenLayers.Filter.Logical.OR,
									filters:
									[
									 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.IS_NULL, property: pStart}),
									 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO, property: pStart, value: vDate})
								    ]
								}),
								new OpenLayers.Filter.Logical
		            			({
		            				type: OpenLayers.Filter.Logical.OR,
		            				filters:
		            				[
		            				 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.IS_NULL, property: pEnd}),
		            				 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO, property: pEnd, value: vDate})
		            			    ]
		            			})
            			    ]
            			});
            		}
            	}
            	else if(pState.start!=undefined)
            	{
            		var vStart = this.cleanDateString(pState.start);
            		var vEnd = this.cleanDateString(pState.end);
            		if(pType=="single")
            		{
            			filter = new OpenLayers.Filter.Comparison
        				({
        					type: OpenLayers.Filter.Comparison.BETWEEN,
        					property: "entered",
        					lowerBoundary: vStart,
        					upperBoundary: vEnd
        				});
            		}
            		else if(pType=="range")
            		{
            			filter = new OpenLayers.Filter.Logical
            			({
            				type: OpenLayers.Filter.Logical.AND,
            				filters:
	            			[
								new OpenLayers.Filter.Logical
								({
									type: OpenLayers.Filter.Logical.OR,
									filters:
									[
									 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.IS_NULL, property: pStart}),
									 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO, property: pStart, value: vEnd})
								    ]
								}),
								new OpenLayers.Filter.Logical
		            			({
		            				type: OpenLayers.Filter.Logical.OR,
		            				filters:
		            				[
		            				 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.IS_NULL, property: pEnd}),
		            				 	new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO, property: pEnd, value: vStart})
		            			    ]
		            			})
							]
            			});
            		}
            	}
        	}
    	}
    	return filter;
    },
    CLASS_NAME: "OpenLayers.Layer.TimeVector"
});
