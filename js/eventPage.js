chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.get_options == "1") {
			// オプションを返す
			sendResponse({
				disable_kore: localStorage['disable_kore'] == '1'? true : false,
				hidden_reply: localStorage['hidden_reply'],
				collapse_content: localStorage['collapse_content'] == '1'? true : false,
				reply_button: localStorage['reply_button'] == '1'? true : false,
				enable_mouseover_event: localStorage['enable_mouseover_event'] == '1'? true : false,
				less_character: localStorage['less_character']? localStorage['less_character'] : 0,
				ng_word: localStorage['ng_word']
			});
		} else if (request.store_reply_url == "1") {
			// 返信URLを保存
			localStorage['reply_url'] = request.reply_url;
			sendResponse({});
		} else if (request.get_reply_url == "1") {
			// 返信URLを返す
			sendResponse({reply_url: localStorage['reply_url']});
			localStorage['reply_url'] = '';
		} else if (request.get_masuda_content == "1") {
			// 増田記事本文を返す
			var xhr = new XMLHttpRequest();
			xhr.open('GET', request.url);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					var html = xhr.responseText;
					var pos1 = html.indexOf('<div class="section">');
					if (pos1 != -1) {
						var pos2 = html.indexOf('<div id="rectangle-middle">', pos1);
						if (pos2 != -1) {
							var res = {masuda_content: html.substring(pos1+21, pos2), id: request.id};
							// 取得できたらメッセージを送る
							chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
								chrome.tabs.sendMessage(tabs[0].id, res, function(response) {});
							});
						}
					}
				}
			};
			xhr.send();
			sendResponse({});
		}
});

