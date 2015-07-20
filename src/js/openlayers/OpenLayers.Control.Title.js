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
