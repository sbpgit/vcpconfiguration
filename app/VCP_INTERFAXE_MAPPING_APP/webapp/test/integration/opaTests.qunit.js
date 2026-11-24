/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["vcpibpapis/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
