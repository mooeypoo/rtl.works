rtlworks.util = {
	/**
	 * Set an element to a disabled state in bootstrap
	 *
	 * @param {jQuery} $element jQuery element
	 * @param {boolean} isDisabled The element is disabled
	 */
	setDisabled: function ( $element, isDisabled ) {
		$element
			.toggleClass( 'disabled', isDisabled );

		if ( isDisabled ) {
			$element.attr( 'disabled', 'disabled' );
		} else {
			$element.removeAttr( 'disabled' );
		}
	}
};
