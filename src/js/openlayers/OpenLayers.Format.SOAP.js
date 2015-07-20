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
