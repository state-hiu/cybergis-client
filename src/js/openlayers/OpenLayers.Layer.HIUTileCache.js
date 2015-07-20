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
