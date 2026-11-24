sap.ui.define([
    "sap/ui/core/UIComponent",
    "vcpibpapis/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("vcpibpapis.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
                var jQueryScript = document.createElement('script');
            jQueryScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.0/jszip.js');
            document.head.appendChild(jQueryScript);
            var jQueryScript = document.createElement('script');
            jQueryScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.0/xlsx.js');
            document.head.appendChild(jQueryScript);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});