<#assign el=args.htmlid?html>
<div id="${el}-dialog" class="compare-version">
   <div class="hd">
      <span id="${el}-header-span"></span>
   </div>
   <div class="bd">
      <form id="${el}-revertVersion-form" method="POST"
            action="${url.context}/proxy/alfresco/api/revert">
         <div id="${el}-versionSection-div">	
			<div class="yui-gd">
               <div class="yui-u first">
                  <label for="${el}-sourceversion-label">${msg("label.sourceversion")}</label>
               </div>
               <div class="yui-u">
			      <label id="${el}-sourceversion-label">${sourceversion}</label>
               </div>
            </div>
			<div class="yui-gd">
               <div class="yui-u first">
                  <label for="${el}-targetversion-dropdown">${msg("label.targetversion")}</label>
               </div>
               <div class="yui-u">
					<select id="${el}-targetversion-dropdown" name="targetversion">
						<#list versions as targetVersion>
							<option value="${targetVersion.label}">${targetVersion.label}</option>
						</#list>
					</select>
               </div>
            </div>
         </div>

         <div class="bdft">
            <input id="${el}-ok-button" type="button" value="${msg("button.ok")}" />
            <input id="${el}-cancel-button" type="button" value="${msg("button.cancel")}" />
         </div>

      </form>

   </div>
</div>

<script type="text/javascript">//<![CDATA[
Alfresco.util.addMessages(${messages}, "Alfresco.module.CompareVersion");
//]]></script>
