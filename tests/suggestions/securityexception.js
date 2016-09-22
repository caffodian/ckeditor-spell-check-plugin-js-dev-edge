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
		'test when exception occurs with localStorage it is disabled': function() {
			var suggestions = new editor.plugins.nanospell.SuggestionsStorage();
			var mockedStorage = sinon.mock(localStorage);
			mockedStorage.expects('getItem').once().throws();

			assert.isFalse(suggestions.enabled);
		}

	});

})();
