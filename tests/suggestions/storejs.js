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

	});

})();
