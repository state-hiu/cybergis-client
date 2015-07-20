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
