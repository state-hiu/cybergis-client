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
