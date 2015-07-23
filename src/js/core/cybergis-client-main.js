/*
===========Author===========
U.S. Department of State, Humanitarian Information Unit

===========Version===========
1.0 / February 8, 2014

===========Description===========
The cybergis-client-core javascript file contains the primary CyberGIS client application code, including CyberGIS.Client, CyberGIS.State, and CyberGIS.DataSource.  It is neccessary for all CyberGIS client applications.  It should come before any other CyberGIS client application code.

===========CyberGIS===========
The Humanitarian Information Unit has been developing a sophisticated geographic computing infrastructure referred to as the CyberGIS. The CyberGIS provides highly available, scalable, reliable, and timely geospatial services capable of supporting multiple concurrent projects.  The CyberGIS relies on primarily open source projects, such as PostGIS, GeoServer, GDAL, OGR, and OpenLayers.  The name CyberGIS is dervied from the term geospatial cyberinfrastructure.

===========License===========
This project constitutes a work of the United States Government and is not subject to domestic copyright protection under 17 USC § 105.

However, because the project utilizes code licensed from contributors and other third parties, it therefore is licensed under the MIT License. http://opensource.org/licenses/mit-license.php. Under that license, permission is granted free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the conditions that any appropriate copyright notices and this permission notice are included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
CyberGIS =
{
	lastSeqID: 0,
	dotless: /\./g,
	regex_field: "^(\\${)(\\w+)(})$",
	regex_bbox: "^(\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)$",
	regex_float: "^(\\s*)([-+]?\\d*[.]?\\d*)(\\s*)$",
		
	Class: function()
	{
	    var len = arguments.length;
	    var P = arguments[0];
	    var F = arguments[len-1];
	
	    var C = typeof F.initialize == "function" ? F.initialize : function(){ P.prototype.initialize.apply(this, arguments); };
	
	    if (len > 1)
	    {
	        var newArgs = [C, P].concat( Array.prototype.slice.call(arguments).slice(1, len-1), F);
	        CyberGIS.inherit.apply(null, newArgs);
	    }
	    else
	    {
	        C.prototype = F;
	    }
	    return C;
	},
	
	inherit: function(C, P)
	{
	   var F = function() {};
	   F.prototype = P.prototype;
	   C.prototype = new F;
	   var i, l, o;
	   for(i=2, l=arguments.length; i<l; i++)
	   {
	       o = arguments[i];
	       if(typeof o === "function")
	       {
	           o = o.prototype;
	       }
	       CyberGIS.extend(C.prototype, o);
	   }
	},
	
	extend: function(destination, source)
	{
	    destination = destination || {};
	    if(source)
	    {
	        for (var property in source)
	        {
	            var value = source[property];
	            if (value !== undefined)
	            {
	                destination[property] = value;
	            }
	        }

	        var sourceIsEvt = typeof window.Event == "function" && source instanceof window.Event;

	        if (!sourceIsEvt && source.hasOwnProperty && source.hasOwnProperty("toString"))
	        {
	            destination.toString = source.toString;
	        }
	    }
	    return destination;
	},	
	applyDefaults: function (to, from)
	{
	    to = to || {};
	    var fromIsEvt = typeof window.Event == "function" && from instanceof window.Event;
	    for(var key in from)
	    {
	        if(to[key] === undefined || (!fromIsEvt && from.hasOwnProperty && from.hasOwnProperty(key) && !to.hasOwnProperty(key)))
	        {
	            to[key] = from[key];
	        }
	    }
	   
	    if(!fromIsEvt && from && from.hasOwnProperty && from.hasOwnProperty('toString') && !to.hasOwnProperty('toString'))
	    {
	        to.toString = from.toString;
	    }
	    return to;
	},
	
	createUniqueID: function(prefix)
	{
	    if (prefix == null)
	    {
	        prefix = "id_";
	    }
	    else
	    {
	        prefix = prefix.replace(CyberGIS.dotless, "_");
	    }
	    CyberGIS.lastSeqID += 1;
	    return prefix + CyberGIS.lastSeqID;
	},

	copyDate: function(d)
	{
		return new Date(d.getFullYear(),d.getMonth(),d.getDate());
	},

	toLowerCase: function(a)
	{
		var b = undefined;
		if(CyberGIS.isString(a))
		{
			b = a.toLowerCase();
		}
		else if(CyberGIS.isArray(a))
		{
			b = [];
			for(var i = 0; i < a.length; i++)
			{
	    		b.push(a[i].toLowerCase());
			}
		}
    	return b;
	},
	
	isDefined: function(a)
	{
		var defined = true;
		if(CyberGIS.isArray(a))
		{
			defined = true;
			for(var i = 0; i < a.length; i++)
	    	{
	    		if(a[i]==undefined)
	    		{
	    			defined = false;
	    			break;
	    		}
	    	}
			return defined;
		}
		else
		{
			return a!=undefined;
		}
	},
	isArray: function(a)
	{
	    //return (Object.prototype.toString.call(a) === '[object Array]');
		return $.isArray(a);
	},
	isString: function(a)
	{
		return (typeof a == "string");
	},
	isNotBlank: function(a)
	{
		return  this.isString(a)&&$.trim(a).length>0;
	},
	isField: function(str)
    {
    	var bField = false;
    	if(typeof str == "string")
    	{
    		var matches = str.match(new RegExp(this.regex_field,'gi'));
        	if(matches!=undefined)
        	{
        		if($.isArray(matches))
        		{
        			bField = true;
        		}
        	}
    	}
    	return bField;
    },
    isNumber: function(a)
    {
    	return $.isNumeric(a);
    },
    extractField: function(str)
    {
    	var sField = undefined;
    	if(str!=undefined)
    	{
    		if(typeof str == "string")
    		{
    			sField = str.replace(new RegExp(this.regex_field,'gi'),"$2");
    		}
    	}
    	return sField;
    },

	
	hasFields: function(a,fields)
	{
		var valid = true; 
		for(var i = 0; i < fields.length; i++)
		{
			if(a[""+fields[i]]==undefined)
			{
				valid = false;
				break;
			}
		}		
		return valid;
	},
	
	getJSON: function(keyChain,node)
	{
		var json = undefined;
		if(keyChain.length==0)
		{
			json = node;
		}
		else
		{
			if(node!=undefined)
			{
				var newKeyChain = keyChain.slice(1); 
				var newNode = node[""+keyChain[0]];
				json = this.getJSON(newKeyChain,newNode);
			}
		}
		return json;
	},
	
	initAttribute: function(element, sAttribute, property, protoLayer, sField, fallback)
	{
		var value = undefined;
		/* Element */
		if(element!=undefined)
		{
			if(element.data(sAttribute)!=undefined)
			{
				value = element.data(sAttribute);
			}
		}
		
		if(value==undefined)
		{
			/* Property */
			if(property!=undefined)
			{
				value = property;
			}
			else
			{
				/* BaseLayer */
				if(protoLayer!=undefined)
				{
					if(protoLayer[''+sField]!=undefined)
					{
						value = protoLayer[''+sField];
					}
				}
			}
		}
		
		/* Fallback */
		if(value==undefined)
		{
			value = fallback;
		}
		return value;
	},
	
	hasLabel: function(ap)
	{
		return ap["label"]!=undefined;
	},
	getLabel: function(ap,av)
	{
		var sLabel = undefined;
		if(CyberGIS.isString(ap.label))
		{
			if(CyberGIS.isField(ap.label))
			{
				if(av!=undefined)
				{
					var sField = CyberGIS.extractField(ap.label);
					sLabel = ""+av[""+sField];
				}
			}
			else
			{
				sLabel = ap.label;
			}
		}
		return sLabel;
	},
	getLink: function(ap)
	{
		var sLink = undefined;
		if(CyberGIS.isString(ap.link))
		{
			sLink = "<a href=\""+ap.link+"\">[link]</a>";
		}
		return sLink;
	},
	getAttribute: function(sourceProjection,ap,av,g,z)
	{
		var an = ap.name;
		var at = ap.type;
		var s = "";
		if(at=="string")
		{
			s = this.attr_s(an,av,ap.fallback);
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
			s = this.attr_pc(an,av,ap.pcode,ap.fallback);
		}
		else if(at=="wiki")
		{
			s = this.attr_wiki(an,av,ap.wiki,ap.fallback);
		}
		else if(at=="x")
		{
			s = this.attr_x(g,undefined,undefined,4);
		}
		else if(at=="y")
		{
			s = this.attr_y(g,undefined,undefined,4);
		}
		else if(at=="xy")
		{
			s = this.attr_xy(g,undefined,undefined,4).join(",");
		}
		else if(at=="bbox")
		{
			s = this.attr_bbox(g,undefined,undefined,4).join(",");
		}
		else if(at=="latitude")
		{
			s = this.attr_y(g,sourceProjection,"EPSG:4326",4);
		}
		else if(at=="longitude")
		{
			s = this.attr_x(g,sourceProjection,"EPSG:4326",4);
		}
		else if(at=="lonlat")
		{
			s = this.attr_xy(g,sourceProjection,"EPSG:4326",4);
		}
		else if(at=="app")
		{
			s = this.attr_app(g,sourceProjection,"EPSG:4326",z,ap.app,ap.fallback);
		}
		else
		{
			s = this.attr_s(an,av,ap.fallback);
		}
		return s;
	},
	
	attr_s: function(an,av,fallback)
	{
		var s = fallback || "Not Found!";
		if(av!=undefined)
		{
			if(av[""+an]!=undefined)
			{
				s = av[""+an];
			}
		}
		return s;
	},
	attr_x: function(g,sourceProjection,targetProjection,precision)
	{
		var x = "";
		if(sourceProjection!=undefined&&targetProjection!=undefined)
		{
			var sourcePoint = undefined;
			if(g.CLASS_NAME=="OpenLayers.Geometry.Point")
			{
				sourcePoint = new OpenLayers.LonLat(g.x,g.y);
			}
			else
			{
				var c = g.getBounds().getCenterLonLat();
				sourcePoint = new OpenLayers.LonLat(c.lon,c.lat);
			}
			var targetPoint = CyberGIS.transformLatLon(sourcePoint,sourceProjection,targetProjection);
			x = targetPoint.lon.toFixed(precision);
		}
		else
		{
			var sourcePoint = undefined;
			if(g.CLASS_NAME=="OpenLayers.Geometry.Point")
			{
				sourcePoint = new OpenLayers.LonLat(g.x,g.y);
			}
			else
			{
				var c = g.getBounds().getCenterLonLat();
				sourcePoint = new OpenLayers.LonLat(c.lon,c.lat);
			}
			x = sourcePoint.lat.toFixed(precision);
		}
		return x;
	},
	attr_y: function(g,sourceProjection,targetProjection,precision)
	{
		var y = "";
		if(sourceProjection!=undefined&&targetProjection!=undefined)
		{
			var sourcePoint = undefined;
			if(g.CLASS_NAME=="OpenLayers.Geometry.Point")
			{
				sourcePoint = new OpenLayers.LonLat(g.x,g.y);
			}
			else
			{
				var c = g.getBounds().getCenterLonLat();
				sourcePoint = new OpenLayers.LonLat(c.lon,c.lat);
			}
			var targetPoint = CyberGIS.transformLatLon(sourcePoint,sourceProjection,targetProjection);
			y = targetPoint.lat.toFixed(precision);
		}
		else
		{
			var sourcePoint = undefined;
			if(g.CLASS_NAME=="OpenLayers.Geometry.Point")
			{
				sourcePoint = new OpenLayers.LonLat(g.x,g.y);
			}
			else
			{
				var c = g.getBounds().getCenterLonLat();
				sourcePoint = new OpenLayers.LonLat(c.lon,c.lat);
			}
			y = sourcePoint.lat.toFixed(precision);
		}
		return y;
	},
	attr_xy: function(g,sourceProjection,targetProjection,precision)
	{
		var x = undefined;
		var y = undefined;
		if(sourceProjection!=undefined&&targetProjection!=undefined)
		{
			var sourcePoint = undefined;
			if(g.CLASS_NAME=="OpenLayers.Geometry.Point")
			{
				sourcePoint = new OpenLayers.LonLat(g.x,g.y);
			}
			else
			{
				var c = g.getBounds().getCenterLonLat();
				sourcePoint = new OpenLayers.LonLat(c.lon,c.lat);
			}
			var targetPoint = CyberGIS.transformLatLon(sourcePoint,sourceProjection,targetProjection);
			x = targetPoint.lon;
			y = sourcePoint.lat;

			if(precision!=undefined)
			{
				x = x.toFixed(precision);
				y = y.toFixed(precision);
			}
		}
		else
		{
			var sourcePoint = undefined;
			if(g.CLASS_NAME=="OpenLayers.Geometry.Point")
			{
				sourcePoint = new OpenLayers.LonLat(g.x,g.y);
			}
			else
			{
				var c = g.getBounds().getCenterLonLat();
				sourcePoint = new OpenLayers.LonLat(c.lon,c.lat);
			}
			x = sourcePoint.lon;
			y = sourcePoint.lat;
			
			if(p!=undefined)
			{
				x = x.toFixed(precision);
				y = y.toFixed(precision);
			}
		}
		return [x,y];
	},
	attr_bbox: function(g,sourceProjection,targetProjection,precision)
	{
		var left = undefined;
		var bottom = undefined;
		var right = undefined;
		var top = undefined;
		
		if(sourceProjection!=undefined&&targetProjection!=undefined)
		{
			if(g.CLASS_NAME=="OpenLayers.Geometry.Point")
			{
				var c = CyberGIS.transformXY(g.x,g.y,sourceProjection,targetProjection);
				left = c.lon;
				bottom = c.lat;
				right = c.lon;
				top = c.lat;
			}
			else
			{
				var b = g.getBounds();
				var c1 = CyberGIS.transformXY(b.left, b.top, sourceProjection,targetProjection);
				var c2 = CyberGIS.transformXY(b.right, b.bottom,sourceProjection,targetProjection);
				
				left = c1.lon;
				bottom = c2.lat;
				right = c2.lon;
				top = c1.lat;
			}
		}
		else
		{
			if(g.CLASS_NAME=="OpenLayers.Geometry.Point")
			{
				left = g.x;
				bottom = g.y;
				right = g.x;
				top = g.y;
			}
			else
			{
				var b = g.getBounds();
				left = b.left;
				bottom = b.bottom;
				right = b.right;
				top = b.top;
			}
		}
		
		if(precision!=undefined)
		{
			left = left.toFixed(precision);
			bottom = bottom.toFixed(precision);
			right = right.toFixed(precision);
			top = top.toFixed(precision);
		}
		
		return [left, bottom, right, top];
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
				s  = CyberGIS.getJSON([(""+hm.ns),(""+hm.id),(av[""+an])],hiu.client.hashmaps);
			}
		}		
		return s;
	},
	attr_wiki: function(an,av,wiki,fallback)
	{
		var s = fallback || "No article found";
		if(av!=undefined)
		{
			if(av[""+an]!=undefined)
			{
				var w = hiu.client.getWiki(wiki);
				if(w==undefined)
				{
					s = av[""+an];
				}
				else
				{
					s = "<a href=\""+w.url + av[""+an]+"\">"+av[""+an]+"</a>";
				}
			}
		}		
		return s;
	},
	attr_app: function(g,sourceProjection,targetProjection,z,app,fallback)
	{
		var s = fallback || "No app found";
		var a = hiu.client.getApp(app);
		if(a!=undefined)
		{
			var xy = this.attr_xy(g,sourceProjection,targetProjection,undefined);
			var bbox = this.attr_bbox(g,sourceProjection,targetProjection,undefined);
			var u = a.getLink(xy[0],xy[1],z,bbox);
			s = "<a href=\""+u+"\">[link]</a>";
		}
		return s;
	},
	attr_pc: function(an,av,pc,fallback)
	{
		var s = fallback || "Not Found!";
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
	
	/* Parameter Functions */

	getParameterByName: function(name,ignoreCase) 
	{
		return this.getParameterAsString([name],window.location.href,ignoreCase);
	},
	getParameterAsString: function(names,url,ignoreCase)
	{
		var value = this.getParameter(names,url,ignoreCase);
		return value==null?"":value;
	},
	getParameterAsInteger: function(names,url,fallback,ignoreCase)
	{
		var sValue = this.getParameter(names,url,ignoreCase);
		return sValue==null?fallback:parseInt(sValue,10);
	},
	getParameterAsDouble: function(names,url,fallback,ignoreCase)
	{
		var sValue = this.getParameter(names,url,ignoreCase);
		return sValue==null?fallback:parseFloat(sValue);
	},
	getParameterAsIntegerArray: function(names,url,delimiter,ignoreCase)
	{
		var aValue = null;
		var sValue = this.getParameter(names,url,ignoreCase);
		if(sValue!=null)
		{
			if(CyberGIS.isString(sValue))
			{
				var a = sValue.split(delimiter);
				var b = new Array(a.length);
				for(var i = 0; i < a.length; i++)
				{
					b[i] = parseInt(a[i],10);
				}
				aValue = b;
			}
		}
		return aValue; 
	},
	getParameterAsFloatArray: function(names,url,delimiter,ignoreCase)
	{
		var aValue = null;
		var sValue = this.getParameter(names,url,ignoreCase);
		if(sValue!=null)
		{
			if(CyberGIS.isString(sValue))
			{
				var a = sValue.split(delimiter);
				var b = new Array(a.length);
				for(var i = 0; i < a.length; i++)
				{
					b[i] = parseFloat(a[i]);
				}
				aValue = b;
			}
		}
		return aValue; 
	},
	getParameterAsStringArray: function(names,url,delimiter,ignoreCase)
	{
		var aValue = null;
		var sValue = this.getParameter(names,url,ignoreCase);
		if(sValue!=null)
		{
			if(CyberGIS.isString(sValue))
			{
				aValue = sValue.split(delimiter);
			}
		}
		return aValue;
	},
	getParameter: function(names,url,ignoreCase) 
	{
		var value = null;
		if(url!=undefined)
		{
			ignoreCase = ignoreCase||false;
			for(var i = 0; i < names.length; i++)
			{
				var name = names[i];
				name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]"); 
				var regexS = "[\\?&]"+name+"=([^&#]*)"; 
				var regex = ignoreCase?new RegExp(regexS,"i"):new RegExp(regexS); 
				var results = regex.exec(url);
				if(results!=null)
				{
					value = decodeURIComponent(results[1].replace(/\+/g, " "));
					break;
				}			
			}
		}
		return value;
	},
	
	/* Data-* Functions */
	getDataAsStringArray: function(names,element,delimiter)
	{
		var aValue = null;
		var data = this.getData(names,element);
		if(data)
		{
			if(CyberGIS.isString(data))
			{
				aValue = data.split(delimiter);
			}
			else if(CyberGIS.isArray(data))
			{
				aValue = data;
			}
		}
		return aValue;
	},
	getDataAsIntegerArray: function(names,element,delimiter)
	{
		var aValue = null;
		var data = this.getData(names,element);
		if(data)
		{
			if(CyberGIS.isString(data))
			{
				aValue = [];
				var a = data.split(delimiter);				
				for(var i = 0; i < a.length; i++)
				{
					aValue.push(parseInt(a,10));
				}
			}
			else if(CyberGIS.isArray(data))
			{
				aValue = data;
			}
		}
		return aValue;
	},
	getDataAsFloatArray: function(names,element,delimiter)
	{
		var aValue = null;
		var data = this.getData(names,element);
		if(data)
		{
			if(CyberGIS.isString(data))
			{
				aValue = [];
				var a = data.split(delimiter);				
				for(var i = 0; i < a.length; i++)
				{
					aValue.push(parseFloat(a));
				}
			}
			else if(CyberGIS.isArray(data))
			{
				aValue = data;
			}
		}
		return aValue;
	},
	getData: function(names,element) 
	{
		var value = null;
		var data = $(element).data();
		if(element!=undefined)
		{
			for(var i = 0; i < names.length; i++)
			{
				if(data[""+names[i]])
				{
					value = data[""+names[i]];
					break;
				}			
			}
		}
		return value;
	},
	
	/* Property Functions */
	getProperty: function(names, object, ignoreCase)
	{
		var value = undefined;
		if(object!=undefined)
		{
			if(CyberGIS.isString(names))
			{
				if(ignoreCase)
				{
					for(var property in object)
					{
						if(property.toLowerCase()==names.toLowerCase())
						{
							value = object[""+property];
							break;
						}
					}
				}
				else
				{
					return object[""+names];
				}
			}
			else
			{
				if(ignoreCase)
				{
					for(var property in object)
					{
						for(var i = 0; i < names.length; i++)
						{
							if(property.toLowerCase()==names[i].toLowerCase())
							{
								value = object[""+property];
								break;
							}
						}
						if(value!=undefined)
						{
							break;
						}
					}
				}
				else
				{
					for(var i = 0; i < names.length; i++)
					{
						if(object[""+names[i]]!=undefined)
						{
							value = object[""+names[i]];
							break;
						}			
					}
				}
			}
		}
		
		return value;
	},
	
	replaceState: function(state, title, url)
	{
		if((!$.browser.msie)&&history!=undefined)
		{
			history.replaceState(state,title,url);
		}
	},
	pushState: function(state, title, url)
	{
		if((!$.browser.msie)&&history!=undefined)
		{
			history.pushState(state,title,url);
		}
	},
	coalesce: function(a)
	{
		var b = undefined;
		for(var i = 0; i < a.length; i++)
		{
			if(a[i])
			{
				b = a[i];
				break;
			}
		}
		return b;
	},
	strip: function(a, b)
	{
		if(CyberGIS.isString(b))
		{
			if(CyberGIS.isArray(a))
			{
				var c = [];
				for(var i = 0; i < a.length; i++)
				{
					c.push(CyberGIS._stripEnd(CyberGIS._stripStart(a[i],b),b));
				}
				return c;
			}
			else if(CyberGIS.isString(a))
			{
				return CyberGIS._stripEnd(CyberGIS._stripStart(a,b),b);
			}
			else
			{
				return a;
			}
		}
		else
		{
			return a;
		}
	},
	_stripStart: function(a, b)
	{
		var c = undefined;
		if(CyberGIS.isString(a))
		{
			if(a.length>0)
			{
				if(CyberGIS.isString(b))
				{
					if(b.length>0)
					{
						var len = a.length;
						var start = 0;
						while(start != len && b.indexOf(a.charAt(start))!=-1){start++;}	
						c = a.substring(start);
					}
					else
					{
						c = a;
					}
				}
				else
				{
					c = $.trim(a);
				}
			}
		}
		return c;
	},
	_stripEnd: function(a, b)
	{
		var c = undefined;
		if(CyberGIS.isString(a))
		{
			if(a.length>0)
			{
				if(CyberGIS.isString(b))
				{
					if(b.length>0)
					{
						var len = a.length;
						var end = len;
						while(end != 0 && b.indexOf(a.charAt(end-1))!=-1){end--;}	
						c = a.substring(0,end);
					}
					else
					{
						c = a;
					}
				}
				else
				{
					c = $.trim(a);
				}
			}
		}
		return c;
	},
	split: function(a, b)
	{
		var c = undefined;
		if(CyberGIS.isString(a)&&CyberGIS.isString(b))
		{
			c = a.split(b);
		}
		return c;
	},
	join: function(a, b)
	{
		var c = undefined;
		if(CyberGIS.isArray(a)&&CyberGIS.isString(b))
		{
			c = a.join(b);
		}
		return c;
	},
	grep: function(aInput, aValues, bKeep)
	{
		if(CyberGIS.isArray(aInput)&&CyberGIS.isArray(aValues))
		{
			var aOutput = [];
			for(var i = 0; i < aInput.length; i++)
    		{
    			var a = aInput[i];
    			if(bKeep)
    			{
					if($.inArray(a,aValues)!=-1)
    				{
						aOutput.push(a);
    				}
    			}
    			else
    			{
    				if($.inArray(a,aValues)==-1)
    				{
						aOutput.push(a);
    				}
    			}
    		}
			return aOutput;
		}
		else
		{
			return aInput;
		}
	},
	grepArray: function(d1, w)
	{
		var d2 = undefined;
		if(w)
		{
			if(w.op=="="||w.op=="==")
			{
				d2 = $.grep(d1,function(a,i)
				{
					return a[""+w.field]==w.value;
				});	
			}
			else if(w.op=="!="||w.op=="<>")
			{
				d2 = $.grep(d1,function(a,i)
				{
					return a[""+w.field]!=w.value;
				});	
			}
			else if(w.op=="not in"||w.op=="notin"||w.op=="not_in")
			{
				d2 = $.grep(d1,function(a,i)
				{
					return $.inArray(a[""+w.field],w.values)==-1;
				});	
			}
			else
			{
				d2 = d1;
			}
		}
		else
		{
			d2 = d1;
		}
		return d2;
	},
	orderArray: function(d1, aOrder)
	{
		var d2 = undefined;
		if(CyberGIS.isArray(aOrder))
		{
			var order = aOrder[0];
			var field = order.field;
			var direction = order.direction.toLowerCase();
			if(CyberGIS.isString(field))
			{
				if(direction=="desc")
				{
					d2 = d1.sort(function(a,b)
					{
						var av = a[""+field];
						var bv = b[""+field];
						if(av==bv)
						{
							return 0;
						}
						else if(av<bv)
						{
							return 1;
						}
						else if(av>bv)
						{
							return -1;
						}
					});
				}
				else
				{
					d2 = d1.sort(function(a,b)
					{
						var av = a[""+field];
						var bv = b[""+field];
						if(av==bv)
						{
							return 0;
						}
						else if(av<bv)
						{
							return -1;
						}
						else if(av>bv)
						{
							return 1;
						}
					});
				}
			}		
		}
		else
		{
			d2 = d1;
		}
		return d2;
	},
	sortArray: function(aArray, sField, aOrder)
	{
		if(CyberGIS.isArray(aOrder))
		{
			return aArray.sort(function(a,b)
			{
				var ai = $.inArray(a[""+sField],aOrder);
				var bi = $.inArray(b[""+sField],aOrder);
				if(ai==-1&&bi==-1)
				{
					return 0;
				}
				else if(ai==-1&&bi!=-1)
				{
					return 1;
				}
				else if(ai!=-1&&bi==-1)
				{
					return -1;
				}
				else
				{
					return ai > bi;
				}
			});
		}
		else if(CyberGIS.isString(aOrder))
		{
			if(aOrder.toLowerCase()=="desc")
			{
				return aArray.sort(function(a,b)
				{
					var av = a[""+sField];
					var bv = b[""+sField];
					return av > bv;
				});
			}
			else
			{
				return aArray.sort(function(a,b)
				{
					var av = a[""+sField];
					var bv = b[""+sField];
					return av < bv;
				});
			}
		}
		else
		{
			return aArray;
		}
	},
	escapeRegex: function(value)
	{
		return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	},

	/* Geometry Functions */
	transformLatLon: function(latlon,sourceProjection,targetProjection)
	{
		if(latlon.CLASS_NAME=="OpenLayers.LonLat")
		{
			return latlon.transform(CyberGIS.parseProjection(sourceProjection),CyberGIS.parseProjection(targetProjection));
		}
		else
		{
			return undefined;
		}
	},
	transformXY: function(x,y,sourceProjection,targetProjection)
	{
		return (new OpenLayers.LonLat(x,y)).transform(CyberGIS.parseProjection(sourceProjection),CyberGIS.parseProjection(targetProjection));
	},
	parseBounds: function(bounds,sourceProjection,targetProjection)
	{
		if(sourceProjection==undefined||targetProjection==undefined)
		{
			if(CyberGIS.isString(bounds))
			{
				if(bounds.match(new RegExp(CyberGIS.regex_bbox)))
				{
					return OpenLayers.Bounds.fromString(bounds);
				}
				else
				{
					return undefined;
				}				
			}
			else if(CyberGIS.isArray(bounds))
			{
				if(bounds.length==4)
				{
					return OpenLayers.Bounds.fromArray(bounds);
				}
				else
				{
					return undefined;
				}				
			}
			else if(bounds.CLASS_NAME=="OpenLayers.Bounds")
			{
				return new OpenLayers.Bounds(bounds.left,bounds.bottom,bounds.right,bounds.top);
			}
			else
			{
				return undefined;
			}
		}
		else
		{
			if(CyberGIS.isString(bounds))
			{
				if(bounds.match(new RegExp(CyberGIS.regex_bbox)))
				{
					var a = bounds.split(",");
					var bl = this.transformXY(a[0],a[1],sourceProjection,targetProjection);
					var tr = this.transformXY(a[2],a[3],sourceProjection,targetProjection);
					return new OpenLayers.Bounds(bl.lon, bl.lat, tr.lon, tr.lat);
				}
				else
				{
					return undefined;
				}
			}
			else if(CyberGIS.isArray(bounds))
			{
				if(bounds.length==4)
				{
					var bl = this.transformXY(bounds[0],bounds[1],sourceProjection,targetProjection);
					var tr = this.transformXY(bounds[2],bounds[3],sourceProjection,targetProjection);
					return new OpenLayers.Bounds(bl.lon, bl.lat, tr.lon, tr.lat);
				}
				else
				{
					return undefined;
				}
			}
			else if(bounds.CLASS_NAME=="OpenLayers.Bounds")
			{
				var bl = this.transformXY(bounds.left,bounds.bottom,sourceProjection,targetProjection);
				var tr = this.transformXY(bounds.right,bounds.top,sourceProjection,targetProjection);
				return new OpenLayers.Bounds(bl.lon, bl.lat, tr.lon, tr.lat);
			}
			else
			{
				return undefined;
			}
		}
	},
	parseProjection: function(projection)
	{
		if(CyberGIS.isString(projection))
		{
			return new OpenLayers.Projection(projection);
		}
		else if(projection.projCode!=undefined)//Includes existing OpenLayers.Projection
		{
			return new OpenLayers.Projection(projection.projCode);
		}
		else
		{
			return undefined;
		}
	}
};

CyberGIS.Client = CyberGIS.Class
({
	debug: false,
	animate: true,
	
	disclaimerViewed: false,
	
	mapID: undefined,
	mapType: undefined,
	urls: undefined,
	
	properties: undefined,
	proto: undefined,
	
	carto_app: undefined,//Assembled to be {"layers":"","library":""}
	carto_library: undefined,
	
	callbackFunction: undefined,
	callbackContext: undefined,
	
	dialogs_array: undefined,
	dialogs_index: undefined,
	
	sources: undefined,
	orgs_usg: undefined,
	
	apps: undefined,
	wikis: undefined,
	dataSources: undefined,
	glossaries: undefined,
	bookmarks: undefined,
	pcodes: undefined,
	hashmaps: undefined,
	
	log: undefined,
	state: undefined, /*CyberGIS.State Object */	
	maps: undefined, /* CyberGIS.Map object */
	carto: undefined, /*CyberGIS.Carto object */
	
	/* Timers */
	timers: 
	{
		'loader':undefined,
		'timeSlider': undefined,
		'query': undefined,
		resize: undefined,
		'popup':undefined,
		'layerSwitcher':undefined,
		'focusOnItem':undefined,
		'jit':undefined,
		'snapshotSlider':undefined,
		'chartSliders':[]
	},
	
	initialize: function(mapID, mapType, urls, callbackFunction, callbackContext, options)
	{
		this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		CyberGIS.extend(this, options);
		if (this.id == null)
		{
			this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		}
		
		this.mapID = mapID;
		this.mapType = mapType;
		this.urls = urls;
		this.callbackFunction = callbackFunction;
		this.callbackContext = callbackContext;
		this.debug = CyberGIS.getParameter(["debug"],window.location.href)||options.debug||($.browser.msie?false:(typeof console != "undefined"));
		this.animate = CyberGIS.getParameter(["animate"],window.location.href)||options.animate||true;
		
		var that = this;
		$(window).resize(function(e)
		{
			console.log("window resize");
			if(that.timers.resize==undefined)
			{
				
			}
			else
			{
				clearTimeout(that.timers.resize);
				that.timers.resize = undefined;
			}
			that.timers.resize = setTimeout(function(){that.timers.resize = undefined; that.resize();},500);
		});
		$('#resizing').html('<table width="100%" height="100%"><tr><td align="center"><span>Resizing</span></td></tr></table>');
		setTimeout(function()
		{
			that.resize.apply(that);
		},2000);
	},
	externalLinkClicked: function(element)
	{
		if(this.disclaimerViewed)
			window.open(element.attr("href"));
		else
		{
			var that = element;
			this.disclaimerViewed = true;
			if(this.hasDialog("disclaimer"))
			{
				var d = this.getDialog("disclaimer");
				d.open();
				d.div.bind("dialogclose", function(event, ui)
				{
					$(this).unbind('dialogclose');
					window.open($(that).attr("href"));
				});
			}
			
		}
		return false;
	},
	init_properties: function()
	{
		if(this.debug){console.log('init_properties');}
		
		if(this.urls.app.properties!=undefined)
		{
			this.properties = new CyberGIS.File.JSON(this.urls.app.properties,this.init_time,this);
		}
		else
		{
			this.init_state();
		}
	
	},
	init_time: function()
	{
		if(this.debug){console.log('init_time');}
		
		var raw = this.properties.getJSON("time");
		if($.inArray(raw,["single","range"])!=-1)
		{
			this.timeType = raw;
		}
		else
		{
			this.timeType = undefined;
		}
		
		this.init_hashmaps();
	},
	init_hashmaps: function()
	{
		if(this.debug){console.log('init_hashmaps');}
		
		var raw = this.properties.getJSON("hashmaps");
			
		var parsed = {};
		for(var ns in raw)
		{
			parsed[""+ns] = {};
			for(var hm in raw[""+ns])
			{
				parsed[""+ns][""+hm] = {};
				for(var i = 0; i < raw[""+ns][""+hm].length; i++)
				{
					parsed[""+ns][""+hm][""+raw[""+ns][""+hm][i].id] = raw[""+ns][""+hm][i].name;
				}
				
			}
		}
		
		this.hashmaps = parsed;
		
		this.init_bookmarks();
	},
	init_bookmarks: function()
	{
		if(this.debug){console.log('init_bookmarks');}
		
		var raw = this.properties.getJSON("bookmarks");
		
		if(raw!=undefined)
		{
			if(CyberGIS.isArray(raw))
			{
				this.bookmarks = raw;
				this.init_wikis();
			}
			else
			{
				if(CyberGIS.hasFields(raw,["url","delimiter"]))
				{
					this.bookmarks = new CyberGIS.File.Bookmarks(raw.url,raw.delimiter,this.init_wikis,this);
				}
				else
				{
					this.init_wikis();
				}
			}
		}
		else
		{
			this.bookmarks = undefined;
			this.init_wikis();
		}
	},
	init_wikis: function()
	{
		if(this.debug){console.log('init_wikis');}
		
		var raw = this.properties.getJSON("wikis");
		
		if(raw!=undefined)
		{
			this.wikis = new CyberGIS.Wikis(raw,this.init_apps,this);
		}
		else
		{
			this.init_apps();
		}
	},
	init_apps: function()
	{
		if(this.debug){console.log('init_apps');}
		
		var raw = this.properties.getJSON("apps");
		
		if(raw!=undefined)
		{
			this.apps = new CyberGIS.Apps(raw,this.init_datasources,this);
		}
		else
		{
			this.init_datasources();
		}
	},
	init_datasources: function()
	{
		if(this.debug){console.log('init_datasources');}
		
		var raw = this.properties.getJSON("datasources");
		
		if(raw!=undefined)
		{
			this.dataSources = new CyberGIS.DataSources(raw,this.init_pcodes,this);
		}
		else
		{
			this.init_pcodes();
		}
	},
	init_pcodes: function()
	{
		if(this.debug){console.log('init_pcodes');}
		
		var raw = this.properties.getJSON("pcodes");
		
		if(raw!=undefined)
		{
			this.pcodes = new CyberGIS.PCodes(raw,this.init_glossaries,this);
		}
		else
		{
			this.init_glossaries();
		}
	},
	init_glossaries: function()
	{
		if(this.debug){console.log('init_glossaries');}
		
		var raw = this.properties.getJSON("glossaries");
		
		if(raw!=undefined)
		{
			this.glossaries = new CyberGIS.Glossaries(raw,this.init_sources,this);
		}
		else
		{
			this.init_sources();
		}
	},
	init_sources: function()
	{
		if(this.debug){console.log('init_sources');}
		
		if(this.urls.app.sources!=undefined)
		{
			this.sources = new CyberGIS.File.Sources(this.urls.app.sources,"\t",this.init_orgs_usg,this);
		}
		else
		{
			this.init_orgs_usg();
		}
	},
	init_orgs_usg: function()
	{
		if(this.debug){console.log('init_orgs_usg');}
		
		if(this.urls.app.orgs_usg!=undefined)
		{
			this.orgs_usg = new CyberGIS.File.Organizations(this.urls.app.orgs_usg,"\t",this.init_conf_proto,this);
		}
		else
		{
			this.init_conf_proto();
		}
	},
	init_conf_proto: function()
	{
		if(this.debug){console.log('init_conf_proto');}
		
		if(this.urls.app.proto!=undefined)
		{
			this.proto = new CyberGIS.File.JSON(this.urls.app.proto,this.init_library_carto,this);
		}
		else
		{
			this.init_library_carto();
		}
	},	
	init_library_carto: function()
	{
		if(this.debug){console.log('init_library_carto');}
		
		if(this.urls.library.carto!=undefined)
		{
			this.carto_library = new CyberGIS.File.JSON(this.urls.library.carto,this.init_conf_carto,this);
		}
		else
		{
			this.init_conf_carto();
		}
	},
	init_conf_carto: function()
	{
		if(this.debug){console.log('init_conf_carto');}
		
		if(this.urls.app.carto!=undefined)
		{
			this.carto_app = new CyberGIS.File.JSON(this.urls.app.carto,this.init_carto,this);
		}
		else
		{
			this.init_carto();
		}
	},
	init_carto: function()
	{
		this.carto = new CyberGIS.Carto.Basic(this,this.carto_app.getAllJSON(),this.carto_library.getAllJSON(),{});
		this.init_map();
	},
	init_map: function()
	{
		if(this.debug){console.log('init_map');}
		
		var properties = this.properties.getAllJSON();
		var controlOptions = this.properties.getJSON("controls");
		
		if(this.mapType.toLowerCase()=="openlayers"||this.mapType.toLowerCase()=="ol2")
		{
			this.maps = [new CyberGIS.Map.OpenLayers(this, this.mapID, $("#"+this.mapID), controlOptions, properties, this.proto.getAllJSON(), this.carto, undefined, undefined, {})];
		}
		else if(this.mapType.toLowerCase()=="openlayers3"||this.mapType.toLowerCase()=="ol3")
		{
			this.maps = [new CyberGIS.Map.OL3(this, this.mapID, $("#"+this.mapID), controlOptions, properties, this.proto.getAllJSON(), this.carto, undefined, undefined, {})];
		}
		else if(this.mapType.toLowerCase()=="leaflet")
		{
			this.maps = [];
		}
		else
		{
			this.maps = [new CyberGIS.Map.OpenLayers(this, this.mapID, $("#"+this.mapID), controlOptions, properties, this.proto.getAllJSON(), this.carto, undefined, undefined, {})];
		}
		this.init_finalize();//Cannot pass this.init_finalize as callback, b/c creates race condition for varibale this.map;
	},
	
	init_finalize: function()
	{
		if(this.debug){console.log('init_finalize');}
		
		this.resize();
		
		this.callbackFunction.apply(this.callbackContext);
	},
	init_log: function()
	{
		this.log = new CyberGIS.Log(this);
	},
	init_dialogs: function()
	{
		if(this.debug){console.log('init_dialogs');}
		
		var that = this;
		
		//About
		var about = new CyberGIS.Dialog.Basic('#hiu_dialog_about',{"width":"500"});
		about.render();
		this.addDialog("about",about);		
		$('#btn_about').click(function()
		{
			if(that.map!=undefined)
			{
				if(that.map.selectControl!=undefined)
				{
					that.map.selectControl.unselectAll();
				}
			}
			
			that.openDialog("about");
		});
		
		//Disclaimer
		var disclaimer = new CyberGIS.Dialog.Basic('#hiu_dialog_disclaimer',{"width":"400"});
		disclaimer.render();
		this.addDialog("disclaimer",disclaimer);
		$('#btn_disclaimer').click(function()
		{
			if(that.map!=undefined)
			{
				if(that.map.selectControl!=undefined)
				{
					that.map.selectControl.unselectAll();
				}
			}			
			that.disclaimerViewed = true;
			that.openDialog("disclaimer");
		});
		
		//Share
		var share = new CyberGIS.Dialog.Share(this, '#hiu_dialog_share',{"width":"500"});
		share.render();
		this.addDialog("share",share);
		$('#btn_share').click(function()
		{
			if(that.map!=undefined)
			{
				if(that.map.selectControl!=undefined)
				{
					that.map.selectControl.unselectAll();
				}
			}
			that.openDialog("share");
		});
		
		//Data
		var data = new CyberGIS.Dialog.Data(this, '#hiu_dialog_data',{"width":"800"});
		data.render();//Rendered on demand
		this.addDialog("data",data);
		$('#btn_data').click(function()
		{
			if(that.map!=undefined)
			{
				if(that.map.selectControl!=undefined)
				{
					that.map.selectControl.unselectAll();
				}
			}
			
			that.openDialog("data");
		});
		
		//Internet Explorer Warning
		var warning_ie = new CyberGIS.Dialog.InternetExplorerWarning('#hiu_dialog_warning_ie',
		{
			width:'600',height:'400',
			sClose: "Are you sure?  We STRONGLY RECOMMEND switching to a modern browser if available (Google Chrome on DOS OpenNet).",
			onClose: that.init_properties
		});
		warning_ie.render();
		this.addDialog("warning_ie",warning_ie);
		
		//Mixed-Content Warning
		var warning_mc = new CyberGIS.Dialog.Basic('#hiu_dialog_warning_mc',{width:'600',height:'400'});
		warning_mc.render();
		this.addDialog("warning_mc",warning_mc);
	},
	init_begin: function()
	{
		this.init_log();
		this.init_dialogs();
		if($.browser.mozilla||$.browser.webkit||$.browser.safari)
		{
			if($.browser.mozilla&&($.browser.version>=23))
			{
				this.openDialog("warning_mc");
			}
			this.init_properties();//Immediately begins initialization while dialog is open
		}
		else
		{
			this.openDialog("warning_ie");//Begins initialization of properties after dialog is closed 
		}
	},
	/* Name Functions */
	getName: function()
	{
		return this.properties.getJSON("name")||"Untitled";
	},
	/* Dialog Functions */
	addDialog: function(id, dialog)
	{
		if(this.dialogs_index==undefined)
		{
			this.dialogs_index = {};
		}
		
		if(this.dialogs_array==undefined)
		{
			this.dialogs_array = [];
		}
		
		this.dialogs_index[""+id] = dialog;
		this.dialogs_array.push(dialog);
	},
	getDialog: function(id)
	{
		return this.dialogs_index[""+id];
	},
	hasDialog: function(id)
	{
		return this.dialogs_index[""+id] != undefined;
	},
	openDialog: function(id)
	{
		if(this.hasDialog(id))
		{
			var d = this.getDialog(id);
			d.open();
		}
	},
	getActiveLayers: function(map)
	{
		var activeLayers = undefined;
		if(this.proto.hasJSON())
		{
			var json = this.proto.getAllJSON();
			if(json["layers"]!=undefined)
			{
				var protoLayers = json["layers"];
				map = map || 0;
				activeLayers = $.map(this.maps[map].featureLayerNames,function(name,i){return protoLayers[""+name]; });
			}
			else
			{
				activeLayers = [];
			}
		}
		else
		{
			activeLayers = [];
		}
		
		return activeLayers;
	},
	getDialogLayers: function(map)
	{
		var dialogLayers = undefined;
		if(this.proto.hasJSON())
		{
			var json = this.proto.getAllJSON();
			if(json["layers"]!=undefined)
			{
				map = map || 0;
				var layerNames = this.maps[map].dialogLayerNames || this.maps[map].featureLayerNames;
				var protoLayers = json["layers"];						
				dialogLayers = $.map(layerNames,function(name,i){return protoLayers[""+name]; });
			}
			else
			{
				dialogLayers = [];
			}
		}
		else
		{
			dialogLayers = [];
		}
		
		return dialogLayers;
	},
	getSources: function(id)
	{
		if(this.sources != undefined)
		{
			return this.sources.entries;
		}
		else
		{
			return undefined;
		}
	},
	getDataSources: function(id)
	{
		if(this.dataSources != undefined)
		{
			return this.dataSources.sources;
		}
		else
		{
			return undefined;
		}
	},
	getDataSource: function(id)
	{
		if(this.dataSources != undefined)
		{
			if(this.dataSources.sources != undefined)
			{
				return this.dataSources.sources[""+id];
			}
			else
			{
				return undefined;
			}
		}
		else
		{
			return undefined;
		}
	},
	getWiki: function(name)
	{
		if(this.wikis != undefined)
		{
			return this.wikis.getWiki(name);
		}
		else
		{
			return undefined;
		}
	},
	getApp: function(name)
	{
		if(this.apps != undefined)
		{
			return this.apps.getApp(name);
		}
		else
		{
			return undefined;
		}
	},
	getBookmarks: function()
	{
		if(this.bookmarks!=undefined)
		{
			if(CyberGIS.isArray(this.bookmarks))
			{
				return this.bookmarks;
			}
			else
			{
				return this.bookmarks.entries;
			}
		}
		else
		{
			return undefined;
		}
	},
	getGlossaries: function(id)
	{
		if(this.glossaries != undefined)
		{
			return this.glossaries.glossaries;
		}
		else
		{
			return undefined;
		}
	},
	getUSGOrganizations: function(id)
	{
		if(this.orgs_usg != undefined)
		{
			return this.orgs_usg.entries;
		}
		else
		{
			return undefined;
		}
	},
	
	/* Command Line Functions */
	/* Command Line Functions */
	zoomTo: function(z)
	{
		for(var i = 0; i < this.maps.length; i++)
		{
			var m = this.maps[i];
			m.zoomTo(z);
		}
	},
	printAllMessages: function()
	{
		if(console!=undefined)
		{
			if(console.log!=undefined)
			{
				console.log("CyberGIS Log");
				console.log("******************************");
				console.log("\tCyberGIS Client: "+this.getName());
				console.log("\t===================");
				var a = this.log.getAllMessages();
				for(var j = 0; j < a.length; j++)
				{
					console.log("\t"+a[j].asText());
				}
				console.log("\t===================");
				for(var i = 0; i < this.maps.length; i++)
				{
					var m = this.maps[i];
					console.log("\t\tCyberGIS Map: "+this.getName());
					console.log("\t\t-------------------");
					a = m.log.getAllMessages();
					for(var j = 0; j < a.length; j++)
					{
						console.log("\t\t"+a[j].asText());
					}
				}
				console.log("\t===================");
				console.log("******************************");
			}
		}
	},
	printErrorMessages: function()
	{
		if(console!=undefined)
		{
			if(console.log!=undefined)
			{
				console.log("CyberGIS Log");
				console.log("******************************");
				console.log("\tCyberGIS Client: "+this.getName());
				console.log("\t===================");
				var a = this.log.getErrorMessages();
				for(var j = 0; j < a.length; j++)
				{
					console.log("\t"+a[j].asText());
				}
				console.log("\t===================");
				for(var i = 0; i < this.maps.length; i++)
				{
					var m = this.maps[i];
					console.log("\t\tCyberGIS Map: "+this.getName());
					console.log("\t\t-------------------");
					a = m.log.getErrorMessages();
					for(var j = 0; j < a.length; j++)
					{
						console.log("\t\t"+a[j].asText());
					}
				}
				console.log("\t===================");
				console.log("******************************");
			}
		}
	},
	printFirstState: function(index)
	{
		if(console!=undefined)
		{
			if(console.log!=undefined)
			{
				console.log("CyberGIS State");
				console.log("******************************");
				if(this.maps.length>0)
				{
					index = index || 0;
					if(index <= this.maps.length)
					{
						var m = this.maps[index];
						if(m!=undefined)
						{
							console.log(m.log.getFirstState());
						}
						else
						{
							console.log("Map at index "+index+" is undefined.");
						}
					}
					else
					{
						console.log("The client does not have a map at index "+index);
					}
				}
				else
				{
					console.log("This client has no maps.");
				}
				console.log("******************************");
			}
		}
	},
	printLastState: function(index)
	{
		if(console!=undefined)
		{
			if(console.log!=undefined)
			{
				console.log("CyberGIS State");
				console.log("******************************");
				if(this.maps.length>0)
				{
					index = index || 0;
					if(index <= this.maps.length)
					{
						var m = this.maps[index];
						if(m!=undefined)
						{
							console.log(m.log.getLastState());
						}
						else
						{
							console.log("Map at index "+index+" is undefined.");
						}
					}
					else
					{
						console.log("The client does not have a map at index "+index);
					}
				}
				else
				{
					console.log("This client has no maps.");
				}
				console.log("******************************");
			}
		}
	},
	
	resize: function()
	{
		var w = undefined;
		var h = undefined;
		
		if($.browser.mozilla||$.browser.webkit||$.browser.safari)
		{
			w = window.innerWidth;
			h = window.innerHeight;
		}
		else
		{
			w = document.documentElement.offsetWidth;
			h = document.documentElement.offsetHeight;
		}
		
		//Resize Maps (+ Controls)
		if(this.maps!=undefined)
		{
			for(var i = 0; i < this.maps.length; i++)
			{
				var m = this.maps[i];
				m.resize.apply(m,[w,h]);	
			}
		}
		
		//Resize Dialogs
		for(var i = 0; i < this.dialogs_array.length; i++)
		{
			var d = this.dialogs_array[i];
			d.resize.apply(d,[w,h]);
		}
	},
	
	destroy: function ()
	{
		this.div.dialog("destroy");
	},
	CLASS_NAME: "CyberGIS.Client"
});
CyberGIS.State = {};
CyberGIS.State.OpenLayers = CyberGIS.Class
({
	/* Static */
	
	FORMAT_WFS: "wfs",
	FORMAT_LABEL: "label",
	FORMAT_QUERYSTRING: "querystring",	

	milliseconds_per_day: 86400000,
	now: undefined,
	today: undefined,
	daysoftheweek:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	monthsoftheyear:['January','February','March','April','May','June','July','August','September','October','November','December'],
	
	nullIsland: undefined,
	
	/* Initial */
	name: undefined,
	title: undefined,
	pages: undefined,
	context: undefined,
	state: undefined,
	url: undefined,
	
	/* Time */
	timeType: undefined,
	
	minDate: undefined,
	minTime: undefined,
	minText: undefined,
	
	maxDate: undefined,
	maxTime: undefined,
	maxText: undefined,
	
	days: undefined,
	
	currentDate: undefined,
	currentTime: undefined,
	currentDateValue: undefined,
	
	currentDateRange: undefined,
	currentTimeRange: undefined,
	currentDateValueRange: undefined,
	
	/* Location */	
	map: undefined, /* CyberGIS.Map */
	sourceProjection: undefined,
	targetProjection: undefined,
	maxExtent: undefined,
	center: undefined,/*using map's projection*/
	lonlat: undefined,
	extent: undefined,
	minZoom: undefined,
	maxZoom: undefined,
	zoom: undefined,
	
	/* Layers */
	defaultFeatureLayerNames: undefined,
	activeFeatureLayerNames: undefined,
	
	initialize: function(map,element,sName,title,pages,domain,context,timeType,sMinDate,sMaxDate,iMinZoom,iMaxZoom,iZoom,projection,pX,pY,pLon,pLat,pTrack,baseLayer)
	{
		 this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		 //CyberGIS.extend(this, options);
		 if (this.id == null)
		 {
			 this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		 }
		 
		 this.setMap(map);
		 
		 this.nullIsland = new OpenLayers.LonLat(0,0);
		 
		 //this.element = element;
		 this.track = this.buildTrack(element,pTrack);
		 this.name = sName;
		 this.title = title;
		 this.domain = domain;
		 this.context = context;
		 this.pages = this.buildPages(pages);
		 this.timeType = timeType;
		 this.now = new Date();
		 this.today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
		 this.sourceProjection = projection;//this.buildProjection(element,sProjection);
		 this.targetProjection = new OpenLayers.Projection("EPSG:4326");
		 this.center = this.nullIsland;
		 this.lonlat = this.buildLonLat(this.center,false);
		 this.extent = undefined;
		// this.defaultFeatureLayerNames = map.defaultFeatureLayerNames.join(",");
		// this.activeFeatureLayerNames = map.featureLayerNames.join(",");
		 this.refresh(element,sName,sMinDate,sMaxDate,iMinZoom,iMaxZoom,iZoom,pX,pY,pLon,pLat,baseLayer);
		 		 
		 if(this.track)
		 {
			 this.pushState();	 
		 }
		 else
		 {
			 this.map.log.logState(this.state);
		 }
	},
	setMap: function(map)
	{
		this.map = map;
		this.defaultFeatureLayerNames = map.defaultFeatureLayerNames.join(",");
		this.activeFeatureLayerNames = map.featureLayerNames.join(",");
	},
	activate: function()
	{
		if(this.track)
		{
			var that = this;
			var bl = this.map.map.baseLayer;
			//this.sourceProjection = this.map.map.getProjectionObject();
			this.sourceProjection = new OpenLayers.Projection(this.map.map.projection);/* This is necessary, b/c if the baseLayer doesn't load correctly then it will return the first vector's layers projection instead of the actual projection.*/
			bl.events.register('moveend',bl,function()
	      	{
				that.onMoveEnd.apply(that);
			});
			this.map.map.events.register('zoomend',null,function()
	      	{
				that.onZoomEnd.apply(that);
			});
		}
	},
	deactivate: function()
	{
		if(this.map!=undefined)
		{
			if(this.map.map!=undefined)
			{
				if(this.map.map.baseLayer!=undefined)
				{
					this.map.map.baseLayer.events.unregister('moveend',this.map.map.baseLayer);
				}
				this.map.map.events.unregister('zoomend',null);
			}
		}
	},
	onMoveEnd: function()
	{
		this.center = this.map.map.center;
		this.lonlat = this.buildLonLat(this.center,false);
		this.extent = this.map.map.getExtent();
		////////////
		this.state = this.buildStateObject();
		this.url = this.buildURL();
		this.replaceState();
	},
	onZoomEnd: function()
	{
		this.zoom = $.inArray(this.map.map.resolution,this.map.map.resolutions);
		////////////
		this.state = this.buildStateObject();
		this.url = this.buildURL();
		this.replaceState();
	},
	replaceState: function()
	{
		 CyberGIS.replaceState(this.state,this.title,this.url);
	},
	pushState: function()
	{
		this.map.log.logState(this.state);
		CyberGIS.pushState(this.state,this.title,this.url);
	},
	isSingle: function()
	{
		return this.timeType=="single";
	},
	isRange: function()
	{
		return this.timeType=="range";
	},	
	refresh: function(element,sName,sMinDate,sMaxDate,iMinZoom,iMaxZoom,iZoom,pX,pY,pLon,pLat,baseLayer)
	{
		var url = window.location.href;
		
		/* Name */
		this.name = this.buildName(sName,url);
		
		/* Time */
		this.maxDate = this.buildMaxDate(sMaxDate);
		this.maxTime = this.buildMaxTime();
		this.maxText = this.buildMaxText();
		this.minDate = this.buildMinDate(sMinDate);
		this.minTime = this.buildMinTime();
		this.minText = this.buildMinText();
		this.days = this.buildDays();
		
		if(this.isSingle())
		{
			var sDate = CyberGIS.getParameter(["t","d","date"],url);
			this.currentDate = this.buildCurrentDate(sDate);
			this.currentTime = this.buildCurrentTime();
			this.currentDateValue = this.buildCurrentDateValue();
		}
		else if(this.isRange())
		{
			var sStartDate = CyberGIS.getParameter(["s","start","startdate"],url);
			var sEndDate = CyberGIS.getParameter(["e","end","enddate"],url);
			this.currentDateRange = this.buildCurrentDateRange(sStartDate,sEndDate);			
			this.currentTimeRange = this.buildCurrentTimeRange();
		}
		else
		{
			this.currentDate = undefined;
			this.currentTime = undefined;
			this.currentDateValue = undefined;
			
			this.currentDateRange = undefined;
			this.currentTimeRange = undefined;
			//this.current
		}
		
		/* Location */
		this.minZoom = this.buildMinZoom(element,iMinZoom,baseLayer,0);
		this.maxZoom = this.buildMaxZoom(element,iMaxZoom,baseLayer,10);
		this.zoom = this.buildZoom(element,iZoom,baseLayer,3,url);
		this.center = this.buildCenter(element,pX,pY,pLon,pLat,url,this.nullIsland);
		this.lonlat = this.buildLonLat(this.center,false);
		this.extent = undefined;
		
		this.state = this.buildStateObject();
		this.url = this.buildURL();
	},
	buildPages: function(pPages)
	{
		var pages = {};
		if(pPages!=undefined)
		{
			if(CyberGIS.isString(pPages))
			{
				pages["main"] = pPages;
				pages["thumbnail"] = pPages;
				pages["embed"] = pPages;
			}
			else
			{
				pages["main"] = pPages.main;
				pages["thumbnail"] = pPages.thumbnail||pPages.main;
				pages["embed"] = pPages.embed||pPages.main;
			}
		}
		else
		{
			pages["main"] = "";
			pages["thumbnail"] = "";
			pages["embed"] = "";
		}
		return pages;
	},
	buildName: function(sName,url)
	{
		return CyberGIS.getParameterAsString(["n","name"],url,true)||sName;
	},
	buildTrack: function(element,pTrack)
	{
		return element.data('mapTrack')||pTrack;
	},
	/*
	 * Deprecated: Projection should be passed into constructor as the map should build it so it knows how to interpret maxextents and aois
	buildProjection: function(element,sProjection)
	{
		var projection = undefined;
		
		var eProjection = element.data('mapProjection');
		if(eProjection!=undefined)
		{
			if(CyberGIS.isString(eProjection))
			{
				projection = new OpenLayers.Projection(eProjection); 
			}
		}
		
		if(projection==undefined)
		{
			if(sProjection!=undefined)
			{
				if(CyberGIS.isString(sProjection))
				{
					projection = new OpenLayers.Projection(sProjection);
				}
			}
		}
		return projection;
	},*/
	buildCenter: function(element,pX,pY,pLon,pLat,url,fallback)
	{
		var qs_q = CyberGIS.getParameterAsIntegerArray(["q","query"],url,",");		
		if(qs_q!=null)
		{
			if(qs_q.length>=3)
			{
				center = new OpenLayers.LonLat(qs_q[1],qs_q[0]);
				center.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
			}
		}
		else
		{
			var qs_lon = CyberGIS.getParameterAsDouble(["lon","longitude"],url,undefined);
			var qs_lat = CyberGIS.getParameterAsDouble(["lat","latitude"],url,undefined);
			if(qs_lon!=undefined&&qs_lat!=undefined)
			{
				center = new OpenLayers.LonLat(qs_lon,qs_lat);
				center.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
			}
			else
			{
				if(pX!=undefined&&pY!=undefined)
				{
					center = new OpenLayers.LonLat(pX,pY);
				}
				else if(pLon!=undefined&&pLat!=undefined)
				{
					center = new OpenLayers.LonLat(pLon,pLat);
					center.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
				}
				else
				{
					var eLon = element.data('mapLon');
					var eLat = element.data('mapLat');
					var eX = element.data('mapX');
					var eY = element.data('mapY');
					
					var center = undefined;
					
					if(eX!=undefined&&eY!=undefined)
					{
						center = new OpenLayers.LonLat(eX,eY);
					}
					else if(eLon!=undefined&&eLat!=undefined)
					{
						center = new OpenLayers.LonLat(eLon,eLat);
						center.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
					}
					else
					{
						center = fallback;
					}
				}
			}
		}
		center = this.checkCenter(center,this.map.maxExtent);
		return center;
	},
	checkCenter: function(c,maxExtent)
	{
		if(!this.testCenter(c,maxExtent))
		{
			var c2 = maxExtent.getCenterLonLat();
			this.map.log.logError("Could not initialize map with center ("+c.toShortString()+").  The center is outside of the max extent of ("+maxExtent.toBBOX()+").  Map initialized at the center of the max extent ("+c2.toShortString()+") instead.");
			c = c2;
		}
		return c;
	},	
	testCenter: function(center,maxExtent)
	{
		return (maxExtent==undefined)||(maxExtent.contains(center.lon,center.lat,true));
	},	
	buildLonLat: function(center,reverse)
	{
		var lonlat = undefined;
		if(reverse)
		{
			lonlat = (new OpenLayers.LonLat(center.lat,center.lon)).transform(this.sourceProjection, this.targetProjection);
		}
		else
		{
			lonlat =  (new OpenLayers.LonLat(center.lon,center.lat)).transform(this.sourceProjection, this.targetProjection);
		}
		return lonlat;
	},
	buildMinZoom: function(element,iMinZoom,baseLayer,fallback)
	{
		var minZoom = CyberGIS.initAttribute(element, "mapMinZoom", iMinZoom, baseLayer, "minZoom", fallback); 
		return minZoom;
	},
	buildMaxZoom: function(element,iMaxZoom,baseLayer,fallback)
	{
		var maxZoom = CyberGIS.initAttribute(element, "mapMaxZoom", iMaxZoom, baseLayer, "maxZoom", fallback); 
		return maxZoom;
	},
	buildZoom: function(element,iZoom,baseLayer,fallback,url)
	{
		var zoom = undefined;
		
		var qs_q = CyberGIS.getParameterAsIntegerArray(["q","query"],url,",");		
		if(qs_q!=null)
		{
			if(qs_q.length>=3)
			{
				zoom = qs_q[3];
			}
		}
		
		if(zoom==undefined)
		{
			var qs_zoom = CyberGIS.getParameterAsInteger(["z","zoom"],url,-1);
			if(qs_zoom!=-1)
			{
				zoom = qs_zoom;
			}
			else
			{
				zoom = CyberGIS.initAttribute(element, "mapZoom", iZoom, baseLayer, "minZoom", fallback);	
			}
		}
		return zoom;
	},
	buildCurrentDate: function(sDate)
	{
		var date = undefined;
		if(sDate!=undefined)
		{
			var aDate = sDate.split("-");
			date = new Date(parseInt(aDate[0],10),parseInt(aDate[1],10)-1,parseInt(aDate[2],10));
			date = this.boundDate(date);
		}
		else
		{
			date = CyberGIS.copyDate(this.maxDate);
		}
		return date;
	},
	buildCurrentDateRange: function(sStartDate,sEndDate)
	{
		var startDate = undefined;
		if(sStartDate!=undefined)
		{
			var aStartDate = sStartDate.split("-");
			startDate = new Date(parseInt(aStartDate[0],10),parseInt(aStartDate[1],10)-1,parseInt(aStartDate[2],10));
			startDate = this.boundDate(startDate);
		}
		else
		{
			startDate = new Date(this.maxDate.getFullYear(),this.maxDate.getMonth(),this.maxDate.getDate()-7);
		}
		return date;
	},
	buildMaxDate: function(sMaxDate)
	{
		var maxDate = undefined;
		if(sMaxDate!=undefined)
		{
			var aMaxDate = sMaxDate.split("-");
			maxDate = new Date(parseInt(aMaxDate[0],10),parseInt(aMaxDate[1],10)-1,parseInt(aMaxDate[2],10));
		}
		else
    	{
			maxDate = CyberGIS.copyDate(this.today);
    	}
		return maxDate;
	},
	buildMaxTime: function()
	{
		return this.maxDate.getTime();
	},
	buildMaxText: function()
	{
		return "There is no data after "+(this.maxDate.getMonth()+1)+"/"+this.maxDate.getDate()+"/"+this.maxDate.getFullYear();
	},
	buildMinDate: function(sMinDate)
	{
		var minDate = undefined;
		if(sMinDate!=undefined)
		{
			var aMinDate = sMinDate.split("-");
			minDate = new Date(parseInt(aMinDate[0],10),parseInt(aMinDate[1],10)-1,parseInt(aMinDate[2],10));
		}
		else
		{
			minDate = new Date(this.maxDate.getFullYear(),this.maxDate.getMonth(),this.maxDate.getDate()-7);
		}
		return minDate;
	},
	buildMinTime: function()
	{
		return this.minDate.getTime();
	},
	buildMinText: function()
	{
		return "There is no data before "+(this.minDate.getMonth()+1)+"/"+this.minDate.getDate()+"/"+this.minDate.getFullYear();
	},
	buildCurrentTime: function()
	{
		return this.currentDate.getTime();
	},
	buildCurrentDateValue: function()
	{
		return Math.floor((this.currentTime-this.minTime)/this.milliseconds_per_day);
	},
	buildDays: function()
	{
		return ((this.maxTime-this.minTime)/this.milliseconds_per_day)+1;
	},
	buildStateObject: function()
	{
		var stateObject = {};
		
		stateObject["name"] = this.name;
		
		if(this.isSingle())
		{
			stateObject["date"] = this.formatCurrentDate(this.FORMAT_QUERYSTRING);
		}
		else if(this.isRange())
		{
			stateObject["start"] = this.formatCurrentStartDate(this.FORMAT_QUERYSTRING);
			stateObject["end"] = this.formatCurrentEndDate(this.FORMAT_QUERYSTRING);
		}
		
		stateObject["zoom"] = this.zoom;
		stateObject["lat"] = this.lonlat.lat;
		stateObject["lon"] = this.lonlat.lon;
		
		//stateObject["extent"] = this.extent.toBBOX(4);
		
		return stateObject;
	},
	buildURL: function(page,includeName)
	{
		var url = "";
		var params = [];
		url += page||this.pages.main;
		
		if(includeName||false)
		{
			params.push("name="+this.name);	
		}
		
		if(this.isSingle())
		{
			params.push("d="+this.formatCurrentDate(this.FORMAT_QUERYSTRING));
		}
		else if(this.isRange())
		{
			params.push("start="+this.formatCurrentStartDate(this.FORMAT_QUERYSTRING));
			params.push("end="+this.formatCurrentEndDate(this.FORMAT_QUERYSTRING));
		}
		
		params.push("z="+this.zoom);
		params.push("lat="+this.lonlat.lat.toFixed(4));
		params.push("lon="+this.lonlat.lon.toFixed(4));
		//params.push("extent="+this.extenttoBBOX(4));
		
		if(this.defaultFeatureLayerNames!=this.activeFeatureLayerNames)
		{
			params.push("layers="+this.activeFeatureLayerNames);
		}
		
		if(params.length>0)
		{
			url += "?"+params.join("&");
		}
		
		return url;
	},
	boundDate: function(date)
	{
		var newDate = undefined;
		if(date.getTime()>this.maxTime)
		{
			newDate = CyberGIS.copyDate(this.maxDate);
		}
		else if(date.getTime()<this.minTime)
		{
			newDate = CyberGIS.copyDate(this.minDate);
		}
		else
		{
			newDate = CyberGIS.copyDate(date);
		}
		return newDate;
	},
	getCurrentDate: function()
    {
    	return this.currentDate;
    },
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
	formatCurrentDate: function(format)
	{
		return this.formatDate(this.getCurrentDate(),format);
	},
	formatCurrentStartDate: function(format)
	{
		return this.formatDate(this.getCurrentStartDate(),format);
	},
	formatCurrentEndDate: function(format)
	{
		return this.formatDate(this.getCurrentEndDate(),format);
	},
    formatDate: function(d,format)
    {
    	if(d!=undefined)
    	{
    		if(format==this.FORMAT_LABEL)
        	{
        		return this.monthsoftheyear[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();    		
        	}
        	else if(format==this.FORMAT_WFS||format==this.FORMAT_QUERYSTRING)
        	{
        		return d.getFullYear()+"-"+((d.getMonth()<9)?("0"+(d.getMonth()+1)):(d.getMonth()+1))+"-"+((d.getDate()<10)?("0"+d.getDate()):d.getDate());
        	}
    	}
    	else
    	{
    		return "";
    	}
    },
	getDays: function()
	{
		return this.days();
	},
	destroy: function ()
	{
		this.minDate = undefined;
		this.minTime = undefined;
		this.minText = undefined;
		this.maxDate = undefined;
		this.maxTime = undefined;
		this.maxText = undefined;
		this.days = undefined;
	},
	CLASS_NAME: "CyberGIS.State.OpenLayers"
});
CyberGIS.State.OL3 = CyberGIS.Class
({
	/* Static */
	
	FORMAT_WFS: "wfs",
	FORMAT_LABEL: "label",
	FORMAT_QUERYSTRING: "querystring",	

	milliseconds_per_day: 86400000,
	now: undefined,
	today: undefined,
	daysoftheweek:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	monthsoftheyear:['January','February','March','April','May','June','July','August','September','October','November','December'],
	
	nullIsland: undefined,
	
	/* Initial */
	name: undefined,
	title: undefined,
	pages: undefined,
	context: undefined,
	state: undefined,
	url: undefined,
	
	/* Time */
	timeType: undefined,
	
	minDate: undefined,
	minTime: undefined,
	minText: undefined,
	
	maxDate: undefined,
	maxTime: undefined,
	maxText: undefined,
	
	days: undefined,
	
	currentDate: undefined,
	currentTime: undefined,
	currentDateValue: undefined,
	
	currentDateRange: undefined,
	currentTimeRange: undefined,
	currentDateValueRange: undefined,
	
	/* Location */	
	map: undefined, /* CyberGIS.Map */
	sourceProjection: undefined,
	targetProjection: undefined,
	maxExtent: undefined,
	center: undefined,/*using map's projection*/
	lonlat: undefined,
	extent: undefined,
	minZoom: undefined,
	maxZoom: undefined,
	zoom: undefined,
	
	/* Layers */
	defaultFeatureLayerNames: undefined,
	activeFeatureLayerNames: undefined,
	
	initialize: function(map,element,sName,title,pages,domain,context,timeType,sMinDate,sMaxDate,iMinZoom,iMaxZoom,iZoom,projection,pX,pY,pLon,pLat,pTrack,baseLayer)
	{
		 this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		 //CyberGIS.extend(this, options);
		 if (this.id == null)
		 {
			 this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		 }
		 
		 this.setMap(map);
		 
		 this.nullIsland = [0, 0];
		 
		 //this.element = element;
		 this.track = this.buildTrack(element,pTrack);
		 this.name = sName;
		 this.title = title;
		 this.domain = domain;
		 this.context = context;
		 this.pages = this.buildPages(pages);
		 this.timeType = timeType;
		 this.now = new Date();
		 this.today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
		 this.sourceProjection = projection;//this.buildProjection(element,sProjection);
		 this.targetProjection = ol.proj.get("EPSG:4326")
		 this.center = this.nullIsland;
		 this.lonlat = this.buildLonLat(this.center,false);
		 this.extent = undefined;
		// this.defaultFeatureLayerNames = map.defaultFeatureLayerNames.join(",");
		// this.activeFeatureLayerNames = map.featureLayerNames.join(",");
		 this.refresh(element,sName,sMinDate,sMaxDate,iMinZoom,iMaxZoom,iZoom,pX,pY,pLon,pLat,baseLayer);
		 		 
		 if(this.track)
		 {
			 this.pushState();	 
		 }
		 else
		 {
			 this.map.log.logState(this.state);
		 }
	},
	setMap: function(map)
	{
		this.map = map;
		this.defaultFeatureLayerNames = map.defaultFeatureLayerNames.join(",");
		this.activeFeatureLayerNames = map.featureLayerNames.join(",");
	},
	activate: function()
	{
		if(this.track)
		{
			var that = this;
			this.sourceProjection = this.map.map.projection;
			
			this.map.map.on('moveend', function()
	      	{
				that.onMoveEnd.apply(that);
			});
			this.map.map.on('zoomend', function()
	      	{
				that.onZoomEnd.apply(that);
			});
		}
	},
	deactivate: function()
	{
		if(this.map!=undefined)
		{
			if(this.map.map!=undefined)
			{
				this.map.map.un('moveend', function()
		      	{
					that.onMoveEnd.apply(that);
				});
				this.map.map.un('zoomend', function()
		      	{
					that.onMoveEnd.apply(that);
				});
			}
		}
	},
	onMoveEnd: function()
	{
                try{
		this.center = this.map.map.getView().getCenter();
		this.lonlat = this.buildLonLat(this.center,false);
		//this.extent = this.map.map.getExtent();/* TODO */
                }catch(err){};
		////////////
		this.state = this.buildStateObject();
		this.url = this.buildURL();
		this.replaceState();
	},
	onZoomEnd: function()
	{
		//this.zoom = $.inArray(this.map.map.resolution,this.map.map.resolutions);
		this.zoom = this.map.map.getView().getZoom();
		////////////
		this.state = this.buildStateObject();
		this.url = this.buildURL();
		this.replaceState();
	},
	replaceState: function()
	{
		 CyberGIS.replaceState(this.state,this.title,this.url);
	},
	pushState: function()
	{
		this.map.log.logState(this.state);
		CyberGIS.pushState(this.state,this.title,this.url);
	},
	isSingle: function()
	{
		return this.timeType=="single";
	},
	isRange: function()
	{
		return this.timeType=="range";
	},	
	refresh: function(element,sName,sMinDate,sMaxDate,iMinZoom,iMaxZoom,iZoom,pX,pY,pLon,pLat,baseLayer)
	{
		var url = window.location.href;
		
		/* Name */
		this.name = this.buildName(sName,url);
		
		/* Time */
		this.maxDate = this.buildMaxDate(sMaxDate);
		this.maxTime = this.buildMaxTime();
		this.maxText = this.buildMaxText();
		this.minDate = this.buildMinDate(sMinDate);
		this.minTime = this.buildMinTime();
		this.minText = this.buildMinText();
		this.days = this.buildDays();
		
		if(this.isSingle())
		{
			var sDate = CyberGIS.getParameter(["t","d","date"],url);
			this.currentDate = this.buildCurrentDate(sDate);
			this.currentTime = this.buildCurrentTime();
			this.currentDateValue = this.buildCurrentDateValue();
		}
		else if(this.isRange())
		{
			var sStartDate = CyberGIS.getParameter(["s","start","startdate"],url);
			var sEndDate = CyberGIS.getParameter(["e","end","enddate"],url);
			this.currentDateRange = this.buildCurrentDateRange(sStartDate,sEndDate);			
			this.currentTimeRange = this.buildCurrentTimeRange();
		}
		else
		{
			this.currentDate = undefined;
			this.currentTime = undefined;
			this.currentDateValue = undefined;
			
			this.currentDateRange = undefined;
			this.currentTimeRange = undefined;
			//this.current
		}
		
		/* Location */
		this.minZoom = this.buildMinZoom(element,iMinZoom,baseLayer,0);
		this.maxZoom = this.buildMaxZoom(element,iMaxZoom,baseLayer,10);
		this.zoom = this.buildZoom(element,iZoom,baseLayer,3,url);
		this.center = this.buildCenter(element,pX,pY,pLon,pLat,url,this.nullIsland);
		this.lonlat = this.buildLonLat(this.center,false);
		this.extent = undefined;
		
		this.state = this.buildStateObject();
		this.url = this.buildURL();
	},
	buildPages: function(pPages)
	{
		var pages = {};
		if(pPages!=undefined)
		{
			if(CyberGIS.isString(pPages))
			{
				pages["main"] = pPages;
				pages["thumbnail"] = pPages;
				pages["embed"] = pPages;
			}
			else
			{
				pages["main"] = pPages.main;
				pages["thumbnail"] = pPages.thumbnail||pPages.main;
				pages["embed"] = pPages.embed||pPages.main;
			}
		}
		else
		{
			pages["main"] = "";
			pages["thumbnail"] = "";
			pages["embed"] = "";
		}
		return pages;
	},
	buildName: function(sName,url)
	{
		return CyberGIS.getParameterAsString(["n","name"],url,true)||sName;
	},
	buildTrack: function(element,pTrack)
	{
		return element.data('mapTrack')||pTrack;
	},
	/*
	 * Deprecated: Projection should be passed into constructor as the map should build it so it knows how to interpret maxextents and aois
	buildProjection: function(element,sProjection)
	{
		var projection = undefined;
		
		var eProjection = element.data('mapProjection');
		if(eProjection!=undefined)
		{
			if(CyberGIS.isString(eProjection))
			{
				projection = new OpenLayers.Projection(eProjection); 
			}
		}
		
		if(projection==undefined)
		{
			if(sProjection!=undefined)
			{
				if(CyberGIS.isString(sProjection))
				{
					projection = new OpenLayers.Projection(sProjection);
				}
			}
		}
		return projection;
	},*/
	buildCenter: function(element,pX,pY,pLon,pLat,url,fallback)
	{
		var qs_q = CyberGIS.getParameterAsIntegerArray(["q","query"],url,",");		
		if(qs_q!=null)
		{
			if(qs_q.length>=3)
			{
				center = ol.proj.transform([qs_q[1],qs_q[0]],'EPSG:4326','EPSG:3857');
			}
		}
		else
		{
			var qs_lon = CyberGIS.getParameterAsDouble(["lon","longitude"],url,undefined);
			var qs_lat = CyberGIS.getParameterAsDouble(["lat","latitude"],url,undefined);
			if(qs_lon!=undefined&&qs_lat!=undefined)
			{
				center = ol.proj.transform([qs_lon,qs_lat],'EPSG:4326','EPSG:3857');
			}
			else
			{
				if(pX!=undefined&&pY!=undefined)
				{
					center = [px,pY];
				}
				else if(pLon!=undefined&&pLat!=undefined)
				{
					center = ol.proj.transform([pLon,pLat],'EPSG:4326','EPSG:3857');
				}
				else
				{
					var eLon = element.data('mapLon');
					var eLat = element.data('mapLat');
					var eX = element.data('mapX');
					var eY = element.data('mapY');
					
					var center = undefined;
					
					if(eX!=undefined&&eY!=undefined)
					{
						center = [eX,eY];
					}
					else if(eLon!=undefined&&eLat!=undefined)
					{
						center = ol.proj.transform([eLon,eLat],'EPSG:4326','EPSG:3857');
					}
					else
					{
						center = fallback;
					}
				}
			}
		}
		center = this.checkCenter(center,this.map.maxExtent);
		return center;
	},
	checkCenter: function(c,maxExtent)
	{
		if(!this.testCenter(c,maxExtent))
		{
			var c2 = maxExtent.getCenterLonLat();
			this.map.log.logError("Could not initialize map with center ("+c.toShortString()+").  The center is outside of the max extent of ("+maxExtent.toBBOX()+").  Map initialized at the center of the max extent ("+c2.toShortString()+") instead.");
			c = c2;
		}
		return c;
	},	
	testCenter: function(center,maxExtent)
	{
		return (maxExtent==undefined)||(maxExtent.contains(center.lon,center.lat,true));
	},	
	buildLonLat: function(center,reverse)
	{
		var lonlat = undefined;
		if(reverse)
		{
			//lonlat = (new OpenLayers.LonLat(center.lat,center.lon)).transform(this.sourceProjection, this.targetProjection);
                        lonlat = ol.proj.transform([center[1], center[0]], this.sourceProjection.getCode(), this.targetProjection.getCode());
		}
		else
		{
			//lonlat =  (new OpenLayers.LonLat(center.lon,center.lat)).transform(this.sourceProjection, this.targetProjection);
                        lonlat = ol.proj.transform(center, this.sourceProjection.getCode(), this.targetProjection.getCode());
		}
		return lonlat;
	},
	buildMinZoom: function(element,iMinZoom,baseLayer,fallback)
	{
		var minZoom = CyberGIS.initAttribute(element, "mapMinZoom", iMinZoom, baseLayer, "minZoom", fallback); 
		return minZoom;
	},
	buildMaxZoom: function(element,iMaxZoom,baseLayer,fallback)
	{
		var maxZoom = CyberGIS.initAttribute(element, "mapMaxZoom", iMaxZoom, baseLayer, "maxZoom", fallback); 
		return maxZoom;
	},
	buildZoom: function(element,iZoom,baseLayer,fallback,url)
	{
		var zoom = undefined;
		
		var qs_q = CyberGIS.getParameterAsIntegerArray(["q","query"],url,",");		
		if(qs_q!=null)
		{
			if(qs_q.length>=3)
			{
				zoom = qs_q[3];
			}
		}
		
		if(zoom==undefined)
		{
			var qs_zoom = CyberGIS.getParameterAsInteger(["z","zoom"],url,-1);
			if(qs_zoom!=-1)
			{
				zoom = qs_zoom;
			}
			else
			{
				zoom = CyberGIS.initAttribute(element, "mapZoom", iZoom, baseLayer, "minZoom", fallback);	
			}
		}
		return zoom;
	},
	buildCurrentDate: function(sDate)
	{
		var date = undefined;
		if(sDate!=undefined)
		{
			var aDate = sDate.split("-");
			date = new Date(parseInt(aDate[0],10),parseInt(aDate[1],10)-1,parseInt(aDate[2],10));
			date = this.boundDate(date);
		}
		else
		{
			date = CyberGIS.copyDate(this.maxDate);
		}
		return date;
	},
	buildCurrentDateRange: function(sStartDate,sEndDate)
	{
		var startDate = undefined;
		if(sStartDate!=undefined)
		{
			var aStartDate = sStartDate.split("-");
			startDate = new Date(parseInt(aStartDate[0],10),parseInt(aStartDate[1],10)-1,parseInt(aStartDate[2],10));
			startDate = this.boundDate(startDate);
		}
		else
		{
			startDate = new Date(this.maxDate.getFullYear(),this.maxDate.getMonth(),this.maxDate.getDate()-7);
		}
		return date;
	},
	buildMaxDate: function(sMaxDate)
	{
		var maxDate = undefined;
		if(sMaxDate!=undefined)
		{
			var aMaxDate = sMaxDate.split("-");
			maxDate = new Date(parseInt(aMaxDate[0],10),parseInt(aMaxDate[1],10)-1,parseInt(aMaxDate[2],10));
		}
		else
    	{
			maxDate = CyberGIS.copyDate(this.today);
    	}
		return maxDate;
	},
	buildMaxTime: function()
	{
		return this.maxDate.getTime();
	},
	buildMaxText: function()
	{
		return "There is no data after "+(this.maxDate.getMonth()+1)+"/"+this.maxDate.getDate()+"/"+this.maxDate.getFullYear();
	},
	buildMinDate: function(sMinDate)
	{
		var minDate = undefined;
		if(sMinDate!=undefined)
		{
			var aMinDate = sMinDate.split("-");
			minDate = new Date(parseInt(aMinDate[0],10),parseInt(aMinDate[1],10)-1,parseInt(aMinDate[2],10));
		}
		else
		{
			minDate = new Date(this.maxDate.getFullYear(),this.maxDate.getMonth(),this.maxDate.getDate()-7);
		}
		return minDate;
	},
	buildMinTime: function()
	{
		return this.minDate.getTime();
	},
	buildMinText: function()
	{
		return "There is no data before "+(this.minDate.getMonth()+1)+"/"+this.minDate.getDate()+"/"+this.minDate.getFullYear();
	},
	buildCurrentTime: function()
	{
		return this.currentDate.getTime();
	},
	buildCurrentDateValue: function()
	{
		return Math.floor((this.currentTime-this.minTime)/this.milliseconds_per_day);
	},
	buildDays: function()
	{
		return ((this.maxTime-this.minTime)/this.milliseconds_per_day)+1;
	},
	buildStateObject: function()
	{
		var stateObject = {};
		
		stateObject["name"] = this.name;
		
		if(this.isSingle())
		{
			stateObject["date"] = this.formatCurrentDate(this.FORMAT_QUERYSTRING);
		}
		else if(this.isRange())
		{
			stateObject["start"] = this.formatCurrentStartDate(this.FORMAT_QUERYSTRING);
			stateObject["end"] = this.formatCurrentEndDate(this.FORMAT_QUERYSTRING);
		}
		
		stateObject["zoom"] = this.zoom;
		stateObject["lat"] = this.lonlat.lat;
		stateObject["lon"] = this.lonlat.lon;
		
		//stateObject["extent"] = this.extent.toBBOX(4);
		
		return stateObject;
	},
	buildURL: function(page,includeName)
	{
		var url = "";
		var params = [];
		url += page||this.pages.main;
		
		if(includeName||false)
		{
			params.push("name="+this.name);	
		}
		
		if(this.isSingle())
		{
			params.push("d="+this.formatCurrentDate(this.FORMAT_QUERYSTRING));
		}
		else if(this.isRange())
		{
			params.push("start="+this.formatCurrentStartDate(this.FORMAT_QUERYSTRING));
			params.push("end="+this.formatCurrentEndDate(this.FORMAT_QUERYSTRING));
		}
		
		params.push("z="+this.zoom);
		//params.push("lat="+this.lonlat.lat.toFixed(4));
		//params.push("lat="+this.lonlat.lat.toFixed(4));
		params.push("lat="+this.lonlat[1].toFixed(4));
		params.push("lon="+this.lonlat[0].toFixed(4));
		//params.push("extent="+this.extenttoBBOX(4));
		
		if(this.defaultFeatureLayerNames!=this.activeFeatureLayerNames)
		{
			params.push("layers="+this.activeFeatureLayerNames);
		}
		
		if(params.length>0)
		{
			url += "?"+params.join("&");
		}
		
		return url;
	},
	boundDate: function(date)
	{
		var newDate = undefined;
		if(date.getTime()>this.maxTime)
		{
			newDate = CyberGIS.copyDate(this.maxDate);
		}
		else if(date.getTime()<this.minTime)
		{
			newDate = CyberGIS.copyDate(this.minDate);
		}
		else
		{
			newDate = CyberGIS.copyDate(date);
		}
		return newDate;
	},
	getCurrentDate: function()
    {
    	return this.currentDate;
    },
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
	formatCurrentDate: function(format)
	{
		return this.formatDate(this.getCurrentDate(),format);
	},
	formatCurrentStartDate: function(format)
	{
		return this.formatDate(this.getCurrentStartDate(),format);
	},
	formatCurrentEndDate: function(format)
	{
		return this.formatDate(this.getCurrentEndDate(),format);
	},
    formatDate: function(d,format)
    {
    	if(d!=undefined)
    	{
    		if(format==this.FORMAT_LABEL)
        	{
        		return this.monthsoftheyear[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();    		
        	}
        	else if(format==this.FORMAT_WFS||format==this.FORMAT_QUERYSTRING)
        	{
        		return d.getFullYear()+"-"+((d.getMonth()<9)?("0"+(d.getMonth()+1)):(d.getMonth()+1))+"-"+((d.getDate()<10)?("0"+d.getDate()):d.getDate());
        	}
    	}
    	else
    	{
    		return "";
    	}
    },
	getDays: function()
	{
		return this.days();
	},
	destroy: function ()
	{
		this.minDate = undefined;
		this.minTime = undefined;
		this.minText = undefined;
		this.maxDate = undefined;
		this.maxTime = undefined;
		this.maxText = undefined;
		this.days = undefined;
	},
	CLASS_NAME: "CyberGIS.State.OL3"
});

CyberGIS.Message = CyberGIS.Class(
{
	type: undefined,
	message: undefined,
	initialize: function(type, message)
	{
		this.type = type;
		this.message = message;
	},
	asText: function()
	{
		var str = "";
		if(this.type=="error")
		{
			str = "Error:\t"+this.message;
		}
		else if(this.type=="message")
		{
			str = "Message:\t"+this.message;
		}
		else
		{
			str = "";
		}
		return str;
	},
	CLASS_NAME: "CyberGIS.Message"
});


CyberGIS.Log = CyberGIS.Class(
{
	/* Location */
	map: undefined,/* CyberGIS.Map*/
	states: undefined,
	messages: undefined,
	
	initialize: function(map)
	{
		 this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		 
		 if (this.id == null)
		 {
			 this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		 }
		 this.setMap(map);
		 this.states = [];
		 this.messages = [];
	},
	setMap: function(map)
	{
		this.map = map;
	},
	logError: function(message)
	{
		this.messages.push(new CyberGIS.Message("error",message));
	},
	logMessage: function(message)
	{
		this.messages.push(new CyberGIS.Message("message",message));
	},
	logState: function(state)
	{
		this.states.push(state);
	},
	getFirstState: function()
	{
		return this.states[0];
	},
	getLastState: function()
	{
		return this.states[this.states.length-1];
	},
	getAllMessages: function()
	{
		return this.messages;
	},
	getErrorMessages: function()
	{
		return $.grep(this.messages,function(m,i){return m.type="error";});
	},
	CLASS_NAME: "CyberGIS.Log"
});

CyberGIS.PCodes = CyberGIS.Class
({
	key: "pcode",
	
	callbackFunction: undefined,
	callbackContext: undefined,
	
	pcodes: undefined,// Map of Level to CyberGIS.File.HashMap

	files: undefined,
	index: 0,
	
	initialize: function (files, callbackFunction, callbackContext, options)
	{
		this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		CyberGIS.extend(this, options);
		if (this.id == null)
		{
			this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		}
		
		this.files = files;
		this.callbackFunction = callbackFunction;
		this.callbackContext = callbackContext;
		
		this.pcodes = {};
		this.index = 0;
		this.init_files();
	},
	
	init_files: function()
	{
		if(this.index < this.files.length)
		{
			var f = this.files[this.index];
			this.init_file(f.level,f.url,f.delimiter,f.key||this.key);
			this.index = this.index + 1;
		}
		else
		{
			this.callbackFunction.apply(this.callbackContext);
		}
	},
	
	init_file: function(level,url,delimiter,key)
	{
		if(this.debug){console.log('init_file');}
		
		this.pcodes[""+level] = new CyberGIS.File.PCodes(level,url,delimiter,key,this.init_files,this);
	},
	
	getValue: function(level,code)
	{
		var value = undefined;
		if(this.pcodes!=undefined)
		{
			if(this.pcodes[""+level]!=undefined)
			{
				value = this.pcodes[""+level].getValue(code);
			}
		}
		return value;
	},
	destroy: function ()
	{
		
	},
	CLASS_NAME: "CyberGIS.PCodes"
	
});

CyberGIS.Glossaries = CyberGIS.Class
({
	callbackFunction: undefined,
	callbackContext: undefined,
	
	glossaries: undefined,// Array of CyberGIS.File.Glossary

	files: undefined,
	index: 0,
	
	initialize: function (files, callbackFunction, callbackContext, options)
	{
		this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		CyberGIS.extend(this, options);
		if (this.id == null)
		{
			this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		}
		
		this.files = files;
		this.callbackFunction = callbackFunction;
		this.callbackContext = callbackContext;
		
		this.glossaries = [];
		this.index = 0;
		this.init_files();
	},
	
	init_files: function()
	{
		if(this.index < this.files.length)
		{
			var f = this.files[this.index];
			this.init_file(f.name,f.label,f.url,f.delimiter);
			this.index = this.index + 1;
		}
		else
		{
			this.callbackFunction.apply(this.callbackContext);
		}
	},
	
	init_file: function(name,label,url,delimiter)
	{
		if(this.debug){console.log('init_file');}
		
		this.glossaries.push(new CyberGIS.File.Glossary(name,label,url,delimiter,this.init_files,this));//CyberGIS.File.Glossary(hiu.url.app.glossary,"\t",this.init_conf_proto,this);
	},
	
	destroy: function ()
	{
		
	},
	CLASS_NAME: "CyberGIS.PCodes"
	
});

CyberGIS.Wikis = CyberGIS.Class
({
	callbackFunction: undefined,
	callbackContext: undefined,
	
	wikis_array: undefined,
	wikis_map: undefined,
	config: undefined,
	
	initialize: function (config, callbackFunction, callbackContext, options)
	{
		this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		CyberGIS.extend(this, options);
		if (this.id == null)
		{
			this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		}
		
		this.config = config;
		this.callbackFunction = callbackFunction;
		this.callbackContext = callbackContext;
		
		this.wikis_array = [];
		this.wikis_map = {};
		this.init_wikis();
	},
	
	init_wikis: function()
	{
		for(var i = 0; i < this.config.length; i++)
		{
			var w = this.config[i];
			this.init_wiki(w.name,w.label,w.classification,w.description,w.url);
		}
		this.callbackFunction.apply(this.callbackContext);
	},
	
	init_wiki: function(name,label,classification,description,url)
	{
		if(this.debug){console.log('init_wiki');}
		
		this.addWiki(new CyberGIS.Wiki(name,label,classification,description,url));
	},
	addWiki: function(wiki)
	{
		this.wikis_array.push(wiki);
		this.wikis_map[""+wiki.name] = wiki;
	},
	getWiki: function(name)
	{
		if(this.wikis_map!=undefined)
		{
			return this.wikis_map[""+name];
		}
	},
	destroy: function ()
	{
		
	},
	CLASS_NAME: "CyberGIS.Wikis"
	
});

CyberGIS.Wiki = CyberGIS.Class
({
	name: undefined,
	label: undefined,
	classification: undefined,
	description: undefined,
	url: undefined,
	
	initialize: function (name,label,classification,description,url)
	{
		 this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		 //CyberGIS.extend(this, options);
		 if (this.id == null)
		 {
			 this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		 }
		 
		 this.name = name;
		 this.label = label;
		 this.classification = classification;
		 this.description = description;
		 this.url = url;
	},	
	getLabel: function()
	{
		return this.label;
	},
	getName: function()
	{
		return this.name;
	},
	getURL: function()
	{
		return this.url;
	},
	destroy: function ()
	{
		this.name = undefined;
		this.label = undefined;
		this.classification = undefined;
		this.description = undefined;
		this.url = undefined;
	},
	CLASS_NAME: "CyberGIS.Wiki"
});

CyberGIS.Apps = CyberGIS.Class
({
	callbackFunction: undefined,
	callbackContext: undefined,
	
	apps_array: undefined,
	apps_map: undefined,
	config: undefined,
	
	initialize: function (config, callbackFunction, callbackContext, options)
	{
		this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		CyberGIS.extend(this, options);
		if (this.id == null)
		{
			this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		}
		
		this.config = config;
		this.callbackFunction = callbackFunction;
		this.callbackContext = callbackContext;
		
		this.apps_array = [];
		this.apps_map = {};
		this.init_apps();
	},
	
	init_apps: function()
	{
		for(var i = 0; i < this.config.length; i++)
		{
			var a = this.config[i];
			this.init_app(a.name,a.label,a.classification,a.description,a.url);
		}
		this.callbackFunction.apply(this.callbackContext);
	},
	
	init_app: function(name,label,classification,description,url)
	{
		if(this.debug){console.log('init_app');}
		
		this.addApp(new CyberGIS.App(name,label,classification,description,url));
	},
	addApp: function(app)
	{
		this.apps_array.push(app);
		this.apps_map[""+app.name] = app;
	},
	getApp: function(name)
	{
		if(this.apps_map!=undefined)
		{
			return this.apps_map[""+name];
		}
	},
	destroy: function ()
	{
		
	},
	CLASS_NAME: "CyberGIS.Apps"
	
});

CyberGIS.App = CyberGIS.Class
({
	name: undefined,
	label: undefined,
	classification: undefined,
	description: undefined,
	//url: undefined,
	page: undefined,
	querystring: undefined,
	delimiter: undefined,
	order: undefined,
	precision: undefined,
	
	initialize: function (name,label,classification,description,url)
	{
		 this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		 //CyberGIS.extend(this, options);
		 if (this.id == null)
		 {
			 this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		 }
		 
		 this.name = name;
		 this.label = label;
		 this.classification = classification;
		 this.description = description;
		 if(url!=undefined)
		 {
			 this.page = url.page;
			 this.querystring = url.querystring || url.queryString;
			 this.delimiter = url.delimiter;
			 this.order = url.order!=undefined?url.order.split(","):undefined;
			 this.precision = url.precision;
		 }
	},	
	getLabel: function()
	{
		return this.label;
	},
	getName: function()
	{
		return this.name;
	},
	getURL: function()
	{
		return this.url;
	},
	getPage: function()
	{
		return this.page;
	},
	getQueryString: function()
	{
		return this.querystring;
	},
	getDelimiter: function()
	{
		return this.delimiter;
	},
	hasPrecision: function()
	{
		return this.precision!=undefined;
	},
	getPrecision: function()
	{
		return this.precision;
	},
	getLink: function(x,y,z,bbox)
	{
		var s = undefined;
		
		var p = this.getPrecision();		
		if(this.hasPrecision())
		{
			x = x.toFixed(p);
			y = y.toFixed(p);
			for(var i = 0; i < bbox.length; i++)
			{
				bbox[i] = bbox[i].toFixed(p);
			}
		}		
		
		var page = this.getPage();
		var qs = this.getQueryString();
		if(qs!=undefined)
		{
			if(qs.length>0)
			{
				qs = CyberGIS.String.replaceWith(qs,["{x}","{X}","{lon}","{longitude}"],x);
				qs = CyberGIS.String.replaceWith(qs,["{y}","{y}","{lat}","{latitude}"],y);
				qs = CyberGIS.String.replaceWith(qs,["{z}","{Z}","{zoom}"],z);
				qs = CyberGIS.String.replaceWith(qs,["{b}","{bbox}","{bounds}"],bbox);
				s = page + "?"+ qs;
			}
		}
		else
		{
			var a = [];
			var d = this.getDelimiter();
			if(CyberGIS.isArray(this.order))
			{
				for(var i = 0; i < this.order.length; i++)
				{
					var v = undefined;
					
					if(this.order[i]=="x")
					{
						v = x;
					}
					else if(this.order[i]=="y")
					{
						v = y;
					}
					else if(this.order[i]=="z"||this.order[i]=="zoom")
					{
						v = z;
					}
					else if(this.order[i]=="b"||this.order[i]=="bbox"||this.order[i]=="bounds")
					{
						v = bbox;
					}
					
					if(v!=undefined)
					{
						a.push(v);	
					}
				}
			}
			s = page + a.join(d);
		}
		return s;
	},
	destroy: function ()
	{
		this.name = undefined;
		this.label = undefined;
		this.classification = undefined;
		this.description = undefined;
		this.url = undefined;
	},
	CLASS_NAME: "CyberGIS.App"
});

CyberGIS.DataSources = CyberGIS.Class
({
	callbackFunction: undefined,
	callbackContext: undefined,
	
	sources: undefined,//{name-->DataSource}

	files: undefined,
	index: 0,
	
	initialize: function (files, callbackFunction, callbackContext, options)
	{
		this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		CyberGIS.extend(this, options);
		if (this.id == null)
		{
			this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		}
		
		this.files = files;
		this.callbackFunction = callbackFunction;
		this.callbackContext = callbackContext;
		
		this.sources = {};
		this.index = 0;
		this.init_files();
	},
	
	init_files: function()
	{
		if(this.index < this.files.length)
		{
			var f = this.files[this.index];
			this.init_file(f.name,f.label,f.type,f.url,f.key,f.delimiter,f.multiple||false);
			this.index = this.index + 1;
		}
		else
		{
			this.callbackFunction.apply(this.callbackContext);
		}
	},
	
	init_file: function(name,label,type,url,key,delimiter,multiple)
	{
		if(this.debug){console.log('init_file');}
		
		if(type=="pcode")
		{
			this.sources[""+name] = new CyberGIS.DataSource.PCoded(name,label,url,delimiter,key,this.init_files,this);//CyberGIS.File.Glossary(hiu.url.app.glossary,"\t",this.init_conf_proto,this);
		}
		else if(type=="hashmap")
		{
			this.sources[""+name] = new CyberGIS.DataSource.HashMap(name,label,url,delimiter,key,multiple,this.init_files,this);
		}			
	},
	
	destroy: function ()
	{
		
	},
	CLASS_NAME: "CyberGIS.DataSources"
	
});


CyberGIS.Map = {};
CyberGIS.Map.OpenLayers = CyberGIS.Class
({
	/* Callback */
	client: undefined,
	callbackFunction: undefined,
	callbackContext: undefined,
	
	/* Static */
	resolutions: [156543.03390625,78271.516953125,39135.7584765625,19567.87923828125,9783.939619140625,4891.9698095703125,2445.9849047851562,1222.9924523925781,611.4962261962891,305.74811309814453,152.87405654907226,76.43702827453613,38.218514137268066,19.109257068634033,9.554628534317017,4.777314267158508,2.388657133579254,1.194328566789627,0.5971642833948135],
	onValues: ["yes","true","1","t"],
	
	/* Core */
	log: undefined,
	mapID: undefined,
	element: undefined,
	map: undefined,
	state: undefined,
	projection: undefined,/* Initialized in init_parameters instead of init_state, because extent loading needs it4326*/
	
	
	/* Parameters */
	bTitle: undefined,
	bLink: undefined,
	bNav: undefined,
	bZoom: undefined,
	bSelect: undefined,
	bBookmarks: undefined,
	bTime: undefined,
	bLegend: undefined,
	bSearch: undefined,
	bStatic: undefined,
	maxExtent: undefined,
	aoi: undefined,/* Visual bounding Boxes*/
	
	/* ProtoLayers */
	proto_baselayer_primary: undefined,
	baseLayerNames: undefined,	
	featureLayerNames: undefined,
	searchLayerNames: undefined,
	legendLayerNames: undefined,
	dialogLayerNames: undefined,
	renderLayerNames: undefined,
	chartLayerName: undefined,
	chartName: undefined,
	
	/* Controls */
	controls: undefined,
	
	/* Layers */
	baseLayers: undefined,
	featureLayers: undefined,
	timeLayers: undefined,
	searchLayers: undefined,
	selectLayers: undefined,
	wheelStyleMaps: undefined,
	chartLayer: undefined,
	
	/* Initialization Functions */
	
	initialize: function(client, mapID, element, controlOptions, properties, proto, carto, callbackFunction, callbackContext, options)
	{
		this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		CyberGIS.extend(this, options);
		if (this.id == null)
		{
			this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		}
		
		this.callbackFunction = callbackFunction;
		this.callbackContext = callbackContext;
		
		this.client = client;
		//this.state = client.state;
		this.mapID = mapID;
		this.element = element;
		
		var url = window.location.href;
		
		this.init_log();		
		
		this.init_parameters(url, element, properties, proto, carto); /* Initializes Parameters from QueryString, Element, and Options*/
		this.init_baselayers(proto, carto);
		this.init_state(properties,element);
		if(this.bStatic)
		{
			this.featureLayers = [];
			this.init_renderlayers(proto, carto);			
		}
		else
		{
			this.init_featurelayers(proto, carto);
			this.renderLayers = [];
		}
				
		this.init_controls(properties, controlOptions, proto, carto);
		this.init_map(properties, mapID, element);
		
		if(this.callbackFunction!=undefined&&this.callbackContext!=undefined)
		{
			this.callbackFunction.apply(this.callbackContext);
		}
	},
	init_log: function()
	{
		this.log = new CyberGIS.Log(this);
	},
	init_state: function(p,element)
	{
		this.state = new CyberGIS.State.OpenLayers(this,element,p.name,p.title,p.pages,p.domain,p.context,p.time,p.minDate,p.maxDate,p.minZoom,p.maxZoom,p.zoom,this.projection,p.x,p.y,p.longitude,p.latitude,p.track,this.proto_baselayer_primary);
	},
	init_parameters: function(url, element, properties, proto, carto)
	{
		/* Base Layers */
		this.proto_baselayer_primary = undefined;
		this.baseLayerNames = undefined;
		
		var qsBaseLayerNames = CyberGIS.getParameterAsStringArray(["bl","baseLayer","baseLayers"], url, ",", true);		
		if(qsBaseLayerNames!=undefined)
		{
			this.baseLayerNames = qsBaseLayerNames;
		}
		else
		{
			if(element.data('mapBaseLayer')!=undefined)
			{
				this.baseLayerNames = [element.data('mapBaseLayer')];
			}
			else if(element.data('mapBaseLayers')!=undefined)
			{
				this.baseLayerNames = element.data('mapBaseLayers');
			}
			else
			{
				var pBaseLayers = properties["baseLayers"];
				if(pBaseLayers!=undefined)
				{
					if(CyberGIS.isArray(pBaseLayers))
					{
						this.baseLayerNames = pBaseLayers;
					}
				}
			}
		}
		
		if(this.baseLayerNames!=undefined)
		{
			this.proto_baselayer_primary = proto.layers[""+this.baseLayerNames[0]];
		}
		
		/* Projection*/
		this.projection = CyberGIS.parseProjection(CyberGIS.getParameter(["projection","proj","p"], url, ",", true)||CyberGIS.getData(["mapProjection"],element)||CyberGIS.getProperty(["projection"],properties,true));
		
		/* Bounds */
		this.maxExtent = this.init_max_extent(url,element,properties);//, this.proto_baselayer_primary);
		this.aoi = this.init_aoi(url,element,properties);
		
		this.bTitle = this.init_boolean(element.data('mapTitle'));
		this.bLink = this.init_boolean(element.data('mapLink'));
		this.bNav = this.init_boolean(element.data('mapNav'));
		this.bZoom = this.init_boolean(element.data('mapControlZoom'));
		this.bSelect = this.init_boolean(element.data('mapSelect'));
		this.bBookmarks = this.init_boolean(element.data('mapBookmarks'));
		this.bTime = this.init_boolean(element.data('mapTime'));
		this.bLegend = this.init_boolean(element.data('mapLegend'));
		this.bSearch = this.init_boolean(element.data('mapSearch'));
		this.bStatic = this.init_boolean(element.data('mapStatic'));
		//this.center = this.init_center(element);
		//this.zoom = element.data('mapZoom');
		
		this.chartLayerName = CyberGIS.getParameter(["chartLayers","chartLayer"], url, ",", true)||CyberGIS.getData(["mapChartLayers","mapChartLayer"],element)||CyberGIS.getProperty(["chartLayers","chartLayer"],properties,true);
		this.chartName = element.data('mapChartName') || "basic";
		
		
		this.boxLayerName = CyberGIS.getParameterAsString(["boxLayers","boxLayer"], url, ",", true)||CyberGIS.getData(["mapBoxLayers","mapBoxLayer"],element)||CyberGIS.getProperty(["boxLayers","boxLayer"],properties,true);
		this.boxName = element.data('mapBoxName') || "basic";
		
		/* Feature Layers*/
		//this.defaultFeatureLayerNames = this.init_array(element.data('mapFeatureLayers')||element.data('mapFeatureLayer')||element.data('featureLayer')||element.data('mapFeatureLayer')||properties["featureLayers"]);
		this.defaultFeatureLayerNames = this.init_array(CyberGIS.getDataAsStringArray(["mapFeatureLayers","mapFeatureLayer","featureLayers","featureLayer"],element,",")||properties["featureLayers"]||properties["featureLayer"]);
		this.featureLayerNames = CyberGIS.getParameterAsStringArray(["fl","featureLayer","featureLayers","layers"], url, ",", true)||this.defaultFeatureLayerNames;
		
		/* Search Layers */
		this.searchLayerNames = CyberGIS.getParameterAsStringArray(["sl","searchLayer","searchLayers"], url, ",", true)||element.data('mapSearchLayers')||CyberGIS.getProperty(["searchLayers","searchLayer"],properties,true);
		
		/* Legend Layers */
		this.legendLayerNames = CyberGIS.getParameterAsStringArray(["legendLayer","legendLayers"], url, ",", true)||element.data('mapLegendLayers')||CyberGIS.getProperty(["legendLayers","legendLayer"],properties,true);
		
		/* Render Layers */
		if(this.bStatic)
		{
			this.renderLayerNames = CyberGIS.getParameterAsStringArray(["renderLayer","renderLayers"], url, ",", true)||element.data('mapRenderLayers')||CyberGIS.getProperty(["renderLayers","renderLayer"],properties,true)||this.featureLayerNames;
		}
		else
		{
			this.renderLayerNames = [];
		}
		
		/* Dialog Layers */
		this.dialogLayerNames = CyberGIS.getParameterAsStringArray(["dialogLayer","dialogLayers"], url, ",", true)||element.data('mapDialogLayers')||CyberGIS.getProperty(["dialogLayers","dialogLayer"],properties,true);
	},
	init_max_extent: function(url,element,properties)
	{
		var maxExtent =
			CyberGIS.getParameterAsFloatArray(["maxExtent","extent"],url,",",true)||
			CyberGIS.getDataAsFloatArray(["mapMaxExtent","mapExtent","maxExtent","extent"],element,",")||
			CyberGIS.getProperty(["maxExtent","extent"],properties,true);
		
		if(maxExtent==undefined)
		{
			maxExtent =
				CyberGIS.getParameterAsFloatArray(["maxExtentInLatLon","extentInLatLon"],url,",",true)||
				CyberGIS.getDataAsFloatArray(["mapMaxExtentInLatLon","mapExtentInLatLon","maxExtentInLatLon","extentInLatLon"],element,",")||
				CyberGIS.getProperty(["maxExtentInLatLon","extentInLatLon"],properties,true);
			if(maxExtent!=undefined)
			{
				return CyberGIS.parseBounds(maxExtent,"EPSG:4326",this.projection);
			}
			else
			{
				return undefined;
			}
		}
		else
		{
			return CyberGIS.parseBounds(maxExtent);
		}
	},
	init_aoi: function(url,element,properties)
	{
		var aoi =
			CyberGIS.getParameterAsFloatArray(["aoi"],url,",",true)||
			CyberGIS.getDataAsFloatArray(["mapAOI","aoi"],element,",")||
			CyberGIS.getProperty(["areaOfInterest","aoi"],properties,true);
		
		if(aoi==undefined)
		{
			aoi =
				CyberGIS.getParameterAsFloatArray(["aoiInLatLon","aoi_ll"],url,",",true)||
				CyberGIS.getDataAsFloatArray(["mapAOIInLatLon","aoiInLatLon","mapAOI_ll","aoi_ll"],element,",")||
				CyberGIS.getProperty(["areaOfInterestInLatLon","aoiInLatLon","areaOfInterest_ll","aoi_ll"],properties,true);
			
			if(aoi!=undefined)
			{
				layer = new OpenLayers.Layer.Boxes("aoi");
				layer.addMarker(new OpenLayers.Marker.Box(CyberGIS.parseBounds(aoi,"EPSG:4326",this.projection),"red",4));
			}
			else
			{
				return undefined;
			}
		}
		else
		{
			layer = new OpenLayers.Layer.Boxes("aoi");
			layer.addMarker(new OpenLayers.Marker.Box(CyberGIS.parseBounds(aoi),"red",4));
		}
	    return layer;
	},
	init_boolean: function(str)
	{
		return $.inArray(str,this.onValues)!=-1;
	},
	init_array: function(a)
	{
		var b = undefined;
		if(CyberGIS.isArray(a))
		{
			b = a;
		}
		else if(CyberGIS.isString(a))
		{
			b = [a];
		}
		else
		{
			b = [];
		}
		return b;
	},
	/*Deprecated.  In CyberGIS.State now
	 * init_center: function(element)
	{
		var nullIsland = new OpenLayers.LonLat(0,0);
		
		var lon = element.data('mapLon');
		var lat = element.data('mapLat');
		var x = element.data('mapX');
		var y = element.data('mapY');
		
		var center = undefined;
		
		if(x!=undefined&&y!=undefined)
		{
			center = new OpenLayers.LonLat(x,y);
		}
		else if(lon!=undefined&&lat!=undefined)
		{
			center = new OpenLayers.LonLat(lon,lat);
			center.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
		}
		else
		{
			center = nullIsland;
		}
		return center;
	},*/
	init_attr: function(element, sAttribute, protoLayer, sField, fallback)
	{
		var value = undefined;
		if(element!=undefined)
		{
			if(element.data(sAttribute)!=undefined)
			{
				value = element.data(sAttribute);
			}
			else
			{
				if(protoLayer!=undefined)
				{
					if(protoLayer[''+sField]!=undefined)
					{
						value = protoLayer[''+sField];
					}
					else
					{
						value = fallback;
					}
				}
				else
				{
					value = fallback;
				}
			}
		}
		else
		{
			if(protoLayer!=undefined)
			{
				if(protoLayer[''+sField]!=undefined)
				{
					value = protoLayer[''+sField];
				}
				else
				{
					value = fallback;
				}
			}
			else
			{
				value = fallback;
			}
		}		
		return value;
	},
	init_baselayers: function(proto, carto)
	{
		this.baseLayers = [];
		if(proto!=undefined)
		{
			if(this.baseLayerNames!=undefined)
			{
				var r = this.resolutions;
				
				for(var i = 0; i < this.baseLayerNames.length; i++ )
				{
					var pbl = proto.layers[""+this.baseLayerNames[i]];
					if(pbl!=undefined)
					{
						var baseLayer = undefined;
						var type = pbl.type.toLowerCase();
						if(type=="openlayers.layer.mapbox"||type=="mapbox")
						{
							var options =
							{
								ssl:pbl.ssl,
								layername:pbl.layername,
								displayOutsideMaxExtent: false,
								wrapDateLine: false,
								isBaseLayer:(i==0)
							};
							
							if(pbl.minZoom!=undefined)
							{
								options.maxResolution = this.resolutions[pbl.minZoom];
							}
							else
							{
								options.maxResolution = this.getMaxResolution();
							}
							
							if(pbl.maxZoom!=undefined)
							{
								options.minResolution = this.resolutions[pbl.maxZoom];
							}
							else
							{
								options.minResolution = this.getMinResolution();
							}
							
							baseLayer = new OpenLayers.Layer.MapBox(pbl.name,options);
						}
						else if(type=="openlayers.layer.osm"||type=="osm"||type=="openstreetmap")
						{
							baseLayer = new OpenLayers.Layer.OSM(pbl.name,pbl.url,{minResolution:this.getMinResolution(),maxResolution:this.getMaxResolution(),displayOutsideMaxExtent: false,wrapDateLine: false,isBaseLayer:(i==0)});
						}
						else if(type=="openlayers.layer.hiutilecache")
						{
							//minResolution:r[maxZoom],maxResolution:r[minZoom]
							//[156543.03390625,78271.516953125,39135.7584765625,19567.87923828125,9783.939619140625,4891.9698095703125,2445.9849047851562,1222.9924523925781,611.4962261962891,305.74811309814453,152.87405654907226,76.43702827453613,38.218514137268066,19.109257068634033,9.554628534317017,4.777314267158508,2.388657133579254,1.194328566789627,0.5971642833948135]
							baseLayer = new OpenLayers.Layer.HIUTileCache(pbl.name,{layername:pbl.layername,minResolution:r[18],maxResolution:r[0],resolutions:r,displayOutsideMaxExtent: false,wrapDateLine: false,isBaseLayer:(i==0)});
						}
						else if(type=="openLayers.layer.wms"||type=="wms")
						{
							if(pbl.transparent)
								baseLayer = new OpenLayers.Layer.WMS(pbl.name,pbl.url,{layers:pbl.layers,transparent:pbl.transparent,bgcolor:(pbl.background!=undefined?pbl.background:"fromParent")},{opacity: pbl.opacity,singleTile: true,units: 'm',projection: 'EPSG:900913',displayOutsideMaxExtent: true,wrapDateLine: true,isBaseLayer:(i==0)});
							else
								baseLayer = new OpenLayers.Layer.WMS(pbl.name,pbl.url,{layers:pbl.layers,bgcolor:(pbl.background!=undefined?pbl.background:"fromParent")},{singleTile: true,units: 'm',projection: 'EPSG:900913',displayOutsideMaxExtent: true,wrapDateLine: true,isBaseLayer:(i==0)});
						}				
						else if(type=="openLayers.layer.arcgis93rest"||type=="arcgis")
						{
							baseLayer = new OpenLayers.Layer.ArcGIS93Rest(pbl.name,(pbl.url+'/'+pbl.layername+'/MapServer/export?f=image'),{layers: "show:0", format: "PNG24"});
						}
						if(baseLayer!=undefined)
						{
							this.baseLayers.push(baseLayer);
						}
					}
				}
			}
		}
	},
	init_featurelayers: function(proto, carto)
	{
		this.featureLayers = [];
		this.timeLayers = [];
		this.searchLayers = [];
		this.legendLayers = [];
		this.selectLayers = [];
		this.wheelStyleMaps = [];
		this.chartLayer = undefined;
		this.boxLayer = undefined;
		for(var i = 0; i < this.featureLayerNames.length; i++)
		{
			var name = this.featureLayerNames[i];
			var pfl = proto.layers[""+name];
			if(pfl!=undefined)
			{
				var styleMap = carto.styleMap(name,"default","select",true,false);
				var popup = pfl.popup||false;
				var jit = pfl.jit;
				var grep = undefined;
				var fl = undefined;
				if(pfl.type!=undefined)
				{
					var type = pfl.type.toLowerCase();
					if(type=="openlayers.layer.timevector"||type=="timevector")
					{
						fl = this.init_layer_vector_time(name,pfl,styleMap,popup,jit,grep);
						if(fl!=undefined)
						{
							this.timeLayers.push(fl);
						}
					}
					else if(type=="openlayers.layer.vector"||type=="vector")
					{
						fl = this.init_layer_vector_simple(name,pfl,styleMap,popup,jit,grep);
					}
					else if(type=="openlayers.layer.kml"||type=="kml")
					{
						fl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"kml");
					}
					else if(type=="openlayers.layer.soap"||type=="soap"||type=="sharepoint"||type=="SharePoint")
					{
						fl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"soap");
					}
					else if(type=="openlayers.layer.geojson"||type=="geojson")
					{
						fl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"geojson");
					}
					else if(type=="openlayers.layer.tsv"||type=="tsv")
					{
						fl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"tsv");
					}
					else if(type=="openlayers.layer.paceholder"||type=="placeholder")
					{
						fl = this.init_layer_vector_placeholder(name,pfl,styleMap,popup,jit,grep);
					}
				}
				
				if(fl!=undefined)
				{
					this.featureLayers.push(fl);
					if(pfl.select)
					{
						this.selectLayers.push(fl);
						var pointsStyleMap = carto.styleMap(name,"wheel","select",true,false);
						var linesStyleMap = new OpenLayers.StyleMap({'default':OpenLayers.Feature.Vector.style["default"]});
						var closeStyleMap = carto.closeStyleMap(name);
						var wheelStyleMap = {"points":pointsStyleMap,"close":closeStyleMap,"lines":linesStyleMap};
						this.wheelStyleMaps.push(wheelStyleMap);
					}
				}
				if(name==this.chartLayerName)
				{
					this.chartLayer = fl;
				}
				if(name==this.boxLayerName)
				{
					this.boxLayer = fl;
				}
				
				if($.inArray(name,this.searchLayerNames)!=-1)
				{
					this.searchLayers.push(fl);
				}
				
				if($.inArray(name,this.legendLayerNames)!=-1)
				{
					this.legendLayers.push(fl);
				}
			}
		}		
		
		if(this.legendLayerNames!=undefined)
		{
			if(this.legendLayers.length>1)
			{
				this.legendLayers = CyberGIS.sortArray(this.legendLayers,"proto",this.legendLayerNames);
			}
		}
		else
		{
			this.legendLayers = this.featureLayers;
		}		
	},
	init_renderlayers: function(proto, carto)
	{
		var s = this.state;
		this.renderLayers = [];
		this.chartLayer = undefined;
		this.boxLayer = undefined;
		
		var grep = {"op":"intersects","bbox":"${map}"};		
		for(var i = 0; i < this.renderLayerNames.length; i++)
		{
			var name = this.renderLayerNames[i];
			var pfl = proto.layers[""+name];
			if(pfl!=undefined)
			{
				var styleMap = carto.styleMap(name,"default","select",true,false);
				var popup = false;
				var jit = pfl.jit;
				var rl = undefined;
				if((pfl.minZoom==undefined||pfl.minZoom<=s.zoom)&&(pfl.maxZoom==undefined||pfl.maxZoom>=s.zoom))
				{
					if(pfl.type!=undefined)
					{
						var type = pfl.type.toLowerCase();
						if(type=="openlayers.layer.timevector"||type=="timevector")
						{
							rl = this.init_layer_vector_time(name,pfl,styleMap,popup,jit,grep);
						}
						else if(type=="openlayers.layer.vector"||type=="vector")
						{
							rl = this.init_layer_vector_simple(name,pfl,styleMap,popup,jit,grep);
						}
						else if(type=="openlayers.layer.kml"||type=="kml")
						{
							rl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"kml");
						}
						else if(type=="openlayers.layer.soap"||type=="soap"||type=="sharepoint"||type=="SharePoint")
						{
							rl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"soap");
						}
						else if(type=="openlayers.layer.geojson"||type=="geojson")
						{
							rl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"geojson");
						}
						else if(type=="openlayers.layer.tsv"||type=="tsv")
						{
							rl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"tsv");
						}
						else if(type=="openlayers.layer.paceholder"||type=="placeholder")
						{
							rl = this.init_layer_vector_placeholder(name,pfl,styleMap,popup,jit,grep);
						}
					}
					if(rl!=undefined)
					{
						this.renderLayers.push(rl);
						if(name==this.chartLayerName)
						{
							this.chartLayer = rl;
						}
						if(name==this.boxLayerName)
						{
							this.boxLayer = rl;
						}
					}
				}
			}
		}
	},
	init_layer_vector_placeholder: function(protoname,pfl,styleMap,popup,jit,grep)
	{
		var fl = undefined;
		var protocol = undefined;
		var options =
		{
			proto: protoname,
			projection: new OpenLayers.Projection(pfl.projection),
			protocol: protocol,
			strategies: [],
			'styleMap':styleMap,
			'popup': popup
		};
		if(pfl.minZoom!=undefined)
		{
			options.maxResolution = this.resolutions[pfl.minZoom];
		}
		if(pfl.maxZoom!=undefined)
		{
			options.minResolution = this.resolutions[pfl.maxZoom];
		}
		
		fl = new OpenLayers.Layer.Vector(pfl.name,options);
		return fl;
	},
	init_layer_vector_advanced: function(protoname,pfl,styleMap,popup,jit,grep,sFormat)
	{
		var fl = undefined;
		var format = undefined;
		var protocol = undefined;
		if(sFormat=="kml")
		{
			format = new OpenLayers.Format.KML({extractStyles: false, extractAttributes: true,maxDepth: 2});
			var protocolOptions = {readWithPOST:false, url: pfl.url, format: format};
			var protocol = new OpenLayers.Protocol.HTTP(protocolOptions);
		}
		else if(sFormat=="geojson")
		{
			format = new OpenLayers.Format.GeoJSON({ignoreExtraDims: true});
			var protocolOptions = {readWithPOST:false, url: pfl.url, format: format};
			var protocol = new OpenLayers.Protocol.HTTP(protocolOptions);
		}
		else if(sFormat=="tsv")
		{
			format = new OpenLayers.Format.AdvancedText({sourceProjection: new OpenLayers.Projection(pfl.projection), mapProjection: this.state.sourceProjection});
			var protocolOptions = {readWithPOST:false, url: pfl.url, format: format};
			var protocol = new OpenLayers.Protocol.HTTP(protocolOptions);
		}
		else if(sFormat=="soap")
		{
			format = new OpenLayers.Format.SOAP({sourceProjection: new OpenLayers.Projection(pfl.projection), mapProjection: this.state.sourceProjection});
			var protocolOptions = {readWithPOST:false, url: pfl.url, format: format, list: pfl.list, columns: pfl.columns};
			var protocol = new OpenLayers.Protocol.SOAP(protocolOptions);
		}		
		
		var options =
		{
			proto: protoname,
			projection: new OpenLayers.Projection(pfl.projection),
			protocol: protocol,
			'styleMap':styleMap,
			'popup': popup
		};
		if(pfl.minZoom!=undefined)
		{
			options.maxResolution = this.resolutions[pfl.minZoom];
		}
		if(pfl.maxZoom!=undefined)
		{
			options.minResolution = this.resolutions[pfl.maxZoom];
		}
		if(jit!=undefined||grep!=undefined)
		{
			options.jit = jit;
			options.strategies = [new OpenLayers.Strategy.JIT(jit,grep)];
		}
		else
		{
			options.strategies = [new OpenLayers.Strategy.Fixed()];
		}
		fl = new OpenLayers.Layer.Vector(pfl.name,options);
		return fl;
	},
	init_layer_vector_simple: function(protoname,pfl,styleMap,popup,jit,grep)
	{
		var fl = undefined;
		var protocol = new OpenLayers.Protocol.WFS({authenticated:pfl.authenticated,httpMethod:pfl.httpMethod,url: pfl.url,featureType: encodeURIComponent(pfl.layername),featureNS:pfl.namespace,featureWS:pfl.workspace});
		var options =
		{
			proto: protoname,
			protocol: protocol,
			projection: new OpenLayers.Projection(pfl.projection),
			'styleMap':styleMap,
			'popup': popup
		};
		if(pfl.minZoom!=undefined)
		{
			options.maxResolution = this.resolutions[pfl.minZoom];
		}
		if(pfl.maxZoom!=undefined)
		{
			options.minResolution = this.resolutions[pfl.maxZoom];
		}
		if(jit!=undefined||grep!=undefined)
		{
			options.jit = jit;
			options.strategies = [new OpenLayers.Strategy.JIT(jit,grep)];
		}
		else
		{
			options.strategies = [new OpenLayers.Strategy.Fixed()];
		}
		
		fl = new OpenLayers.Layer.Vector(pfl.name,options);
		return fl;
	},
	init_layer_vector_time: function(protoname,pfl,styleMap,popup,jit,grep)
	{
		var fl = undefined;
		var protocol = new OpenLayers.Protocol.WFS({authenticated:pfl.authenticated,httpMethod:pfl.httpMethod,url: pfl.url,featureType: encodeURIComponent(pfl.layername),featureNS:pfl.namespace,featureWS:pfl.workspace});
		var t = pfl.time;
		
		var options =
		{
			proto: protoname,
			protocol: protocol,
			'styleMap':styleMap,
			'popup':popup
		};
		if(pfl.minZoom!=undefined)
		{
			options.maxResolution = this.resolutions[pfl.minZoom];
		}
		if(pfl.maxZoom!=undefined)
		{
			options.minResolution = this.resolutions[pfl.maxZoom];
		}
		if(jit!=undefined||grep!=undefined)
		{
			options.jit = jit;
			options.strategies = [new OpenLayers.Strategy.JIT(jit,grep)];
		}
		else
		{
			options.strategies = [new OpenLayers.Strategy.Fixed()];
		}
		
		if(t.type=="single")
		{
			options.time_type = t.type;
			options.time_property = t.date;
			options.time_state = this.state.state;
		}
		else if(t.type=="range")
		{
			options.time_type = t.type;
			options.time_property_start = t.start;
			options.time_property_end = t.end;
			options.time_state = this.state.state;
		}
		
		fl = new OpenLayers.Layer.TimeVector(pfl.name, options);
		return fl;
	},
	init_controls: function(properties, options, proto, carto)
	{
		var s = this.state;
		var c = carto.getCarto();
		this.controls = undefined;
		
		var nav = undefined;
		if(this.bNav)
		{
			nav = new OpenLayers.Control.Navigation({defaultDblClick: function(event){return;},zoomWheelEnabled:true});
		}
		
		var zoom = undefined;
		if(this.bZoom)
		{
			zoom = new OpenLayers.Control.Zoom({});
		}
		
		var focus = undefined;
		if(this.bSelect)
		{
			if(this.selectLayers!=undefined)
			{
				var selectOptions = {wheelStyleMaps: this.wheelStyleMaps, popupFunction: carto.openPopup, popupContext: carto};
				if(options!=undefined)
				{
					if(options.select!=undefined)
					{
						selectOptions = CyberGIS.applyDefaults(CyberGIS.extend({},selectOptions),options.select);
					}
				}
				focus = new OpenLayers.Control.AdvancedSelectFeature(this.selectLayers,selectOptions);
			}
		}
		if(focus==undefined)
		{
			var selectOptions = {wheelStyleMaps:this.wheelStyleMaps};
			if(options!=undefined)
			{
				if(options.search!=undefined)
				{
					selectOptions = CyberGIS.applyDefaults(CyberGIS.extend({},selectOptions),options.select);
				}
			}
			focus = new OpenLayers.Control.Focus(selectOptions);
		}
		//
		//var attribution = new OpenLayers.Control.Attribution();
		var title = undefined;
		if(this.bTitle)
		{
			var titleOptions = {};
			if(options!=undefined)
			{
				if(options.title!=undefined)
				{
					titleOptions = CyberGIS.applyDefaults(CyberGIS.extend({},titleOptions),options.title);
				}
			}
			title = new OpenLayers.Control.Title(s.name,s.buildURL(properties.pages.main,false),titleOptions);
		}
		
		var link = undefined;
		if(this.bLink)
		{
			var linkOptions = {};
			if(options!=undefined)
			{
				if(options.link!=undefined)
				{
					linkOptions = CyberGIS.applyDefaults(CyberGIS.extend({},linkOptions),options.link);
				}
			}
			link = new OpenLayers.Control.Link(s.buildURL(properties.pages.main,false),linkOptions);
		}
		
		var disclaimer = undefined;
		if(true)
		{
			var disclaimerOptions = {};
			if(options!=undefined)
			{
				if(options.disclaimer!=undefined)
				{
					disclaimerOptions = CyberGIS.applyDefaults(CyberGIS.extend({},disclaimerOptions),options.disclaimer);
				}
			}
			disclaimer = new OpenLayers.Control.Disclaimer(disclaimerOptions);
		}
		var chart = undefined;
		if(this.chartLayer!=undefined)
		{
			if(OpenLayers.Control.AdvancedChart!=undefined)
			{
				chart = new OpenLayers.Control.AdvancedChart(this.chartLayer,this.chartLayerName,this.chartName,{type:'single',currentDate:s.currentDate,animate:false,minDate:s.minDate,maxDate:s.maxDate,carto:c});
			}
		}
		var box = undefined;
		if(this.boxLayer!=undefined)
		{
			if(OpenLayers.Control.Box!=undefined)
			{
				box = new OpenLayers.Control.Box(this.boxLayer,this.boxLayerName,this.boxName,{animate:false,carto:c});
			}
		}
		var time = undefined;
		if(this.bTime)
		{
			if(this.timeLayers.length>0)
			{
				if(OpenLayers.Control.TimeSlider!=undefined)
				{
					if(this.client.timeType=="single")
					{
						time = new OpenLayers.Control.TimeSlider(this.timeLayers,{type:"single",animate:true,currentDate:s.currentDate,minDate:s.minDate,maxDate:s.maxDate,dateTicks:true,dateLabels:true,chart:chart});
					}
					else if(this.client.timeType=="range")
					{
						time = new OpenLayers.Control.TimeSlider(this.timeLayers,{type:"range",animate:true,currentDateRange:s.currentDateRange,minDate:s.minDate,maxDate:s.maxDate,dateTicks:true,dateLabels:true,chart:chart});
					}
				}
			}
		}
		var legend = undefined;
		if(this.bLegend)
		{
			if(OpenLayers.Control.AdvancedLegend!=undefined)
			{
				legend = new OpenLayers.Control.AdvancedLegend(this.legendLayers,{type:'single',animate:false,currentDate:s.currentDate,minDate:s.minDate,maxDate:s.maxDate,carto:c});
			}
		}
		var search = undefined;
		if(this.bSearch)
		{
			if(OpenLayers.Control.AdvancedSearch!=undefined)
			{
				var searchOptions = {carto:c,selectControl:focus};
				if(options!=undefined)
				{
					if(options.search!=undefined)
					{
						searchOptions = CyberGIS.applyDefaults(CyberGIS.extend({},searchOptions),options.search);
					}
				}
				search = new OpenLayers.Control.AdvancedSearch(this.searchLayers,searchOptions);
			}
		}
		var bookmarks = undefined;
		if(this.bBookmarks)
		{
			if(OpenLayers.Control.Bookmarks!=undefined)
			{
				bookmarks = new OpenLayers.Control.Bookmarks(this.featureLayers,this.client.getBookmarks(),{carto:c,focusControl:focus});
			}
		}
		this.controls = [disclaimer];
		if(nav!=undefined)
		{
			this.controls.push(nav);
		}
		if(link!=undefined)
		{
			this.controls.push(link);
		}
		if(title!=undefined)
		{
			this.controls.push(title);
		}
		if(zoom!=undefined)
		{
			this.controls.push(zoom);
		}
		if(focus!=undefined)
		{
			this.controls.push(focus);
		}
		if(legend!=undefined)
		{
			this.controls.push(legend);
		}
		if(time!=undefined)
		{
			this.controls.push(time);
		}
		if(chart!=undefined)
		{
			this.controls.push(chart);
		}
		if(box!=undefined)
		{
			this.controls.push(box);
		}
		if(search!=undefined)
		{
			this.controls.push(search);
		}
		if(bookmarks!=undefined)
		{
			this.controls.push(bookmarks);
		}
		if(focus!=undefined)
		{
			if(focus.bFocusFeature)
			{
				if(this.selectLayers.length > 0)
				{
					for(var i = 0; i < this.selectLayers.length; i++)
					{
						this.selectLayers[i].events.register("loadend",this.selectLayers[i], function()
						{
							focus.activate();
						});
					}
				}
				this.selectControl = focus;
			}			
		}		
	},
	init_map: function(properties, mapID, element)
	{
		var s = this.state;
		
		this.map = new OpenLayers.Map(mapID,
		{
			panDuration: 10,
			controls: this.controls,
			units:'m',
			projection:'EPSG:900913',
			resolutions: this.resolutions,
			numZoomLevels: this.resolutions.length,
			allOverlays:true,
			center: s.center,
			zoom: s.zoom,
			maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
			restrictedExtent: this.maxExtent,
			panMethod:(this.client.animate?OpenLayers.Easing.Expo.easeOut:null)
		});
		
		var d = undefined;
		
		var fls = this.bStatic?this.renderLayers:this.featureLayers;
		var bls = this.aoi?this.baseLayers.concat([this.aoi]):this.baseLayers;
		
		if(bls.length==1)
		{
			d = {'m':this.map,'bl':bls[0],'fls':fls,'z':s.zoom,'c':this.controls,'select':this.selectControl,'state':s};
		}
		else
		{
			d = {'m':this.map,'bls':bls,'fls':fls,'z':s.zoom,'c':this.controls,'select':this.selectControl,'state':s,'track':properties.track};
		}
		element.data('cybergis',d);
	},
	
	/* Retrieval Functions */
	getMinResolution: function()
	{
		return this.resolutions[this.maxZoom];
	},
	getMaxResolution: function()
	{
		return this.resolutions[this.minZoom];
	},
	
	/* Command Line Functions */
	zoomTo: function(z)
	{
		this.map.zoomTo(z);
	},
	
	resize: function(w, h)
	{
		var d = this.element.data("cybergis");
		if(d!=undefined)
		{
			if(d.m!=undefined)
			{
				var center = d.m.getCenter();
				d.m.updateSize();
				
				if(d.m.baseLayer==undefined)
				{
					if(d.bl!=undefined)
					{
						d.m.addLayer(d.bl);
						d.bl.setVisibility(true);
					}
					else if(d.bls!=undefined)
					{
						for(var i = 0; i < d.bls.length; i++)
						{
							d.m.addLayer(d.bls[i]);
							d.bls[i].setVisibility(true);
						}
					}
					for(var i = 0; i < d.fls.length; i++)
					{
						var fl = d.fls[i];
						d.m.addLayer(fl);
						if(fl.options.jit!=undefined)
						{
							var strategy = fl.strategies[0]; 
							strategy.initJobs.apply(strategy);
						}
						fl.refresh({force: true});
					}
					
					d.m.zoomTo(d.z);
					
					d.state.activate.apply(d.state);
				}
				
				d.m.setCenter(center);
				
				if(d.c!=undefined)
				{
					for(var i = 0; i < d.c.length; i++)
					{
						if(d.c[i].onMapResize!=undefined)
						{
							d.c[i].onMapResize();
						}
					}
				}
			}
		}
	},
	destroy: function ()
	{
		this.div.dialog("destroy");
	},
	CLASS_NAME: "CyberGIS.Map.OpenLayers"
});

CyberGIS.Map.OL3 = CyberGIS.Class
({
	/* Callback */
	client: undefined,
	callbackFunction: undefined,
	callbackContext: undefined,
	
	/* Static */
	resolutions: [156543.03390625,78271.516953125,39135.7584765625,19567.87923828125,9783.939619140625,4891.9698095703125,2445.9849047851562,1222.9924523925781,611.4962261962891,305.74811309814453,152.87405654907226,76.43702827453613,38.218514137268066,19.109257068634033,9.554628534317017,4.777314267158508,2.388657133579254,1.194328566789627,0.5971642833948135],
	onValues: ["yes","true","1","t"],
	
	/* Core */
	log: undefined,
	mapID: undefined,
	element: undefined,
	map: undefined,
	state: undefined,
	projection: undefined,/* Initialized in init_parameters instead of init_state, because extent loading needs it4326*/
	
	/* Parameters */
	bTitle: undefined,
	bLink: undefined,
	bNav: undefined,
	bZoom: undefined,
	bSelect: undefined,
	bBookmarks: undefined,
	bTime: undefined,
	bLegend: undefined,
	bSearch: undefined,
	bStatic: undefined,
	maxExtent: undefined,
	aoi: undefined,/* Visual bounding Boxes*/
	
	/* ProtoLayers */
	proto_baselayer_primary: undefined,
	baseLayerNames: undefined,	
	featureLayerNames: undefined,
	searchLayerNames: undefined,
	legendLayerNames: undefined,
	renderLayerNames: undefined,
	chartLayerName: undefined,
	chartName: undefined,
	
	/* Controls */
	controls: undefined,
	
	/* Layers */
	baseLayers: undefined,
	featureLayers: undefined,
	timeLayers: undefined,
	searchLayers: undefined,
	selectLayers: undefined,
	wheelStyleMaps: undefined,
	chartLayer: undefined,
	
	/* Initialization Functions */
	
	initialize: function(client, mapID, element, controlOptions, properties, proto, carto, callbackFunction, callbackContext, options)
	{
		this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		CyberGIS.extend(this, options);
		if (this.id == null)
		{
			this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		}
		
		this.callbackFunction = callbackFunction;
		this.callbackContext = callbackContext;
		
		this.client = client;
		//this.state = client.state;
		this.mapID = mapID;
		this.element = element;
		
		var url = window.location.href;
		
		this.init_log();		
		
		this.init_parameters(url, element, properties, proto, carto); /* Initializes Parameters from QueryString, Element, and Options*/
		this.init_baselayers(proto, carto);
		this.init_state(properties,element);
		if(this.bStatic)
		{
			this.featureLayers = [];
			this.init_renderlayers(proto, carto);			
		}
		else
		{
			this.init_featurelayers(proto, carto);
			this.renderLayers = [];
		}
				
		this.init_controls(properties, controlOptions, proto, carto);
		this.init_map(properties, mapID, element);
		
		if(this.callbackFunction!=undefined&&this.callbackContext!=undefined)
		{
			this.callbackFunction.apply(this.callbackContext);
		}
	},
	init_log: function()
	{
		this.log = new CyberGIS.Log(this);
	},
	init_state: function(p,element)
	{
		this.state = new CyberGIS.State.OL3(this,element,p.name,p.title,p.pages,p.domain,p.context,p.time,p.minDate,p.maxDate,p.minZoom,p.maxZoom,p.zoom,this.projection,p.x,p.y,p.longitude,p.latitude,p.track,this.proto_baselayer_primary);
	},
	init_parameters: function(url, element, properties, proto, carto)
	{
		/* Base Layers */
		this.proto_baselayer_primary = undefined;
		this.baseLayerNames = undefined;
		
		var qsBaseLayerNames = CyberGIS.getParameterAsStringArray(["bl","baseLayer","baseLayers"], url, ",", true);		
		if(qsBaseLayerNames!=undefined)
		{
			this.baseLayerNames = qsBaseLayerNames;
		}
		else
		{
			if(element.data('mapBaseLayer')!=undefined)
			{
				this.baseLayerNames = [element.data('mapBaseLayer')];
			}
			else if(element.data('mapBaseLayers')!=undefined)
			{
				this.baseLayerNames = element.data('mapBaseLayers');
			}
			else
			{
				var pBaseLayers = properties["baseLayers"];
				if(pBaseLayers!=undefined)
				{
					if(CyberGIS.isArray(pBaseLayers))
					{
						this.baseLayerNames = pBaseLayers;
					}
				}
			}
		}
		
		if(this.baseLayerNames!=undefined)
		{
			this.proto_baselayer_primary = proto.layers[""+this.baseLayerNames[0]];
		}
		
		/* Projection*/
		//this.projection = CyberGIS.parseProjection(CyberGIS.getParameter(["projection","proj","p"], url, ",", true)||CyberGIS.getData(["mapProjection"],element)||CyberGIS.getProperty(["projection"],properties,true));
		this.projection = ol.proj.get(CyberGIS.getParameter(["projection","proj","p"], url, ",", true)||CyberGIS.getData(["mapProjection"],element)||CyberGIS.getProperty(["projection"],properties,true))
		
		/* Bounds */
		this.maxExtent = this.init_max_extent(url,element,properties);//, this.proto_baselayer_primary);
		this.aoi = this.init_aoi(url,element,properties);
		
		this.bTitle = this.init_boolean(element.data('mapTitle'));
		this.bLink = this.init_boolean(element.data('mapLink'));
		this.bNav = this.init_boolean(element.data('mapNav'));
		this.bZoom = this.init_boolean(element.data('mapControlZoom'));
		this.bSelect = this.init_boolean(element.data('mapSelect'));
		this.bBookmarks = this.init_boolean(element.data('mapBookmarks'));
		this.bTime = this.init_boolean(element.data('mapTime'));
		this.bLegend = this.init_boolean(element.data('mapLegend'));
		this.bSearch = this.init_boolean(element.data('mapSearch'));
		this.bStatic = this.init_boolean(element.data('mapStatic'));
		//this.center = this.init_center(element);
		//this.zoom = element.data('mapZoom');
		
		this.chartLayerName = CyberGIS.getParameter(["chartLayers","chartLayer"], url, ",", true)||CyberGIS.getData(["mapChartLayers","mapChartLayer"],element)||CyberGIS.getProperty(["chartLayers","chartLayer"],properties,true);
		this.chartName = element.data('mapChartName') || "basic";
		
		
		this.boxLayerName = CyberGIS.getParameterAsString(["boxLayers","boxLayer"], url, ",", true)||CyberGIS.getData(["mapBoxLayers","mapBoxLayer"],element)||CyberGIS.getProperty(["boxLayers","boxLayer"],properties,true);
		this.boxName = element.data('mapBoxName') || "basic";
		
		/* Feature Layers*/
		//this.defaultFeatureLayerNames = this.init_array(element.data('mapFeatureLayers')||element.data('mapFeatureLayer')||element.data('featureLayer')||element.data('mapFeatureLayer')||properties["featureLayers"]);
		this.defaultFeatureLayerNames = this.init_array(CyberGIS.getDataAsStringArray(["mapFeatureLayers","mapFeatureLayer","featureLayers","featureLayer"],element,",")||properties["featureLayers"]||properties["featureLayer"]);
		this.featureLayerNames = CyberGIS.getParameterAsStringArray(["fl","featureLayer","featureLayers","layers"], url, ",", true)||this.defaultFeatureLayerNames;
		
		/* Search Layers */
		this.searchLayerNames = CyberGIS.getParameterAsStringArray(["sl","searchLayer","searchLayers"], url, ",", true)||element.data('mapSearchLayers')||CyberGIS.getProperty(["searchLayers","searchLayer"],properties,true);
		
		/* Legend Layers */
		this.legendLayerNames = CyberGIS.getParameterAsStringArray(["legendLayer","legendLayers"], url, ",", true)||element.data('mapLegendLayers')||CyberGIS.getProperty(["legendLayers","legendLayer"],properties,true);
		
		/* Render Layers */
		if(this.bStatic)
		{
			this.renderLayerNames = CyberGIS.getParameterAsStringArray(["renderLayer","renderLayers"], url, ",", true)||element.data('mapRenderLayers')||CyberGIS.getProperty(["renderLayers","renderLayer"],properties,true)||this.featureLayerNames;
		}
		else
		{
			this.renderLayerNames = [];
		}
	},
	init_max_extent: function(url,element,properties)
	{
		var maxExtent =
			CyberGIS.getParameterAsFloatArray(["maxExtent","extent"],url,",",true)||
			CyberGIS.getDataAsFloatArray(["mapMaxExtent","mapExtent","maxExtent","extent"],element,",")||
			CyberGIS.getProperty(["maxExtent","extent"],properties,true);
		
		if(maxExtent==undefined)
		{
			maxExtent =
				CyberGIS.getParameterAsFloatArray(["maxExtentInLatLon","extentInLatLon"],url,",",true)||
				CyberGIS.getDataAsFloatArray(["mapMaxExtentInLatLon","mapExtentInLatLon","maxExtentInLatLon","extentInLatLon"],element,",")||
				CyberGIS.getProperty(["maxExtentInLatLon","extentInLatLon"],properties,true);
			if(maxExtent!=undefined)
			{
				//return CyberGIS.parseBounds(maxExtent,"EPSG:4326",this.projection);
				return undefined;
			}
			else
			{
				return undefined;
			}
		}
		else
		{
			return CyberGIS.parseBounds(maxExtent);
		}
	},
	init_aoi: function(url,element,properties)
	{
		/* TODO */
		return undefined;
	},
	init_boolean: function(str)
	{
		return $.inArray(str,this.onValues)!=-1;
	},
	init_array: function(a)
	{
		var b = undefined;
		if(CyberGIS.isArray(a))
		{
			b = a;
		}
		else if(CyberGIS.isString(a))
		{
			b = [a];
		}
		else
		{
			b = [];
		}
		return b;
	},
	
	init_attr: function(element, sAttribute, protoLayer, sField, fallback)
	{
		var value = undefined;
		if(element!=undefined)
		{
			if(element.data(sAttribute)!=undefined)
			{
				value = element.data(sAttribute);
			}
			else
			{
				if(protoLayer!=undefined)
				{
					if(protoLayer[''+sField]!=undefined)
					{
						value = protoLayer[''+sField];
					}
					else
					{
						value = fallback;
					}
				}
				else
				{
					value = fallback;
				}
			}
		}
		else
		{
			if(protoLayer!=undefined)
			{
				if(protoLayer[''+sField]!=undefined)
				{
					value = protoLayer[''+sField];
				}
				else
				{
					value = fallback;
				}
			}
			else
			{
				value = fallback;
			}
		}		
		return value;
	},
	init_baselayers: function(proto, carto)
	{
		this.baseLayers = [];
		if(proto!=undefined)
		{
			if(this.baseLayerNames!=undefined)
			{
				for(var i = 0; i < this.baseLayerNames.length; i++ )
				{
					var pbl = proto.layers[""+this.baseLayerNames[i]];
					if(pbl!=undefined)
					{
						var baseLayer = undefined;
						var type = pbl.type.toLowerCase();
						if(type=="openlayers.layer.mapbox"||type=="mapbox")
						{
							//http://a.tiles.mapbox.com/mapbox/1.0.0/hiu.lsib-dark/1/1/1.png redirects to http://a.tiles.mapbox.com/v1/hiu.lsib-dark/1/1/1.png
							baseLayer = new ol.layer.Tile({source:new ol.source.XYZ({url: (pbl.ssl?'https':'http')+"//{a-d}.tiles.mapbox.com/v1/"+pbl.layername+"/{z}/{x}/{y}.png"})});
						}
						else if(type=="openlayers.layer.osm"||type=="osm"||type=="openstreetmap")
						{
							baseLayer = new ol.layer.Tile({source:new ol.source.OSM()});
						}
						else if(type=="openlayers.layer.hiutilecache")
						{
							baseLayer = new ol.layer.Tile({source:new ol.source.XYZ({url: "http://hiu-maps.net/hot/1.0.0/"+pbl.layername+"/{z}/{x}/{y}.png"})});
						}
						else if(type=="openLayers.layer.wms"||type=="wms")
						{
							baseLayer = new ol.layer.Image
							({
								source: new ol.source.ImageWMS
								({
									url: 'http://demo.opengeo.org/geoserver/wms',
									params: {'LAYERS': pbl.layers},
									serverType: 'geoserver',
									extent: [-13884991, 2870341, -7455066, 6338219]
								})
							});
						}				
						else if(type=="arcgis")
						{
							baseLayer = new ol.layer.Tile({source:new ol.source.XYZ({url: pbl.url+"/"+pbl.layername+"/MapServer/tile/{z}/{x}/{y}.png"})});
						}
						
						if(baseLayer!=undefined)
						{
							this.baseLayers.push(baseLayer);
						}
					}
				}
			}
		}
	},
	init_featurelayers: function(proto, carto)
	{
		this.featureLayers = [];
		this.timeLayers = [];
		this.searchLayers = [];
		this.legendLayers = [];
		this.selectLayers = [];
		this.wheelStyleMaps = [];
		this.chartLayer = undefined;
		this.boxLayer = undefined;
		for(var i = 0; i < this.featureLayerNames.length; i++)
		{
			var name = this.featureLayerNames[i];
			var pfl = proto.layers[""+name];
			if(pfl!=undefined)
			{
				var styleMap = carto.styleMap(name,"default","select",true,false);
				var popup = pfl.popup||false;
				var jit = pfl.jit;
				var grep = undefined;
				var fl = undefined;
				if(pfl.type!=undefined)
				{
					var type = pfl.type.toLowerCase();
					if(type=="openlayers.layer.timevector"||type=="timevector")
					{
						fl = this.init_layer_vector_time(name,pfl,styleMap,popup,jit,grep);
						if(fl!=undefined)
						{
							this.timeLayers.push(fl);
						}
					}
					else if(type=="openlayers.layer.vector"||type=="vector")
					{
						fl = this.init_layer_vector_simple(name,pfl,styleMap,popup,jit,grep);
					}
					else if(type=="openlayers.layer.kml"||type=="kml")
					{
						fl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"kml");
					}
					else if(type=="openlayers.layer.soap"||type=="soap"||type=="sharepoint"||type=="SharePoint")
					{
						fl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"soap");
					}
					else if(type=="openlayers.layer.geojson"||type=="geojson")
					{
						fl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"geojson");
					}
					else if(type=="openlayers.layer.tsv"||type=="tsv")
					{
						fl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"tsv");
					}
					else if(type=="openlayers.layer.paceholder"||type=="placeholder")
					{
						fl = this.init_layer_vector_placeholder(name,pfl,styleMap,popup,jit,grep);
					}
				}
				
				if(fl!=undefined)
				{
					this.featureLayers.push(fl);
					if(pfl.select)
					{
						this.selectLayers.push(fl);
						var pointsStyleMap = carto.styleMap(name,"wheel","select",true,false);
						var linesStyleMap = new OpenLayers.StyleMap({'default':OpenLayers.Feature.Vector.style["default"]});
						var closeStyleMap = carto.closeStyleMap(name);
						var wheelStyleMap = {"points":pointsStyleMap,"close":closeStyleMap,"lines":linesStyleMap};
						this.wheelStyleMaps.push(wheelStyleMap);
					}
				}
				if(name==this.chartLayerName)
				{
					this.chartLayer = fl;
				}
				if(name==this.boxLayerName)
				{
					this.boxLayer = fl;
				}
				
				if($.inArray(name,this.searchLayerNames)!=-1)
				{
					this.searchLayers.push(fl);
				}
				
				if($.inArray(name,this.legendLayerNames)!=-1)
				{
					this.legendLayers.push(fl);
				}
			}
		}		
		
		if(this.legendLayerNames!=undefined)
		{
			if(this.legendLayers.length>1)
			{
				this.legendLayers = CyberGIS.sortArray(this.legendLayers,"proto",this.legendLayerNames);
			}
		}
		else
		{
			this.legendLayers = this.featureLayers;
		}		
	},
	init_renderlayers: function(proto, carto)
	{
		var s = this.state;
		this.renderLayers = [];
		this.chartLayer = undefined;
		this.boxLayer = undefined;
		
		var grep = {"op":"intersects","bbox":"${map}"};		
		for(var i = 0; i < this.renderLayerNames.length; i++)
		{
			var name = this.renderLayerNames[i];
			var pfl = proto.layers[""+name];
			if(pfl!=undefined)
			{
				var styleMap = carto.styleMap(name,"default","select",true,false);
				var popup = false;
				var jit = pfl.jit;
				var rl = undefined;
				if((pfl.minZoom==undefined||pfl.minZoom<=s.zoom)&&(pfl.maxZoom==undefined||pfl.maxZoom>=s.zoom))
				{
					if(pfl.type!=undefined)
					{
						var type = pfl.type.toLowerCase();
						if(type=="openlayers.layer.timevector"||type=="timevector")
						{
							rl = this.init_layer_vector_time(name,pfl,styleMap,popup,jit,grep);
						}
						else if(type=="openlayers.layer.vector"||type=="vector")
						{
							rl = this.init_layer_vector_simple(name,pfl,styleMap,popup,jit,grep);
						}
						else if(type=="openlayers.layer.kml"||type=="kml")
						{
							rl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"kml");
						}
						else if(type=="openlayers.layer.soap"||type=="soap"||type=="sharepoint"||type=="SharePoint")
						{
							rl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"soap");
						}
						else if(type=="openlayers.layer.geojson"||type=="geojson")
						{
							rl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"geojson");
						}
						else if(type=="openlayers.layer.tsv"||type=="tsv")
						{
							rl = this.init_layer_vector_advanced(name,pfl,styleMap,popup,jit,grep,"tsv");
						}
						else if(type=="openlayers.layer.paceholder"||type=="placeholder")
						{
							rl = this.init_layer_vector_placeholder(name,pfl,styleMap,popup,jit,grep);
						}
					}
					if(rl!=undefined)
					{
						this.renderLayers.push(rl);
						if(name==this.chartLayerName)
						{
							this.chartLayer = rl;
						}
						if(name==this.boxLayerName)
						{
							this.boxLayer = rl;
						}
					}
				}
			}
		}
	},
	init_layer_vector_placeholder: function(protoname,pfl,styleMap,popup,jit,grep)
	{
		var fl = undefined;
		var source = undefined;
		
		fl = new ol.layer.Vector({source: source});
		
		return fl;
	},
	init_layer_vector_advanced: function(protoname,pfl,styleMap,popup,jit,grep,sFormat)
	{
		var fl = undefined;
		var source = undefined;
		if(sFormat=="kml")
		{
			source = new ol.source.KML({projection: pfl.projection, url: pfl.url});
		}
		else if(sFormat=="geojson")
		{
			source = new ol.source.GeoJSON({projection: pfl.projection, url: pfl.url});
		}
		else if(sFormat=="tsv")
		{
			/* TODO */
		}
		else if(sFormat=="soap")
		{
			/* TODO */
		}		
		
		fl = new ol.layer.Vector({source: source});
		
		return fl;
	},
	init_layer_vector_simple: function(protoname,pfl,styleMap,popup,jit,grep)
	{
		/* TODO */
		return undefined;
	},
	init_layer_vector_time: function(protoname,pfl,styleMap,popup,jit,grep)
	{
		/* TODO */
		return undefined;
	},
	init_controls: function(properties, options, proto, carto)
	{
		//var s = this.state;
		//var c = carto.getCarto();
			
		this.controls = [];
	},
	init_map: function(properties, mapID, element)
	{
		var s = this.state;
		
		this.map = new ol.Map
		({
			target: mapID,
			controls:  ol.control.defaults().extend(this.controls),
			renderer: 'canvas',
			view: new ol.View
			({
				center: s.center,
				zoom: s.zoom
			})
		});
		
		var d = undefined;
		
		var fls = this.bStatic?this.renderLayers:this.featureLayers;
		var bls = this.aoi?this.baseLayers.concat([this.aoi]):this.baseLayers;
		
		if(bls.length==1)
		{
			d = {'m':this.map,'bl':bls[0],'fls':fls,'z':s.zoom,'c':this.controls,'select':this.selectControl,'state':s};
		}
		else
		{
			d = {'m':this.map,'bls':bls,'fls':fls,'z':s.zoom,'c':this.controls,'select':this.selectControl,'state':s,'track':properties.track};
		}
		element.data('cybergis',d);
	},
	
	/* Retrieval Functions */
	getMinResolution: function()
	{
		/* TODO */
	},
	getMaxResolution: function()
	{
		/* TODO */
	},
	
	/* Command Line Functions */
	zoomTo: function(z)
	{
		this.map.getView().setZoom(z);
	},
	
	resize: function(w, h)
	{
		var d = this.element.data("cybergis");
		if(d!=undefined)
		{
			if(d.m!=undefined)
			{
				var center = d.m.getView().getCenter();
				d.m.updateSize();
				
                                if(d.m.baseLayer==undefined)
                                {
                                        if(d.bl!=undefined)
                                        {
                                                d.m.addLayer(d.bl);
                                        }
                                        else if(d.bls!=undefined)
                                        {
                                                for(var i = 0; i < d.bls.length; i++)
                                                {
                                                        d.m.addLayer(d.bls[i]);
                                                }
                                        }
                                        d.m.getView().setZoom(d.z);
                                        d.state.activate.apply(d.state);
                                }
				
				d.m.getView().setCenter(center);
				
				if(d.c!=undefined)
				{
					for(var i = 0; i < d.c.length; i++)
					{
						if(d.c[i].onMapResize!=undefined)
						{
							d.c[i].onMapResize();
						}
					}
				}
			}
		}
	},
	destroy: function ()
	{
		this.div.dialog("destroy");
	},
	CLASS_NAME: "CyberGIS.Map.OL3"
});

CyberGIS.File = {};

CyberGIS.File.AbstractFile = CyberGIS.Class
({
	url: undefined,
	callbackFunction: undefined,
	callbackContext: undefined,
	
	status: undefined,//Integer HTTP Code 303, 404, etc.
	text: undefined,
	
	initialize: function (url, callbackFunction, callbackContext, options)
	{
		 this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		 CyberGIS.extend(this, options);
		 if (this.id == null)
		 {
			 this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		 }
		 this.url = url;
		 this.callbackFunction = callbackFunction;
		 this.callbackContext = callbackContext;
	},
	request: function()
	{
		var that = this;
		$.ajax({url: this.url,type: "GET", contentType: "application/json; charset=\"utf-8\"", complete: function(xData,status)
		{
			that.response.apply(that,[xData,status]);
		}});
	},
	response: undefined,//Overwritten	
	
    init_finalize: function()
    {
    	if(this.callbackFunction!=undefined)
    	{
    		this.callbackFunction.apply(this.callbackContext);
    	}
    },
    
    setStatus: function(status)
    {
    	this.status = status;
    },
    
    found: function()
    {
    	return this.status==200;
    },
    
	destroy: function ()
	{
		
	},
	CLASS_NAME: "CyberGIS.File.AbstractFile"
});

CyberGIS.File.AbstractTable = CyberGIS.Class(CyberGIS.File.AbstractFile,
{
	delimiter: undefined,
	
	rows: undefined,
	header: undefined,
		
	initialize: function (url, delimiter, callbackFunction, callbackContext, options)
	{
		CyberGIS.File.AbstractFile.prototype.initialize.apply(this, [url, callbackFunction, callbackContext, options]);
		
		this.delimiter = delimiter;
	},
	init_rows: function()
	{
		this.rows = this.text.split("\n");
		this.rows = $.grep(this.rows,function(row,i){return $.trim(row).length>0;});
	},
	init_header: function()
	{
		this.header = $.map(this.rows[0].split(this.delimiter),function(cell,i){return CyberGIS.String.trim(cell);});
	},
	getCells: function(i)
	{
		return $.map(this.rows[i].split(this.delimiter),function(cell,i){return CyberGIS.String.trim(cell);});
	},
	getColumnIndex: function(arg)
    {
    	var columnIndex = -1;
    	var columnNames = undefined;
    	if(CyberGIS.isString(arg))
    	{
    		columnNames = [arg];
    	}
    	else if(CyberGIS.isArray(arg))
    	{
    		columnNames = arg;
    	}    	
    	if(columnNames!=undefined)
    	{
    		for(var i = 0; i < columnNames.length; i++)
        	{
        		var columnName = columnNames[i];
        		for(var j = 0; j < this.header.length; j++)
            	{
            		if((this.header[j]).toLowerCase()==columnName.toLowerCase())
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
    getNumberOfRows: function()
    {
    	if(this.rows==undefined)
    	{
    		return 0;
    	}
    	else
    	{
    		return this.rows.length;
    	}
    },
	destroy: function ()
	{
		
	},
	CLASS_NAME: "CyberGIS.File.AbstractTable"
});

CyberGIS.File.JSON = CyberGIS.Class(CyberGIS.File.AbstractFile,
{
	json: undefined,
		
	initialize: function (url, callbackFunction, callbackContext, options)
	{
		CyberGIS.File.AbstractFile.prototype.initialize.apply(this, [url, callbackFunction, callbackContext, options]);
		this.request();
	},
	response: function(xData, status)
	{
		this.setStatus(xData.status);
		if(this.found())
		{
			this.text = xData.responseText;
			this.json = $.parseJSON(this.text);	
		}

		this.init_finalize();
	},
	hasJSON: function()
	{
		return this.json != undefined;
	},
	getAllJSON: function()
	{
		return this.json;
	},
	getJSON: function(keyChain)
	{
		var json = undefined;
		if(this.hasJSON())
		{
			if(keyChain!=undefined)
			{
				if(CyberGIS.isString(keyChain))
				{
					if(this.json!=undefined)
					{
						json = this.json[""+keyChain];
					}
				}
				else if(CyberGIS.isArray(keyChain))
				{
					if(this.json!=undefined)
					{
						json = CyberGIS.getJSON(keyChain,this.json);
					}
				}
			}	
		}
		return json;
	},
	CLASS_NAME: "CyberGIS.File.JSON"
});

CyberGIS.File.Glossary = CyberGIS.Class(CyberGIS.File.AbstractTable,
{
	name: undefined,
	label: undefined,
	entries: [],
	
	initialize: function (name, label, url, delimiter, callbackFunction, callbackContext, options)
	{
		this.name = name;
		this.label = label;
		
		CyberGIS.File.AbstractTable.prototype.initialize.apply(this, [url, delimiter, callbackFunction, callbackContext, options]);
		
		this.request();
	},
	response: function(xData, status)
	{
		this.setStatus(xData.status);
		if(this.found())
		{
			this.text = xData.responseText;
			
			this.init_rows();
			this.init_header();
			this.init_entries();
		}			
		this.init_finalize();
	},
	init_entries: function()
	{
		this.entries = [];
		var n = this.getNumberOfRows();
		if(n>1)
		{
    		var iTerm = this.getColumnIndex("term");
    		var iDefinition = this.getColumnIndex("definition");
			if(iTerm!=-1&&iDefinition!=-1)
			{
				for(var i = 1; i < n; i++)
		    	{
		    		var cells = this.getCells(i);
		    		var entry =
		    		{
		    			"term": cells[iTerm],
		    			"definition": cells[iDefinition]
		    		};
		    		this.entries.push(entry);
		    	}
			}
		}
	},
	destroy: function ()
	{
	},
	CLASS_NAME: "CyberGIS.File.Glossary"
});
CyberGIS.File.Sources = CyberGIS.Class(CyberGIS.File.AbstractTable,
{
	entries: [],
	
	initialize: function (url, delimiter, callbackFunction, callbackContext, options)
	{
		CyberGIS.File.AbstractTable.prototype.initialize.apply(this, [url, delimiter, callbackFunction, callbackContext, options]);
		
		this.request();
	},
	response: function(xData, status)
	{
		this.setStatus(xData.status);
		if(this.found())
		{
			this.text = xData.responseText;
			
			this.init_rows();
			this.init_header();
			this.init_entries();
		}
		this.init_finalize();		
	},
	init_entries: function()
	{
		this.entries = [];
		var n = this.getNumberOfRows();
		if(n>1)
		{
    		var iName = this.getColumnIndex("name");
    		var iDescription = this.getColumnIndex("description");
    		var iURL = this.getColumnIndex("url");
			if(iName!=-1)
			{
				for(var i = 1; i < n; i++)
		    	{
		    		var cells = this.getCells(i);
		    		var entry =
		    		{
		    			"name": cells[iName],
		    			"description": cells[iDescription],
		    			"url": cells[iURL]
		    		};
		    		this.entries.push(entry);
		    	}
			}
		}
	},
	destroy: function ()
	{
	},
	CLASS_NAME: "CyberGIS.File.Sources"
});
CyberGIS.File.Bookmarks = CyberGIS.Class(CyberGIS.File.AbstractTable,
{
	entries: [],
	
	initialize: function (url, delimiter, callbackFunction, callbackContext, options)
	{
		CyberGIS.File.AbstractTable.prototype.initialize.apply(this, [url, delimiter, callbackFunction, callbackContext, options]);
		
		this.request();
	},
	response: function(xData, status)
	{
		this.setStatus(xData.status);
		if(this.found())
		{
			this.text = xData.responseText;
			
			this.init_rows();
			this.init_header();
			this.init_entries();
		}		
		this.init_finalize();
	},
	init_entries: function()
	{
		this.entries = [];
		var n = this.getNumberOfRows();
		if(n>1)
		{
    		var iName = this.getColumnIndex("name");
    		var iLabel = this.getColumnIndex("label");
    		var iType = this.getColumnIndex("type");
    		var iLatitude = this.getColumnIndex(["lat","latitude"]);
    		var iLongitude = this.getColumnIndex(["lon","long","longitude"]);
    		var iY = this.getColumnIndex("y");
    		var iX = this.getColumnIndex("x");
    		var iZoom = this.getColumnIndex(["z","zoom"]);
    		var iLayer = this.getColumnIndex("layer");
    		var iField = this.getColumnIndex("field");
    		var iValue = this.getColumnIndex("value");
			if(iName!=-1)
			{
				for(var i = 1; i < n; i++)
		    	{
		    		var cells = this.getCells(i);
		    		var type = cells[iType];
		    		var entry =
		    		{
		    			"name": cells[iName],
		    			"label": cells[iLabel],
		    			"type": type
		    		};
		    		entry["location"] = this.buildLocation(cells[iLatitude],cells[iLongitude],cells[iY],cells[iX],cells[iZoom]);
		    		if(type=="feature")
		    		{
		    			entry["selector"] = this.buildSelector(cells[iLayer],cells[iField],cells[iValue]);
		    		}
		    		this.entries.push(entry);
		    	}
			}
		}
	},
	buildLocation: function(lat,lon,y,x,z)
	{
		var location = undefined;
		
		if(lat!=undefined&&lon!=undefined&&lat!='-'&&lon!='-')
		{
			location = {};
			location["latitude"] = parseFloat(lat);
			location["longitude"] = parseFloat(lon);
		}
		else if(y!=undefined&&x!=undefined&&y!='-'&&x!='-')
		{
			location = {};
			location["y"] = parseInt(y,10);
			location["x"] = parseInt(x,10);
		}
		
		if(z!=undefined&&z!='-')
		{
			if(location==undefined)
			{
				location = {};
			}
			location["zoom"] = parseInt(z,10);
		}
		return location;
	},
	buildSelector: function(layer,field,value)
	{
		var selector = {};
		selector["layer"] = layer;
		selector["where"] = {};
		selector["where"]["op"] = "=";
		selector["where"]["field"] = field;
		selector["where"]["value"] = value;
		return selector;
	},
	destroy: function ()
	{
	},
	CLASS_NAME: "CyberGIS.File.Bookmarks"
});
CyberGIS.File.Organizations = CyberGIS.Class(CyberGIS.File.AbstractTable,
{
	entries: [],
	
	initialize: function (url, delimiter, callbackFunction, callbackContext, options)
	{
		CyberGIS.File.AbstractTable.prototype.initialize.apply(this, [url, delimiter, callbackFunction, callbackContext, options]);
		
		this.request();
	},
	response: function(xData, status)
	{
		this.setStatus(xData.status);
		if(this.found())
		{
			this.text = xData.responseText;
			
			this.init_rows();
			this.init_header();
			this.init_entries();
		}		
		this.init_finalize();
	},
	init_entries: function()
	{
		this.entries = [];
		var n = this.getNumberOfRows();
		if(n>1)
		{
    		var iAcronym = this.getColumnIndex("acronym");
    		var iName = this.getColumnIndex("name");
    		var iSymbol = this.getColumnIndex("symbol");
    		var iArticle = this.getColumnIndex("article");
			if(iAcronym!=-1)
			{
				for(var i = 1; i < n; i++)
		    	{
		    		var cells = this.getCells(i);
		    		var entry =
		    		{
		    			"acronym": cells[iAcronym],
		    			"name": cells[iName],
		    			"symbol": cells[iSymbol],
		    			"article": cells[iArticle]
		    		};
		    		this.entries.push(entry);
		    	}
			}
		}
	},
	destroy: function ()
	{
	},
	CLASS_NAME: "CyberGIS.File.Organizations"
});

CyberGIS.File.HashMap = CyberGIS.Class(CyberGIS.File.AbstractTable,
{
	key: "key",
	hashmap: {},
	
	initialize: function (url, delimiter, key, callbackFunction, callbackContext, options)
	{
		CyberGIS.File.AbstractTable.prototype.initialize.apply(this, [url, delimiter, callbackFunction, callbackContext, options]);
		this.key = key;
		
		this.request();
	},
	response: function(xData, status)
	{
		this.setStatus(xData.status);
		if(this.found())
		{
			this.text = xData.responseText;
			
			this.init_rows();
			this.init_header();
			this.init_hashmap();
		}
		this.init_finalize();
	},
	init_hashmap: function()
	{
		this.hashmap = {};
		var n = this.getNumberOfRows();
		if(n>1)
		{
    		var iKey = this.getColumnIndex(this.key);
			if(iKey!=-1)
			{
				for(var i = 1; i < n; i++)
		    	{
		    		var cells = this.getCells(i);
		    		var key = cells[iKey];
		    		var obj = {};
		    		for(var j = 0; j < cells.length; j++)
		    		{
		    			obj[""+this.header[j]] = cells[j];
		    		}
		    		this.hashmap[""+key] = obj;
		    	}
			}
		}
	},
	destroy: function ()
	{
	},
	CLASS_NAME: "CyberGIS.File.HashMap"
});

CyberGIS.File.PCodes = CyberGIS.Class(CyberGIS.File.HashMap,
{
	level: undefined,
	
	initialize: function (level, url, delimiter, key, callbackFunction, callbackContext, options)
	{
		this.level = level;
		CyberGIS.File.HashMap.prototype.initialize.apply(this, [url, delimiter, key, callbackFunction, callbackContext, options]);
	},
	getValue: function(code)
	{
		var key = undefined;
		if(this.level<4)
		{
			key = code.substring(0,2*(1+this.level));
		}
		else if(this.level==4)
		{
			key = code.substring(0,13);
		}
		
		var value = this.hashmap[""+key];
		
		return value;
	},
	CLASS_NAME: "CyberGIS.File.PCodes"
});

CyberGIS.DataSource = {};
CyberGIS.DataSource.PCoded = CyberGIS.Class(CyberGIS.File.AbstractTable,
{
	name: undefined,
	label: undefined,
	
	key: "key",
	root: undefined,// Tree of {"key":"SY","values":[{},{},...,{}],"children":[]}
	
	initialize: function (name, label, url, delimiter, key, callbackFunction, callbackContext, options)
	{
		CyberGIS.File.AbstractTable.prototype.initialize.apply(this, [url, delimiter, callbackFunction, callbackContext, options]);
		
		this.name = name;
		this.label = label;
		this.key = key;
		this.root = undefined;
		
		this.request();
	},
	response: function(xData, status)
	{
		this.setStatus(xData.status);
		if(this.found())
		{
			this.text = xData.responseText;
			
			this.init_rows();
			this.init_header();
			this.init_tree();
		}
		this.init_finalize();
	},
	init_tree: function()
	{
		this.root = new CyberGIS.Tree.Node("");
		var n = this.getNumberOfRows();
		if(n>1)
		{
    		var iKey = this.getColumnIndex(this.key);
			if(iKey!=-1)
			{
				for(var i = 1; i < n; i++)
		    	{
		    		var cells = this.getCells(i);
		    		var key = cells[iKey];
		    		var obj = {};
		    		for(var j = 0; j < cells.length; j++)
		    		{
		    			obj[""+this.header[j]] = cells[j];
		    		}
		    		this.init_node(key,obj);
		    	}
			}
		}
	},
	init_node: function(key,obj)
	{
		var keyChain = this.buildKeyChain(key);
		this.root.addValue.apply(this.root,[keyChain,obj]);
	},
	buildLevel: function(key)
	{
		var level = 0;
		
		if(key.length<=8)
		{
			level = (key.length/2)-1;
		}
		else if(key.length==13)
		{
			level = 4;
		}
		else
		{
			level = 5;
		}
		return level;
	},
	buildKeyChain: function(key,level)
	{
		if(level==undefined)
		{
			level = this.buildLevel(key);
		}
		
		var keyChain = [];
		
		if(level>=0)
		{
			keyChain.push(key.substring(0,2));
		}
		if(level>=1)
		{
			keyChain.push(key.substring(2,4));
		}
		if(level>=2)
		{
			keyChain.push(key.substring(4,6));
		}
		if(level>=3)
		{
			keyChain.push(key.substring(6,8));
		}
		if(level>=4)
		{
			keyChain.push(key.substring(8,13));
		}
		
		return keyChain;
	},
	getValues: function(key,deep,level)
	{
		var values = undefined;
		if(key!=undefined)
		{
			var keyChain = this.buildKeyChain(key,level);
			values = this.root.getValues(keyChain,deep);
		}
		else
		{
			values = [];
		}
		return values;
	},
	destroy: function ()
	{
		
	},
	CLASS_NAME: "CyberGIS.DataSource.PCoded"
});
CyberGIS.DataSource.HashMap = CyberGIS.Class(CyberGIS.File.AbstractTable,
{
	name: undefined,
	label: undefined,
	key: undefined,
	multiple: undefined,
	hashmap: {},
	
	initialize: function (name, label, url, delimiter, key, multiple, callbackFunction, callbackContext, options)
	{
		CyberGIS.File.AbstractTable.prototype.initialize.apply(this, [url, delimiter, callbackFunction, callbackContext, options]);
		
		this.name = name;
		this.label = label;
		this.key = key;
		this.multiple = multiple;
		
		this.request();
	},
	response: function(xData, status)
	{
		this.setStatus(xData.status);
		if(this.found())
		{
			this.text = xData.responseText;
			
			this.init_rows();
			this.init_header();
			this.init_hashmap();
		}
		this.init_finalize();
	},
	init_hashmap: function()
	{
		this.hashmap = {};
		var n = this.getNumberOfRows();
		if(n>1)
		{
    		var iKey = this.getColumnIndex(this.key);
			if(iKey!=-1)
			{
				for(var i = 1; i < n; i++)
		    	{
		    		var cells = this.getCells(i);
		    		var key = cells[iKey];
		    		var obj = {};
		    		for(var j = 0; j < cells.length; j++)
		    		{
		    			obj[""+this.header[j]] = cells[j];
		    		}
		    		
		    		if(this.multiple)
		    		{
		    			if(this.hashmap[""+key]==undefined)
		    			{
		    				this.hashmap[""+key] = [];
		    			}
		    			
		    			this.hashmap[""+key].push(obj);
		    		}
		    		else
		    		{
		    			this.hashmap[""+key] = obj;
		    		}
		    	}
			}
		}
	},
	getValue: function(key)
	{
		var value = undefined;
		if(key!=undefined)
		{
			value = this.hashmap[""+key];
		}
		else
		{
			value = undefined;
		}
		return value;
	},
	destroy: function ()
	{
	},
	CLASS_NAME: "CyberGIS.DataSource.HashMap"
});


CyberGIS.Tree = {};
CyberGIS.Tree.Node = CyberGIS.Class
({
	key: undefined,
	values: undefined,
	
	nodes_array: undefined,
	nodes_map: undefined,
	
	initialize: function (key)
	{
		 this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		 //CyberGIS.extend(this, options);
		 if (this.id == null)
		 {
			 this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		 }
		 
		 this.key = key;
		 this.values = [];
		 this.nodes_array = [];
		 this.nodes_map = {};
	},	
	isLeaf: function()
	{
		return nodes_array.length==0;
	},
	addValue: function(keyChain,value)
	{
		if(keyChain.length==0)
		{
			this.values.push(value);
		}
		else
		{
			var n = undefined;
			if(this.hasNode(keyChain[0]))
			{
				n = this.getNode(keyChain[0]);
			}
			else
			{
				n = new CyberGIS.Tree.Node(keyChain[0]);
				this.addNode(n);
			}
			n.addValue.apply(n,[keyChain.slice(1),value]);
		}
	},
	addNode: function(node)
	{
		this.nodes_array.push(node);
		this.nodes_map[""+node.key] = node;
	},
	getValues: function(keyChain,deep)
	{
		var values = undefined;
		if(keyChain.length==0)
		{
			if(deep)
			{
				values = this.getAllValues();
			}
			else
			{
				values = this.values;
			}
		}
		else
		{
			if(this.hasNode(keyChain[0]))
			{
				var n = this.getNode(keyChain[0]);
				values = n.getValues.apply(n,[keyChain.slice(1),deep]);
			}
			else
			{
				values = [];
			}
		}
		return values;
	},
	getAllValues: function()
	{
		var allValues = [];
		for(var i = 0; i < this.values.length; i++)
		{
			allValues.push(this.values[i]);
		}
		for(var i = 0; i < this.nodes_array.length; i++)
		{
			var node = this.nodes_array[i];
			var nodeValues = node.getAllValues.apply(node);
			for(var j = 0; j < nodeValues.length; j++)
			{
				allValues.push(nodeValues[j]);
			}
		}
		return allValues;
	},
	hasNode: function(key)
	{
		return this.nodes_map[""+key]!=undefined;
	},
	getNode: function(key)
	{
		return this.nodes_map[""+key];
	},
	destroy: function ()
	{
		for(var i = 0; i < this.nodes_array.length; i++)
		{
			var node = this.nodes_array[i];
			node.destroy.apply(node);
		}
		nodes_array = undefined;
		nodes_map = undefined;
		values = undefined;
		key = undefined;
	},
	CLASS_NAME: "CyberGIS.Tree.Node"
});
CyberGIS.Number =
{
	formatInteger: function(n)
	{
		var str = ""+n;
		var pattern = new RegExp('(\\d+)(\\d{3})','gi');
		while(pattern.test(str)){str=str.replace(pattern,'$1'+','+'$2');}
		return str;
	},
	formatInteger2: function(n,base)
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
	formatNumber3:function(n)
	{
		if(n>0)
			return "+"+n;
		else
			return ""+n;
	}
};
CyberGIS.String =
{
	startsWith: function(str, sub)
	{
		return (str.indexOf(sub) == 0);
	},
	contains: function(str, sub)
	{
		return (str.indexOf(sub) != -1);
	},
	trim: function(str)
	{
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},
	replaceWith: function(str,a,b)
	{
		if(CyberGIS.isString(a))
		{
			return str.replace(a,b);
		}
		else if(CyberGIS.isArray(a))
		{
			var c = str;
			for(var i = 0; i < a.length; i++)
			{
				c = c.replace(a[i],b);
			}
			return c;
		}
	}
};
CyberGIS.Date =
{
	parseDate: function(str)
	{
		var d = undefined;
		if(str!=undefined)
		{
			if(typeof str == "string")
			{
				var a = str.split("-");
				if(a.length==3)
				{
					var b = new Date(parseInt(a[0],10),parseInt(a[1],10)-1,parseInt(a[2],10));
					if(b!=undefined)
					{
						d = b;
					}
				}
			}
		}
		return d;
	}
};
CyberGIS.Attribute = 
{
};



CyberGIS.Dialog = {};
CyberGIS.Dialog.Basic = CyberGIS.Class
({
	width: '400',
	height: 'auto',
	zIndex: 50000,
	
	div: undefined,//jqueryDiv
	closeButton: undefined,
	jqueryDialog: undefined,
	onClose: undefined,
	sConfirm: undefined,
	keepTitleBarClose: true,
	
	initialize: function (div, options)
	{
		 this.displayClass = this.CLASS_NAME.replace("CyberGIS.", "cybergis-").replace(/\./g, "");
		 CyberGIS.extend(this, options);
		 if (this.id == null)
		 {
			 this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		 }
		 this.setDiv(div);
	},
	setDiv: function(div)
	{
		if(typeof div == "string")
		{
			this.div = $(div);
		}
		else if(div instanceof jQuery)
		{
			this.div = div;
		}
		else
		{
			console.log("Invalid Div for dialog");			
		}
	},
	render: function()
	{
		this.closeButton = $('.btn-close',this.div);
		this.closeButton.data("obj",this);
		
		$('a',this.div).click(function(){window.open($(this).attr("href"));return false;});
		
		this.render_buttons();
		this.render_tabs();
		this.render_dialog();
	},
	render_tabs: function()
	{
		var div = this.div;
		$('.hiu-tabs .hiu-tab',div).click(function()
		{
			var newView = $(this).data('view');
			var currentView = $('.hiu-views',div).data('view');
			
			if(newView!=currentView)
			{
				$('.hiu-views',div).data('view',newView);
				$('.hiu-tabs .hiu-tab',div).each(function()
				{
					if($(this).data('view')==newView)
						$('.x-btn',this).addClass('x-btn-pressed');
					else
						$('.x-btn',this).removeClass('x-btn-pressed');
				});
				
				$('.hiu-views .hiu-view',div).each(function()
				{
					$(this).css('display',(($(this).data('view')==newView)?'':'none'));
				});
			}
		});
	},
	render_buttons: function()
	{
		$('table.x-btn',this.div).hover(function(){$(this).addClass('x-btn-over');},function(){$(this).removeClass('x-btn-over');});
		this.closeButton.click(function()
		{
			var obj = $(this).data("obj");
			obj.onCloseButtonClick.apply(obj);
		});
	},
	render_dialog: function()
	{
		this.div.dialog({autoOpen:false,height:this.height,width:this.width,minWidth: 0,minHeight: 0,modal: true,draggable: false, resizable: false,closeOnEscape: false,zIndex:this.zIndex});
		if(!this.keepTitleBarClose)
		{
			this.div.parents(".ui-dialog:first").find('.ui-dialog-titlebar-close').remove();
		}
	},
	onCloseButtonClick: function()
	{
		//
		if(this.sClose!=undefined)
		{
			if(confirm(this.sClose))
			{
				this.close();
				if(this.onClose!=undefined)
				{
					this.onClose();
				}
			}			
		}
		else
		{

			this.close();
			if(this.onClose!=undefined)
			{
				this.onClose();
			}
		}
		
	},
	close: function()
	{
		this.div.dialog('close');
	},
	open: function()
	{
		this.div.dialog('open');
	},
	resize: function(w, h)
	{
		
	},
	destroy: function ()
	{
		this.div.dialog("destroy");
	},
	CLASS_NAME: "CyberGIS.Dialog.Basic"
});
CyberGIS.Dialog.InternetExplorerWarning = CyberGIS.Class(CyberGIS.Dialog.Basic,
{
	initialize: function (div, options)
	{
		CyberGIS.Dialog.Basic.prototype.initialize.apply(this, [div, options]);
		
		$(".field-url",div).click(function(){$(this).focus();$(this).select();});
	},
	buildURL: function(domain,context,sPage)
	{	
		var url = "";
		
		if(domain)
		{
			url += domain;
		}
		if(context)
		{
			url += context;
		}
		url += "/"+sPage;
		
		return url;
	},
	CLASS_NAME: "CyberGIS.Dialog.InternetExplorerWarning"
});
CyberGIS.Dialog.Data = CyberGIS.Class(CyberGIS.Dialog.Basic,
{
	/* Static */
	url_articles: "https://www.pixtoday.net/syria/index.php/Article:",
	client: undefined,
	
	/* Changed on Open*/
	layers: undefined,
	sources: undefined,
	glossaries: undefined,
	orgs_usg: undefined,
	
	
	initialize: function (client, div, options)
	{
		CyberGIS.Dialog.Basic.prototype.initialize.apply(this, [div, options]);
		this.client = client;
	},
	render: function()
	{
		this.closeButton = $('.btn-close',this.div);
		this.closeButton.data("obj",this);
		
		$('a',this.div).click(function(){window.open($(this).attr("href"));return false;});
		
		this.render_buttons();
		this.render_tabs();
		this.render_dialog();
	},
	render_layers: function()
	{
		if(this.layers!=undefined)
		{
			var content = $('.hiu-view[data-view="layers"] .hiu-dialog-data-content',this.div);
			heading = $(document.createElement('div'));
			heading.addClass('hiu-dialog-data-content-heading');
			heading.html('<span>Layers</span>');
			content.append(heading);

			//$.each(this.layers,function(i,proto)
			for(var i = 0; i < this.layers.length; i++)
			{
				var layer = this.layers[i];
				
				if(layer.type=="OpenLayers.Layer.Placeholder")
				{
					
				}
				else
				{
					var div = $(document.createElement('div'));
					div.addClass('hiu-dialog-data-content-layer');
					var html = '';
					if(layer.classification!=undefined)
					{
						html += '<span class="hiu-dialog-data-content-name">'+layer.name+'</span>';
						html += '<span class="hiu-dialog-data-content-classification"> -- '+layer.classification+'</span><br><br>';
					}
					else
					{
						html += '<span class="hiu-dialog-data-content-name">'+layer.name+'</span><br><br>';
					}
					
					
					if(layer.attribution!=undefined)
						html += '<span class="hiu-dialog-data-content-attribution">'+layer.attribution+'</span><br><br>';
					
					if(layer.description!=undefined)
						html += '<span class="hiu-dialog-data-content-description">'+layer.description+'</span><br><br>';
					
					if(layer.type=="OpenLayers.Layer.Vector")
					{
						
					}
					else if(layer.type=="OpenLayers.Layer.TimeVector")
					{
						
					}
					div.html(html);
					content.append(div);
				}
			};
		}
	},
	render_sources: function()
	{
		var that = this;
		if(this.sources!=undefined)
		{
			var content = $('.hiu-view[data-view="sources"] .hiu-dialog-data-content',this.div);
			if(content.length>0)
			{
				heading = $(document.createElement('div'));
				heading.addClass('hiu-dialog-data-content-heading');
				heading.html('<span>Sources</span>');
				content.append(heading);

				$.each(this.sources,function(name,entry)
				{
					var div = $(document.createElement('div'));
					div.addClass('hiu-dialog-data-content-calendar');
					var html = '';
					html += '<span class="hiu-dialog-data-content-name">'+entry.name+'</span><br><br>';
					html += '<span class="hiu-dialog-data-content-description">'+entry.description+'</span><br><br>';
					html += '<span class="hiu-dialog-data-content-links"><span>Link:</span><a href="'+entry.url+'">'+entry.url+'</a></span>';
					div.html(html);
					content.append(div);
				});
			}
		}
	},
	render_orgs_usg: function()
	{
		var that = this;
		if(this.orgs_usg!=undefined)
		{
			var content = $('.hiu-view[data-view="orgs_usg"] .hiu-dialog-data-content',this.div);
			if(content.length>0)
			{
				heading = $(document.createElement('div'));
				heading.addClass('hiu-dialog-data-content-heading');
				heading.html('<span>USG Organizations</span>');
				content.append(heading);

				if(this.url_articles!=undefined)
				{
					$.each(this.orgs_usg,function(name,entry)
					{
						var div = $(document.createElement('div'));
						div.addClass('hiu-dialog-data-content-calendar');
						var html = '';
						html += '<span class="hiu-dialog-data-content-name">'+entry.acronym+'</span><br><br>';
						html += '<span class="hiu-dialog-data-content-description">'+entry.name+' ('+entry.symbol+')</span><br><br>';
						html += '<span class="hiu-dialog-data-content-links"><span>Links:</span><a href="'+that.buildArticleURL.apply(that,[entry.article])+'">Article</a></span>';
						div.html(html);
						content.append(div);
					});
				}
				else
				{
					$.each(this.orgs_usg,function(name,entry)
					{
						var div = $(document.createElement('div'));
						div.addClass('hiu-dialog-data-content-calendar');
						var html = '';
						html += '<span class="hiu-dialog-data-content-name">'+entry.acronym+'</span><br><br>';
						html += '<span class="hiu-dialog-data-content-description">'+entry.name+'('+entry.symbol+')</span><br><br>';
						div.html(html);
						content.append(div);
					});
				}
			}
		}
	},
	buildArticleURL: function(article)
	{
		return this.url_articles+article;
	},
	render_glossaries: function()
	{
		if(this.glossaries!=undefined)
		{
			for(var i = 0; i < this.glossaries.length; i++)
			{
				var glossary = this.glossaries[i];
				var content = $('.hiu-view[data-view="'+glossary.name+'"] .hiu-dialog-data-content',this.div);
				if(content.length>0)
				{
					heading = $(document.createElement('div'));
					heading.addClass('hiu-dialog-data-content-heading');
					heading.html('<span>'+glossary.label+'</span>');
					content.append(heading);

					if(glossary.entries!=undefined)
					{
						$.each(glossary.entries,function(name,entry)
						{
							var div = $(document.createElement('div'));
							div.addClass('hiu-dialog-data-content-calendar');
							var html = '';
							html += '<span class="hiu-dialog-data-content-name">'+entry.term+'</span><br><br>';
							html += '<span class="hiu-dialog-data-content-description">'+entry.definition+'</span>';
							div.html(html);
							content.append(div);
						});
					}
				}
			}
		}
	},
	resize: function(w, h)
	{
		if(w<=800)
		{
			this.div.find('.hiu-view').css('width','660px');
			this.div.dialog('option','width','740px');
		}
		else if(w>800&&w<=1160)
		{
			this.div.find('.hiu-view').css('width',(w-120)+'px');
			this.div.dialog('option','width',((w-60)+'px'));
		}
		else //h > 1160
		{
			this.div.find('.hiu-view').css('width','1040px');
			this.div.dialog('option','width','1100px');
		}
		
		if(h<=600)
		{
			this.div.find('.hiu-view').css('height',(h-300)+'px');
		}
		else if(h>600&&h<=1000)
		{
			this.div.find('.hiu-view').css('height',(h-300)+'px');
		}
		else //h > 1000
		{
			this.div.find('.hiu-view').css('height','700px');
		}
		
		this.div.dialog('option','position','center');
	},
	open: function()
	{
		this.reset();
		
		this.layers = this.client.getDialogLayers();
		this.sources = this.client.getSources();
		this.orgs_usg = this.client.getUSGOrganizations();
		this.glossaries = this.client.getGlossaries();
		
		this.render_layers();
		this.render_sources();
		this.render_orgs_usg();
		this.render_glossaries();
		
		this.div.dialog('open');
		
		//Resize
		var w = undefined;
		var h = undefined;
		
		if($.browser.mozilla||$.browser.webkit||$.browser.safari)
		{
			w = window.innerWidth;
			h = window.innerHeight;
		}
		else
		{
			w = document.documentElement.offsetWidth;
			h = document.documentElement.offsetHeight;
		}
		
		this.resize(w,h);
	},
	reset: function()
	{
		this.glossaries = undefined;
		this.orgs_usg = undefined;
		
		$('.hiu-view .hiu-dialog-data-content',this.div).empty();
	},
	destroy: function ()
	{
		this.layers = undefined;
		this.sources = undefined;
		this.glossaries = undefined;
		this.orgs_usg = undefined;
	},
	CLASS_NAME: "CyberGIS.Dialog.Data"
});

CyberGIS.Dialog.Share = CyberGIS.Class(CyberGIS.Dialog.Basic,
{
	/* Static */
	url_articles: "https://www.pixtoday.net/syria/index.php/Article:",
	client: undefined,
	
	/* Initial */
	inputFields: undefined,
	input_name: undefined,
	input_layers: undefined,
	input_date: undefined,
	input_start: undefined,
	input_end: undefined,
	input_lat: undefined,
	input_lon: undefined,
	input_zoom: undefined,
	input_aoi_left: undefined,
	input_aoi_bottom: undefined,
	input_aoi_right: undefined,
	input_aoi_top: undefined,
	input_width: undefined,
	input_height: undefined,
	input_border: undefined,
	outputField: undefined,
	
	tr_html: undefined,	
	
	btn_current: undefined,
	btn_default: undefined,
	btn_mode: undefined,
	btn_email: undefined,
	
	/* Changed on Open and User Input*/
	mode: "link",// link, thumbnail, embed
	state: undefined,
	context: undefined,
	pages: undefined,
	name: undefined,
	layers: undefined,
	start: undefined,
	end: undefined,
	latitude: undefined,
	longitude: undefined,
	zoom: undefined,
	aoi: undefined,
	value_width: undefined,
	value_height: undefined,
	value_border: undefined,
	output: undefined,
	
	initialize: function (client, div, options)
	{
		CyberGIS.Dialog.Basic.prototype.initialize.apply(this, [div, options]);
		this.client = client;
		this.mode = "link";
		
		this.inputFields = $(".field-input",div);
		this.input_name = $(".field-name",div);
		this.input_layers = $(".field-layers",div);
		this.input_date = $(".field-date",div);
		this.input_start = $(".field-start",div);
		this.input_end = $(".field-end",div);
		this.input_lat = $(".field-lat",div);
		this.input_lon = $(".field-lon",div);
		this.input_zoom = $(".field-zoom",div);
		this.input_aoi_left = $(".field-aoi-left",div);
		this.input_aoi_bottom = $(".field-aoi-bottom",div);
		this.input_aoi_right = $(".field-aoi-right",div);
		this.input_aoi_top = $(".field-aoi-top",div);
		this.input_width = $(".field-width",div);
		this.input_height = $(".field-height",div);
		this.input_border = $(".field-border",div);
		this.outputField = $(".field-output",div);
		
		this.tr_html = $(".fields-html",div);
		
		this.btn_current = $(".btn-current",div);
		this.btn_default = $(".btn-default",div);
		this.btn_mode = $(".btn-mode",div);
		this.btn_email = $(".btn-email",div);
		
		this.btn_current.click(this,function(evt){evt.data.onCurrentClicked.apply(evt.data);});
		this.btn_default.click(this,function(evt){evt.data.onDefaultClicked.apply(evt.data);});
		this.btn_mode.click(this,function(evt){evt.data.onModeClicked.apply(evt.data,[$(this).val()]);});
		this.btn_email.click(this,function(evt){window.location.href =($("a",this).attr('href'));return false;});
		
		this.inputFields.bind('keypress click dblclick keydown change',this,function(evt){evt.data.onValueChanged.apply(evt.data);});
		
		this.outputField.click(function(){$(this).focus();$(this).select();});		
	},
	render: function()
	{
		this.closeButton = $('.btn-close',this.div);
		this.closeButton.data("obj",this);
		
		//Don't need this since we know the only link is the email button
		//$('a',this.div).click(function(){window.open($(this).attr("href"));return false;});
		
		this.render_buttons();
		this.render_tabs();
		this.render_dialog();
	},
	onValueChanged: function()
	{
		this.updateValues();
		var previousOutput = this.output;
		this.output = this.buildOutput();
		this.email = this.buildEmail(this.output);
		if(previousOutput!=this.output)
		{
			this.outputField.val(this.output);
			this.btn_email.find('a').attr('href',this.email);
		}
	},
	onCurrentClicked: function()
	{
		this.reset();
		this.refreshCurrent();
		this.refreshUI();
	},
	onDefaultClicked: function()
	{
		this.reset();
		this.refreshDefault();
		this.refreshUI();
	},
	onModeClicked: function(mode)
	{
		this.mode = mode;
		//this.reset();
		//this.refreshDefault();
		if(this.mode=="link")
		{
			//this.name = "";
			this.value_width = "300";
			this.value_height = "300";
		}
		else
		{
			this.value_width = "600";
			this.value_height = "400";
		}
		this.value_border = "";
		
		this.input_width.val(this.value_width);
		this.input_height.val(this.value_height);
		this.input_border.val(this.value_border);
		
		this.output = this.buildOutput();
		this.email = this.buildEmail(this.output);
		this.refreshUI();
	},
	render_buttons: function()
	{
		CyberGIS.Dialog.Basic.prototype.render_buttons.apply(this);
	},
	resize: function(w, h)
	{
		if(w<=560)
		{
			this.div.find('.hiu-view').css('width','420px');
			this.div.dialog('option','width','500px');//740 -- 500 = -240
		}
		else if(w>560&&w<=860)
		{
			this.div.find('.hiu-view').css('width',(w-120)+'px');
			this.div.dialog('option','width',((w-60)+'px'));
		}
		else //h > 1160
		{
			this.div.find('.hiu-view').css('width','740px');
			this.div.dialog('option','width','800px');
		}
		
		if(h<=600)
		{
			this.div.find('.hiu-view').css('height',(h-300)+'px');
		}
		else if(h>600&&h<=1000)
		{
			this.div.find('.hiu-view').css('height',(h-300)+'px');
		}
		else //h > 1000
		{
			this.div.find('.hiu-view').css('height','700px');
		}
		
		this.div.dialog('option','position','center');
	},
	open: function()
	{
		this.reset();
		
		this.refreshCurrent();
		this.refreshUI();
		
		this.render();
		
		this.div.dialog('open');
		
		//Resize
		var w = undefined;
		var h = undefined;
		
		if($.browser.mozilla||$.browser.webkit||$.browser.safari)
		{
			w = window.innerWidth;
			h = window.innerHeight;
		}
		else
		{
			w = document.documentElement.offsetWidth;
			h = document.documentElement.offsetHeight;
		}
		
		this.resize(w,h);
	},
	reset: function()
	{
		this.map = undefined;
		this.state = undefined;
		
		this.domain = undefined;
		this.context = undefined;
		this.pages = undefined;
		this.name = undefined;
		this.layers = undefined;
		this.date = undefined;
		this.start = undefined;
		this.end = undefined;
		this.latitude = undefined;
		this.longitude = undefined;
		this.zoom = undefined;
		this.aoi = undefined;	
		this.value_width = undefined;
		this.value_height = undefined;
		this.output = undefined;
		this.email = undefined;
	},
	refreshDefault: function()
	{
		this.map = this.client.maps[0];
		this.state = this.map.state;
		this.domain = this.state.domain;
		this.context = this.state.context;
		this.pages = this.state.pages;
		this.name = "";
		this.layers = "";
		if(this.state.isSingle())
		{
			this.date = "";
		}
		else if(this.state.isRange())
		{
			this.start = "";
			this.end = "";
		}
		this.latitude = "";
		this.longitude = "";
		this.zoom = "";
		this.aoi = undefined;
		if(this.mode=="link")
		{
			this.value_width = "300";
			this.value_height = "300";
		}
		else
		{
			this.value_width = "600";
			this.value_height = "400";
		}
		this.value_border = "";
		
		this.output = this.buildOutput();
		this.email = this.buildEmail(this.output);
		
		$('.hiu-view .hiu-dialog-data-content',this.div).empty();
	},
	refreshCurrent: function()
	{
		this.map = this.client.maps[0];
		this.state = this.map.state;
		this.domain = this.state.domain;
		this.context = this.state.context;
		this.pages = this.state.pages;
		this.name = this.state.name;
		this.defaultLayers = this.state.defaultFeatureLayerNames;
		this.layers = this.state.activeFeatureLayerNames;
		if(this.state.isSingle())
		{
			this.date = this.state.formatCurrentDate();
		}
		else if(this.state.isRange())
		{
			this.start = this.state.formatCurrentStartDate();
			this.end = this.state.formatCurrentEndDate();
		}
		this.latitude = ""+this.state.lonlat.lat.toFixed(4);
		this.longitude = ""+this.state.lonlat.lon.toFixed(4);
		this.zoom = ""+this.state.zoom;
		this.aoi = CyberGIS.parseBounds(this.state.extent,this.map.projection,"EPSG:4326");
		
		if(this.mode=="link")
		{
			this.value_width = "300";
			this.value_height = "300";
		}
		else
		{
			this.value_width = "600";
			this.value_height = "400";
		}
		this.value_border = "";
		
		this.output = this.buildOutput();
		this.email = this.buildEmail(this.output);
		
		$('.hiu-view .hiu-dialog-data-content',this.div).empty();
	},
	buildOutput: function()
	{
		var output = undefined;
		if(this.mode=="link")
		{
			output = this.buildURL(this.domain,this.context,this.pages.main);
		}
		else if(this.mode=="thumbnail")
		{
			output = "<iframe";
			output += " width=\""+this.value_width+"\"";
			output += " height=\""+this.value_height+"\"";
			output += " frameborder=\"0\"";
			output += " scrolling=\"no\"";
			output += " marginwidth=\"0\"";
			output += " marginheight=\"0\"";
			if(this.value_border)
			{
				output += " style=\"border: "+this.value_border+";\"";
			}
			output += " src=\""+this.buildURL(this.domain,this.context,this.pages.thumbnail||this.pages.main)+"\"";
			output += ">";
		}
		else if(this.mode=="embed")
		{
			output = "<iframe";
			output += " width=\""+this.value_width+"\"";
			output += " height=\""+this.value_height+"\"";
			output += " frameborder=\"0\"";
			output += " scrolling=\"no\"";
			output += " marginwidth=\"0\"";
			output += " marginheight=\"0\"";
			if(this.value_border)
			{
				output += " style=\"border: "+this.value_border+";\"";
			}
			output += " src=\""+this.buildURL(this.domain,this.context,this.pages.embed||this.pages.main)+"\"";
			output += ">";
		}
		return output;
	},
	buildURL: function(domain,context,sPage)
	{	
		var url = "";
		if(domain)
		{
			url += domain;
		}
		if(context)
		{
			url += context;
		}
		url += "/"+sPage;
		
		var params = [];
		if(this.mode!="link")
		{
			if(this.name)
			{
				params.push("name="+this.name);	
			}
		}
		
		if(this.layers)
		{
			if(this.layers!=this.defaultLayers)
			{
				params.push("layers="+this.layers);
			}
		}
		
		if(this.state.isSingle())
		{
			if(this.date)
			{
				params.push("d="+this.date);
			}
		}
		else if(this.state.isRange())
		{
			if(this.start&&this.end)
			{
				params.push("start="+this.start);
				params.push("end="+this.end);
			}
		}
		if(this.zoom)
		{
			params.push("z="+this.zoom);
		}
		
		
		if(this.latitude&&this.longitude)
		{
			params.push("lat="+this.latitude);
			params.push("lon="+this.longitude);
		}
		
		if(this.aoi)
		{
			params.push("aoi_ll="+this.aoi.toBBOX(4));
		}
		
		
		if(params.length>0)
		{
			url += "?"+params.join("&");
		}
		
		return url;
	},
	buildEmail: function(output)
	{
		var href = "mailto:";
		var params = [];
		params.push("subject="+encodeURIComponent(this.name||this.state.name));
		params.push("body="+encodeURIComponent(output));	
		if(params.length>0)
		{
			href += "?"+params.join("&");
		}
		return href;
	},
	refreshUI: function()
	{
		this.input_name.val(this.name);
		this.input_layers.val(this.layers);
		if(this.state.isSingle())
		{
			this.input_date.val(this.date);
		}
		else if(this.state.isRange())
		{
			this.input_start.val(this.start);
			this.input_end.val(this.end);
		}
		this.input_lat.val(this.latitude);
		this.input_lon.val(this.longitude);
		this.input_zoom.val(this.zoom);
		
		if(this.aoi!=undefined)
		{
			this.input_aoi_left.val(this.aoi.left.toFixed(4));
			this.input_aoi_bottom.val(this.aoi.bottom.toFixed(4));
			this.input_aoi_right.val(this.aoi.right.toFixed(4));
			this.input_aoi_top.val(this.aoi.top.toFixed(4));
		}
		else
		{
			this.input_aoi_left.val("");
			this.input_aoi_bottom.val("");
			this.input_aoi_right.val("");
			this.input_aoi_top.val("");
		}
		
		this.input_width.val(this.value_width);
		this.input_height.val(this.value_height);
		this.input_border.val(this.value_border);
		this.outputField.val(this.output);
		this.btn_email.find('a').attr('href',this.email);
		
		this.tr_html.css('display',(this.mode=="link"?'none':''));
	},
	updateValues: function()
	{
		this.name = this.input_name.val();
		this.layers = this.input_layers.val();
		if(this.state.isSingle())
		{
			this.data = this.input_date.val();
		}
		else if(this.state.isRange())
		{
			this.start = this.input_start.val();
			this.end = this.input_end.val();
		}
		this.latitude = this.input_lat.val();
		this.longitude = this.input_lon.val();
		this.zoom = this.input_zoom.val();
		
		var aoi_left = this.input_aoi_left.val();
		var aoi_bottom = this.input_aoi_bottom.val();
		var aoi_right = this.input_aoi_right.val();
		var aoi_top = this.input_aoi_top.val();		
		
		if(aoi_left.match(new RegExp(CyberGIS.regex_bbox))&&aoi_bottom.match(new RegExp(CyberGIS.regex_bbox))&&aoi_right.match(new RegExp(CyberGIS.regex_bbox))&&aoi_top.match(new RegExp(CyberGIS.regex_bbox)))
		{
			this.aoi = CyberGIS.parseBounds([this.input_aoi_left.val(),this.input_aoi_bottom.val(),this.input_aoi_right.val(),this.input_aoi_top.val()]);	
		}
		else
		{
			this.aoi = undefined;
		}
		
		this.value_width = this.input_width.val();
		this.value_height = this.input_height.val();
		this.value_border = this.input_border.val();
		this.output = this.outputField.val();
		this.email = this.buildEmail(this.output);
		
		this.tr_html.css('display',(this.mode=="link"?'none':''));
	},
	destroy: function ()
	{
		this.name = undefined;
		this.layers = undefined;
		this.defaultLayers = undefined;
		this.time = undefined;
		this.latitude = undefined;
		this.longitude = undefined;
		this.zoom = undefined;
		this.aoi_left = undefined;
		this.aoi_bottom = undefined;
		this.aoi_right = undefined;
		this.aoi_top = undefined;
		this.value_width = undefined;
		this.value_height = undefined;
		this.value_border = undefined;
		this.output = undefined;
		this.email = undefined;
	},
	CLASS_NAME: "CyberGIS.Dialog.Share"
});
