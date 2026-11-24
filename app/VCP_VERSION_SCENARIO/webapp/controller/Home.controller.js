sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
    function (Controller, MessageToast) {
        "use strict";
        var that;
        return Controller.extend("vcpapp.vcpversionscenariomaintenance.controller.Home", {
            //onint


            onInit: function () {
                that = this;
                that.oModel = that.getOwnerComponent().getModel("oModel");
                that.getView().setModel(that.oModel);
                that.loadFragments();
                that.smartFilterBar = that.byId("smartFilterBarVS");
            },
            loadFragments: function () {
                if (!that.createDialog) {
                    that.createDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpversionscenariomaintenance.fragments.Create",
                        that
                    );
                    that.getView().addDependent(that.createDialog);
                }
            },
            // onTableSelection: function (oEvent) {
            //     const aSelectedItems = this.getView().byId("smartTableVS").getTable().getSelectedIndices();
            //     this.getView().byId("idDelete").setEnabled(aSelectedItems.length > 0);
            // },
            onCreate: function () {
                that.onClear();
                that.createDialog.open();
            },
            onCancel: function () {
                that.createDialog.close();
            },
            onSave: function () {
                var arr = [];
                var ver = sap.ui.getCore().byId("idVersionVS").getValue();
                var verName = sap.ui.getCore().byId("idVerNameVS").getValue();
                var scenario = sap.ui.getCore().byId("idScenarioVS").getValue();
                var scename = sap.ui.getCore().byId("idScenNameVS").getValue();
                if (ver && verName && scenario && scename) {
                    that.createDialog.close();
                    arr.push({
                        VERSION: ver,
                        VERSION_NAME: verName,
                        SCENARIO: scenario,
                        SCENARIO_NAME: scename
                    });
                    that.oModel.callFunction("/modifyVersionScenario", {
                        urlParameters: {
                            FLAG: "C",
                            VS_DATA: JSON.stringify(arr)
                        },
                        success: function (params) {
                            that.smartFilterBar.search();
                            MessageToast.show(`${params.modifyVersionScenario}`);
                        },
                        error: function (err) {
                            that.smartFilterBar.search();
                            MessageToast.show("Error Creating Data");
                        }
                    })
                } else {
                    MessageToast.show("No Data to Save");
                }
            },
            onClear: function () {
                sap.ui.getCore().byId("idVersionVS").setValue("");
                sap.ui.getCore().byId("idVerNameVS").setValue("");
                sap.ui.getCore().byId("idScenarioVS").setValue("");
                sap.ui.getCore().byId("idScenNameVS").setValue("");
            },
            onNavPress: function () {
                if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                    var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                    // generate the Hash to display 
                    var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                        target: {
                            semanticObject: "VCPDocument",
                            action: "Display"
                        }
                    })) || "";
                    var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
                    oStorage.put("nodeId", 71);
                    //Generate a  URL for the second application
                    var url = window.location.href.split('#')[0] + hash;
                    //Navigate to second app
                    sap.m.URLHelper.redirect(url, true);
                }
            }
        });
    });
