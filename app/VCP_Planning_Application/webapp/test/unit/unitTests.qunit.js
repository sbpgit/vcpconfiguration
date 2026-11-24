/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"vcpapp/vcp_planning_apps1/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
