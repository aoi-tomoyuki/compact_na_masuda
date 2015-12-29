document.addEventListener('DOMContentLoaded', function () {
	chrome.tabs.getSelected(null, function(tab) {
		if (tab.url.indexOf('http://anond.hatelabo.jp') == 0) {
			// オプション表示
			document.getElementById('id_options').classList.remove('hidden');
			restore_options();
			document.querySelector('button').addEventListener("click", apply_options);
		} else {
			// ちょこっと増田表示
			document.getElementById('id_chokotto_masuda').classList.remove('hidden');
			get_masuda_top();
		}
	});
});



function get_masuda_top() {
	// 増田トップを返す
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "http://anond.hatelabo.jp");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			// 取得できたらメッセージを返す
			chokotto_masuda(xhr.responseText);
		}
	};
	xhr.send();
}

function chokotto_masuda(html) {
	var pos0 = 0;
	while(true) {
		var pos1 = html.indexOf('<div class="section">', pos0);
		if (pos1 == -1) {
			break;
		}
		var pos2 = html.indexOf('<h3>', pos1);
		var pos3 = html.indexOf('</h3>', pos1) + 5;
		var h3 = html.substr(pos2, pos3 - pos2);
		// タグ除去
		var tmp = h3.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
		if (tmp.match(/http:\/\/anond.hatelabo.jp\/[0-9]{14}|anond:[0-9]{14}/)) {
			// タイトルが返信リンクだった場合は次へ行く
			pos0 = pos3;
			continue;
		}
		// リンク先取得
		var pos4 = h3.indexOf('<a href="') + 9;
		var pos5 = h3.indexOf('"><span class="sanchor">■');
		var url = 'http://anond.hatelabo.jp' + h3.substr(pos4, pos5 - pos4);
		// 文字数取得
		var pos6 = html.indexOf('<p class="sectionfooter">', pos3);
		var content = html.substr(pos3, pos6 - pos3);
		var content_text = content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
		var len = '（' + content_text.length + '文字）';
		// 先頭30文字取得
		var chokotto = content_text.substr(0, 30);
		
		
		var div = document.createElement('div');
		div.classList.add('title_list');
		var a = document.createElement('a');
		a.textContent = tmp + len;
		a.href = '#';
		a.setAttribute('masuda_url', url);
		a.addEventListener('click', function () {
			chrome.tabs.create({ url: this.getAttribute('masuda_url') });
		});
		div.appendChild(a);
		var span = document.createElement('span');
		span.textContent = chokotto;
		div.appendChild(document.createElement('br'));
		div.appendChild(span)
		document.getElementById('id_chokotto_masuda').appendChild(div);
		pos0 = pos3;
	}
}


function apply_options(){
	var fdata = {};
	localStorage['disable_kore'] = document.getElementById('id_disable_kore').checked ? '1' : '';
	if (document.getElementById('id_hidden_reply_0').checked) {
		localStorage['hidden_reply'] = '0';
	} else if (document.getElementById('id_hidden_reply_1').checked) {
		localStorage['hidden_reply'] = '1';
	} else if (document.getElementById('id_hidden_reply_2').checked) {
		localStorage['hidden_reply'] = '2';
	}
	localStorage['collapse_content'] = document.getElementById('id_collapse_content').checked ? '1' : '';
	localStorage['reply_button'] = document.getElementById('id_reply_button').checked ? '1' : '';
	localStorage['enable_mouseover_event'] = document.getElementById('id_enable_mouseover_event').checked ? '1' : '';
	localStorage['less_character'] = document.getElementById('id_less_character').value;
	localStorage['ng_word'] = document.getElementById('id_ng_word').value;
	// 面倒なので選択中のタブをリロード
	chrome.tabs.reload();
}

function restore_options(){
	if(localStorage['disable_kore']) {
		document.getElementById('id_disable_kore').checked = true;
	}
	if(localStorage['hidden_reply'] == '0') {
		document.getElementById('id_hidden_reply_0').checked = true;
	} else if(localStorage['hidden_reply'] == '1') {
		document.getElementById('id_hidden_reply_1').checked = true;
	} else if(localStorage['hidden_reply'] == '2') {
		document.getElementById('id_hidden_reply_2').checked = true;
	}
	if(localStorage['collapse_content']) {
		document.getElementById('id_collapse_content').checked = true;
	}
	if(localStorage['reply_button']) {
		document.getElementById('id_reply_button').checked = true;
	}
	if(localStorage['enable_mouseover_event']) {
		document.getElementById('id_enable_mouseover_event').checked = true;
	}
	if(localStorage['less_character']) {
		document.getElementById('id_less_character').value = localStorage['less_character'];
	}
	if(localStorage['ng_word']) {
		document.getElementById('id_ng_word').value = localStorage['ng_word'];
	}
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.get_options == "1") {
			sendResponse({
				disable_kore: localStorage['disable_kore'] == '1'? true : false,
				hidden_reply: localStorage['hidden_reply'],
				collapse_content: localStorage['collapse_content'] == '1'? true: false,
				reply_button: localStorage['reply_button'] == '1'? true: false,
				enable_mouseover_event: localStorage['enable_mouseover_event'] == '1'? true: false,
				less_character: localStorage['less_character'],
				ng_word: localStorage['ng_word']
			});
		}
});

