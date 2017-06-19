(function(){
	// オプション
	var options = {
		hidden_reply: '1',
		collapse_content: true,
		reply_button: true,
		enable_mouseover_event: false,
		less_character: 0,
		ng_word: ''
	};

	// メッセージを送ってオプションを取得
	chrome.runtime.sendMessage({get_options: "1"}, function(response) {
		options.hidden_reply = response.hidden_reply;
		options.collapse_content = response.collapse_content;
		options.reply_button = response.reply_button;
		options.enable_mouseover_event = response.enable_mouseover_event;
		if (response.less_character) {
			options.less_character = response.less_character.match(/\d+/)? parseInt(response.less_character) : 0;
		}
		options.ng_word = response.ng_word;
		if (response.disable_kore == false) {
			compact_na_masuda_GOGOGO();
		}
	});

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			// マウスオーバーイベントの記事本文の受け取り
			if (request.masuda_content) {
				var elm = document.getElementById(request.id);
				elm.innerHTML = request.masuda_content;
				// afc 削除
				elm.removeChild(elm.querySelector('div.afc'));
				sendResponse({});
			}
	});

	function compact_na_masuda_GOGOGO(){
		if (location.href.match(/https?:\/\/anond.hatelabo.jp\/[!-~]+\/edit/)) {
			// 編集ページの処理
			edit_page_GOGOGO();
		} else if (location.href.match(/https?:\/\/anond.hatelabo.jp\/[0-9]{14}/)) {
			// 詳細ページの処理
			if (options.enable_mouseover_event) {
				set_mouseover_event();
			}
			detail_page_GOGOGO();
		} else if (location.href.match(/https?:\/\/anond.hatelabo.jp\/$|https?:\/\/anond.hatelabo.jp\/(.)+page=[\d]+|https?:\/\/anond.hatelabo.jp\/[0-9]{8}|https?:\/\/anond.hatelabo.jp\/keyword\/.+/)) {
			// トップページとページ指定、日付指定、キーワード指定の処理
			if (options.enable_mouseover_event) {
				set_mouseover_event();
			}
			top_page_GOGOGO();
		}
	}

	function set_mouseover_event() {
		// マウスオーバーイベント設定
		var a_tags = document.querySelectorAll('a[href*="anond.hatelabo.jp"], a[href^="/20"]');
		for (var i = 0; i < a_tags.length; i++) {
			if (a_tags[i].textContent.match(/トラックバック|Permalink|■/) == null && a_tags[i].href.match(/https?:\/\/anond.hatelabo.jp\/[0-9]{14}/)) {
				if (a_tags[i].href.substr(0, 5) == "http:"){
					// リンクをhttpからhttpsへ変換
					a_tags[i].href = a_tags[i].href.replace("http", "https");
				}
				
				a_tags[i].onmouseover = function(event){
					var id = "id_masuda_" + this.href.substr(-14);
					var elm = document.getElementById(id);
					if (elm == null){
						// tooltip用のdivを作成してbodyに追加
						elm = document.createElement('div');
						elm.id = id;
						elm.className = 'masud_content_tooltip';
						elm.textContent = '読み込み中...';
						// mouseoutかclickで閉じる
						elm.onclick = function(){ this.classList.toggle('hidden_masuda_content'); };
						elm.setAttribute('style', 'top:' + event.pageY + 'px;left:' + event.pageX + 'px;');
						document.body.appendChild(elm);

						var params = {get_masuda_content: "1", url: this.href, id: id};
						// メッセージを送ってURLの記事本文を取得（受け取りはonMessage.addListenerから）
						chrome.runtime.sendMessage(params, function(response){});
					} else {
						elm.setAttribute('style', 'top:' + event.pageY + 'px;left:' + event.pageX + 'px;');
						elm.classList.toggle('hidden_masuda_content');
					}
				};
			}
		}
	}

	function edit_page_GOGOGO() {
		// メッセージを送って返信先のURLがあるならタイトルに設定する
		chrome.runtime.sendMessage({get_reply_url: "1"}, function(response) {
			if (response.reply_url) {
				var title = document.getElementById('text-title');
				title.value = response.reply_url;
				title.size = 40;
				var body = document.getElementById('text-body');
				body.focus();
				// submitから1秒後に閉じる
				document.forms.edit.addEventListener('submit', function(){
					setTimeout(function(){ window.close(); }, 1000);
				}, false);
			}
		});
	}

	function detail_page_GOGOGO(){
		// タイトル横に返信ボタンを入れる
		if (options.reply_button) {
			var username = document.querySelector('#bannersub td.username a');
			var section = document.querySelector('div#body div.body div.section');
			if (username && section) {
				section.firstChild.appendChild(create_reply_button(username));
			}
		}
	}

	function top_page_GOGOGO(){
		// NGワードの改行コードを変換
		if (options.ng_word) {
			options.ng_word = options.ng_word.trim().replace(/\r\n|\r/g, '\n').replace(/\n/g, '|');
		}
		// 返信ボタン処理
		if (options.reply_button) {
			// ログインをしている場合ユーザー名を取得
			var username = document.querySelector('#bannersub td.username a');
		}

		// ページ内の記事を取得
		var sections = document.querySelectorAll('div#body div.body div.section');
		for (var i = 0; i < sections.length; i++) {
			var h3 = sections[i].querySelector('h3');
			// 返信を非表示
			if (options.hidden_reply == '1') {
				// タイトル内のテキストで返信判定
				if (h3.textContent.match(/https?:\/\/anond.hatelabo.jp\/[0-9]{14}|anond:[0-9]{14}/)) {
					sections[i].classList.add('hidden_masuda_content');
					continue;
				}
			} else if (options.hidden_reply == '2') {
				// タイトル、本文で返信判定
				if (sections[i].textContent.match(/https?:\/\/anond.hatelabo.jp\/[0-9]{14}|anond:[0-9]{14}/)) {
					sections[i].classList.add('hidden_masuda_content');
					continue;
				}
			}
			// NGワードチェック
			if (options.ng_word) {
				var re = new RegExp(options.ng_word);
				if (sections[i].textContent.match(re)) {
					sections[i].classList.add('hidden_masuda_content');
					continue;
				}
			}

			var elm = h3.nextSibling;
			var content = '';
			while(elm) {
				if (elm.nodeType == 1) {
					if (elm.classList.contains('afc') == false && elm.classList.contains('sectionfooter') == false) {
						// 広告とフッター以外の本文テキストを収集
						content += elm.textContent;
					}
					// 折りたたみ処理。本文を非表示にする
					if (options.collapse_content) {
						elm.classList.add('hidden_masuda_content');
						elm.classList.add('masuda_content');
					}
				}
				elm = elm.nextSibling;
			}

			// 指定文字以下非表示
			if (options.less_character > 0 && content.length <= options.less_character)  {
				sections[i].classList.add('hidden_masuda_content');
				continue;
			}
			// ログインしているなら返信ボタン作成
			if (options.reply_button && username) {
				h3.appendChild(create_reply_button(username));
			}
			// 折りたたみ
			if (options.collapse_content) {
				sections[i].classList.add('collapse_section');
				h3.className = 'section_header';
				// 本文の先頭50文字表示
				var node = document.createElement('p');
				node.className = 'chokotto_content';
				node.textContent = content.substr(0, 50);
				sections[i].appendChild(node);
				// 本文の文字数表示
				h3.appendChild(document.createTextNode(" | " + content.length + "文字 | "));

				// トグルボタン作成
				var span = document.createElement('span');
				span.className = 'toggle_button';
				span.textContent = "[+]";
				span.onclick = function(){
					this.textContent = this.textContent == '[+]'? '[-]' : '[+]';
					var c_list = this.parentNode.parentNode.querySelectorAll('.masuda_content, .chokotto_content');
					for (var j = 0; j < c_list.length; j++) {
						c_list[j].classList.toggle('hidden_masuda_content');
					}
				}
				h3.insertBefore(span, h3.firstChild);
			}
		}
	}

	function create_reply_button(username) {
		var button = document.createElement('button');
		button.textContent = '返信';
		button.className = 'reply_button';
		button.onclick = function(){
			var a = this.parentNode.querySelector('a');
			// メッセージを送って返信先のURLを保存
			chrome.runtime.sendMessage({store_reply_url: "1", reply_url: a? a.href : ''}, function(response) {});
			var tmp = this.getBoundingClientRect();
			var coord = 'left=' + tmp.left + ', top='+ tmp.top + ', ';
			// 悲しみのwindow.open
			window.open(username.href + 'edit', 'masuda_edit_window',
				coord + 'width=550, height=480, menubar=no, status=no, toolbar=no, scrollbars=yes');
		};
		return button;
	}

})();

