(function() {
	YAHOO.Bubbling
			.fire(
					"registerAction",
					{
						actionName : "onCompareDocuments",
						fn : function com_arondor_arender_compare_onCompareDocuments(
								record) {

							var nodeRefs = "";
							if (YAHOO.lang.isArray(record)
									&& record.length == 2) {
								for (var i = 0, il = record.length; i < il; i++) {
									var document = record[i];
									if (document.node.isContainer) {
										Alfresco.util.PopupManager
												.displayMessage({
													text : "message.compare.select-only-documents.error"
												});
										break;
									} else {
										nodeRefs += (i === 0 ? "" : ",")
												+ document.nodeRef + ";"
												+ document.version;
									}
								}
							} else {
								Alfresco.util.PopupManager
										.displayMessage({
											text : this
													.msg("message.compare.select-two-documents.error")
										});
							}

							if (nodeRefs != "") {
								window
										.open(
												Alfresco.constants.PROXY_URI
														+ "/arender/doclib/action/compare?noderefs="
														+ nodeRefs, '_blank');
							}
						}
					});
})();