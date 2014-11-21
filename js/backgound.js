chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.get_options == "1") {
			sendResponse({
				disable_kore: localStorage['disable_kore'] == '1'? true : false,
				hidden_reply: localStorage['hidden_reply'],
				collapse_content: localStorage['collapse_content'] == '1'? true : false,
				reply_button: localStorage['reply_button'] == '1'? true : false,
				less_character: localStorage['less_character'].length == 0? 0 : localStorage['less_character'],
				ng_word: localStorage['ng_word']
			});
		} else if (request.store_reply_url == "1") {
			localStorage['reply_url'] = request.reply_url;
			sendResponse({});
		} else if (request.get_reply_url == "1") {
			sendResponse({reply_url: localStorage['reply_url']});
			localStorage['reply_url'] = '';
		}
});

