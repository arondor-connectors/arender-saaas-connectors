<import resource="classpath:/alfresco/templates/org/alfresco/import/alfresco-util.js">

function getPluginConditions(xmlConfig)
{
   // Create a json representation of the conditions that will be used to decide which previewer that shall be used
   var pluginConditions = [], conditionNode, pluginNode, condition, plugin, attribute;
   if (xmlConfig && xmlConfig["plugin-conditions"])
   {
      for each (conditionNode in xmlConfig["plugin-conditions"].elements("condition"))
      {
         condition =
         {
            attributes: {},
            plugins: []
         };

         for each (attribute in conditionNode.attributes())
         {
            condition.attributes[attribute.name()] = attribute.text();
         }

         for each (pluginNode in conditionNode.elements("plugin"))
         {
            plugin =
            {
               name: pluginNode.text(),
               attributes: {}
            };
            for each (attribute in pluginNode.attributes())
            {
               plugin.attributes[attribute.name()] = attribute.text();
            }
            condition.plugins.push(plugin);
         }
         pluginConditions.push(condition);
      }
      return pluginConditions;
   }
}

function hasPDFRendition(nodeRef)
{
	var json = remote.call("/slingshot/doclib/node/" +nodeRef.replace(/:\//g, "") + "/preview");
	var resJSON = eval('(' + json + ')');
	return (resJSON.hasPDFRendtion == "true")
}

function checkHasRendition(nodeMetadata)
{
	var mimeTypeList = null;
	var arenderConfig = config.scoped["Arender"];
	if (arenderConfig != null && arenderConfig.mimeTypeList != null)
	{
		mimeTypeList = config.scoped["ARender"].mimeTypeList.value.split(",");
		mimeTypeList = mimeTypeList.filter(function(e){return e;});
		for (var i = 0; i < mimeTypeList.length; i++)
		{
			mimeTypeList[i] = mimeTypeList[i].trim();
		}
	}
	if (mimeTypeList == null || mimeTypeList.length == 0)
	{
		mimeTypeList = ["image/vnd.dwg", "image/x-dwg" , "image/x-dwf", "image/x-dwt", "image/vnd.dwt", "image/x-vnd.dwt", "image/x-dxf", "image/vnd.dwg", "image/vnd.dxf", "model/vnd.dwf", "image/vnd.dgn", "image/x-vnd.dgn"];
	}
	if(mimeTypeList.indexOf(nodeMetadata.mimeType) >=0)
	{
		return true;
	}	
	else
	{
		return false;
	}
}

function getNodeMetadata(proxy, api, nodeRef)
{

   var result = remote.connect(proxy).get("/" + api + "/node/" + nodeRef.replace(/:\//g, "") + "/metadata"),
      node;
   if (result.status == 200)
   {
      var nodeMetadata = eval('(' + result + ')');
      node = {};
      node.name = nodeMetadata.name || nodeMetadata.title;
      node.mimeType = nodeMetadata.mimetype;
      node.size = nodeMetadata.size || "0";
      node.thumbnailModifications = nodeMetadata.lastThumbnailModificationData;
      node.thumbnails = nodeMetadata.thumbnailDefinitions;
   }
   return node;
}

function main()
{
   // Populate model with parameters
   AlfrescoUtil.param("nodeRef");
   AlfrescoUtil.param("api", "api");
   AlfrescoUtil.param("proxy", "alfresco");
   AlfrescoUtil.param("version","");
 
   // Populate model with data from repo
   var nodeMetadata = getNodeMetadata(model.proxy, model.api, model.nodeRef);
   if (nodeMetadata)
   {
      // Populate model with data from node and config
      model.node = true;
      var pluginConditions = getPluginConditions(new XML(config.script));
      var pluginConditionsJSON = jsonUtils.toJSONString(pluginConditions);

	  // Get ticket session
	  var json = remote.call("/slingshot/doclib/action/ticket");
	  var resJSON = eval('(' + json + ')');
	  model.ticket=resJSON.ticket;

	// Get username 
	  var jsonUser = remote.call("/slingshot/doclib/action/user");
	  var resJSONUser = eval('(' + jsonUser + ')');
	  model.user=resJSONUser.userName;
	  
	  // Get ARender ID
	  var jsonUUID = remote.call("/slingshot/doclib/action/arenderUpload?nodeRef="+ model.nodeRef);
	  var resjsonUUID = eval('(' + jsonUUID + ')');
	  model.uuid=resjsonUUID.UUID;
	  
	  var renditionReady = true;
	  
	  var arenderConfig = config.scoped["Arender"];
  	  var arenderUrl = null;
	  if (arenderConfig == null) 
	  {
	  	  arenderUrl = "https://saas.arender.io/";
  	  }
	  else if (arenderConfig.url != null)
	  {
	      arenderUrl = arenderConfig.url.value;
  	  }
	  if (arenderUrl == null)
	  {
		  arenderUrl = "https://saas.arender.io/";
	  }
	  
	  if( checkHasRendition(nodeMetadata) && !hasPDFRendition(model.nodeRef))
	  {
		  renditionReady = false;
	  }	  
	  
      // Widget instantiation metadata...
      var webPreview = {
         id : "WebPreview",
         name : "Alfresco.WebPreview",
         options : {
            thumbnailModification : nodeMetadata.thumbnailModifications,
            nodeRef : model.nodeRef,
            documentVersion : model.version,
            name : nodeMetadata.name,
            mimeType : nodeMetadata.mimeType,
            size: nodeMetadata.size,
			renditionReady : renditionReady,
			arenderUrl : arenderUrl,
            thumbnails : nodeMetadata.thumbnails,
            pluginConditions : pluginConditionsJSON,
            api: model.api,
            proxy: model.proxy,
            ticket: resJSON.ticket,
            user: resJSONUser.userName,
            uuid : resjsonUUID.UUID
         }
      };
      model.widgets = [webPreview];
   }
}

// Start the webscript
main();

// Set the group from the component property...
model.dependencyGroup =  (args.dependencyGroup != null) ? args.dependencyGroup : "web-preview";
