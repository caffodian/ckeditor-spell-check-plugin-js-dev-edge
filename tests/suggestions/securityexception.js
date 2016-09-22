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
//			this.suggestions = new editor.plugins.nanospell.SuggestionsStorage();
		},
		'test it uses storejs when enabled': function() {
			var editor = this.editorBot.editor;
			var storeStub = sinon.stub();
			window.store = storeStub;
			storeStub.enabled = true;

			var suggestions = new editor.plugins.nanospell.SuggestionsStorage();

			assert.isTrue(suggestions.enabled);
			assert.areEqual(suggestions.addPersonalStoreJs, suggestions.addPersonal);
			assert.areEqual(suggestions.hasPersonalStoreJs, suggestions.hasPersonal);


			// this cleanup is required only for this test, since we filled in window.store earlier
			delete window.store;
		},
		'test it falls back on localStorage': function() {
			var editor = this.editorBot.editor;

			var suggestions = new editor.plugins.nanospell.SuggestionsStorage();

			assert.isTrue(suggestions.enabled);
			assert.areEqual(suggestions.addPersonalLocalStorage, suggestions.addPersonal);
			assert.areEqual(suggestions.hasPersonalLocalStorage, suggestions.hasPersonal);
		}

	});

})();
