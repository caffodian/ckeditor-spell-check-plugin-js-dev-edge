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
				enabled: false
			}
		},
		'test it uses storejs when enabled': function() {
			var editor = this.editorBot.editor;
			window.store.enabled = true;

			var suggestions = new editor.plugins.nanospell.SuggestionsStorage();

			assert.isTrue(suggestions.enabled);
			assert.areEqual(suggestions.addPersonalStoreJs, suggestions.addPersonal);
			assert.areEqual(suggestions.hasPersonalStoreJs, suggestions.hasPersonal);
			
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
