CyberGIS.Carto = {};
CyberGIS.Carto.Basic = CyberGIS.Class
({
	client: undefined,
	carto_app: undefined,
	carto_library: undefined,
	
	initialize: function(client, carto_app, carto_library, options)
	{
		 CyberGIS.extend(this, options);
		 if(this.id == null)
		 {
			 this.id = CyberGIS.createUniqueID(this.CLASS_NAME + "_");
		 }
		 this.client = client;
		 this.carto_app = carto_app;
		 this.carto_library = carto_library;
	},	
	_configuration: function(sLayer)
	{
		return CyberGIS.getJSON(["layers",""+sLayer,"popup"],this.carto_app);
	},
	/* -------------- Popup Functions -------------- */
	/* Private Build Functions */
	_buildSelect: function(id,label,av)
	{
		var html = "";
		html += "<select class=\"hiu-popup-select-page\">";
		for(var i = 0; i < av.length; i++)
		{
			html += this.option(id,label,av[i]);
		}
		html += "</select>";
		return html;
	},
	_buildOption: function(id,label,av)
	{
		return "<option value=\""+av[""+id]+"\">"+av[""+label]+"</option>";
	},	
	_buildRow: function(f,ap,av,z)
	{
		var g = f.geometry;
		if(ap.type=="hr")
		{
			return "<div class=\"hiu-popup-row hiu-popup-row-break\"><hr></div>";
		}
		else if(ap.type=="br")
		{
			return "<div class=\"hiu-popup-row hiu-popup-row-break\"><br></div>";
		}
		else if(ap.type=="heading")
		{
			var html = "<div class=\"hiu-popup-row hiu-popup-row-heading\">";
			if(CyberGIS.hasLabel(ap))
			{
				html += "<span class=\"hiu-popup-row-heading-label\">"+CyberGIS.getLabel(ap,av)+"</span>";
			}
			html += "</div>";
		}
		else if(ap.type=="link")
		{
			var html = "<div class=\"hiu-popup-row\">";
			if(CyberGIS.hasLabel(ap))
			{
				html += "<span class=\"hiu-popup-row-label\">"+CyberGIS.getLabel(ap,av)+": </span>";
			}
			html += "<span class=\"hiu-popup-row-value\">"+CyberGIS.getLink(ap)+"</span>";
			html += "</div>";
		}
		else
		{
			var html = "<div class=\"hiu-popup-row\">";
			if(CyberGIS.hasLabel(ap))
			{
				html += "<span class=\"hiu-popup-row-label\">"+CyberGIS.getLabel(ap,av)+": </span>";
			}
			html += "<span class=\"hiu-popup-row-value\">"+CyberGIS.getAttribute(f.layer.map.projection,ap,av,g,z)+"</span>";
			html += "</div>";
			return html;
		}
	},
	_buildTitle: function(av,t)
	{
		if(typeof t == "string")
		{
			return t;
		}
		else
		{
			if(t.base!=undefined&&t.suffix!=undefined&&av!=undefined)
			{
				var str = "";
				var base = t.base;
				
				if(t.prefix!=undefined)
				{
					str += t.prefix;
				}	
				
				if(typeof base == "string")
				{
					str = av[""+base];
				}
				else
				{
					if(base.type=="pcode")
					{
						str = CyberGIS.attr_pc(base.name,av,base.pcode);
					}
				}
				
				if(t.suffix!=undefined)
				{
					str += t.suffix;
				}					
				return str;
			}
			else
			{
				return "";
			}
		}
		
	},
	_buildButton: function(label,css,bPressed,bDisabled)
	{
		var btn = $(document.createElement('table'));
		btn.attr('cellspacing','0');
		btn.addClass('x-btn x-btn-noicon');
		if(bPressed) btn.addClass('x-btn-pressed');
		if(bDisabled) btn.addClass('x-item-disabled');
		if(css!=undefined) btn.css(css);
		
		var tbody = $(document.createElement('tbody'));
		tbody.addClass('x-btn-small x-btn-icon-small-left');
		var top = $(document.createElement('tr'));
		top.append('<td class="x-btn-tl"><i>&nbsp;</i></td><td class="x-btn-tc"></td><td class="x-btn-tr"><i>&nbsp;</i></td>');							
		var middle = $(document.createElement('tr'));
		middle.append('<td class="x-btn-ml"><i>&nbsp;</i></td><td class="x-btn-mc"><em class="" unselectable="on"><button class="x-btn-text" type="button">'+label+'</button></em></td><td class="x-btn-mr"><i>&nbsp;</i></td>');
		var bottom = $(document.createElement('tr'));
		bottom.append('<td class="x-btn-bl"><i>&nbsp;</i></td><td class="x-btn-bc"></td><td class="x-btn-br"><i>&nbsp;</i></td>');
		
		tbody.append(top);
		tbody.append(middle);
		tbody.append(bottom);
		btn.append(tbody);
		
		if(!bDisabled)
			btn.hover(function(){$(this).addClass('x-btn-over');},function(){$(this).removeClass('x-btn-over');});
		return btn;
	},
	_buildTabs: function(aViews)
	{
		var tabs = $(document.createElement('div'));
		tabs.addClass('hiu-tabs');
		for(var i = 0; i < aViews.length; i++)
		{
			var tab = this._buildTab(aViews[i],i==0);
			tabs.append(tab);
		}			
		return tabs;
	},
	_buildTab: function(oView,selected)
	{
		var tab = $(document.createElement('div'));
		tab.addClass('hiu-tab');
		if(oView.tab!=undefined)
		{
			if(oView.tab.classnames!=undefined)
			{
				tab.addClass(oView.tab.classnames);
			}
		}
		tab.data("view",oView.name);
		
		var btn = this._buildButton(oView.label,{'width':'100%'},selected,false);
		btn.bind('selectstart',function(){return false;});
		tab.append(btn);
		
		return tab;
	},
	_buildViews: function(f,aViews,attributes,z)
	{
		var dViews = $(document.createElement('div'));
		dViews.addClass('hiu-views');
		if(aViews.length>0)
		{
			dViews.data("view",aViews[0].name);
			for(var i = 0; i < aViews.length; i++)
			{
				var dView = this._buildView(f,aViews[i],attributes,i==0,z);
				dViews.append(dView);
			}
		}
		return dViews;
	},
	_buildView: function(f,oView,attributes,display,z)
	{
		var dView = $(document.createElement('div'));
		dView.addClass('hiu-view');
		dView.data("view",oView.name);
		
		if(!display)
		{
			dView.css("display","none");
		}
		if(oView.type=="select")
		{
			var d1 = attributes[""+oView.list] || attributes.jit; 
			var d2 = CyberGIS.orderArray(CyberGIS.grepArray(d1,oView.where),oView.order);
			
			var select = $(document.createElement('select'));
			select.addClass('hiu-popup-select-page');
			for(var i = 0; i < d2.length; i++)
			{
				var option = $(document.createElement('option'));
				option.val(d2[i][""+oView.select.field]);
				option.html(d2[i][""+oView.select.label]);
				select.append(option);
			}			
			dView.append(select);
			
			var dPages = $(document.createElement('div'));
			dPages.addClass('hiu-popup-pages');
			
			for(var i = 0; i < d2.length; i++)
			{
				var dPage = this._buildPageElement(f,oView.attributes,d2[i],oView.select.field,i==0,z);
				dPages.append(dPage);
			}	
			
			dView.append(dPages);
		}
		else
		{
			var dPages = $(document.createElement('div'));
			dPages.addClass('hiu-popup-pages');
			
			var dPage = this._buildPageElement(f,oView.attributes,attributes,attributes.id,true,z);
			dPages.append(dPage);
			
			dView.append(dPages);
		}
		return dView;
	},
	_buildPage: function(f,ap,av,id,display,z)
	{
		var html = "<div class=\"hiu-popup-page\" data-page=\""+(id==""?"":av[""+id])+"\"";
		if(!display)
		{
			html += " style=\"display: none;\"";
		}
		html += ">";
		html += this.row(f,ap[0],av,z);
		
		for(var i = 1; i < ap.length; i++)
		{
			html += this.row(f,ap[i],av,z);
		}
		html += "</div>";
		return html;
	},
	_buildPageElement: function(f,ap,av,id,display,z)
	{
		var g = f.geometry;
		var dPage = $(document.createElement('div'));
		dPage.addClass('hiu-popup-page');
		dPage.data("page",(id==""?"":av[""+id]));
		if(!display)
		{
			dPage.css("display","none");
		}
		for(var i = 0; i < ap.length; i++)
		{
			var dRow = $(document.createElement('div'));
			if(CyberGIS.isString(ap[i]))
			{
				if(ap[i].toLowerCase()=="br")
				{
					dRow.addClass('hiu-popup-row hiu-popup-row-break'); 
					dRow.html("<br>");
				}
				else if(ap[i].toLowerCase()=="hr")
				{
					dRow.addClass('hiu-popup-row hiu-popup-row-break'); 
					dRow.html("<hr>");
				}
			}
			else
			{
				
				if(ap[i].type=="hr")
				{
					dRow.addClass('hiu-popup-row hiu-popup-row-break'); 
					dRow.html("<hr>");
				}
				else if(ap[i].type=="br")
				{
					dRow.addClass('hiu-popup-row hiu-popup-row-break'); 
					dRow.html("<br>");
				}
				else if(ap[i].type=="link")
				{
					dRow.addClass('hiu-popup-row'); 
					var html = "";
					if(CyberGIS.hasLabel(ap[i]))
					{
						html += "<span class=\"hiu-popup-row-label\">"+CyberGIS.getLabel(ap[i],av)+": </span>";
					}
					html += "<span class=\"hiu-popup-row-value\">"+CyberGIS.getLink(ap[i])+"</span>";
					dRow.html(html);
				}
				else if(ap[i].type=="heading")
				{
					dRow.addClass('hiu-popup-row hiu-popup-row-heading'); 
					var html = "";
					if(CyberGIS.hasLabel(ap[i]))
					{
						html += "<span class=\"hiu-popup-row-heading-label\">"+CyberGIS.getLabel(ap[i],av)+"</span>";
					}
					dRow.html(html);
				}
				else if(ap[i].type=="subheading")
				{
					dRow.addClass('hiu-popup-row hiu-popup-row-subheading'); 
					var html = "";
					if(CyberGIS.hasLabel(ap[i]))
					{
						html += "<span class=\"hiu-popup-row-subheading-label\">"+CyberGIS.getLabel(ap[i],av)+"</span>";
					}
					dRow.html(html);
				}
				else
				{
					dRow.addClass('hiu-popup-row'); 
					var html = "";
					if(CyberGIS.hasLabel(ap[i]))
					{
						html += "<span class=\"hiu-popup-row-label\">"+CyberGIS.getLabel(ap[i],av)+": </span>";
					}
					html += "<span class=\"hiu-popup-row-value\">"+CyberGIS.getAttribute(f.layer.map.projection,ap[i],av,g,z)+"</span>";
					dRow.html(html);
				}
			}

			dPage.append(dRow);
		}
		return dPage;
	},	
	_buildFallback: function(c,f,attributes,layer)
	{
		var message = "";
		
		var z = $.inArray(layer.map.resolution,layer.map.resolutions);
		
		message += this.title(attributes,c.title);
		message += "\n===============\n";
		if(c.type=="advanced")
		{
			var aViews = c.views;
			if(aViews!=undefined)
			{
				if($.isArray(aViews))
				{
					if(aViews.length>0)
					{
						var a = [];
						for(var i = 0; i < aViews.length; i++)
						{
							var oView = aViews[i];
							if(oView.fallback)
							{
								var b = "";
								b += "###"+oView.label+"\n";
								
								if(oView.type=="select")
								{
									b += "This view is too complex to degrad gracefully.";
								}
								else
								{
									var c = [];
									for(var j = 0; j < oView.attributes.length; j++)
									{
										var d = "";
										var ap = oView.attributes[j];
										if(CyberGIS.hasLabel(ap))
										{
											d += CyberGIS.getLabel(ap,attributes)+": ";
										}
										d += CyberGIS.getAttribute(f.layer.map.projection,ap,attributes,f.geometry,z);
										c.push(d);
									}
									b += c.join("\n");
								}
								a.push(b);
							}						
						}
						message += a.join("\n===============\n");
					}
				}
			}						
		}
		else
		{
			var an = c.attributes;
			var av = attributes;				
			message += this.page(f,an,av,"",true,z);
		}
		return message;
	},
	
	/* Public Functions*/
	hasPopup: function()
	{
		return CyberGIS.getJSON(["layers",""+sLayer,"popup"],this.carto_app)!=undefined;
	},
	openPopup: function(f,layer,attributes,anchorLocation,anchorPosition,onClose)
	{
		var p = undefined;/* GeoExt.AdvancedPopup*/
		
		var c = this._configuration(layer.proto);
		if(c!=undefined)
		{
			if(GeoExt!=undefined)
			{
				if(GeoExt.AdvancedPopup!=undefined)
				{
					var aViews = c.views;
					var an = c.attributes;
					var av = attributes;
					var j = layer.options.jit;
					var html = '';
					var t = '';
					
					var z = $.inArray(layer.map.resolution,layer.map.resolutions);
					
					if(c.type=="advanced")
					{
						t = this._buildTitle(attributes,c.title);
						html += '<div class="hiu-popup">';
						html += '</div>';
					}
					else
					{
						t = this._buildTitle(attributes,c.title);
						html += '<div class="hiu-popup">';
						html += '<div class="hiu-popup-pages">';
						if($.isArray(an))
						{
							if(an.length>0)
							{
								html += this.page(f,an,av,"",true,z);
							}
						}
						html += '</div>';
						html += '</div>';
					}
					
					p = new GeoExt.AdvancedPopup({'map':layer.map,'anchorPosition':anchorPosition,'title':t,'location': anchorLocation,'width':c.width,'height':c.height,'html': html});
					p.on({close:onClose});
					p.show(); 
					
					var jqPopup = $('.hiu-popup').parents(".gx-popup").last();
					
					if(c.opacity!=undefined)
					{
						jqPopup.css('opacity',c.opacity);
					}
					
					jqPopup.on("click","a",this.client,function(evt)
					{
						return evt.data.externalLinkClicked.apply(evt.data,[$(this)]);
					});
					
					if(c.type=="advanced")
					{
						if(aViews!=undefined)
						{
							if($.isArray(aViews))
							{
								if(aViews.length>0)
								{
									var body = $(".hiu-popup",jqPopup);
									
									var tabs = this._buildTabs(aViews);
									body.append(tabs);
									
									body.append("<br><br>");
									
									var views = this._buildViews(f,aViews,av,z);
									body.append(views);
									
									$('.hiu-tabs .hiu-tab',body).click(function()
									{
										var newView = $(this).data('view');
										var currentView = $('.hiu-views',body).data('view');
										
										if(newView!=currentView)
										{
											$('.hiu-views',body).data('view',newView);
											$('.hiu-tabs .hiu-tab',body).each(function()
											{
												if($(this).data('view')==newView)
													$('.x-btn',this).addClass('x-btn-pressed');
												else
													$('.x-btn',this).removeClass('x-btn-pressed');
											});
											
											$('.hiu-views .hiu-view',body).each(function()
											{
												$(this).css('display',(($(this).data('view')==newView)?'':'none'));
											});
										}
									});
								}
							}
						}					
					}
					
					jqPopup.keypress(function(keyevent)
					{
						that.unselect(f);
						
						var index = $.inArray(f,that.selection_layer_points.features);
						
						var new_index = undefined;
						if(keyevent.which==46)//<
							new_index = (index==0)?(that.selection_layer_points.features.length-2):(index-1);
						else if(keyevent.which==44)//>
							new_index = (index==(that.selection_layer_points.features.length-2))?0:(index+1);
						
						if(new_index!=undefined)
						{
							var new_feature = that.selection_layer_points.features[new_index];
							that.select(new_feature);//setTimeout(function(){that.select(new_feature);},0);
						}
					});
					$(".hiu-views .hiu-view",jqPopup).each(function()
					{
						var v = this;
						var select = $(".hiu-popup-select-page",v);
						select.data("viewElement",v);
						select.change(function()
						{
							var that = $(this);
							
							var newPage = that.val();
							var v2 = that.data("viewElement");
							var currentPage = $('.hiu-popup-pages',v2).data('page');
							
							if(newPage!=currentPage)
							{
								$('.hiu-popup-pages',v2).data('page',newPage);
								
								$('.hiu-popup-pages .hiu-popup-page',v2).each(function()
								{
									$(this).css('display',(($(this).data('page')==newPage)?'':'none'));
								});
							}
						});
					});
				}
			}
	
			if(p==undefined)
			{
				alert(this._buildFallback(c,f,attributes,layer));
				onClose();
			}
		}
		return p;
	},	
	
	getCarto: function()
	{
		if(this.carto_app!=undefined&&this.carto_library!=undefined)
		{
			return {"layers": this.carto_app.layers, "library": this.carto_library.library};
		}
		else if(this.carto_app!=undefined&&this.carto_library==undefined)
		{
			return {"layers": this.carto_app.layers, "library": undefined};
		}
		else if(this.carto_app==undefined&&this.carto_library!=undefined)
		{
			return {"layers": undefined, "library": this.carto_library.library};
		}
		else
		{
			return {"layers": undefined, "library": undefined};
		}
	},
	
	/*
	 * this.proto.getAllJSON(), this.carto_app.getAllJSON()
	 */
	
	/* -------------- Layer Functions -------------- */

	/* Style Maps */
	styleMap: function(sLayer,sDefault,sSelect,bClassify,bWheelRule)
	{
		var styleMap = undefined;
		
		var defaultStyle = this.style(sLayer,sDefault,OpenLayers.Feature.Vector.style["default"],bClassify,bWheelRule);
		var selectStyle = this.style(sLayer,sSelect,OpenLayers.Feature.Vector.style["select"],bClassify,bWheelRule);
		
		if(defaultStyle!=undefined&&selectStyle!=undefined)
		{
			styleMap = new OpenLayers.StyleMap({'default':defaultStyle,'select':selectStyle});
		}
		else if(defaultStyle!=undefined&&selectStyle==undefined)
		{
			styleMap = new OpenLayers.StyleMap({'default':defaultStyle});
		}
		else
		{
			styleMap = new OpenLayers.StyleMap({'default':OpenLayers.Feature.Vector.style["default"]});
		}			
		return styleMap;
	},
	styles: function(sLayer)
	{
		var defaultStyle = this.style(sLayer,"default",OpenLayers.Feature.Vector.style["default"],true,true);
		var wheelStyle = this.style(sLayer,"wheel",OpenLayers.Feature.Vector.style["default"],true,true);
		var selectStyle = this.style(sLayer,"select",OpenLayers.Feature.Vector.style["select"],true,true);
			
		return {"defaultStyle": defaultStyle, "wheelStyle": wheelStyle, "selectStyle": selectStyle};
	},
	style: function(sLayer,sIntent,defaultSymbolizerObject,bClassify,bWheelRule)
	{
		var style = undefined;
		var oIntent = CyberGIS.getJSON(["layers",sLayer,"style","intents",sIntent],this.carto_app);
		
		if(oIntent!=undefined)
		{
			var symbolizerObject = {};
			
			if(oIntent.properties!=undefined)
			{
				symbolizerObject = OpenLayers.Util.applyDefaults(OpenLayers.Util.extend({},symbolizerObject),oIntent.properties);
			}
			
			if(oIntent.templates!=undefined)
			{
				if($.isArray(oIntent.templates))
				{
					for(var i = 0; i < oIntent.templates.length; i++)
					{
						var a = oIntent.templates[i];
						var oTemplate = CyberGIS.getJSON(["library","templates",""+a.ns,""+a.id],this.carto_library);
						symbolizerObject = OpenLayers.Util.applyDefaults(OpenLayers.Util.extend({},symbolizerObject),oTemplate);
					}
				}
				else if(typeof oIntent.templates == "string")
				{
					var a = oIntent.templates.split(",");
					for(var i = 0; i < a.length; i++)
					{
						var b = a[i].split(":");
						var ns = $.trim(b[0]);
						var id = $.trim(b[1]);
						var oTemplate = CyberGIS.getJSON(["library","templates",""+ns,""+id],this.carto_library);
						symbolizerObject = OpenLayers.Util.applyDefaults(OpenLayers.Util.extend({},symbolizerObject),oTemplate);
					}
				}
			}
			
			if(defaultSymbolizerObject!=undefined)
			{
				symbolizerObject = OpenLayers.Util.applyDefaults(OpenLayers.Util.extend({},symbolizerObject),defaultSymbolizerObject);
			}
					
			style = new OpenLayers.Style(symbolizerObject,{"hideIfNoRules":false});
			if(bClassify==true)
			{
				var classifiers = this.classifiers(sLayer);//if classifiers is zero doesn't run iteration
				for(var i = 0; i < classifiers; i++)
				{
					var rules = this.rules(sLayer,sIntent,i);
					if(rules!=undefined)
						style.addRules(rules);
				}
			}

			if(bWheelRule)
			{
				var wheelRule = this.rule(OpenLayers.Filter.Comparison.EQUAL_TO,"wheel","on",{"display":"none","pointRadius":0});
				style.addRules([wheelRule]);
			}
		}
		return style;
	},	
	
	closeStyleMap: function(sLayer)
	{
		var defaultStyle = this.style(sLayer,"close",OpenLayers.Feature.Vector.style["default"],false,false);
		var styleMap = new OpenLayers.StyleMap({'default':defaultStyle});
		return styleMap;
	},
	
	/* Rules */
	rules: function(sLayer,sIntent,iClassifier)
	{			
		var rules = [];
		var oClassifier = CyberGIS.getJSON(["layers",sLayer,"classifications",""+iClassifier],this.carto_app);
		var sField = this.field(sLayer,iClassifier);
		
		if(oClassifier.type=="single")
		{
			var sValue = oClassifier.value;
			var symbolizerObject = oClassifier.style;
			if(symbolizerObject!=null)
			{
				var rule = this.rule(OpenLayers.Filter.Comparison.EQUAL_TO,sField,sValue,oClassifier.style);
				rules.push(rule);
			}	
		}
		else if(oClassifier.type=="comparison")
		{
			var sValue = oClassifier.value;
			var sFilterType = oClassifier.op;
			var symbolizerObject = oClassifier.style;
			if(symbolizerObject!=null)
			{
				var rule = this.rule(sFilterType,sField,sValue,oClassifier.style);
				rules.push(rule);
			}
		}
		else //oClassifier.type=="basic"
		{
			var aClass = this.getClassNames(sLayer,oClassifier);
			var symbolizerObject = this.getSymbolizerObject(sLayer,sIntent,oClassifier,"default");
			if(symbolizerObject!=null)
			{
				var rule = new OpenLayers.Rule({symbolizer: symbolizerObject,context: undefined,filter: new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.IS_NULL,property: sField})});
				rules.push(rule);
			}
			
			//Rule for each Class
			if(aClass!=undefined)
			{
				for(var i = 0; i < aClass.length; i++)
				{
					var sClass = aClass[i];
					var symbolizerObject = this.getSymbolizerObject(sLayer,sIntent,oClassifier,sClass);
					if(symbolizerObject!=null)
					{
						var rule = this.rule(OpenLayers.Filter.Comparison.EQUAL_TO,sField,sClass,symbolizerObject);
						rules.push(rule);
					}				
				}
			}
		}		
		return rules;
	},
	rule: function(sFilterType,sPropertyName,sPropertyValue,symbolizerObject)
	{
		var r = undefined;
		r = new OpenLayers.Rule
		({
            symbolizer: symbolizerObject,
            context: undefined,
            filter: new OpenLayers.Filter.Comparison({type: sFilterType, property: sPropertyName,value: sPropertyValue})
		});
		return r;
	},
	field: function(sLayer,iClassifier)
	{
		var f = undefined;
		
		var json = CyberGIS.getJSON(["layers",sLayer,"classifications",iClassifier,"field"],this.carto_app);
		if(json!=undefined)
		{
			if($.inArray(json,["null","default","undefined"])==-1)
			{
				f = json;
			}
		}
		
		return f;
	},
	
	/* Classification */
	classifiers: function(sLayer)
	{
		var classifiers = 0;
		
		var json = CyberGIS.getJSON(["layers",sLayer,"classifications"],this.carto_app);
		if(json!=undefined)
		{
			classifiers = json.length;
		}
		else
		{
			classifiers = 0;
		}
		
		return classifiers;
	},
	getClassNames: function(sLayer,oClassifier)
	{
		var c = [];
		
		if(oClassifier.type=="single")
		{
			var d = oClassifier["data"];
			$.each(d,function(sClass,v)
			{
				c.push(sClass);
			});
		}
		else if(oClassifier.type=="comparison")
		{
			var d = oClassifier["data"];
			$.each(d,function(sClass,v)
			{
				c.push(sClass);
			});
		}
		else //oClassifier.type=="basic"
		{
			var d = oClassifier["data"];
			$.each(d,function(sClass,v)
			{
				if(sClass!="default")
				{
					c.push(sClass);
				}
			});
		}		
		return c;
	},
	
	/* Symbolizer */
	getSymbolizerObject: function(sLayer,sIntent,oClassifier,sClass)
	{
		var d = undefined;
		if(oClassifier!=undefined)
		{
			if(oClassifier.type=="single"||oClassifier.type=="comparison")
			{
				d = oClassifier.style;
			}
			else// oClassifier.type=="basic"
			{
				if(oClassifier["data"])
				{
					if(oClassifier["data"][""+sClass]!=undefined)
					{
						var a = CyberGIS.getJSON(["data",sClass,"style"],oClassifier);
						d = a[""+sIntent] || a["default"];
					}
					else
					{
						if(oClassifier["data"]["default"]!=undefined)
						{
							if(oClassifier["data"]["default"]["style"]!=undefined)
							{
								var a = CyberGIS.getJSON(["data","default","style"],oClassifier);
								d = a[""+sIntent] || a["default"];
							}
							else
							{
								d = {};
							}	
						}
						else
						{
							d = {};
						}							
					}
				}
			}
			
		}
		return d;
	},		
	
	destroy: function ()
	{

	},
	CLASS_NAME: "CyberGIS.Carto.Basic"
});
