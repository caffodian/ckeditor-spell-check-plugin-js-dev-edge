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
    assertHtml: function( expected, actual, msg ) {
			assert.areEqual( bender.tools.fixHtml( expected ), bender.tools.fixHtml( actual ), msg );
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
          "missspelling": ["misspelling"]
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
    'test it has spellcheck spans inserted after spellcheck': function() {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter,
				starterHtml = '<p>Paragraph with missspelling</p>';

			bot.setHtmlWithSelection(starterHtml);

			resumeAfter(editor, 'spellCheckComplete', function() {
				var spellCheckSpan = editor.editable().findOne('span');

				tc.assertHtml('<span class="nanospell-typo">missspelling</span>', spellCheckSpan.getOuterHtml());
			});

			wait();
		}

  });

})();
