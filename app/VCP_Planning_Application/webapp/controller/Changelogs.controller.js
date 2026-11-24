sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function (BaseController, MessageToast, JSONModel, Filter, FilterOperator) {
        "use strict";
        var that = this;
        var oGModel;

        return BaseController.extend("vcpapp.vcpplanningapps1.controller.Changelogs", {
            onInit: function () {
                that = this;

                that.oGModel = that.getOwnerComponent().getModel("oGModel")

                // that.getOwnerComponent().getModel("PCModel").read("/getConfig_Change_logs", {
                //     success: function (oData) {
                //         sap.ui.core.BusyIndicator.hide();

                //         oData.results.forEach(function (log) {
                //             if (log.CHANGED_DATE && log.CHANGED_TIME) {
                //                 let date = new Date(log.CHANGED_DATE);

                //                 // Add the milliseconds from CHANGED_TIME
                //                 date.setMilliseconds(date.getMilliseconds() + log.CHANGED_TIME.ms);

                //                 // Format as YYYY-MM-DD HH:mm:ss
                //                 let year = date.getFullYear();
                //                 let month = String(date.getMonth() + 1).padStart(2, '0');
                //                 let day = String(date.getDate()).padStart(2, '0');
                //                 let hours = String(date.getHours()).padStart(2, '0');
                //                 let minutes = String(date.getMinutes()).padStart(2, '0');
                //                 let seconds = String(date.getSeconds()).padStart(2, '0');

                //                 log.CHANGED_DATE = `${year}-${month}-${day} T ${hours}:${minutes}:${seconds}`;
                //             }
                //         });

                //         var dModel = new JSONModel();
                //         dModel.setData({
                //             LogData: oData.results
                //         });

                //         that.byId("oTablelogsPAC").setModel(dModel);
                //         dModel.setSizeLimit(oData.results.length)
                //     },
                //     error: function (oData, error) {
                //         sap.ui.core.BusyIndicator.hide();
                //     },
                // });

            },
            onAfterRendering: function () {
                that = this;
                that.skip = 0
                that.byId("SearchIdPAC").setValue("")
                that.onChangeLogs();
            },

            onChangeLogs: function () {
                that.oLogs = [];
                var topCount = 30000
                sap.ui.core.BusyIndicator.show();
                that.getOwnerComponent().getModel("PCModel").read("/getConfig_Change_logs", {

                    urlParameters: {
                        "$skip": that.skip,
                        "$top": topCount
                    },
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                           oData.results.sort((a, b) => new Date(b.CHANGED_DATE) - new Date(a.CHANGED_DATE));
                        if (topCount == oData.results.length) {
                         
                            oData.results.forEach(function (log) {
                                if (log.CHANGED_DATE && log.CHANGED_TIME) {
                                    let date = new Date(log.CHANGED_DATE);

                                    date.setMilliseconds(date.getMilliseconds() + log.CHANGED_TIME.ms);

                                    // Format as YYYY-MM-DD HH:mm:ss
                                    let year = date.getFullYear();
                                    let month = String(date.getMonth() + 1).padStart(2, '0');
                                    let day = String(date.getDate()).padStart(2, '0');
                                    let hours = String(date.getHours()).padStart(2, '0');
                                    let minutes = String(date.getMinutes()).padStart(2, '0');
                                    let seconds = String(date.getSeconds()).padStart(2, '0');

                                    log.CHANGED_DATE = `${year}-${month}-${day} T ${hours}:${minutes}:${seconds}`;
                                }
                            });
                            that.skip += topCount;
                            that.oLogs = that.oLogs.concat(oData.results);
                            that.onChangeLogs();
                        } else {
                            that.skip = 0;
                            oData.results.forEach(function (log) {
                                if (log.CHANGED_DATE && log.CHANGED_TIME) {
                                    let date = new Date(log.CHANGED_DATE);

                                    date.setMilliseconds(date.getMilliseconds() + log.CHANGED_TIME.ms);

                                    // Format as YYYY-MM-DD HH:mm:ss
                                    let year = date.getFullYear();
                                    let month = String(date.getMonth() + 1).padStart(2, '0');
                                    let day = String(date.getDate()).padStart(2, '0');
                                    let hours = String(date.getHours()).padStart(2, '0');
                                    let minutes = String(date.getMinutes()).padStart(2, '0');
                                    let seconds = String(date.getSeconds()).padStart(2, '0');

                                    log.CHANGED_DATE = `${year}-${month}-${day} T ${hours}:${minutes}:${seconds}`;
                                }
                            });

                            that.oLogs = that.oLogs.concat(oData.results);

                            that.oModel = new sap.ui.model.json.JSONModel();
                            that.oModel.setData({
                                LogData: that.oLogs
                            })


                            that.byId("oTablelogsPAC").setModel(that.oModel);
                            that.oModel.setSizeLimit(oData.results.length)

                        }
                    },
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("error");
                    }

                })
            },

            onSearch: function (oEvent) {
                var tab1Data = that.byId("oTablelogsPAC").getModel().oData.aItems;
                var oModel = new sap.ui.model.json.JSONModel();
                var oFilters = []
                var sQuery;
                if (oEvent) {
                    sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue")
                    sQuery = sQuery ? sQuery.trim() : "";
                }

                if (!oEvent) {
                    sQuery = that.byId("SearchIdPAC").getValue();
                }

                if (sQuery !== "") {
                    oFilters.push(
                        new Filter({
                            filters: [
                                new Filter("DESCRIPTION", FilterOperator.Contains, sQuery),
                                new Filter("LOCATION_ID", FilterOperator.Contains, sQuery),
                                new Filter("NEW_VALUE", FilterOperator.Contains, sQuery),
                                new Filter("OLD_VALUE", FilterOperator.Contains, sQuery),
                                new Filter("CHANGED_DATE", FilterOperator.Contains, sQuery),
                                new Filter("CHANGED_BY", FilterOperator.Contains, sQuery)
                            ],
                            and: false,
                        })
                    );
                    that.byId("oTablelogsPAC").getBinding("items").filter(oFilters)
                }

                else if (sQuery == "") {
                    that.onAfterRendering()
                    // oModel.setData({
                    //   aItems: tab1Data
                    // })
                    // that.byId("tab1LA").setModel(oModel);

                }

            },

            // onGetData: function () {
            //     var topCount = 30000;
            //     sap.ui.core.BusyIndicator.show();
            //     this.getOwnerComponent().getModel("PCModel").read("/getConfig_Change_logs", {
            //         filters: aFilters,
            //         urlParameters: {
            //             "$skip": that.skip,
            //             "$top": topCount
            //         },
            //         success: function (oData) {
            //             sap.ui.core.BusyIndicator.hide();
            //             oData.results.forEach(function (log) {
            //                 log.LOG_TIME = that.toUtcISOString(log.LOG_TIME);
            //             });

            //             if (topCount === oData.results.length) {
            //                 that.oFCount = "X"
            //                 that.skip += topCount;
            //                 that.oGetLogs = that.oGetLogs.concat(oData.results);
            //                 that.getLogData();
            //             } else {
            //                 that.skip = 0;
            //                 that.oGetLogs = that.oGetLogs.concat(oData.results);
            //                 that.oGModel.setProperty("/oLogData", that.oGetLogs);

            //                 var oLogModel = new sap.ui.model.json.JSONModel({ Logs: that.oGetLogs });
            //                 oLogModel.setSizeLimit(that.oGetLogs.length)
            //                 that.byId("idLogTable").setModel(oLogModel);
            //             }
            //         },
            //         error: function () {
            //             sap.ui.core.BusyIndicator.hide();
            //             sap.m.MessageToast.show("Error Loading Data");
            //         }
            //     });
            // },

            onBack: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Home", { key: "Config" }, true);
            }

        });
    }
);
