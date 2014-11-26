document.addEventListener('DOMContentLoaded', function () {
	restore_options();
	document.querySelector('button').addEventListener("click", apply_options);
});


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

