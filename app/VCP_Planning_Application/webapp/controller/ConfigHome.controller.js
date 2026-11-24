sap.ui.define([
    "vcpapp/vcpplanningapps1/controller/BaseController",
    'sap/m/GroupHeaderListItem',
    'sap/m/MessageToast',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ui/Device",
    "../model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, GroupHeaderListItem, MessageToast, JSONModel, Filter, FilterOperator, Device, formatter) {
        "use strict";
        var that = this, oGModel;
        var aResults;

        return BaseController.extend("vcpapp.vcpplanningapps1.controller.ConfigHome", {
            // set the formatter
            formatter: formatter,

            onInit: function () {
                var oRoute;
                that = this;
                this._bFilterApplied = false;
                // var aParameters = [];

                this.bus = sap.ui.getCore().getEventBus();
                oGModel = that.getOwnerComponent().getModel("oGModel");

                that.i18n = that.getResourceBundle();

                that.oParameterModel = new JSONModel();
                that.oMethodModel = new JSONModel();

                var oDetailPage = this.getView().byId("ConfigHome"),
                    bCurrentShowFooterState = oDetailPage.getShowFooter();
                oDetailPage.setShowFooter(bCurrentShowFooterState);

                if (!that.oMethodDialog) {
                    that.oMethodDialog = sap.ui.xmlfragment("vcpapp.vcpplanningapps1.view.MethodTyp", that);
                    that.getView().addDependent(that.oMethodDialog);
                }
                that.getOwnerComponent().getModel("PCModel").read("/getUserPreferences", {
                    filters: [
                        new Filter("PARAMETER", FilterOperator.EQ, "MAX_RECORDS")
                    ],
                    success: function (oData) {
                        oGModel.setProperty("/MaxCount", oData.results[0].PARAMETER_VALUE);


                    },
                    error: function (oData, error) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show(error)
                    },
                });
                that.getUser();

                // oRoute = that.getRouter().getRoute("detail");
                //  oRoute.attachPatternMatched(that._onPatternMatched, that);                
            },

            // Checking user Authentication information 
            getUser: function () {
                var oModel = this.getOwnerComponent().getModel("PCModel");
                var vUser = this.getUserDetails();
                var oEntry = {
                    USERDATA: []
                };
                let oParamVals = {
                    USEREMAIL: vUser
                };

                oEntry.USERDATA.push(oParamVals);
                oModel.callFunction("/genUserAppVisibility", {
                    method: "GET",
                    urlParameters: {
                        FLAG: 'G',
                        USERDATA: JSON.stringify(oEntry.USERDATA)
                    },
                    success: function (oData) {
                        aResults = oData.results;
                        var aResults = [{
                            "CREATE_CHK": "enabled",
                            "UPDATE_CHK": "enabled",
                            "DELETE_CHK": "enabled",
                            "READ_CHK": "disabled"
                        }]
                        if (aResults.length > 0) {
                            var isUserLoggedIn = true;
                        }

                        if (isUserLoggedIn) {
                            if (aResults[0].UPDATE_CHK === "disabled") {
                                that.byId("save").setEnabled(false);
                            }
                        }
                        else {
                            that.byId("save").setEnabled(false);
                        }
                    },
                    error: function (oData, error) {
                        MessageToast.show("error");
                    }
                });
            },

            /**
       * Called after the view has been rendered.
       * Calls the service to get Data.
       */
            onAfterRendering: function () {
                that.skip = 0;


                var oModel = that.getOwnerComponent().getModel('PCModel');
                oGModel = that.getOwnerComponent().getModel("oGModel");

                var location = oGModel.getProperty("/location");

                // that.getPlannedParameters(location);
                that.getParameters();
                that.getMethods(oModel);
            },


            /*

*/
            // getRouter: function () {
            //     return sap.ui.core.UIComponent.getRouterFor(this);
            // },
            grouper: function (oGroup) {
                return {
                    key: oGroup.oModel.oData.Steps[oGroup.sPath.split("/")[2]].GROUP_DESCRIPTION
                };
            },
            /*
            *
            */
            getGroupHeader: function (oGroup) {
                var sGroup = oGroup.key.slice(1);
                return new GroupHeaderListItem({
                    title: sGroup,
                    upperCase: false
                });
            },

            // getPlannedParameters: function (slocation) {
            //     var aParameters = [];
            //     // var aFilter = [new Filter("LOCATION_ID", FilterOperator.EQ, slocation),
            //     //                           new Filter("VALUE", FilterOperator.EQ, ' ')];

            //     that.getModel("PCModel").read('/V_Parameters', {
            //         filters: [
            //             new Filter("LOCATION_ID", FilterOperator.EQ, slocation)
            //         ],
            //         success: function (oData) {
            //             // MessageToast.show("Success");
            //             aParameters = oData.results;
            //             if (aParameters.length > 0) {
            //                 aParameters = aParameters.sort((a, b) => a.SEQUENCE - b.SEQUENCE);

            //                 that.oParameterModel.setData({
            //                     parameters: aParameters  //oData.results
            //                 });

            //                 that.byId("idParameterTable").setModel(that.oParameterModel);
            //             } else {
            //                 that.getParameters();
            //             }

            //         }, error: function (oReponse) {
            //             MessageToast.show("Failed to fetch Parameters!");
            //         }
            //     }
            //     );
            // },


            getPlannedParameters: function (slocation) {
                var aParameters = [];

                // var aFilter = [new Filter("LOCATION_ID", FilterOperator.EQ, slocation),
                //                           new Filter("VALUE", FilterOperator.EQ, ' ')];

                that.getModel("PCModel").read('/V_Parameters', {
                    filters: [
                        new Filter("LOCATION_ID", FilterOperator.EQ, slocation)
                    ],
                    success: function (oData) {
                        // MessageToast.show("Success");
                        aParameters = oData.results;
                        if (aParameters.length > 0) {
                            aParameters = aParameters.sort((a, b) => a.SEQUENCE - b.SEQUENCE);

                            that.oParameterModel.setData({
                                parameters: aParameters  //oData.results
                            });

                            that.byId("idParameterTable").setModel(that.oParameterModel);
                        } else {
                            that.getParameters();
                        }

                    }, error: function (oReponse) {
                        MessageToast.show("Failed to fetch Parameters!");
                    }
                }
                );
            },



            /**
             * 
             * @param {*} oModel  OLD WORKING CODE
             */
            // getParameters1: function () {
            //     var aParameters = [];
            //     sap.ui.core.BusyIndicator.show();
            //     that.getModel("PCModel").read('/V_Parameters', {
            //         success: function (oData) {

            //             // MessageToast.show("Success");
            //             aParameters = oData.results;
            //             if (aParameters.length > 0) {
            //                 that.getFilteredData(aParameters);
            //                 // aParameters = aParameters.sort((a, b) => a.SEQUENCE - b.SEQUENCE);

            //                 // const ids = aParameters.map(o => o.PARAMETER_ID)
            //                 // const aFiltered = aParameters.filter(({ PARAMETER_ID }, index) => !ids.includes(PARAMETER_ID, index + 1))
            //                 // const aParams = aFiltered.map(obj => {

            //                 //     return { ...obj, VALUE: '' };
            //                 // });

            //                 // that.oParameterModel.setData({
            //                 //     parameters: aParams //aParameters  //oData.results
            //                 // });
            //             }
            //             sap.ui.core.BusyIndicator.hide();
            //             // that.byId("idParameterTable").setModel(that.oParameterModel);

            //         }, error: function (oReponse) {
            //             sap.ui.core.BusyIndicator.hide();
            //             MessageToast.show("Failed to fetch Parameters!");
            //         }
            //     }
            //     );
            // },


            getParameters: function () {
                var aParameters = [];
                that.oGparameters = [];
                var topCount = oGModel.getProperty("/MaxCount");
                sap.ui.core.BusyIndicator.show();
                that.getModel("PCModel").read('/V_Parameters', {
                    // filters: aFilters,
                    urlParameters: {
                        "$skip": that.skip,
                        "$top": topCount
                    },
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        aParameters = oData.results;
                        if (topCount == oData.results.length) {
                            that.skip += parseInt(topCount);
                            that.oGparameters = that.oGparameters.concat(oData.results);
                            that.getParameters();
                        }

                        else {
                            that.skip = 0;
                            that.oGparameters = that.oGparameters.concat(oData.results);
                            const seen = new Set();

                            const uniqueData = that.oGparameters.filter(item => {
                                const key = `${item.LOCATION_ID}|${item.DESCRIPTION}|${item.PARAMETER_ID}`;
                                if (seen.has(key)) {
                                    return false;
                                }
                                seen.add(key);
                                return true;
                            });
                            that.getFilteredData(uniqueData);

                        }
                        //        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (err) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to fetch Parameters!");
                    }
                });
            },
            /**
             * 
             * @param {*} oModel 
             */
            getFilteredData: function (aParameters) {
                var sLocation = oGModel.getProperty("/location");
                var iIndx = 0;
                aParameters = aParameters.sort((a, b) => a.SEQUENCE - b.SEQUENCE);
                const ids = aParameters.map(o => o.PARAMETER_ID)
                const aFiltered = aParameters.filter(({ PARAMETER_ID }, index) => !ids.includes(PARAMETER_ID, index + 1))
                const aParams = aFiltered.map(obj => {

                    return { ...obj, VALUE: '' };
                });
                var aFilteredParams = aParameters.filter(function (aParams) {
                    return aParams.LOCATION_ID === sLocation;
                });

                if (aFilteredParams.length > 0) {
                    if (aParams.length > 0) {
                        for (var i = 0; i < aParams.length; i++) {
                            iIndx = 0;
                            aFilteredParams.indexOf(aParams[i]);
                            iIndx = aFilteredParams.findIndex(item => item.PARAMETER_ID === aParams[i].PARAMETER_ID);
                            if (iIndx === -1) {
                                aFilteredParams.push(aParams[i]);
                            }
                        }
                    }
                    aFilteredParams = aFilteredParams.sort((a, b) => a.PARAMETER_ID - b.PARAMETER_ID);
                    aFilteredParams = aFilteredParams.sort((a, b) => a.SEQUENCE - b.SEQUENCE);


                    that.oParameterModel.setData({
                        parameters: aFilteredParams
                    });

                }
                else {

                    // For new location with no configuration

                    that.oParameterModel.setData({
                        parameters: aParams
                    });
                }

                that.byId("idParameterTable").setModel(that.oParameterModel);

                var aParamts = that.oParameterModel.getProperty("/parameters");

                var sExecution = "";

                aParamts.forEach(function (oParam) {
                    if (oParam.DESCRIPTION === "Execution") {
                        sExecution = oParam.VALUE;
                    }
                });

                aParamts.forEach(function (oParam, i) {

                    if (oParam.DESCRIPTION === "Fully Configured Horizon") {
                        that.oParameterModel.setProperty(
                            "/parameters/" + i + "/VALUE",
                            sExecution === "M2" ? "104" : "0"
                        );
                    }

                    if (oParam.DESCRIPTION === "Components Horizon") {
                        that.oParameterModel.setProperty(
                            "/parameters/" + i + "/VALUE",
                            sExecution === "M2" ? "0" : "104"
                        );
                    }

                });

                that.byId("idParameterTable").setModel(that.oParameterModel);

            },

            /*
            *
            */
            getMethods: function (oModel) {
                oModel.read('/Method_Types', {
                    success: function (oData) {
                        // MessageToast.show("Success");
                        that.oMethodModel.setData({
                            methods: oData.results
                        });

                    }, error: function (oReponse) {
                        MessageToast.show("Failed to fetch Method Types!");
                    }
                }
                );
            },
            /*
            *
            */
            handleValueHelpRequest: function (oEvent) {
                var oParamModel = that.getView().byId("idParameterTable").getModel();
                var oBindingContext = oEvent.getSource().getBindingContext();
                var sTable = oParamModel.getProperty("VALUE_HELP_TAB", oBindingContext);

                switch (sTable) {
                    case 'Method_Types':
                        that.oSelectedInputExe = oEvent.getSource();
                        if (that.oMethodDialog) {
                            that.oMethodDialog.setModel(that.oMethodModel);
                            that.oMethodDialog.open();
                        }
                }
            },
            /**
             *
             *
             * @param {*} oEvent
             *              */
            onListItemPress: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem").getInfo();
                that.sSelMethodTyp = oEvent.getParameter("listItem").getInfo();


                var isM2 = that.sSelMethodTyp === "M2";

                that.oParameterModel.getProperty("/parameters").forEach(function (oParam, i) {

                    if (oParam.DESCRIPTION === "Fully Configured Horizon") {
                        that.oParameterModel.setProperty(
                            "/parameters/" + i + "/VALUE",
                            isM2 ? "104" : "0"   // VALUE is string
                        );
                    }

                    if (oParam.DESCRIPTION === "Components Horizon") {
                        that.oParameterModel.setProperty(
                            "/parameters/" + i + "/VALUE",
                            isM2 ? "0" : "104"
                        );
                    }

                });

                that.byId("idParameterTable").setModel(that.oParameterModel);

                if (that.oSelectedInputExe) {
                    that.oSelectedInputExe.setValue(oSelectedItem);
                    that.oSelectedInputExe.setName(that.sSelMethodTyp);
                }
                that.oMethodDialog.close();

            },
            /**
             *
             *
             */
            onCloseDialog: function () {
                if (that.oMethodDialog) {
                    that.oMethodDialog.close();
                }
            },

            onPressSave: function () {

                var oModel = that.getOwnerComponent().getModel('PCModel');

                var oEntry = {
                    PARAMVALS: []
                };

                var sParamVal = "";
                var sLocation = oGModel.getProperty("/location");

                var aItems = that.getView().byId("idParameterTable").getItems();

                for (var i = 0; i < aItems.length; i++) {

                    var oObj = aItems[i];

                    if (oObj._bGroupHeader === false) {

                        var oHBox = oObj.getCells()[2];
                        var oInput = oHBox.getItems()[0];

                        var sValue = oInput.getValue();
                        var sParamId = oObj.getCells()[0].getText();

                        if (sValue !== "" && oInput.getValueState() === "None") {

                            if (oInput.getName()) {
                                sParamVal = oInput.getName();
                            } else {
                                sParamVal = sValue;
                            }

                            oEntry.PARAMVALS.push({
                                LOCATION_ID: sLocation,
                                PARAMETER_ID: sParamId,
                                VALUE: sParamVal
                            });

                        } else if ((sValue === "" || sValue === "0") &&
                            (sParamId === "16" || sParamId === "17")) {

                            oEntry.PARAMVALS.push({
                                LOCATION_ID: sLocation,
                                PARAMETER_ID: sParamId,
                                VALUE: "0"
                            });

                        } else {
                            MessageToast.show(that.i18n.getText("getMandtMsg"), { width: '15%' });
                            return;
                        }
                    }
                }

                var frozenVal = parseInt(oEntry.PARAMVALS[0].VALUE) || 0;
                var firmVal = parseInt(oEntry.PARAMVALS[1].VALUE) || 0;
                var sMaxValue = 12;

                if (firmVal < frozenVal) {
                    var sMessage = "Firm Horizon value must be between " + frozenVal + " and " + sMaxValue;
                    sap.m.MessageToast.show(sMessage);
                    return false;
                }

                oEntry.PARAMVALS.forEach(obj => {
                    obj.USER = that.getUserDetails();
                });

                var aParams = oEntry.PARAMVALS;

            //    12 &13 Parameters adding, not shoiwng in front end side
                var oParam5 = aParams.find(function (oItem) {
                    return oItem.PARAMETER_ID === "5";
                });

                if (oParam5) {

                    var sLocation = oParam5.LOCATION_ID;
                    var sUser = oParam5.USER;

                    var aNewParams;

                    
                    if (oParam5.VALUE === "M2") {
                        aNewParams = [
                            {
                                LOCATION_ID: sLocation,
                                PARAMETER_ID: "12",
                                VALUE: "104",
                                USER: sUser
                            },
                            {
                                LOCATION_ID: sLocation,
                                PARAMETER_ID: "13",
                                VALUE: "0",
                                USER: sUser
                            }
                        ];
                    } else {
                        aNewParams = [
                            {
                                LOCATION_ID: sLocation,
                                PARAMETER_ID: "12",
                                VALUE: "0",
                                USER: sUser
                            },
                            {
                                LOCATION_ID: sLocation,
                                PARAMETER_ID: "13",
                                VALUE: "104",
                                USER: sUser
                            }
                        ];
                    }

                    oEntry.PARAMVALS = aParams.filter(function (oItem) {
                        return oItem.PARAMETER_ID !== "12" && oItem.PARAMETER_ID !== "13";
                    });

                  
                    oEntry.PARAMVALS = oEntry.PARAMVALS.concat(aNewParams);
                }

                oModel.callFunction("/postParameterValues", {
                    method: "GET",
                    urlParameters: {
                        FLAG: 'C',
                        PARAMVALS: JSON.stringify(oEntry.PARAMVALS)
                    },
                    success: function (oData) {
                        sap.m.MessageToast.show(oData.postParameterValues);
                    },
                    error: function () {
                        sap.m.MessageToast.show("Error");
                    }
                });
            },

            // onPressSave: function () {
            //     var oModel = that.getOwnerComponent().getModel('PCModel');
            //     var oEntry = {
            //         PARAMVALS: []
            //     },

            //         oParamVals;
            //     var sParamVal = "";
            //     var sLocation = oGModel.getProperty("/location");

            //     var aItems = that.getView().byId("idParameterTable").getItems();
            //     //  that.Global = aItems;

            //     for (var i = 0; i < aItems.length; i++) {
            //         var oObj = aItems[i];
            //         if (oObj._bGroupHeader === false) {
            //             if (oObj.getCells()[2].getValue() !== "" && oObj.getCells()[2].getValueState() === "None") {
            //                 if (oObj.getCells()[2].getName() !== "" && oObj.getCells()[2].getName() !== undefined) {
            //                     sParamVal = oObj.getCells()[2].getName();
            //                 } else {
            //                     sParamVal = oObj.getCells()[2].getValue();
            //                 }
            //                 oParamVals = {
            //                     LOCATION_ID: sLocation,
            //                     PARAMETER_ID: oObj.getCells()[0].getText(),
            //                     VALUE: sParamVal
            //                     // VALUE: oObj.getCells()[2].getValue()
            //                 };
            //                 oEntry.PARAMVALS.push(oParamVals);
            //             }
            //             else if ((oObj.getCells()[2].getValue() == "" || oObj.getCells()[2].getValue() == "0") && (oObj.getCells()[0].getText() === "16" || oObj.getCells()[0].getText() === "17")) {
            //                 oParamVals = {
            //                     LOCATION_ID: sLocation,
            //                     PARAMETER_ID: oObj.getCells()[0].getText(),
            //                     VALUE: "0"
            //                     // VALUE: oObj.getCells()[2].getValue()
            //                 };
            //                 oEntry.PARAMVALS.push(oParamVals);
            //             }
            //             else {
            //                 MessageToast.show(that.i18n.getText("getMandtMsg"), { width: '15%' });
            //                 return;
            //             }
            //         }
            //     }
            //     var frozenVal = parseInt(oEntry.PARAMVALS[0].VALUE) || 0;
            //     var firmVal = parseInt(oEntry.PARAMVALS[1].VALUE) || 0;
            //     var sMaxValue = 12;

            //     if (firmVal < frozenVal) {
            //         var sMessage = "Firm Horizon value must be between " + frozenVal + " and " + sMaxValue;
            //         sap.m.MessageToast.show(sMessage);
            //         return false;
            //     }

            //     oEntry.PARAMVALS.forEach(obj => {
            //         obj.USER = that.getUserDetails()// 
            //     });

            //     oModel.callFunction("/postParameterValues", {
            //         method: "GET",
            //         urlParameters: {
            //             FLAG: 'C',
            //             PARAMVALS: JSON.stringify(oEntry.PARAMVALS)
            //         },
            //         success: function (oData, oResponse) {
            //             // sap.m.MessageToast.show(that.i18n.getText("postSuccess"));
            //             sap.m.MessageToast.show(oData.postParameterValues)
            //         },
            //         error: function (oResponse) {
            //             sap.m.MessageToast.show("Error");
            //         },
            //     });
            // },
            /*
            *
            */

            onParamValueChange: function (oEvent) {
                var sMessage;
                that.oSelectedInput = oEvent.getSource();
                var oParamModel = that.getView().byId("idParameterTable").getModel();
                var oBindingContext = oEvent.getSource().getBindingContext();
                var sMinValue = oParamModel.getProperty("MIN_VALUE", oBindingContext);
                var sMaxValue = oParamModel.getProperty("MAX_VALUE", oBindingContext) || 12;
                // var oItem = oEvent.getSource().getParent().getParent();
                var oInput = oEvent.getSource();
                var oItem = oInput.getParent().getParent(); // HBox → ColumnListItem

                var oFrozLabel = oItem.getCells()[0].getText(); // label column
                // var oFrozLabel = oEvent.getSource().getParent().getCells()[1].getText();
                // var sFrozLabel = oEvent.getSource().getParent().getCells()[1].getText();

                if (oFrozLabel === "Frozen Horizon") {
                    that.sFrozenHzn = "0";
                    that.sFrozenHzn = oEvent.getParameter("newValue");
                }

                var oFirmHznLabel = oItem.getCells()[1].getText(); //oItem.getCells()[1].getText();
                // var oFirmHznLabel = oEvent.getSource().getParent().getCells()[1].getText();

                if (oFirmHznLabel === "Firm Horizon") {
                    var sFirmHzn = oEvent.getParameter("newValue");
                } else {
                    var sFirmHzn = oBindingContext.getModel().getData().parameters[6].VALUE;
                    if (sFirmHzn === "") {
                        sFirmHzn = 0;
                    }
                }

                var sNewValue = oEvent.getParameter("newValue");
                var bValid1617 = false;

                // Validate integer only
                if (Number.isInteger(Number(sNewValue)) === false) {
                    that.oSelectedInput.setValueState("Error");
                    sMessage = "Please enter valid integer value";
                    that.oSelectedInput.setValueStateText(sMessage);
                    return;
                } else {
                    that.oSelectedInput.setValueState("None");
                    sMessage = "";
                    that.oSelectedInput.setValueStateText(sMessage);
                }

                // ======================
                // Frozen Horizon Validation (0 to max 12)
                // ======================
                if (oFrozLabel === "Frozen Horizon") {
                    var frozenVal = parseInt(sNewValue) || 0;
                    var maxVal = 12;

                    if (frozenVal < 0 || frozenVal > maxVal) {
                        that.oSelectedInput.setValueState("Error");
                        sMessage = "Frozen Horizon value must be between 0 and " + maxVal;
                        that.oSelectedInput.setValueStateText(sMessage);
                        return;
                    } else {
                        that.oSelectedInput.setValueState("None");
                        that.oSelectedInput.setValueStateText("");
                        that.sFrozenHzn = frozenVal; // store for firm horizon validation
                    }
                }

                // ======================
                // Firm Horizon Validation (between frozen and max 12)
                // ======================
                if (oFirmHznLabel === "Firm Horizon") {
                    var frozenVal = parseInt(that.sFrozenHzn) || 0;
                    var firmVal = parseInt(sNewValue) || 0;
                    var maxVal = 12;

                    if (firmVal < frozenVal || firmVal > maxVal) {
                        that.oSelectedInput.setValueState("Error");
                        sMessage = "Firm Horizon value must be between " + frozenVal + " and " + maxVal;
                        that.oSelectedInput.setValueStateText(sMessage);
                        return;
                    } else {
                        that.oSelectedInput.setValueState("None");
                        that.oSelectedInput.setValueStateText("");
                    }
                }

                // Validation on Frozen Horizon PARAMETER_ID
                if (oBindingContext.getObject().PARAMETER_ID === 1) {
                    oParamModel.getData().parameters.filter(obj => {
                        if (obj.PARAMETER_ID === 9) {
                            obj.VALUE = "";
                        }
                    });
                }

                // Validation on Firm Horizon PARAMETER_ID
                if (oBindingContext.getObject().PARAMETER_ID === 9) {
                    var oParamData = oParamModel.getData().parameters.filter(obj => {
                        return obj.PARAMETER_ID === 1;
                    });

                    if (oParamData[0].VALUE !== "" && oParamData[0].VALUE !== undefined) {
                        sMinValue = oParamData[0].VALUE;
                    }
                }

                // Validation on Dynamic Frozen Horizon
                if (oBindingContext.getObject().PARAMETER_ID === 16) {
                    bValid1617 = true;
                    sMinValue = 0;
                    if ((sNewValue === "" || sNewValue === 0) && sNewValue > 0) {
                        sNewValue = 0;
                    }
                    oParamModel.getData().parameters.filter(obj => {
                        if (obj.PARAMETER_ID === 17) {
                            obj.VALUE = "";
                        }
                    });
                }

                // Validation on Dynamic Firm Horizon
                if (oBindingContext.getObject().PARAMETER_ID === 17) {
                    bValid1617 = true;
                    sMinValue = 0;
                    if ((sNewValue === "" || sNewValue === 0) && sNewValue > 0) {
                        sNewValue = 0;
                    }
                    var oParamData = oParamModel.getData().parameters.filter(obj => {
                        return obj.PARAMETER_ID === 16;
                    });

                    if (oParamData[0].VALUE !== "" && oParamData[0].VALUE !== undefined) {
                        sMinValue = (parseInt(oParamData[0].VALUE) + 1).toString();
                    }
                }

                // General Max Value Validation (excluding Dynamic 16 & 17)
                if (parseInt(sMaxValue) > 0) {
                    if (((parseInt(sNewValue) > parseInt(sMaxValue)) && (!bValid1617)) || parseInt(sNewValue) < 0) {
                        that.oSelectedInput.setValueState("Error");
                        sMessage = "Please enter value between " + sMinValue + " and " + sMaxValue;
                        that.oSelectedInput.setValueStateText(sMessage);
                    }
                    else if (parseInt(sNewValue) === 0 && (oBindingContext.getObject().PARAMETER_ID === 16 || oBindingContext.getObject().PARAMETER_ID === 17)) {
                        that.oSelectedInput.setValueState("None");
                        sMessage = "";
                        that.oSelectedInput.setValueStateText(sMessage);
                    }
                    else {
                        that.oSelectedInput.setValueState("None");
                        sMessage = "";
                        that.oSelectedInput.setValueStateText(sMessage);
                    }
                }
            },

            /**
             *
             *
             */
            _onPatternMatched: function (oEvent) {
                var oModel = that.getOwnerComponent().getModel('PCModel');
                var oArgs = oEvent.getParameter("arguments");
                that.location = oArgs.location;
                that.i18n = that.getOwnerComponent().getModel("i18n").getResourceBundle();
                // that.getParameters(oModel, oArgs.location);
                that.getMethods(oModel);
            },



            /**
             * 
             * 
             */

            onUpdateFinished: function (oEvent) {
                var oTable = oEvent.getSource();
                var oBinding = oTable.getBinding("items");

                //  STEP 1: Apply filter ONLY ONCE
                if (oBinding && !this._bFilterApplied) {

                    this._bFilterApplied = true; // prevent loop

                    oBinding.filter([
                        new sap.ui.model.Filter({
                            path: "PARAMETER_ID",
                            test: function (value) {
                                return value !== 12 && value !== 13;
                            }
                        })
                    ]);

                    return; // important: stop here, wait for next rendering
                }
                var aItems = oEvent.getSource().getItems();

                var aFiltered = aItems.filter(function (oItem) {
                    return oItem._bGroupHeader === false;
                });

                for (var i = 0; i < aFiltered.length; i++) {

                    var oItem = aFiltered[i];
                    var sParamId = oItem.getCells()[0].getText();

                    var oHBox = oItem.getCells()[2];     // HBox
                    var oInput = oHBox.getItems()[0];    // Input

                    if (sParamId === "16" || sParamId === "17") {
                        oInput.setRequired(false);
                    }

                    if (sParamId === "20" || sParamId === "21") {
                        oInput.setEnabled(false);
                    }
                }
            }

            // onUpdateFinished: function (oEvent) {
            //     var aBindingItems = oEvent.getSource().getItems();
            //     var aBindingItemsFiltered = aBindingItems.filter(function (aItems) {
            //         return aItems._bGroupHeader === false;
            //     })
            //     for (var i = 0; i < aBindingItemsFiltered.length; i++) {
            //         if (aBindingItemsFiltered[i].getCells()[0].getText() === "16" || aBindingItemsFiltered[i].getCells()[0].getText() === "17") {
            //             aBindingItemsFiltered[i].getCells()[1].setRequired(false);
            //         }
            //         if (aBindingItemsFiltered[i].getCells()[0].getText() === "20") {
            //             aBindingItemsFiltered[i].getCells()[2].setEnabled(false)
            //         }
            //         if (aBindingItemsFiltered[i].getCells()[0].getText() === "21") {
            //             aBindingItemsFiltered[i].getCells()[2].setEnabled(false)
            //         }
            //     }
            // }

            // onParamValueChange: function (oEvent) {
            //     var sMessage;
            //     that.oSelectedInput = oEvent.getSource();
            //     var oParamModel = that.getView().byId("idParameterTable").getModel();
            //     var oBindingContext = oEvent.getSource().getBindingContext();
            //     var sMinValue = oParamModel.getProperty("MIN_VALUE", oBindingContext);
            //     var sMaxValue = oParamModel.getProperty("MAX_VALUE", oBindingContext);
            //     var oFrozLabel = oEvent.getSource().getParent().getCells()[1].getText();

            //     if (oFrozLabel === "Frozen Horizon") {
            //         that.sFrozenHzn = "0";
            //         that.sFrozenHzn = oEvent.getParameter("newValue");
            //     } else {
            //         var oFroxHorzon = oBindingContext.getModel().getData().parameters[0].PARAMETER_ID
            //         if (oFroxHorzon === 1) {
            //             that.sFrozenHzn = "0"
            //             that.sFrozenHzn = oBindingContext.getModel().getData().parameters[0].VALUE
            //         }
            //     }

            //     var oFirmHznLabel = oEvent.getSource().getParent().getCells()[1].getText();

            //     if (oFirmHznLabel === "Firm Horizon") {
            //         var sFirmHzn = oEvent.getParameter("newValue");
            //     } else {
            //         var sFirmHzn = oBindingContext.getModel().getData().parameters[6].VALUE;
            //         if (sFirmHzn === "") {
            //             sFirmHzn = 0;
            //         }
            //     }

            //     var sNewValue = oEvent.getParameter("newValue");
            //     var bValid1617 = false;

            //     // Validate integer only
            //     if (Number.isInteger(Number(sNewValue)) === false) {
            //         that.oSelectedInput.setValueState("Error");
            //         sMessage = "Please enter valid integer value";
            //         that.oSelectedInput.setValueStateText(sMessage);
            //         return;
            //     } else {
            //         that.oSelectedInput.setValueState("None");
            //         sMessage = "";
            //         that.oSelectedInput.setValueStateText(sMessage);
            //     }

            //     if (oFirmHznLabel === "Firm Horizon") {
            //         var frozenVal = parseInt(that.sFrozenHzn) || 0;
            //         var firmVal = parseInt(sFirmHzn) || 0;


            //         // if (firmVal >= 0 || firmVal <= 12) {
            //         //     that.oSelectedInput.setValueState("Error");
            //         //     sMessage = "Firm Horizon value must be between 0 and 12";
            //         //     that.oSelectedInput.setValueStateText(sMessage);
            //         //     return;
            //         // }

            //         // Firm Horizon must be greater than or equal to Frozen Horizon
            //         if (firmVal < frozenVal) {
            //             that.oSelectedInput.setValueState("Error");

            //             sMessage = "Firm Horizon value must be between " + frozenVal + " and " + sMaxValue;

            //             that.oSelectedInput.setValueStateText(sMessage);
            //             return;
            //         }
            //     }



            //     // Existing Firm Horizon ≥ Frozen check (kept for compatibility)
            //     if (oFirmHznLabel === "Firm Horizon") {
            //         if (parseInt(sFirmHzn) < parseInt(that.sFrozenHzn)) {
            //             that.oSelectedInput.setValueState("Error");

            //             sMessage = "Firm Horizon value must be between " + frozenVal + " and " + sMaxValue;

            //             that.oSelectedInput.setValueStateText(sMessage);
            //         } else {
            //             that.oSelectedInput.setValueState("None");
            //             that.oSelectedInput.setValueStateText("");
            //         }
            //     }

            //     // Validation on Frozen Horizon
            //     if (oBindingContext.getObject().PARAMETER_ID === 1) {
            //         oParamModel.getData().parameters.filter(obj => {
            //             if (obj.PARAMETER_ID === 9) {
            //                 obj.VALUE = "";
            //             }
            //         });
            //     }

            //     // Validation on Firm Horizon
            //     if (oBindingContext.getObject().PARAMETER_ID === 9) {
            //         var oParamData = oParamModel.getData().parameters.filter(obj => {
            //             return obj.PARAMETER_ID === 1;
            //         });

            //         if (oParamData[0].VALUE !== "" && oParamData[0].VALUE !== undefined) {
            //             sMinValue = oParamData[0].VALUE;
            //         }
            //     }

            //     // Validation on Dynamic Frozen Horizon
            //     if (oBindingContext.getObject().PARAMETER_ID === 16) {
            //         bValid1617 = true;
            //         sMinValue = 0;
            //         if ((sNewValue === "" || sNewValue === 0) && sNewValue > 0) {
            //             sNewValue = 0;
            //         }
            //         oParamModel.getData().parameters.filter(obj => {
            //             if (obj.PARAMETER_ID === 17) {
            //                 obj.VALUE = "";
            //             }
            //         });
            //     }

            //     // Validation on Dynamic Firm Horizon
            //     if (oBindingContext.getObject().PARAMETER_ID === 17) {
            //         bValid1617 = true;
            //         sMinValue = 0;
            //         if ((sNewValue === "" || sNewValue === 0) && sNewValue > 0) {
            //             sNewValue = 0;
            //         }
            //         var oParamData = oParamModel.getData().parameters.filter(obj => {
            //             return obj.PARAMETER_ID === 16;
            //         });

            //         if (oParamData[0].VALUE !== "" && oParamData[0].VALUE !== undefined) {
            //             sMinValue = (parseInt(oParamData[0].VALUE) + 1).toString();
            //         }
            //     }

            //     if (parseInt(sMaxValue) > 0) {
            //         if (((parseInt(sNewValue) > parseInt(sMaxValue)) && (!bValid1617)) || parseInt(sNewValue) < 0) {
            //             that.oSelectedInput.setValueState("Error");

            //             sMessage = "Please enter value between " + sMinValue + " and " + sMaxValue;
            //             that.oSelectedInput.setValueStateText(sMessage);
            //         }
            //         else if (parseInt(sNewValue) === 0 && (oBindingContext.getObject().PARAMETER_ID === 16 || oBindingContext.getObject().PARAMETER_ID === 17)) {
            //             that.oSelectedInput.setValueState("None");
            //             sMessage = "";
            //             that.oSelectedInput.setValueStateText(sMessage);
            //         }
            //         else {
            //             that.oSelectedInput.setValueState("None");
            //             sMessage = "";
            //             that.oSelectedInput.setValueStateText(sMessage);
            //         }
            //     }
            // },


            /**
           *
           *
           * @param {*} oEvent
           */
            // onParamValueChange: function (oEvent) {
            //     var sMessage;
            //     that.oSelectedInput = oEvent.getSource();
            //     var oParamModel = that.getView().byId("idParameterTable").getModel();
            //     var oBindingContext = oEvent.getSource().getBindingContext();
            //     var sMinValue = oParamModel.getProperty("MIN_VALUE", oBindingContext);
            //     var sMaxValue = oParamModel.getProperty("MAX_VALUE", oBindingContext);
            //     var oFrozLabel = oEvent.getSource().getParent().getCells()[1].getText()

            //     if (oFrozLabel === "Frozen Horizon") {
            //         that.sFrozenHzn = "0"
            //         that.sFrozenHzn = oEvent.getParameter("newValue");
            //     }

            //     var oFirmHznLabel = oEvent.getSource().getParent().getCells()[1].getText()

            //     if (oFirmHznLabel === "Firm Horizon") {
            //         var sFirmHzn = oEvent.getParameter("newValue");
            //     } else {
            //         var sFirmHzn = oBindingContext.getModel().getData().parameters[6].VALUE
            //         if (sFirmHzn === "") {
            //             sFirmHzn = 0
            //         }
            //     }
            //     var sNewValue = oEvent.getParameter("newValue");
            //     var bValid1617 = false;

            //     // Validate if user has entered decimal values
            //     if (Number.isInteger(Number(sNewValue)) === false) {
            //         that.oSelectedInput.setValueState("Error");
            //         sMessage = "Please enter valid integer value";
            //         that.oSelectedInput.setValueStateText(sMessage);
            //         return;

            //     } else {
            //         that.oSelectedInput.setValueState("None");
            //         sMessage = "";
            //         that.oSelectedInput.setValueStateText(sMessage);
            //     }
            //     if (oFirmHznLabel === "Firm Horizon") {
            //         if (parseInt(sFirmHzn) < parseInt(that.sFrozenHzn)) {
            //             that.oSelectedInput.setValueState("Error");
            //             sMessage = "Please enter a value greater than or equal to " + that.sFrozenHzn;
            //             that.oSelectedInput.setValueStateText(sMessage);
            //         } else {
            //             that.oSelectedInput.setValueState("None");
            //             that.oSelectedInput.setValueStateText("");
            //         }
            //     }

            //     // Validation on Frozen Horizon
            //     if (oBindingContext.getObject().PARAMETER_ID === 1) {
            //         oParamModel.getData().parameters.filter(obj => {
            //             if (obj.PARAMETER_ID === 9) {
            //                 obj.VALUE = "";
            //             }
            //         });
            //     }


            //     // Validation on Firm Horizon
            //     if (oBindingContext.getObject().PARAMETER_ID === 9) {
            //         var oParamData = oParamModel.getData().parameters.filter(obj => {
            //             return obj.PARAMETER_ID === 1
            //         })

            //         // var oParamData = oParamModel.getData().parameters[0];
            //         if (oParamData[0].VALUE !== "" && oParamData[0].VALUE !== undefined) {
            //             sMinValue = oParamData[0].VALUE;
            //             // sMinValue = (parseInt(oParamData[0].VALUE) + 1).toString();
            //         }
            //     }


            //     // Validation on Dynamic Horizons
            //     // Validation on Dynamic Frozen Horizon
            //     if (oBindingContext.getObject().PARAMETER_ID === 16) {
            //         bValid1617 = true;
            //         sMinValue = 0;
            //         if ((sNewValue === "" || sNewValue === 0) && sNewValue > 0) {
            //             sNewValue = 0;
            //         }
            //         oParamModel.getData().parameters.filter(obj => {
            //             if (obj.PARAMETER_ID === 17) {
            //                 obj.VALUE = "";
            //             }
            //         });
            //     }

            //     // Validation on Dynamic Firm Horizon
            //     if (oBindingContext.getObject().PARAMETER_ID === 17) {
            //         bValid1617 = true;
            //         sMinValue = 0;
            //         if ((sNewValue === "" || sNewValue === 0) && sNewValue > 0) {
            //             sNewValue = 0;
            //         }
            //         var oParamData = oParamModel.getData().parameters.filter(obj => {
            //             return obj.PARAMETER_ID === 16
            //         })

            //         // var oParamData = oParamModel.getData().parameters[0];
            //         if (oParamData[0].VALUE !== "" && oParamData[0].VALUE !== undefined) {
            //             // sMinValue = oParamData[0].VALUE;
            //             sMinValue = (parseInt(oParamData[0].VALUE) + 1).toString();
            //         }
            //     }
            //     if (parseInt(sMaxValue) > 0) {
            //         if (((parseInt(sNewValue) < parseInt(sMinValue) || parseInt(sNewValue) > parseInt(sMaxValue)) && (!bValid1617)) || parseInt(sNewValue) < 0) {
            //             that.oSelectedInput.setValueState("Error");
            //             sMessage = "Please enter value between " + sMinValue + " and " + sMaxValue;
            //             that.oSelectedInput.setValueStateText(sMessage);
            //         }
            //         else if (parseInt(sNewValue) === 0 && (oBindingContext.getObject().PARAMETER_ID === 16 || oBindingContext.getObject().PARAMETER_ID === 17)) {
            //             that.oSelectedInput.setValueState("None");
            //             sMessage = "";
            //             that.oSelectedInput.setValueStateText(sMessage);
            //         }
            //         else {
            //             that.oSelectedInput.setValueState("None");
            //             sMessage = "";
            //             that.oSelectedInput.setValueStateText(sMessage);
            //         }
            //     }


            // },
            /*
                    *
                    */

        });
    });
