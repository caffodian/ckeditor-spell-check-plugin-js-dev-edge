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
    'test it can insert spellcheck spans in paragraphs': function() {
			var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter,
				starterHtml = '<p>Paragraph with missspelling</p>';

			bot.setHtmlWithSelection(starterHtml);

			resumeAfter(editor, 'spellCheckComplete', function() {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml('<p>Paragraph with <span class="nanospell-typo">missspelling</span></p>', paragraph.getOuterHtml());
			});

			wait();
		},
    'test it can span across inline style elements': function() {
      var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter,
				starterHtml = '<p>Paragraph with mis<b>s</b>s<i>pe</i>lling</p>';

      bot.setHtmlWithSelection(starterHtml);

			resumeAfter(editor, 'spellCheckComplete', function() {
				var paragraph = editor.editable().findOne('p');

				tc.assertHtml('<p>Paragraph with <span class="nanospell-typo">mis<b>s</b>s<i>pe</i>lling</span></p>', paragraph.getOuterHtml());
			});

			wait();
    },
    'test it can insert spellcheck spans correctly in a list': function() {
      var bot = this.editorBot,
				tc = this,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter;

      bot.setHtmlWithSelection(
  			'<ol>' +
  				'<li>appkes</li>' +
  			'</ol>'
  		);

      resumeAfter(editor, 'spellCheckComplete', function() {
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
    'test it can insert spellcheck spans in a nested list': function() {
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

      resumeAfter(editor, 'spellCheckComplete', function() {
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
    }

  });

})();
