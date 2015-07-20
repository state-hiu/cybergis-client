OpenLayers.Strategy.JIT = OpenLayers.Class(OpenLayers.Strategy.Fixed,
{
	regex_field: "^(\\${)(\\w+)(})$",
	regex_bbox: "^(\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)[,](\\s*)([-+]?\\d*[.]?\\d*)(\\s*)$",
	
	//refresh: undefined,
	//join: undefined,
	//file: undefined,
	//agg: undefined,
	grep: undefined,/* Global Grep for all features.  Executed first within onLoadEvent before jobs execute*/
	jobs: undefined,
	
	listeners: [],//{url,context,job}
	
	hideEmpty: true,
	
	allFeatures: undefined,
	validFeatures: undefined,/* Grep'd allFeatures if grep != undefined*/
	activeFeatures: undefined,
	
	/* These variables are updated at the beginning of onLoadEnd and should be valid during any job*/
	currentExtent: undefined,

	initialize: function(jobs, grep, options)
    {
		OpenLayers.Strategy.Fixed.prototype.initialize.apply(this, [options]);
        if(OpenLayers.Util.isArray(jobs))
        {
        	this.setJobs(jobs);
        }
        this.setGrep(grep);
    },
    
    setJobs: function(jobs)
    {
    	this.jobs = jobs;
    	for(var i = 0; i < this.jobs.length; i++)
    	{
    		var job = this.jobs[i];
    		job.id = job.id || i;
    	}
    },
    setGrep: function(grep)
    {
    	this.grep = grep;
    },
    getJob: function(i)
    {
    	var job = undefined;
    	if(this.jobs!=undefined)
    	{
    		job = this.jobs[i];
    	}
    	return job;
    },
    getNumberOfJobs: function()
    {
    	var n = 0;
    	if(this.jobs!=undefined)
    	{
    		n = this.jobs.length;
    	}
    	return n; 
    },
	
	merge: function(mapProjection, resp)
	{
        var layer = this.layer;
        layer.destroyFeatures();
        var features = resp.features;
        if (features && features.length > 0)
        {
            if(!mapProjection.equals(layer.projection))
            {
                var geom;
                for(var i=0, len=features.length; i<len; ++i)
                {
                    geom = features[i].geometry;
                    if(geom)
                    {
                        geom.transform(layer.projection, mapProjection);
                    }
                }
            }
            
            this.allFeatures = features;
            //activeFeatures = $.grep(features,function(){});
            //layer.addFeatures(features);
            //layer.addFeatures(activeFeatures);
        }
        else
        {
        	this.allFeatures = [];
        }
        layer.events.triggerEvent("loadend", {response: resp});
    },
	
    initJobs: function()
    {
    	var bInit = false;
    	for(var i = 0; i < this.jobs.length; i++)
    	{
    		var job = this.jobs[i];
    		if(job.refresh!=undefined)
    		{
    			if(job.refresh.init!=undefined)
    			{
    				if(job.refresh.init==true)
    				{
    					bInit = true;
    					break;
    				}
    			}
    		}
    	}
    	if(bInit)
    	{
    		this.layer.events.on(
	    	{
	    		loadend: function(e)
	    		{
	    			var layer = this;
	    			if(layer.options.jit!=undefined)
	    			{
	    				var strategy = layer.strategies[0];
	    				strategy.onLoadEnd.apply(strategy);
	    			}
	    		}
	    	});
    	}
    },    
    onLoadEnd: function()
    {
    	this.currentExtent = this.getCurrentExtent();
    	this.validFeatures = this.grepFeatures(this.allFeatures);
    	/////////////////////////////////    	
    	for(var i = 0; i < this.jobs.length; i++)
    	{
    		var job = this.jobs[i];
    		var bInit = false;
    		if(job.refresh!=undefined)
    		{
    			if(job.refresh.init!=undefined)
    			{
    				bInit = (job.refresh.init==true);
    			}
    		}
    		if(bInit)
    		{
    			if(job.type=="simple")
    			{
    				this.runTasks(job);
    			}
    			else if(job.type=="advanced")
    			{
	        		if(job.remote!=undefined)
	        		{
	        			if(job.remote.join!=undefined)
	        			{
	        				if(job.remote.source!=undefined)
	        				{
	        					var sourceName = job.remote.source;
	        					var joinType = job.remote.join.type;
	        					var left = job.remote.join.left;
	        					var include = job.remote.join.include;
	        					
	        					if(joinType=="single")
	        					{
	        						if(sourceName!=undefined&&joinType!=undefined&&left!=undefined&&include!=undefined)
		        					{
		        						this.jit_source(job,sourceName,joinType,undefined,left,include,undefined);
		        					}	
	        					}
	        					else if(joinType=="left")
	        					{ 
	        						var dest = job.destination||"jit";
	        						if(sourceName!=undefined&&joinType!=undefined&&left!=undefined&&include!=undefined)
		        					{
		        						this.jit_source(job,sourceName,joinType,undefined,left,include,dest);
		        					}
	        					}
	        					else if(joinType=="pcode")
	        					{
	        						var dest = job.destination||"jit";
	        						var level = job.remote.join.level;
	        						if(sourceName!=undefined&&joinType!=undefined&&level!=undefined&&left!=undefined&&include!=undefined)
		        					{
		        						this.jit_source(job,sourceName,joinType,level,left,include,dest);
		        					}
	        					}	        					
	        				}
	        				else if(job.remote.file!=undefined)
		        			{
		        				var url = job.remote.file.url;
		    	        		var delimiter = job.remote.file.delimiter;
		    	        		if(url!=undefined&&delimiter!=undefined)
		    	        		{
			        				var layer = this.layer;
		    	        			var strategy = this;
		    	        			this.listeners.push({"url":url,"context":this,"job":job});
		    	        			$.ajax({url: url,type: "GET",contentType: "application/json; charset=\"utf-8\"",beforeSend: hiu.beforeSend,complete: function(xData,status)
				            		{
				            			var j2 = layer.options.jit;
				            			if(j2!=undefined)
				            			{
				            				strategy.jit_response.apply(strategy,[url,xData.responseText]);
				                			layer.redraw();
				            			}
				            		}});
		    	        		}
		        			}
	        			}
	        		}
    			}
    		}
    	}
    },
    grepFeatures: function(features)
    {
    	if(this.grep!=undefined)
    	{
    		var that = this;
        	return $.grep(features,function(f){return that.testFeature.apply(that,[f,f.attributes,that.grep]);});
    	}
    	return features;
    },
    
    
    getCurrentExtent: function()
    {
    	var extent = undefined;
    	var m = this.layer.map;
    	var c = m.getCachedCenter();
    	var r = m.getResolution();    
        if ((c != null) && (r != null))
        {
            var halfWDeg = (m.size.w * r) / 2;
            var halfHDeg = (m.size.h * r) / 2;        
            extent = new OpenLayers.Bounds(c.lon - halfWDeg, c.lat - halfHDeg, c.lon + halfWDeg, c.lat + halfHDeg);
        }
        return extent;
    },
    
    runJob: function(i)
    {
    	var job = this.getJob(i);
    	if(job!=undefined)
    	{
    		if(job.type=="basic")
    		{
    			this.runTasks(job);
    		}
    	}
    },
    
    runTasks: function(job)
    {
    	if(job.tasks!=undefined)
    	{
        	for(var i = 0; i < this.validFeatures.length; i++) 
    		{
    			var f = this.validFeatures[i];
	    		for(var j = 0; j < job.tasks.length; j++)
	    		{
	    			var task = job.tasks[j];
	    			this.calc(task,f,undefined);
	    		}
    	    	this.setCompiled(f,job.id,'success');
    		}			
    	}
    	
    	if(job.type=="simple")
    	{
    		if(job.grep!=undefined)
    		{
    			var that = this;
    			this.activeFeatures = $.grep(this.validFeatures,function(f,i){return that.testFeature(f,f.attributes,job.grep);});
    		}
    		else
    		{
    			this.activeFeatures = this.validFeatures;
    		}
    	}
    	else if(job.type=="advanced")
    	{
    		if(job.grep!=undefined)
    		{
    			var that = this;
    			this.activeFeatures = $.grep(this.validFeatures,function(f,i){return that.testFeature(f,f.attributes,job.grep);});
    			
    			if(this.hideEmpty)
        		{
        			this.activeFeatures = $.grep(this.activeFeatures,function(f,i){return f.attributes.jit.length>0;});
        		}
    		}
    		else
    		{
    			if(this.hideEmpty)
        		{
        			this.activeFeatures = $.grep(this.validFeatures,function(f,i){return f.attributes.jit.length>0;});
        		}
        		else
        		{
        			this.activeFeatures = this.validFeatures;	
        		}
    		}
    	}

		this.layer.removeAllFeatures({"silent":true});
		this.layer.addFeatures(this.activeFeatures);
    	
		this.layer.redraw();
    },    
    
	jit_response: function(url,responseText)
	{
		var newListeners = [];
    	for(var i = 0; i < this.listeners.length; i++)
    	{
    		var listener = this.listeners[i];
    		if(listener.url==url)
    		{
    			var job = listener.job;
    			if(job.remote!=undefined)
    			{
    				if(job.remote.join!=undefined&&job.remote.file!=undefined)
    				{
    					var type = job.remote.join.type;
    					if(type=="left"||type=="pcode")
    					{
    						var left = job.remote.join.left;
        					var right = job.remote.join.right;
        					var delimiter = job.remote.file.delimiter;
        					
        					if(left!=undefined&&right!=undefined&&delimiter!=undefined)
        					{
        						var rows = responseText.split("\n");
        	    				rows = $.grep(rows,function(row,i){return $.trim(row).length>0;});
        	    				
        	    				if(rows.length>1)
        	    				{
        	    					if(type=="left")
                					{
            							for(var j = 0; j < this.validFeatures.length; j++) 
            	    					{
            	    						var f = this.validFeatures[j];
            	    						this.jit_feature(job,f,rows,right,f.attributes[""+left],delimiter,type,undefined);
            	    					}
                					}
                					else if(type=="pcode")
                					{
                    					var level = job.remote.join.level;
                    					
                    					for(var j = 0; j < this.validFeatures.length; j++) 
            	    					{
            	    						var f = this.validFeatures[j];
            	    						this.jit_feature(job,f,rows,right,f.attributes[""+left],delimiter,type,level);
            	    					}
                					}
        	    				}
        	    				
    	    	    			this.activeFeatures = $.grep(this.validFeatures,function(f,i){return (f.attributes.jit==undefined)?(false):(f.attributes.jit.length>0);});
    	    	    			
    	    	    			this.layer.removevalidFeatures({"silent":true});
    	    	    			this.layer.addFeatures(this.activeFeatures);
        	    				
        						this.layer.redraw();
        					}
    					}
    				}
    			}
    		}
    		else
    		{
    			newListeners.push(listener);
    		}
    	}
    	this.listeners = newListeners;
	},
	jit_feature: function(job,f,rows,id,value,delimiter,type,level)
    {
    	if(!this.isFeatureCompiled(f,job.id))
		{
			var h = $.map(rows[0].split(delimiter),function(hi,i){return OpenLayers.String.trim(hi);});
    		var columnIndex = this.getColumnIndex(h,id);
			if(columnIndex!=-1)
			{
				var a = [];
		    	for(var i = 1; i < rows.length; i++)
		    	{
		    		var r = rows[i];
		    		var b = $.map(r.split(delimiter),function(bi,i){return OpenLayers.String.trim(bi);});
		    		if(type=="left")
		    		{
		    			if(b[columnIndex]!=undefined)
		    			{
			    			if(b[columnIndex].toLowerCase()==value.toLowerCase())
				    		{
				    			var v = {};
				    			for(var j = 0; j < h.length; j++)
				    			{
				    				v[""+h[j]] = b[j];
				    			}
				    			a.push(v);
				    		}
		    			}
		    		}
		    		else if(type=="pcode")
		    		{
		    			if(b[columnIndex]!=undefined)
		    			{
			    			if(OpenLayers.String.startsWith(b[columnIndex].toLowerCase(),value.toLowerCase()))
				    		{
				    			var v = {};
				    			for(var j = 0; j < h.length; j++)
				    			{
				    				v[""+h[j]] = b[j];
				    			}
				    			a.push(v);
				    		}
		    			}
		    		}
		    	}
		    	
		    	f.attributes.jit = a;
		    	
		    	if(job.tasks!=undefined)
		    	{
		    		for(var i = 0; i < job.tasks.length; i++)
		    		{
		    			this.calc(job.tasks[i],f,a);
		    		}
		    	}
			}	
			this.setCompiled(f,job.id,'success');
		}
    },	
	jit_source: function(job,sourceName,type,level,left,include,dest)
	{
		if(type!=undefined)
		{
			var source = hiu.client.getDataSource.apply(hiu.client,[sourceName]);
			if(source!=undefined)
			{
				if(type=="single")
				{
					for(var j = 0; j < this.validFeatures.length; j++) 
					{
						var f = this.validFeatures[j];
						var key = f.attributes[""+left];
						
						var a = source.getValue(key);
						f.attributes[""+sourceName] = a;
						f.attributes = OpenLayers.Util.applyDefaults(OpenLayers.Util.extend({},f.attributes),a);
						
						if(job.tasks!=undefined)
				    	{
				    		for(var i = 0; i < job.tasks.length; i++)
				    		{
				    			this.calc(job.tasks[i],f,a);
				    		}
				    	}
						this.setCompiled(f,job.id,'success');
					}
					
					if(include=="all")
					{
						this.activeFeatures = this.validFeatures;
					}
					else
					{
						this.activeFeatures = $.grep(this.validFeatures,function(f,i){return f.attributes[""+sourceName]!=undefined;});
					}
				}
				else if(type=="left")
				{
					/* TODO */
					if(include=="all")
					{
						for(var j = 0; j < this.validFeatures.length; j++) 
						{
							var f = this.validFeatures[j];
							var key = f.attributes[""+left];
							var a = [];
							var b = source.getValue(key);
							if(b!=undefined)
							{
								for(var i = 0; i < b.length; i++)
								{
									a.push(b[i]);
								}
							}
							f.attributes[""+dest] = a;
							if(job.tasks!=undefined)
					    	{
					    		for(var i = 0; i < job.tasks.length; i++)
					    		{
					    			this.calc(job.tasks[i],f,a);
					    		}
					    	}
							this.setCompiled(f,job.id,'success');
						}
					}
					else
					{
						this.activeFeatures = $.grep(this.validFeatures,function(f,i){return (f.attributes[""+dest]==undefined)?(false):(f.attributes[""+dest].length>0);});
					}
				}
				else if(type=="pcode")
				{					
					for(var j = 0; j < this.validFeatures.length; j++) 
					{
						var f = this.validFeatures[j];
						var key = f.attributes[""+left];
						var a = [];
						var b = source.getValues(key,true,level); 
						for(var i = 0; i < b.length; i++)
						{
							a.push(b[i]);
						}
						f.attributes[""+dest] = a;
						if(job.tasks!=undefined)
				    	{
				    		for(var i = 0; i < job.tasks.length; i++)
				    		{
				    			this.calc(job.tasks[i],f,a);
				    		}
				    	}
						this.setCompiled(f,job.id,'success');
					}
					
					if(include=="all")
					{
						this.activeFeatures = this.validFeatures;
					}
					else
					{
						this.activeFeatures = $.grep(this.validFeatures,function(f,i){return (f.attributes[""+dest]==undefined)?(false):(f.attributes[""+dest].length>0);});
					}
				}
			}
			else
			{
				for(var j = 0; j < this.validFeatures.length; j++) 
				{
					this.setCompiled(this.validFeatures[j],job.id,'SOURCE UNAVAILABLE');
				}
			}
		}
		
		this.layer.removeAllFeatures({"silent":true});
		this.layer.addFeatures(this.activeFeatures);
		
		this.layer.redraw();
	},
    
	isFeatureCompiled: function(f,job)
	{
    	return CyberGIS.getJSON(["jit","compiled",""+job],f.attributes)==true;
	},
    getColumnIndex: function(h,id)
    {
    	var columnIndex = -1;
    	for(var i = 0; i < h.length; i++)
    	{
    		if((h[i]).toLowerCase()==id.toLowerCase())
    		{
    			columnIndex = i;
    			break;
    		}
    	}
    	return columnIndex;
    },
    setCompiled: function(f,job,status)
    {
    	if(f.attributes.jit==undefined)
    	{
    		f.attributes.jit = {'compiled':{},'status':{}};
    	}
    	f.attributes.jit.compiled[""+job] = true;
    	f.attributes.jit.status[""+job] = status;
    },    
    calc: function(task,feature,aData)
    {
    	if(task.op=="copy")
    	{
    		this.calc_copy(feature,task.output,task.input,task.where);
    	}
    	else if(task.op=="parse")
    	{
    		this.calc_parse(feature,task.output,task.input,task.type);
    	}
    	else if(task.op=="concat")
    	{
    		this.calc_concat(feature,task.output,task.input,task.where);
    	}
    	else if(task.op=="split")
    	{
    		this.calc_split(feature,task.output,task.input,task.delimiter,task.where);
    	}
    	else if(task.op=="join")
    	{
    		this.calc_join(feature,task.output,task.input,task.delimiter,task.where);
    	}
    	else if(task.op=="grep")
    	{
    		this.calc_grep(feature,task.output,task.input,task.values,task.keep,task.where);
    	}
    	else if(task.op=="count")
    	{
    		this.calc_count(feature,aData,task.output,task.where);
    	}
    	else if(task.op=="sum")
    	{
    		this.calc_sum(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="min")
    	{
    		this.calc_min(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="max")
    	{
    		this.calc_max(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="avg")
    	{
    		this.calc_avg(feature,aData,task.output,task.input);
    	}
    	else if(task.op=="strip_fields")
    	{
    		this.calc_strip_fields(feature,task.fields,task.characters);
    	}
    	else if(task.op=="strip_array")
    	{
    		this.calc_strip_array(feature,aData,task.array_input,task.array_output,task.fields,task.field_input,task.field_output,task.characters);
    	}
    },    
    calc_parse: function(feature,output,input,type)
    {
    	if(CyberGIS.isString(type)&&CyberGIS.isString(output)&&CyberGIS.isString(input))
    	{
			var a = feature.attributes;
			var sInput = a[""+input];
			if(CyberGIS.isString(sInput))
			{
				if(type=="int"||type=="integer")
				{
					a[""+output] = parseInt(sInput,10);
				}
				else if(type=="float"||type=="double")
				{
					a[""+output] = parseFloat(sInput);
				}
			}
    	}    	
    },
    calc_copy: function(feature,output,input,w)
    {
    	if(this.testFeature(feature,feature.attributes,w))
    	{
        	var value = undefined;
    		if(CyberGIS.isString(input))
    		{
    			if(CyberGIS.isField(input))
    			{
        			var an = CyberGIS.extractField(input);
        			if(an!=undefined)
        			{
        				value = this.attr_s(an,feature.attributes);
        			}
        			else
        			{
        				value = u;
        			}
    					
    			}
    			else
    			{
    				value = oInput;
    			}
    		}
    		else
    		{
    			value = this.attr(input,feature.attributes);
    		}
        	feature.attributes[""+output] = value;
    	}
    },
    calc_concat: function(feature,output,aInput,w)
    {
    	if(this.testFeature(feature,feature.attributes,w))
    	{
        	var str = "";
    		for(var i = 0; i < aInput.length; i++)
        	{
        		var oInput = aInput[i];
        		if(CyberGIS.isString(oInput))
        		{
        			if(CyberGIS.isField(oInput))
        			{
            			var an = CyberGIS.extractField(oInput);
            			if(an!=undefined)
            			{
            				str += this.attr_s(an,feature.attributes);
            			}
            			else
            			{
            				str += "";
            			}
        					
        			}
        			else
        			{
            			str += oInput;
        			}
        		}
        		else
        		{
        			str += this.attr(oInput,feature.attributes);
        		}
        	}
        	feature.attributes[""+output] = str;
    	}
    },
    calc_split: function(feature,output,input,delimiter,w)
    {
    	if(this.testFeature(feature,feature.attributes,w))
    	{
    		if(CyberGIS.isString(delimiter)&&CyberGIS.isString(output)&&CyberGIS.isString(input))
        	{
    			var a = feature.attributes;
    			a[""+output] = CyberGIS.split(a[""+input],delimiter);
        	}
    	}    	
    },
    calc_join: function(feature,output,input,delimiter,w)
    {
    	if(this.testFeature(feature,feature.attributes,w))
    	{
    		if(CyberGIS.isString(delimiter)&&CyberGIS.isString(output)&&CyberGIS.isString(input))
        	{
    			var a = feature.attributes;
    			a[""+output] = CyberGIS.join(a[""+input],delimiter);
        	}
    	}    	
    },
    calc_grep: function(feature,output,input,aValues,bKeep,w)
    {
    	if(this.testFeature(feature,feature.attributes,w))
    	{
    		if(bKeep==undefined)
    		{
    			bKeep = true;
    		}
    		if(CyberGIS.isString(output)&&CyberGIS.isString(input)&&CyberGIS.isArray(aValues))
        	{
    			feature.attributes[""+output] = CyberGIS.grep(feature.attributes[""+input], aValues, bKeep);
        	}
    	}   
    },
    calc_count: function(feature,aData,output,w)
    {
    	if(w!=undefined)
    	{
    		var d2 = undefined;
    		if(w.op=="="||w.op=="==")
			{
    			d2 = $.grep(aData,function(d,i)
				{
					return d[""+w.field]==w.value;
				});	
			}
			else if(w.op=="!="||w.op=="<>")
			{
				d2 = $.grep(aData,function(d,i)
				{
					return d[""+w.field]!=w.value;
				});	
			}
			else if(w.op=="not in"||w.op=="notin"||w.op=="not_in")
			{
				d2 = $.grep(aData,function(a,i)
				{
					return $.inArray(a[""+w.field],w.values)==-1;
				});	
			}
			else
			{
				d2 = aData;
			}
    		feature.attributes[""+output] = d2.length;
    	}
    	else
    	{
    		feature.attributes[""+output] = aData.length;
    	}
    },
    calc_sum: function(feature,aData,output,input)
    {
    	var sum = 0;
    	for(var i = 0; i < aData.length; i++)
    	{
    		sum += aData[i][""+input];
    	}    	
    	feature.attributes[""+output] = sum;
    },
    calc_min: function(feature,aData,output,input)
    {
    	var min = undefined;
    	if(aData.length>0)
    	{
    		min = aData[0][""+input];
    		for(var i = 1; i < aData.length; i++)
        	{
        		if(aData[i][""+input]<min)
        		{
        			min = aData[i][""+input];
        		}
        	}
    	}   	
    	feature.attributes[""+output] = min;
    },
    calc_max: function(feature,aData,output,input)
    {
    	var max = undefined;
    	if(aData.length>0)
    	{
    		max = aData[0][""+input];
    		for(var i = 1; i < aData.length; i++)
        	{
        		if(aData[i][""+input]>max)
        		{
        			max = aData[i][""+input];
        		}
        	}
    	}   	
    	feature.attributes[""+output] = max;
    },
    calc_avg: function(feature,aData,output,input)
    {
    	var sum = 0;
    	for(var i = 0; i < aData.length; i++)
    	{
    		sum += aData[i][""+input];
    	}
    	feature.attributes[""+output] = sum/aData.length;
    },
    calc_strip_fields: function(feature,aFields,characters)
    {
    	if(CyberGIS.isString(characters))
    	{
    		if(CyberGIS.isArray(aFields))
    		{
    			var a = feature.attributes;
    			for(var i = 0; i < aFields.length; i++)
    			{
    				a[""+aFields[i]] = CyberGIS.strip(a[""+aFields[i]],characters);
    			}
    		}
    	}
    },
    calc_strip_array: function(feature,aData,aInput,aOutput,aFields,fInput,fOutput,characters)
    {
    	if(CyberGIS.isString(aInput) && CyberGIS.isString(aOutput) && CyberGIS.isString(characters))
    	{
    		if(CyberGIS.isArray(aFields))
    		{
    			var c = [];
    			for(var i = 0; i < aData.length; i++)
        		{
        			var a = aData[i];
        			var b = CyberGIS.extend({},a);
        			for(var j = 0; j < aFields.length; j++)
        			{
        				b[""+aFields[j]] = CyberGIS.strip(b[""+aFields[j]],characters);
        			}
        			c.push(b);
        		}
    			feature.attributes[""+aOutput] = c;
    		}
    		else if(CyberGIS.isString(fInput) && CyberGIS.isString(fOutput))
    		{
    			var c = [];
    			for(var i = 0; i < aData.length; i++)
        		{
        			var a = aData[i];
        			var b = CyberGIS.extend({},a);
        			b[""+fOutput] = CyberGIS.strip(b[""+fInput],characters);
        			c.push(b);
        		}
    			feature.attributes[""+aOutput] = c;
    		}
    		else
    		{
    			feature.attributes[""+aOutput] = undefined;
    		}
    		
    	}
    	else
    	{
    		feature.attributes[""+aOutput] = undefined;
    	}
    },
    
    testFeature: function(f,a,w)
    {
    	if(a!=undefined&&w!=undefined)
    	{
    		if(w.op=="="||w.op=="==")
    		{
        		return a[""+w.field]==w.value;
    		}
    		else if(w.op=="!="||w.op=="<>")
    		{
    			return a[""+w.field]!=w.value;
    		}
    		else if(w.op=="not in"||w.op=="notin"||w.op=="not_in")
    		{
    			return $.inArray(a[""+w.field],w.values)==-1;
    		}
    		else if(w.op=="not in"||w.op=="notin"||w.op=="not_in")
    		{
    			return $.inArray(a[""+w.field],w.values)==-1;
    		}
    		else if(w.op=="intersects")
    		{
    			if(CyberGIS.isField(w.bbox)&&CyberGIS.extractField(w.bbox)=="map")
    			{
    				return this.currentExtent.intersectsBounds(f.geometry.getBounds());
    			}
    			else if(w.bbox.match(new RegExp(CyberGIS.regex_bbox)))
    			{
    				return (new OpenLayers.Bounds.fromString(w.bbox)).intersectsBounds(f.geometry.getBounds());
    			}
    			else
    			{
    				return true;
    			}
    		}
    		else
    		{
    			return true;
    		}
    	}
		else
		{
			return true;
		}
    },
       
    attr: function(ap,av)
	{
		var an = ap.name;
		var at = ap.type;
		var s = "";
		if(at=="string")
		{
			s = this.attr_s(an,av);
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
			s = this.attr_pc(an,av,ap.pcode);
		}
		else
		{
			s = this.attr_s(an,av);
		}
		return s;
	},
	attr_s: function(an,av)
	{
		var s = "Not Found!";
		if(av!=undefined)
		{
			if(av[""+an]!=undefined)
			{
				s = av[""+an];
			}
		}		
		return s;
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
				s = hiu.client.hashmaps[""+hm.ns][""+hm.id][av[""+an]];
			}
		}		
		return s;
	},
	attr_pc: function(an,av,pc)
	{
		var s = "Not Found!";
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
    
    CLASS_NAME: "OpenLayers.Strategy.JIT"
});
