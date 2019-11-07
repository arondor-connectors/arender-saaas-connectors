function main()
{
   var reference = url.templateArgs.store_type + "://" + url.templateArgs.store_id  + "/" + url.templateArgs.id;
   var node = search.findNode(reference);
   
   if (node == null)
   {
      status.setCode(status.STATUS_NOT_FOUND, "The thumbnail source node could not be found");
      return;
   }

   if (!node.isSubType("cm:content"))
   {
      status.setCode(status.STATUS_BAD_REQUEST, "The thumbnail source node is not a subtype of cm:content");
      return;
   }
   
   var renditionAssoc = renditionService.getRenditionByName(node,"cm:pdf");
   
   if(renditionAssoc != null &&  renditionAssoc != undefined )
   {
	   model.hasPDFRendtion = "true";
	   model.renditionNodeRef = renditionAssoc;
   }
   else{
	   model.hasPDFRendtion = "false";
	   model.renditionNodeRef = "";
	   renditionService.render(node,"cm:pdf");
   }
}

main();