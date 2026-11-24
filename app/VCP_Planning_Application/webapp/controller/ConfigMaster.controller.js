sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "vcpapp/vcpplanningapps1/controller/BaseController",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/model/json/JSONModel",
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        "sap/f/library",
        "sap/ui/Device",

    ],
    function (Controller, BaseController, JSONModel, Filter, FilterOperator, fioriLibrary, Device) {
        "use strict";
        var that, oGModel;
        return BaseController.extend("vcpapp.vcpplanningapps1.controller.ConfigMaster", {
            onInit() {
                that = this;
                that.locModel = new sap.ui.model.json.JSONModel();
                that.locModel.setSizeLimit(5000);

                this.bus = sap.ui.getCore().getEventBus();
                this.bus.subscribe("data", "refreshMaster", this.refreshMaster, this);
                this.bus.publish("nav", "toBeginPage", {
                    viewName: this.getView().getProperty("viewName"),
                });

                // var oRoute = that.getRouter().getRoute("Master");
                // oRoute.attachPatternMatched(that._onPatternMatched, that);
            },
            /**
             * 
             * @param {*} oModel 
             */
            onAfterRendering: function () {
                that = this;
                oGModel = this.getModel("oGModel");

                that.oLocationList = that.getView().byId("idLocationsList");

                that.getLocation();

                var sLocation = oGModel.getProperty("/location");
                if (sLocation !== undefined && sLocation !== "") {
                    // Calling Item Detail page
                    that.getOwnerComponent().runAsOwner(function () {
                        if (!that.oDetailView) {
                            try {
                                that.oDetailView = sap.ui.view({
                                    viewName: "vcpapp.vcpplanningapps1.view.ConfigHome",
                                    type: "XML",
                                });
                                that.bus.publish("flexible", "addDetailPage", that.oDetailView);
                                that.bus.publish("nav", "toDetailPage", {
                                    viewName: that.oDetailView.getViewName(),
                                });
                            }
                            catch (e) {
                                that.oDetailView.onAfterRendering();
                            }
                            // catch (e) {
                            //     console.error("Error creating view:", e);
                            // }
                        } else {
                            that.bus.publish("nav", "toDetailPage", {
                                viewName: that.oDetailView.getViewName(),
                            });
                        }
                    });
                }
            },

            // onInfoPress: function (oEvent) {

            //     const oData = oEvent.getSource().getBindingContext().getObject();

            //     // Frontend message mapping
            //     const oMessages = {
            //         "M1": "Lead time configuration parameter",
            //         "M2": "Planning horizon in weeks",
            //         "M3": "Forecast impact parameter",
            //         "ABC": "Custom business rule parameter"
            //     };

            //     const message = oMessages[oData.PARAMETER_ID] || "No info available";

            //     sap.m.MessageBox.information(message);
            // },
            /**
             * 
             * 
             */
            getLocation: function () {
                //Location data
                that.getModel("PCModel").read("/getLocation", {
                    success: function (oData) {
                        that.locModel.setData({ locations: oData.results });
                        that.oLocationList.setModel(that.locModel);
                    },
                    error: function (oData, error) {
                        MessageToast.show("error");
                        sap.ui.core.BusyIndicator.hide();
                    },
                });

            },
            /**
             * 
             * @param {*} oEvent 
             */
            onSearchLocation: function (oEvent) {
                var oFilter = [];
                var that = this;  // assuming 'this' refers to the controller

                // Get the location list from the view
                that.oLocationList = that.getView().byId("idLocationsList");

                // Get the query value (search term)
                var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue");

                // Check if the query is not empty
                if (sQuery) {
                    // Create the filter
                    oFilter = new sap.ui.model.Filter([
                        new sap.ui.model.Filter("LOCATION_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("LOCATION_DESC", sap.ui.model.FilterOperator.Contains, sQuery)
                    ], false);  // false for AND condition between filters

                    // Apply the filter to the binding
                    that.oLocationList.getBinding("items").filter(oFilter);
                } else {
                    // If no query, reset the filter (empty filter will show all items)
                    that.oLocationList.getBinding("items").filter([]);
                    // that.byId("idLocationsList").setSelectedItem(that.byId("idLocationsList").getItems(0)[0].getDescription())
                    // Get the location list control by ID
                    var oLocationList = that.byId("idLocationsList");

                    // Get the first item from the list
                    var oFirstItem = oLocationList.getItems()[0]; // Access first item

                    // Get the description of the first item (assuming it's a function like getDescription())
                    var firstItemDescription = oFirstItem.getDescription(); // or whatever method provides the description

                    // Set the selected item using its description value
                    oLocationList.setSelectedItem(oFirstItem); // Select the first item in the list
                    that.Flag = "S";
                    that.onListItemPress();



                }
            },

            /**
             * 
             * @param {*} oEvent 
             */
            onListItemPress: function (oEvent) {
                oGModel = that.getModel("oGModel");
                if (oEvent || that.Flag === "S") {
                    if (oEvent) {
                        var location = oEvent.getParameter('listItem').getProperty("description");
                        oGModel.setProperty("/location", location);
                    } else {
                        var oLocationList = that.byId("idLocationsList");
                        var oFirstItem = oLocationList.getItems()[0];
                        var firstItemDescription = oFirstItem.getDescription();
                        oGModel.setProperty("/location", firstItemDescription);
                    }

                }
                // Calling Item Detail page
                that.getOwnerComponent().runAsOwner(function () {
                    if (!that.oDetailView) {
                        try {
                            that.oDetailView = sap.ui.view({
                                viewName: "vcpapp.vcpplanningapps1.view.ConfigHome",
                                type: "XML",
                            });
                            that.bus.publish("flexible", "addDetailPage", that.oDetailView);
                            that.bus.publish("nav", "toDetailPage", {
                                viewName: that.oDetailView.getViewName(),
                            });
                        }
                        catch (e) {
                            that.oDetailView.onAfterRendering();
                        }
                        // catch (e) {
                        //     console.error("Error creating view:", e);
                        // }
                    } else {
                        that.bus.publish("nav", "toDetailPage", {
                            viewName: that.oDetailView.getViewName(),
                        });
                    }
                });
            }

            /**
             *
             *
             */
            // _onPatternMatched: function (oEvent) {
            //     var oModel = that.getOwnerComponent().getModel('PCModel');
            //     // that.i18n = that.getOwnerComponent().getModel("i18n").getResourceBundle();
            //     that.getLocation();
            // }
        });
    }
);