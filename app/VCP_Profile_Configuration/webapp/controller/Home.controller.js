sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent"

], (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, UIComponent) => {
    "use strict";
    var oGModel, that;

    return Controller.extend("vcpapp.vcpprofileconfiguration.controller.Home", {
        onInit() {
            that = this;
            that.finalArray = [];
            this._prevSelectedItem = null
            // that.aRemFinalData = [];

            if (!that.copyfrag) {
                that.copyfrag = sap.ui.xmlfragment("vcpapp.vcpprofileconfiguration.view.copyProfiles", that);
                that.getView().addDependent(that.copyfrag);
            }
            if (!that.SaveFrag) {
                that.SaveFrag = sap.ui.xmlfragment("vcpapp.vcpprofileconfiguration.view.SaveProfiles", that);
                that.getView().addDependent(that.SaveFrag);
            }
            this.byId("userIcon").addEventDelegate({
                onmouseover: this._showPopover,
                onmouseout: this._clearPopover,
            }, this);

            this.byId("LocHeaderPA").addEventDelegate({
                onmouseover: this._showPopover,
                onmouseout: this._clearPopoverPA,

            }, this);
        },
        _showPopover: function (oEvent) {
            if (oEvent.target.id.includes("LocHeaderPA")) {
                var sPred = that.byId("LocSectionPA").getSelectedItem().getCells()[2].getSelectedKey();
                var sFore = that.byId("LocSectionPA").getSelectedItem().getCells()[3].getSelectedKey();
                var sPlan = that.byId("LocSectionPA").getSelectedItem().getCells()[4].getSelectedKey();
                var sPlanCoeff = that.byId("LocSectionPA").getSelectedItem().getCells()[5].getSelectedKey();
                var sOptimization = that.byId("LocSectionPA").getSelectedItem().getCells()[6].getSelectedKey();
                var sDerived = that.byId("LocSectionPA").getSelectedItem().getCells()[8].getSelectedKey()

                var popoverData = {
                    Prediction_Profile: sPred,
                    Forecasting_Profile: sFore,
                    Planning_Profile: sPlan,
                    Effective_Option_Profile: sPlanCoeff,
                    Optimization_Algorithm: sOptimization,
                    Derived_Profile: sDerived
                };
                var aFinalData = [popoverData];
                var oPopoverModel = new JSONModel();
                oPopoverModel.setData({ PrflData: aFinalData });
                that.byId("userPopoverLOC").setModel(oPopoverModel);
                this._timeId = setTimeout(() => {
                    that.byId("userPopoverLOC").openBy(this.byId(oEvent.target.id));
                }, 500);

            } else {
                var oIcon = oEvent.target.id.split('-').pop().replace("__clone", "");
                var oSelItem = this.byId("LocSectionPA").getItems()[oIcon].getBindingContext().getObject();
                var data = that.aLocProdData.filter(el => el.LOCATION_ID === oSelItem.LOCATION_ID && el.PRODUCT_ID === "NA");
                if (data.length > 0) {
                    var popoverData = {
                        CREATED_BY: data[0].CREATED_BY,
                        CREATED_AT: data[0].CREATED_DATE ? new Date(data[0].CREATED_DATE).toLocaleDateString() : "N/A",
                        CREATED_TIME: data[0].CREATED_TIME ? new Date(data[0].CREATED_TIME).toLocaleDateString() : "N/A",
                        CHANGED_BY: data[0].CHANGED_BY,
                        CHANGED_AT: data[0].CHANGED_DATE ? new Date(data[0].CHANGED_DATE).toLocaleDateString() : "N/A",
                        CHANGED_TIME: data[0].CHANGED_TIME ? new Date(data[0].CHANGED_TIME.ms).toISOString().substr(11, 8) : "N/A",
                    };
                    var aFinalData = [popoverData];
                    var oPopoverModel = new JSONModel();
                    oPopoverModel.setData({ resultsData: aFinalData });
                    that.byId("userPopover").setModel(oPopoverModel);
                    this._timeId = setTimeout(() => {
                        that.byId("userPopover").openBy(this.byId(oEvent.target.id));
                    }, 500);
                } else {
                    MessageToast.show("No related data found.")
                }
            }
        },
        _clearPopover: function () {
            clearTimeout(this._timeId);
            this.byId("userPopover").close();
        },
        _clearPopoverPA: function () {
            clearTimeout(this._timeId);
            this.byId("userPopoverLOC").close();

        },
        //onAfter Rendering 
        onAfterRendering: function () {
            that.byId("idLocSearchPA").setValue("");
            that.byId("idProdSearchPA").setValue("");
            that.skip = 0;

            if (that.aRemFinalData) {
                if (that.aRemFinalData.length > 0) {
                    that.finalArray = that.aRemFinalData
                } else {

                }

            } else {
                that.finalArray = []
            }
            that.byId("ProdListPA").removeSelections(true);
            that.PlanCoeff = [{ PROFILE: "" }, { PROFILE: "METHOD_1" }, { PROFILE: "METHOD_2" }, { PROFILE: "METHOD_3" }];
            that.PlanCoEff = new JSONModel();
            that.PlanCoEff.setData({
                planCoeff: that.PlanCoeff
            })
            that.byId("PlanCoeffPA").setModel(that.PlanCoEff)
            sap.ui.core.BusyIndicator.show();
            that.getOwnerComponent().getModel("BModel").read("/getProfileLocProd", {
                urlParameters: {
                    "$skip": 0,
                    "$top": 10000
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();

                    for (var i = 0; i < oData.results.length; i++) {
                        var user = "", dateTimeStr = "";

                        if (oData.results[i].CHANGED_BY == "" || oData.results[i].CHANGED_BY == null) {
                            user = oData.results[i].CREATED_BY;
                            if (oData.results[i].CREATED_DATE != null) {
                                dateTimeStr = oData.results[i].CREATED_DATE.toISOString().split("T")[0]
                            } else {
                                dateTimeStr = "";
                            }
                            // + "T" + oData.results[i].CREATED_TIME
                        } else {
                            user = oData.results[i].CHANGED_BY;
                            if (oData.results[i].CHANGED_DATE != null) {
                                dateTimeStr = oData.results[i].CHANGED_DATE.toISOString().split("T")[0]
                                //  + "T" + oData.results[i].CHANGED_TIME
                            } else {
                                dateTimeStr = "";
                            }
                        }
                        oData.results[i].NEW_DATE = dateTimeStr;
                        oData.results[i].USER = user;


                        // let d = new Date(dateTimeStr);

                        // if (!isNaN(d)) { // check if valid date
                        //     let a = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
                        //     oData.results[i].NEW_DATE = a.toISOString();

                        //     // obj.CHANGED_DATE = a.toISOString().split('T')[0];   // YYYY-MM-DD
                        //     // obj.CHANGED_TIME = a.toTimeString().split(' ')[0];  // HH:MM:SS
                        // } else {
                        //     console.warn("Invalid date/time for object:", obj);
                        // }
                    }


                    that.aLocProdData = oData.results;
                    that.getProfiles();
                    that.getPeriodProfile();
                    that.getOptimizeData()
                    that.loadDerivedCharData();
                    // that.onInitialLoad();
                },
                error: function (oData, error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("error");
                },

            })

            that.User = "";
            if (sap.ushell) {
                if (sap.ushell.Container) {
                    let email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                    that.User = (email) ? email : "";
                }
            }
            if (!that.User) {
                that.User = 'null';
            }
        },
        // To Get all locations and set the profiles to those locations
        onInitialLoad: function () {
            sap.ui.core.BusyIndicator.show();
            that.byId("idLocSearchPA").setValue("")
            // Calling service to get the Location data
            that.getOwnerComponent().getModel("BModel").read("/getLocation", {
                headers: {
                    "x-user-id": that.User,
                },
                success: function (oData) {
                    that.sLocation = oData.results;
                    sap.ui.core.BusyIndicator.hide();

                    that.LocModel = new JSONModel();
                    that.LocModel.setData({
                        results: oData.results
                    });
                    that.byId("LocSectionPA").setModel(that.LocModel);
                    var items = that.byId("LocSectionPA").getItems();
                    for (let i = 0; i < items.length; i++) {

                        var data = that.aLocProdData.filter(el => el.LOCATION_ID === items[i].getCells()[0].getText() &&
                            el.PRODUCT_ID === "NA");

                        if (data.length > 0) {
                            items[i].getCells()[2].setSelectedKey(data[0].PREDICTION_PROFILE);
                            items[i].getCells()[4].setSelectedKey(data[0].PLANNING_PROFILE);
                            items[i].getCells()[3].setSelectedKey(data[0].FORECASTING_PROFILE);
                            items[i].getCells()[5].setSelectedKey(data[0].OPTION_PERCENT);
                            items[i].getCells()[6].setSelectedKey(data[0].OPTIMIZATION_PROFILE);
                            items[i].getCells()[7].setSelectedKey(data[0].PERIOD_PROFILE);
                            items[i].getCells()[8].setSelectedKey(data[0].DERIVED_PROFILE);
                            // items[i].getCells()[8].setTitle(data[0].USER);
                            // items[i].getCells()[8].setText(data[0].NEW_DATE);

                        }
                    }
                    // for(let i = 0; i<items.length;i++){
                    //     if(items[i].getCells()[0].mProperties.text == aEmp[0].LOCATION_ID ){
                    //         var sSelIntial = items[i].getCells()[1].mForwardedAggregations.items
                    //         for(var j = 1; j<sSelIntial.length; j++){
                    //             if(aEmp[0].PREDICTION_PROFILE == sSelIntial[j].mProperties.key){

                    //             }
                    //         }
                    //     }
                    // }
                    // items[4].getCells()[1].setSelectedKey("SBP_AES_DESM");
                    // that.byId("LocSectionPA").getItems()[0].getCells()[0].mProperties.text





                    // that.getProfiles()
                },
                error: function (oData, error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("error");
                },
            });
        },
        getProfiles: function () {
            sap.ui.core.BusyIndicator.show();

            that.getOwnerComponent().getModel("PModel").read("/getPlanningProfile", {
                success: function (oData) {

                    that.PlanningData = oData.results;
                    that.PlanningData.forEach(oItem => {
                        oItem.TYPE = "PP";
                        oItem.NEW = "";

                    });

                    oGModel = that.getOwnerComponent().getModel("oGModel");
                    oGModel.setProperty("/planningData", that.PlanningData);

                    that.getOwnerComponent().getModel("BModel").read("/getProfiles", {
                        success: function (oData) {
                            sap.ui.core.BusyIndicator.hide();
                            that.Prediction = [];
                            that.Planning = [];
                            that.ForeCasting = [];
                            // that.PlanCoeff = [];
                            that.Prediction.unshift({
                                PROFILE: "",
                            })
                            that.Planning.unshift({
                                PROFILE: "",
                            })
                            that.ForeCasting.unshift({
                                PROFILE: "",
                            })

                            // that.PlanCoeff.unshift({
                            //     PROFILE:""
                            // })



                            // let obj1 = {P}
                            // let obj = { PROFILE: "METHOD_2"};
                            // let obj2 = {PROFILE : "METHOD_3"};
                            // that.PlanCoeff.push(obj);
                            // that.PlanCoeff.push(obj2);



                            // that.PlanCoEff.push({PROFILE:"METHOD_1"});
                            // that.PlanCoEff.push({PROFILE:"METHOD_2"});
                            // that.PlanCoEff.push({PROFILE:"METHOD_3"});

                            oData.results = oData.results.concat(that.PlanningData);

                            oData.results.filter(e => {
                                if (e.TYPE == "P") {
                                    e.selection = false
                                    that.Prediction.push(e)

                                }
                                else if (e.TYPE == "PP") {
                                    e.selection = false
                                    that.Planning.push(e)
                                }
                                else if (e.TYPE == "F") {
                                    e.selection = false
                                    that.ForeCasting.push(e)
                                }
                            })
                            that.PredModel = new JSONModel();
                            that.PlanModel = new JSONModel();
                            that.ForeModel = new JSONModel();
                            that.PlanCoEff = new JSONModel();
                            that.PredModel.setData({
                                PredData: that.Prediction
                            });
                            that.PlanModel.setData({
                                PlanData: that.Planning
                            });
                            that.ForeModel.setData({
                                ForeData: that.ForeCasting
                            })
                            that.PlanCoEff.setData({
                                planCoeff: that.PlanCoeff
                            })
                            that.byId("PredSelectPA").setModel(that.PredModel);
                            that.byId("PlanSelectPA").setModel(that.PlanModel);
                            that.byId("ForeCastSelectPA").setModel(that.ForeModel);
                            that.byId("PlanCoeffPA").setModel(that.PlanCoEff)
                            that.onInitialLoad();



                        },
                        error: function (oData, error) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("error");
                        },
                    });

                },
                error: function (oData, error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("error");
                },
            });
        },
        loadDerivedCharData: function () {
            var that = this;
            this.getOwnerComponent().getModel("BModel").read("/getDerivedCharProfile", {
                urlParameters: {
                    "$select": "PROFILE"
                },
                success: function (oData) {
                    var aResults = oData.results || [];
                    aResults.unshift({
                        PROFILE: ""
                    });
                    var oJsonModel = new sap.ui.model.json.JSONModel({
                        DerivedChar: aResults || []
                    });

                    that.getView().setModel(oJsonModel, "derivedModel");
                },

                error: function () {
                    sap.m.MessageToast.show("Failed to load data");
                }
            });
        },
        getPeriodProfile: function () {
            sap.ui.core.BusyIndicator.show();
            that.byId("idLocSearchPA").setValue("")
            // Calling service to get the Location data
            that.getOwnerComponent().getModel("BModel").read("/getPeriodProfile", {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    that.sPeriodData = oData.results;
                    that.PeriodData = [];
                    // that.PlanCoeff = [];
                    that.PeriodData.unshift({
                        PROFILE: "",
                    })
                    oData.results.filter(e => {
                        if (e) {
                            e.selection = false

                            that.PeriodData.push({ PROFILE: e.PROFILE })
                        }
                    })
                    that.PeriodModel = new JSONModel();
                    that.PeriodModel.setData({
                        PeriodData: that.PeriodData
                    });
                    that.byId("PeriodPA").setModel(that.PeriodModel);





                },
                error: function (oData, error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("error");
                },
            });
        },
        getOptimizeData: function () {
            sap.ui.core.BusyIndicator.show();
            that.byId("idLocSearchPA").setValue("")
            that.getOwnerComponent().getModel("BModel").read("/getOptimizations", {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    that.OptimizeData = [];
                    that.OptimizeData.unshift({
                        PROFILE: "",
                    })
                    oData.results.filter(e => {
                        if (e) {
                            e.selection = false

                            that.OptimizeData.push({ PROFILE: e.PROFILE })
                        }
                    })
                    that.OptModel = new JSONModel();
                    that.OptModel.setData({
                        OptimizeData: that.OptimizeData
                    });
                    that.byId("OptimizPA").setModel(that.OptModel);

                },
                error: function () {
                    MessageToast.show("Failed to get Optimize Data");
                }

            });
        },
        onLocS: function (oEvent) {


            var id = oEvent.getParameter("id");
            var data = oEvent.getParameters(id);



            if (that.byId("LocSectionPA").getVisible() == true) {
                var oCell1 = oEvent.getSource().getParent().getCells()[2];
                var oCell2 = oEvent.getSource().getParent().getCells()[3];
                var oCell3 = oEvent.getSource().getParent().getCells()[6];
                var oCell4 = oEvent.getSource().getParent().getCells()[8];
                if (oCell1.getSelectedKey().length > 0) {
                    oCell1.setValueState("None");
                }
                if (oCell2.getSelectedKey().length > 0) {
                    oCell2.setValueState("None")
                }
                if (oCell3.getSelectedKey().length > 0) {
                    oCell3.setValueState("None")
                }
                if (oCell4.getSelectedKey().length > 0) {
                    oCell4.setValueState("None")
                }
                var obj = {
                    "LOCATION_ID": oEvent.getSource().getParent().getCells()[0].getText(),
                    "PRODUCT_ID": "NA",
                    "PREDICTION_PROFILE": oCell1.getSelectedKey(),
                    "FORECASTING_PROFILE": oCell2.getSelectedKey(),
                    "PLANNING_PROFILE": oEvent.getSource().getParent().getCells()[4].getSelectedKey(),
                    "OPTION_PERCENT": oEvent.getSource().getParent().getCells()[5].getSelectedKey(),
                    "OPTIMIZATION_PROFILE": oCell3.getSelectedKey(),
                    "PERIOD_PROFILE": oEvent.getSource().getParent().getCells()[7].getSelectedKey(),
                    "DERIVED_PROFILE": oCell4.getSelectedKey(),
                    "CREATED_DATE": '9999-12-31',
                    "CREATED_BY": that.User

                }
                var index = that.finalArray.findIndex(el => el.LOCATION_ID === obj.LOCATION_ID && el.PRODUCT_ID == "NA");
            } else {
                var oCell1 = oEvent.getSource().getParent().getCells()[2];
                var oCell2 = oEvent.getSource().getParent().getCells()[3];
                var oCell3 = oEvent.getSource().getParent().getCells()[6];
                var oCell4 = oEvent.getSource().getParent().getCells()[7];
                if (oCell1.getSelectedKey().length > 0) {
                    oCell1.setValueState("None");
                }
                if (oCell2.getSelectedKey().length > 0) {
                    oCell2.setValueState("None")
                }
                if (oCell3.getSelectedKey().length > 0) {
                    oCell3.setValueState("None")
                }
                if (oCell4.getSelectedKey().length > 0) {
                    oCell4.setValueState("None")
                }
                var obj = {
                    "LOCATION_ID": that.oSelLoc,
                    "PRODUCT_ID": oEvent.getSource().getParent().getCells()[0].getText(),
                    "PREDICTION_PROFILE": oCell1.getSelectedKey(),
                    "FORECASTING_PROFILE": oCell2.getSelectedKey(),
                    "PLANNING_PROFILE": oEvent.getSource().getParent().getCells()[4].getSelectedKey(),
                    "OPTION_PERCENT": oEvent.getSource().getParent().getCells()[5].getSelectedKey(),
                    "OPTIMIZATION_PROFILE": oCell3.getSelectedKey(),
                    "DERIVED_PROFILE": oCell4.getSelectedKey(),
                    "CREATED_DATE": '9999-12-31',
                    "CREATED_BY": that.User

                }
                var index = that.finalArray.findIndex(el => el.LOCATION_ID === that.oSelLoc && el.PRODUCT_ID === obj.PRODUCT_ID);
            }


            if (index === -1) {
                that.finalArray.push(obj);
            } else {
                that.finalArray[index].LOCATION_ID = obj.LOCATION_ID;
                that.finalArray[index].PRODUCT_ID = obj.PRODUCT_ID;
                that.finalArray[index].PREDICTION_PROFILE = obj.PREDICTION_PROFILE;
                that.finalArray[index].PLANNING_PROFILE = obj.PLANNING_PROFILE;
                that.finalArray[index].FORECASTING_PROFILE = obj.FORECASTING_PROFILE;
                that.finalArray[index].OPTION_PERCENT = obj.OPTION_PERCENT;
                that.finalArray[index].OPTIMIZATION_PROFILE = obj.OPTIMIZATION_PROFILE;
                that.finalArray[index].PERIOD_PROFILE = obj.PERIOD_PROFILE
                that.finalArray[index].DERIVED_PROFILE = obj.DERIVED_PROFILE
            }


        },
        onLocSelect: function (oEvent) {
            var oCurrentItem = oEvent.getSource().getSelectedItem();
            that.byId("idProdSearchPA").setValue("")
            var sPred = that.byId("LocSectionPA").getSelectedItem().getCells()[2].getSelectedKey();
            var sFore = that.byId("LocSectionPA").getSelectedItem().getCells()[3].getSelectedKey();
            var sPlan = that.byId("LocSectionPA").getSelectedItem().getCells()[4].getSelectedKey();
            var sPlanCoeff = that.byId("LocSectionPA").getSelectedItem().getCells()[5].getSelectedKey();
            var sOptimization = that.byId("LocSectionPA").getSelectedItem().getCells()[6].getSelectedKey();
            if (sPred !== "" && sFore !== "" && sOptimization !== "") {
                var oSelLoc = oEvent.getSource().getSelectedItem().getBindingContext().getObject().LOCATION_ID;
                that.oSelLoc = oSelLoc;

                 if (that._prevSelectedItem) {
                    var aPrevCells = that._prevSelectedItem.getCells();
                    aPrevCells[2].setValueState("None");
                    aPrevCells[3].setValueState("None");
                    aPrevCells[6].setValueState("None");
                }





                // that.byId("ProdListPA").setHeaderText("Location" + " " + oSelLoc)
                that.byId("headerLabelLocationPA").setText("Location       :" + oSelLoc);
                that.byId("headerLabelPredictionPA").setText(sPred);
                that.byId("headerLabelPlanningPA").setText(sPlan);
                that.byId("headerLabelForecastingPA").setText(sFore);
                that.byId("headerLabelMethodsPA").setText(sPlanCoeff);
                that.byId("headerLabelOptimizPA").setText(sOptimization);

                that.byId("headerLabelLocationPA").setVisible(true);
                that.byId("headerLabelPredictionPA").setVisible(true);
                that.byId("headerLabelPlanningPA").setVisible(true);
                that.byId("headerLabelForecastingPA").setVisible(true);
                that.byId("headerLabelMethodsPA").setVisible(true);
                that.byId("headerLabelOptimizPA").setVisible(true);
                that.byId("LocSectionPA").setVisible(false)
                that.byId("AddPA").setVisible(true)
                that.ProdModel = new JSONModel();
                that.byId("ProdListPA").setVisible(true);
                that.byId("idProdSearchPA").setVisible(true);
                that.byId("idLocSearchPA").setVisible(false);
                that.byId("ProdListPA").removeSelections(true);
                that.byId("LocHeaderPA").setVisible(true);
                that.byId("LocHeaderPA").setText("Location     :  " + oSelLoc)

                sap.ui.core.BusyIndicator.show();

                that.PredModel = new JSONModel();
                that.PlanModel = new JSONModel();
                that.ForeModel = new JSONModel();
                that.PlanCoeff1 = new JSONModel();
                that.Optimization1 = new JSONModel();

                that.PredModel.setData({
                    PredData: that.Prediction
                });
                that.PlanModel.setData({
                    PlanData: that.Planning
                });
                that.ForeModel.setData({
                    ForeData: that.ForeCasting
                })
                that.PlanCoeff1.setData({
                    PlanCoEff1: that.PlanCoeff
                })

                that.Optimization1.setData({
                    Optimization1: that.OptimizeData
                })
                // that.Optimization.setData({

                // })
                that.byId("Pred1SelectPA").setModel(that.PredModel);
                that.byId("Plan1SelectPA").setModel(that.PlanModel);
                that.byId("ForeCast1SelectPA").setModel(that.ForeModel);
                that.byId("PlanCoeff1PA").setModel(that.PlanCoeff1);
                that.byId("Optimiz1PA").setModel(that.Optimization1)
                that.prodData = [];

                that.getGenPartialProd(oSelLoc, that.prodData);


            }
            else {
                if (that._prevSelectedItem && that._prevSelectedItem !== oCurrentItem) {
                    var aPrevCells = that._prevSelectedItem.getCells();
                    aPrevCells[2].setValueState("None");
                    aPrevCells[3].setValueState("None");
                    aPrevCells[6].setValueState("None");
                }
                that._prevSelectedItem = oCurrentItem;
                var aMissing = [];
                var oCell1 = that.byId("LocSectionPA").getSelectedItem().getCells()[2]
                var oCell2 = that.byId("LocSectionPA").getSelectedItem().getCells()[3]
                var oCell3 = that.byId("LocSectionPA").getSelectedItem().getCells()[6]

                if (sPred.length === 0) {
                    oCell1.setValueState("Error");
                    oCell1.setValueStateText(" ");
                    aMissing.push("1");
                }

                if (sFore.length === 0) {
                    oCell2.setValueState("Error");
                    oCell2.setValueStateText(" ");
                    aMissing.push("2");
                }

                if (sOptimization.length === 0) {
                    oCell3.setValueState("Error");
                    oCell3.setValueStateText(" ");
                    aMissing.push("3");
                }

                if (aMissing.length > 0) {
                    MessageToast.show("Please Maintain Required Profiles ");
                }



                // MessageToast.show("Please Select the All Profiles");
                //   that.byId("LocSectionPA").removeSelections(true);
                // oEvent.getSource().getSelectedItem().mProperties.selected = false
                that.byId("LocSectionPA").removeSelections(true);
                // that.byId("ProdListPA").removeSelections(true);
            }
        },
        onShowLoc: function () {

            that.byId("LocSectionPA").setVisible(true);
            that.byId("AddPA").setVisible(false);
            that.byId("ProdListPA").setVisible(false);
            that.byId("LocSectionPA").removeSelections(true);
            that.byId("ProdListPA").removeSelections(true);
            that.byId("headerLabelLocationPA").setVisible(false);
            that.byId("headerLabelPredictionPA").setVisible(false);
            that.byId("headerLabelPlanningPA").setVisible(false);
            that.byId("headerLabelForecastingPA").setVisible(false);
            that.byId("headerLabelMethodsPA").setVisible(false);
            that.byId("idProdSearchPA").setVisible(false);
            that.byId("headerLabelOptimizPA").setVisible(false);
            that.byId("idLocSearchPA").setVisible(true);
            that.byId("LocHeaderPA").setVisible(false);
            that.getLocProdProfile();

        },
        onSaveLoc: function (oEvent) {

            that.SaveModel = new JSONModel();
            that.SaveModel.setData({
                ToSaveProfile: that.finalArray
            })
            sap.ui.getCore().byId("idDisSavePA").setModel(that.SaveModel)
            let sSelectionItem = sap.ui.getCore().byId("idDisSavePA").getItems()
            if (sSelectionItem.length == 0) {
                MessageToast.show("No  Data to Save")
            } else {
                sSelectionItem.map(el => el.setSelected(true))
                that.SaveFrag.open()
            }
        },
        onGrowingFinished: function (oEvent) {
            let sSelectionItem = sap.ui.getCore().byId("idDisSavePA").getItems();
            sSelectionItem.map(el => el.setSelected(true))
        },
        onGrowingProduct: function (oEvent) {
            var oEv = oEvent.getSource().sId;
            if (oEv.includes("LocSectionPA")) {
                let items = that.byId("LocSectionPA").getItems();
                for (let i = 0; i < items.length; i++) {

                    var data = that.aLocProdData.filter(el => el.LOCATION_ID === items[i].getCells()[0].getText() && el.PRODUCT_ID === "NA");
                    if (data.length == 0) {
                        var data = that.finalArray.filter(el => el.LOCATION_ID == items[i].getCells()[0].getText() && el.PRODUCT_ID === "NA")
                    }

                    if (data.length > 0) {
                        items[i].getCells()[2].setSelectedKey(data[0].PREDICTION_PROFILE);
                        items[i].getCells()[4].setSelectedKey(data[0].PLANNING_PROFILE);
                        items[i].getCells()[3].setSelectedKey(data[0].FORECASTING_PROFILE);
                        items[i].getCells()[5].setSelectedKey(data[0].OPTION_PERCENT);
                        items[i].getCells()[6].setSelectedKey(data[0].OPTIMIZATION_PROFILE);
                        items[i].getCells()[7].setSelectedKey(data[0].PERIOD_PROFILE);
                        items[i].getCells()[8].setSelectedKey(data[0].DERIVED_PROFILE);
                    }
                }

            } else {
                let items = that.byId("ProdListPA").getItems();
                for (let i = 0; i < items.length; i++) {

                    var data = that.finalArray.filter(el => el.LOCATION_ID === that.oSelLoc && el.PRODUCT_ID == items[i].getCells()[0].getText());
                    if (data.length == 0) {
                        var data = that.aLocProdData.filter(el => el.LOCATION_ID === that.oSelLoc && el.PRODUCT_ID == items[i].getCells()[0].getText());
                    }
                    if (data.length > 0) {
                        items[i].getCells()[2].setSelectedKey(data[0].PREDICTION_PROFILE);
                        items[i].getCells()[4].setSelectedKey(data[0].PLANNING_PROFILE);
                        items[i].getCells()[3].setSelectedKey(data[0].FORECASTING_PROFILE);
                        items[i].getCells()[5].setSelectedKey(data[0].OPTION_PERCENT);
                        items[i].getCells()[6].setSelectedKey(data[0].OPTIMIZATION_PROFILE);
                        items[i].getCells()[7].setSelectedKey(data[0].DERIVED_PROFILE);

                    }
                    else {
                        items[i].getCells()[2].setSelectedKey("");
                        items[i].getCells()[4].setSelectedKey("");
                        items[i].getCells()[3].setSelectedKey("");
                        items[i].getCells()[5].setSelectedKey("");
                        items[i].getCells()[6].setSelectedKey("");
                        items[i].getCells()[7].setSelectedKey("");
                    }

                }
            }
        },
        // onGrowingFinishedforProd:function(){
        //     let sSelItem = that.byId("ProdListPA").getItems();

        // },
        onConfirm: function (oEvent) {

            that.finalProfiles = [];
            var sSaveSelection = sap.ui.getCore().byId("idDisSavePA").getSelectedItems()
            if (sSaveSelection.length <= 0) {
                MessageToast.show("Please Select the rows")
                return;
            } else {
                for (let k = 0; k < sSaveSelection.length; k++) {
                    var obj = {
                        "LOCATION_ID": sSaveSelection[k].getCells()[0].getText(),
                        "PRODUCT_ID": sSaveSelection[k].getCells()[1].getText(),
                        "PREDICTION_PROFILE": sSaveSelection[k].getCells()[2].getText(),
                        "PLANNING_PROFILE": sSaveSelection[k].getCells()[4].getText(),
                        "FORECASTING_PROFILE": sSaveSelection[k].getCells()[3].getText(),
                        "OPTION_PERCENT": sSaveSelection[k].getCells()[5].getText(),
                        "OPTIMIZATION_PROFILE": sSaveSelection[k].getCells()[6].getText(),
                        "PERIOD_PROFILE": sSaveSelection[k].getCells()[7].getText(),
                        "DERIVED_PROFILE": sSaveSelection[k].getCells()[8].getText(),
                        "CREATED_DATE": new Date(),
                        "CREATED_BY": that.User
                    }
                    that.finalProfiles.push(obj)
                }

            }



            if (that.finalArray.length > 0 && that.finalProfiles.length > 0) {
                var arrayTwoIds = new Set(that.finalProfiles.map((el) => `${el.LOCATION_ID}-${el.PRODUCT_ID}`));
                that.aRemFinalData = that.finalArray.filter((el) => !arrayTwoIds.has(`${el.LOCATION_ID}-${el.PRODUCT_ID}`));
            }
            that.finalProfiles.USER = that.User;
            sap.ui.core.BusyIndicator.show();
            that.getOwnerComponent().getModel("BModel").callFunction("/maintainLocProdProfile", {
                method: "GET",
                urlParameters: {
                    LocProdData: JSON.stringify(that.finalProfiles)
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    // that.onAfterRendering();
                    MessageToast.show("Successfully Created");
                    that.onDisplayClose()
                    that.finalArray = [];
                    that.finalArray = that.aRemFinalData;
                    if (that.byId("ProdListPA").getVisible() == true) {
                        if (that.byId("ProdListPA").getSelectedItems().length > 0) {
                            that.onPivotTab(oEvent)
                        } else {
                            that.getLocProdProfile();
                        }
                    } else {
                        that.getLocProdProfile();
                    }
                },
                error: function (oData) {
                    MessageToast.show("Failed to create /update the product");
                    sap.ui.core.BusyIndicator.hide();
                },
            });
        },
        getLocProdProfile: function () {
            sap.ui.core.BusyIndicator.show();
            that.getOwnerComponent().getModel("BModel").read("/getProfileLocProd", {
                urlParameters: {
                    "$skip": 0,
                    "$top": 10000
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    that.aLocProdData = oData.results;
                    // that.byId("LocSectionPA").getBinding("items").filter([])
                    var items = that.byId("LocSectionPA").getItems();
                    for (let i = 0; i < items.length; i++) {

                        var data = that.aLocProdData.filter(el => el.LOCATION_ID === items[i].getCells()[0].getText() && el.PRODUCT_ID === "NA");
                        if (data.length >= 0) {
                            var data = that.finalArray.filter(el => el.LOCATION_ID == items[i].getCells()[0].getText() && el.PRODUCT_ID == "NA")
                        }

                        if (data.length > 0) {
                            items[i].getCells()[2].setSelectedKey(data[0].PREDICTION_PROFILE);
                            items[i].getCells()[4].setSelectedKey(data[0].PLANNING_PROFILE);
                            items[i].getCells()[3].setSelectedKey(data[0].FORECASTING_PROFILE);
                            items[i].getCells()[5].setSelectedKey(data[0].OPTION_PERCENT);
                            items[i].getCells()[6].setSelectedKey(data[0].OPTIMIZATION_PROFILE);
                            items[i].getCells()[7].setSelectedKey(data[0].PERIOD_PROFILE);
                            items[i].getCells()[8].setSelectedKey(data[0].DERIVED_PROFILE);
                        }
                    }
                },
                error: function (oData, error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("error");
                },

            })

        },
        onDisplayClose: function () {
            that.SaveFrag.close()
        },
        onClear: function (oEvent) {
            if (that.byId("LocSectionPA").getVisible() == true) {
                var aSelProfiles = this.byId("LocSectionPA").getItems();
                that.byId("LocSectionPA").removeSelections(true);

                that.onInitialLoad();


            } else {
                var aSelProfiles = this.byId("ProdListPA").getItems();
                that.byId("ProdListPA").removeSelections(true);
                aSelProfiles.forEach(oItem => {
                    const oCells = oItem.getCells();

                    const oPredSelect = oCells[2];
                    if (oPredSelect.setSelectedKey) {
                        oPredSelect.setSelectedKey("");
                    }

                    const oPlanSelect = oCells[4];
                    if (oPlanSelect.setSelectedKey) {
                        oPlanSelect.setSelectedKey("");
                    }

                    const oForeSelect = oCells[3];
                    if (oForeSelect.setSelectedKey) {
                        oForeSelect.setSelectedKey("");
                    }

                    const Coefficient = oCells[5];
                    if (Coefficient.setSelectedKey) {
                        Coefficient.setSelectedKey("");
                    }
                    const Optimize = oCells[6];
                    if (Optimize.setSelectedKey) {
                        Optimize.setSelectedKey("");
                    }

                });
            }


            if (that.byId("LocSectionPA").getVisible() === true) {
                // that.onAfterRendering();
                var items = that.byId("LocSectionPA").getItems();
                for (let i = 0; i < items.length; i++) {
                    var index = that.finalArray.findIndex(el => el.LOCATION_ID == items[i].getCells()[0].getText() && el.PRODUCT_ID == "NA");
                    if (index >= 0) {
                        that.finalArray.splice(index, 1);
                    } else {

                    }
                    var data = that.aLocProdData.filter(el => el.LOCATION_ID === items[i].getCells()[0].getText() && el.PRODUCT_ID == "NA");

                    if (data.length > 0) {
                        items[i].getCells()[2].setSelectedKey(data[0].PREDICTION_PROFILE);
                        items[i].getCells()[4].setSelectedKey(data[0].PLANNING_PROFILE);
                        items[i].getCells()[3].setSelectedKey(data[0].FORECASTING_PROFILE);
                        items[i].getCells()[5].setSelectedKey(data[0].OPTION_PERCENT);
                        items[i].getCells()[6].setSelectedKey(data[0].OPTIMIZATION_PROFILE);
                        items[i].getCells()[7].setSelectedKey(data[0].PERIOD_PROFILE);
                        items[i].getCells()[8].setSelectedKey(data[0].DERIVED_PROFILE);
                    }


                }
            } else {

                var items = that.byId("ProdListPA").getBinding("items").oList;
                for (let i = 0; i < items.length; i++) {

                    var index = that.finalArray.findIndex(el => el.PRODUCT_ID == items[i].PRODUCT_ID);
                    if (index >= 0) {
                        that.finalArray.splice(index, 1);
                    } else {

                    }



                    // var data = that.aLocProdData.filter(el => el.PRODUCT_ID === items[i].PRODUCT_ID);

                    // if (data.length > 0) {
                    //     items[i].getCells()[2].setSelectedKey(data[0].PREDICTION_PROFILE);
                    //     items[i].getCells()[4].setSelectedKey(data[0].PLANNING_PROFILE);
                    //     items[i].getCells()[3].setSelectedKey(data[0].FORECASTING_PROFILE);
                    //     items[i].getCells()[5].setSelectedKey(data[0].OPTION_PERCENT);
                    // }


                }
                var items = that.byId("ProdListPA").getItems();
                for (let i = 0; i < items.length; i++) {

                    var data = that.aLocProdData.filter(el => el.PRODUCT_ID === items[i].getCells()[0].getText());

                    if (data.length > 0) {
                        items[i].getCells()[2].setSelectedKey(data[0].PREDICTION_PROFILE);
                        items[i].getCells()[3].setSelectedKey(data[0].FORECASTING_PROFILE);
                        items[i].getCells()[4].setSelectedKey(data[0].PLANNING_PROFILE);
                        items[i].getCells()[5].setSelectedKey(data[0].OPTION_PERCENT);
                        items[i].getCells()[6].setSelectedKey(data[0].OPTIMIZATION_PROFILE);
                        items[i].getCells()[7].setSelectedKey(data[0].DERIVED_PROFILE);
                    }
                }
                //    var aArray = that.finalArray.filter(el => el.PRODUCT_ID == "NA");
                //     that.finalArray = aArray;
            }
        },
        onCopy: function (oEvent) {
            oGModel = this.getOwnerComponent().getModel("oGModel");
            // sap.ui.getCore().byId("idCopy").setVisible(true);
            // sap.ui.getCore().byId("idCopyForAll").setVisible(false);
            if (that.byId("ProdListPA").getVisible() == true) {
                var items = that.byId("ProdListPA").getItems();
                sap.ui.getCore().byId("CopyFragment").setTitle("Copy from Products");
                var sLoc = oEvent.getSource().getBindingContext().getObject().PRODUCT_ID;
                //  sap.ui.getCore().byId("idCopy").setHeaderText("Products");
            } else {
                var items = that.byId("LocSectionPA").getItems();
                sap.ui.getCore().byId("CopyFragment").setTitle("Copy from Locations");
                var sLoc = oEvent.getSource().getBindingContext().getObject().LOCATION_ID;
                // sap.ui.getCore().byId("idCopy").setHeaderText("Locations")
            }
            that.copyValue = [];
            that.copyData = [];

            for (let i = 0; i < items.length; i++) {
                var preP = items[i].getCells()[2].getSelectedKey();
                var planP = items[i].getCells()[4].getSelectedKey();
                var foretP = items[i].getCells()[3].getSelectedKey();
                var option = items[i].getCells()[5].getSelectedKey();
                var Optimiz = items[i].getCells()[6].getSelectedKey();
                // var Period = items[i].getCells()[7].getSelectedKey();
                if (preP !== "" && planP !== "" && foretP !== "") {
                    if (that.byId("LocSectionPA").getVisible() == true) {
                        var loc = items[i].getCells()[0].getText();
                        var Period = items[i].getCells()[7].getSelectedKey();
                        var Derive = items[i].getCells()[8].getSelectedKey();
                        var prod = "NA";


                    } else {
                        var prod = items[i].getCells()[0].getText();
                        var loc = that.oSelLoc;
                        var Period = "";
                        var Derive = items[i].getCells()[7].getSelectedKey();
                    }

                    var obj = {
                        LOCATION_ID: loc,
                        PRODUCT_ID: prod,
                        PREDICTION_PROFILE: preP,
                        PLANNING_PROFILE: planP,
                        FORECASTING_PROFILE: foretP,
                        OPTION_PERCENT: option,
                        OPTIMIZATION_PROFILE: Optimiz,
                        PERIOD_PROFILE: Period,
                        DERIVED_PROFILE: Derive
                    }
                    that.copyValue.push(obj);
                }
                else {
                    var obj = {
                        LOCATION_ID: items[i].getCells()[0].getText()
                    }
                    that.copyData.push(obj);
                }
            }
            that.copyLocValuemodel = new JSONModel();
            that.copyLocDatamodel = new JSONModel();

            // that.copyLocValuemodel.setData({
            //     copyLocValue: that.copyValue
            // });

            that.copyLocDatamodel.setData({
                copyLocData: that.copyData
            });

            if (that.byId("LocSectionPA").getVisible() === true) {
                that.sTes = that.copyValue.filter(el => el.LOCATION_ID === sLoc);
                oGModel.setProperty("/tableText", "Select Locations");
            } else {
                that.sTes = that.copyValue.filter(el => el.PRODUCT_ID === sLoc);
                oGModel.setProperty("/tableText", "Select Products");

            }
            if (that.sTes.length > 0) {
                // console.log(sTes)
                // oGModel.setProperty("/Location", sTes[0].LOCATION_ID);
                oGModel.setProperty("/PredModel", that.sTes[0].PREDICTION_PROFILE);
                oGModel.setProperty("/PlanModel", that.sTes[0].PLANNING_PROFILE);
                oGModel.setProperty("/ForecastModel", that.sTes[0].FORECASTING_PROFILE);
                oGModel.setProperty("/OptionModel", that.sTes[0].OPTION_PERCENT);
                oGModel.setProperty("/OptimizModel", that.sTes[0].OPTIMIZATION_PROFILE);
                oGModel.setProperty("/PeriodModel", that.sTes[0].PERIOD_PROFILE)



                // sap.ui.getCore().byId("idCopy").setModel(that.copyLocValuemodel);
                sap.ui.getCore().byId("idCopyForAll").setModel(that.copyLocDatamodel);
                sap.ui.getCore().byId("idCopyForAll").setVisible(true);


                that.copyfrag.open();
            } else {
                MessageToast.show("Please Select all profile maintained row")
            }





        },
        onClose: function () {
            that.copyfrag.close();
            // that.copyfrag.destroy(true);
            // that.copyfrag = null;
        },
        onCopyLoc: function (oEvent) {
            // that.selLoc = sap.ui.getCore().byId("idCopy").getSelectedItems()[0].getBindingContext().getObject();
            that.copyselLoc = sap.ui.getCore().byId("idCopyForAll").getSelectedItems();
            if (that.byId("LocSectionPA").getVisible() == true) {
                var items = that.byId("LocSectionPA").getItems();
            } else {
                var items = that.byId("ProdListPA").getItems();
            }
            that.dummyArray = [];
            for (var j = 0; j < that.copyselLoc.length; j++) {
                for (let i = 0; i < items.length; i++) {
                    if (that.copyselLoc[j].getCells()[0].getText() === items[i].getCells()[0].getText()) {
                        items[i].getCells()[2].setSelectedKey(that.sTes[0].PREDICTION_PROFILE);
                        items[i].getCells()[4].setSelectedKey(that.sTes[0].PLANNING_PROFILE);
                        items[i].getCells()[3].setSelectedKey(that.sTes[0].FORECASTING_PROFILE);
                        items[i].getCells()[5].setSelectedKey(that.sTes[0].OPTION_PERCENT);
                        items[i].getCells()[6].setSelectedKey(that.sTes[0].OPTIMIZATION_PROFILE);
                        // items[i].getCells()[7].setSelectedKey(that.sTes[0].PERIOD_PROFILE);

                        if (that.byId("LocSectionPA").getVisible() == true) {
                            var Prod = "NA";
                            var Loc = items[i].getCells()[0].getText();
                            var Period = items[i].getCells()[7].setSelectedKey(that.sTes[0].PERIOD_PROFILE);
                            items[i].getCells()[8].setSelectedKey(that.sTes[0].DERIVED_PROFILE);
                            var aDer = items[i].getCells()[8].getSelectedKey()
                        }
                        else {
                            var Prod = items[i].getCells()[0].getText();
                            var Loc = that.oSelLoc;
                            var Period = "";
                            items[i].getCells()[7].setSelectedKey(that.sTes[0].DERIVED_PROFILE);
                            var aDer = items[i].getCells()[7].getSelectedKey()
                            // items[i].getCells()[7].setSelectedKey("");
                        }
                        var obj = {
                            LOCATION_ID: Loc,
                            PRODUCT_ID: Prod,
                            PREDICTION_PROFILE: items[i].getCells()[2].getSelectedKey(),
                            PLANNING_PROFILE: items[i].getCells()[4].getSelectedKey(),
                            FORECASTING_PROFILE: items[i].getCells()[3].getSelectedKey(),
                            OPTION_PERCENT: items[i].getCells()[5].getSelectedKey(),
                            OPTIMIZATION_PROFILE: items[i].getCells()[6].getSelectedKey(),
                            DERIVED_PROFILE: aDer,
                            PERIOD_PROFILE: Period,
                            CREATED_DATE: new Date(),
                            CREATED_BY: that.User,
                        }
                        that.finalArray.push(obj);

                    }
                }
            }
            that.onClose();
        },
        onPivot: function (oEvent) {



            var sPrep = oEvent.mParameters.listItems[0].mAggregations.cells[2].getSelectedKey()
            var sOptimize = oEvent.mParameters.listItems[0].mAggregations.cells[6].getSelectedKey()
            var sFore = oEvent.mParameters.listItems[0].mAggregations.cells[3].getSelectedKey()
            // if (sPrep.length && sOptimize.length && sFore.length > 0) {

            if (that.finalArray.length > 0) {
                sap.m.MessageBox.warning("Unsaved changes are there. Do you want to save those changes?", {
                    title: "Warning",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            that.onSaveLoc(oEvent);


                        } else if (oAction === sap.m.MessageBox.Action.NO) {
                            sap.ui.core.BusyIndicator.hide();
                            // MessageToast.show("Operation canceled. No changes were saved.");
                        }
                    }
                });
            } else {
                that.onPivotTab(oEvent)
            }


            // }
            // else {
            // that.byId("LocSectionPA").removeSelections(true);
            // var aMissing = [];
            // var oCell1 = oEvent.mParameters.listItems[0].mAggregations.cells[2]
            // var oCell2 = oEvent.mParameters.listItems[0].mAggregations.cells[3]
            // var oCell3 = oEvent.mParameters.listItems[0].mAggregations.cells[6]



            // if (sPrep.length === 0) {
            //     oCell1.setValueState("Error");
            //     oCell1.setValueStateText("Please enter valid value");
            //     aMissing.push("1");
            // }

            // if (sFore.length === 0) {
            //     oCell2.setValueState("Error");
            //     oCell2.setValueStateText("Please enter valid value");
            //     aMissing.push("2");
            // }

            // if (sOptimize.length === 0) {
            //     oCell3.setValueState("Error");
            //     oCell3.setValueStateText("Please enter valid value");
            //     aMissing.push("3");
            // }

            // if (aMissing.length > 0) {

            // }

            that.byId("ProdListPA").removeSelections(true);
            // MessageToast.show("Please Maintain Required Profiles ");
            // MessageToast.show("Please Select a Maintained Profiles row")
            // }
        },
        onPivotTab: function (oEvent) {

            var loc = that.oSelLoc;
            var oSelProd = that.byId("ProdListPA").getSelectedItems()[0].mAggregations.cells[0].mProperties.text
            var sPlan = that.byId("ProdListPA").getSelectedItems()[0].mAggregations.cells[4].mProperties.selectedKey
            sap.ui.core.BusyIndicator.show();
            that.getOwnerComponent().getModel("BModel").read("/getProfileLocProd", {
                urlParameters: {
                    "$skip": 0,
                    "$top": 10000
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    that.aLocProdData = oData.results;
                    var aLocValidation = that.aLocProdData.filter(e => e.LOCATION_ID == loc && e.PRODUCT_ID == "NA");
                    var aProdValidation = that.aLocProdData.filter(e => e.PRODUCT_ID == oSelProd && e.LOCATION_ID == loc);
                    if (aLocValidation[0].PREDICTION_PROFILE.length > 0 && aLocValidation[0].OPTIMIZATION_PROFILE.length > 0 && aLocValidation[0].FORECASTING_PROFILE.length > 0) {
                        // if (aProdValidation[0].PREDICTION_PROFILE.length > 0 && aProdValidation[0].OPTIMIZATION_PROFILE.length > 0 && aProdValidation[0].FORECASTING_PROFILE.length > 0) {
                        var weeks;
                        if (sPlan) {
                            weeks = that.PlanningData.filter(el => el.PLANNING_PROFILE === sPlan);

                        } else {
                            weeks = [{
                                "PAST_PERIODS": 156,
                                "FUTURE_PERIODS": 26
                            }]
                        }
                        oGModel.setProperty("/weeksData", weeks);

                        // if(weeks){

                        // var loc = that.oSelLoc;
                        // var oSelProd = oEvent.getSource().getSelectedItem().getBindingContext().getObject().PRODUCT_ID;
                        sap.ui.core.BusyIndicator.show();
                        that.getOwnerComponent().getModel("BModel").callFunction("/getProductpidChars", {
                            method: "GET",
                            urlParameters: {
                                LOCATION_ID: loc,
                                PRODUCT_ID: oSelProd,
                                PAST_WEEKS: weeks[0].PAST_PERIODS,
                                FUTURE_WEEKS: weeks[0].FUTURE_PERIODS
                            },
                            success: function (oData) {
                                sap.ui.core.BusyIndicator.hide();
                                that.oPrimKeys = JSON.parse(oData.getProductpidChars);
                                oGModel = that.getOwnerComponent().getModel("oGModel");
                                oGModel.setProperty("/PivotData", that.oPrimKeys);
                                if (that.oPrimKeys.length > 0) {
                                    var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                                    oRouter.navTo("PivotTable", {}, true);
                                } else {
                                    MessageToast.show("No Data for selected Product");
                                }

                            },
                            error: function (oData, error) {
                                sap.ui.core.BusyIndicator.hide();
                                MessageToast.show("error");
                            },
                        })
                        // }
                        // else{
                        //     // MessageToast.show("")
                        //         sap.ui.core.BusyIndicator.hide();
                        // }
                        // }
                    } else {
                        that.byId("LocSectionPA").setVisible(true);
                        that.byId("ProdListPA").setVisible(false);
                        that.byId("ProdListPA").removeSelections(true);
                        MessageToast.show("Please Select Required Profiles")
                    }

                },
                error: function (oData, error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("error");
                },
            })




        },
        onLocationSearch: function (oEvent) {
            var oLocList = that.byId("LocSectionPA");
            var sQuery =
                oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                sId = oEvent.getParameter("id"),
                oFilters = [];
            sQuery = sQuery ? sQuery.trim() : "";

            var Tempdata = that.sLocation
            var filterData = Tempdata.filter(el => el.LOCATION_ID.toUpperCase().includes(sQuery.toUpperCase()) || el.LOCATION_DESC.toUpperCase().includes(sQuery.toUpperCase()));
            that.LocModel.setData({
                results: filterData
            });
            that.byId("LocSectionPA").setModel(that.LocModel);
            var items = that.byId("LocSectionPA").getItems();
            for (let i = 0; i < items.length; i++) {

                var data = that.finalArray.filter(el => el.LOCATION_ID === items[i].getCells()[0].getText() && el.PRODUCT_ID == "NA");
                if (data.length == 0) {
                    var data = that.aLocProdData.filter(el => el.LOCATION_ID === items[i].getCells()[0].getText() && el.PRODUCT_ID == "NA");
                }
                if (data.length > 0) {
                    items[i].getCells()[2].setSelectedKey(data[0].PREDICTION_PROFILE);
                    items[i].getCells()[4].setSelectedKey(data[0].PLANNING_PROFILE);
                    items[i].getCells()[3].setSelectedKey(data[0].FORECASTING_PROFILE);
                    items[i].getCells()[5].setSelectedKey(data[0].OPTION_PERCENT);
                    items[i].getCells()[6].setSelectedKey(data[0].OPTIMIZATION_PROFILE);
                    items[i].getCells()[7].setSelectedKey(data[0].PERIOD_PROFILE);
                    items[i].getCells()[8].setSelectedKey(data[0].DERIVED_PROFILE);

                }
                else {
                    items[i].getCells()[2].setSelectedKey("");
                    items[i].getCells()[4].setSelectedKey("");
                    items[i].getCells()[3].setSelectedKey("");
                    items[i].getCells()[5].setSelectedKey("");
                    items[i].getCells()[6].setSelectedKey("");
                    items[i].getCells()[7].setSelectedKey("");
                    items[i].getCells()[8].setSelectedKey("");

                }

            }

        },
        onProductSearch: function (oEvent) {
            var oProdList = that.byId("ProdListPA");
            var sQuery =
                oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                sId = oEvent.getParameter("id"),
                oFilters = [];
            sQuery = sQuery ? sQuery.trim() : "";

            var Tempdata = that.prodData;
            var filterData = Tempdata.filter(el => el.PRODUCT_ID.toUpperCase().includes(sQuery.toUpperCase()) || el.PROD_DESC.toUpperCase().includes(sQuery.toUpperCase()));


            that.ProdModel.setData({
                ProdModel: filterData
            });
            that.byId("ProdListPA").setModel(that.ProdModel);
            var items = that.byId("ProdListPA").getItems();
            for (let i = 0; i < items.length; i++) {

                var data = that.finalArray.filter(el => el.LOCATION_ID === that.oSelLoc && el.PRODUCT_ID == items[i].getCells()[0].getText());
                if (data.length == 0) {
                    var data = that.aLocProdData.filter(el => el.LOCATION_ID === that.oSelLoc && el.PRODUCT_ID == items[i].getCells()[0].getText());
                }
                if (data.length > 0) {
                    items[i].getCells()[2].setSelectedKey(data[0].PREDICTION_PROFILE);
                    items[i].getCells()[4].setSelectedKey(data[0].PLANNING_PROFILE);
                    items[i].getCells()[3].setSelectedKey(data[0].FORECASTING_PROFILE);
                    items[i].getCells()[5].setSelectedKey(data[0].OPTION_PERCENT);
                    items[i].getCells()[6].setSelectedKey(data[0].OPTIMIZATION_PROFILE);
                    items[i].getCells()[7].setSelectedKey(data[0].DERIVED_PROFILE);
                }
                else {
                    items[i].getCells()[2].setSelectedKey("");
                    items[i].getCells()[4].setSelectedKey("");
                    items[i].getCells()[3].setSelectedKey("");
                    items[i].getCells()[5].setSelectedKey("");
                    items[i].getCells()[6].setSelectedKey("");
                    items[i].getCells()[7].setSelectedKey("");
                }

            }
        },
        getGenPartialProd: function (oSelLoc, prodData) {
            var topCount = 50000;
            that.getOwnerComponent().getModel("BModel").read("/genPartialProd", {
                filters: [
                    new Filter("LOCATION_ID", FilterOperator.EQ, oSelLoc),
                ],
                headers: {
                    "x-user-id": that.User,
                },
                urlParameters: {
                    "$skip": that.skip,
                    "$top": topCount
                },
                success: function (oData) {
                    if (topCount == oData.results.length) {
                        that.skip += parseInt(topCount);
                        prodData = prodData.concat(oData.results);
                        that.getGenPartialProd();
                    }
                    else {
                        that.skip = 0;
                        that.prodData = prodData.concat(oData.results);
                        sap.ui.core.BusyIndicator.hide();
                        oData.results = that.prodData;
                        oGModel = that.getOwnerComponent().getModel("oGModel");
                        oGModel.setProperty("/ProdData", that.prodData);
                        that.ProdModel.setSizeLimit(oData.results)
                        that.ProdModel.setData({
                            ProdModel: oData.results
                        });
                        that.byId("ProdListPA").setModel(that.ProdModel);
                        var items = that.byId("ProdListPA").getItems();
                        for (let i = 0; i < items.length; i++) {

                            var data = that.aLocProdData.filter(el => el.PRODUCT_ID === items[i].getCells()[0].getText());

                            if (data.length > 0) {
                                items[i].getCells()[2].setSelectedKey(data[0].PREDICTION_PROFILE);
                                items[i].getCells()[4].setSelectedKey(data[0].PLANNING_PROFILE);
                                items[i].getCells()[3].setSelectedKey(data[0].FORECASTING_PROFILE);
                                items[i].getCells()[5].setSelectedKey(data[0].OPTION_PERCENT);
                                items[i].getCells()[6].setSelectedKey(data[0].OPTIMIZATION_PROFILE);
                                items[i].getCells()[7].setSelectedKey(data[0].DERIVED_PROFILE);
                                if (data[0].CHANGED_BY != null) {
                                    items[i].getCells()[8].setTitle(data[0].CHANGED_BY);
                                }
                                if (data[0].CHANGED_DATE != null) {
                                    items[i].getCells()[8].setText(data[0].CHANGED_DATE.toISOString().split('T')[0]);
                                }
                            }
                        }

                        var items = that.byId("ProdListPA").getItems();
                        for (let j = 0; j < items.length; j++) {
                            var data1 = that.finalArray.filter(el => el.PRODUCT_ID == items[j].getCells()[0].getText() && el.LOCATION_ID == oSelLoc);
                            if (data1.length > 0) {
                                items[j].getCells()[2].setSelectedKey(data1[0].PREDICTION_PROFILE);
                                items[j].getCells()[4].setSelectedKey(data1[0].PLANNING_PROFILE);
                                items[j].getCells()[3].setSelectedKey(data1[0].FORECASTING_PROFILE);
                                items[j].getCells()[5].setSelectedKey(data1[0].OPTION_PERCENT);
                                items[j].getCells()[6].setSelectedKey(data1[0].OPTIMIZATION_PROFILE);
                                items[j].getCells()[7].setSelectedKey(data1[0].DERIVED_PROFILE);
                            }
                        }
                    }

                },
                error: function (oData, error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("error");
                },
            })
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
                oStorage.put("nodeId", 77);
                //Generate a  URL for the second application
                var url = window.location.href.split('#')[0] + hash;
                //Navigate to second app
                sap.m.URLHelper.redirect(url, true);
            }
        },

    });
});