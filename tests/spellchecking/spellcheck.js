/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: nanospell */

'use strict';

(function () {
	bender.editor = {
		config: {
			enterMode: CKEDITOR.ENTER_P
		}
	};

	bender.test({
		_should: {
			ignore: {
				'test it can spellcheck a word that uses multiple formatting tags': true,
				'test it can spellcheck a word that spans an inline closing tag': true,
				'test it can spellcheck a word that spans an inline opening tag': true
			}
		},
		assertHtml: function (expected, actual, msg) {
			assert.areEqual(bender.tools.compatHtml(expected, 1, 1, 1, 1), bender.tools.compatHtml(actual, 1, 1, 1, 1), msg);
		},
		setUp: function () {
			this.server = sinon.fakeServer.create();
			this.server.respondImmediately = true;

			// for these tests we don't really care that much about the
			// mock data, just that it returns something vaguely resembling the server call
			var suggestions = {
				"result": {
					"appkes": ["apples"],
					"pearrs": ["pears"],
					"bannanas": ["bananas"],
					"missspelling": ["misspelling"],
					"qui": ["quote", "quick"],
				}
			};

			this.server.respondWith(
				'/spellcheck/nano/',
				JSON.stringify(suggestions)
			);
		},
		tearDown: function () {
			this.server.restore();
			// reset the plugin and clear all spellcaches
			this.editorBot.editor.execCommand('nanospellReset');
		},
		'test it can spellcheck a simple paragraph': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter,
				starterHtml = '<p>Paragraph with missspelling</p>';

			bot.setHtmlWithSelection(starterHtml);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml('<p>Paragraph with <span class="nanospell-typo">missspelling</span></p>', paragraph.getOuterHtml());
			});

			wait();
		},
		'test it can spellcheck across inline style elements': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter,
				starterHtml = '<p>Paragraph with mis<b>s</b>s<i>pe</i>lling</p>';

			bot.setHtmlWithSelection(starterHtml);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml('<p>Paragraph with <span class="nanospell-typo">mis<b>s</b>s<i>pe</i>lling</span></p>', paragraph.getOuterHtml());
			});

			wait();
		},
		'test it can spellcheck across line breaks': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<p>appkes<br>' +
				'pearrs<br>' +
				'bannanas' +
				'</p>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml(
					'<p><span class="nanospell-typo">appkes</span><br>' +
					'<span class="nanospell-typo">pearrs</span><br>' +
					'<span class="nanospell-typo">bannanas</span>' +
					'</p>',
					paragraph.getOuterHtml()
				);
			});

			wait();
		},
		'test it can spellcheck a simple list': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<ol>' +
				'<li>appkes</li>' +
				'</ol>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var orderedList = editor.editable().findOne('ol');

				tc.assertHtml(
					'<ol>' +
					'<li><span class="nanospell-typo">appkes</span></li>' +
					'</ol>',
					orderedList.getOuterHtml()
				);
			});

			wait();
		},
		'test it can spellcheck a nested list': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<ul>' +
				'<li>' +
				'<ol>' +
				'<li>pearrs</li>' +
				'</ol>' +
				'</li>' +
				'</ul>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var nestedList = editor.editable().findOne('ul');

				tc.assertHtml(
					'<ul>' +
					'<li>' +
					'<ol>' +
					'<li><span class="nanospell-typo">pearrs</span></li>' +
					'</ol>' +
					'</li>' +
					'</ul>',
					nestedList.getOuterHtml()
				);
			});

			wait();
		},
		'test it can spellcheck a complex nested list': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<ul>' +
				'<li>appkes' +
				'<ol>' +
				'<li>pearrs</li>' +
				'</ol>' +
				'bannanas</li>' +
				'</ul>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var complexList = editor.editable().findOne('ul');

				tc.assertHtml(
					'<ul>' +
					'<li><span class="nanospell-typo">appkes</span>' +
					'<ol>' +
					'<li><span class="nanospell-typo">pearrs</span></li>' +
					'</ol>' +
					'<span class="nanospell-typo">bannanas</span></li>' +
					'</ul>',
					complexList.getOuterHtml()
				);
			});

			wait();
		},
		'test it can spellcheck a simple table': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<table>' +
				'<tbody>' +
				'<tr>' +
				'<td>appkes</td>' +
				'</tr>' +
				'<tr>' +
				'<td>pearrs</td>' +
				'</tr>' +
				'</tbody>' +
				'</table>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var table = editor.editable().findOne('table');

				tc.assertHtml(
					'<table>' +
					'<tbody>' +
					'<tr>' +
					'<td><span class="nanospell-typo">appkes</span></td>' +
					'</tr>' +
					'<tr>' +
					'<td><span class="nanospell-typo">pearrs</span></td>' +
					'</tr>' +
					'</tbody>' +
					'</table>',
					table.getOuterHtml()
				);
			});

			wait();
		},
		'test it can spellcheck a table after p conversion': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<table>' +
				'<tbody>' +
				'<tr>' +
				'<td><p>appkes</p></td>' +
				'</tr>' +
				'<tr>' +
				'<td><p>pearrs</p></td>' +
				'</tr>' +
				'</tbody>' +
				'</table>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var convertedTable = editor.editable().findOne('table');

				tc.assertHtml(
					'<table>' +
					'<tbody>' +
					'<tr>' +
					'<td><p><span class="nanospell-typo">appkes</span></p></td>' +
					'</tr>' +
					'<tr>' +
					'<td><p><span class="nanospell-typo">pearrs</span></p></td>' +
					'</tr>' +
					'</tbody>' +
					'</table>',
					convertedTable.getOuterHtml()
				);
			});

			wait();
		},

		'test it can spellcheck a word that is the first child of an inline element': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<p>' +
					'<strong>appkes pears</strong>' +
				'</p>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml(
					'<p>' +
						'<strong><span class="nanospell-typo">appkes</span> pears</strong>' +
					'</p>',
					paragraph.getOuterHtml()
				);
			});

			wait();
		},

		'test it can spellcheck a word that is the last child of an inline element': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<p>' +
					'<strong>apples pearrs</strong>' +
				'</p>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml(
					'<p>' +
						'<strong>apples <span class="nanospell-typo">pearrs</span></strong>' +
					'</p>',
					paragraph.getOuterHtml()
				);
			});

			wait();
		},

		'test it can spellcheck a word that uses multiple formatting tags': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<p>' +
					'<strong>pear</strong><em>rs</em>' +
				'</p>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml(
					'<p>' +
						'<span class="nanospell-typo"><strong>pear</strong><em>rs</em></span>' +
					'</p>',
					paragraph.getOuterHtml()
				);
			});

			// Currently fails.  Actual output:
			//	'<p>' +
			//		'<strong></strong>' +
			//		'<span class="nanospell-typo"><strong>pear</strong><em>rs</em></span>' +
			//		'<em></em>' +
			//	'</p>'

			wait();
		},

		'test it can spellcheck a word with nested formatting tags': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<p>' +
					'<strong><em>pearrs</em></strong>' +
				'</p>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml(
					'<p>' +
						'<strong><em><span class="nanospell-typo">pearrs</span></em></strong>' +
					'</p>',
					paragraph.getOuterHtml()
				);
			});

			wait();
		},

		'test it can spellcheck a word that spans an inline closing tag': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<p>' +
					'<strong>apples pear</strong>rs' +
				'</p>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml(
					'<p>' +
						'<strong><span class="nanospell-typo">pear</span></strong>' +
						'<span class="nanospell-typo">rs</span>' +
					'</p>',
					paragraph.getOuterHtml()
				);
			});

			// Currently fails.  Actual output:
			//	'<p>' +
			//		'<strong>apples </strong>' +
			//		'<span class="nanospell-typo"><strong>pear</strong>rs</span>' +
			//	'</p>'

			wait();
		},

		'test it can spellcheck a word that spans an inline opening tag': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<p>' +
					'appk<strong>es pears</strong>' +
				'</p>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml(
					'<p>' +
						'<span class="nanospell-typo">appk</span>' +
						'<strong><span class="nanospell-typo">es</span> pears</strong>' +
					'</p>',
					paragraph.getOuterHtml()
				);
			});

			// Currently fails.  Actual output:
			//	'<p>' +
			//		'<span class="nanospell-typo">appk<strong>es</strong></span>' +
			//		'<strong> pears</strong>' +
			//	'</p>'

			wait();
		},

		'test it can spellcheck a word that spans an entire inline tag': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<p>' +
					'ap<strong>pk</strong>es' +
				'</p>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml(
					'<p>' +
						'<span class="nanospell-typo">ap<strong>pk</strong>es</span>' +
					'</p>',
					paragraph.getOuterHtml()
				);
			});

			wait();
		},

		'test it can spellcheck an already spellchecked word into correctness': function () {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

			bot.setHtmlWithSelection(
				'<p>' +
				'qui^' +
				'</p>'
			);

			resumeAfter(editor, 'spellCheckComplete', function () {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml(
					'<p>' +
					'<span class="nanospell-typo">qui</span>' +
					'</p>',
					paragraph.getOuterHtml()
				);

				// type the rest of the word
				editor.insertHtml('ckly hello');

				var range = new CKEDITOR.dom.range( editor.editable() );
				range.selectNodeContents( paragraph );
				var wordwalker = new editor.plugins.nanospell.WordWalker(range);
				var currWordObj, word, wordsReturned = [];

				while (currWordObj = wordwalker.getNextWord()) {
					word = currWordObj.word;
					wordsReturned.push(word);
				}

				arrayAssert.itemsAreEqual(['quickly', 'hello'], wordsReturned);

			});

			wait();
		},


	});

})();
