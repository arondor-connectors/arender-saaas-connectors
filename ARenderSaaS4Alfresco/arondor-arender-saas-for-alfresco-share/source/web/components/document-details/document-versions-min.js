(function(){var Dom=YAHOO.util.Dom,Event=YAHOO.util.Event,Selector=YAHOO.util.Selector;var $html=Alfresco.util.encodeHTML,$userProfileLink=Alfresco.util.userProfileLink,$userAvatar=Alfresco.Share.userAvatar;Alfresco.DocumentVersions=function DocumentVersions_constructor(htmlId){Alfresco.DocumentVersions.superclass.constructor.call(this,"Alfresco.DocumentVersions",htmlId,["datasource","datatable","paginator","history","animation"]);YAHOO.Bubbling.on("metadataRefresh",this.doRefresh,this);return this;};YAHOO.extend(Alfresco.DocumentVersions,Alfresco.component.Base,{options:{nodeRef:null,siteId:"",containerId:null,allowNewVersionUpload:false},latestVersion:null,versionCache:null,onReady:function DocumentVersions_onReady(){var containerElement=Dom.get(this.id+"-olderVersions");if(!containerElement){return;}this.widgets.alfrescoDataTable=new Alfresco.util.DataTable({dataSource:{url:Alfresco.constants.PROXY_URI+"api/version?nodeRef="+this.options.nodeRef,doBeforeParseData:this.bind(function(oRequest,oFullResponse){this.latestVersion=oFullResponse.splice(0,1)[0];Dom.get(this.id+"-latestVersion").innerHTML=this.getDocumentVersionMarkup(this.latestVersion);this.versionCache=oFullResponse;return({data:oFullResponse});})},dataTable:{container:this.id+"-olderVersions",columnDefinitions:[{key:"version",sortable:false,formatter:this.bind(this.renderCellVersion)}],config:{MSG_EMPTY:this.msg("message.noVersions")}}});this.widgets.alfrescoDataTable.getDataTable().subscribe("renderEvent",function(){this.resizeHistoryDetails();},this,this);Event.addListener(window,"resize",function(){this.resizeHistoryDetails();},this,true);},resizeHistoryDetails:function DocumentVersions_resizeHistoryDetails(){var width=(Dom.getViewportWidth()*0.25)+"px",nodes=YAHOO.util.Selector.query("h3.thin",this.id+"-body");for(var i=0;i<nodes.length;i++){nodes[i].style.width=width;}width=(Dom.getViewportWidth()*0.25-40)+"px",nodes=YAHOO.util.Selector.query("div.version-details-right",this.id+"-body");for(var i=0;i<nodes.length;i++){nodes[i].style.width=width;}},renderCellVersion:function DocumentVersions_renderCellVersions(elCell,oRecord,oColumn,oData){elCell.innerHTML=this.getDocumentVersionMarkup(oRecord.getData());},getDocumentVersionMarkup:function DocumentVersions_getDocumentVersionMarkup(doc){var downloadURL=Alfresco.constants.PROXY_URI+"api/node/content/"+doc.nodeRef.replace(":/","")+"/"+doc.name+"?a=true",html="";var showVersionUrl=this.getShowVersionUrl(doc.label);html+='<div class="version-panel-left">';html+='   <span class="document-version"><a href="'+showVersionUrl+'">'+$html(doc.label)+"</a></span>";html+="</div>";html+='<div class="version-panel-right">';html+='   <h3 class="thin dark" style="width:'+(Dom.getViewportWidth()*0.25)+'px;">'+$html(doc.name)+"</h3>";html+='   <span class="actions">';if(this.options.allowNewVersionUpload){html+='   <a href="#" name=".onRevertVersionClick" rel="'+doc.label+'" class="'+this.id+' revert" title="'+this.msg("label.revert")+'">&nbsp;</a>';}html+='      <a href="'+downloadURL+'" target="_blank" class="download" title="'+this.msg("label.download")+'">&nbsp;</a>';html+='		<a href="#" name=".onViewHistoricPropertiesClick" rel="'+doc.nodeRef+'" class="'+this.id+' historicProperties" title="'+this.msg("label.historicProperties")+'">&nbsp;</a>';html+='   	<a href="#" name=".onCompareVersionClick" rel="'+doc.label+'" class="'+this.id+' compare" title="'+this.msg("label.compareversion")+'">&nbsp;</a>';html+="   </span>";html+='   <div class="clear"></div>';html+='   <div class="version-details">';html+='      <div class="version-details-left">';html+=$userAvatar(doc.creator.userName,32);html+="      </div>";html+='      <div class="version-details-right">';html+=$userProfileLink(doc.creator.userName,doc.creator.firstName+" "+doc.creator.lastName,'class="theme-color-1"')+" ";html+=Alfresco.util.relativeTime(Alfresco.util.fromISO8601(doc.createdDateISO))+"<br />";html+=((doc.description||"").length>0)?$html(doc.description,true):'<span class="faded">('+this.msg("label.noComment")+")</span>";html+="      </div>";html+="   </div>";html+="</div>";html+='<div class="clear"></div>';return html;},getShowVersionUrl:function DocumentVersions_getShowVersionUrl(version){var showVersionUrl=window.location.href;var urlObject=Alfresco.util.parseURL(showVersionUrl);if(urlObject.queryParams.version){var motif="&version="+urlObject.queryParams.version;showVersionUrl=showVersionUrl.replace(motif,"&version="+version);}else{showVersionUrl=showVersionUrl+"&version="+version;}return showVersionUrl;},onRevertVersionClick:function DocumentVersions_onRevertVersionClick(version){Alfresco.module.getRevertVersionInstance().show({filename:this.latestVersion.name,nodeRef:this.options.nodeRef,version:version,onRevertVersionComplete:{fn:this.onRevertVersionComplete,scope:this}});},onCompareVersionClick:function DocumentVersions_onCompareVersionClick(version){Alfresco.module.getCompareVersionInstance().show({filename:this.latestVersion.name,nodeRef:this.options.nodeRef,version:version,onCompareVersionComplete:{fn:this.onCompareVersionComplete,scope:this}});},onRevertVersionComplete:function DocumentVersions_onRevertVersionComplete(){Alfresco.util.PopupManager.displayMessage({text:this.msg("message.revertComplete")});YAHOO.Bubbling.fire("previewChangedEvent");YAHOO.Bubbling.fire("metadataRefresh",{});},onCompareVersionComplete:function DocumentVersions_onCompareVersionComplete(){Alfresco.util.PopupManager.displayMessage({text:this.msg("message.compareComplete")});YAHOO.Bubbling.fire("previewChangedEvent");YAHOO.Bubbling.fire("metadataRefresh",{});},onViewHistoricPropertiesClick:function DocumentVersions_onViewHistoricPropertiesClick(nodeRef){Alfresco.module.getHistoricPropertiesViewerInstance().show({filename:this.latestVersion.name,currentNodeRef:this.options.nodeRef,latestVersion:this.latestVersion,nodeRef:nodeRef});},onUploadNewVersionClick:function DocumentVersions_onUploadNewVersionClick(){if(!this.modules.fileUpload){this.modules.fileUpload=Alfresco.getFileUploadInstance();}var current=this.latestVersion,displayName=current.name,extensions="*";if(displayName&&new RegExp(/[^\.]+\.[^\.]+/).exec(displayName)){extensions="*"+displayName.substring(displayName.lastIndexOf("."));}this.modules.fileUpload.show({siteId:this.options.siteId,containerId:this.options.containerId,updateNodeRef:this.options.nodeRef,updateFilename:displayName,updateVersion:current.label,overwrite:true,suppressRefreshEvent:true,filter:[{description:this.msg("label.filter-description",displayName),extensions:extensions}],mode:this.modules.fileUpload.MODE_SINGLE_UPDATE,onFileUploadComplete:{fn:this.onNewVersionUploadComplete,scope:this}});},onNewVersionUploadComplete:function DocumentVersions_onNewVersionUploadComplete(complete){if(complete.failed.length==0&&complete.successful.length>0){if(this.options.siteId!=null&&this.options.siteId.length!=0){try{Alfresco.util.Ajax.jsonPost({url:Alfresco.constants.PROXY_URI+"slingshot/doclib/activity",dataObj:{fileName:complete.successful[0].fileName,nodeRef:complete.successful[0].nodeRef,site:this.options.siteId,type:"file-updated",page:"document-details"}});}catch(e){}}YAHOO.lang.later(0,this,function(){window.location=window.location.href.split("?")[0]+"?nodeRef="+complete.successful[0].nodeRef;});}},doRefresh:function DocumentVersions_doRefresh(){YAHOO.Bubbling.unsubscribe("metadataRefresh",this.doRefresh,this);this.refresh("components/document-details/document-versions?nodeRef={nodeRef}"+(this.options.siteId?"&site={siteId}":""));}});})();