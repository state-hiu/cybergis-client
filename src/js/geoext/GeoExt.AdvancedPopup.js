GeoExt.AdvancedPopup = Ext.extend(GeoExt.Popup,
{
	'anchored':true,
	'unpinnable':false,
	'resizable':false,
	'maximizable': false,
	'collapsible':false,
	'closeAction':'close',

	anchorPosition: "bottom-left",
	anchorPositionToBaseClass:
	{
		"top": {"classes":"hiu-popup-anc-top"},
		"top-left": {"classes":"hiu-popup-anc-top-left"},
		"top-right": {"classes":"hiu-popup-anc-top-right"},
		"left": {"classes":"hiu-popup-anc-left"},
		"right": {"classes":"hiu-popup-anc-right"},
		"bottom": {"classes":"hiu-popup-anc-bottom"},
		"bottom-left": {"classes":"hiu-popup-anc-bottom-left"},
		"bottom-right": {"classes":"hiu-popup-anc-bottom-right"}
	},
	
	getAnchorPosition: function()
	{
		return this.anchorPosition;
	},
	getAnchorClass: function()
	{
		if(this.anchorPositionToBaseClass[""+this.getAnchorPosition()]!=undefined)
		{
			var baseClass = this.anchorPositionToBaseClass[""+this.getAnchorPosition()].classes;
			if($.browser.msie)
				return baseClass+"-ie-"+this.width+"-"+this.height;
			else
				return baseClass+"-"+this.width+"-"+this.height;
		}
		else
			return "";		
	},
	isAnchorOnTop: function()
	{
		return this.getAnchorPosition()=="top"||this.getAnchorPosition()=="top-left"||this.getAnchorPosition()=="top-right";
	},
	isAnchorOnLeft: function()
	{
		return this.getAnchorPosition()=="left";
	},
	isAnchorOnRight: function()
	{
		return this.getAnchorPosition()=="right";
	},
	isAnchorOnBottom: function()
	{
		return this.getAnchorPosition()=="bottom"||this.getAnchorPosition()=="bottom-left"||this.getAnchorPosition()=="bottom-right";
	},
	onRender: function(ct, position)
	{
		GeoExt.Popup.superclass.onRender.call(this, ct, position);////Bypass GeoExt.Popup render function GeoExt.AdvancedPopup.superclass.onRender.call(this, ct, position);, so this overrides
		this.ancCls = this.getAnchorClass();
		this.createElement("anc", this.el.dom);
	},
	position: function()
	{
		if(this._mapMove === true)
		{
			var visible = this.map.getExtent().containsLonLat(this.location);
			if(visible !== this.isVisible())
			{
				this.setVisible(visible);
			}
		}
		if(this.isVisible())
		{
			var centerPx = this.map.getViewPortPxFromLonLat(this.location);
			var mapBox = Ext.fly(this.map.div).getBox(); 

			var anc = this.anc;
			var dx = anc.getLeft(true) + anc.getWidth() / 2;
			var dy = this.el.getHeight();
	    
			if(this.isAnchorOnTop())
			{
				dy = (-1*anc.getHeight())-6;
			}
			else if(this.isAnchorOnBottom())
			{
				dy += 4;
			}
			else if(this.isAnchorOnLeft())
			{
				dx = anc.getLeft(true);
				dy = (this.el.getHeight()/2)+4;
			}
			else if(this.isAnchorOnRight())
			{
				dx = anc.getLeft(true) + anc.getWidth()-2;
				dy = this.el.getHeight()/2;
			}
			this.setPosition(centerPx.x + mapBox.x - dx, centerPx.y + mapBox.y - dy);
		}
	},
	setPosition : function(x, y)
	{
		if(x && typeof x[1] == 'number')
        {
            y = x[1];
            x = x[0];
        }
        this.x = x;
        this.y = y;
        if(!this.boxReady){
            return this;
        }
        var adj = this.adjustPosition(x, y);
        var ax = adj.x, ay = adj.y;

        var el = this.getPositionEl();
        if(ax !== undefined || ay !== undefined){
            if(ax !== undefined && ay !== undefined){
                el.setLeftTop(ax, ay);
            }else if(ax !== undefined){
                el.setLeft(ax);
            }else if(ay !== undefined){
                el.setTop(ay);
            }
            this.onPosition(ax, ay);
            this.fireEvent('move', this, ax, ay);
        }
        return this;
    },
	initComponent: function()
	{
        GeoExt.AdvancedPopup.superclass.initComponent.call(this);
    }
});
