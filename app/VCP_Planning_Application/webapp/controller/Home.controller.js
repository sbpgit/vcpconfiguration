sap.ui.define(
  [
    "vcpapp/vcpplanningapps1/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "sap/m/Token"
  ],
  function (
    BaseController,
    JSONModel,
    MessageToast,
    MessageBox,
    Filter,
    FilterOperator,
    Device,
    Token
  ) {
    "use strict";
    var that = this;
    var oGModel;

    var prodSel = [];
    var SprodSel = [];
    var aResults;
    // var aResults = [ { 
    //   "CREATE_CHK": "enabled",
    //   "UPDATE_CHK": "enabled",
    //   "DELETE_CHK": "enabled"
    //    }]

    // Base controller funciton
    return BaseController.extend("vcpapp.vcpplanningapps1.controller.Home", {
      onInit() {
        var oRoute;
        that = this;
        that.new = 0;
        that.data = [];
        oGModel = that.getOwnerComponent().getModel("oGModel");
        that.oModel = that.getOwnerComponent().getModel("PCModel");
        this.bus = sap.ui.getCore().getEventBus();
        this.bus.subscribe(
          "vcpapp.vcpplanningapps1",
          "addBeginPage",
          this.addBeginPage,
          this
        );
        this.bus.subscribe(
          "vcpapp.vcpplanningapps1",
          "addDetailPage",
          this.addDetailPage,
          this
        );
        this.bus.subscribe("nav", "toBeginPage", this.toBeginPage, this);
        this.bus.subscribe("nav", "toDetailPage", this.toDetailPage, this);
        this.bus.subscribe("nav", "backToBegin", this.backToBegin, this);
        this.bus.subscribe("nav", "expandBegin", this.expandBegin, this);

        var oViewModel = new JSONModel({
          sideMenuBurgerVisible: !Device.system.desktop, // Show on mobile/tablet, hide on desktop
          expanded: false
        });

        this.getView().setModel(oViewModel, "appView");

        that._updateMenuVisibility();

        // Attach resize event
        sap.ui.Device.resize.attachHandler(this._updateMenuVisibility.bind(this));

        this.oFlexibleColumnLayout = this.byId("fcl");
        this.getRouter()
          .getRoute("Home")
          .attachPatternMatched(this._onPatternMatched.bind(this));
        if (Device.system.phone) {
          this.oFlexibleColumnLayout.setLayout(
            sap.f.LayoutType.MidColumnFullScreen
          );
        } else {
          this.oFlexibleColumnLayout.setLayout(
            sap.f.LayoutType.TwoColumnsMidExpanded
          );
        }
        var oViewModel = new JSONModel({
          expanded: true,
          midExists: false,
          busy: true,
          delay: 0,
        });

        if (!that._pPopover) {
          that._pPopover = sap.ui.xmlfragment("vcpapp.vcpplanningapps1.view.Configuration", that);
          that.getView().addDependent(that._pPopover);
        }

        this.setModel(oViewModel, "appView");

        if (Device.support.touch) {
          Device.orientation.attachHandler(function (oEvt) {
            NotificationObj.onAfterRendering();
            NotificationObj.iconWidth = 0;
            NotificationObj.oldBeginColNoImgWidth = 0;
            NotificationObj.newMidColumnWidth = 0;
          });
        }
        //    that.getData();
        //Authnetication function
        //   that.getDisabled();

      },
      _updateMenuVisibility: function () {
        var oViewModel = this.getView().getModel("appView");

        if (Device.system.desktop) {
          this.byId("leftMenu").setVisible(true);
          oViewModel.setProperty("/expanded", false);
        } else {
          this.byId("leftMenu").setVisible(false);
          oViewModel.setProperty("/sideMenuBurgerVisible", false);
          oViewModel.setProperty("/expanded", false);
        }
      },

      onChangeLogsPress: function () {

        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
        oRouter.navTo("Changelogs", {}, true);
      },

      onCreateJob: function () {
        // that._demandDialog.destroy();
        // that._factoryDialog.destroy();
        // that._productDialog.destroy();
        // that._planDialog.destroy();
        that.byId("headSearch").setValue("")
        that.oGModel.setProperty("/EditFlag", "");
        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
        oRouter.navTo("CreateJob", {}, true);
      },

      onSelect: function (oEvent) {
        that.getOwnerComponent().getModel("PCModel").read("/getTelescopicValues", {
          success: function (oData) {
            that.oTotalCount = JSON.parse(oData.getTelescopicValues);
            //that.getData();
            sap.ui.core.BusyIndicator.hide();
          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide();
          },
        });
        that.onSelect = oEvent.oSource.getSelectedKey();
        that._onPatternMatched();
        that.prevSelect = that.onSelect
        // if (that.new == 0) {
        //   that.onGetData();
        // }
        if (that.onSelect == "network") {
          that.onGetData();
        }
        that.new++;
      },
      // User Authentication 
      getDisabled: function () {
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
            that.aResults = oData.results;
            // that.aResults = [{

            //   "CREATE_CHK": "enabled",

            //   "UPDATE_CHK": "enabled",

            //   "DELETE_CHK": "enabled"

            // }];

            if (that.aResults.length > 0) {
              var isUserLoggedIn = true;
            }

            if (isUserLoggedIn) {
              if (that.aResults[0].CREATE_CHK === "disabled") {
                that.byId("create").setEnabled(false);

              }
              if (that.aResults[0].READ_CHK === "disabled") {
                that.byId("idConfig").setEnabled(false);
              }
            }
            else {
              that.byId("create").setEnabled(false);
              that.byId("idConfig").setEnabled(false);
            }
          },
          error: function (oData, error) {
            MessageToast.show("error");
          }
        });
      },
      /**
 * Called after the view has been rendered.
 */
      onAfterRendering: function () {
        that = this;
        that.data = [];
        that.oDmdLoc = [];
        that.oFctData = [];
        that.ProdData = [];
        var oViewModel = this.getModel("appView");// 
        /**  Removing the arrow button inbetween pages(ItemMaster and ItemDetail)*/
        if (this.getView().byId("fcl").mAggregations._midColumnForwardArrow !== undefined) {
          this.getView().byId("fcl").mAggregations._midColumnForwardArrow.setVisible(false);
        }

        if (!that.oCopyDialog) {
          that.oCopyDialog = sap.ui.xmlfragment(
            "vcpapp.vcpplanningapps1.view.Create",
            that
          );
          that.getView().addDependent(that.oCopyDialog);
        }
        // this.getView()
        //     .byId("fcl")
        //     .mAggregations._midColumnForwardArrow.setVisible(false);
        /* Menu button option for Device and Desktop*/
        // if (!Device.system.desktop) {
        //   this.byId("leftMenu").setVisible(true);
        //   this.getModel("appView").setProperty("/expanded", false);
        // } else {
        //   oViewModel.setProperty("/sideMenuBurgerVisible", false);
        //   oViewModel.setProperty("/expanded", false);
        // }
        // var oButton = this.getView().byId("leftMenu");

        // if (oButton) {
        //     // Show the button only on mobile/tablet, hide it on desktops
        //     oButton.setVisible(Device.system.phone || Device.system.tablet);
        //     this.byId("leftMenu").setVisible(true);
        //     this.getModel("appView").setProperty("/expanded", false);
        // }
        // if (!that.oMenuDialog) {
        //     that.oMenuDialog = sap.ui.xmlfragment("vcpapp.vcpplanningconfiguration.view.UpdateConfig", that);
        //     that.getView().addDependent(that.oMenuDialog);
        // }

        // Get Global Configuration Data
        that.skip = 0;
        that.oGModel = that.getOwnerComponent().getModel("oGModel")
        sap.ui.core.BusyIndicator.show();
        that.getOwnerComponent().getModel("PCModel").read("/getUserPreferences", {
          filters: [
            new sap.ui.model.Filter("PARAMETER", sap.ui.model.FilterOperator.EQ, "MAX_RECORDS")
          ],
          success: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            that.oGModel.setProperty("/MaxCount", oData.results[0].PARAMETER_VALUE);

            that.onGetData();
            that.getParameters();

          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide();
            console.log(error)
          },
        });

        that.getOwnerComponent().getModel("PCModel").read("/getTelescopicValues", {
          success: function (oData) {
            that.oTotalCount = JSON.parse(oData.getTelescopicValues);

            sap.ui.core.BusyIndicator.hide();
          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide();
          },
        });

        // that.getOwnerComponent().getModel("PCModel").read("/getTelescopicData", {
        //   success: function (oData) {
        //     that.oSave = oData.results.length
        //     sap.ui.core.BusyIndicator.hide();
        //   },
        //   error: function (oData, error) {
        //     sap.ui.core.BusyIndicator.hide();
        //   },
        // });




        that.getData();



      },
      /**
 * To set the master page
 * @param {string} sChannel - Event channel
 * @param {string} sEvent - Event name
 * @param {object} oView - View to be displayed
 */
      addBeginPage: function (sChannel, sEvent, oView) {
        this.oFlexibleColumnLayout.addBeginColumnPage(oView);
      },
      /**
 * Lazy loader for the mid page - only on demand (when the user clicks)
 * @param {string} sChannel - Event channel
 * @param {string} sEvent - Event name
 * @param {object} oView - View to be displayed
 */
      addDetailPage: function (sChannel, sEvent, oView) {
        var aPages = this.oFlexibleColumnLayout.getMidColumnPages(),
          bFound = false;
        for (var i = 0; i < aPages.length; i++) {
          if (aPages[i].getProperty("viewName") === oView.getViewName()) {
            bFound = true;
            break;
          } else {
            bFound = false;
          }
        }
        if (!bFound) {
          this.oFlexibleColumnLayout.addMidColumnPage(oView);
        }
      },
      /**
 * To initialize master page
 * @param {string} sChannel - Event channel
 * @param {string} sEvent - Event name
 * @param {object} oView - View to be displayed
 */
      toBeginPage: function (sChannel, sEvent, oView) {
        var aPages = this.oFlexibleColumnLayout.getBeginColumnPages();
        for (var i = 0; i < aPages.length; i++) {
          if (aPages[i].getProperty("viewName") === oView.viewName) {
            this.oFlexibleColumnLayout.toBeginColumnPage(
              this.oFlexibleColumnLayout.getBeginColumnPages()[i]
            );
            break;
          }
        }
      },
      /**
 * To get the required detail page
 * @param {string} sChannel - Event channel
 * @param {string} sEvent - Event name
 * @param {object} oView - View to be displayed
 */
      toDetailPage: function (sChannel, sEvent, oView) {
        var aPages = this.oFlexibleColumnLayout.getMidColumnPages();
        for (var i = 0; i < aPages.length; i++) {
          if (aPages[i].getProperty("viewName") === oView.viewName) {
            this.oFlexibleColumnLayout.toMidColumnPage(
              this.oFlexibleColumnLayout.getMidColumnPages()[i]
            );
            break;
          }
        }
        this.oFlexibleColumnLayout.setLayout(
          sap.f.LayoutType.TwoColumnsMidExpanded
        );
        /* Adding ItemDetail page */
        if (aPages.length < 1) {
          this.getOwnerComponent().runAsOwner(
            function () {
              this.detailView = sap.ui.view({
                viewName: "vcpapp.vcpplanningapps1.view.ConfigHome",
                type: "XML"
              });
              this.oFlexibleColumnLayout.addMidColumnPage(this.detailView);
            }.bind(this)
          );
        } else {
          this.oFlexibleColumnLayout.addMidColumnPage(aPages[0]);
          aPages[0].onAfterRendering();
        }
      },
      /**
 * To show only the master page
 */
      backToBegin: function () {
        this.oFlexibleColumnLayout.setLayout(sap.f.LayoutType.OneColumn);
      },

      /**
       * 
       */
      getData: function (oEvent) {
        var oModel = that.getOwnerComponent().getModel('PCModel');
        oGModel = that.getOwnerComponent().getModel('oGModel');
        var oResults = {};
        sap.ui.core.BusyIndicator.show();
        oModel.callFunction("/getGlobalPlanningConfig", {
          method: "GET",
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide();
            // sap.m.MessageToast.show(oResponse.data.updateGlobaPlanningConfig);
            if (oData.getGlobalPlanningConfig) {
              that.oWeeks = []
              oResults = JSON.parse(oData.getGlobalPlanningConfig);
              oGModel.setProperty("/globalConfig", oResults);
              that.oPrevDetails = oResults
              that.byId("idSeedOrderSeriesPC").setValue(oResults.SEEDORDSEQ);
              that.byId("idSeedOrderPrefixPC").setValue(oResults.SOPREFIX);
              that.byId("idPirPlanReq").setValue(oResults.PIRPLANREQ);
              that.byId("idIBPPlanAreaPC").setValue(oResults.IBPPLANAREA);
              that.byId("idIBPPrefixPC").setValue(oResults.IBPPREFIX);
              that.byId("Version").setValue(oResults.IBPVERSION);
              that.byId("Scenario").setValue(oResults.IBPSCENARIO);
              that.oWeeks = oResults.WEEKS
              that.byId("idWeek").setValue(oResults.WEEKS);
              that.byId("idmonth").setValue(oResults.MONTHS);
              that.byId("idQuart").setValue(oResults.QUARTER);
              //   that.oSave = 0
              // if (that.oSave.length === 0) {
              //   // that.byId("idWeek").setEditable(false)
              //   // that.byId("idmonth").setEditable(false)
              //   // that.byId("idQuart").setEditable(false)
              //     sap.MessageToast.show("Telescopic periods already generated do you still want to change ?") 
              //   //  return false
              // } else {
              //   that.byId("idWeek").setEditable(true)
              //   that.byId("idmonth").setEditable(true)
              //   that.byId("idQuart").setEditable(true)
              // }

              that.byId("idValidityPC").setSelected(oResults.IDENTIFY_RULE_VALIDITY);
              if (oResults.IDENTIFY_PVS_NODE === "true") {
                that.byId("idPvsnode").setSelected(true);
              }
              else {
                that.byId("idPvsnode").setSelected(false);
              }
              that.byId("idPInterMediateAssem").setSelected(oResults.INTER_ASSEMBLY);
              if (oResults.INTER_ASSEMBLY === "true" || oResults.INTER_ASSEMBLY === true) {
                that.byId("idPInterMediateAssem").setSelected(true)
              }
              else {
                that.byId("idPInterMediateAssem").setSelected(false)
              }
              // sap.ui.getCore().byId("idPvsnode").setSelected(false);
            }
          },
          error: function (oResponse) {
            sap.m.MessageToast.show("Failed to get planning config, please try later!");
          },
        });
      },

      // live change validation for weeks/months/quartely input fields
      // onLiveChangeNumberOnly: function (oEvent) {
      //   var oInput = oEvent.getSource();
      //   var sValue = oInput.getValue();
      //   var inputId = oInput.getId();

      //   // Check if value is empty
      //   if (sValue === "" || parseInt(sValue) === 0) {
      //     oInput.setValueState("Error");
      //     oInput.setValueStateText("This field is required and must be greater than 0.");
      //     return;
      //   }

      //   if (/^\d*$/.test(sValue)) {
      //     var inputValue = parseFloat(sValue);

      //     // quarterly validation
      //     if (inputId.includes("idQuart")) {
      //       if (inputValue % 3 !== 0) {
      //         oInput.setValueState("Error");
      //         oInput.setValueStateText("Value must be a multiples of 3");
      //         return;
      //       }
      //     }

      //     oInput.setValueState("None");
      //   } else {
      //     oInput.setValueState("Error");
      //     oInput.setValueStateText("Only numeric values are allowed.");
      //     return
      //   }
      // },


      // onLiveChangeNumberOnly: function (oEvent) {
      //   var that = this;
      //   var oInput = oEvent.getSource();
      //   var sValue = oInput.getValue();
      //   var inputId = oInput.getId();

      //   // Total months allowed
      //   var totalMonths = that.oTotalCount.TotalMonths;

      //   // Check if value is empty or zero
      //   if (sValue === "" || parseInt(sValue) === 0) {
      //     oInput.setValueState("Error");
      //     oInput.setValueStateText("This field is required and must be greater than 0.");
      //     return;
      //   }

      //   // Check if value is numeric
      //   if (/^\d*$/.test(sValue)) {
      //     var inputValue = parseFloat(sValue);

      //     if (inputId.includes("idQuart") && inputValue % 3 !== 0) {
      //       oInput.setValueState("Error");
      //       oInput.setValueStateText("Value must be a multiple of 3.");
      //       return;
      //     }
      //     else {
      //       oInput.setValueState("Success");
      //       oInput.setValueStateText("Value is valid.");
      //     }


      //     var week = parseInt(this.byId("idWeek").getValue()) || 0;
      //     var month = parseInt(this.byId("idmonth").getValue()) || 0;
      //     var quarterly = parseInt(this.byId("idQuart").getValue()) || 0;


      //     if (inputId.includes("idWeek")) week = inputValue;
      //     else if (inputId.includes("idmonth")) month = inputValue;
      //     else if (inputId.includes("idQuart")) quarterly = inputValue;


      //     var sum = week + month + quarterly;
      //     if (sum > totalMonths) {
      //       oInput.setValueState("Error");
      //       oInput.setValueStateText("Sum of all periods must not exceed " + totalMonths + " months.");
      //       return;
      //     }
      //     else {
      //       oInput.setValueState("Success");
      //       oInput.setValueStateText("Value is valid.");
      //     }

      //     oInput.setValueState("Success");
      //     oInput.setValueStateText("Value is valid.");

      //   } else {
      //     oInput.setValueState("Error");
      //     oInput.setValueStateText("Only numeric values are allowed.");
      //     return;
      //   }
      // },


      onLiveChangeNumberOnly: function (oEvent) {
        var that = this;
        var oInput = oEvent.getSource();
        var sValue = oInput.getValue();
        var inputId = oInput.getId();

        var totalMonths = that.oTotalCount.TotalMonths;

        // Basic validation: empty or zero
        if (sValue === "" || parseInt(sValue) === 0) {
          oInput.setValueState("Error");
          oInput.setValueStateText("This field is required and must be greater than 0.");
          return;
        }

        if (/^\d*$/.test(sValue)) {
          var inputValue = parseFloat(sValue);

          // Quarterly must be multiple of 3
          if (inputId.includes("idQuart") && inputValue % 3 !== 0) {
            oInput.setValueState("Error");
            oInput.setValueStateText("Value must be a multiple of 3.");
            return;
          }

          // Get references to all inputs
          var oWeekInput = this.byId("idWeek");
          var oMonthInput = this.byId("idmonth");
          var oQuarterInput = this.byId("idQuart");

          // Get current values
          var week = parseInt(oWeekInput.getValue()) || 0;
          var month = parseInt(oMonthInput.getValue()) || 0;
          var quarter = parseInt(oQuarterInput.getValue()) || 0;

          // Update the changed value
          if (inputId.includes("idWeek")) week = inputValue;
          else if (inputId.includes("idmonth")) month = inputValue;
          else if (inputId.includes("idQuart")) quarter = inputValue;

          var total = week + month + quarter;

          if (total !== totalMonths && totalMonths > 0) {
            oInput.setValueState("Error");
            oInput.setValueStateText("Sum of all periods should  be " + totalMonths + " months.");
          } else {
            // Set all to success
            oWeekInput.setValueState("Success");
            oWeekInput.setValueStateText("Valid");
            oMonthInput.setValueState("Success");
            oMonthInput.setValueStateText("Valid");
            if (parseInt(oQuarterInput.getValue()) % 3 !== 0) {
              oQuarterInput.setValueState("Error");
              oQuarterInput.setValueStateText("Value should be a multiple of 3.");
              return;
            } else {
              oQuarterInput.setValueState("Success");
              oQuarterInput.setValueStateText("Valid");
            }
          }

        } else {
          oInput.setValueState("Error");
          oInput.setValueStateText("Only numeric values are allowed.");
        }
      },


      /**
       * onSaveConfiguration
       * @param {*} oEvent 
       */


      onSaveConfiguration: function (oEvent) {
        var oWeeks = that.byId("idWeek");
        var oMonth = that.byId("idmonth");
        var Quart = that.byId("idQuart");

        function isInvalidInteger(value) {
          return !value || !/^\d+$/.test(value) || parseInt(value) <= 0;
        }

        var isWeekInvalid = isInvalidInteger(oWeeks.getValue());
        var isMonthInvalid = isInvalidInteger(oMonth.getValue());
        var isQuartInvalid = isInvalidInteger(Quart.getValue());

        if (isWeekInvalid || isMonthInvalid || isQuartInvalid) {
          sap.m.MessageToast.show("Weeks, Months, & Quarterly values should be enter numbers only.");

          oWeeks.setValueState(isWeekInvalid ? "Error" : "None");
          oWeeks.setValueStateText("Weeks values should be enter numbers only.");

          oMonth.setValueState(isMonthInvalid ? "Error" : "None");
          oMonth.setValueStateText("Months values should be enter numbers only.");

          Quart.setValueState(isQuartInvalid ? "Error" : "None");
          Quart.setValueStateText("Quarterly values should be enter numbers only");

          return;
        }

        var weeksVal = parseInt(oWeeks.getValue());
        var monthVal = parseInt(oMonth.getValue());
        var quartVal = parseInt(Quart.getValue());
        var oTotalValues = weeksVal + monthVal + quartVal;

        var months = that.oTotalCount && that.oTotalCount.TotalMonths;


        if (!months || !that.oPrevDetails || Object.keys(that.oPrevDetails).length === 0) {
          that.oFlag = "";
          if (quartVal % 3 !== 0) {
            Quart.setValueState("Error");
            Quart.setValueStateText("Value should be a multiple of 3");
            sap.m.MessageToast.show("Quarterly value should be a multiple of 3");
            return;
          }

          // Check all values > 0 again for final safeguard
          if (weeksVal <= 0 || monthVal <= 0 || quartVal <= 0) {
            sap.m.MessageToast.show("Weeks, Months, and Quarterly values should be greater than 0.");
            return;
          }

          that.onSaveConfigurationConfirm(oEvent);
          return;
        }

        var months = that.oTotalCount.TotalMonths;

        // if (oTotalValues > months && months > 0) {
        // if (total !== totalMonths && totalMonths > 0) {
        if (oTotalValues !== months) {
          sap.m.MessageToast.show("Total Telescopic period months should be equal to " + months + " months.")
          // Total of weeks, months, and quarterly values must be less than or equal to " + months + " months");
          return;
        }

        if (quartVal % 3 !== 0) {
          Quart.setValueState("Error");
          Quart.setValueStateText("Value should be a multiple of 3");
          sap.m.MessageToast.show("Quarterly value should be a multiple of 3");
          return;
        }

        // Check all values > 0 again for final safeguard
        if (weeksVal <= 0 || monthVal <= 0 || quartVal <= 0) {
          sap.m.MessageToast.show("Weeks, Months, and Quarterly values should be greater than 0.");
          return;
        }

        var loEvent = oEvent;

        //  that.oTotalCount.fcharPlan = 0;
        /* if fcharPlan count is 0 we can edit and update directly */
        if (that.oTotalCount.fcharPlan === 0) {
          if (that.oPrevDetails.WEEKS === oWeeks.getValue() && that.oPrevDetails.MONTHS === oMonth.getValue() && that.oPrevDetails.QUARTER === Quart.getValue()) {
            that.oFlag = ""
            that.onSaveConfigurationConfirm();
          }
          else {
            that.oFlag = "X"
            if (Quart.getValue() % 3 !== 0) {
              Quart.setValueState("Error");
              Quart.setValueStateText("Value must be a multiples of 3");
              return;
            }
            that.onSaveConfigurationConfirm();

          }

        } else {   //  fcharPlan count greater than 0
          if (that.oPrevDetails.WEEKS === oWeeks.getValue() && that.oPrevDetails.MONTHS === oMonth.getValue() && that.oPrevDetails.QUARTER === Quart.getValue()) {
            if (Quart.getValue() % 3 !== 0) {
              Quart.setValueState("Error");
              Quart.setValueStateText("Value should be a multiples of 3");
              sap.m.MessageToast.show("Quarterly value should be multiples of 3")
              return;
            } else {
              if (
                !oWeeks.getValue() || parseInt(oWeeks.getValue()) === 0 ||
                !oMonth.getValue() || parseInt(oMonth.getValue()) === 0 ||
                !Quart.getValue() || parseInt(Quart.getValue()) === 0
              ) {
                sap.m.MessageToast.show("Weeks, Months, & Quarterly values should be greater than 0.");
                return;
              }

              that.oFlag = ""
              that.onSaveConfigurationConfirm();
            }
          }
          else {
            that.oFlag = "X"
            if (Quart.getValue() % 3 !== 0) {
              Quart.setValueState("Error");
              Quart.setValueStateText("Value should be a multiples of 3");
              return;
            }
            if (!that.oSubmitDialog) {
              that.oSubmitDialog = new sap.m.Dialog({
                type: sap.m.DialogType.Message,
                title: "Warning",
                icon: "sap-icon://message-warning", // Adds warning icon
                state: sap.ui.core.ValueState.Warning, // Applies yellow/orange border
                content: [
                  new sap.m.Label({
                    text: "Telescopic periods already generated. Do you still want to change?"
                    // design: "Bold"
                  })
                ],
                beginButton: new sap.m.Button({
                  type: sap.m.ButtonType.Emphasized,
                  text: "Yes",
                  press: function () {
                    that.oSubmitDialog.close();
                    that.onSaveConfigurationConfirm(loEvent);
                  }
                }),
                endButton: new sap.m.Button({
                  text: "No",
                  type: sap.m.ButtonType.Reject, // Red "No" button
                  press: function () {
                    that.oSubmitDialog.close();
                    that.getData();
                  }
                })
              });
            }

            that.oSubmitDialog.open();
          }

        }
      },

      /**
       * onSaveConfigurationConfirm function
       * @param {*} oEvent 
       */
      onSaveConfigurationConfirm: function (oEvent) {
        that.byId("idWeek").setEnabled(true)
        that.byId("idmonth").setEnabled(true)
        that.byId("idQuart").setEnabled(true)
        var oModel = that.getOwnerComponent().getModel('PCModel');
        var oEntry = {};
        oEntry.SEEDORDSEQ = that.byId("idSeedOrderSeriesPC").getValue();
        oEntry.SOPREFIX = that.byId("idSeedOrderPrefixPC").getValue();
        var sPirPlanReq = that.byId("idPirPlanReq").getValue().trim();


        if (!/^(?![IVPivp])[A-Za-z][A-Za-z0-9_]*$/.test(sPirPlanReq)) {
          sap.m.MessageBox.error(
            "PIR Plan Req must start with a letter, cannot start with I, V, or P, and can contain only letters, numbers, and underscore (_)."
          );
          return;
        }
        oEntry.PIRPLANREQ = sPirPlanReq;
        // oEntry.PIRPLANREQ = that.byId("idPirPlanReq").getValue();
        oEntry.IBPPLANAREA = that.byId("idIBPPlanAreaPC").getValue();
        oEntry.IBPPREFIX = that.byId("idIBPPrefixPC").getValue();
        oEntry.IDENTIFY_RULE_VALIDITY = that.byId("idValidityPC").getSelected();
        oEntry.IDENTIFY_PVS_NODE = that.byId("idPvsnode").getSelected().toString();
        oEntry.IBPVERSION = that.byId("Version").getValue();
        oEntry.IBPSCENARIO = that.byId("Scenario").getValue();
        oEntry.INTER_ASSEMBLY = that.byId("idPInterMediateAssem").getSelected().toString();
        oGModel.setProperty("/version", oEntry.IBPVERSION);
        oGModel.setProperty("/oScenario", oEntry.IBPSCENARIO);
        oEntry.WEEKS = that.byId("idWeek").getValue();
        oEntry.MONTHS = that.byId("idmonth").getValue();
        oEntry.QUARTER = that.byId("idQuart").getValue()
        oEntry.USER = "narendrakumark@sbpcorp.in" //that.getUserDetails()
        sap.ui.core.BusyIndicator.show();
        oModel.callFunction("/updateGlobaPlanningConfig", {
          method: "GET",
          urlParameters: {
            Flag: that.oFlag,
            PARAMVALUES: JSON.stringify(oEntry)
          },
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide();
            if (that._pPopover) {
              that._pPopover.close();
            }

            // Get Updated global config data if any location is already selected to view/update planning config

            var sLocation = oGModel.getProperty("/location");
            if (sLocation !== undefined || sLocation !== "") {
              that._onPatternMatched();
            }
            if (oResponse.data.updateGlobaPlanningConfig.includes("Successfull")) {
              sap.m.MessageToast.show("Global Configuration Updated Successfully")

              that.getData();
            } else {
              sap.m.MessageToast.show(oResponse.data.updateGlobaPlanningConfig);
            }

          },
          error: function (oResponse) {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageToast.show("Failed to update planning config, please try later!");
          },
        });
      },

      getParameters: function () {
        var aParameters = [];
        that.oFrozenvalue = [];
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
              that.oFrozenvalue = that.oFrozenvalue.concat(oData.results);
              that.getParameters();
            } else {
              that.skip = 0;
              that.oFrozenvalue = that.oFrozenvalue.concat(oData.results);

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
 * Called when the URL matches pattern "Details"
 * @constructor
 */
      _onPatternMatched: function () {
        if (that.onSelect != "network") {
          this.oFlexibleColumnLayout.setLayout(sap.f.LayoutType.OneColumn);
          var aPages = this.oFlexibleColumnLayout.getBeginColumnPages();
          /* If Begin page has already been added, navigate to it and call 'onAfterRendering' explicitly */
          if (aPages.length < 1) {
            this.getOwnerComponent().runAsOwner(
              function () {
                this.masterView = sap.ui.view({
                  viewName: "vcpapp.vcpplanningapps1.view.ConfigMaster",
                  type: "XML",
                });
                this.oFlexibleColumnLayout.addBeginColumnPage(this.masterView);
              }.bind(this)
            );
          } else {
            this.oFlexibleColumnLayout.toBeginColumnPage(aPages[0]);
            aPages[0].onAfterRendering();
          }
        }
        else {
          that.route();
        }
      },

      expandBegin: function () {
        this.bus.publish("nav", "backToBegin");
        /* Handling Menu button when we are in Item Master page  */
        if (!Device.system.desktop) {
          this.byId("leftMenu").setVisible(true);
          this.getModel("appView").setProperty("/expanded", true);
        }
      },

      onExit: function () {
        this.bus.unsubscribe(
          "vcpapp.vcpplanningconfiguration",
          "addBeginPage",
          this.addBeginPage,
          this
        );
        this.bus.unsubscribe(
          "vcpapp.vcpplanningconfiguration",
          "addDetailPage",
          this.addDetailPage,
          this
        );
        this.bus.unsubscribe("nav", "toBeginPage", this.toBeginPage, this);
        this.bus.unsubscribe("nav", "toDetailPage", this.toDetailPage, this);
        this.bus.unsubscribe("nav", "backToBegin", this.backToBegin, this);
      },

      onNavPress: function () {
        if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
          var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
          // sap.ushell.Container.getServiceAsync("UserInfo").then(function(UserInfo){
          //   return UserInfo;
          // });
          // generate the Hash to display 
          var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
            target: {
              semanticObject: "VCPDocument",
              action: "Display"
            }
          })) || "";
          //Generate a  URL for the second application
          var url = window.location.href.split('#')[0] + hash;
          //Navigate to second app
          sap.m.URLHelper.redirect(url, true);
        }
      },

      /**
       * 
       * @param {*} oEvent 
       * 
       */
      onPressConfig: function (oEvent) {
        var oButton = oEvent.getSource(),
          oView = that.getView();

        // if (!that._pPopover) {
        //     that._pPopover = new sap.ui.core.Fragment.load({
        //         id: oView.getId(),
        //         name: "vcpapp.vcpplanningconfiguration.view.Configuration",
        //         controller: this
        //     }).then(function (oPopover) {
        //         oView.addDependent(oPopover);
        //         return oPopover;
        //     });
        // }
        // that._pPopover.then(function (oPopover) {
        //     oPopover.openBy(oButton);
        // });

        if (that._pPopover) {
          that._pPopover.openBy(oButton);
        }
      },



      // close function 

      /**
       * 
       */
      // handleCloseConfiguration: function (oEvent) {
      //   oGModel = that.getOwnerComponent().getModel('oGModel');
      //   var oResults = oGModel.getProperty("/globalConfig");
      //   that.byId("idSeedOrderSeries").setValue(oResults.SEEDORDSEQ);
      //   that.byId("idSeedOrderPrefix").setValue(oResults.SOPREFIX);
      //   that.byId("idIBPPlanArea").setValue(oResults.IBPPLANAREA);
      //   that.byId("idIBPPrefix").setValue(oResults.IBPPREFIX);
      //   that.byId("idValidity").setSelected(oResults.IDENTIFY_RULE_VALIDITY);
      //   // that.byId("idMaxsnapshots").setValue(oResults.MAXSNAPSHOT);
      //   // sap.ui.getCore().byId("idSeedOrderSeries").setValue(oResults.SEEDORDSEQ);
      //   // sap.ui.getCore().byId("idSeedOrderPrefix").setValue(oResults.SOPREFIX);
      //   // sap.ui.getCore().byId("idIBPPlanArea").setValue(oResults.IBPPLANAREA);
      //   // sap.ui.getCore().byId("idIBPPrefix").setValue(oResults.IBPPREFIX);
      //   // sap.ui.getCore().byId("idValidity").setSelected(oResults.IDENTIFY_RULE_VALIDITY)

      //   if (oResults.IDENTIFY_PVS_NODE === "true") {
      //     that.byId("idPvsnode").setSelected(true);
      //   }
      //   else {
      //     that.byId("idPvsnode").setSelected(false);
      //   }
      //   //  sap.ui.getCore().byId("idPvsnode").setSelected(false)

      //   if (that._pPopover) {
      //     that._pPopover.close();
      //   }
      // },
      //     onSelect:function(){
      //         if(that.byId("idIconTabBarFiori2").mProperties.selectedKey=="info"){
      //             sap.ui.core.BusyIndicator.show();
      //             that.getOwnerComponent().getRouter().navTo("ConfigMain");
      //            }
      //            else if(that.byId("idIconTabBarFiori2").mProperties.selectedKey=="notes"){
      //             sap.ui.core.BusyIndicator.show();
      //             that.getOwnerComponent().getRouter().navTo("Network");
      //     }
      // }
      // onNavToProcessFlow: function (oEvent) {
      //     var Tile = oEvent.getSource().getHeader();
      //     if (Tile == "Planning Configuaration") {
      //         this.getOwnerComponent().getRouter().navTo("ConfigMain");
      //     }
      //     else {
      //         this.getOwnerComponent().getRouter().navTo("Network");
      //     }
      // }
      // route function

      handleSearch: function (oEvent) {
        var sQuery =
          oEvent.getParameter("value") || oEvent.getParameter("newValue"),
          sId = oEvent.getParameter("id"),
          oFilters = [];
        // Check if search filter is to be applied
        sQuery = sQuery ? sQuery.trim() : "";
        // Location
        if (sId.includes("demand")) {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("DEMAND_LOC", FilterOperator.Contains, sQuery),
                  new Filter("DEMAND_DESC", FilterOperator.Contains, sQuery),
                  new Filter("LOCATION_ID", FilterOperator.Contains, sQuery),
                  new Filter("LOCATION_DESC", FilterOperator.Contains, sQuery)
                ],
                and: false,
              })
            );
          }
          that.odemList.getBinding("items").filter(oFilters);
          // Product
        } else if (sId.includes("product")) {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                  new Filter("PROD_DESC", FilterOperator.Contains, sQuery),
                ],
                and: false,
              })
            );
          }
          that.oprodList.getBinding("items").filter(oFilters);
          // Component
        } else if (sId.includes("factory")) {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("FACTORY_LOC", FilterOperator.Contains, sQuery),
                  new Filter("LOCATION_DESC", FilterOperator.Contains, sQuery),
                  new Filter("LOCATION_ID", FilterOperator.Contains, sQuery),
                  new Filter("LOCATION_DESC", FilterOperator.Contains, sQuery)
                ],
                and: false,
              })
            );
          }
          // sap.ui.getCore().byId("factory").getBinding("items").filter(oFilters);
          that.ofactList.getBinding("items").filter(oFilters);

        }
        else if (sId.includes("planning")) {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("PLAN_LOC", FilterOperator.Contains, sQuery),
                  new Filter("PLANLOC_DESC", FilterOperator.Contains, sQuery),
                  new Filter("LOCATION_ID", FilterOperator.Contains, sQuery),
                  new Filter("LOCATION_DESC", FilterOperator.Contains, sQuery)
                ],
                and: false,
              })
            );
          }
          sap.ui.getCore().byId("planning").getBinding("items").filter(oFilters);

        }

      },


      // handleSearch1: function (oEvent) {  /working 06-08-25
      //   var sQuery =
      //     oEvent.getParameter("value") || oEvent.getParameter("newValue"),
      //     sId = oEvent.getParameter("id"),
      //     oFilters = [];
      //   sQuery = sQuery ? sQuery.trim() : "";
      //   if (sId.split("--")[2].includes("headSearch")) {
      //     if (sQuery !== "") {
      //       oFilters.push(
      //         new Filter({
      //           filters: [
      //             new Filter("DEMAND_LOC", FilterOperator.Contains, sQuery),
      //             new Filter("DEMAND_DESC", FilterOperator.Contains, sQuery),
      //             new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
      //             new Filter("PROD_DESC", FilterOperator.Contains, sQuery)
      //             // new Filter("SCOPE", FilterOperator.Contains, sQuery)
      //           ],
      //           and: false,
      //         })
      //       );
      //     }
      //     that.byId("orderList").getBinding("items").filter(oFilters)
      //   }
      // },


      handleSearch1: function (oEvent) {
        var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue"),
          sId = oEvent.getParameter("id"),
          oFilters = [];
        var filterData = [];

        sQuery = sQuery ? sQuery.trim().toUpperCase() : "";

        if (sQuery != "") {

          filterData = that.TotalTableData.filter(e => e.DEMAND_LOC.toUpperCase().includes(sQuery) || e.DEMAND_DESC.toUpperCase().includes(sQuery) ||
            e.PRODUCT_ID.toUpperCase().includes(sQuery) || e.PROD_DESC.toUpperCase().includes(sQuery))
        } else {
          filterData = that.TotalTableData
        }


        var dModel = new JSONModel();
        dModel.setData({
          TableData: filterData
        });

        that.byId("orderList").setModel(dModel);
        dModel.setSizeLimit(2000);


        // if (sId.split("--")[2].includes("headSearch")) {
        //   var oList = that.byId("orderList");
        //   var oBinding = oList.getBinding("items");

        //   // Clear previous filters before applying new ones
        //   // oBinding.filter([]);

        //   if (sQuery !== "") {
        //     oFilters.push(
        //       new Filter({
        //         filters: [
        //           new Filter("DEMAND_LOC", FilterOperator.Contains, sQuery),
        //           new Filter("DEMAND_DESC", FilterOperator.Contains, sQuery),
        //           new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
        //           new Filter("PROD_DESC", FilterOperator.Contains, sQuery)
        //         ],
        //         and: false
        //       })
        //     );
        //   }

        //   that.byId("orderList").getBinding("items").filter(oFilters);

        //   // oBinding.filter(oFilters); // Apply new filter
        // }
      },


      onGetData: function () {
        var dModel = new JSONModel();

        dModel.setData({
          TableData: []
        });

        // that.oList.removeSelections();
        var demandLoc = that.byId("dloc").getTokens();
        var factoryLoc = that.byId("floc").getTokens();
        var prodcuct = that.byId("prod").getTokens();
        var oFilters = [];
        for (var i = 0; i < demandLoc.length; i++) {
          var sFilter = new sap.ui.model.Filter({
            path: "DEMAND_LOC",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: demandLoc[i].getText(),
          });
          oFilters.push(sFilter);
        }

        for (var i = 0; i < prodcuct.length; i++) {
          sFilter = new sap.ui.model.Filter({
            path: "PRODUCT_ID",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: prodcuct[i].getText(),
          });
          oFilters.push(sFilter);
        }
        for (var i = 0; i < factoryLoc.length; i++) {
          sFilter = new sap.ui.model.Filter({
            path: "FACTORY_LOC",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: factoryLoc[i].getText(),
          });
          oFilters.push(sFilter);
        }

        that.oAllData(oFilters, prodSel);

      },
      // byclick on go
      oAllData: function (filters, tokens) {
        // that.data = [];
        var aFilters = filters;
        that.tokens = tokens;
        var topCount = that.oGModel.getProperty("/MaxCount");
        sap.ui.core.BusyIndicator.show();
        that.getOwnerComponent().getModel("PCModel").read("/getfactorylocdesc", {
          filters: aFilters,
          urlParameters: {
            "$skip": that.skip,
            "$top": topCount
          },
          success: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            if (topCount == oData.results.length) {
              that.skip += parseInt(topCount);
              that.data = that.data.concat(oData.results);
              that.oAllData();
            } else {
              that.skip = 0;
              that.data = that.data.concat(oData.results);

              var uniqueMap = {};
              var uniqueData = [];

              that.data.forEach(function (item) {
                var key = item.FACTORY_LOC + "|" + item.DEMAND_DESC + "|" + item.PRODUCT_ID + "|" + item.PLAN_LOC;
                if (!uniqueMap[key]) {
                  uniqueMap[key] = true;
                  uniqueData.push(item);
                }
              });


              var oTabData = uniqueData
              that.oGModel.setProperty("/oAllData", oTabData)


              var dModel = new JSONModel({ TableData: [] });
              that.byId("orderList").setModel(dModel);

              that.TotalTableData = oTabData;

              var dModel = new JSONModel();
              dModel.setData({
                TableData: oTabData
              });

              that.byId("orderList").setModel(dModel);
              dModel.setSizeLimit(2000);


              // that.byId("orderList").setGrowing(true); // Enable growing
              // that.byId("orderList").setGrowingThreshold(2000);
              // that.oTabData = that.byId("orderList").setModel(dModel).getData()
              // oGModel.setProperty("/oTableData", that.oTabData)


            }
          },
          error: function (e) {
            sap.ui.core.BusyIndicator.hide();
          }
        })
      },

      removeDuplicates: function (array, propertyName) {
        return Array.from(new Set(array.map(obj => obj[propertyName]))).map(value => {
          return array.find(obj => obj[propertyName] === value);
        });
      },




      handleValueHelp: function (oEv) {
        that.route();
        that.oGModel.setProperty("/Flag", "");
        if (oEv.oSource.getId().slice(12, 16)) {
          that.oGModel.setProperty("/Flag", "M");

          that.demandLoc = that.byId("dloc").getTokens();
          that.factoryLoc = that.byId("floc").getTokens();
          that.prodcuct = that.byId("prod").getTokens();
          var oFilters = [];

          sap.ui.getCore().byId("demand").setMultiSelect(true)
          sap.ui.getCore().byId("factory").setMultiSelect(true)
          // sap.ui.getCore().byId("planning").setMultiSelect(true)
          var select = oEv.oSource.getLabels()[0].getText();

          if (select == "Demand Location") {
            that.oGModel.setProperty("/TabSelect", select);
            var tokenNames = [];
            var selected = [];
            var fItems = that._demandDialog.getItems();
            fItems.forEach(x => {
              if (x.getSelected() == true) {
                selected.push(x);
              }
            });
            if (selected.length == 0) {
              that.oGModel.setProperty("/dLocF", oFilters);
              that.oGModel.setProperty("/dlocT", tokenNames);

              that.loadDemandLoc(oFilters, tokenNames);
              // that.oModel.read("/getfactorylocdesc", {
              //   filters: oFilters,
              //   success: function (oData) {
              //     that.data = oData.results;
              //     let uDemand = Array.from(new Set(oData.results.map(item => item.DEMAND_LOC)))
              //       .map(DEMAND_LOC => oData.results.find(item => item.DEMAND_LOC === DEMAND_LOC));
              //     var dModel = new JSONModel();
              //     dModel.setData({
              //       aItems: uDemand
              //     });
              //     sap.ui.getCore().byId("demand").setModel(dModel);
              //     that._demandDialog.open()
              //     // that.onInputChange()
              //   },
              //   error: function (e) {
              //   }
              // })
            }
            else {
              var tok = that.byId("dloc").getTokens();

              tok.forEach(x => {
                tokenNames.push(x.getText());
              });
              that.oGModel.setProperty("/dLocF", oFilters);
              that.oGModel.setProperty("/dlocT", tokenNames);
              that.loadDemandLoc();
              // that.oModel.read("/getfactorylocdesc", {
              //   filters: oFilters,
              //   success: function (oData) {
              //     that.data = oData.results;
              //     let uDemand = Array.from(new Set(oData.results.map(item => item.DEMAND_LOC)))
              //       .map(DEMAND_LOC => oData.results.find(item => item.DEMAND_LOC === DEMAND_LOC));
              //     var dModel = new JSONModel();
              //     dModel.setData({
              //       aItems: uDemand
              //     });
              //     sap.ui.getCore().byId("demand").setModel(dModel);
              //     //   that.onInputChange();

              //     that._demandDialog
              //       .getAggregation("_dialog")
              //       .getContent()[1]
              //       .removeSelections();
              //     that._demandDialog.getItems().forEach(y => {
              //       if (tokenNames.includes(y.getTitle())) {
              //         y.setSelected(true);
              //       }
              //       else {
              //         y.setSelected(false);
              //       }
              //     })
              //     that._demandDialog.open()
              //   },
              //   error: function (e) {
              //   }
              // });
              // that._demandDialog.open();
            }
          }
          else if (select == "Factory Location") {
            for (var i = 0; i < that.demandLoc.length; i++) {
              var sFilter = new Filter("DEMAND_LOC", sap.ui.model.FilterOperator.EQ, that.demandLoc[i].getText());
              oFilters.push(sFilter);
            }
            that.oGModel.setProperty("/TabSelect", select);
            var selected = [];
            var tokenNames = [];
            var fItems = that._factoryDialog.getItems();
            fItems.forEach(x => {
              if (x.getSelected() == true) {
                selected.push(x);
              }
            });
            if (selected.length == 0) {
              that.oGModel.setProperty("/fLocF", oFilters);
              that.oGModel.setProperty("/flocT", tokenNames);
              that.loadFactLoc();
              // that.oModel.read("/getfactorylocdesc", {
              //   filters: oFilters,
              //   success: function (oData) {
              //     that.data = oData.results;
              //     let uFactory = Array.from(new Set(oData.results.map(item => item.FACTORY_LOC)))
              //       .map(FACTORY_LOC => oData.results.find(item => item.FACTORY_LOC === FACTORY_LOC));
              //     var dModel = new JSONModel();
              //     dModel.setData({
              //       aItems: uFactory
              //     });
              //     sap.ui.getCore().byId("factory").setModel(dModel);
              //     that._factoryDialog.open()
              //   },
              //   error: function (e) {
              //   }
              // })
            }
            else {
              var tok = that.byId("floc").getTokens();

              tok.forEach(x => {
                tokenNames.push(x.getText());
              });
              that.oGModel.setProperty("/fLocF", oFilters);
              that.oGModel.setProperty("/flocT", tokenNames);

              that.loadFactLoc();

              // that.oModel.read("/getfactorylocdesc", {
              //   filters: oFilters,
              //   success: function (oData) {
              //     that.data = oData.results;
              //     let uFactory = Array.from(new Set(oData.results.map(item => item.FACTORY_LOC)))
              //       .map(FACTORY_LOC => oData.results.find(item => item.FACTORY_LOC === FACTORY_LOC));
              //     var dModel = new JSONModel();
              //     dModel.setData({
              //       aItems: uFactory
              //     });
              //     sap.ui.getCore().byId("factory").setModel(dModel);
              //     that._factoryDialog
              //       .getAggregation("_dialog")
              //       .getContent()[1]
              //       .removeSelections();
              //     that._factoryDialog.getItems().forEach(y => {
              //       if (tokenNames.includes(y.getTitle())) {
              //         y.setSelected(true);
              //       }
              //       else {
              //         y.setSelected(false);
              //       }
              //     })
              //     that._factoryDialog.open();
              //     // that._factoryDialog.open()
              //   },
              //   error: function (e) {
              //   }
              // })
            }
          }
          else if (select == "Product") {
            for (var i = 0; i < that.demandLoc.length; i++) {
              var sFilter = new Filter("DEMAND_LOC", sap.ui.model.FilterOperator.EQ, that.demandLoc[i].getText());
              oFilters.push(sFilter);
            }
            for (var i = 0; i < that.factoryLoc.length; i++) {
              sFilter = new Filter("FACTORY_LOC", sap.ui.model.FilterOperator.EQ, that.factoryLoc[i].getText());
              oFilters.push(sFilter);
            }
            that.oGModel.setProperty("/TabSelect", select);
            that.loadProduct(oFilters, prodSel);
            // if (prodSel.length == 0) {

            //   that.loadProduct(filters, prodSel);


            //   // that.oModel.read("/getfactorylocdesc", {
            //   //   filters: oFilters,
            //   //   success: function (oData) {
            //   //     that.data = oData.results;
            //   //     let uProduct = Array.from(new Set(oData.results.map(item => item.PRODUCT_ID)))
            //   //       .map(PRODUCT_ID => oData.results.find(item => item.PRODUCT_ID === PRODUCT_ID));

            //   //     var dModel = new JSONModel();
            //   //     dModel.setData({
            //   //       aItems: uProduct
            //   //     });
            //   //     sap.ui.getCore().byId("product").setModel(dModel);

            //   //     that._productDialog.open()
            //   //   },
            //   //   error: function (e) {
            //   //   }
            //   // })
            // }
            // else {
            //   // // var tok = that.byId("prod").getTokens();
            //   // // var tokenNames =  [];
            //   // // tok.forEach(x=>{
            //   // //   tokenNames.push(x.getText());
            //   // // });
            //   // that.oModel.read("/getfactorylocdesc", {
            //   //   filters: oFilters,
            //   //   success: function (oData) {
            //   //     that.data = oData.results;
            //   //     let uProduct = Array.from(new Set(oData.results.map(item => item.PRODUCT_ID)))
            //   //       .map(PRODUCT_ID => oData.results.find(item => item.PRODUCT_ID === PRODUCT_ID));

            //   //     var dModel = new JSONModel();
            //   //     dModel.setData({
            //   //       aItems: uProduct
            //   //     });
            //   //     sap.ui.getCore().byId("product").setModel(dModel);
            //   //     that._productDialog
            //   //       .getAggregation("_dialog")
            //   //       .getContent()[1]
            //   //       .removeSelections();

            //   //     that._productDialog.getItems().forEach(y => {
            //   //       if (prodSel.includes(y.getTitle())) {
            //   //         y.setSelected(true);
            //   //       }
            //   //       else {
            //   //         y.setSelected(false);
            //   //       }
            //   //     })
            //   //     that._productDialog.open();

            //   //     // that._productDialog.open()
            //   //   },
            //   //   error: function (e) {
            //   //   }
            //   // })


            // }
          }
        }
        else {
          that.oGModel.setProperty("/Flag", "F");
          sap.ui.getCore().byId("demand").setMultiSelect(false)
          sap.ui.getCore().byId("factory").setMultiSelect(false)
          // sap.ui.getCore().byId("planning").setMultiSelect(false)
          var select = oEv.oSource.getLabels()[0].getText();
          if (select == "Demand Location") {
            that.oGModel.setProperty("/TabSelect", select);
            that.oModel.read("/getLocation", {
              success: function (oData) {
                //   that.data = oData.results; 06-08-25 using this for all
                let uDemand = Array.from(new Set(oData.results.map(item => item.LOCATION_ID)))
                  .map(LOCATION_ID => oData.results.find(item => item.LOCATION_ID === LOCATION_ID));
                var dModel = new JSONModel();
                dModel.setData({
                  aItems: uDemand
                });
                sap.ui.getCore().byId("demand").setModel(dModel);
                that._demandDialog.open()
              },
              error: function (e) {
              }
            })
          }
          else if (select == "Factory Location") {
            that.oGModel.setProperty("/TabSelect", select);
            that.oModel.read("/getLocation", {
              success: function (oData) {
                //  that.data = oData.results; 06-08-25 using this for all
                // let uFactory  = [...new Set(oData.results)];
                let uFactory = oData.results.filter((item, index, self) =>
                  index === self.findIndex((t) => (
                    t.LOCATION_ID === item.LOCATION_ID
                  ))
                );



                // let uFactory = Array.from(new Set(oData.results.map(item => item.LOCATION_ID)))
                //   .map(LOCATION_ID => oData.results.find(item => item.LOCATION_ID === LOCATION_ID));
                var dModel = new JSONModel();
                dModel.setData({
                  aItems: uFactory
                });
                sap.ui.getCore().byId("factory").setModel(dModel);
                that._factoryDialog.open()
              },
              error: function (e) {
              }
            })
          }
          else if (select == "Product") {
            if (sap.ui.getCore().byId("dem").getValue().length == 0) {
              MessageToast.show("Select Demand Location");
            }
            else {
              that.oGModel.setProperty("/TabSelect", select);
              //     var selected = [];
              // var fItems = that._productDialog.getItems();
              // fItems.forEach(x => {
              //   if (x.getSelected() == true) {
              //     selected.push(x);
              //   }
              // });
              if (SprodSel.length == 0) {
                that.oModel.read("/genPartialProd", {
                  filters: [
                    new Filter("LOCATION_ID", FilterOperator.Contains, sap.ui.getCore().byId("dem").getValue())
                  ],
                  success: function (oData) {
                    // that.data = oData.results; 06-08-25 using this for all
                    let uProduct = Array.from(new Set(oData.results.map(item => item.PRODUCT_ID)))
                      .map(PRODUCT_ID => oData.results.find(item => item.PRODUCT_ID === PRODUCT_ID));

                    var dModel = new JSONModel();
                    dModel.setData({
                      aItems: uProduct
                    });
                    sap.ui.getCore().byId("product").setModel(dModel);
                    if (sap.ui.getCore().byId("prodt").getTokens().length > 0) {
                      var aPkey = sap.ui.getCore().byId("prodt").getTokens()[0].getKey()
                      if (aPkey.length > 0) {
                        that._productDialog.getItems().forEach(i => {
                          if (i.getTitle() == aPkey) {
                            i.setSelected(true)
                          }
                          that._productDialog.open()
                        })
                      }
                    }
                    else {
                      that._productDialog.open()
                    }
                  },
                  error: function (e) {
                  }
                })
              } else {
                // var tok = sap.ui.getCore().byId("prodt").getTokens();
                // var tokenNames =  [];
                // tok.forEach(x=>{
                //   tokenNames.push(x.getText());
                // });
                that.oModel.read("/genPartialProd", {
                  filters: [
                    new Filter("LOCATION_ID", FilterOperator.Contains, sap.ui.getCore().byId("dem").getValue())
                  ],
                  success: function (oData) {
                    // that.data = oData.results; 06-08-25 using this for all
                    let uProduct = Array.from(new Set(oData.results.map(item => item.PRODUCT_ID)))
                      .map(PRODUCT_ID => oData.results.find(item => item.PRODUCT_ID === PRODUCT_ID));

                    var dModel = new JSONModel();
                    dModel.setData({
                      aItems: uProduct
                    });
                    sap.ui.getCore().byId("product").setModel(dModel);

                    that._productDialog
                      .getAggregation("_dialog")
                      .getContent()[1]
                      .removeSelections();

                    that._productDialog.getItems().forEach(y => {
                      if (SprodSel.includes(y.getTitle())) {
                        y.setSelected(true);
                      }
                      else {
                        y.setSelected(false);
                      }
                    })
                    that._productDialog.open();
                    // that._productDialog.open()
                  },
                  error: function (e) {
                  }
                })
              }
            }


          }
          else if (select == "Planning Location") {
            that.oGModel.setProperty("/TabSelect", select);
            that.oModel.read("/getLocation", {
              success: function (oData) {
                // that.data = oData.results; 06-08-25 using this for all
                let uProduct = Array.from(new Set(oData.results.map(item => item.LOCATION_ID)))
                  .map(LOCATION_ID => oData.results.find(item => item.LOCATION_ID === LOCATION_ID));

                var dModel = new JSONModel();
                dModel.setData({
                  aItems: uProduct
                });
                sap.ui.getCore().byId("planning").setModel(dModel);
                that._planDialog.open()
              },
              error: function (e) {
              }
            })
          }
        }


      },

      //for demand location 
      loadDemandLoc: function () {
        // that.oDmdLoc = [];
        var aFilters = that.oGModel.getProperty("/dLocF");
        that.tokens = that.oGModel.getProperty("/dlocT");
        var topCount = that.oGModel.getProperty("/MaxCount");
        that.oModel.read("/getfactorylocdesc", {
          // filters: oFilters,
          filters: aFilters,
          urlParameters: {
            "$skip": that.skip,
            "$top": topCount
          },
          success: function (oData) {
            if (topCount == oData.results.length) {
              that.skip += parseInt(topCount);
              that.oDmdLoc = that.oDmdLoc.concat(oData.results);
              that.loadDemandLoc();
            } else {
              that.skip = 0;
              that.oDmdLoc = that.oDmdLoc.concat(oData.results);

              let uDemand = Array.from(new Set(that.oDmdLoc.map(item => item.DEMAND_LOC)))
                .map(DEMAND_LOC => that.oDmdLoc.find(item => item.DEMAND_LOC === DEMAND_LOC));
              var dModel = new JSONModel();
              dModel.setSizeLimit(uDemand.length);
              dModel.setData({
                aItems: uDemand
              });
              sap.ui.getCore().byId("demand").setModel(dModel);


              if (that.tokens.length > 0) {
                that._demandDialog.getAggregation("_dialog").getContent()[1].removeSelections();
                that._demandDialog.getItems().forEach(y => {
                  if (that.tokens.includes(y.getTitle())) {
                    y.setSelected(true);
                  }
                  else {
                    y.setSelected(false);
                  }
                })

              }
              that._demandDialog.open();
              // that.onInputChange()

            }
            // that.data = oData.results;
          },
          error: function (e) {
          }
        })
      },

      loadFactLoc: function () {
        // that.oFctData = []
        var aFilters = that.oGModel.getProperty("/fLocF");
        that.tokens = that.oGModel.getProperty("/flocT");

        var topCount = that.oGModel.getProperty("/MaxCount");

        that.oModel.read("/getfactorylocdesc", {
          filters: aFilters,
          urlParameters: {
            "$skip": that.skip,
            "$top": topCount
          },
          success: function (oData) {
            if (topCount == oData.results.length) {
              that.skip += parseInt(topCount);

              that.oFctData = that.oFctData.concat(oData.results);
              that.loadFactLoc();
            } else {

              that.skip = 0;
              that.oFctData = that.oFctData.concat(oData.results);

              let uFactory = Array.from(new Set(that.oFctData.map(item => item.FACTORY_LOC)))
                .map(FACTORY_LOC => that.oFctData.find(item => item.FACTORY_LOC === FACTORY_LOC));
              var dModel = new JSONModel();
              dModel.setSizeLimit(uFactory.length);

              dModel.setData({
                aItems: uFactory
              });
              sap.ui.getCore().byId("factory").setModel(dModel);


              if (that.tokens.length > 0) {
                that._factoryDialog.getAggregation("_dialog").getContent()[1].removeSelections();
                that._factoryDialog.getItems().forEach(y => {
                  if (that.tokens.includes(y.getTitle())) {
                    y.setSelected(true);
                  }
                  else {
                    y.setSelected(false);
                  }
                })

              }
              that._factoryDialog.open();
              // that.onInputChange()

            }
          },
          error: function (e) {
          }
        })

      },

      loadProduct: function (filters, tokens) {
        // that.ProdData = []
        var aFilters = filters;
        that.tokens = tokens;
        var topCount = that.oGModel.getProperty("/MaxCount");

        that.oModel.read("/getfactorylocdesc", {
          filters: aFilters,
          urlParameters: {
            "$skip": that.skip,
            "$top": topCount
          },
          success: function (oData) {

            if (topCount == oData.results.length) {
              that.skip += parseInt(topCount);
              that.ProdData = that.ProdData.concat(oData.results);
              that.loadProduct();
            } else {
              that.skip = 0;
              that.ProdData = that.ProdData.concat(oData.results);

              let uProduct = Array.from(new Set(oData.results.map(item => item.PRODUCT_ID)))
                .map(PRODUCT_ID => oData.results.find(item => item.PRODUCT_ID === PRODUCT_ID));

              var dModel = new JSONModel();
              dModel.setSizeLimit(uProduct.length);

              dModel.setData({
                aItems: uProduct
              });
              sap.ui.getCore().byId("product").setModel(dModel);


              if (that.tokens.length > 0) {
                that._productDialog.getAggregation("_dialog").getContent()[1].removeSelections();

                that._productDialog.getItems().forEach(y => {
                  if (that.tokens.includes(y.getTitle())) {
                    y.setSelected(true);
                  }
                  else {
                    y.setSelected(false);
                  }
                })


              }

              that._productDialog.open();
            }
          },
          error: function (e) {
          }
        })
      },

      route: function () {
        // that.prevSelect = "network"
        that.oGModel = that.getOwnerComponent().getModel("oGModel")
        that.oGModel.setProperty("/TabSelect", "");
        if (!that._demandDialog) {
          that._demandDialog = sap.ui.xmlfragment(
            "vcpapp.vcpplanningapps1.view.demandDialog",
            this
          );
          that.getView().addDependent(that._demandDialog);
        }
        if (!that._factoryDialog) {
          that._factoryDialog = sap.ui.xmlfragment(
            "vcpapp.vcpplanningapps1.view.factoryDialog",
            that
          );
          that.getView().addDependent(that._factoryDialog);
        }
        if (!that._productDialog) {
          that._productDialog = sap.ui.xmlfragment(
            "vcpapp.vcpplanningapps1.view.productDialog",
            that
          );
          that.getView().addDependent(that._productDialog);
        }
        if (!that._planDialog) {
          that._planDialog = sap.ui.xmlfragment(
            "vcpapp.vcpplanningapps1.view.planDialog",
            that
          );
          that.getView().addDependent(that._planDialog);
        }

        that.odemList = sap.ui.getCore().byId(
          that._demandDialog.getId() + "-list"
        );
        that.ofactList = sap.ui.getCore().byId(
          that._factoryDialog.getId() + "-list"
        );
        that.oprodList = sap.ui.getCore().byId(
          that._productDialog.getId() + "-list"
        );
        that.oModel = that.getOwnerComponent().getModel("PCModel");
        if (that.prevSelect == "Config") {
          // that.onResetData();
        }
        else {

        }

      },

      handleSelection: function (oEv) {
        var tSelect = oEv.getParameters().selectedItems

        var prev = that.oGModel.getProperty("/TabSelect")
        var flag = that.oGModel.getProperty("/Flag");
        if (prev == "Demand Location") {
          if (flag === "M") {
            that.byId("dloc").removeAllTokens()
            tSelect.forEach((ele) => {
              that.byId("dloc").addToken(
                new sap.m.Token({
                  text: ele.getTitle(),
                  key: ele.getTitle(),
                  editable: false

                })
              );
            });
            that.byId("floc").removeAllTokens();
            that.byId("prod").removeAllTokens();
            that._factoryDialog
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            that._productDialog
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            prodSel = [];
            var dModel = new JSONModel({ TableData: [] });
            that.byId("orderList").setModel(dModel);

          }
          else {
            sap.ui.getCore().byId("dem").removeAllTokens()
            tSelect.forEach((ele) => {
              sap.ui.getCore().byId("dem").setValue(ele.getTitle())
            });
            that._productDialog
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            that._planDialog
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            that._factoryDialog
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            //    that.onInputChange()
            // sap.ui.getCore().byId("prodt").removeAllTokens();
            // sap.ui.getCore().byId("pln").setValue();
            // sap.ui.getCore().byId("fct").setValue();
            SprodSel = [];
          }
        }
        else if (prev == "Factory Location") {
          if (flag === "M") {
            that.byId("floc").removeAllTokens()
            tSelect.forEach((ele) => {
              that.byId("floc").addToken(
                new sap.m.Token({
                  text: ele.getTitle(),
                  key: ele.getTitle(),
                  editable: false
                })
              );
            });
            that.byId("prod").removeAllTokens();

            this._productDialog
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            prodSel = [];
          }
          else {
            sap.ui.getCore().byId("fct").removeAllTokens()
            tSelect.forEach((ele) => {
              sap.ui.getCore().byId("fct").setValue(ele.getTitle())
            });
            that._factoryDialog
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
          }
          // that.onInputChange();
        }
        else if (prev == "Product") {
          if (flag === "M") {
            prodSel = [];
            that.byId("prod").removeAllTokens()
            tSelect.forEach((ele) => {
              that.byId("prod").addToken(
                new sap.m.Token({
                  text: ele.getTitle(),
                  key: ele.getTitle(),
                  editable: false
                })
              );
              prodSel.push(ele.getTitle())
            });
          }
          else {
            sap.ui.getCore().byId("prodt").removeAllTokens()
            SprodSel = [];
            tSelect.forEach((ele) => {
              sap.ui.getCore().byId("prodt").addToken(
                new sap.m.Token({
                  text: ele.getTitle(),
                  key: ele.getTitle(),
                  editable: false
                })
              );
              SprodSel.push(ele.getTitle());
            });
            that._planDialog
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            that._factoryDialog
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            // sap.ui.getCore().byId("pln").setValue();
            // sap.ui.getCore().byId("fct").setValue();
          }
        }
        else if (sap.ui.getCore().byId("pln")) {
          sap.ui.getCore().byId("pln").removeAllTokens()
          tSelect.forEach((ele) => {
            sap.ui.getCore().byId("pln").setValue(ele.getTitle())
          });
          that._planDialog
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          // sap.ui.getCore().byId("fct").setValue()
        }

      },


      onResetData: function () {
        that.byId("dloc").removeAllTokens();
        that.byId("floc").removeAllTokens();
        that.byId("prod").removeAllTokens();
        that.byId("headSearch").setValue("");
        var dModel = new JSONModel({ TableData: [] });
        that.byId("orderList").setModel(dModel);
        prodSel = [];
        that._demandDialog
          .getAggregation("_dialog")
          .getContent()[1]
          .removeSelections();
        that._factoryDialog
          .getAggregation("_dialog")
          .getContent()[1]
          .removeSelections();
        that._productDialog
          .getAggregation("_dialog")
          .getContent()[1]
          .removeSelections();
        that.onGetData();

      },

      onhandlePress: function (oEv) {
        that.oAllSelcted = oEv.getParameters().selectAll
        var oTab = that.byId("orderList")
        var aSelectedItems = oTab.getSelectedItems()
        if (aSelectedItems.length === 1) {
          that.byId("copy").setEnabled(true);
          that.byId("delete").setEnabled(true);
          return false;
        }
        if (aSelectedItems.length > 1) {
          that.byId("delete").setEnabled(true);
          that.byId("copy").setEnabled(false);
          // that.byId("delete").setEnabled(true);
          return false;
        }
        if (aSelectedItems.length === 0) {
          that.byId("delete").setEnabled(false);
          that.byId("copy").setEnabled(false);
          // that.byId("delete").setEnabled(true);
          return false;
        }

      },

      onNavigate: function (oEv) {
        var data = oEv.getSource().getBindingContext().getObject()
        that.oGModel.setProperty("/NetworkData", data);
        this.getOwnerComponent().getRouter().navTo("NetworkDetail");
      },

      // onCreate: function () {
      //   that.oCopyDialog.open();
      //   sap.ui.getCore().byId("create").setTitle("Create")
      //   // sap.ui.getCore().byId("scheduleStep").setvalidated(false)
      //   // sap.ui.getCore().byId("idParameters").setvalidated(false)
      //   SprodSel = [];
      // },

      handleClose: function () {
        sap.ui.getCore().byId("demand").setMultiSelect(true)

      },

      onCheck: function (oEvent) {
        //  setTimeout(this.delayedFunction.bind(this), 1);
        var oEv = oEvent.getSource().getSelected()

        if (oEv === true) {
          that.byId("copy").setEnabled(true);
          that.byId("delete").setEnabled(true);
        } else {
          that.byId("copy").setEnabled(false);
          that.byId("delete").setEnabled(false);
        }

        var aProducts = that.oGModel.getProperty("/oAllData")

        aProducts.forEach(function (oProduct) {
          oProduct.PRODUCT_SELECTED = true;
        });

        that.oGModel.setProperty("/oAllData", aProducts);

        // Optional: update table selection to reflect it visually
        var oTable = that.byId("orderList");
        oTable.removeSelections(); // clear old ones

        // Loop through all items rendered and select them
        oTable.getItems().forEach(function (oItem) {
          oTable.setSelectedItem(oItem, true);
        });

        that.byId("copy").setEnabled(false);
        that.byId("delete").setEnabled(true);

      },

      onCancel: function () {
        that.oCopyDialog.close();
        sap.ui.getCore().byId("dem").setValue("");
        sap.ui.getCore().byId("pln").setValue("");
        sap.ui.getCore().byId("prodt").removeAllTokens();

        // sap.ui.getCore().byId("scheduleStep").setVisible(false)
        // sap.ui.getCore().byId("idParameters").setVisible(false)
        // SprodSel = [];
        // sap.ui.getCore().byId("fct").setValue("");

      },

      onclear: function () {
        var data = that.byId("orderList").getItems();
        // data.forEach((x) => {
        //   x.getCells()[0].setSelected(false);
        // });
        var aProducts = that.oGModel.getProperty("/oAllData")

        aProducts.forEach(function (oProduct) {
          oProduct.PRODUCT_SELECTED = true;
        });

        that.oGModel.setProperty("/oAllData", aProducts);

        // Optional: update table selection to reflect it visually
        var oTable = that.byId("orderList");
        oTable.removeSelections(); // clear old ones

        // Loop through all items rendered and select them
        oTable.getItems().forEach(function (oItem) {
          oTable.setSelectedItem(oItem, true);
        });

        that.byId("copy").setEnabled(false);
        that.byId("delete").setEnabled(true);

      },

      onSelectAllProducts: function () {
        var oModel = this.getView().getModel(); // your default model
        var aProducts = that.oGModel.getProperty("/oAllData")

        aProducts.forEach(function (oProduct) {
          oProduct.PRODUCT_SELECTED = true;
        });

        oModel.setProperty("/oAllData", aProducts);

        // Optional: update table selection to reflect it visually
        var oTable = this.byId("orderList");
        oTable.removeSelections(); // clear old ones

        // Loop through all items rendered and select them
        oTable.getItems().forEach(function (oItem) {
          oTable.setSelectedItem(oItem, true);
        });
      },


      delayedFunction: function () {
        var count = 0;
        var data = that.byId("orderList").getItems();
        // that.aResults = [{
        //   "CREATE_CHK": "enabled",
        //   "UPDATE_CHK": "enabled",
        //   "DELETE_CHK": "enabled"
        // }]

        if (that.aResults.length > 0) {
          var isUserLoggedIn = true;
        }
        var oTab = that.byId("orderList")
        var oTablelength = oTab.getSelectedItems().length

        if (oTablelength === 1) {
          that.byId("copy").setEnabled(true);
          that.byId("delete").setEnabled(true);
        }
        else {
          that.byId("copy").setEnabled(false);
          that.byId("delete").setEnabled(false);
        }

        if (isUserLoggedIn) {
          if (that.aResults[0].DELETE_CHK === "disabled") {
            that.byId("delete").setEnabled(false);
            // MessageToast.show("User not authorised for this delete action");
          }

          if (that.aResults[0].UPDATE_CHK === "disabled") {
            that.byId("copy").setEnabled(false);
            // MessageToast.show("User not authorised for this delete action");
          }

        }
        else {
          that.onclear();
          MessageToast.show("User not authorised for this copy action");

        }

      },


      // onDelete: function (oEv) {
      //   var vUser = that.getUserName();
      //   var oEntry = {
      //     USERDATA: []
      //   };
      //   let oParamVals = {
      //     USEREMAIL: vUser
      //   };
      //   oEntry.USERDATA.push(oParamVals);

      //   that.oModel = that.getOwnerComponent().getModel("PCModel");
      //   that.oModel.callFunction("/genUserAppVisibility", {
      //     method: "GET",
      //     urlParameters: {
      //       FLAG: 'G',
      //       USERDATA: JSON.stringify(oEntry.USERDATA)
      //     },
      //     success: function (oData) {
      //       var aResults = oData.results;
      //       var aResults = [{
      //         "CREATE_CHK": "enabled",
      //         "UPDATE_CHK": "enabled",
      //         "DELETE_CHK": "enabled"
      //       }]
      //       if (aResults.length > 0) {
      //         var isUserLoggedIn = true;
      //       }
      //       if (isUserLoggedIn) {
      //         if (aResults[0].DELETE_CHK === "disabled") {
      //           // that.byId("idDeleteButton").setEnabled(false);
      //           MessageToast.show("User not authorised for this delete action");
      //         }
      //         else {
      //           var arraySelected = [],
      //             arr = [],
      //             default1 = {};
      //           var items = that.byId("orderList")
      //           var aSelectedItems = items.getSelectedItems();
      //           // based on multislection  and that.oAllSelcted value getting from onhandlePress function 
      //           if (that.oAllSelcted === true) {

      //             sText = "Do you want to delete all records?";

      //             var oAllData = that.oGModel.getProperty("/oAllData");

      //             for (var i = 0; i < oAllData.length; i++) {
      //               default1 = {
      //                 LOCATION_ID: oAllData[i].DEMAND_LOC,
      //                 PRODUCT_ID: oAllData[i].PRODUCT_ID,
      //                 PLAN_LOC: oAllData[i].PLAN_LOC,
      //                 FACTORY_LOC: oAllData[i].FACTORY_LOC
      //               };
      //               arraySelected.push(default1);
      //             }

      //             //  CASE 2: NORMAL SELECTION
      //           } else {

      //             if (aSelectedItems.length === 1) {
      //               sText = "Do you want to delete the selected item?";
      //             } else if (aSelectedItems.length > 1) {
      //               sText = "Do you want to delete the selected items?";
      //             } else {
      //               sap.m.MessageToast.show("Please select at least one item");
      //               return;
      //             }

      //             for (var i = 0; i < aSelectedItems.length; i++) {
      //               default1 = {
      //                 LOCATION_ID: aSelectedItems[i].getCells()[0].getText(),
      //                 PRODUCT_ID: aSelectedItems[i].getCells()[1].getText(),
      //                 PLAN_LOC: aSelectedItems[i].getCells()[2].getText(),
      //                 FACTORY_LOC: aSelectedItems[i].getCells()[3].getText()
      //               };
      //               arraySelected.push(default1);
      //             }
      //           }

      //           // if (aSelectedItems.length === 1) {
      //           //   var sText = "Do you want to delete the selected item?";
      //           // }
      //           // else if (aSelectedItems.length > 1) {
      //           //   var sText = "Do you want to delete the selected items?";
      //           // }
      //           // for (var i = 0; i < aSelectedItems.length; i++) {
      //           //   default1.LOCATION_ID = aSelectedItems[i].getCells()[0].getText() //arr[i].getBindingContext().getObject().DEMAND_LOC;
      //           //   default1.PRODUCT_ID = aSelectedItems[i].getCells()[1].getText() //arr[i].getBindingContext().getObject().PRODUCT_ID;
      //           //   default1.PLAN_LOC = aSelectedItems[i].getCells()[2].getText() //arr[i].getBindingContext().getObject().PLAN_LOC;
      //           //   default1.FACTORY_LOC = aSelectedItems[i].getCells()[3].getText() //arr[i].getBindingContext().getObject().FACTORY_LOC;
      //           //   arraySelected.push(default1);
      //           //   default1 = {};
      //           // }
      //           sap.m.MessageBox.warning(sText, {
      //             title: "Delete",
      //             actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
      //             onClose: function (oAction) {
      //               if (oAction === sap.m.MessageBox.Action.YES) {
      //                 sap.ui.core.BusyIndicator.show();

      //                 that.oModel.callFunction("/createProductBatch", {
      //                   method: "GET",
      //                   urlParameters: {
      //                     Flag: "D",
      //                     PRODATA: JSON.stringify(arraySelected)
      //                   },
      //                   success: function (oData) {
      //                     sap.ui.core.BusyIndicator.hide();
      //                     that.byId("headSearch").setValue("")
      //                     MessageToast.show(oData.createProductBatch);
      //                     that.onGetData();
      //                     // that.onclear();
      //                     // that.onResetData();


      //                   },
      //                   error: function (_error) {
      //                     sap.ui.core.BusyIndicator.hide();
      //                     MessageToast.show("Failed to Delete data");
      //                   },
      //                 });
      //               }
      //               else {
      //                 that.onGetData();
      //                 // that.onclear();
      //                 // that.onResetData();
      //               }
      //             },
      //           })
      //         }
      //       }
      //       else {
      //         MessageToast.show("User not authorised for this delete action");
      //       }
      //     }
      //   })
      // },

      onDelete: function (oEv) {
        var vUser = that.getUserName();
        var oEntry = {
          USERDATA: []
        };
        let oParamVals = {
          USEREMAIL: vUser
        };
        oEntry.USERDATA.push(oParamVals);

        that.oModel = that.getOwnerComponent().getModel("PCModel");
        that.oModel.callFunction("/genUserAppVisibility", {
          method: "GET",
          urlParameters: {
            FLAG: 'G',
            USERDATA: JSON.stringify(oEntry.USERDATA)
          },
          success: function (oData) {
            var aResults = oData.results;
            // var aResults = [{
            //   "CREATE_CHK": "enabled",
            //   "UPDATE_CHK": "enabled",
            //   "DELETE_CHK": "enabled"
            // }]
            if (aResults.length > 0) {
              var isUserLoggedIn = true;
            }
            if (isUserLoggedIn) {
              if (aResults[0].DELETE_CHK === "disabled") {
                // that.byId("idDeleteButton").setEnabled(false);
                MessageToast.show("User not authorised for this delete action");
              }
              else {
                var arraySelected = [],
                  arr = [],
                  default1 = {};
                var items = that.byId("orderList")
                var aSelectedItems = items.getSelectedItems()

                var sText = "";
                var arraySelected = [];
                var default1 = {};

                var oTable = that.byId("orderList");
                var aSelectedItems = oTable.getSelectedItems();

                //  CASE 1: SELECT ALL (Bulk delete)
                // based on multislection  and that.oAllSelcted value getting from onhandlePress function 
                if (that.oAllSelcted === true) {

                  sText = "Do you want to delete all records?";

                  var oAllData = that.oGModel.getProperty("/oAllData");

                  for (var i = 0; i < oAllData.length; i++) {
                    default1 = {
                      LOCATION_ID: oAllData[i].DEMAND_LOC,
                      PRODUCT_ID: oAllData[i].PRODUCT_ID,
                      PLAN_LOC: oAllData[i].PLAN_LOC,
                      FACTORY_LOC: oAllData[i].FACTORY_LOC
                    };
                    arraySelected.push(default1);
                  }

                  //  CASE 2: NORMAL SELECTION
                } else {

                  if (aSelectedItems.length === 1) {
                    sText = "Do you want to delete the selected item?";
                  } else if (aSelectedItems.length > 1) {
                    sText = "Do you want to delete the selected items?";
                  } else {
                    sap.m.MessageToast.show("Please select at least one item");
                    return;
                  }

                  for (var i = 0; i < aSelectedItems.length; i++) {
                    default1 = {
                      LOCATION_ID: aSelectedItems[i].getCells()[0].getText(),
                      PRODUCT_ID: aSelectedItems[i].getCells()[1].getText(),
                      PLAN_LOC: aSelectedItems[i].getCells()[2].getText(),
                      FACTORY_LOC: aSelectedItems[i].getCells()[3].getText()
                    };
                    arraySelected.push(default1);
                  }
                }
                // if (aSelectedItems.length === 1) {
                //   var sText = "Do you want to delete the selected item?";
                // }
                // else if (aSelectedItems.length > 1) {
                //   var sText = "Do you want to delete the selected items?";
                // }
                // for (var i = 0; i < aSelectedItems.length; i++) {
                //   default1.LOCATION_ID = aSelectedItems[i].getCells()[0].getText() //arr[i].getBindingContext().getObject().DEMAND_LOC;
                //   default1.PRODUCT_ID = aSelectedItems[i].getCells()[1].getText() //arr[i].getBindingContext().getObject().PRODUCT_ID;
                //   default1.PLAN_LOC = aSelectedItems[i].getCells()[2].getText() //arr[i].getBindingContext().getObject().PLAN_LOC;
                //   default1.FACTORY_LOC = aSelectedItems[i].getCells()[3].getText() //arr[i].getBindingContext().getObject().FACTORY_LOC;
                //   arraySelected.push(default1);
                //   default1 = {};
                // }
                // if (that.oAllSelcted === true) {
                //   var oAllData = that.oGModel.getProperty("/oAllData")
                //   for (var i = 0; i < oAllData.length; i++) {
                //     default1.LOCATION_ID = oAllData[i].DEMAND_LOC //arr[i].getBindingContext().getObject().DEMAND_LOC;
                //     default1.PRODUCT_ID = oAllData[i].PRODUCT_ID //arr[i].getBindingContext().getObject().PRODUCT_ID;
                //     default1.PLAN_LOC = oAllData[i].PLAN_LOC //arr[i].getBindingContext().getObject().PLAN_LOC;
                //     default1.FACTORY_LOC = oAllData[i].FACTORY_LOC //arr[i].getBindingContext().getObject().FACTORY_LOC;
                //     arraySelected.push(default1);
                //     default1 = {};
                //   }
                // }
                sap.m.MessageBox.warning(sText, {
                  title: "Delete",
                  actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                  onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                      sap.ui.core.BusyIndicator.show();

                      that.oModel.callFunction("/createProductBatch", {
                        method: "GET",
                        urlParameters: {
                          Flag: "D",
                          PRODATA: JSON.stringify(arraySelected)
                        },
                        success: function (oData) {
                          sap.ui.core.BusyIndicator.hide();
                          that.byId("headSearch").setValue("")
                          MessageToast.show(oData.createProductBatch);
                          that.onGetData();
                          // that.onclear();
                          // that.onResetData();


                        },
                        error: function (_error) {
                          sap.ui.core.BusyIndicator.hide();
                          MessageToast.show("Failed to Delete data");
                        },
                      });
                    }
                    else {
                      that.onGetData();
                      // that.onclear();
                      // that.onResetData();
                    }
                  },
                })
              }
            }
            else {
              MessageToast.show("User not authorised for this delete action");
            }
          }
        })
      },


      getUserName: function () {
        that = this;
        let vUser;
        if (sap.ushell.Container) {
          let email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
          vUser = (email) ? email : "";

        }
        return vUser;
      },

      onCopy: function (oEv) {
        var vUser = that.getUserName();
        var oEntry = {
          USERDATA: []
        };
        let oParamVals = {
          USEREMAIL: vUser
        };
        oEntry.USERDATA.push(oParamVals);
        that.oModel.callFunction("/genUserAppVisibility", {
          method: "GET",
          urlParameters: {
            FLAG: 'G',
            USERDATA: JSON.stringify(oEntry.USERDATA)
          },
          success: function (oData) {
            var aResults = oData.results;
            // var aResults = [{
            //   "CREATE_CHK": "enabled",
            //   "UPDATE_CHK": "enabled",
            //   "DELETE_CHK": "enabled"
            // }]

            if (aResults.length > 0) {
              var isUserLoggedIn = true;
            }
            if (isUserLoggedIn) {
              if (aResults[0].UPDATE_CHK === "disabled") {
                // that.byId("idCopyButton").setEnabled(false);
                MessageToast.show("User not authorised for this copy action");
              }
              else {
                var arr = [];
                sap.ui.getCore().byId("create").setTitle("Copy");
                var items = that.byId("orderList")
                var aSelectedItems = items.getSelectedItems()

                if (aSelectedItems.length !== 1) {
                  MessageToast.show("Please select only one row for copying");
                }
                else {
                  // var select = arr[0].getBindingContext().getObject();
                  that.oCopyDialog.open();
                  sap.ui.getCore().byId("dem").setValue(aSelectedItems[0].getCells()[0].getText()); // Demand Location
                  //  sap.ui.getCore().byId("prodt").setValue(aSelectedItems[0].getCells()[1].getText()); // Product
                  sap.ui.getCore().byId("pln").setValue(aSelectedItems[0].getCells()[2].getText()); // Planning Location
                  sap.ui.getCore().byId("fct").setValue(aSelectedItems[0].getCells()[3].getText()); // Factory Location
                  var aProdTok = []
                  var oToken = new Token({
                    key: aSelectedItems[0].getCells()[1].getText(), //select.PRODUCT_ID,
                    text: aSelectedItems[0].getCells()[1].getText() //select.PROD_DESC
                  });
                  aProdTok.push(oToken)
                  //  sap.ui.getCore().byId("prodt").setValue(aSelectedItems[0].getCells()[1].getText());
                  var setPdata = sap.ui.getCore().byId("prodt")
                  setPdata.setTokens(aProdTok)
                }
              }
            }
            else {
              // that.byId("idCopyButton").setEnabled(false);
              // that.byId("idDeleteButton").setEnabled(false);
              // that.byId("idCopyButton").setEnabled(false);
              MessageToast.show("User not authorised for this copy action");
            }
          }
        })
      },


      onSave: function (oEv) {
        var updatedDetails = {};
        var updatedArray = [];
        var newDetails = {};
        var newArray = [];
        var sProduct = sap.ui.getCore().byId("prodt").getTokens();
        var dLocation = sap.ui.getCore().byId("dem").getValue();
        var pLocation = sap.ui.getCore().byId("pln").getValue();
        var fLocation = sap.ui.getCore().byId("fct").getValue();
        if (dLocation && pLocation && fLocation && sProduct.length > 0) {
          var table = that.byId("orderList")
          var tableItems = table.getItems();
          for (var k = 0; k < sProduct.length; k++) {
            newDetails = {
              LOCATION_ID: dLocation,
              PRODUCT_ID: sProduct[k].getText(),
              PLAN_LOC: pLocation,
              FACTORY_LOC: fLocation
            }
            newArray.push(newDetails);
          }

          if (newArray.length === 0) {
            if (that.oCopyDialog) {
              that.oCopyDialog.close();
              that.oCopyDialog.destroy(true);
              that.oCopyDialog = null;
            }

            sap.m.MessageToast.show("Selected Locations and Product already exists.");
          }
          else {
            var oGetData = that.oGModel.getProperty("/oAllData")
            var isDuplicateFound = false;

            for (var i = 0; i < newArray.length; i++) {
              var newItem = newArray[i];

              var duplicate = oGetData.find(function (item) {
                return item.DEMAND_LOC === newItem.LOCATION_ID &&
                  item.PLAN_LOC === newItem.PLAN_LOC &&
                  item.FACTORY_LOC === newItem.FACTORY_LOC &&
                  item.PRODUCT_ID === newItem.PRODUCT_ID;
              });

              if (duplicate) {
                isDuplicateFound = true;
                break; // No need to continue once a duplicate is found
              }
            }

            if (isDuplicateFound) {
              sap.m.MessageBox.error("Entry already exists.");
              return false;
            }

            that.oModel.callFunction("/createProductBatch", {
              method: "GET",
              urlParameters: {
                Flag: "C",
                PRODATA: JSON.stringify(newArray)
              },
              success: function (oData) {
                sap.m.MessageToast.show(oData.createProductBatch);
                that.onCancel();
                //   that.onGetData();
                that.onclear();
                that.onResetData();

              },
              error: function (error) {
                MessageToast.show("Failed to create data");
              },
            });
          }
        }
        else {
          MessageToast.show("Please fill in all details");
        }
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
          oStorage.put("nodeId", 74);
          //Generate a  URL for the second application
          var url = window.location.href.split('#')[0] + hash;
          //Navigate to second app
          sap.m.URLHelper.redirect(url, true);
        }
      },

    });
  });
