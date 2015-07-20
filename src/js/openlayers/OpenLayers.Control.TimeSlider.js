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
