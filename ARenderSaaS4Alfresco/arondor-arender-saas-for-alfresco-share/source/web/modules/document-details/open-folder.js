/**
 * Copyright (C) 2005-2010 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * OpenFolder component.
 * 
 * Popups a YUI panel and lets the user choose version to compare against
 * 
 * @namespace Alfresco.module
 * @class Alfresco.module.OpenFolder
 */
(function() {
	/**
	 * OpenFolder constructor.
	 * 
	 * OpenFolder is considered a singleton so constructor should be treated
	 * as private, please use Alfresco.module.getOpenFolderInstance()
	 * instead.
	 * 
	 * @param {string}
	 *            htmlId The HTML id of the parent element
	 * @return {Alfresco.module.OpenFolder} The new OpenFolder instance
	 * @constructor
	 * @private
	 */
	Alfresco.module.OpenFolder = function(containerId) {
		this.name = "Alfresco.module.OpenFolder";
		this.id = containerId;

		var instance = Alfresco.util.ComponentManager.get(this.id);
		if (instance !== null) {
			throw new Error(
					"An instance of Alfresco.module.OpenFolder already exists.");
		}

		/* Register this component */
		Alfresco.util.ComponentManager.register(this);

		// Load YUI Components
		Alfresco.util.YUILoaderHelper.require([ "button", "container",
				"datatable", "datasource" ], this.onComponentsLoaded, this);

		return this;
	};

	Alfresco.module.OpenFolder.prototype = {

		/**
		 * The default config for the gui state for the revert dialog. The user
		 * can override these properties in the show() method.
		 * 
		 * @property defaultShowConfig
		 * @type object
		 */
		defaultShowConfig : {
			nodeRef : null,
			filename : null,
			version : null,
			onOpenFolderComplete : null
		},

		/**
		 * The merged result of the defaultShowConfig and the config passed in
		 * to the show method.
		 * 
		 * @property defaultShowConfig
		 * @type object
		 */
		showConfig : {},

		/**
		 * Object container for storing YUI widget and HTMLElement instances.
		 * 
		 * @property widgets
		 * @type object
		 */
		widgets : {},

		/**
		 * Fired by YUILoaderHelper when required component script files have
		 * been loaded into the browser.
		 * 
		 * @method onComponentsLoaded
		 */
		onComponentsLoaded : function CV_onComponentsLoaded() {
			// Shortcut for dummy instance
			if (this.id === null) {
				return;
			}
		},

		/**
		 * Show can be called multiple times and will display the revert dialog
		 * in different ways depending on the config parameter.
		 * 
		 * @method show
		 * @param config
		 *            {object} describes how the revert dialog should be
		 *            displayed The config object is in the form of: { nodeRef:
		 *            {string}, // the nodeRef to revert version: {string} //
		 *            the version to revert nodeRef to }
		 */
		show : function CV_show(config) {
			// Merge the supplied config with default config and check mandatory
			// properties
			this.showConfig = YAHOO.lang.merge(this.defaultShowConfig, config);
			if (this.showConfig.nodeRef === undefined
					&& this.showConfig.filename === undefined
					&& this.showConfig.version === undefined) {
				throw new Error(
						"A nodeRef, filename and version must be provided");
			}
			Alfresco.util.Ajax
					.request({
						url : Alfresco.constants.URL_SERVICECONTEXT
								+ "modules/document-details/open-folder?htmlid="
								+ this.id + "&nodeRef="
								+ this.showConfig.nodeRef + "&version="
								+ this.showConfig.version,
						successCallback : {
							fn : this.onTemplateLoaded,
							scope : this
						},
						failureMessage : "Could not load html compare template",
						execScripts : true
					});
		
		},

		/**
		 * Called when the revert dialog html template has been returned from
		 * the server. Creates the YIU gui objects such as the panel.
		 * 
		 * @method onTemplateLoaded
		 * @param response
		 *            {object} a Alfresco.util.Ajax.request response object
		 */
		onTemplateLoaded : function CV_onTemplateLoaded(response) {
			var Dom = YAHOO.util.Dom;

			// Inject the template from the XHR request into a new DIV element
			var containerDiv = document.createElement("div");
			containerDiv.innerHTML = response.serverResponse.responseText;

			// Create the panel from the HTML returned in the server reponse
			var dialogDiv = YAHOO.util.Dom.getFirstChild(containerDiv);
			this.widgets.panel = Alfresco.util.createYUIPanel(dialogDiv);

			// Save a reference to the HTMLElement displaying texts so we can
			// alter the texts later
			this.widgets.headerText = Dom.get(this.id + "-header-span");

			// Save reference to version section elements so we can set its
			// values later
			this.widgets.targetversion = YAHOO.util.Dom.get(this.id
					+ "-targetversion-dropdown");

			// Create and save a reference to the buttons so we can alter them
			// later
			this.widgets.okButton = Alfresco.util.createYUIButton(this,
					"ok-button", this.onOKButtonClick);

			this.widgets.cancelButton = Alfresco.util.createYUIButton(this,
					"cancel-button", this.onCancelButtonClick);

			// Show panel
			this._showPanel();
		},

		/**
		 * Fired when the user clicks the cancel button. Closes the panel.
		 * 
		 * @method onCancelButtonClick
		 * @param event
		 *            {object} a Button "click" event
		 */
		onCancelButtonClick : function RV_onCancelButtonClick() {
			// Hide the panel
			this.widgets.panel.hide();

		},

		/**
		 * Fired when the user clicks the OK button. Opens the Arender folder
		 * view in a new window.
		 * 
		 * @method onOKButtonClick
		 * @param event
		 *            {object} a Button "click" event
		 */
		onOKButtonClick : function RV_onOKButtonClick() {
			// Hide the panel
			this.widgets.panel.hide();

			var nodeRefs = this.showConfig.nodeRef + ";"
					+ this.showConfig.version + "," + this.showConfig.nodeRef
					+ ";" + this.widgets.targetversion.value;

			window.open(Alfresco.constants.PROXY_URI
					+ "/arender/doclib/action/folder?folderRef=" + nodeRefs,
					'_blank');

		},

		/**
		 * Adjust the gui according to the config passed into the show method.
		 * 
		 * @method _applyConfig
		 * @private
		 */
		_applyConfig : function RV__applyConfig() {
			var Dom = YAHOO.util.Dom;

			// Set the panel section
			var header = Alfresco.util.message("header.folder",
					this.name, {
						"0" : this.showConfig.filename,
						"1" : this.showConfig.version
					});
			this.widgets.headerText["innerHTML"] = header;

			this.widgets.cancelButton.set("disabled", false);

		},

		/**
		 * Prepares the gui and shows the panel.
		 * 
		 * @method _showPanel
		 * @private
		 */
		_showPanel : function RV__showPanel() {
			// Apply the config before it is showed
			this._applyConfig();

			// Show the revert panel
			this.widgets.panel.show();
		}
	};
})();

Alfresco.module.getOpenFolderInstance = function() {
	var instanceId = "alfresco-OpenFolder-instance";
	return Alfresco.util.ComponentManager.get(instanceId)
			|| new Alfresco.module.OpenFolder(instanceId);
}