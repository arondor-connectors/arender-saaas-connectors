var alf_ticket = "";

if (session.ticket) {

	alf_ticket = session.getTicket();
} else {
	alf_ticket = sessionticket.getTicket();
}
var arenderConfig = new XML(config.script);
model.folderUrl =  arenderConfig.hmi.url + "/ARenderHMI/ArondorViewer.jsp?nodeRef="
		+ args.folderRef + "&user=" + person.properties.userName
		+ "&alf_ticket=" + alf_ticket
