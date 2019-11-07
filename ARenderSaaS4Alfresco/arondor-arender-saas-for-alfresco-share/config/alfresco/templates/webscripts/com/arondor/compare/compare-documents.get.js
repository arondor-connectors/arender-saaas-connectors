var alf_ticket = "";

if (session.ticket) {

	alf_ticket = session.getTicket();
} else {
	alf_ticket = sessionticket.getTicket();
}
var arenderConfig = new XML(config.script);
model.compareUrl =  arenderConfig.hmi.url + "/ARenderHMI/ArondorViewer.jsp?docs="
		+ args.noderefs + "&user=" + person.properties.userName
		+ "&alf_ticket=" + alf_ticket
		+ "&visualization.multiView.doComparison=true"