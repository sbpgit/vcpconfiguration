/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"vcpapp/vcp_key_figure_maintenance/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
