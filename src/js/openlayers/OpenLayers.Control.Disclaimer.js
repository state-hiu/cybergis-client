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
