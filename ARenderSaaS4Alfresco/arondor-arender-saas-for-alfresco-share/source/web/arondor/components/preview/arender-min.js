(function(){Alfresco.WebPreview.prototype.Plugins.Arender=function(wp,attributes){this.wp=wp;this.attributes=YAHOO.lang.merge(Alfresco.util.deepCopy(this.attributes),attributes);return this;};Alfresco.WebPreview.prototype.Plugins.Arender.prototype={attributes:{srcMaxSize:"2000000"},report:function Arender_report(){if(this.wp.options.nodeRef.indexOf("workspace://SpacesStore")!=0){return"Invalid nodeRef Parameter";}},display:function Arender_display(){if(this.wp.options.renditionReady==true){return'<iframe src="'+this.wp.options.arenderUrl+"/ARender.jsp?api-key=baseApiKey&user="+this.wp.options.user+"&uuid="+this.wp.options.uuid+'" allowfullscreen ></iframe>';}else{return'<div class="wait">rendition not ready, page will refresh in 5 seconds...</div><img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="window.setTimeout(function () {window.location.reload(false)},5000);">';}}};})();