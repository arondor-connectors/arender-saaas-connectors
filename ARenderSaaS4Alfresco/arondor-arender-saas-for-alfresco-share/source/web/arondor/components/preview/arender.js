/**
 * Docayo 2015
 */

/**
 * Arender plug in
 *
 *
 * @namespace Alfresco.WebPreview.prototype.Plugins
 * @class Alfresco.WebPreview.prototype.Plugins.Arender
 */
(function()
{
    /**
     * Arender plug-in constructor
     *
     * @param wp {Alfresco.WebPreview} The Alfresco.WebPreview instance that decides which plugin to use
     * @param attributes {Object} Arbitrary attributes brought in from the <plugin> element
     */
    Alfresco.WebPreview.prototype.Plugins.Arender = function(wp, attributes)
    {
       this.wp = wp;
       this.attributes = YAHOO.lang.merge(Alfresco.util.deepCopy(this.attributes), attributes);
       return this;
    };
    
    Alfresco.WebPreview.prototype.Plugins.Arender.prototype =
    {
       /**
        * Attributes
        */
       attributes:
       {
          /**
           * Maximum size to display given in bytes if the node's content is used.
           * If the node content is larger than this value the image won't be displayed.
           * Note! This doesn't apply if src is set to a thumbnail.
           *
           * @property srcMaxSize
           * @type String
           * @default "2000000"
           */
          srcMaxSize: "2000000"
       },
    
       /**
        * Tests if the plugin can be used in the users browser.
        *
        * @method report
        * @return {String} Returns nothing if the plugin may be used, otherwise returns a message containing the reason
        *         it cant be used as a string.
        * @public
        */
       report: function Arender_report()
       {
   		if(this.wp.options.nodeRef.indexOf("workspace://SpacesStore") != 0)
		{
			 return "Invalid nodeRef Parameter"
		}
       },
    
       /**
        * Display the node.
        *
        * @method display
        * @public
        */
       display: function Arender_display()
       {
    	   if(this.wp.options.renditionReady == true )
		   {
    		   // call remote cloud service
    		   return '<iframe src="' + this.wp.options.arenderUrl + '/ARender.jsp?api-key=baseApiKey&user=' + this.wp.options.user + '&uuid='+ this.wp.options.uuid + '" allowfullscreen ></iframe>';
		   }
    	   
		   else {
			   return '<div class="wait">rendition not ready, page will refresh in 5 seconds...</div><img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="window.setTimeout(function () {window.location.reload(false)},5000);">'
		   }
       }
    };

})();
