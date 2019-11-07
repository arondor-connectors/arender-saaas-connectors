var json = remote.call("/api/version?nodeRef=" + args.nodeRef);
model.versions = [];
model.sourceversion = args.version;
if (json.status == status.STATUS_OK)
{
  var obj = JSON.parse(json);
  if (obj)
  {
	 var versions =[]; 
	for(var i=0 , len = obj.length; i< len; i++)
	{
		var version = obj[i];
		if(version.label != args.version)
		{
			versions.push(version);
		}	
	}
	model.versions = versions;
  }
}