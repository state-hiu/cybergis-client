OpenLayers.Protocol.SOAP = OpenLayers.Class(OpenLayers.Protocol.HTTP,
{
   	list: undefined,
   	columns: undefined,
   	//['id','Title','Entered','Source','URL','Description','Region','TypeOfItem','Category','Latitude','Longitude']
   	
	initialize: function(options)
    {
   		OpenLayers.Protocol.HTTP.prototype.initialize.apply(this, [options]);
    },
    
    buildEnvelope: function(list,columns,query)
    {
    	var soap = '';
    	soap +=	'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
    	soap +=		'<soap:Body>';
    	soap +=			'<GetListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">';
    	soap +=				'<listName>'+list+'</listName>';
    	soap +=				'<rowLimit>'+1000+'</rowLimit>';
    	if(columns!=undefined)
    	{
        	soap +=				'<viewFields><ViewFields>';
    		$.each(columns,function(index,value){soap +='<FieldRef Name="'+value+'"/>';});
    		soap += 				'</ViewFields></viewFields>';
    	}
    	if(query!=undefined)
    	{
    		soap +=				'<query>'+query+'</query>';
    	}
    	soap +=				'<queryOptions><QueryOptions><IncludeAttachmentUrls>TRUE</IncludeAttachmentUrls></QueryOptions></queryOptions>';
    	soap +=			'</GetListItems>';
    	soap +=		'</soap:Body>';
    	soap +=	'</soap:Envelope>';
    	
    	return soap;
    },
    parseFeatures: function(request)
    {
    	 return this.format.read(request.responseText,this.columns);
    },
    read: function(options)
    {
    	OpenLayers.Protocol.prototype.read.apply(this, arguments);
    	options = OpenLayers.Util.extend({}, options);
    	OpenLayers.Util.applyDefaults(options, this.options || {});
    	var response = new OpenLayers.Protocol.Response({requestType: "read"});
         
    	options.headers = {"Accept":"application/xml, text/xml, */*, q=0.01","Content-Type":"text/xml; charset=\"UTF-8\""};
    	
    	var data = this.buildEnvelope(this.list,this.columns,undefined);
		
		response.priv = OpenLayers.Request.POST
		({
			authenticated: (options.authenticated==true),
			url: options.url,
			callback: this.createCallback(this.handleRead, response, options),
			params: options.params,
			headers: options.headers,
			data: data
		});
		
		return response;
    },
      
    CLASS_NAME: "OpenLayers.Protocol.SOAP"
});
