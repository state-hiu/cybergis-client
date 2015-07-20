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
