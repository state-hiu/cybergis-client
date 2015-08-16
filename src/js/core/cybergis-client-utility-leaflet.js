CyberGIS.Utility.Leaflet =
{
	buildCenter: function(element,pX,pY,pLon,pLat,url,fallback)
        {
                var qs_q = CyberGIS.getParameterAsIntegerArray(["q","query"],url,",");
                if(qs_q!=null)
                {
                        if(qs_q.length>=3)
                        {
                                //center = ol.proj.transform([qs_q[1],qs_q[0]],'EPSG:4326','EPSG:3857');
                                center = [0,0]
                        }
                }
                else
                {
                        var qs_lon = CyberGIS.getParameterAsDouble(["lon","longitude"],url,undefined);
                        var qs_lat = CyberGIS.getParameterAsDouble(["lat","latitude"],url,undefined);
                        if(qs_lon!=undefined&&qs_lat!=undefined)
                        {
                                //center = ol.proj.transform([qs_lon,qs_lat],'EPSG:4326','EPSG:3857');
                                center = [0,0]
                        }
                        else
                        {
                                if(pX!=undefined&&pY!=undefined)
                                {
                                        center = [px,pY];
                                }
                                else if(pLon!=undefined&&pLat!=undefined)
                                {
                                        //center = ol.proj.transform([pLon,pLat],'EPSG:4326','EPSG:3857');
                                        center = [0,0]
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
                                                //center = ol.proj.transform([eLon,eLat],'EPSG:4326','EPSG:3857');
                                                center = [0,0]
                                        }
                                        else
                                        {
                                                center = fallback;
                                        }
                                }
                        }
                }
                return center;
        }
};
