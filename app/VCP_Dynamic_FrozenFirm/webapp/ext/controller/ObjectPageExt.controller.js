sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        // bck fun
        onback: function(oEvent) {
            window.history.back();
        }
    };
});