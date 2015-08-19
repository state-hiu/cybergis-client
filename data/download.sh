#!/bin/bash
wget 'http://geonode.wfp.org/geoserver/wfs?srsName=EPSG%3A4326&typename=geonode%3Awld_trs_airports_wfp&outputFormat=json&version=1.0.0&service=WFS&request=GetFeature' -O wld_trs_airports_wfp.json
wget 'http://geonode.wfp.org/geoserver/wfs?srsName=EPSG%3A4326&typename=geonode%3Awld_trs_ports_wfp&outputFormat=json&version=1.0.0&service=WFS&request=GetFeature' -O wld_trs_ports_wfp.json
wget 'http://geonode.wfp.org/geoserver/wfs?srsName=EPSG%3A4326&typename=geonode%3Awld_poi_bcp_wfp&outputFormat=json&version=1.0.0&service=WFS&request=GetFeature' -O wld_poi_bcp_wfp.json
