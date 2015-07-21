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
OpenLayers.Control.AdvancedChart = OpenLayers.Class(OpenLayers.Control,
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
	timeValue: undefined,
	timeValues: undefined, //Not implemented Yet, Only for Date Ranges
	minDate: undefined,
	minTime: undefined,
	maxDate: undefined,
	maxTime: undefined,
	days: undefined,
	
	expandedMaxWidth: 380,
	collapsedMaxWidth: 220,
	padding: 40,
		
    layer: null,//OpenLayers.Layer.TimeVector
    //field_label: null,//Name of numeric field that is being visualized
    //field_value: null,//Name of numeric field that is being visualized
    
    //D3 Variables
    chartTitle: "Syrians in Need of Assistance",
    //"<span>E*: Egypt &amp; North Africa (Algeria, Libya, Morocco, and Tunisia)</span>"
    chartNotes:
    [
     "<span>North Africa: Algeria, Libya, Morocco, and Tunisia</span>"
    ],
    chartData: undefined,
    chartPadding:
    {
    	"vertical": 16,
    	"horizontal":0
    },
    chartWidth: 340,
    chartHeight: 248,
    outerRadius: undefined,//height/2
    innerRadius: undefined,//0
    labelRadius: undefined,
    chartItem: undefined,
    chartCanvas: undefined,
    chartScale: undefined,
    labelAngleMinimum: 0.2,
    
    
    
    svg: undefined,
    pie: undefined,
    paths: undefined,
    chartTotal: undefined,
    chartDate: undefined,
    
    /*arcTween: function(a)
    {
		var i = d3.interpolate(this._current, a);
		this._current = i(0);
		return function(t)
		{
			return arc(i(t));
		};
	},
	pie_update: function ()
	{
		var value = this.value;
		
		pie.value(function(d) { return d.value; });
		
		var arcs = svg.selectAll("g.arc")
			.data(pie);
			
		arcs.transition()
			.duration(500)
			.attrTween("d", arcTween);
	},*/
    
    
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
    formatTotalValue: function()
    {
    	return this.formatNumber1(this.getTotalValue());
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
    formatNumber1: function(n)
    {
    	var str = ""+n;
    	var pattern = new RegExp('(\\d+)(\\d{3})','gi');
    	while(pattern.test(str)){str=str.replace(pattern,'$1'+','+'$2');}
    	return str;
    },
    formatNumber2: function(n,base)
    {
    	if(base==1000||base==10000||base==100000)
    	{
    		var d = n/1000;
    		var str = ""+d;
    		var pattern = new RegExp('(\\d+)(\\d{3})','gi');
    		while(pattern.test(str)){str=str.replace(pattern,'$1'+','+'$2');}
    		return str+"K";
    	}
    	else
    	{
    		var str = ""+n;
    		var pattern = new RegExp('(\\d+)(\\d{3})','gi');
    		while(pattern.test(str)){str=str.replace(pattern,'$1'+','+'$2');}
    		return str;
    	}
    },
    formatPercent: function(numerator, denominator, precision, mod)
    {
    	var str = "";
    	if(numerator!=undefined&&denominator!=undefined)
    	{
    		if(precision==undefined||precision<0)
    		{
    			str = ""+(100*numerator/denominator)+"%";
    		}
    		else
    		{
    			if(precision==0)
    			{
    				if(mod==undefined||mod==1)//Integer
    				{
    					str = ""+parseInt(100*numerator/denominator)+"%"; 
    				}
    				else
    				{
    					str = ""+parseInt(100*numerator/denominator)-(parseInt(100*numerator/denominator)%mod)+"%";
    				}
    			}
    			else
    			{
    				str = (100*numerator/denominator).toFixed(precision)+"%"; 
    			}
    		}
    	}
    	return str;
    },
    /**
     * @since 1.0
     * @param date
     * @param updateUI
     */
    setCurrentDate: function(date)
    {
    	_setCurrentDate(date);
    },
    /**
     * @since 1.0
     * @param start
     * @param end
     * @param updateUI
     */
    setCurrentDateRange: function(start,end)
    {
    	_setCurrentDateRange(start,end);
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
    	this.timeValue = Math.floor((this.currentTime-this.minTime)/86400000);
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
    	this.timeValues = [startValue,endValue];
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
    	this.timeValues[0] = startValue;
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
    	this.timeValues[1] = endValue;
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
    getTimeValue: function()
    {
    	return this.timeValue;
    },
    /**
     * @since 1.0
     * @returns
     */
    getStartTimeValue: function()
    {
    	return this.timeValues[0];
    },
    /**
     * @since 1.0
     * @returns
     */
    getEndTimeValue: function()
    {
    	return this.timeValues[1];
    },
    /**
     * @since 1.0
     * @returns {Array}
     */
    getTimeValues: function()
    {
    	return this.timeValues;
    },
    getTotalValue: function()
    {
    	var total = 0;
    	if(this.layer!=undefined)
    	{
        	var fValue = this.getValueField(this.sLayer,this.sChart);
        	
    		for(var i = 0; i < this.layer.features.length; i++)
    		{
    			var f = this.layer.features[i];
    			if(f.attributes[""+fValue]!=undefined)
    			{
    				var sValue = f.attributes[""+fValue];
    				var nValue = parseInt(sValue,10);
    				total += nValue;
    			}
    		}
    	}
    	return total;  
    },
    refreshChartData: function()
    {
    	/*	  chartDataset:
		    [
		     {"name":"E*","poc":83267,"percent":"5"},
		     {"name":"Lebanon","poc":495776,"percent":"31"},
		     {"name":"Jordan","poc":491912,"percent":"31"},
		     {"name":"Turkey","poc":377154,"percent":"23"},
		     {"name":"Iraq","poc":153976,"percent":"10"},
		    ],*/
    	if(this.check_defined([this.sLayer,this.sChart]))
    	{
    		var fLabel = this.getLabelField(this.sLayer,this.sChart);
        	var fValue = this.getValueField(this.sLayer,this.sChart);
        	
        	var total = this.getTotalValue();
        	
        	var newChartData = [];
        	if(this.layer!=undefined)
        	{
    	    	for(var i = 0; i < this.layer.features.length; i++)
    			{
    				var f = this.layer.features[i];
    				
    				var sLabel = f.attributes[""+fLabel];
    				
    				var nValue = undefined;
    				if(f.attributes[""+fValue]!=undefined)
        			{
        				var sValue = f.attributes[""+fValue];
        				nValue = parseInt(sValue,10);
        			}
    				
    				var obj = {};
    				obj[""+fLabel] = sLabel;
    				obj[""+fValue] = nValue;
    				obj["percent"]= Math.floor((nValue / total)*100);
    				newChartData.push(obj);
    			}
    		}
        	this.chartData = newChartData;
    	}
    	else
    	{
    		this.chartData = [];
    	}
    	return this.chartData;
    },
    refreshChartScale: function()
    {
    	//var fValue = this.getValueField(this.sLayer,this.sChart);
    	if(this.check_defined([this.sLayer,this.sChart]))
    	{
    		var rBar = this.getBarRange(this.sLayer,this.sChart);
        	this.chartScale = d3.scale.linear().domain(rBar).rangeRound([this.chartHeight-(this.chartPadding.vertical*2), 0]);
        	return this.chartScale;
    	}
    	else
    	{
    		this.chartScale = undefined;
    		return this.chartScale;
    	}
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
     */
  
    /**
     * @since 1.0
     * @param minDate
     * @param maxDate
     */
    setDateRange: function(minDate,maxDate)
    {
    	this.minDate = minDate;
    	this.minTime = minDate.getTime();
    	
    	this.maxDate = maxDate;
    	this.maxTime = maxDate.getTime();
    	
    	this.days = Math.floor(((this.maxTime-this.minTime)/86400000)+1);//Floor truncates in case of daylight savings time changeover.
    },

    
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
    		//this._resizeSlider();
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
    		//this._resizeSlider();
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
    },
    
   
    /**
     * @since 1.0
     * @param layers
     * @param options
     */
    initialize: function(layer, sLayer, sChart, options)
    {
    	var that = this;
    	OpenLayers.Control.prototype.initialize.apply(this, [options]);
    	
    	try
    	{
    		this.setLayer(layer);
        	this.sLayer = sLayer;
        	this.sChart = sChart;
        	this.initializeDateRange();
            this.initializeCurrentDate();
            var fValue = this.getValueField(this.sLayer,this.sChart);
            if(typeof d3 !== "undefined")
            {
            	this.pie = d3.layout.pie().value(function(d)
            	{
            		return d[""+fValue];
            	});
            	
             	
             	this.outerRadius = Math.min
            	(
            		(this.chartWidth-70-10-(this.chartPadding.horizontal*2)),
            		(this.chartHeight-(this.chartPadding.vertical*2))
            	)/2;
             	
             	this.innerRadius = 0;
                this.labelRadius = this.outerRadius+4;
                this.arc = d3.svg.arc().innerRadius(this.innerRadius).outerRadius(this.outerRadius);
            }
    	}
    	catch(err)
		{
			console.log(err);
			throw err;
		}
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
        middle.className = "olControlAdvancedChartMiddle olControlMiddle";
        
	        var mainLabel = document.createElement('div');
	        mainLabel.className = "olControlAdvancedChartLabel";
	        $(mainLabel).data('olControlAdvancedChart',this);
	        
		        var mainLabelSpan = document.createElement('span');
		        mainLabelSpan.innerHTML = "Chart - Click to Open";
		        mainLabel.appendChild(mainLabelSpan);
		    
		    middle.appendChild(mainLabel);
        
	        var chartContainer = document.createElement('div');
	        chartContainer.className = "olControlAdvancedChartContainer";
	        
	        	var chartHeading = this.createChartHeading();
	        	$(chartHeading).data('olControlAdvancedChart',this);
	        	$(chartHeading).click(function(){var chart = $(this).data('olControlAdvancedChart');chart.onChartHeadingClick.apply(chart);});
	        	chartContainer.appendChild(chartHeading);  
	        	
	        	var chartSubHeading = this.createChartTitle(this.chartTitle);
	        	$(chartSubHeading).data('olControlAdvancedChart',this);
	        	chartContainer.appendChild(chartSubHeading);
	        	
	        	this.chartItem = this.createChartItem();
	        	$(this.chartItem).data('olControlAdvancedChart',this);
	        	chartContainer.appendChild(this.chartItem);
	        	
	        	if(typeof d3 !== "undefined")
	        	{
	        		this.chartCanvas = this.createChartCanvas(this.chartItem);
		        	
		        	this.refreshChartData();
		        	this.refreshChartScale();
		        	this.createBarChart(this.chartCanvas);
		        	this.createPieChart(this.chartCanvas);
	        	}
	        	
	        	this.chartTotal = this.createChartTotal();
        		$(this.chartTotal).data('olControlAdvancedChart',this);
	        	chartContainer.appendChild(this.chartTotal);
	        	
	        	this.chartDate = this.createChartDate();
        		$(this.chartDate).data('olControlAdvancedChart',this);
	        	chartContainer.appendChild(this.chartDate);
	        	
	        	var chartNotes = this.createChartNotes(this.chartNotes);
	        	for(var i = 0; i < chartNotes.length; i++)
	        	{
	        		var chartNote = chartNotes[i];
	        		$(chartNote).data('olControlAdvancedChart',this);
		        	chartContainer.appendChild(chartNote);
	        	}
	        	        
	        middle.appendChild(chartContainer);
        
        div.appendChild(middle);
        
        this.mainDiv = div;
        
        
        $(mainLabel).click(function(){var chart = $(this).data('olControlAdvancedChart');chart.onMainLabelClick.apply(chart);});

        return div;
    },
   
    refresh: function()
    {
    	this.refreshChartDate();
    	this.refreshChartTotal();
    	this.refreshChartData();
    	this.refreshChartScale();
    	this.refreshBarChart();
    	this.refreshPieChart();
    },
    refreshBarChart: function()
    {
    	//$(this.barChart).html("");
    	
    	//this.arc = d3.svg.arc().innerRadius(this.innerRadius).outerRadius(this.outerRadius);
		//d3.select(this.barChart).append("svg").attr("width", this.chartWidth).attr("height", this.chartHeight);
		
		//var data = this.refreshChartData();
		//this.appendPieChartPaths(this.pieChart,this.arc,data);
		
		var total = this.getTotalValue();
		this.chartCanvas.selectAll("rect").transition().attr("y", this.chartScale(total)).attr("height", this.chartScale(0) - this.chartScale(total));
    },
    refreshPieChart: function()
    {
    	//$(this.pieChart).html("");
    	
    	//this.arc = d3.svg.arc().innerRadius(this.innerRadius).outerRadius(this.outerRadius);
		//d3.select(this.pieChart).append("svg").attr("width", this.chartWidth).attr("height", this.chartHeight);
		
		//var data = this.refreshChartData();
    	
    	
    	
    	var gPie = this.chartCanvas.selectAll("g.pie");
    	gPie.selectAll("g.arc, g.label").data([]).exit().remove();
		this.appendPieChartPaths(this.chartCanvas,gPie,this.arc,this.chartData);
		this.appendPieChartLabels(this.chartCanvas,gPie,this.arc,this.chartData);
    },
    refreshChartDate: function()
    {
    	var str = "<span style=\"font-weight:700;\">Date:</b> </span><span>"+this.formatCurrentDate("label")+"</span>";
    	$(".olControlAdvancedChartDate",this.chartDate).html("<span>"+str+"</span>");
    },
    refreshChartTotal: function()
    {
    	var str = "<span>Total:</b> </span><span>"+this.formatTotalValue()+"</span>";
    	$(".olControlAdvancedChartTotal",this.chartTotal).html("<span>"+str+"</span>");
    },
    onChartHeadingClick: function()
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
    /**
     * @since 1.0
     */
    onMapResize: function()
    {
    	this._resizeCanvas(true);
    },
    /**
     * @since 1.0
     */
    _resizeCanvas: function(animate)
    {
    	var mapWidth = this.map.getCurrentSize().w;
    	var mapHeight = this.map.getCurrentSize().h;
    	
    	var chartWidth = this.getMaximumChartWidth(mapWidth);
    	var chartHeight = this.getMaximumChartHeight(mapHeight);

    	var that = this;
    	var total = this.getTotalValue();
    	
    	var oldChartWidth = this.chartWidth;
    	var oldChartHeight = this.chartHeight;
    	var chartGap = this.getChartGap(undefined);
    	var oldBarY = this.chartScale(total);
    	var oldBarHeight = this.chartScale(0) - this.chartScale(total);
    	
    	this.chartWidth = chartWidth;
    	this.chartHeight = chartHeight;
    	    	
    	var chartScale = this.refreshChartScale();
    	
    	//chartHeight = chartWidth = Math.min(chartWidth,chartHeight);
    	
    	this.outerRadius = Math.min
    	(
    		(this.chartWidth-70-this.getChartGap(mapWidth)-(this.chartPadding.horizontal*2)),
    		(this.chartHeight-(this.chartPadding.vertical*2))
    	)/2;
        this.innerRadius = 0;
        this.labelRadius = this.outerRadius+4;
        
        //d3.select(this.pieChart).select("svg").attr("width", this.chartWidth).attr("height", this.chartHeight);
        //d3.select(this.pieChart).select("svg").attr({"width":240,"height":240});
        
        if(animate)
        {
        	this.chartCanvas.selectAll("g.bar g.y.axis").remove();
        	this.chartCanvas.selectAll("g.bar").append("g").attr("class", "y axis").call(d3.svg.axis().scale(this.chartScale).orient("left"));
        	
        	var tSVG = this._resizeSVG(oldChartWidth,that.chartWidth,oldChartHeight,that.chartHeight);
        	var tBar = this._resizeBar(oldBarY,that.chartScale(total),oldBarHeight,that.chartScale(0) - that.chartScale(total),tSVG);
        	var tPie = this._resizePie(oldChartWidth,that.chartWidth,oldChartHeight,that.chartHeight,this.arc.outerRadius()(),this.outerRadius,this.getChartGap(undefined),this.arc,this.labelAngleMinimum,this.labelRadius,tSVG);
        	
        }
        else
        {
        	  this.arc = d3.svg.arc().innerRadius(this.innerRadius).outerRadius(this.outerRadius);
        	  this.refreshChartScale();
        	  this.refreshBarChart();
        }  
    	
    	
    },
    getChartGap: function(mapWidth)
    {
    	return 10;
    },
    getMaximumChartWidth: function(mapWidth)
    {
    	var chartWidth = 340;
    	if(mapWidth!=undefined)
    	{
    		if(mapWidth>1000)
        	{
        		//chartWidth = 248;
        		chartWidth = 340;
        	}
        	else
        	{
        		//chartWidth = 168;
        		chartWidth = 240;
        	}
    	}	
    	return chartWidth;
    },
    
    getMaximumChartHeight: function(mapHeight)
    {
    	var chartHeight = 248;
    	if(mapHeight!=undefined)
    	{
    		if(mapHeight>700)
        	{
        		chartHeight = 248;
        	}
        	else if(mapHeight>360)
        	{
        		chartHeight = 168;
        	}
        	else
        	{
        		chartHeight = 138;
        	}
    	}
    	return chartHeight;
    },
    _resizeSVG: function(w0,w1,h0,h1)
    {
    	var tSVG = this.chartCanvas.data(this.chartData).transition().delay(300).duration(500).tween("dims", function(d, i, a)
    	{
         	var w = d3.interpolate(w0, w1);
         	var h = d3.interpolate(h0, h1);
         	return function(t)
         	{
         		var wt = w(t);
         		var ht = h(t);
         		d3.select(this).attr({"width":wt, "height": ht});
         	};
    	});
    	return tSVG;
    },
    _resizeBar: function(y0,y1,h0,h1,tSVG)
    {
    	var tBar = tSVG.selectAll("g.bar rect").tween("dims", function(d, i, a)
    	{
         	var y = d3.interpolate(y0,y1);
         	var h = d3.interpolate(h0,h1);
         	return function(t)
         	{
         		var yt = y(t);
         		var ht = h(t);
         		d3.select(this).attr({"y":yt, "height": ht});
         	};
    	});
    	return tBar;
    },
    _resizePie: function(w0,w1,h0,h1,r0,r1,chartGap,arc,labelAngleMinimum,labelRadius,tSVG)
    {
    	tSVG.selectAll("g.pie").attrTween("transform", function(d, i, a)
    	{
    		var r = d3.interpolate(r0, r1);
    		var w = d3.interpolate(w0, w1);
         	var h = d3.interpolate(h0, h1);
         	return function(t)
         	{
         		var rt = r(t);
         		var wt = w(t);
         		var ht = h(t);
         		
         		return "translate("+(70+chartGap+rt)+","+(ht/2)+")";
         	};
    	})
    	.selectAll("g.arc path").attrTween("d", function(d, i, a)
    	{
    		var j = d3.interpolate(this._current, d);
         	var k = d3.interpolate(r0, r1);
         	this._current = j(0);
         	
         	return function(t)
         	{
         		return arc.outerRadius(k(t))(j(t));
         	};
    	});
    	
    	
    	var transition_label = tSVG.selectAll("g.pie g.label").tween("labels", function(d, i, a)
    	{
    		//var w = d3.interpolate(oldChartWidth, that.chartHeight);
    		var j = d3.interpolate(this._current, d);
    		var r = d3.interpolate(r0,r1);
         	
         	if(d.endAngle - d.startAngle < labelAngleMinimum)
     		{
         		return function(t)
	         	{
	         		//var rt = w(t)/2;
	         		var jt = j(t);
	         		var rt = r(t);
	         		var path = arc.outerRadius(rt)(jt);
	         		
	         		var at = d3.svg.arc().innerRadius(0).outerRadius(rt);	    
	         		var c = at.centroid(jt);
	         		var x = c[0];
	         		var y = c[1];
	         		var h = Math.sqrt(x*x + y*y);
	         		
	         		var xt = (x/h * labelRadius);
	         		var yt = (y/h * labelRadius);
	         		
	         		//d3.select(this).attr({"transform":"translate("+rt+","+rt+")"});
	         		d3.select(this).select("path").attr({"d":path});
	         		d3.select(this).select("text").attr("transform","translate(" + xt + "," + yt + ")");
	         	};
     		}
         	else
         	{
         		return function(t)
	         	{
	         		//var rt = w(t)/2;
	         		var jt = j(t);
	         		var rt = r(t);
	         		var path = arc.outerRadius(rt)(jt);
	         		
	         		//d3.select(this).attr({"transform":"translate("+rt+","+rt+")"});
	         		d3.select(this).select("path").attr({"d":path});
	         		d3.select(this).select("text").attr({"transform":"translate("+arc.centroid(jt)+")"});
	         	};
         	}
         	
         	
    		this._current = j(0);
    	});
    },
    
    onPathOver: function(path)
    {
    	d3.select(path).transition().duration(500).attr("fill", "#A88B77");
    },
    onPathOut: function(path)
    {
    	d3.select(path).transition().duration(500).attr("fill", "#bca295");
    },
    createChartHeading: function()
    {
    	var item = document.createElement('div');
    	item.className = "olControlAdvancedChartItem";
    	var heading = document.createElement('div');
    	heading.className = "olControlAdvancedChartHeading";
    	$(heading).html("<div><span>Chart</span></div>");  	
    	item.appendChild(heading);
    	return item;
    },
    createChartTitle: function(chartTitle)
    {
    	var item = document.createElement('div');
    	item.className = "olControlAdvancedChartItem";
    	var heading = document.createElement('div');
    	heading.className = "olControlAdvancedChartTitle";
    	$(heading).html("<div><span>"+chartTitle+"</span></div>");  	
    	item.appendChild(heading);
    	return item;
    },
    createChartNotes: function(chartNotes)
    {
    	var notes = [];
    	for(var i = 0; i < chartNotes.length; i++)
    	{
    		notes.push(this.createChartNote(chartNotes[i]));
    	}    	
    	return notes;
    },
    createChartNote: function(chartNote)
    {
    	var item = document.createElement('div');
    	item.className = "olControlAdvancedChartItem";
    	var heading = document.createElement('div');
    	heading.className = "olControlAdvancedChartNote";
    	$(heading).html("<span>"+chartNote+"</span>");  	
    	item.appendChild(heading);
    	return item;
    },
    createChartDate: function()
    {
    	var str = "<span style=\"font-weight:700;\">Date:</b> </span><span>"+this.formatCurrentDate("label")+"</span>";
    	
    	var item = document.createElement('div');
    	item.className = "olControlAdvancedChartItem";
    	var heading = document.createElement('div');
    	heading.className = "olControlAdvancedChartDate";
    	$(heading).html("<span>"+str+"</span>");  	
    	item.appendChild(heading);
    	return item;
    },    
    createChartTotal: function()
    {
    	var str = "<span>Total:</b> </span><span>"+this.formatTotalValue()+"</span>";
    	
    	var item = document.createElement('div');
    	item.className = "olControlAdvancedChartItem";
    	var heading = document.createElement('div');
    	heading.className = "olControlAdvancedChartTotal";
    	$(heading).html("<span>"+str+"</span>");  	
    	item.appendChild(heading);
    	return item;
    },   
  
    //Create
    createChartItem: function()
    {
    	var that = this;
    	var item = document.createElement('div');
    	
    	item.className = "olControlAdvancedChartItem";
    	$(item).css("height","auto");

    	return item;
    },
    createChartCanvas: function(chartItem)
    {
    	var chartCanvas = undefined;
    	try
    	{
    		chartCanvas = d3.select(chartItem).append("svg").attr("width", this.chartWidth).attr("height", this.chartHeight);
    	}
    	catch(err)
		{
			console.log(err);
			throw err;
		}
    	return chartCanvas;
    },
    createBarChart: function(chartCanvas)
    {
    	try
    	{
    		this.appendBarChart(chartCanvas,this.chartData,this.chartScale);
    	}
    	catch(err)
		{
			console.log(err);
			throw err;
		}
    },
    createPieChart: function(chartCanvas)
    {
    	try
    	{
    		//d3.select(chartCanvas).append("svg").attr("width", this.chartWidth).attr("height", this.chartHeight);
    		//this.svg = d3.select(item).append("svg");
    		//var data = that.refreshChartData();
    		
    		var gPie = chartCanvas.append("g").attr("class", "pie").attr("transform", "translate(" + (70+this.getChartGap(undefined)+this.outerRadius) + "," + ((this.chartHeight/2)) + ")");
    		
    		this.appendPieChartPaths(chartCanvas,gPie,this.arc,this.chartData);
    		this.appendPieChartLabels(chartCanvas,gPie,this.arc,this.chartData);
    	}
    	catch(err)
		{
			console.log(err);
			throw err;
		}
    },
    //Refresh

    
    
    
    appendBarChart: function(chartCanvas,chartData,chartScale)
    {
    	var that = this;
    	
    	var gBar = chartCanvas.append("g").attr("class", "bar").attr("transform", "translate(" + 50 + "," + this.chartPadding.vertical + ")");
    	
    	var yAxis = d3.svg.axis().scale(chartScale).orient("left");
    	gBar.append("g").attr("class", "y axis").call(yAxis);
    	gBar.append("rect").attr("x", 4).attr("width", 16).attr("y", this.chartHeight-(this.chartPadding.vertical*2)).attr("height", 0).style("fill", "#bca295");
    },
    appendPieChartPaths: function(chartCanvas,gPie,arc,data)
    {
    	var padding = 0;//that.chartPadding.vertical;
    	var that = this;
    	var fLabel = this.getLabelField(this.sLayer,this.sChart);
    	var fValue = this.getValueField(this.sLayer,this.sChart);
    	//var arcs = gPie.selectAll("g.arc").data(this.pie(data)).enter().append("g").attr("class", "arc").attr("transform", "translate(" + (that.outerRadius + padding) + "," + (that.outerRadius + padding) + ")");
    	var arcs = gPie.selectAll("g.arc").data(this.pie(data)).enter().append("g").attr("class", "arc");
    	arcs.each(function(d) { this._current = d; });
    	arcs.append("title").text(function(d){return d.data[""+fValue]+" ("+d.data.percent+"%)";});
    	arcs.append("path").attr("d",arc).attr('fill',"#bca295").on("mouseover", function() {that.onPathOver(this);}).on("mouseout", function() {that.onPathOut(this);}).each(function(d) { this._current = d; });
    },
    appendPieChartLabels: function(chartCanvas,gPie,arc,data)
    {
    	var padding = 0;//that.chartPadding.vertical;
    	var that = this;
    	var fLabel = this.getLabelField(this.sLayer,this.sChart);
    	var fValue = this.getValueField(this.sLayer,this.sChart);
    	//var labels = gPie.selectAll("g.label").data(this.pie(data)).enter().append("g").attr("class", "label").attr("transform", "translate(" + (that.outerRadius + padding) + "," + (that.outerRadius + padding) + ")");
    	var labels = gPie.selectAll("g.label").data(this.pie(data)).enter().append("g").attr("class", "label");
    	labels.each(function(d) { this._current = d; });
    	labels.append("path").attr("d",arc).attr('display','none').each(function(d){this._current = d;});
    	
    	this.appendTextElements(arc,labels,"base",function(d, i)
    	{
    		return d.data[""+fLabel];
    	});
    	this.appendTextElements(arc,labels,"print",function(d, i)
    	{
    		return d.data.percent+"%";
    	},"18");
    },
    appendTextElements: function(arc,labels,sClass,text,dy)
    {
    	var that = this;
    	var textElements = labels.append("text").attr("class", sClass).attr("text-anchor", function(d)
    	{
    		if(d.endAngle - d.startAngle < that.labelAngleMinimum)
    		{
    			return (d.endAngle + d.startAngle)/2 > Math.PI ? "end" : "start";
    		}
    		else
    		{
    			return "middle";
    		}
    	}).attr("transform", function(d)
    	{
    		if(d.endAngle - d.startAngle < that.labelAngleMinimum)
    		{
    			var c = arc.centroid(d),
    				x = c[0],
    				y = c[1],
    				h = Math.sqrt(x*x + y*y);
    			return "translate(" + (x/h * that.labelRadius) + "," + (y/h * that.labelRadius) + ")";
    		}
    		else
    		{
    			return "translate(" + arc.centroid(d) + ")";
    		}
    	}).style("pointer-events", "none").text(text);
    	
    	if(dy!=undefined)
    	{
    		textElements.attr("dy", dy);
    	}
    },
   

    hasChartItem: function(sLayer)
    {
    	var item = false;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				item = this.carto.layers[""+sLayer]["chart"]!=undefined;
        		}
    		}
    	}
    	return item;
    },
    getLabelField: function(sLayer,sChart)
    {
    	var field = false;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["charts"]!=undefined)
            		{
    					if(this.carto.layers[""+sLayer]["charts"][sChart]!=undefined)
                		{
    						if(this.carto.layers[""+sLayer]["charts"][sChart]["label"]!=undefined)
                    		{
    							field = this.carto.layers[""+sLayer]["charts"][sChart]["label"];
                    		}
                		}
            		}
        		}
    		}
    	}
    	return field;
    },
    getValueField: function(sLayer,sChart)
    {
    	var field = false;
    	if(this.carto!=undefined)
    	{
    		if(this.carto.layers!=undefined)
    		{
    			if(this.carto.layers[""+sLayer]!=undefined)
        		{
    				if(this.carto.layers[""+sLayer]["charts"]!=undefined)
            		{
    					if(this.carto.layers[""+sLayer]["charts"][sChart]!=undefined)
                		{
    						if(this.carto.layers[""+sLayer]["charts"][sChart]["value"]!=undefined)
                    		{
    							field = this.carto.layers[""+sLayer]["charts"][sChart]["value"];
                    		}
                		}
            		}
        		}
    		}
    	}
    	return field;
    },
    getBarRange: function(sLayer,sChart)
    {
    	var range = false;
    	if(this.check_defined([sLayer,sChart]))
    	{
    		if(this.carto!=undefined)
        	{
        		if(this.carto.layers!=undefined)
        		{
        			if(this.carto.layers[""+sLayer]!=undefined)
            		{
        				if(this.carto.layers[""+sLayer]["charts"]!=undefined)
                		{
        					if(this.carto.layers[""+sLayer]["charts"][sChart]!=undefined)
                    		{
        						if(this.carto.layers[""+sLayer]["charts"][sChart]["bar"]!=undefined)
                        		{
        							if(this.carto.layers[""+sLayer]["charts"][sChart]["bar"]["range"]!=undefined)
                            		{
            							range = this.carto.layers[""+sLayer]["charts"][sChart]["bar"]["range"];
                            		}
                        		}
                    		}
                		}
            		}
        		}
        	}
    	}
    	return range;
    },
    /**
     * @since 1.0
     */
    
    check_defined: function(a)
    {
    	var pass = true;
    	for(var i = 0; i < a.length; i++)
    	{
    		if(a[i]==undefined)
    		{
    			pass = false;
    			break;
    		}
    	}
    	return pass;
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
    CLASS_NAME: "OpenLayers.Control.AdvancedChart"
});

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
OpenLayers.Control.Disclaimer = OpenLayers.Class(OpenLayers.Control,
{
	/* Initial */
	mode: "hover",
	rounded: true,
	leftText: "Names and boundary representation are not necessarily authoritative.",
	middleText: "Names and boundary representation are not necessarily authoritative.<br>Basemap: <a href=\"http://state.gov\">U.S. Department of State</a>",
	rightText: "Basemap: <a href=\"http://state.gov\">U.S. Department of State</a>",	
	
	/* Draw */
	mainDiv:undefined,
	leftContainer: undefined,
	rightContainer: undefined,
	middleContainer: undefined,
	
    isHover: function()
    {
    	return this.mode=="hover";
    },
    isFixed: function()
    {
    	return this.mode=="fixed";
    },
	isRounded: function()
    {
    	return this.rounded==true;
    },
    initialize: function(options)
    {
    	OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },
    draw: function()
    {
    	var div = OpenLayers.Control.prototype.draw.apply(this);
    	
    	if(this.isHover())
    	{
    		OpenLayers.Element.addClass(div,"hover");
    	}
    	else if(this.isFixed())
    	{
    		OpenLayers.Element.addClass(div,"fixed");
    	}
    	
    	if(this.isRounded())
    	{
    		OpenLayers.Element.addClass(div,"rounded");
    	}
    	
    	this.leftContainer = document.createElement('div');
    	this.leftContainer.className = "olControlDisclaimerContainerLeft olControlDisclaimerContainer";
        
        	var left = document.createElement('div');
        	left.className = "olControlDisclaimerBodyLeft olControlDisclaimerBody";
        	
	        	var leftSpan = document.createElement('span');
		        leftSpan.innerHTML = this.leftText;
		        left.appendChild(leftSpan);
		     
		        this.leftContainer.appendChild(left);
	    div.appendChild(this.leftContainer);
	    
	    this.rightContainer = document.createElement('div');
	    this.rightContainer.className = "olControlDisclaimerContainerRight olControlDisclaimerContainer";
        
        	var right = document.createElement('div');
        	right.className = "olControlDisclaimerBodyRight olControlDisclaimerBody";
        	
	        	var rightSpan = document.createElement('span');
	        	rightSpan.innerHTML = this.rightText;
		        right.appendChild(rightSpan);
		     
		        this.rightContainer.appendChild(right);
	    div.appendChild(this.rightContainer);
	    
	    this.middleContainer = document.createElement('div');
	    this.middleContainer.className = "olControlDisclaimerContainerMiddle olControlDisclaimerContainer";
        
        	var middle = document.createElement('div');
        	middle.className = "olControlDisclaimerBodyMiddle olControlDisclaimerBody";
        	
	        	var middleSpan = document.createElement('span');
	        	middleSpan.innerHTML = this.middleText;
	        	middle.appendChild(middleSpan);
		     
		        this.middleContainer.appendChild(middle);
	    div.appendChild(this.middleContainer);
	            
        this.mainDiv = div;
        return div;
    },
    setZIndex: function(zIndexBase,numberOfControls)
    {
    	this.leftContainer.style.zIndex = zIndexBase + numberOfControls;
    	this.rightContainer.style.zIndex = zIndexBase + numberOfControls;
    	this.middleContainer.style.zIndex = zIndexBase + numberOfControls;
    },
    onMapResize: function()
    {
    	
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
    CLASS_NAME: "OpenLayers.Control.Disclaimer"
});

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

OpenLayers.Control.Link = OpenLayers.Class(OpenLayers.Control,
{
    url: undefined,
    handler: undefined,
	initialize: function(url,options)
    {
		this.url = url;
		
		var defaultOptions =  {'autoActivate':true};
    	options = (options==undefined)?defaultOptions:OpenLayers.Util.applyDefaults(options,defaultOptions);    	
		OpenLayers.Control.prototype.initialize.apply(this,[options]);
        
        var handlerOptions = {'single': true,'double': false,'pixelTolerance': 0,'stopSingle': false,'stopDouble': false};
        this.handler = new OpenLayers.Handler.Click(this,{'click': this.onClick},handlerOptions);
    },
    activate: function()
    {
    	if(!this.active) 
    	{
        	if(this.handler!=undefined)
            {
        		this.handler.activate();
            }
    	}
        return OpenLayers.Control.prototype.activate.apply(this, arguments);
    },
    deactivate: function()
    {
        if(this.active)
        {
        	if(this.handler!=undefined)
            {
        		this.handler.deactivate();
            }
        }
        return OpenLayers.Control.prototype.deactivate.apply(this, arguments);
    },
    setMap: function(map)
    {
    	OpenLayers.Control.prototype.setMap.apply(this, arguments);
    	if(this.handler!=undefined)
    	{
    		this.handler.setMap(map);	
    	}
    },
    onClick: function()
    {
    	if(this.active)
    	{
    		if(this.url!=undefined)
        	{
        		window.top.location.href = this.url;
        	}
    	}
    },
   	CLASS_NAME: "OpenLayers.Control.Link"
});

/**
 * @author U.S. Department of State, Humanitarian Information Unit
 * @version 1.0
 */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Layer/TimeVector.js
 */

/**
 * Class: OpenLayers.Control.TimeSlider
 * The TimeSlider control selects refreshes TimeVector layers based on the date selected.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 *  
 *  @author U.S. Department of State, Humanitarian Information Unit
 *  @version 1.0
 */
OpenLayers.Control.TimeSlider = OpenLayers.Class(OpenLayers.Control,
{
	//Constant Variables
	daysoftheweek:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	monthsoftheyear:['January','February','March','April','May','June','July','August','September','October','November','December'],
	
	//Singularity Variables
	type: 'single',//single or range
	mainDiv:undefined,
    middle: undefined,
    mainLabel: undefined,
    mainLabelSpan: undefined,
    slider: undefined,
    listener: undefined,
    prev:undefined,
    next:undefined,
    divTicks: undefined,
    divLabels: undefined,
    
    //Dynamic Variables
    refreshDelay: 2000,
    refreshTimer: undefined,
    
    handleDelay: 0,
    handleTimer: undefined,
    
    collapseDelay: 2000,
    collapseTimer: undefined,
    
    updateDelay: 2000,
    
    dateTicks: true,
    dateLabels: true,
    
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
	
	expandedMaxWidth: 800,
	collapsedMaxWidth: 200,
	padding: 20,
		
    layer: null,
    layers: null,
    chart: null,
    
    blackholeEvents: true,
    
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
    /**
     * @since 1.0
     * @param layers - array of layers
     */
    setLayer: function(layers)
    {
        var isActive = this.active;
        this.unselectAll();
        this.deactivate();
        if(this.layers) {
            this.layer.destroy();
            this.layers = null;
        }
        this.initLayer(layers);
        this.handlers.feature.layer = this.layer;
        if (isActive) {
            this.activate();
        }
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
     * @param updateUI
     */
    incrementDate: function(updateUI)
    {
    	if(this.isSingle())
    	{
    		var currentDate = this.getCurrentDate();
        	var newDate = new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()+1);
        	if(newDate.getTime()<=this.getMaxTime())
        	{
            	this._setCurrentDate(newDate);            	
            	this.delayRefresh();
        	}
    	}
    	else if(this.isRange())
    	{
    		var currentStartDate = this.getCurrentStartDate();
    		var currentEndDate = this.getCurrentEndDate();
        	var newStartDate = new Date(currentStartDate.getFullYear(),currentStartDate.getMonth(),currentStartDate.getDate()+1);
        	var newEndDate = new Date(currentEndDate.getFullYear(),currentEndDate.getMonth(),currentEndDate.getDate()+1);
        	
        	if(newEndDate.getTime()<=this.getMaxTime())
        	{
            	this._setCurrentDateRange(newStartDate,newEndDate);            	
            	this.delayRefresh();
        	}
    	}
    	if(updateUI)
    	{
    		this._updateUI();
    	}
    },
    /**
     * @since 1.0
     * @param updateUI
     */
    decrementDate: function(updateUI)
    {
    	if(this.isSingle())
    	{
    		var currentDate = this.getCurrentDate();
        	var newDate = new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()-1);
        	if(newDate.getTime()>=this.getMinTime())
        	{
            	this._setCurrentDate(newDate);            	
            	this.delayRefresh();
        	}
    	}
    	else if(this.isRange())
    	{
    		var currentStartDate = this.getCurrentStartDate();
    		var currentEndDate = this.getCurrentEndDate();
        	var newStartDate = new Date(currentStartDate.getFullYear(),currentStartDate.getMonth(),currentStartDate.getDate()-1);
        	var newEndDate = new Date(currentEndDate.getFullYear(),currentEndDate.getMonth(),currentEndDate.getDate()-1);
        	
        	if(newStartDate.getTime()>=this.getMinTime())
        	{
            	this._setCurrentDateRange(newStartDate,newEndDate);            	
            	this.delayRefresh();
        	}
    	}
    	
    	if(updateUI)
    	{
    		this._updateUI();
    	}
    },
    /**
     * @since 1.0
     * @returns {Boolean}
     */
    hasPrevious: function()
    {
    	if(this.isSingle())
    	{
    		return this.getValue()>0;
    	}
    	else if(this.isRange())
    	{
    		return this.getStartValue()>0;
    	}
    },
    /**
     * @since 1.0
     * @returns {Boolean}
     */
    hasNext: function()
    {
    	if(this.isSingle())
    	{
    		return this.getValue()<(this.getDays()-1);
    	}
    	else if(this.isRange())
    	{
    		return this.getEndValue()<(this.getDays()-1);
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
    getHandle: function()
    {
    	return $(this.slider).data('slider').handle;
    },
    /**
     * @since 1.0
     * @returns
     */
    getStartHandle: function()
    {
    	return $($(this.slider).data('slider').handles.get(0));
    },
    /**
     * @since 1.0
     * @returns
     */
    getEndHandle: function()
    {
    	return $($(this.slider).data('slider').handles.get(1));
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
    turnOffDateTicks: function()
    {
    	this.dateTicks = false;
    	
    	OpenLayers.Element.addClass(mainDiv, "noDateTicks");
    },
    /**
     * @sice 1.0
     */
    turnOnDateTicks: function()
    {
    	this.dateTicks = true;
    	
    	OpenLayers.Element.removeClass(mainDiv, "noDateTicks");
    },
    /**
     * @since 1.0
     */
    turnOffDateLabels: function()
    {
    	this.dateLabels = false;
    	
    	OpenLayers.Element.addClass(mainDiv, "noDateLabels");
    },
    /**
     * @since 1.0
     */
    turnOnDateLabels: function()
    {
    	this.dateLabels = true;
    	
    	OpenLayers.Element.removeClass(mainDiv, "noDateLabels");
    },
    /**
     * @since 1.0
     */
    _updateUI: function()
    {
    	this._updateTimeLabel();
    	this._updateSlider();
    	this.delayHandleUpdate();
    },
    /**
     * @since 1.0
     */
    _updateTimeLabel: function()
    {
    	$(this.mainLabelSpan).html(this.buildTimeLabel());
    },
    /**
     * @since 1.0
     * @returns {String}
     */
    buildTimeLabel: function()
    {
    	var html = "";
    	if(this.isSingle())
    	{
    		html = "Timeline<br>"+this.formatCurrentDate("label");
    	}
    	else if(this.isRange())
    	{
    		html = "Timeline<br>"+this.formatCurrentStartDate("label")+" -<br> "+this.formatCurrentEndDate("label");
    	}
    	return html;
    },
    /**
     * @since 1.0
     */
    _updateSlider: function()
    {
		if(this.isSingle())
		{
			$(this.slider).slider("option","value",this.getValue());
		}
		else if(this.isRange())
		{
			$(this.slider).slider("option","values",this.getValues());
		}
    	
		if(this.listener!=undefined)
		{
			this.listener();
		}
    },   
    /**
     * @since 1.0
     * @param minDate
     * @param maxDate
     */
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
    stopHandleUpdate: function()
    {
    	if(this.handleTimer!=undefined)
    	{
    		clearTimeout(this.handleTimer);
    		this.handleTimer = undefined;
    	}
    },
    /**
     * @since 1.0
     */
    delayHandleUpdate : function()
    {
    	var that = this;
    	that.stopHandleUpdate();
       	that.handleTimer = setTimeout(function(){that.updateSliderHandles();},that.handleDelay);
    },
    /**
     * @since 1.0
     */
    updateSliderHandles: function()
    {
    	if(this.isSingle())
    	{
    		var handle = this.getHandle();
        	var label = handle.data('label');
    		$(label).css('left',handle.css('left'));
    		$('span',label).html(this.formatCurrentDate("label"));
    	}
    	else if(this.isRange())
    	{
    		var startHandle = this.getStartHandle();
        	var startLabel = startHandle.data('label');
        	
        	var endHandle = this.getEndHandle();
        	var endLabel = endHandle.data('label');
        	
    		$(startLabel).css('left',startHandle.css('left'));
    		$('span',startLabel).html(this.formatCurrentStartDate("label"));
    		
    		$(endLabel).css('left',endHandle.css('left'));
    		$('span',endLabel).html(this.formatCurrentEndDate("label"));
    	}    	
    },
    /**
     * @since 1.0
     */
    stopCollapse: function()
    {
    	if(this.collapseTimer!=undefined)
    	{
    		clearTimeout(this.collapseTimer);
    		this.collapseTimer = undefined;
    	}
    },
    /**
     * @since 1.0
     */
    delayCollapse : function()
    {
    	var that = this;
    	that.stopCollapse();
       	that.collapseTimer = setTimeout(function(){that.collapse();},that.collapseDelay);
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
    	this.stopCollapse();
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
    /**
     * @since 1.0
     */
    stopRefresh: function()
    {
    	if(this.refreshTimer!=undefined)
    	{
    		clearTimeout(this.refreshTimer);
    		this.refreshTimer = undefined;
    	}
    },
    /**
     * @since 1.0
     */
    delayRefresh : function()
    {
    	var that = this;
    	that.stopRefresh();
       	that.refreshTimer = setTimeout(function(){that.refresh();},that.refreshDelay);
    },
    /**
     * @since 1.0
     */
    refresh : function()
    {
    	this.refreshTimer = undefined;
    	
    	if(this.chart!=undefined)
    	{
    		if(this.isSingle())
    		{
    			this.chart._setCurrentDate(this.getCurrentDate());
    		}
    		else if(this.isRange())
    		{
    			this.chart._setCurrentDateRange(this.currentDateRange[0],this.currentDate[1]);
    		}
    	}
    	
    	if(this.layer!=undefined)
    	{
    		this._refreshLayer(this.layer);
    	}
    	else
    	{
    		for(var i = 0; i < this.layers.length; i++)
    		{
    			this._refreshLayer(this.layers[i]);
    		}
    	}
    },
    /**
     * @since 1.0
     * @param layer
     */
    _refreshLayer: function(layer)
    {
		if(this.isSingle())
		{
			layer.refreshTimeFilter({"date":this.formatCurrentDate("wfs")});
		}
		else if(this.isRange())
		{
			layer.refreshTimeFilter({"start":this.formatCurrentStartDate("wfs"),"end":this.formatCurrentEndDate("wfs")});
		}
    },
    /**
     * @since 1.0
     * @param layers
     * @param options
     */
    initialize: function(layers, options)
    {
    	OpenLayers.Control.prototype.initialize.apply(this, [options]);
        if(OpenLayers.Util.isArray(layers))
        {
            this.layers = layers;
        }
        else
        {
            this.layer = layers;
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
    	
    	if(this.isAnimated())
    	{
    		OpenLayers.Element.addClass(div,"animate");
    	}
    	
		if(!this.dateTicks)
		{
			OpenLayers.Element.addClass(div,"noDateTicks");
		}
		if(!this.dateLabels)
		{
			OpenLayers.Element.addClass(div,"noDateLabels");
		}
		
    	var handleLabel = undefined;
    	var handleLabels = undefined;
    	
    	var middle = document.createElement('div');
        middle.className = "olControlTimeSliderMiddle olControlMiddle";
        
	        var mainLabel = document.createElement('div');
	        mainLabel.className = "olControlTimeSliderLabel";
	        $(mainLabel).data('olControlTimeSlider',this);
	        
		        var mainLabelSpan = document.createElement('span');
		        mainLabelSpan.innerHTML = this.buildTimeLabel();
		        mainLabel.appendChild(mainLabelSpan);
		    
		    middle.appendChild(mainLabel);    
		        
	        var sliderContainer = document.createElement('div');
	        sliderContainer.className = "olControlTimeSliderContainer";
	        
		        var prev = this.createPreviousButton();
		        sliderContainer.appendChild(prev);
	        
	        	var actualSlider = this.createSlider(); 
		        sliderContainer.appendChild(actualSlider);
		        
		        var ticksAndLabels = this.createTicksAndLabels(this.dateTicks,this.dateLabels);
		        sliderContainer.appendChild(ticksAndLabels.dateTicks);
		        sliderContainer.appendChild(ticksAndLabels.dateLabels);
		        
		        if(this.isSingle())
		        {
		        	handleLabel = this.createHandleLabel(this.getCurrentDate(),$(actualSlider).data('slider').handle);
		        	actualSlider.appendChild(handleLabel);
		        }
		        else if(this.isRange())
		        {
		        	$($(actualSlider).data('slider').handles.get(0)).data('date','start');
		        	$($(actualSlider).data('slider').handles.get(1)).data('date','end');
		        	
		        	handleLabels = this.createHandleLabels(actualSlider);
		        	actualSlider.appendChild(handleLabels[0]);
		        	actualSlider.appendChild(handleLabels[1]);
		        }
		        
		        var next = this.createNextButton();
		        sliderContainer.appendChild(next);
		        
		    middle.appendChild(sliderContainer);
		    
		    
        div.appendChild(middle);
        
        this.mainDiv = div;
        this.middle = middle;
        this.mainLabel = mainLabel;
        this.mainLabelSpan = mainLabelSpan;
        this.sliderContainer = sliderContainer;
        this.prev = prev;
        this.slider = actualSlider;
        this.next = next;
        this.divDateTicks = ticksAndLabels.dateTicks;
        this.divDateLabels = ticksAndLabels.dateLabels;
        
        if(this.isSingle())
        {
        	this.handleLabel = handleLabel;
        }
        else if(this.isRange())
        {
        	this.handleLabels = handleLabels;
        }
        
        this.delayHandleUpdate();
      	$(div).data('olControlTimeSlider',this);
        $(div).hover(this.onMouseEnter,this.onMouseLeave);
        $(mainLabel).click(function(){var timeSlider = $(this).data('olControlTimeSlider');timeSlider.onMainLabelClick.apply(timeSlider);});
        
        var events = this.map.events;
		events.registerPriority("click",this,this.onMapClick);
		
		$(div).on('click dblclick',null,this,this.blackhole);
		
        return div;
    },
    /**
     * @since 1.0
     * @param evt
     * @returns {Boolean}
     */
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
    /**
     * @since 1.0
     */
    onMainLabelClick: function()
    {
    	if(!this.isAnimated())
		{
    		this.expand();
		}
    },
    /**
     * @since 1.0
     */
    onMapClick: function()
    {
    	if(!this.isAnimated())
		{
    		this.collapse();
		}
    },
    /**
     * @since 1.0
     */
    onPrevious: function()
    {
		if(this.hasPrevious())
		{
			this.decrementDate(true);
		}
    },
    /**
     * @since 1.0
     */
    onNext: function()
    {
    	if(this.hasNext())
		{
    		this.incrementDate(true);
		}
    },
    /**
     * @since 1.0
     * @param handle
     * @param value
     */
    onSlide: function(handle,value)
    {
    	if(this.isSingle())
    	{
    		var minDate = this.getMinDate();
        	var newDate = new Date(minDate.getFullYear(),minDate.getMonth(),minDate.getDate()+value);
        	this._setCurrentDate(newDate);
    	}
    	else if(this.isRange())
    	{
    		var minDate = this.getMinDate();
        	var newDate = new Date(minDate.getFullYear(),minDate.getMonth(),minDate.getDate()+value);
        	if(handle.data('date')=='start')
        	{
        		this._setCurrentStartDate(newDate);
        	}
        	else if(handle.data('date')=='end')
        	{
        		this._setCurrentEndDate(newDate);
        	}
    	}
    	this.delayRefresh();
    	this._updateTimeLabel();
    	this.delayHandleUpdate();
    },
    /**
     * @since 1.0
     */
    onMapResize: function()
    {
    	this._resizeSlider();
    	this._resizeHandles();
    },
    /**
     * @since 1.0
     */
    _resizeSlider: function()
    {
    	var m = this.map;
    	var w = Math.min(m.getCurrentSize().w-this.padding,this.getMaxWidth());
    	//var left = "50%";//Should Be Set in CSSssss
    	var marginLeft = (""+((-1*(w/2))-(this.padding/4))+"px");
    	//$(this.mainDiv).css({"left":left,"width":(w+"px"),"margin-left":marginLeft});
    	$(this.mainDiv).css({"width":(w+"px"),"margin-left":marginLeft});
    },
    /**
     * @since 1.0
     */
    _resizeHandles: function()
    {
     	var mapWidth = this.map.getCurrentSize().w;
    	var handleWidth = undefined;
    	if(mapWidth>825)
    	{
    		handleWidth = 17;
    	}
    	else if(mapWidth>=465&&mapWidth<=825)
    	{
    		handleWidth = 13;
    	}
    	else //Less than <465
    	{
    		handleWidth = 11;
    	}
    	if(this.isSingle())
    	{
    		this.getHandle().css('width',handleWidth+'px');
    	}
    	else if(this.isRange())
    	{
    		this.getStartHandle().css('width',handleWidth+'px');
    		this.getEndHandle().css('width',handleWidth+'px');
    	}
    },
    /**
     * @since 1.0
     * @param e
     */
    onMouseEnter: function(e)
    {
    	var that = $(this).data('olControlTimeSlider');
	
		if(that.isAnimated.apply(that))
		{
			that.expand.apply(that);
		}
    },
    /**
     * @since 1.0
     * @param e
     */
    onMouseLeave: function(e)
    {
    	var that = $(this).data('olControlTimeSlider');
				
		if(that.isAnimated.apply(that))
		{
			that.delayCollapse.apply(that);
		}
    },
    /**
     * @since 1.0
     * @param e
     * @returns {Boolean}
     */
    onMouseMove: function(e)
    {
    	var slider = e.data;
    	slider._mouseMoveDelegate(event);
		return false;
    },
    /**
     * @since 1.0
     * @param e
     * @returns {Boolean}
     */
    onMouseUp: function(e)
    {
    	var slider = e.data;
    	slider._mouseUpDelegate(event);
		return true;
    },
    /**
     * @since 1.0
     * @returns
     */
    createPreviousButton: function()
    {
		var classes = "olControlTimeSliderButton olControlTimeSliderPrevious ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only";
    	var html = '<span class="ui-button-icon-primary ui-icon ui-icon-seek-start"></span>';
		var css = {};
		var click = function(e)
		{			
			var timeSlider = $(this).data('olControlTimeSlider');
			timeSlider.onPrevious.apply(timeSlider);
			e.stopPropagation();
			return false;
		};
    	return this.createButton(classes,html,css,click);
    },
    /**
     * @since 1.0
     * @returns
     */
    createNextButton: function()
    {
    	var classes = "olControlTimeSliderButton olControlTimeSliderNext ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only";
    	var html = '<span class="olControlTimeSliderNext ui-button-icon-primary ui-icon ui-icon-seek-end"></span>';
		var css = {};
		var click = function(e)
		{			
			var timeSlider = $(this).data('olControlTimeSlider');
			timeSlider.onNext.apply(timeSlider);
			e.stopPropagation();
			return false;
		};
    	return this.createButton(classes,html,css,click);
    },
    /**
     * @since 1.0
     * @param classes
     * @param html
     * @param css
     * @param click
     * @returns
     */
    createButton: function(classes,html,css,click)
    {
		var btn = $(document.createElement('button'));
		btn.attr('type','button');
		btn.addClass(classes);
		btn.html(html);
		btn.css(css);
		btn.data('olControlTimeSlider',this);
		btn.hover(function(){$(this).addClass('ui-state-hover');},function(){$(this).removeClass('ui-state-hover');});
		btn.click(click);
		
		return btn.get(0);
    },
    /**
     * @since 1.0
     * @returns {___slider5}
     */
    createSlider: function()
    {
    	var that = this;
    	var slider = document.createElement('div');
    	slider.className = "olControlTimeSliderSlider";
    	$(slider).data('olControlTimeSlider',this);
    	if(this.isSingle())
    	{
    		$(slider).slider(
	    	{
	    		'min':0,
	    		'max':this.getDays()-1,
	    		'range':false,
	    		'value':this.getValue(),
	    		step:1,
	    		start: function(event,ui)
	    		{
	    			that.map.events.bypass = true;
	    		},
	    		stop: function(event,ui)
	    		{
	    			that.map.events.bypass = false;
	    		},
	    		slide: function(event,ui)
	    		{
	    			var timeSlider = $(this).data('olControlTimeSlider');
	    			timeSlider.onSlide.apply(timeSlider,[$(ui.handle),ui.value]);
	    			return true;
	    		}
	    		
	    	});
    		$(slider).css('z-index','20');
    	}
    	else if(this.isRange())
    	{
    		$(slider).slider(
	    	{
	    		'min':0,
	    		'max':this.getDays()-1,
	    		'range':true,
	    		'values':this.getValues(),
	    		step:1,
	    		start: function(event,ui)
	    		{
	    			that.map.events.bypass = true;
	    		},
	    		stop: function(event,ui)
	    		{
	    			that.map.events.bypass = false;
	    		},
	    		slide: function(event,ui)
	    		{
	    			var timeSlider = $(this).data('olControlTimeSlider');
	    			timeSlider.onSlide.apply(timeSlider,[$(ui.handle),ui.value]);//ui.value is the value that changed.  ui.values are both values 
	    		}
	    	});
    	}    	
    	return slider;
    },
    /**
     * @since 1.0
     * @param bDateTicks
     * @param bDateLabels
     * @returns {___anonymous32599_32648}
     */
    createTicksAndLabels: function(bDateTicks,bDateLabels)
    {
    	var dateTicks = document.createElement('div');
    	dateTicks.className = "olControlTimeSliderDateTicks";
    	
		var dateLabels = document.createElement('div');
		dateLabels.className = "olControlTimeSliderDateLabels";
		
		var minDate = this.getMinDate(); 
		var days = this.getDays();
		
		for(var i = 0; i < days; i++)
		{
			var mod_month_label = Math.floor(days/365)+1;
			var date = new Date(minDate.getFullYear(),minDate.getMonth(),minDate.getDate()+i);
			var month = date.getMonth();
			var left = i/(days-1)*100;
			
			if(date.getMonth()==0&&date.getDate()==1)//New Year
			{
				dateTicks.appendChild(this.createDateTick("year",i,left));			
				dateLabels.appendChild(this.createDateLabel("year",i,date,left));
			}
			else if(date.getDate()==1)//New Month
			{
				dateTicks.appendChild(this.createDateTick("month",i,left));
				if(month%mod_month_label==0)
				{
					dateLabels.appendChild(this.createDateLabel("month",i,date,left));
				}
			}
			else
			{
				dateTicks.appendChild(this.createDateTick("day",i,left));
			}
		}
		return {'dateTicks': dateTicks, 'dateLabels': dateLabels};
    },
    /**
     * @since 1.0
     * @param type
     * @param index
     * @param left
     * @returns {___dateTick8}
     */
    createDateTick: function(type,index,left)
    {
    	var dateTick = document.createElement('span');
    	
    	if(type=="year")
    	{
    		dateTick.className = "olControlTimeSliderDateTick olControlTimeSliderYearTick";
    	}
    	else if(type=="month")
    	{
    		dateTick.className = "olControlTimeSliderDateTick olControlTimeSliderMonthTick";
    	}
    	else if(type=="day")
    	{
    		dateTick.className = "olControlTimeSliderDateTick olControlTimeSliderDayTick";
    	}
    	
    	$(dateTick).css({'left':left+"%"});
    	
    	$(dateTick).data('day',index);
    	
		return dateTick;
    },
    /**
     * @since 1.0
     * @param type
     * @param index
     * @param date
     * @param left
     * @returns {___dateLabel9}
     */
    createDateLabel: function(type,index,date,left)
    {
    	var dateLabel = document.createElement('div');
    	
    	if(type=="year")
    	{
    		dateLabel.className = "olControlTimeSliderDateLabel olControlTimeSliderYearLabel";
    		$(dateLabel).html('<span>'+date.getFullYear()+'</span>');
    	}
    	else if(type=="month")
    	{
    		dateLabel.className = "olControlTimeSliderDateLabel olControlTimeSliderMonthLabel";
    		$(dateLabel).html('<span>'+this.monthsoftheyear[date.getMonth()]+'</span>');
    	}
    	
    	$(dateLabel).css({'left':left+"%"});
    	
    	$(dateLabel).data('day',index);
    	
		return dateLabel;
    },
    /**
     * @since 1.0
     * @param slider
     * @returns {Array}
     */
    createHandleLabels: function(slider)
    {
    	var startHandleLabel = this.createHandleLabel(this.getCurrentStartDate(),$(slider).data('slider').handles.get(0));
    	var endHandleLabel = this.createHandleLabel(this.getCurrentEndDate(),$(slider).data('slider').handles.get(1));
    	var handles = [startHandleLabel,endHandleLabel];
    	return handles;
    },
    /**
     * @since 1.0
     * @param date
     * @param handle
     * @returns {___handleLabel10}
     */
    createHandleLabel : function(date,handle)
    {
    	var handleLabel = document.createElement('div');
    	handleLabel.className = "olControlTimeSliderHandleLabel";
    	$(handleLabel).html('<span>'+this.formatDate(date,"label")+'</span>');
    	$(handle).data('label',$(handleLabel));
    	return handleLabel;
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
    CLASS_NAME: "OpenLayers.Control.TimeSlider"
});

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
OpenLayers.Control.Title = OpenLayers.Class(OpenLayers.Control,
{
	/* Initial */
	name: undefined,
	url: undefined,
	mode: "hover",
	rounded: false,
	
	/* Draw */	
	mainDiv:undefined,
	container: undefined,
	
    initialize: function(name, url, options)
    {
    	OpenLayers.Control.prototype.initialize.apply(this, [options]);

    	this.name = name;
    	this.url = url;
    },
    isHover: function()
    {
    	return this.mode=="hover";
    },
    isFixed: function()
    {
    	return this.mode=="fixed";
    },
    isRounded: function()
    {
    	return this.rounded==true;
    },
    draw: function()
    {
    	var div = OpenLayers.Control.prototype.draw.apply(this);
    	
    	if(this.isHover())
    	{
    		OpenLayers.Element.addClass(div,"hover");
    	}
    	else if(this.isFixed())
    	{
    		OpenLayers.Element.addClass(div,"fixed");
    	}
    	
    	if(this.isRounded())
    	{
    		OpenLayers.Element.addClass(div,"rounded");
    	}
    	
    	this.container = document.createElement('div');
    	this.container.className = "olControlTitleContainer";
        
        	var body = document.createElement('div');
        	body.className = "olControlTitleBody";
        	
        		var span = document.createElement('span');
        		if(this.name!=undefined)
        		{
        			if(this.url!=undefined)
        			{
        				span.innerHTML = "<a href=\""+this.url+"\">"+this.name+"</a>";
        			}
        			else
        			{
        				span.innerHTML = this.name;
        			}
        		}
        		else
        		{
        			span.innerHTML = "No name specified";
        		}
	        	body.appendChild(span);
		     
	        this.container.appendChild(body);
		        
	    div.appendChild(this.container);
	            
        this.mainDiv = div;
        
        $(div).on('click dblclick','a',this,this.onClick);
        return div;
    },
    setZIndex: function(zIndexBase,numberOfControls)
    {
    	this.container.style.zIndex = zIndexBase + numberOfControls;
    },
    onMapResize: function()
    {
    	
    },
    onClick: function(evt)
    {
    	window.top.location.href = evt.data.url;
    },
    destroy: function()
    {
    },
    CLASS_NAME: "OpenLayers.Control.Title"
});

/**
 * @author U.S. Department of State, Humanitarian Information Unit
 * @version 1.0
 */

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Format.AdvancedText.js
 * This formatter simplifies the reading in of TSV and other delimited files, but checking more columns than the default and ore.
 *
 * Inherits from:
 *  - <OpenLayers.Format.Text.js>
 *  
 *  @author U.S. Department of State, Humanitarian Information Unit
 *  @version 1.0
 */
OpenLayers.Format.AdvancedText = OpenLayers.Class(OpenLayers.Format.Text,
{
    delimiter: '\t',
    mapProjection: undefined,//EPSG:900913 most likely
	
	initialize: function(options)
    {
    	OpenLayers.Format.Text.prototype.initialize.apply(this, [options]);
    	
    	this.wgs84 = new OpenLayers.Projection("EPSG:4326");
    },
    
    read: function(text)
    {
    	var features = [];
    	
    	//Rows
    	var rows = text.split("\n");
		rows = $.grep(rows,function(row,i){return $.trim(row).length>0;});
		//Header
    	var h = $.map(rows[0].split(this.delimiter),function(hi,i){return OpenLayers.String.trim(hi);});
		//Find Geometry Columns
    	var iLatLon = this.getColumnIndex(h,["latlon","latlong","lat_lon","lat long"]);
    	var iLonLat = this.getColumnIndex(h,["lonlat","longlat","long_lat","long lat"]);
    	var iLatitude = this.getColumnIndex(h,["lat","latitude","lat_dd","latitude_dd"]);
		var iLongitude = this.getColumnIndex(h,["lon","long","longitude","lon_dd","long_dd","longitude_dd"]);
		var iY = this.getColumnIndex("y");
		var iX = this.getColumnIndex("x");
    	//Parse Features
    	for(var i = 1; i < rows.length; i++)
    	{
    		var r = rows[i];
    		var b = $.map(r.split(this.delimiter),function(bi,i){return OpenLayers.String.trim(bi);});
    		var g = this.buildGeometry(b[iLatLon],b[iLonLat],b[iLatitude],b[iLongitude],b[iY],b[iX]);
    		var a = {};
			for(var j = 0; j < h.length; j++)
			{
				a[""+h[j]] = b[j];
			}
    		
    		if(a!=undefined&&g!=undefined)
    		{
    			var f = new OpenLayers.Feature.Vector(g, a);    			
    			features.push(f);
    		}
    	}		
		return features;
    },
	buildGeometry: function(latlon,lonlat,lat,lon,y,x)
	{
		var g = undefined;
		
		if(latlon!=undefined)
		{
			var a = latlon.split(",");
			g = new OpenLayers.Geometry.Point(a[1],a[0]);
		}
		else if(lonlat!=undefined)
		{
			var a = lonlat.split(",");
			g = new OpenLayers.Geometry.Point(a[0],a[1]);
		}
		if(lat!=undefined&&lon!=undefined&&lat!='-'&&lon!='-')
		{
			//g = new OpenLayers.Geometry.Point(lat,lon);
			//g.transform(this.wgs84, this.mapProjection);
			g = new OpenLayers.Geometry.Point(lon,lat);
			//g.transform(this.wgs84, this.mapProjection);
		}
		else if(y!=undefined&&x!=undefined&&y!='-'&&x!='-')
		{
			g = new OpenLayers.Geometry.Point(parseInt(y,10),parseInt(x,10));
			if(this.sourceProjection!=undefined)
			{
				g.transform(this.sourceProjection, this.mapProjection);
			}
		}

		return g;
	},
	getColumnIndex: function(header,names)
    {
    	var columnIndex = -1;
    	var columnNames = undefined;
    	if(CyberGIS.isString(names))
    	{
    		columnNames = [names];
    	}
    	else if(CyberGIS.isArray(names))
    	{
    		columnNames = names;
    	}    	
    	if(columnNames!=undefined)
    	{
    		for(var i = 0; i < columnNames.length; i++)
        	{
        		var columnName = columnNames[i];
        		for(var j = 0; j < header.length; j++)
            	{
            		if((header[j]).toLowerCase()==columnName.toLowerCase())
            		{
            			columnIndex = j;
            			break;
            		}
            	}
        		if(columnIndex!=-1)
        		{
        			break;
        		}
        	}
    	}   
    	return columnIndex;
    },    
    CLASS_NAME: "OpenLayers.Format.AdvancedText"
});

/**
 * @author U.S. Department of State, Humanitarian Information Unit
 * @version 1.0
 */

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Format.AdvancedText.js
 * This formatter simplifies the reading in of TSV and other delimited files, but checking more columns than the default and ore.
 *
 * Inherits from:
 *  - <OpenLayers.Format.Text.js>
 *  
 *  @author U.S. Department of State, Humanitarian Information Unit
 *  @version 1.0
 */
OpenLayers.Format.SOAP = OpenLayers.Class(OpenLayers.Format.Text,
{
    delimiter: '\t',
    mapProjection: undefined,//EPSG:900913 most likely
	
	initialize: function(options)
    {
    	OpenLayers.Format.Text.prototype.initialize.apply(this, [options]);
    	
    	this.wgs84 = new OpenLayers.Projection("EPSG:4326");
    },
    
    read: function(text,columns)
    {
    	var features = [];
    	
		var text2 = text.substring(text.indexOf("<rs:data "),text.indexOf("</rs:data>")+"</rs:data>".length);
		var text3 = text2.replace(new RegExp('[\\n\\t\\r]','gi'),'');//MUST DO, Regex Engine Will Crap Out and won't match last line if you don't (maybe its a max size thing)
		var itemCount = parseInt(text3.replace(new RegExp('[<](rs[:]data)(?:\\s+)ItemCount[=]"(\\d+)"[>](.*?)(</\\1>)','gi'),'$2'));//,'$1');</\\1>
    	if(itemCount>0)
    	{
    		var rows = text.match(new RegExp('[<](z[:]row)(?:\\s+)(.+?)[/][>]','gi'));
    		for(var i = 0; i < rows.length; i++)
        	{
    			var r = rows[i];
    			var latlon = this.coalesceAttributesFromRow(r,["latlon","latlong","lat_lon","lat long"]);
            	var lonlat = this.coalesceAttributesFromRow(r,["lonlat","longlat","long_lat","long lat"]);
            	var lat = this.coalesceAttributesFromRow(r,["lat","latitude","lat_dd","latitude_dd"]);
        		var lon = this.coalesceAttributesFromRow(r,["lon","long","longitude","lon_dd","long_dd","longitude_dd"]);
        		var yx = this.coalesceAttributesFromRow(r,["yx","y_x","y x"]);
            	var xy = this.coalesceAttributesFromRow(r,["xy","x_y","x y"]);
        		var y = this.extractAttributeFromRow(r,"y");
        		var x = this.extractAttributeFromRow(r,"x");
        		
        		var g = this.buildGeometry(latlon,lonlat,lat,lon,yx,xy,y,x);
        		
        		var a = {"id":i};
    			for(var j = 0; j < columns.length; j++)
    			{
    				var column = columns[j];
    				a[""+column] = this.extractAttributeFromRow(r,column);
    			}
    			
    			if(a!=undefined&&g!=undefined)
        		{
        			var f = new OpenLayers.Feature.Vector(g, a);    			
        			features.push(f);
        		}
        	}
    	}
		return features;
    },
    coalesceAttributesFromRow: function(r,a)
    {
    	var b = undefined;
    	for(var i = 0; i < a.length; i++)
    	{
    		var c = this.extractAttributeFromRow(r,a[i]);
    		if(c!=undefined)
    		{
    			b = c;
    			break;
    		}
    	}
    	return b;
    },
    extractAttributeFromRow: function(r,a)
    {
    	var a2 = a.replace(" ","_x0020_").replace("(","_x0028_").replace(")","_x0029_").replace("-","_x002d_").substring(0,32);
    	if(r.match(new RegExp(" ows_"+a2+"=","gi")))
    		return r.replace(new RegExp('(?:.+)(?:\\s+)ows_'+a2+'=[\'](.+?)[\'](?:\\s+)(?:.+)','gi'),'$1');
    	else
    		return undefined;
    },
    buildGeometry: function(latlon,lonlat,lat,lon,yx,xy,y,x)
	{
		var g = undefined;
		
		if(latlon!=undefined)
		{
			var a = latlon.split(",");
			g = new OpenLayers.Geometry.Point(a[1],a[0]);
		}
		else if(lonlat!=undefined)
		{
			var a = lonlat.split(",");
			g = new OpenLayers.Geometry.Point(a[0],a[1]);
		}
		if(lat!=undefined&&lon!=undefined&&lat!='-'&&lon!='-')
		{
			//g = new OpenLayers.Geometry.Point(lat,lon);
			//g.transform(this.wgs84, this.mapProjection);
			g = new OpenLayers.Geometry.Point(lon,lat);
			//g.transform(this.wgs84, this.mapProjection);
		}
		else if (yx!=undefined)
		{
			var a = latlon.split(",");
			g = new OpenLayers.Geometry.Point(a[1],a[0]);
			if(this.sourceProjection!=undefined)
			{
				g.transform(this.sourceProjection, this.mapProjection);
			}
		}
		else if(xy!=undefined)
		{
			var a = latlon.split(",");
			g = new OpenLayers.Geometry.Point(a[0],a[1]);
			if(this.sourceProjection!=undefined)
			{
				g.transform(this.sourceProjection, this.mapProjection);
			}
		}			
		else if(y!=undefined&&x!=undefined&&y!='-'&&x!='-')
		{
			g = new OpenLayers.Geometry.Point(parseInt(y,10),parseInt(x,10));
			if(this.sourceProjection!=undefined)
			{
				g.transform(this.sourceProjection, this.mapProjection);
			}
		}

		return g;
	},
	getColumnIndex: function(header,names)
    {
    	var columnIndex = -1;
    	var columnNames = undefined;
    	if(CyberGIS.isString(names))
    	{
    		columnNames = [names];
    	}
    	else if(CyberGIS.isArray(names))
    	{
    		columnNames = names;
    	}    	
    	if(columnNames!=undefined)
    	{
    		for(var i = 0; i < columnNames.length; i++)
        	{
        		var columnName = columnNames[i];
        		for(var j = 0; j < header.length; j++)
            	{
            		if((header[j]).toLowerCase()==columnName.toLowerCase())
            		{
            			columnIndex = j;
            			break;
            		}
            	}
        		if(columnIndex!=-1)
        		{
        			break;
        		}
        	}
    	}   
    	return columnIndex;
    },    
    CLASS_NAME: "OpenLayers.Format.SOAP"
});

OpenLayers.Layer.HIUTileCache = OpenLayers.Class(OpenLayers.Layer.TMS,
{
    initialize: function(name, options)
    {
        var newArguments;
        options = OpenLayers.Util.extend
        ({
            type: 'png',
            units: 'm',
            projection: 'EPSG:900913',
            displayOutsideMaxExtent: true,
            wrapDateLine: true,
            buffer: 0,
            isBaseLayer: true,
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34)
        }, options);
        newArguments = [name, ['http://hiu-maps.net/hot/'], options];
        OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
    },
    CLASS_NAME: 'OpenLayers.Layer.HIUTileCache'
});
OpenLayers.Layer.HIUTileCache2 = OpenLayers.Class(OpenLayers.Layer.TMS,
{
	initialize: function(name, servers, options)
	{
		var newArguments;
        options = OpenLayers.Util.extend(
        {
        	type: 'png',
            //serverResolutions: [156543.0339,78271.51695,39135.758475,19567.8792375,9783.93961875,4891.969809375,2445.9849046875,1222.99245234375,611.496226171875],//,2445.9849046875,1222.99245234375,611.496226171875],
            units: 'm',
            projection: 'EPSG:900913',
            //numZoomLevels: 20,
            //minResolution: 152.874056543,
            displayOutsideMaxExtent: false,
            wrapDateLine: false,
            buffer: 0,
            isBaseLayer: false,
            //sphericalMercator: true,
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34)
        }, options);
        //newArguments = [name, ['http://a.tiles.mapbox.com/hiu/','http://b.tiles.mapbox.com/hiu/','http://c.tiles.mapbox.com/hiu/','http://c.tiles.mapbox.com/hiu/'],options];
        newArguments = [name,$.map(servers.split(","),function(s){return $.trim(s);}),options];
        OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
	},
	CLASS_NAME: 'OpenLayers.Layer.HIUTileCache2'
});

// MapBox Connector for OpenLayers 2.13

// The url of the MapBox logo for maps
// @const
// - @type {string}
var MAPBOX_LOGO = 'http://js.mapbox.com/img/mapbox.png';

OpenLayers.Layer.MapBox = OpenLayers.Class(OpenLayers.Layer.TMS, {
    // Do not remove the MapBox or OpenStreetMap attribution from this code,
    // doing so is in violation of the terms of both licenses.
    initialize: function(name, options) {
        var newArguments;
        options = OpenLayers.Util.extend
        ({
            attribution: "<a style='background: url(" + MAPBOX_LOGO + "); height: 22px; width: 80px; float: left; clear: left;margin-right: 10px;' href='http://mapbox.com'></a> <span style='vertical-align: middle;'>|</span> <a style='font-family: sans-serif; text-decoration: none; color: #263E55;vertical-align: middle;font-size: 90%;' href='http://mapbox.com/tos'>Terms of Service</a>",
            type: 'png',
            // required for all MapBox maps; these help load tiles correctly
            /*serverResolutions: [
              156543.0339,
              78271.51695,
              39135.758475,
              19567.8792375,
              9783.93961875,
              4891.969809375,
              2445.9849046875,
              1222.99245234375,
              611.496226171875],*/
            units: 'm',
            projection: 'EPSG:900913',
            //numZoomLevels: 9,
            displayOutsideMaxExtent: true,
            //minResolution: 611.496226171875,
            //minResolution:611.4962261962891,
            wrapDateLine: true,
            // performance optimization for tile loading from multiple CNAMEs
            buffer: 0,
            // customizable per map, this is just the default. set to false for overlays
            isBaseLayer: true,
            // customizable per map, set to different bounds to avoid red tiles
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
            
            serviceVersion: 'v1'
        }, options);
        if (options.osm) {
          options.attribution = "<a style='background: url(" + MAPBOX_LOGO + "); height: 22px; width: 80px; float: left; clear: left;margin-right: 10px;' href='http://mapbox.com'></a> <span style='vertical-align: middle;'>|</span> <a style='font-family: sans-serif; text-decoration: none; color: #263E55;vertical-align: middle;font-size: 90%;' href='http://mapbox.com/tos'>Terms of Service</a> <span style='font-family: sans-serif; text-decoration: none; color: #263E55;vertical-align: middle;font-size: 90%;'>| Data &copy; OSM CCBYSA</span>";
        }
        var protocol = options.ssl==true?"https":"http";
        
	    newArguments = [name,
	    [
	     protocol+'://a.tiles.mapbox.com/',
	     protocol+'://b.tiles.mapbox.com/',
	     protocol+'://c.tiles.mapbox.com/',
	     protocol+'://d.tiles.mapbox.com/'
	    ], options];
        
	    
        OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
    },
    CLASS_NAME: 'OpenLayers.Layer.MapBox'
});

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

OpenLayers.Protocol.SOAP = OpenLayers.Class(OpenLayers.Protocol.HTTP,
{
   	list: undefined,
   	columns: undefined,
   	//['id','Title','Entered','Source','URL','Description','Region','TypeOfItem','Category','Latitude','Longitude']
   	
	initialize: function(options)
    {
   		OpenLayers.Protocol.HTTP.prototype.initialize.apply(this, [options]);
    },
    
    buildEnvelope: function(list,columns,query)
    {
    	var soap = '';
    	soap +=	'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
    	soap +=		'<soap:Body>';
    	soap +=			'<GetListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">';
    	soap +=				'<listName>'+list+'</listName>';
    	soap +=				'<rowLimit>'+1000+'</rowLimit>';
    	if(columns!=undefined)
    	{
        	soap +=				'<viewFields><ViewFields>';
    		$.each(columns,function(index,value){soap +='<FieldRef Name="'+value+'"/>';});
    		soap += 				'</ViewFields></viewFields>';
    	}
    	if(query!=undefined)
    	{
    		soap +=				'<query>'+query+'</query>';
    	}
    	soap +=				'<queryOptions><QueryOptions><IncludeAttachmentUrls>TRUE</IncludeAttachmentUrls></QueryOptions></queryOptions>';
    	soap +=			'</GetListItems>';
    	soap +=		'</soap:Body>';
    	soap +=	'</soap:Envelope>';
    	
    	return soap;
    },
    parseFeatures: function(request)
    {
    	 return this.format.read(request.responseText,this.columns);
    },
    read: function(options)
    {
    	OpenLayers.Protocol.prototype.read.apply(this, arguments);
    	options = OpenLayers.Util.extend({}, options);
    	OpenLayers.Util.applyDefaults(options, this.options || {});
    	var response = new OpenLayers.Protocol.Response({requestType: "read"});
         
    	options.headers = {"Accept":"application/xml, text/xml, */*, q=0.01","Content-Type":"text/xml; charset=\"UTF-8\""};
    	
    	var data = this.buildEnvelope(this.list,this.columns,undefined);
		
		response.priv = OpenLayers.Request.POST
		({
			authenticated: (options.authenticated==true),
			url: options.url,
			callback: this.createCallback(this.handleRead, response, options),
			params: options.params,
			headers: options.headers,
			data: data
		});
		
		return response;
    },
      
    CLASS_NAME: "OpenLayers.Protocol.SOAP"
});

OpenLayers.Strategy.JIT = OpenLayers.Class(OpenLayers.Strategy.Fixed,
{
	regex_field: "^(\\${)(\\w+)(})$",
	regex_bbox: "^(\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)$",
	
	//refresh: undefined,
	//join: undefined,
	//file: undefined,
	//agg: undefined,
	grep: undefined,/* Global Grep for all features.  Executed first within onLoadEvent before jobs execute*/
	jobs: undefined,
	
	listeners: [],//{url,context,job}
	
	hideEmpty: true,
	
	allFeatures: undefined,
	validFeatures: undefined,/* Grep'd allFeatures if grep != undefined*/
	activeFeatures: undefined,
	
	/* These variables are updated at the beginning of onLoadEnd and should be valid during any job*/
	currentExtent: undefined,

	initialize: function(jobs, grep, options)
    {
		OpenLayers.Strategy.Fixed.prototype.initialize.apply(this, [options]);
        if(OpenLayers.Util.isArray(jobs))
        {
        	this.setJobs(jobs);
        }
        this.setGrep(grep);
    },
    
    setJobs: function(jobs)
    {
    	this.jobs = jobs;
    	for(var i = 0; i < this.jobs.length; i++)
    	{
    		var job = this.jobs[i];
    		job.id = job.id || i;
    	}
    },
    setGrep: function(grep)
    {
    	this.grep = grep;
    },
    getJob: function(i)
    {
    	var job = undefined;
    	if(this.jobs!=undefined)
    	{
    		job = this.jobs[i];
    	}
    	return job;
    },
    getNumberOfJobs: function()
    {
    	var n = 0;
    	if(this.jobs!=undefined)
    	{
    		n = this.jobs.length;
    	}
    	return n; 
    },
	
	merge: function(mapProjection, resp)
	{
        var layer = this.layer;
        layer.destroyFeatures();
        var features = resp.features;
        if (features && features.length > 0)
        {
            if(!mapProjection.equals(layer.projection))
            {
                var geom;
                for(var i=0, len=features.length; i<len; ++i)
                {
                    geom = features[i].geometry;
                    if(geom)
                    {
                        geom.transform(layer.projection, mapProjection);
                    }
                }
            }
            
            this.allFeatures = features;
            //activeFeatures = $.grep(features,function(){});
            //layer.addFeatures(features);
            //layer.addFeatures(activeFeatures);
        }
        else
        {
        	this.allFeatures = [];
        }
        layer.events.triggerEvent("loadend", {response: resp});
    },
	
    initJobs: function()
    {
    	var bInit = false;
    	for(var i = 0; i < this.jobs.length; i++)
    	{
    		var job = this.jobs[i];
    		if(job.refresh!=undefined)
    		{
    			if(job.refresh.init!=undefined)
    			{
    				if(job.refresh.init==true)
    				{
    					bInit = true;
    					break;
    				}
    			}
    		}
    	}
    	if(bInit)
    	{
    		this.layer.events.on(
	    	{
	    		loadend: function(e)
	    		{
	    			var layer = this;
	    			if(layer.options.jit!=undefined)
	    			{
	    				var strategy = layer.strategies[0];
	    				strategy.onLoadEnd.apply(strategy);
	    			}
	    		}
	    	});
    	}
    },    
    onLoadEnd: function()
    {
    	this.currentExtent = this.getCurrentExtent();
    	this.validFeatures = this.grepFeatures(this.allFeatures);
    	/////////////////////////////////    	
    	for(var i = 0; i < this.jobs.length; i++)
    	{
    		var job = this.jobs[i];
    		var bInit = false;
    		if(job.refresh!=undefined)
    		{
    			if(job.refresh.init!=undefined)
    			{
    				bInit = (job.refresh.init==true);
    			}
    		}
    		if(bInit)
    		{
    			if(job.type=="simple")
    			{
    				this.runTasks(job);
    			}
    			else if(job.type=="advanced")
    			{
	        		if(job.remote!=undefined)
	        		{
	        			if(job.remote.join!=undefined)
	        			{
	        				if(job.remote.source!=undefined)
	        				{
	        					var sourceName = job.remote.source;
	        					var joinType = job.remote.join.type;
	        					var left = job.remote.join.left;
	        					var include = job.remote.join.include;
	        					
	        					if(joinType=="single")
	        					{
	        						if(sourceName!=undefined&&joinType!=undefined&&left!=undefined&&include!=undefined)
		        					{
		        						this.jit_source(job,sourceName,joinType,undefined,left,include,undefined);
		        					}	
	        					}
	        					else if(joinType=="left")
	        					{ 
	        						var dest = job.destination||"jit";
	        						if(sourceName!=undefined&&joinType!=undefined&&left!=undefined&&include!=undefined)
		        					{
		        						this.jit_source(job,sourceName,joinType,undefined,left,include,dest);
		        					}
	        					}
	        					else if(joinType=="pcode")
	        					{
	        						var dest = job.destination||"jit";
	        						var level = job.remote.join.level;
	        						if(sourceName!=undefined&&joinType!=undefined&&level!=undefined&&left!=undefined&&include!=undefined)
		        					{
		        						this.jit_source(job,sourceName,joinType,level,left,include,dest);
		        					}
	        					}	        					
	        				}
	        				else if(job.remote.file!=undefined)
		        			{
		        				var url = job.remote.file.url;
		    	        		var delimiter = job.remote.file.delimiter;
		    	        		if(url!=undefined&&delimiter!=undefined)
		    	        		{
			        				var layer = this.layer;
		    	        			var strategy = this;
		    	        			this.listeners.push({"url":url,"context":this,"job":job});
		    	        			$.ajax({url: url,type: "GET",contentType: "application/json; charset=\"utf-8\"",beforeSend: hiu.beforeSend,complete: function(xData,status)
				            		{
				            			var j2 = layer.options.jit;
				            			if(j2!=undefined)
				            			{
				            				strategy.jit_response.apply(strategy,[url,xData.responseText]);
				                			layer.redraw();
				            			}
				            		}});
		    	        		}
		        			}
	        			}
	        		}
    			}
    		}
    	}
    },
    grepFeatures: function(features)
    {
    	if(this.grep!=undefined)
    	{
    		var that = this;
        	return $.grep(features,function(f){return that.testFeature.apply(that,[f,f.attributes,that.grep]);});
    	}
    	return features;
    },
    
    
    getCurrentExtent: function()
    {
    	var extent = undefined;
    	var m = this.layer.map;
    	var c = m.getCachedCenter();
    	var r = m.getResolution();    
        if ((c != null) && (r != null))
        {
            var halfWDeg = (m.size.w * r) / 2;
            var halfHDeg = (m.size.h * r) / 2;        
            extent = new OpenLayers.Bounds(c.lon - halfWDeg, c.lat - halfHDeg, c.lon + halfWDeg, c.lat + halfHDeg);
        }
        return extent;
    },
    
    runJob: function(i)
    {
    	var job = this.getJob(i);
    	if(job!=undefined)
    	{
    		if(job.type=="basic")
    		{
    			this.runTasks(job);
    		}
    	}
    },
    
    runTasks: function(job)
    {
    	if(job.tasks!=undefined)
    	{
        	for(var i = 0; i < this.validFeatures.length; i++) 
    		{
    			var f = this.validFeatures[i];
	    		for(var j = 0; j < job.tasks.length; j++)
	    		{
	    			var task = job.tasks[j];
	    			this.calc(task,f,undefined);
	    		}
    	    	this.setCompiled(f,job.id,'success');
    		}			
    	}
    	
    	if(job.type=="simple")
    	{
    		if(job.grep!=undefined)
    		{
    			var that = this;
    			this.activeFeatures = $.grep(this.validFeatures,function(f,i){return that.testFeature(f,f.attributes,job.grep);});
    		}
    		else
    		{
    			this.activeFeatures = this.validFeatures;
    		}
    	}
    	else if(job.type=="advanced")
    	{
    		if(job.grep!=undefined)
    		{
    			var that = this;
    			this.activeFeatures = $.grep(this.validFeatures,function(f,i){return that.testFeature(f,f.attributes,job.grep);});
    			
    			if(this.hideEmpty)
        		{
        			this.activeFeatures = $.grep(this.activeFeatures,function(f,i){return f.attributes.jit.length>0;});
        		}
    		}
    		else
    		{
    			if(this.hideEmpty)
        		{
        			this.activeFeatures = $.grep(this.validFeatures,function(f,i){return f.attributes.jit.length>0;});
        		}
        		else
        		{
        			this.activeFeatures = this.validFeatures;	
        		}
    		}
    	}

		this.layer.removeAllFeatures({"silent":true});
		this.layer.addFeatures(this.activeFeatures);
    	
		this.layer.redraw();
    },    
    
	jit_response: function(url,responseText)
	{
		var newListeners = [];
    	for(var i = 0; i < this.listeners.length; i++)
    	{
    		var listener = this.listeners[i];
    		if(listener.url==url)
    		{
    			var job = listener.job;
    			if(job.remote!=undefined)
    			{
    				if(job.remote.join!=undefined&&job.remote.file!=undefined)
    				{
    					var type = job.remote.join.type;
    					if(type=="left"||type=="pcode")
    					{
    						var left = job.remote.join.left;
        					var right = job.remote.join.right;
        					var delimiter = job.remote.file.delimiter;
        					
        					if(left!=undefined&&right!=undefined&&delimiter!=undefined)
        					{
        						var rows = responseText.split("\n");
        	    				rows = $.grep(rows,function(row,i){return $.trim(row).length>0;});
        	    				
        	    				if(rows.length>1)
        	    				{
        	    					if(type=="left")
                					{
            							for(var j = 0; j < this.validFeatures.length; j++) 
            	    					{
            	    						var f = this.validFeatures[j];
            	    						this.jit_feature(job,f,rows,right,f.attributes[""+left],delimiter,type,undefined);
            	    					}
                					}
                					else if(type=="pcode")
                					{
                    					var level = job.remote.join.level;
                    					
                    					for(var j = 0; j < this.validFeatures.length; j++) 
            	    					{
            	    						var f = this.validFeatures[j];
            	    						this.jit_feature(job,f,rows,right,f.attributes[""+left],delimiter,type,level);
            	    					}
                					}
        	    				}
        	    				
    	    	    			this.activeFeatures = $.grep(this.validFeatures,function(f,i){return (f.attributes.jit==undefined)?(false):(f.attributes.jit.length>0);});
    	    	    			
    	    	    			this.layer.removevalidFeatures({"silent":true});
    	    	    			this.layer.addFeatures(this.activeFeatures);
        	    				
        						this.layer.redraw();
        					}
    					}
    				}
    			}
    		}
    		else
    		{
    			newListeners.push(listener);
    		}
    	}
    	this.listeners = newListeners;
	},
	jit_feature: function(job,f,rows,id,value,delimiter,type,level)
    {
    	if(!this.isFeatureCompiled(f,job.id))
		{
			var h = $.map(rows[0].split(delimiter),function(hi,i){return OpenLayers.String.trim(hi);});
    		var columnIndex = this.getColumnIndex(h,id);
			if(columnIndex!=-1)
			{
				var a = [];
		    	for(var i = 1; i < rows.length; i++)
		    	{
		    		var r = rows[i];
		    		var b = $.map(r.split(delimiter),function(bi,i){return OpenLayers.String.trim(bi);});
		    		if(type=="left")
		    		{
		    			if(b[columnIndex]!=undefined)
		    			{
			    			if(b[columnIndex].toLowerCase()==value.toLowerCase())
				    		{
				    			var v = {};
				    			for(var j = 0; j < h.length; j++)
				    			{
				    				v[""+h[j]] = b[j];
				    			}
				    			a.push(v);
				    		}
		    			}
		    		}
		    		else if(type=="pcode")
		    		{
		    			if(b[columnIndex]!=undefined)
		    			{
			    			if(OpenLayers.String.startsWith(b[columnIndex].toLowerCase(),value.toLowerCase()))
				    		{
				    			var v = {};
				    			for(var j = 0; j < h.length; j++)
				    			{
				    				v[""+h[j]] = b[j];
				    			}
				    			a.push(v);
				    		}
		    			}
		    		}
		    	}
		    	
		    	f.attributes.jit = a;
		    	
		    	if(job.tasks!=undefined)
		    	{
		    		for(var i = 0; i < job.tasks.length; i++)
		    		{
		    			this.calc(job.tasks[i],f,a);
		    		}
		    	}
			}	
			this.setCompiled(f,job.id,'success');
		}
    },	
	jit_source: function(job,sourceName,type,level,left,include,dest)
	{
		if(type!=undefined)
		{
			var source = hiu.client.getDataSource.apply(hiu.client,[sourceName]);
			if(source!=undefined)
			{
				if(type=="single")
				{
					for(var j = 0; j < this.validFeatures.length; j++) 
					{
						var f = this.validFeatures[j];
						var key = f.attributes[""+left];
						
						var a = source.getValue(key);
						f.attributes[""+sourceName] = a;
						f.attributes = OpenLayers.Util.applyDefaults(OpenLayers.Util.extend({},f.attributes),a);
						
						if(job.tasks!=undefined)
				    	{
				    		for(var i = 0; i < job.tasks.length; i++)
				    		{
				    			this.calc(job.tasks[i],f,a);
				    		}
				    	}
						this.setCompiled(f,job.id,'success');
					}
					
					if(include=="all")
					{
						this.activeFeatures = this.validFeatures;
					}
					else
					{
						this.activeFeatures = $.grep(this.validFeatures,function(f,i){return f.attributes[""+sourceName]!=undefined;});
					}
				}
				else if(type=="left")
				{
					/* TODO */
					if(include=="all")
					{
						for(var j = 0; j < this.validFeatures.length; j++) 
						{
							var f = this.validFeatures[j];
							var key = f.attributes[""+left];
							var a = [];
							var b = source.getValue(key);
							if(b!=undefined)
							{
								for(var i = 0; i < b.length; i++)
								{
									a.push(b[i]);
								}
							}
							f.attributes[""+dest] = a;
							if(job.tasks!=undefined)
					    	{
					    		for(var i = 0; i < job.tasks.length; i++)
					    		{
					    			this.calc(job.tasks[i],f,a);
					    		}
					    	}
							this.setCompiled(f,job.id,'success');
						}
					}
					else
					{
						this.activeFeatures = $.grep(this.validFeatures,function(f,i){return (f.attributes[""+dest]==undefined)?(false):(f.attributes[""+dest].length>0);});
					}
				}
				else if(type=="pcode")
				{					
					for(var j = 0; j < this.validFeatures.length; j++) 
					{
						var f = this.validFeatures[j];
						var key = f.attributes[""+left];
						var a = [];
						var b = source.getValues(key,true,level); 
						for(var i = 0; i < b.length; i++)
						{
							a.push(b[i]);
						}
						f.attributes[""+dest] = a;
						if(job.tasks!=undefined)
				    	{
				    		for(var i = 0; i < job.tasks.length; i++)
				    		{
				    			this.calc(job.tasks[i],f,a);
				    		}
				    	}
						this.setCompiled(f,job.id,'success');
					}
					
					if(include=="all")
					{
						this.activeFeatures = this.validFeatures;
					}
					else
					{
						this.activeFeatures = $.grep(this.validFeatures,function(f,i){return (f.attributes[""+dest]==undefined)?(false):(f.attributes[""+dest].length>0);});
					}
				}
			}
			else
			{
				for(var j = 0; j < this.validFeatures.length; j++) 
				{
					this.setCompiled(this.validFeatures[j],job.id,'SOURCE UNAVAILABLE');
				}
			}
		}
		
		this.layer.removeAllFeatures({"silent":true});
		this.layer.addFeatures(this.activeFeatures);
		
		this.layer.redraw();
	},
    
	isFeatureCompiled: function(f,job)
	{
    	return CyberGIS.getJSON(["jit","compiled",""+job],f.attributes)==true;
	},
    getColumnIndex: function(h,id)
    {
    	var columnIndex = -1;
    	for(var i = 0; i < h.length; i++)
    	{
    		if((h[i]).toLowerCase()==id.toLowerCase())
    		{
    			columnIndex = i;
    			break;
    		}
    	}
    	return columnIndex;
    },
    setCompiled: function(f,job,status)
    {
    	if(f.attributes.jit==undefined)
    	{
    		f.attributes.jit = {'compiled':{},'status':{}};
    	}
    	f.attributes.jit.compiled[""+job] = true;
    	f.attributes.jit.status[""+job] = status;
    },    
    calc: function(task,feature,aData)
    {
    	if(task.op=="copy")
    	{
    		this.calc_copy(feature,task.output,task.input,task.where);
    	}
    	else if(task.op=="parse")
    	{
    		this.calc_parse(feature,task.output,task.input,task.type);
    	}
    	else if(task.op=="concat")
    	{
    		this.calc_concat(feature,task.output,task.input,task.where);
    	}
    	else if(task.op=="split")
    	{
    		this.calc_split(feature,task.output,task.input,task.delimiter,task.where);
    	}
    	else if(task.op=="join")
    	{
    		this.calc_join(feature,task.output,task.input,task.delimiter,task.where);
    	}
    	else if(task.op=="grep")
    	{
    		this.calc_grep(feature,task.output,task.input,task.values,task.keep,task.where);
    	}
    	else if(task.op=="count")
    	{
    		this.calc_count(feature,aData,task.output,task.where);
    	}
    	else if(task.op=="sum")
    	{
    		this.calc_sum(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="min")
    	{
    		this.calc_min(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="max")
    	{
    		this.calc_max(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="avg")
    	{
    		this.calc_avg(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="strip_fields")
    	{
    		this.calc_strip_fields(feature,task.fields,task.characters);
    	}
    	else if(task.op=="strip_array")
    	{
    		this.calc_strip_array(feature,aData,task.array_input,task.array_output,task.fields,task.field_input,task.field_output,task.characters);
    	}
    },    
    calc_parse: function(feature,output,input,type)
    {
    	if(CyberGIS.isString(type)&&CyberGIS.isString(output)&&CyberGIS.isString(input))
    	{
			var a = feature.attributes;
			var sInput = a[""+input];
			if(CyberGIS.isString(sInput))
			{
				if(type=="int"||type=="integer")
				{
					a[""+output] = parseInt(sInput,10);
				}
				else if(type=="float"||type=="double")
				{
					a[""+output] = parseFloat(sInput);
				}
			}
    	}    	
    },
    calc_copy: function(feature,output,input,w)
    {
    	if(this.testFeature(feature,feature.attributes,w))
    	{
        	var value = undefined;
    		if(CyberGIS.isString(input))
    		{
    			if(CyberGIS.isField(input))
    			{
        			var an = CyberGIS.extractField(input);
        			if(an!=undefined)
        			{
        				value = this.attr_s(an,feature.attributes);
        			}
        			else
        			{
        				value = u;
        			}
    					
    			}
    			else
    			{
    				value = oInput;
    			}
    		}
    		else
    		{
    			value = this.attr(input,feature.attributes);
    		}
        	feature.attributes[""+output] = value;
    	}
    },
    calc_concat: function(feature,output,aInput,w)
    {
    	if(this.testFeature(feature,feature.attributes,w))
    	{
        	var str = "";
    		for(var i = 0; i < aInput.length; i++)
        	{
        		var oInput = aInput[i];
        		if(CyberGIS.isString(oInput))
        		{
        			if(CyberGIS.isField(oInput))
        			{
            			var an = CyberGIS.extractField(oInput);
            			if(an!=undefined)
            			{
            				str += this.attr_s(an,feature.attributes);
            			}
            			else
            			{
            				str += "";
            			}
        					
        			}
        			else
        			{
            			str += oInput;
        			}
        		}
        		else
        		{
        			str += this.attr(oInput,feature.attributes);
        		}
        	}
        	feature.attributes[""+output] = str;
    	}
    },
    calc_split: function(feature,output,input,delimiter,w)
    {
    	if(this.testFeature(feature,feature.attributes,w))
    	{
    		if(CyberGIS.isString(delimiter)&&CyberGIS.isString(output)&&CyberGIS.isString(input))
        	{
    			var a = feature.attributes;
    			a[""+output] = CyberGIS.split(a[""+input],delimiter);
        	}
    	}    	
    },
    calc_join: function(feature,output,input,delimiter,w)
    {
    	if(this.testFeature(feature,feature.attributes,w))
    	{
    		if(CyberGIS.isString(delimiter)&&CyberGIS.isString(output)&&CyberGIS.isString(input))
        	{
    			var a = feature.attributes;
    			a[""+output] = CyberGIS.join(a[""+input],delimiter);
        	}
    	}    	
    },
    calc_grep: function(feature,output,input,aValues,bKeep,w)
    {
    	if(this.testFeature(feature,feature.attributes,w))
    	{
    		if(bKeep==undefined)
    		{
    			bKeep = true;
    		}
    		if(CyberGIS.isString(output)&&CyberGIS.isString(input)&&CyberGIS.isArray(aValues))
        	{
    			feature.attributes[""+output] = CyberGIS.grep(feature.attributes[""+input], aValues, bKeep);
        	}
    	}   
    },
    calc_count: function(feature,aData,output,w)
    {
    	if(w!=undefined)
    	{
    		var d2 = undefined;
    		if(w.op=="="||w.op=="==")
			{
    			d2 = $.grep(aData,function(d,i)
				{
					return d[""+w.field]==w.value;
				});	
			}
			else if(w.op=="!="||w.op=="<>")
			{
				d2 = $.grep(aData,function(d,i)
				{
					return d[""+w.field]!=w.value;
				});	
			}
			else if(w.op=="not in"||w.op=="notin"||w.op=="not_in")
			{
				d2 = $.grep(aData,function(a,i)
				{
					return $.inArray(a[""+w.field],w.values)==-1;
				});	
			}
			else
			{
				d2 = aData;
			}
    		feature.attributes[""+output] = d2.length;
    	}
    	else
    	{
    		feature.attributes[""+output] = aData.length;
    	}
    },
    calc_sum: function(feature,aData,output,input)
    {
    	var sum = 0;
    	for(var i = 0; i < aData.length; i++)
    	{
    		sum += aData[i][""+input];
    	}    	
    	feature.attributes[""+output] = sum;
    },
    calc_min: function(feature,aData,output,input)
    {
    	var min = undefined;
    	if(aData.length>0)
    	{
    		min = aData[0][""+input];
    		for(var i = 1; i < aData.length; i++)
        	{
        		if(aData[i][""+input]<min)
        		{
        			min = aData[i][""+input];
        		}
        	}
    	}   	
    	feature.attributes[""+output] = min;
    },
    calc_max: function(feature,aData,output,input)
    {
    	var max = undefined;
    	if(aData.length>0)
    	{
    		max = aData[0][""+input];
    		for(var i = 1; i < aData.length; i++)
        	{
        		if(aData[i][""+input]>max)
        		{
        			max = aData[i][""+input];
        		}
        	}
    	}   	
    	feature.attributes[""+output] = max;
    },
    calc_avg: function(feature,aData,output,input)
    {
    	var sum = 0;
    	for(var i = 0; i < aData.length; i++)
    	{
    		sum += aData[i][""+input];
    	}
    	feature.attributes[""+output] = sum/aData.length;
    },
    calc_strip_fields: function(feature,aFields,characters)
    {
    	if(CyberGIS.isString(characters))
    	{
    		if(CyberGIS.isArray(aFields))
    		{
    			var a = feature.attributes;
    			for(var i = 0; i < aFields.length; i++)
    			{
    				a[""+aFields[i]] = CyberGIS.strip(a[""+aFields[i]],characters);
    			}
    		}
    	}
    },
    calc_strip_array: function(feature,aData,aInput,aOutput,aFields,fInput,fOutput,characters)
    {
    	if(CyberGIS.isString(aInput) && CyberGIS.isString(aOutput) && CyberGIS.isString(characters))
    	{
    		if(CyberGIS.isArray(aFields))
    		{
    			var c = [];
    			for(var i = 0; i < aData.length; i++)
        		{
        			var a = aData[i];
        			var b = CyberGIS.extend({},a);
        			for(var j = 0; j < aFields.length; j++)
        			{
        				b[""+aFields[j]] = CyberGIS.strip(b[""+aFields[j]],characters);
        			}
        			c.push(b);
        		}
    			feature.attributes[""+aOutput] = c;
    		}
    		else if(CyberGIS.isString(fInput) && CyberGIS.isString(fOutput))
    		{
    			var c = [];
    			for(var i = 0; i < aData.length; i++)
        		{
        			var a = aData[i];
        			var b = CyberGIS.extend({},a);
        			b[""+fOutput] = CyberGIS.strip(b[""+fInput],characters);
        			c.push(b);
        		}
    			feature.attributes[""+aOutput] = c;
    		}
    		else
    		{
    			feature.attributes[""+aOutput] = undefined;
    		}
    		
    	}
    	else
    	{
    		feature.attributes[""+aOutput] = undefined;
    	}
    },
    
    testFeature: function(f,a,w)
    {
    	if(a!=undefined&&w!=undefined)
    	{
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
    		else if(w.op=="not in"||w.op=="notin"||w.op=="not_in")
    		{
    			return $.inArray(a[""+w.field],w.values)==-1;
    		}
    		else if(w.op=="intersects")
    		{
    			if(CyberGIS.isField(w.bbox)&&CyberGIS.extractField(w.bbox)=="map")
    			{
    				return this.currentExtent.intersectsBounds(f.geometry.getBounds());
    			}
    			else if(w.bbox.match(new RegExp(CyberGIS.regex_bbox)))
    			{
    				return (new OpenLayers.Bounds.fromString(w.bbox)).intersectsBounds(f.geometry.getBounds());
    			}
    			else
    			{
    				return true;
    			}
    		}
    		else
    		{
    			return true;
    		}
    	}
		else
		{
			return true;
		}
    },
       
    attr: function(ap,av)
	{
		var an = ap.name;
		var at = ap.type;
		var s = "";
		if(at=="string")
		{
			s = this.attr_s(an,av);
		}
		else if(at=="int"||at=="integer")
		{
			s = this.attr_int(an,av);
		}		
		else if(at=="hashmap")
		{
			s = this.attr_hm(an,av,ap.hashmap);
		}
		else if(at=="pcode")
		{
			s = this.attr_pc(an,av,ap.pcode);
		}
		else
		{
			s = this.attr_s(an,av);
		}
		return s;
	},
	attr_s: function(an,av)
	{
		var s = "Not Found!";
		if(av!=undefined)
		{
			if(av[""+an]!=undefined)
			{
				s = av[""+an];
			}
		}		
		return s;
	},
	attr_int: function(an,av)
	{
		var s = "Not Found!";
		if(av!=undefined)
		{
			if(av[""+an]!=undefined)
			{
				var a = av[""+an];
				if(a!=undefined)
				{
					a = $.trim(a);
					if(a.match(new RegExp("^([-+]?)(\\d+)$",'gi')))
					{
						s = CyberGIS.Number.formatInteger(parseInt(a,10));
					}
				}
			}
		}
		return s;
	},
	attr_hm: function(an,av,hm)
	{
		var s = "Not Found!";
		if(av!=undefined)
		{
			if(av[""+an]!=undefined)
			{
				s = hiu.client.hashmaps[""+hm.ns][""+hm.id][av[""+an]];
			}
		}		
		return s;
	},
	attr_pc: function(an,av,pc)
	{
		var s = "Not Found!";
		if(av!=undefined)
		{
			if(av[""+an]!=undefined)
			{
				var level = pc.level;
				if(hiu.client.pcodes!=undefined)
				{
					var value = hiu.client.pcodes.getValue(level,av[""+an]);
					if(value!=undefined)
					{
						s = value[""+pc.label];	
					}
				}
				else
				{
					s = "No P-Codes Found for level "+level;
				}
			}
		}		
		return s;
	},
    
    CLASS_NAME: "OpenLayers.Strategy.JIT"
});
