/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: nanospell */

'use strict';

(function () {
	bender.editor = {
		config: {
			enterMode: CKEDITOR.ENTER_P,
			nanospell: {
				wordLimitPerRequest: 200
			}
		}
	};

	function makeFakeParagraphTag(numWords) {
		return '<p>' + chance.sentence({ words: numWords }) + '</p>';
	}

	bender.test({
		setUp: function () {
			this.server = sinon.fakeServer.create();
			this.server.respondImmediately = true;

			// for these tests we don't really care that much about the
			// mock data, just that it returns something vaguely resembling the server call
			var suggestions = {
				"result": {
					"asdf": ["abba"],
					"jkl": ["joke"],
					"dzxda": ["dandy", "doody"],
					"missssspelling": ["misspelling"]
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
		'test it emits events when going through the spellcheck cycle': function () {
			var bot = this.editorBot,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter,
				observer = observeSpellCheckEvents(editor),
				starterHtml = '<p>asdf jkl dzxda ^</p>';

			bot.setHtmlWithSelection(starterHtml);

			resumeAfter(editor, 'spellCheckComplete', function () {
				observer.assert(["startScanWords", "startCheckWordsAjax", "startRender", "spellCheckComplete"])
			});

			wait();
		},
		'test future spellchecks only check the current element': function () {
			var bot = this.editorBot,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter,
				observer = observeSpellCheckEvents(editor),
				starterHtml = '<p>asdf jkl dzxda psd</p><p>asdf ndskn jkl^</p>';

			function triggerSecondParagraphSpellcheck() {
				// first run checks the whole document.  Since the spellcheck first
				// splits the document into blocks, all events other than
				// "startScanWords" and "startCheckWordsAjax" will be fired twice.
				// The `render` function which fires "spellCheckComplete" is now
				// scheduled as a 0 ms timeout.  "startRender" fires to trigger
				// the scheduling of that timeout, but the timeouts do not
				// actually fire until all of them have been registered.
				observer.assert(["startScanWords", "startCheckWordsAjax", "startRender", "startRender", "spellCheckComplete", "spellCheckComplete"]);

				// make a new observer to clear the events

				observer = observeSpellCheckEvents(editor);

				// press the spacebar

				editor.editable().fire('keydown', new CKEDITOR.dom.event({
					keyCode: 32,
					ctrlKey: false,
					shiftKey: false
				}));

				resumeAfter(editor, 'spellCheckComplete', assertNoAjaxCallOnSecondParagraph);

				// wait for second spellcheck to fire after the spacebar
				wait();
			}

			function assertNoAjaxCallOnSecondParagraph() {
				var secondParagraph = editor.editable().getChild(1);

				// no ajax call required on the second run, since words are repeats.
				observer.assert(["startScanWords", "startRender", "spellCheckComplete"]);
				observer.assertRootIs(secondParagraph);
			}

			resumeAfter(editor, 'spellCheckComplete', triggerSecondParagraphSpellcheck);

			bot.setHtmlWithSelection(starterHtml);

			// wait for the first spellcheck
			wait();
		},
		'test spellcheck on element does not occur when parent block has spellcheck in progress': function () {
			var bot = this.editorBot,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter,
				observer = observeSpellCheckEvents(editor),
				starterHtml = '<ol><li id="a">something<ul><li id="b">somethingnested blah^</li></ul></li></ol>';

			// the second list item must have two words, because the word at caret is ignored

			bot.setHtmlWithSelection(starterHtml);

			var doc = editor.document,
				outer = doc.getById('a'),
				inner = doc.getById('b');

			resumeAfter(editor, 'spellCheckComplete', completeFirstSpellcheck);

			// wait for initial spellcheck to complete
			wait();

			function completeFirstSpellcheck() {

				observer.assert(["startScanWords", "startCheckWordsAjax", "startRender", "startRender", "spellCheckComplete", "spellCheckComplete"]);

				// set outer li to show that a spellcheck is in progress
				outer.setCustomData('spellCheckInProgress', true);

				// clear observer events after initial spellcheck
				observer = observeSpellCheckEvents(editor);

				// spacebar triggers spellcheck on inner li
				editor.editable().fire('keydown', new CKEDITOR.dom.event({
					keyCode: 32,
					ctrlKey: false,
					shiftKey: false
				}));

				resumeAfter(editor, 'spellCheckAbort', abortedInnerSpellcheck);

				wait();

			};

			function abortedInnerSpellcheck() {
				observer.assertRootIs(inner);
				observer.assert(["spellCheckAbort"]);
			}
		},
		'test spellcheck can batch ajax calls for a document with multiple blocks exceeding the word limit': function () {

			var bot = this.editorBot,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter,
				observer = observeSpellCheckEvents(editor);

			bot.setHtmlWithSelection(makeFakeParagraphTag(100) + makeFakeParagraphTag(100));

			resumeAfter(editor, 'spellCheckComplete', function () {
				// 200 words = 1 ajax call
				observer.assertAjaxCalls(1);

				// reset observer
				observer = observeSpellCheckEvents(editor);

				// reset plugin
				editor.execCommand('nanospellReset');

				// now we have 4 blocks, 100 words each
				bot.setHtmlWithSelection(makeFakeParagraphTag(100) + makeFakeParagraphTag(100) + makeFakeParagraphTag(100) + makeFakeParagraphTag(100));

				resumeAfter(editor, 'spellCheckComplete', function () {
					observer.assertAjaxCalls(2);
				});

				wait();
			});

			wait();
		},
		'test repeat words do not get checked again': function () {

			var bot = this.editorBot,
				editor = bot.editor,
				resumeAfter = bender.tools.resumeAfter,
				observer = observeSpellCheckEvents(editor),
				paragraph = makeFakeParagraphTag(200);

			bot.setHtmlWithSelection(paragraph + paragraph); // two identical paragraphs at the limit.

			resumeAfter(editor, 'spellCheckComplete', function () {
				// 200 words = 1 ajax call
				observer.assertAjaxCalls(1);

				// reset observer
				observer = observeSpellCheckEvents(editor);

			});

			wait();
		}
	});


	/*
	 this pattern is taken from
	 https://github.com/ckeditor/ckeditor-dev/blob/12f0de314fd6fbee0bc4d35d541123d283fdecc9/tests/plugins/filetools/fileloader.js#L131
	 */
	function observeSpellCheckEvents(editor) {
		var observer = { events: [] };

		function stdObserver(evt) {
			observer.events.push(evt);
		}

		editor.on('startSpellCheckOn', stdObserver, null, null, -999);
		editor.on('startScanWords', stdObserver, null, null, -999);
		editor.on('startCheckWordsAjax', stdObserver, null, null, -999);
		editor.on('startRender', stdObserver, null, null, -999);
		editor.on('spellCheckComplete', stdObserver, null, null, -999);
		editor.on('spellCheckAbort', stdObserver, null, null, -999);

		observer.assert = function (expected) {
			var events = observer.events;

			assert.areSame(expected.length, events.length,
				'Events and expected length should be the same. Actual events:\n' + observer.events);

			for (var i = 0; i < events.length; i++) {
				assert.areSame(expected[i], events[i].name);
			}
		};

		observer.assertRootIs = function (expectedRoot) {
			var events = observer.events,
				event,
				i,
				root;

			for (i = 0; i < events.length; i++) {
				event = events[i];
				if (event.name === 'spellCheckComplete') {
					continue;
				} else if (event.name === 'startCheckWordsAjax' || event.name === 'startRender') {
					root = event.data.root;
				} else {
					root = event.data;
				}
				assert.isTrue(root.equals(expectedRoot));
			}
		};

		observer.assertAjaxCalls = function (expected) {
			var events = observer.events,
				ajaxCalls = 0,
				event,
				i;

			for (i = 0; i < events.length; i++) {
				event = events[i];
				if (event.name === 'startCheckWordsAjax')
					ajaxCalls++;
			}

			assert.areSame(expected, ajaxCalls);
		}

		return observer;
	}

})();
