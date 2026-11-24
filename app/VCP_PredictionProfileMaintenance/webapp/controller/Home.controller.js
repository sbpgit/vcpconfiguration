sap.ui.define(
  [
    "vcpapp/vcppredictionprofilemaintenance/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    MessageToast,
    MessageBox,
    JSONModel,
    Filter,
    FilterOperator,
    Device,
    Fragment
  ) {
    "use strict";
    var that, oGModel;
    var aResults;
    // var aResults = [ { 
    //   "CREATE_CHK": "disabled",
    //   "UPDATE_CHK": "disabled",
    //   "DELETE_CHK": "disabled"
    //    }]



    return BaseController.extend("vcpapp.vcppredictionprofilemaintenance.controller.Home", {
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       */

      onInit: function () {
        that = this;
        // Declaring JSON Models
        that.oListModel = new JSONModel();
        that.oParamModel = new JSONModel();
        that.oAlgoListModel = new JSONModel();
        that.oTabModel = new JSONModel();

        that.oPredModel = new JSONModel();
        that.oClusModel = new JSONModel();
        that.oForeModel = new JSONModel();

        that.onewclusterModel = new JSONModel();

        if (!that.cretaeFrag) {
          that.cretaeFrag = sap.ui.xmlfragment("vcpapp.vcppredictionprofilemaintenance.view.OptimizeCreate", that);
          that.getView().addDependent(that.cretaeFrag);
        }
        that.loadDerivedCharData();

        that.getUser();
      },

      /**
       * Called after the view has been rendered
       * Calls the getData[function] to get Data
       */
      onAfterRendering: function () {
        that = this;
        that.oGModel = that.getModel("oGModel");
        this.dDate = new Date().toISOString().split("T")[0];
        // that.oList = this.byId("profList");
        this.byId("headSearchPPM").setValue("");
        // that.oList.removeSelections();
        // if (that.oList.getBinding("items")) {
        //   that.oList.getBinding("items").filter([]);
        // }




        // Calling function
        this.getData();
        // that.getUser();
      },
      // 
      getUser: function () {
        var oModel = this.getOwnerComponent().getModel("BModel");
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
            that.userData = oData.results;
            if (aResults.length > 0) {
              var isUserLoggedIn = true;
            }
            if (isUserLoggedIn) {
              if (aResults[0].CREATE_CHK === "disabled") {
                that.byId("idAddPPM").setEnabled(false);
                that.byId("idCopyPPM").setEnabled(false)
              } else {
                that.byId("idAddPPM").setEnabled(true);
                that.byId("idCopyPPM").setEnabled(true)
              }
              if (aResults[0].UPDATE_CHK === "disabled") {
                that.byId("idEditPPM").setEnabled(false);
              } else {
                that.byId("idEditPPM").setEnabled(true);
              }
              if (aResults[0].DELETE_CHK === "disabled") {
                that.byId("idDeletePPM").setEnabled(false);
              } else {
                that.byId("idDeletePPM").setEnabled(true);
              }
            }
            else {
              that.byId("idAddPPM").setEnabled(true);
              that.byId("idCopyPPM").setEnabled(true);
              that.byId("idEditPPM").setEnabled(true);
              that.byId("idDeletePPM").setEnabled(true);
            }



          },
          error: function (oData, error) {
            MessageToast.show("error");
          }
        });
      },

      /**
       * Getting Data Initially and binding to elements
       */
      getData: function () {
        this.getModel("BModel").read("/getProfiles", {
          success: function (oData) {
            that.TableData = oData.results;

            var PredData = that.TableData.filter(el => el.TYPE === "P");
            var ClustData = that.TableData.filter(el => el.TYPE === "C");
            that.clusterData = ClustData;
            var ForeData = that.TableData.filter(el => el.TYPE === "F");


            that.oPredModel.setData({
              results: PredData,
            });

            that.oClusModel.setData({
              results: ClustData,
            });

            that.oForeModel.setData({
              results: ForeData,
            });

            that.byId("idPredPPM").setModel(that.oPredModel);
            that.byId("idClusPPM").setModel(that.oClusModel);
            that.byId("idForcastPPM").setModel(that.oForeModel);
            that.oGModel.setProperty("/tableData", oData.results);
            // that.oList.setModel(that.oListModel);
          },
          error: function () {
            MessageToast.show("Failed to get profiles");
          },
        });

        that.planningProData();
        // that.doSomethingUserDetails();
      },


      planningProData: function () {
        sap.ui.core.BusyIndicator.show();
        that.getOwnerComponent().getModel("PModel").read("/getPlanningProfile", {
          success: function (oData) {

            // if(that.TplanningPro === undefined){
            //     that.TplanningPro = [];
            // }
            sap.ui.core.BusyIndicator.hide();
            that.TplanningPro = oData.results;
            that.PlanprofileModel = new JSONModel();
            that.PlanprofileModel.setData({
              PlanningProfiles: that.TplanningPro
            });
            that.byId("idPlanProfilePPM").setModel(that.PlanprofileModel);
            that.getOptimizeData()
          },
          error: function () {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("Failed to get profiles");
          }

        });

      },

      // onPrifileChange:function(oEvent){
      //   var selProfile = that.byId("idProfile")._getSelectedItemKey();

      //   var tempData = that.TableData.filter(el=> el.TYPE = selProfile);

      //   that.oListModel.setData({
      //     results: tempData,
      //   });
      //   that.oList.setModel(that.oListModel);


      // },

      onChange: function (oEvent) {
        var selItem = oEvent.getParameter("item").getKey();

        if (selItem === "Planning") {
          that.byId("idPlanProfilePPM").setVisible(true);
          that.byId("idPlanBtPPM").setVisible(true);
          that.byId("idPlanProfilePPM").getBinding("items").filter([]);
          that.byId("idClusPPM").setVisible(false);
          that.onTabSelect();

        } else if (selItem === "cluster") {
          that.byId("idPlanProfilePPM").setVisible(false);
          that.byId("idPlanBtPPM").setVisible(false);
          that.byId("idClusPPM").setVisible(true);
          that.byId("idClusPPM").getBinding("items").filter([])
          that.byId("idAddPPM").setVisible(true);
          that.byId("idEditPPM").setVisible(true);
          that.byId("idCopyPPM").setVisible(true);
          that.byId("idDeletePPM").setVisible(true);
        }
      },
      onTabSelect: function (oEvent) {
        that.byId("headSearchPPM").setValue("")
        var sSelTab = that.byId("idIconTabBarInlineModePPM").getSelectedKey();
        if (sSelTab == "PCPro") {
          if (that.byId("idSegmPPM").getSelectedKey() == "Planning") {

            that.byId("idAddPPM").setVisible(false);
            that.byId("idEditPPM").setVisible(false);
            that.byId("idCopyPPM").setVisible(false);
            that.byId("idDeletePPM").setVisible(false);
          }
          else if (that.byId("idSegmPPM").getSelectedKey() == "cluster") {
            that.byId("idClusPPM").getBinding("items").filter([])
          }
        }
        else if (sSelTab == "PrePro") {
          that.byId("idPredPPM").getBinding("items").filter([])

          that.byId("idAddPPM").setVisible(true);
          that.byId("idEditPPM").setVisible(true);
          that.byId("idCopyPPM").setVisible(true);
          that.byId("idDeletePPM").setVisible(true);
        }
        else if (sSelTab == "forPro") {
          that.byId("idForcastPPM").getBinding("items").filter([])

          that.byId("idAddPPM").setVisible(true);
          that.byId("idEditPPM").setVisible(true);
          that.byId("idCopyPPM").setVisible(true);
          that.byId("idDeletePPM").setVisible(true);
        }
        else if (sSelTab == "DerivedCharPPM") {
          that.byId("idAddPPM").setVisible(false);
          that.byId("idEditPPM").setVisible(false);
          that.byId("idCopyPPM").setVisible(false);
          that.byId("idDeletePPM").setVisible(false);
        }
        else if (sSelTab == "Optimize") {
          that.byId("idOptPPM").getBinding("items").filter([])
        }

      },
      /**
       * Called when something is entered into the search field
       * @param {object} oEvent -the event information
       */
      onSearch: function (oEvent) {
        var sQuery =
          oEvent.getParameter("value") || oEvent.getParameter("newValue"),
          oFilters = [];

        var selKey = that.byId("idIconTabBarInlineModePPM").getSelectedKey();
        var id = "";
        if (selKey === "PrePro") {
          id = that.byId("idPredPPM");
        } else if (selKey === "PCPro") {
          if (that.byId("idSegmPPM").getSelectedKey() === "Planning") {
            id = that.byId("idPlanProfilePPM");
          } else {
            id = that.byId("idClusPPM");
          }
        } else if (selKey === "forPro") {
          id = that.byId("idForcastPPM");
        } else if (selKey === "Optimize") {
          id = that.byId("idOptPPM")
        }
        else if (selKey === "DerivedCharPPM") {
          id = that.byId("idDerivedCharPPM");
        }

        sQuery = sQuery ? sQuery.trim() : "";
        if (selKey === "PCPro" && that.byId("idSegmPPM").getSelectedKey() === "Planning") {
          oFilters.push(
            new Filter({
              filters: [
                new Filter("PLANNING_PROFILE", FilterOperator.Contains, sQuery),
              ],
              and: false,
            })
          );
        }
        else if (selKey === "DerivedCharPPM") {
          if (sQuery !== "") {
            oFilters.push(new Filter({
              filters: [
                new Filter("PROFILE", FilterOperator.Contains, sQuery),
                new Filter("PROFILE_DESC", FilterOperator.Contains, sQuery),
                new Filter("PAST_SALES_ORD", FilterOperator.EQ, sQuery)
              ],
              and: false
            }));
          } else {
            id.getBinding("items").filter([]); 
            return;
          }

        }
        else {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("PROFILE", FilterOperator.Contains, sQuery),
                  new Filter("PRF_DESC", FilterOperator.Contains, sQuery),
                  new Filter("METHOD", FilterOperator.Contains, sQuery),
                ],
                and: false,
              })
            );
          } else {
            id.getBinding("items").filter([])
          }
        }
        id.getBinding("items").filter(oFilters);
      },

      /**
       * This function is called when a click on parameter button.
       */
      onParameters: function (oEvent) {
        var sSelProfie = oEvent.getSource().getParent().getCells()[0].getTitle();
        var sSelMethod = oEvent.getSource().getParent().getCells()[1].getText();

        // Setting title for fragment
        var sTitle =
          "Parameters " + " " + " - " + sSelProfie + " " + " - " + sSelMethod;

        if (!that._onParameter) {
          that._onParameter = sap.ui.xmlfragment(
            "vcpapp.vcppredictionprofilemaintenance.view.Parameter",
            that
          );
          that.getView().addDependent(that._onParameter);
        }
        // Setting title for fragment
        that._onParameter.setTitleAlignment("Center");
        that._onParameter.setTitle(sTitle);
        that.paramList = sap.ui.getCore().byId("idParamPPM");
        if (sSelMethod !== "AUTOML") {
          that.paramList.getColumns()[1].setVisible(false);
        }
        else {
          that.paramList.getColumns()[1].setVisible(true);
        }

        this.getModel("BModel").read("/getProfileParameters", {
          filters: [
            new Filter("PROFILE", FilterOperator.EQ, sSelProfie),
            new Filter("METHOD", FilterOperator.EQ, sSelMethod),
          ],
          success: function (oData) {
            that.oParamModel.setData({
              results: oData.results,
            });
            that.paramList.setModel(that.oParamModel);
            that._onParameter.open();
          },
          error: function () {
            MessageToast.show("Failed to get data");
          },
        });
      },

      /**
       * Called when 'Close/Cancel' button in any dialog is pressed.
       */
      onParaClose: function () {
        that._onParameter.close();
      },

      /**
       * This function is called when a click on buttons Create/ Copy/ Edit.
       */
      onCreate: function (oEvent) {
        that.oGModel = that.getModel("oGModel");
        // Getting button tooltip to perform action
        var sId = oEvent.getSource().getTooltip();
        var selKey = that.byId("idIconTabBarInlineModePPM").getSelectedKey();
        that.oGModel.setProperty("/id", selKey)
        var id = "";
        if (selKey === "PrePro") {
          id = that.byId("idPredPPM");
        } else if (selKey === "PCPro") {
          id = that.byId("idClusPPM");
        } else if (selKey === "forPro") {
          id = that.byId("idForcastPPM");
        } else if (selKey == "Optimize") {
          that.OptimizeTab(oEvent);
          return
        }
        var sSelRow = id.getSelectedItems();
        that.oGModel.setProperty("/sId", sId);
        if (sId === "Copy" || sId === "Edit") {
          if (sSelRow.length) {
            var sSelUsername = id.getSelectedItem().getBindingContext().getProperty().CREATED_BY;
            var sSelAlgo = sSelRow[0].getBindingContext().getProperty();
            that.oGModel.setProperty("/sProfile", sSelAlgo.PROFILE);
            that.oGModel.setProperty("/sProf_desc", sSelAlgo.PRF_DESC);
            that.oGModel.setProperty("/sMethod", sSelAlgo.METHOD);
            that.oGModel.setProperty("/sType", sSelAlgo.TYPE);
            that.oGModel.setProperty("/sCreatedBy", sSelUsername);

            // Called when it routes to a page containing the item details
            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
            oRouter.navTo("Detail", {}, true);
          } else {
            MessageToast.show("Please select one row");
          }
        } else if (sId === "Create") {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
          oRouter.navTo("Detail", {}, true);
        }

      },

      /**
       * This function is called when a click on Deleting profile button.
       */
      onDelete: function (oEvent) {

        var selKey = that.byId("idIconTabBarInlineModePPM").getSelectedKey();
        var id = "";
        if (selKey == "Optimize") {
          that.onDelOptimize(oEvent);
          return
        }
        if (selKey === "PrePro") {
          id = that.byId("idPredPPM");
        } else if (selKey === "PCPro") {
          id = that.byId("idClusPPM");
        } else if (selKey === "forPro") {
          id = that.byId("idForcastPPM");
        }



        var sSelRow1 = id.getSelectedItems();
        var sId1 = oEvent.getSource().getTooltip();
        if (sSelRow1.length > 0) {
          var sSelRow = id
            .getSelectedItems()[0]
            .getBindingContext()
            .getProperty();

          sap.ui.core.BusyIndicator.show();
          var oEntry = {};

          oEntry.PROFILE = sSelRow.PROFILE;
          oEntry.METHOD = sSelRow.METHOD;
          oEntry.PRF_DESC = "D";
          sap.ui.core.BusyIndicator.show();
          that.getModel("BModel").callFunction("/createProfiles", {
            method: "GET",
            urlParameters: {
              PROFILE: oEntry.PROFILE,
              METHOD: oEntry.METHOD,
              PRF_DESC: oEntry.PRF_DESC,
              CREATED_DATE: that.dDate,
              CREATED_BY: "",
              PARAMETERS: "",
              TYPE: sSelRow.TYPE
            },
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();
              sap.m.MessageToast.show("Profile deleted");
              //Calling function to delete Profile Parameters
              that.tablesendbatch();
            },
            error: function (error) {
              sap.ui.core.BusyIndicator.hide();
              sap.m.MessageToast.show("Failed to delete Profile parameters");
            },
          });
        } else {
          sap.m.MessageToast.show("Select atleast one item");
        }
      },

      /**
       * This function is called when deleting Profile Parameters.
       */
      tablesendbatch: function () {

        var selKey = that.byId("idIconTabBarInlineModePPM").getSelectedKey();
        var id = "";
        if (selKey === "PrePro") {
          id = that.byId("idPredPPM");
        } else if (selKey === "PCPro") {
          id = that.byId("idClusPPM");
        } else if (selKey === "forPro") {
          id = that.byId("idForcastPPM");
        }


        var sSelRow = id
          .getSelectedItems()[0]
          .getBindingContext()
          .getProperty();

        sap.ui.core.BusyIndicator.show();
        that.getModel("BModel").callFunction("/createProfilePara", {
          method: "GET",
          urlParameters: {
            FLAG: "D",
            PROFILE: sSelRow.PROFILE,
            METHOD: sSelRow.METHOD,
            PARA_NAME: "",
            INTVAL: 0,
            DOUBLEVAL: 0.0,
            STRVAL: "",
            PARA_DESC: "",
            PARA_DEP: "",
            CREATED_DATE: that.dDate,
            CREATED_BY: ""
          },
          success: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageToast.show("Profile parameters deleted");
            // Refreshing the page after deletion
            that.onAfterRendering();
          },
          error: function (error) {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageToast.show("Failed to delete Profile parameters");
          },
        });
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
          var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
          oStorage.put("nodeId", 76);

          //Generate a  URL for the second application
          var url = window.location.href.split('#')[0] + hash;
          //Navigate to second app
          sap.m.URLHelper.redirect(url, true);
        }
      },

      // // In Controller
      // doSomethingUserDetails: async function () {
      //   const oUserInfo = await this.getUserInfoService();
      //   const sUserId = oUserInfo.getId(); // And in SAPUI5 1.86, those became public: .getEmail(), .getFirstName(), .getLastName(), .getFullName(), ... 
      //   // ...
      // },

      // getUserInfoService: function () {
      //   return new Promise(resolve => sap.ui.require([
      //     "sap/ushell/library"
      //   ], oSapUshellLib => {
      //     const oContainer = oSapUshellLib.Container;
      //     const pService = oContainer.getServiceAsync("UserInfo"); // .getService is deprecated!
      //     resolve(pService);
      //   }));
      // },
      // onBtnSelect: function (oEvent) {
      //   var selectedItem = oEvent.getParameters().listItem.getBindingContext().getObject();
      //   if (selectedItem.CREATED_BY === "SBP") {
      //     that.byId("idEditPPM").setEnabled(false);
      //     that.byId("idDeletePPM").setEnabled(false);
      //   }
      //   else {
      //     that.byId("idEditPPM").setEnabled(true);
      //     that.byId("idDeletePPM").setEnabled(true);
      //   }
      // }
      onBtnSelect: function (oEvent) {
        var selectedItem = oEvent.getParameters().listItem.getBindingContext().getObject();
        if (selectedItem.CREATED_BY === "SBP") {
          that.byId("idEditPPM").setEnabled(true);
          that.byId("idDeletePPM").setEnabled(true);
        }
        else {

          if (that.userData.length > 0) {
            var isUserLoggedIn = true;
          }
          if (isUserLoggedIn) {
            if (that.userData[0].CREATE_CHK === "disabled") {
              that.byId("idAddPPM").setEnabled(false);
              that.byId("idCopyPPM").setEnabled(false)
            } else {
              that.byId("idAddPPM").setEnabled(true);
              that.byId("idCopyPPM").setEnabled(true)
            }
            if (that.userData[0].UPDATE_CHK === "disabled") {
              that.byId("idEditPPM").setEnabled(false);
            } else {
              that.byId("idEditPPM").setEnabled(true);
            }
            if (that.userData[0].DELETE_CHK === "disabled") {
              that.byId("idDeletePPM").setEnabled(false);
            } else {
              that.byId("idDeletePPM").setEnabled(true);
            }
          }
          else {
            that.byId("idAddPPM").setEnabled(true);
            that.byId("idCopyPPM").setEnabled(true);
            that.byId("idEditPPM").setEnabled(true);
            that.byId("idDeletePPM").setEnabled(true);
          }
          // that.getUser()
          // // that.byId("idEditPPM").setEnabled(true);
          // // that.byId("idDeletePPM").setEnabled(true);
        }
      },

      handleValueHelp: function () {


        if (!this._valueHelpDialogCluster) {
          this._valueHelpDialogCluster = sap.ui.xmlfragment(
            "vcpapp.vcppredictionprofilemaintenance.view.ClusterProfileDialog",
            this
          );
          this.getView().addDependent(this._valueHelpDialogCluster);
        }


        this.onewclusterModel = new JSONModel();
        that.onewclusterModel.setData({
          results: that.clusterData
        });
        sap.ui.getCore().byId("idClusterProfilePPM").setModel(that.onewclusterModel);

        this._valueHelpDialogCluster.open();

      },

      handleClose: function () {
        sap.ui.getCore().byId(this._valueHelpDialogCluster.getId() + "-searchField").setValue("");
        if (sap.ui.getCore().byId("idClusterProfilePPM").getBinding("items")) {
          sap.ui.getCore().byId("idClusterProfilePPM").getBinding("items").filter([]);
        }
        that._valueHelpDialogCluster.close();

      },

      handleSearch: function (oEvent) {
        var sQuery =
          oEvent.getParameter("value") || oEvent.getParameter("newValue"),
          sId = oEvent.getParameter("id"),
          oFilters = [];
        // Check if search filter is to be applied
        sQuery = sQuery ? sQuery.trim() : "";

        if (sQuery !== "") {
          oFilters.push(
            new Filter({
              filters: [
                new Filter("PROFILE", FilterOperator.Contains, sQuery),
                new Filter("PRF_DESC", FilterOperator.Contains, sQuery),
              ],
              and: false,
            })
          );
        }
        sap.ui.getCore().byId("idClusterProfilePPM").getBinding("items").filter(oFilters);

      },
      handleSelection: function (oEvent) {
        var aSelecteditem = oEvent.getParameter("selectedItems");
        sap.ui.getCore().byId("clusterPlanPPM").setValue(aSelecteditem[0].getTitle());


      },


      onAddtData: function (oEvent) {


        if (!this._valueHelpDialog) {
          this._valueHelpDialog = sap.ui.xmlfragment(
            "vcpapp.vcppredictionprofilemaintenance.view.Create",
            this
          );
          this.getView().addDependent(this._valueHelpDialog);
        }
        that._valueHelpDialog.setTitleAlignment("Center");
        sap.ui.getCore().byId("idtitle").setText("Creation Planing Profile");

        that.flag = "";
        this._valueHelpDialog.open();

      },

      onEditData: function (oEvent) {
        if (!this._valueHelpDialog) {
          this._valueHelpDialog = sap.ui.xmlfragment(
            "vcpapp.vcppredictionprofilemaintenance.view.Create",
            this
          );
          this.getView().addDependent(this._valueHelpDialog);
        }

        sap.ui.getCore().byId("idtitle").setText("Updating Planing Profile");
        that._valueHelpDialog.setTitleAlignment("Center");
        var selItem = oEvent.getSource().getParent().getCells()[0].getBindingContext().getObject();

        var core = sap.ui.getCore();

        core.byId("idPlanProfPPM").setValue(selItem.PLANNING_PROFILE);
        core.byId("clusterPlanPPM").setValue(selItem.CLUSTERING_PROFILE);
        core.byId("minPidPPM").setValue(selItem.MIMIMUM_PRIMARY_IDS);
        core.byId("pidPercentPPM").setValue(selItem.PERCENTAGE);
        core.byId("threDMDPPM").setValue(selItem.THRESHOLD_DMD);
        core.byId("minClustPPM").setValue(selItem.MINIMUM_CLUSTERS);
        core.byId("maxClustPPM").setValue(selItem.MAXIMUM_CLUSTERS);
        core.byId("pastweekPPM").setValue(selItem.PAST_PERIODS);
        core.byId("futweekPPM").setValue(selItem.FUTURE_PERIODS);
        that.flag = "";
        this._valueHelpDialog.open();

      },

      onHandleClose: function () {
        var core = sap.ui.getCore();

        core.byId("idPlanProfPPM").setValue();
        core.byId("clusterPlanPPM").setValue();
        core.byId("minPidPPM").setValue();
        core.byId("pidPercentPPM").setValue();
        core.byId("threDMDPPM").setValue();
        core.byId("minClustPPM").setValue();
        core.byId("maxClustPPM").setValue();
        core.byId("pastweekPPM").setValue();
        core.byId("futweekPPM").setValue();


        core.byId("minPidPPM").setValueState("None");
        core.byId("pidPercentPPM").setValueState("None");
        core.byId("threDMDPPM").setValueState("None");
        core.byId("minClustPPM").setValueState("None");
        core.byId("maxClustPPM").setValueState("None");
        core.byId("pastweekPPM").setValueState("None");
        core.byId("futweekPPM").setValueState("None");
        that._valueHelpDialog.close();
      },

      onPlanningProfileSave: function (oEvent) {
        var changedData = [];
        var clust = sap.ui.getCore().byId("clusterPlanPPM").getValue()
        var plan = sap.ui.getCore().byId("idPlanProfPPM").getValue()
        var minP = sap.ui.getCore().byId("minPidPPM").getValue()
        var mincl = sap.ui.getCore().byId("minClustPPM").getValue()
        var maxcl = sap.ui.getCore().byId("maxClustPPM").getValue()
        var pidP = sap.ui.getCore().byId("pidPercentPPM").getValue()
        var pastwe = sap.ui.getCore().byId("pastweekPPM").getValue()
        var fuwe = sap.ui.getCore().byId("futweekPPM").getValue()
        var tdmd = sap.ui.getCore().byId("threDMDPPM").getValue()


        var tempObj = {
          CLUSTERING_PROFILE: clust,
          PLANNING_PROFILE: plan,
          MIMIMUM_PRIMARY_IDS: minP,
          MINIMUM_CLUSTERS: mincl,
          MAXIMUM_CLUSTERS: maxcl,
          PERCENTAGE: pidP,
          PAST_PERIODS: pastwe,
          FUTURE_PERIODS: fuwe,
          THRESHOLD_DMD: tdmd
        }
        changedData.push(tempObj);


        if (clust !== "" && plan !== "" && minP !== "" && mincl !== "" && maxcl !== "" && pidP !== "" && pastwe !== "" && fuwe !== "" && tdmd !== "") {
          sap.ui.core.BusyIndicator.show();
          that.getOwnerComponent().getModel("PModel").callFunction("/fhandlePlanningProfiles", {
            method: "GET",
            urlParameters: {
              cudType: "CREATE",
              profilesList: JSON.stringify(changedData)
            },
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("Successfully created Planning Profile");
              that.onHandleClose();
              that.planningProData();
            },
            error: function (oData) {
              MessageToast.show("Failed to createPlanning Profile");
              sap.ui.core.BusyIndicator.hide();
            },
          });
        } else {
          MessageToast.show("Please enter value for all parameters");
        }

      },

      deletePlanningProfiles: function (oEvent) {

        // Getting the index of item which need to delete
        var oIndex = oEvent.getParameter("listItem").getBindingContext().sPath.split("/")[2],
          aData = that.PlanprofileModel.getData().PlanningProfiles;


        var text = "Do you want to delete ?";
        sap.m.MessageBox.show(
          text, {
          title: "! Confirmation",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {


              var delData = [{
                PLANNING_PROFILE: aData[oIndex].PLANNING_PROFILE
              }]
              sap.ui.core.BusyIndicator.show();
              that.getOwnerComponent().getModel("PModel").callFunction("/fhandlePlanningProfiles", {
                method: "GET",
                urlParameters: {
                  cudType: "DELETE",
                  profilesList: JSON.stringify(delData)
                },
                success: function (oData) {
                  sap.ui.core.BusyIndicator.hide();
                  MessageToast.show("Successfully deleted");
                  that.planningProData();
                },
                error: function (oData) {
                  MessageToast.show("Failed to delete Planning Profile");
                  sap.ui.core.BusyIndicator.hide();
                },
              });
            }

          }
        }
        );



      },

      onValue: function (oEvent) {
        var value = oEvent.getParameters().newValue;

        // sap.ui.getCore().byId("confirmBtnPPM").setVisible(false);


        if (parseInt(value) < 1) {
          sap.ui.getCore().byId(oEvent.getParameters().id).setValue();
        }

        if (oEvent.getParameters().id === "maxClustPPM" || oEvent.getParameters().id === "minClustPPM") {
          var min = sap.ui.getCore().byId("minClustPPM").getValue(),
            max = sap.ui.getCore().byId("maxClustPPM").getValue();
          if (parseInt(min) >= parseInt(max)) {
            sap.ui.getCore().byId("minClustPPM").setValueState("Error");
            sap.ui.getCore().byId("maxClustPPM").setValueState("Error");
            sap.ui.getCore().byId("minClustPPM").setValueStateText("Minimum value can not be greater or equal");
            sap.ui.getCore().byId("maxClustPPM").setValueStateText("Maximum value can not be lessthen Minimum or equal value");
            that.cluFlag = "X";
            that.minClu = "X"
          } else {
            sap.ui.getCore().byId("minClustPPM").setValueState("None");
            sap.ui.getCore().byId("maxClustPPM").setValueState("None");
            that.cluFlag = "";
            that.minClu = ""
          }
        }
        // if(oEvent.getParameters().id === "minClustPPM"){
        //     if(parseInt(value) > 0){
        //       sap.ui.getCore().byId("minClustPPM").setValueState("Error");
        //       sap.ui.getCore().byId("minClustPPM").setValueStateText("Minimum value can not be lessthen 1"); 
        //       that.minClu = "X";
        //     }
        //   else {
        //     sap.ui.getCore().byId("minClustPPM").setValueState("None");
        //     that.minClu = "";

        //   }
        // } 

        //   if(oEvent.getParameters().id === "maxClustPPM"){
        //     if(parseInt(value) <= 3){
        //       sap.ui.getCore().byId("maxClustPPM").setValueState("Error");
        //       sap.ui.getCore().byId("maxClustPPM").setValueStateText("Maximum value can not be lessthen 2"); 
        //     that.maxClu = "X";
        //   } else {
        //     sap.ui.getCore().byId("maxClustPPM").setValueState("None"); 
        //     that.maxClu = "";
        //   }
        // }
        var id = oEvent.getParameters().id;
        if (id === "minPidPPM") {
          if (parseInt(value) <= 0 || parseInt(value) > 1000) {
            sap.ui.getCore().byId("minPidPPM").setValueState("Error");
            sap.ui.getCore().byId("minPidPPM").setValueStateText("Value can not be lessthen 1 and can not be greaterthen 1000");
            that.minP = "X";
          } else {
            sap.ui.getCore().byId("minPidPPM").setValueState("None");
            that.minP = "";
          }
        }

        if (id === "pidPercentPPM") {
          if (parseInt(value) <= 0 || parseInt(value) > 100) {
            sap.ui.getCore().byId("pidPercentPPM").setValueState("Error");
            sap.ui.getCore().byId("pidPercentPPM").setValueStateText("Value can not be lessthen 1 an d can not be morethen 100");
            that.pidper = "X";
          } else {
            sap.ui.getCore().byId("pidPercentPPM").setValueState("None");
            that.pidper = "";
          }

        }

        if (id === "threDMDPPM") {
          if (parseInt(value) <= 0) {
            sap.ui.getCore().byId("threDMDPPM").setValueState("Error");
            sap.ui.getCore().byId("threDMDPPM").setValueStateText("Value can not be lessthen 1");
            that.thDmd = "X";
          } else {
            sap.ui.getCore().byId("threDMDPPM").setValueState("None");
            that.thDmd = "";
          }

        }


        if (id === "pastweekPPM") {
          if (parseInt(value) < 25) {
            sap.ui.getCore().byId("pastweekPPM").setValueState("Error");
            sap.ui.getCore().byId("pastweekPPM").setValueStateText("Maximum value can not be lessthen 25");
            that.weekpast = "X";
          } else {
            sap.ui.getCore().byId("pastweekPPM").setValueState("None");
            that.weekpast = "";
          }

        }


        if (that.cluFlag == "X" || that.minClu == "X" || that.maxClu == "X" || that.minP == "X" ||
          that.pidper == "X" || that.thDmd == "X" || that.weekpast == "X") {
          sap.ui.getCore().byId("confirmBtnPPM").setEnabled(false);
        } else {
          sap.ui.getCore().byId("confirmBtnPPM").setEnabled(true);
        }

      },
      checkspecialChars: function (oEvent) {

        var specials = /[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/;
        var name = oEvent.getParameters().newValue;

        var profilename = specials.test(name);

        if (profilename === false) {
          sap.ui.getCore().byId("idPlanProfPPM").setValueState("None");
        } else {
          sap.ui.getCore().byId("idPlanProfPPM").setValueState("Error");
          sap.ui.getCore().byId("idPlanProfPPM").setValueStateText("Special characters are not allowed");
        }
      },
      getOptimizeData: function () {
        that.getOwnerComponent().getModel("BModel").read("/getOptimizations", {
          success: function (oData) {
            that.OptimizeData = oData.results;
            that.OptimizeData.map((e) => {
              if (e.CHAR_WEIGHTAGE == true) {
                e.CHAR_WEIGHTAGE = "Yes"
              } else {
                e.CHAR_WEIGHTAGE = "No"
              }
            })
            that.oGModel.setProperty("/Optimization", that.OptimizeData);



            that.OptModel = new JSONModel();
            that.OptModel.setData({
              results: that.OptimizeData
            });
            that.byId("idOptPPM").setModel(that.OptModel);

          },
          error: function () {
            MessageToast.show("Failed to get Optimize Data");
          }

        });
      },
      OptimizeTab: function (oEvent) {

        var sId = oEvent.getSource().getTooltip();
        var id = that.byId("idOptPPM");
        var sSelRow = id.getSelectedItems();

        if (sId == "Create") {
          sap.ui.getCore().byId("idProfileOptPPM").setValue();
          sap.ui.getCore().byId("idProfileOptDes").setValue();
          sap.ui.getCore().byId("idAlgorithmPPM").setSelectedKey();
          sap.ui.getCore().byId("idFactorPPM").setValue(0.90);
          sap.ui.getCore().byId("idCharWePPM").setState(false);
          // sap.ui.getCore().byId("idCharWePPM").setText("False");
          sap.ui.getCore().byId("idRestItem2PPM").setTitle("Create Optimization Profile")
          sap.ui.getCore().byId("idProfileOptPPM").setEditable(true)

          that.cretaeFrag.open();

        }
        else if (sId === "Copy" || sId === "Edit") {
          if (sSelRow.length > 0) {

            var aEditItem = sSelRow[0].getBindingContext().getObject();
            if (sId == "Copy") {
              sap.ui.getCore().byId("idProfileOptDes").setEditable(true)
              sap.ui.getCore().byId("idProfileOptDes").setValue(aEditItem.PROFILE_DESC + "_Copy")
            } else {
              sap.ui.getCore().byId("idProfileOptDes").setValue(aEditItem.PROFILE_DESC);
            }


            sap.ui.getCore().byId("idProfileOptPPM").setValue(aEditItem.PROFILE)
            if (sId == "Copy") {
              sap.ui.getCore().byId("idProfileOptPPM").setEditable(true)
              // sap.ui.getCore().byId("idProfileOptPPM").setValue()
              sap.ui.getCore().byId("idProfileOptPPM").setValue(aEditItem.PROFILE + "_Copy")
            } else {
              sap.ui.getCore().byId("idProfileOptPPM").setEditable(false)
            }

            sap.ui.getCore().byId("idAlgorithmPPM").setSelectedKey(aEditItem.ALGORITHM);
            sap.ui.getCore().byId("idFactorPPM").setValue(aEditItem.OPTIMIZATION_FACTOR);
            if (aEditItem.CHAR_WEIGHTAGE === "Yes" || aEditItem.CHAR_WEIGHTAGE === true) {
              sap.ui.getCore().byId("idCharWePPM").setState(true);
              // sap.ui.getCore().byId("idCharWePPM").setText("True");
            } else {
              sap.ui.getCore().byId("idCharWePPM").setState(false);
              // sap.ui.getCore().byId("idCharWePPM").setText("False");
            }
            sap.ui.getCore().byId("idFactorPPM").setValueState();
            if (aEditItem.CHAR_WEIGHTAGE == true || aEditItem.CHAR_WEIGHTAGE === "True") {
              // sap.ui.getCore().byId("idCharWePPM").setText("True");
            } else {
              // sap.ui.getCore().byId("idCharWePPM").setText("False");
            }
            if (sId == "Copy") {
              sap.ui.getCore().byId("idRestItem2PPM").setTitle("Copy Optimization Profile");
            } else {
              sap.ui.getCore().byId("idRestItem2PPM").setTitle("Edit Optimization Profile");
            }
            that.cretaeFrag.open()


          }
          else {
            MessageToast.show("Please select one row");
          }
        }

      },
      onSave: function () {

        var finalArray = []
        var obj = {
          ALGORITHM: sap.ui.getCore().byId("idAlgorithmPPM").getSelectedKey(),
          OPTIMIZATION_FACTOR: parseFloat(sap.ui.getCore().byId("idFactorPPM").getValue()),
          CHAR_WEIGHTAGE: (sap.ui.getCore().byId("idCharWePPM").getState()),
          PROFILE: sap.ui.getCore().byId("idProfileOptPPM").getValue().toUpperCase(),
          PROFILE_DESC: sap.ui.getCore().byId("idProfileOptDes").getValue().toUpperCase(),
          CREATED_BY: "SBP", //that.User,
          CREATED_DATE: '9999-12-31'

        }
        finalArray.push(obj);


        that.onOptimizeCreation(finalArray);
      },
      //Funstarts
      onOptimizeCreation: function (finalArray) {
        sap.ui.core.BusyIndicator.show();
        if (finalArray[0].ALGORITHM.length <= 0 || finalArray[0].PROFILE.length <= 0 || finalArray[0].OPTIMIZATION_FACTOR > 0.99 || finalArray[0].OPTIMIZATION_FACTOR < 0.70 || finalArray[0].OPTIMIZATION_FACTOR == 0 || finalArray[0].PROFILE_DESC.length <= 0 || sap.ui.getCore().byId("idFactorPPM").getValueState() == "Error") {
          sap.ui.core.BusyIndicator.hide();
          MessageToast.show("Please Maintain Required Fields");
          return false;
        }
        else {
          var sId = sap.ui.getCore().byId("idRestItem2PPM").getTitle()
          if (sId.includes("Create") || sId.includes("Copy")) {
            var aTabData = that.oGModel.getProperty("/Optimization");
            for (let i = 0; i < aTabData.length; i++) {
              if (aTabData[i].PROFILE == finalArray[0].PROFILE) {
                MessageToast.show("Profile Already Exits")
                sap.ui.core.BusyIndicator.hide();
                return false
              }
            }
            that.getOwnerComponent().getModel("BModel").callFunction("/maintainOptimizations", {
              urlParameters: {
                FLAG: "C",
                OPTM: JSON.stringify(finalArray)
              },
              success: function (oData) {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("Successfully Created");
                that.getOptimizeData();
                that.onClose();

              },
              error: function (oData) {
                MessageToast.show("Failed to create");
                sap.ui.core.BusyIndicator.hide();
              },
            });
          } else {
            that.getOwnerComponent().getModel("BModel").callFunction("/maintainOptimizations", {
              urlParameters: {
                FLAG: "U",
                OPTM: JSON.stringify(finalArray)
              },
              success: function (oData) {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("Successfully Updated");
                that.getOptimizeData();
                that.onClose();

              },
              error: function (oData) {
                MessageToast.show("Failed to Update");
                sap.ui.core.BusyIndicator.hide();
              },
            });
          }
        }

      },
      onDelOptimize: function () {
        var id = that.byId("idOptPPM");
        var sSelRow = id.getSelectedItems();
        var deletedItems = [sSelRow[0].getBindingContext().getObject()];
        if (deletedItems.length <= 0) {
          MessageToast.show("Please select a row ")
          return
        }
        var sMessage = "Are you sure you want to Delete " + sSelRow[0].getBindingContext().getObject().PROFILE + " Profile";
        var sTitle = "Confirmation";

        MessageBox.confirm(sMessage, {
          title: sTitle,
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          emphasizedAction: MessageBox.Action.YES,
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.YES) {
              // Action to take if "Yes" is pressed
              that.getView().getModel("BModel").callFunction("/maintainOptimizations", {
                urlParameters: {
                  FLAG: "D",
                  OPTM: JSON.stringify(deletedItems)
                },
                success: function (oData) {
                  MessageToast.show("Deleted Successfully")
                  that.getOptimizeData();
                },
                error: function (error) {
                  sap.ui.core.BusyIndicator.hide();
                  MessageToast.show("Failed to Delete Profile");
                },
              });

            } else {
              // Action to take if "No" is pressed
              sap.m.MessageToast.show("Action cancelled");
            }
          }
        });
      },
      onSel: function () {
        var oSel = sap.ui.getCore().byId("idCharWePPM").getPressed();
        if (oSel == false) {
          // sap.ui.getCore().byId("idCharWePPM").setText("False");
        } else {
          // sap.ui.getCore().byId("idCharWePPM").setText("True")
        }
      },
      onSelFactor: function (oEvent) {
        let value = parseFloat(oEvent.getSource().getValue());
        if (value > parseFloat(0.99) || value < 0.70) {
          sap.ui.getCore().byId("idFactorPPM").setValueState("Error");
          sap.ui.getCore().byId("idFactorPPM").setValueStateText("Please select a factor range between 0.70 to 0.99");
        } else {
          sap.ui.getCore().byId("idFactorPPM").setValueState("Success");
        }
      },
      onClose: function () {
        that.cretaeFrag.close()
      },
      loadDerivedCharData: function () {

        var that = this;

        this.getOwnerComponent().getModel("BModel").read("/getDerivedCharProfile", {
          success: function (oData) {

            var oJsonModel = new sap.ui.model.json.JSONModel({
              DerivedChar: oData.results || []
            });

            that.getView().setModel(oJsonModel, "derivedModel");
          },

          error: function () {
            sap.m.MessageToast.show("Failed to load data");
          }
        });
      },

      onAddDerivedChar: function () {
        if (!this._oDerivedDialog) {
          this._oDerivedDialog = sap.ui.xmlfragment(
            "vcpapp.vcppredictionprofilemaintenance.view.DerivedChar",
            this
          );
          this.getView().addDependent(this._oDerivedDialog);
        }
        that._oDerivedDialog.setTitleAlignment("Center");
        sap.ui.getCore().byId("idDerivedtitle").setText("Creation of Derived Characteristic Profile");
        sap.ui.getCore().byId("idProfileNamePPM").setEditable(true);
        sap.ui.getCore().byId("idProfileNamePPM").setValueState("None");
        this._oDerivedDialog.open();

      },
      onEditDerivedChar: function (oEvent) {
        var oContext = oEvent.getSource().getBindingContext("derivedModel");
        var selItem = oContext.getObject();

        if (!this._oDerivedDialog) {
          this._oDerivedDialog = sap.ui.xmlfragment(
            "vcpapp.vcppredictionprofilemaintenance.view.DerivedChar",
            this
          );
          this.getView().addDependent(this._oDerivedDialog);
        }

        sap.ui.getCore().byId("idDerivedtitle").setText("Updation of Derived Characteristic Profile");
        this._oDerivedDialog.setTitleAlignment("Center");
        var core = sap.ui.getCore();
        core.byId("idProfileNamePPM").setValue(selItem.PROFILE);
        core.byId("idDescPPM").setValue(selItem.PROFILE_DESC);
        core.byId("idPastSalesPPM").setValue(selItem.PAST_SALES_ORD);
        core.byId("idProfileNamePPM").setEditable(false);
        this._sKey = selItem.PROFILE;

        this._oDerivedDialog.open();

      },
      onSaveDerivedChar: function () {
        var that = this;
        var core = sap.ui.getCore();
        var prof = core.byId("idProfileNamePPM").getValue();
        var desc = core.byId("idDescPPM").getValue();
        var past = core.byId("idPastSalesPPM").getValue();

        var payload = {
          PROFILE: prof,
          PROFILE_DESC: desc,
          PAST_SALES_ORD: past
        };

        if (prof !== "" && past !== "") {
          if(past == 0){
             return sap.m.MessageToast.show("Past sales orders should not be 0 months");
          }
          sap.ui.core.BusyIndicator.show();

          var oModel = that.getOwnerComponent().getModel("BModel");

          if (this._sKey) {
            var sPath = "/getDerivedCharProfile(PROFILE='" + this._sKey + "')";
            oModel.update(sPath, payload, {
              success: function () {
                that.loadDerivedCharData();
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("Successfully updated Derived Characteristic Profile");
                that._sKey = null;
                that.onDerClose();
              },
              error: function () {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("Failed to update Derived Characteristic Profile");
              }
            });

          } else {
            oModel.create("/getDerivedCharProfile", payload, {
              success: function () {
                that.loadDerivedCharData();
                sap.ui.core.BusyIndicator.hide();
                that.onDerClose();
                sap.m.MessageToast.show("Successfully created Derived Characteristic Profile");
              },
              error: function () {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("Failed to create Derived Characteristic Profile");
              }
            });
          }

        } else {
          sap.m.MessageToast.show("Please enter value for all parameters");
        }
      },
      onDerClose: function () {
        if (this._oDerivedDialog) {
          this._oDerivedDialog.close();
        }
        this._sKey = null;
        sap.ui.getCore().byId("idProfileNamePPM").setValue("");
        sap.ui.getCore().byId("idDescPPM").setValue("");
        sap.ui.getCore().byId("idPastSalesPPM").setValue("");
      },
      onDerValue: function (oEvent) {
        let val = oEvent.getParameter("value");
        val = val.replace(/[^0-9]/g, "");
        oEvent.getSource().setValue(val);
      },
      onDeleteDerivedChar: function (oEvent) {
        var that = this;
        var oContext = oEvent.getSource().getParent().getParent().getBindingContext("derivedModel");
        var oData = oContext.getObject();
        var sPath = "/getDerivedCharProfile(PROFILE='" + oData.PROFILE + "')";

        var text = `Do you want to delete Derived Characteristic Profile: ${oData.PROFILE}?`;

        sap.m.MessageBox.warning(text, {
          title: "Confirmation",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {

            if (oAction === sap.m.MessageBox.Action.YES) {
              sap.ui.core.BusyIndicator.show();

              that.getOwnerComponent().getModel("BModel").remove(sPath, {
                success: function () {
                  that.loadDerivedCharData();
                  sap.ui.core.BusyIndicator.hide();
                  sap.m.MessageToast.show("Successfully deleted Derived Characteristic Profile");

                },
                error: function () {
                  sap.ui.core.BusyIndicator.hide();
                  sap.m.MessageToast.show("Failed to delete Derived Characteristic Profile");
                }
              });
            }
          }
        });
      },
      onProfileNameLiveChange: function (oEvent) {
        var sValue = oEvent.getParameter("value").trim();
        var oInput = oEvent.getSource();
        var aExisting = this.getView()
          .getModel("derivedModel")
          .getData().DerivedChar || [];

        if (!sValue) {
          oInput.setValueState("None");
          return;
        }

        var bExists = aExisting.some(function (item) {
          return item.PROFILE &&
            item.PROFILE.toLowerCase() === sValue.toLowerCase();
        });

        if (bExists) {
          oInput.setValueState("Error");
          oInput.setValueStateText("Profile name already exists");
          sap.ui.getCore().byId("confirmDerivedPPM").setEnabled(false)
        } else {
          oInput.setValueState("None");
          oInput.setValueStateText("");
          sap.ui.getCore().byId("confirmDerivedPPM").setEnabled(true)
        }
      },

    });
  }
);
