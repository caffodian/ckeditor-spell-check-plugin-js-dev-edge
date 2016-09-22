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
		setUp: function() {
			window.store = {
				enabled: true
			};
		},
		'test it starts a new personal dictionary and sets it': function() {
			var editor = this.editorBot.editor;
			var getStub = sinon.stub();
			getStub.returns(null);
			window.store.get = getStub;

			var setSpy = sinon.spy();
			window.store.set = setSpy;


			var suggestions = new editor.plugins.nanospell.SuggestionsStorage();
			suggestions.addPersonal('asdf');

			assert.isTrue(setSpy.calledWith('nanospell_suggestions', ['asdf']));
		},
		'test it appends to an existing personal dictionary and sets it': function() {
			var editor = this.editorBot.editor;
			var getStub = sinon.stub();
			getStub.returns(['foo']);
			window.store.get = getStub;

			var setSpy = sinon.spy();
			window.store.set = setSpy;

			var suggestions = new editor.plugins.nanospell.SuggestionsStorage();
			suggestions.addPersonal('asdf');

			assert.isTrue(setSpy.calledWith('nanospell_suggestions', ['foo', 'asdf']));
		},
		'test it does not call set if the word is a duplicate': function() {
			var editor = this.editorBot.editor;
			var getStub = sinon.stub();
			getStub.returns(['foo']);
			window.store.get = getStub;

			var setSpy = sinon.spy();
			window.store.set = setSpy;

			var suggestions = new editor.plugins.nanospell.SuggestionsStorage();
			suggestions.addPersonal('foo');

			assert.isFalse(setSpy.called);
		},
		'test it provides no suggestions if none have been added': function() {
			// vs just crashing. which it did.
			var editor = this.editorBot.editor;
			var getStub = sinon.stub();
			getStub.returns(null);
			window.store.get = getStub;

			var suggestions = new editor.plugins.nanospell.SuggestionsStorage();
			assert.isFalse(suggestions.hasPersonal('asdf'));
		},
		'test it returns true if the suggestion is in the store': function() {
			var editor = this.editorBot.editor;
			var getStub = sinon.stub();
			getStub.returns(['foo', 'bar', 'baz', 'asdf']);
			window.store.get = getStub;

			var suggestions = new editor.plugins.nanospell.SuggestionsStorage();
			assert.isTrue(suggestions.hasPersonal('asdf'));
		}

	});

})();
