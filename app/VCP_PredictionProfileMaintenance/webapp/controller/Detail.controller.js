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

    return BaseController.extend("vcpapp.vcppredictionprofilemaintenance.controller.Detail", {
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
        that.oProfileListModel = new JSONModel();
        that.oProfileNameModel = new JSONModel();
        that.secondarytableModel = new JSONModel();
        that.AUTOMLPARAMS = new JSONModel();
        that.SavedAUTOMLParams = new JSONModel();
      },

      /**
       * Go back to Home page
       */
      onBack: function () {
        that.MLParams=[];
        that.shiftArray=[];
        that.oGModel.setProperty("/sProfile", "");
            that.oGModel.setProperty("/sProf_desc", "");
            that.oGModel.setProperty("/sMethod", "");
            that.oGModel.setProperty("/sType", "");
           that.byId("idCheckBoxPPM").setSelected(false);
        var aData = [];
        that.oAlgoListModel.setData({
          results: aData,
        });
        that.byId("idTabPPM").setModel(that.oAlgoListModel);
        that.byId("PrimarytablePPM").setModel(that.oAlgoListModel);
        that.byId("SecondarytablePPM").setModel(that.oAlgoListModel);
        that.byId("idTabPPM").setVisible(true);
        that.byId("homeScrSplitter").setVisible(false);
        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
        oRouter.navTo("Home", {}, true);
      },

      /**
       * Called after the view has been rendered
       * Calls the getParameters[function] to get Data
       */
      onAfterRendering: function () {
        sap.ui.core.BusyIndicator.show();
        that = this;

        that.shiftArray = [];
        this.vDate = new Date().toISOString().split("T")[0];
        that.oGModel = that.getModel("oGModel");
        var sSelButton = that.oGModel.getProperty("/sId");

        //*Start of AUTOML Profiles-Pradeep
        this.getModel("BModel").read("/getProfileParameters", {
          success: function (oData) {
            that.ProfileParameters = oData.results;
            that.getModel("BModel").read("/get_palProfiles", {
              success: function (oData) {
                function removeDuplicate(array, key) {
                  var check = new Set();
                  return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
                }
                oData.results = removeDuplicate(oData.results, 'PROFILE');
                that.ProfileNames = oData.results;
                if (that.oGModel.getProperty("/sMethod") === "AUTOML") {
                  that.oGModel.setProperty("/AUTOML", "X");
                  that.onMLselect();
                  if(sSelButton === "Copy" || sSelButton ==="Edit"){
                    that.setSecondaryTable();
                    var selIconTab = that.oGModel.getProperty("/id")
                    if(selIconTab === "PrePro"){
                      that.byId("idProfile").setSelectedKey("P")
                    } else if(selIconTab === "PCPro"){
                      that.byId("idProfile").setSelectedKey("C")
                    } else if(selIconTab === "forPro"){
                      that.byId("idProfile").setSelectedKey("F")
                    }
                    that.getParameters();

                  }
                } else {
                  that.getParameters();
                }

              },
              error: function () {
                MessageToast.show("Failed to get Profiles data");
              },
            });
          },
          error: function () {
            MessageToast.show("Failed to get Profile Parameters data");
          },
        });
        //***End of AUTOML Profiles-Pradeep */


        // Setting the values based on button click
        if (sSelButton === "Copy" || sSelButton === "Edit") {
          if (sSelButton === "Edit") {
            that.byId("idPnPPM").setValue(that.oGModel.getProperty("/sProfile"));
            that.byId("idPnPPM").setEditable(false);
            this.byId("idPagePPM").setTitle("Edit Profile");
            that.byId("idProfile").setSelectedKey(that.oGModel.getProperty("/sType"));

          } else {
            that.byId("idPnPPM").setValue("");
            that.byId("idPnPPM").setEditable(true);
            this.byId("idPagePPM").setTitle("Create Profile");
          }
          // Setting description in input box
          that
            .byId("idPdescPPM")
            .setValue(that.oGModel.getProperty("/sProf_desc"));
          that.byId("idAuthPPM").setValue("");

          // Getting selected method for copy/ edit
          var sMethodText = that.oGModel.getProperty("/sMethod");

          //Setting the selected key for algorithm
          if (sMethodText === "MLR") {
            that.byId("idAlgoPPM").setSelectedKey("M");
          } else if (sMethodText === "HGBT") {
            that.byId("idAlgoPPM").setSelectedKey("H");
          } else if (sMethodText === "VARMA") {
            that.byId("idAlgoPPM").setSelectedKey("V");
          } else if (sMethodText === "RDT") {
            that.byId("idAlgoPPM").setSelectedKey("R");
          } else if (sMethodText === "ACH") {
            that.byId("idAlgoPPM").setSelectedKey("C");
          } else if (sMethodText === "AES") {
            that.byId("idAlgoPPM").setSelectedKey("A");
          } else {
            that.byId("idAlgoPPM").setSelectedKey("N");
          }
          // calling the function
        

        } else {
          // removing values for input box when create new
          that.byId("idPnPPM").setValue("");
          that.byId("idPdescPPM").setValue("");
          that.byId("idAuthPPM").setValue("");
          that.byId("idAlgoPPM").setSelectedKey("N");
          that.byId("idProfile").setSelectedKey("N")
          that.byId("idPnPPM").setEditable(true);
          this.byId("idPagePPM").setTitle("Create Profile");
          var oData = [];
          that.oAlgoListModel.setData({
            results: oData,
          });
          that.byId("idTabPPM").setModel(that.oAlgoListModel);
        }
        if (!that._onAUTOMLParameter) {
          that._onAUTOMLParameter = sap.ui.xmlfragment(
            "vcpapp.vcppredictionprofilemaintenance.view.AutoML",
            that
          );
          that.getView().addDependent(that._onAUTOMLParameter);
        }
        if (!that._onAUTOMLParameterProfile) {
          that._onAUTOMLParameterProfile = sap.ui.xmlfragment(
            "vcpapp.vcppredictionprofilemaintenance.view.SavedAUTOML",
            that
          );
          that.getView().addDependent(that._onAUTOMLParameterProfile);
        }



      },

      /**
       * Getting Data of the profile parameters based on selected method and binding to elements
       */
      getParameters: function () {
        var sSelId = that.oGModel.getProperty("/sId");;
        var sSelProfile = that.oGModel.getProperty("/sProfile"),
          sSelMethod = that.oGModel.getProperty("/sMethod");
          var oData = {
            results: [
              {
                'key': "N",
                'Algo': "No Data",
                'data': "NoData"
              },
              {
                'key': "M",
                'Algo': "MLR",
                'data': "Prediction"
              },
              {
                'key': "H",
                'Algo': "HGBT",
                'data': "Prediction"
              },
              {
                'key': "V",
                'Algo': "VARMA",
                'data': "Prediction"
              },
              {
                'key': "R",
                'Algo': "RDT",
                'data': "Prediction"
              },
              {
                'key': "C",
                'Algo': "AHC",
                'data': "Cluster"
              },
              {
                'key': "A",
                'Algo': "AES",
                'data': "Forecasting"
              },
            ]
          };

          that.ProfileData = oData.results;
          that.oProfileListModel.setData({
            Alogirthm: oData.results
          });
          that.byId("idAlgoPPM").setModel(that.oProfileListModel);
        if (sSelId === "Create") {
          var selIconTab = that.oGModel.getProperty("/id")
          if(selIconTab === "PrePro"){
            that.byId("idProfile").setSelectedKey("P")
          } else if(selIconTab === "PCPro"){
            that.byId("idProfile").setSelectedKey("C")
          } else if(selIconTab === "forPro"){
            that.byId("idProfile").setSelectedKey("F")
          }
          that.onPrifileChange();
        }
        else {
          var ProfileParams = that.ProfileParameters.filter(function (aComp) {

            return aComp.PROFILE === sSelProfile && aComp.METHOD === sSelMethod;

          });
          that.alogoList = that.byId("idTabPPM");
          that.onAlgorChange(true,ProfileParams)
          // Adding new fields
          // ProfileParams.forEach(function (row) {
          //   row.DESCRIPTION = row.PARA_DESC;
          //   if (row.DOUBLEVAL !== null) {
          //     row.DATATYPE = "DOUBLE";
          //     row.DEFAULTVAL = row.DOUBLEVAL;
          //   } else if (row.INTVAL !== null) {
          //     row.DATATYPE = "INTEGER";
          //     row.DEFAULTVAL = row.INTVAL;
          //   } else if (row.STRVAL !== null) {
          //     row.DATATYPE = "NVARCHAR";
          //     row.DEFAULTVAL = row.STRVAL;
          //   }
          // }, that);

          // that.oAlgoListModel.setData({
          //   results: ProfileParams,
          // });
          // that.alogoList.setModel(that.oAlgoListModel);
        }
        sap.ui.core.BusyIndicator.hide();
      },

      onPrifileChange:function(oEvent){
        var selected = that.byId("idProfile")._getSelectedItemText();
        var newData = [];

          var temp =  [{
                    'key': "N",
                    'Algo': "No Data",
                    'data': "NoData"
                  }];

                  // newData.push(temp);
        if(selected.includes("Prediction")){
          var data = that.ProfileData.filter(el=> el.data === "Prediction");

        } else if(selected.includes("Cluster")){
          var data = that.ProfileData.filter(el=> el.data === "Cluster");
        } else if(selected.includes("Forecasting")){
          var data = that.ProfileData.filter(el=> el.data === "Forecasting");
        }
        temp = temp.concat(data); 

        
          that.oProfileListModel.setData({
            Alogirthm: temp
          });
          that.byId("idAlgoPPM").setModel(that.oProfileListModel);

      },

      /**
       * This function is to get the profile parameters based on selected method.
       */
      onAlgorChange: function (flag,editData) {
        var sSelAlgo = that.byId("idAlgoPPM")._getSelectedItemText();
        that.alogoList = that.byId("idTabPPM");
        that.aPalParameters =[];
        if (that.byId("idCheckBoxPPM").getSelected() === false) {
          var oFilters = new Filter("METHOD", FilterOperator.EQ, sSelAlgo);

          this.getModel("PModel").read("/get_palparameters", {
            filters: [oFilters],

            success: function (oData) {
              oData.results.forEach(function (row) {
                row.FLAG = row.DATATYPE;
              }, that);
              that.oAlgoListModel.setData({
                results: oData.results,
              });
              that.aPalParameters = oData.results;
              let oModel = new JSONModel();
              oModel.setData({
                results: oData.results,
              })
              that.alogoList.setModel(oModel);
              if(flag == true && editData.length >0){//Edit Mode,set selected Values
                let oTable = that.getView().byId("idTabPPM");
                if(oTable.getItems()){
                  oTable.getItems().forEach(el=>{
                    let aCells = el.getCells();
                    aCells[4].setValue('');
                    let iIndex = editData.findIndex(e=>e.PARA_NAME == aCells[0].getText());
                    if(iIndex != -1){
                      let oRec = editData[iIndex];
                      if(oRec.INTVAL){
                        aCells[4].setValue(oRec.INTVAL);
                      }
                      else if(oRec.DOUBLEVAL){
                        aCells[4].setValue(oRec.DOUBLEVAL);
                      }
                      else{
                        aCells[4].setValue(oRec.STRVAL);
                      }
                      oTable.setSelectedItem(el)
                    }
                    else{
                      aCells[4].setValue('');
                    }
                  })
                }
              }
              else{//remove row selection and input value
                let oTable = that.getView().byId("idTabPPM");
                if(oTable.getItems()){
                  oTable.getItems().forEach(el=>{
                    let aCells = el.getCells();
                    aCells[4].setValue('');
                  })
                }
              }
            },
            error: function () {
              MessageToast.show("Failed to get data");
            },
          });
        }
        else if (that.byId("idCheckBoxPPM").getSelected() === true) {
          if (sSelAlgo !== "AUTOML") {
            var ProfileNames = that.ProfileNames.filter(function (aComp) {
              return aComp.METHOD === sSelAlgo;
            });
            that.oProfileNameModel.setData({ items1: ProfileNames });
            that.byId("PrimarytablePPM").setModel(that.oProfileNameModel);
          }
          else if (sSelAlgo === "AUTOML") {
            var ProfileNames = [{ PROFILE: "AUTOML", METHOD: "AUTOML" }];
            that.oProfileNameModel.setData({ items1: ProfileNames });
            that.byId("PrimarytablePPM").setModel(that.oProfileNameModel);
            var oFilters1 = new Filter("METHOD", FilterOperator.EQ, "AUTOML");
            this.getModel("PModel").read("/get_palparameters", {
              filters: [oFilters1],
              success: function (oData) {
              that.MLParams = oData.results;
                that.AUTOMLPARAMS.setData({ items3: oData.results });
                sap.ui.getCore().byId("idParam1").setModel(that.AUTOMLPARAMS);
              },
              error: function () {
                MessageToast.show("Failed to get Paramters data");
              },
            });

          }
        }
      },

      /**
       * This function is to validate the data changed based on datatype.
       */
      onLive: function (oEvent) {
        that.byId("idSavePPM").setEnabled(true);
        if (oEvent) {
          var sQuery = oEvent.getParameter("newValue"),
            selId = oEvent.getParameter("id").split("idTabPPM-")[1];
        } else {
          var selId = that.typeChange;
          sQuery = that.byId("idTabPPM").getItems()[selId].getCells()[4].getValue();
        }
        var sSelType = that
          .byId("idTabPPM")
          .getItems()
        [selId].getCells()[2]
          .getSelectedKey(),
          iCount = 0;
        // Declaration of special characters
        var specials = /^[^*|\":<>[\]{}!`\\()';@&$]+$/;
        // Checking the datatype of the field and validationg the value
        if (sSelType === "DOUBLE") {
          that.byId("idTabPPM").getItems()[selId].getCells()[4].setType("Number");
        }
        // Checking the datatype of the field and validationg the value
        if (sSelType === "INTEGER") {
          if (
            (sQuery % 1 === 0 &&
              parseInt(sQuery).toString() === sQuery.toString()) ||
            sQuery === ""
          ) {
            that
              .byId("idTabPPM")
              .getItems()
            [selId].getCells()[4]
              .setValueState("None");
            iCount = 0;
          } else {
            that
              .byId("idTabPPM")
              .getItems()
            [selId].getCells()[4]
              .setValueState("Error");
            iCount = iCount + 1;
          }
          // Checking the datatype of the field and validationg the value
        } else if (sSelType === "NVARCHAR") {
          var letters = /^[A-Za-z0-9 ]+$/;
          if (
            (letters.test(sQuery) && specials.test(sQuery)) ||
            sQuery === ""
          ) {
            that
              .byId("idTabPPM")
              .getItems()
            [selId].getCells()[4]
              .setValueState("None");
            iCount = 0;
          } else {
            that
              .byId("idTabPPM")
              .getItems()
            [selId].getCells()[4]
              .setValueState("Error");
            iCount = iCount + 1;
          }
          // Checking the datatype of the field and validationg the value
        } else if (sSelType === "DOUBLE") {
          if (!/^\d+$/.test(sQuery) && sQuery !== "") {
            if (sQuery.split(".")[1] !== "" && sQuery !== ".") {
              that
                .byId("idTabPPM")
                .getItems()
              [selId].getCells()[4]
                .setValueState("None");
              iCount = 0;
            } else {
              that
                .byId("idTabPPM")
                .getItems()
              [selId].getCells()[4]
                .setValueState("Error");
              iCount = iCount + 1;
            }
          } else {
            if (sQuery === "") {
              that
                .byId("idTabPPM")
                .getItems()
              [selId].getCells()[4]
                .setValueState("None");
              iCount = 0;
            } else {
              that
                .byId("idTabPPM")
                .getItems()
              [selId].getCells()[4]
                .setValueState("Error");
              iCount = iCount + 1;
            }
          }
        }
        // Validating the values and enabling or disabling the save button
        if (iCount === 0) {
          that.byId("idSavePPM").setEnabled(true);
        } else {
          that.byId("idSavePPM").setEnabled(false);
        }
      },

      /**
       * This function is called when submitting the Prediction profile.
       */
      onSubmit: function (oEvent) {
        // sap.ui.core.BusyIndicator.show();
        var sSelOperation = that.oGModel.getProperty("/sId");
        if(that.byId("idCheckBoxPPM").getSelected() === false){
        var sOperationFlag = "";
        if (sSelOperation === "Edit") {
          sOperationFlag = "E";
        }
        var oEntry = {},aParameters =[];

        oEntry.PROFILE = that.byId("idPnPPM").getValue();
        oEntry.PRF_DESC = that.byId("idPdescPPM").getValue();
        oEntry.CREATED_BY = sOperationFlag;
        oEntry.TYPE = that.byId("idProfile").getSelectedKey();
        oEntry.METHOD = that.byId("idAlgoPPM")._getSelectedItemText();
        //if AutoML checkbox is not selected, then SUBMETHOD is NA
        oEntry.SUBMETHOD ="NA";
        if(oEntry.METHOD != "No Data"){//
          let aItems = this.getView().byId("idTabPPM").getSelectedItems();
          if(aItems.length >0){
            aItems.forEach(el=>{
              let aCells = el.getCells();
              let sValue = aCells[4].getValue();
              const obj={
                "PROFILE":oEntry.PROFILE,
                "METHOD":oEntry.METHOD,
                "SUBMETHOD":oEntry.SUBMETHOD,
                "PARA_NAME":aCells[0].getText(),
                "PARA_DESC":aCells[1].getText(),
                "INTVAL":null,
                "DOUBLEVAL":null,
                "STRVAL":null,
                "PARA_DEP":null
              };
              if(aCells[2].getProperty("selectedKey") == "INTEGER"){
                obj.INTVAL = (sValue =='' || sValue == undefined)?null :sValue;
              }
              else if(aCells[2].getProperty("selectedKey") == "DOUBLE"){
                obj.DOUBLEVAL = (sValue =='' || sValue == undefined)?null :sValue;
              }
              else{
                obj.STRVAL = sValue;
              }
              if(that.aPalParameters.length>0){
                let oRec = that.aPalParameters.findIndex(f=>f.PARA_NAME == obj.PARA_NAME);
                if(oRec != -1){
                  obj.PARA_DEP = that.aPalParameters[oRec].DEPENDENCY;
                }
              }
              aParameters.push(obj);
            })
          }
        }
        if (
          oEntry.PROFILE !== "" &&
          oEntry.PRF_DESC !== "" &&
          oEntry.METHOD !== ""
        ) {
          that.getModel("BModel").callFunction("/createProfiles", {
            method: "GET",
            urlParameters: {
              PROFILE: oEntry.PROFILE,
              METHOD: oEntry.METHOD,
              PRF_DESC: oEntry.PRF_DESC,
              TYPE  : oEntry.TYPE,
              CREATED_DATE: that.vDate,
              CREATED_BY: sOperationFlag,
              PARAMETERS:(aParameters.length>0)?JSON.stringify(aParameters):''
            },
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();
              if(sSelOperation != "Edit"){
                sap.m.MessageToast.show("Created Prediction profile");
              }
              else{
                sap.m.MessageToast.show("Updated Prediction profile");
              }
              that.onBack();
              // Calling the function to submit the profile parameters
              // that.tablesendbatch();
            },
            error: function (error) {
              sap.ui.core.BusyIndicator.hide();
              if(sSelOperation != "Edit"){
                sap.m.MessageToast.show("failed to create Prediction profile");
              }
              else{
                sap.m.MessageToast.show("failed to update Prediction profile");
              }
            },
          });
        } else {
          MessageToast.show("Please fill all required fields");
          sap.ui.core.BusyIndicator.hide();
        }
      }
      else if(that.byId("idCheckBoxPPM").getSelected() === true) {
        var PROFILE = that.byId("idPnPPM").getValue();
        var PRF_DESC = that.byId("idPdescPPM").getValue();
        var METHOD = "AUTOML";
        if (sSelOperation === "Edit") {
         var Flag = "E";
        }
        else{
          var Flag = "C";
        }
        if (
         PROFILE !== "" &&
          PRF_DESC !== "" &&
          METHOD !== ""
        ) {
          that.getModel("BModel").callFunction("/createHeaderProfiles", {
            method: "GET",
            urlParameters: {
              Flag: Flag,
              PROFILE: PROFILE,
              METHOD: METHOD,
              PRF_DESC:PRF_DESC,             
            },
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();
              sap.m.MessageToast.show("Created Prediction profile");
              // Calling the function to submit the profile parameters
              that.paramSendBatch();
            },
            error: function (error) {
              sap.ui.core.BusyIndicator.hide();
              sap.m.MessageToast.show("failed to created Prediction profile");
            },
          });
        } else {
          MessageToast.show("Please fill all required fields");
          sap.ui.core.BusyIndicator.hide();
        }

      }
      },


      /**
       * This function is to submit the profile parameters.
       */

      tablesendbatch: function (oEvent) {
        var oTable = that.byId("idTabPPM").getSelectedItems(),
          aData = {
            PROFILEPARA: [],
          },
          jsonProfilePara;
        that.getModel("BModel").setUseBatch(true);
        that.batchReq = true;
        that.iCount = oTable.length;
        that.comp = 0;

        sap.ui.core.BusyIndicator.show();
        var sSelOperation = that.oGModel.getProperty("/sId");
        var sOperationFlag;

        // Setting the falg based on button selected
        if (sSelOperation === "Create" || sSelOperation === "Copy") {
          sOperationFlag = "I";
        } else if (sSelOperation === "Edit") {
          sOperationFlag = "E";
        }

        // Changeing INTVAL, DOUBLEVAL, STRVAL values based on datatype
        for (var i = 0; i < oTable.length; i++) {
          var PROFILE,
            METHOD,
            CREATED_BY,
            PARA_NAME,
            PARA_DESC,
            DATATYPE,
            INTVAL = "",
            DOUBLEVAL = "",
            STRVAL = "";
          jsonProfilePara = {};
          PROFILE = that.byId("idPnPPM").getValue();
          METHOD = that.byId("idAlgoPPM")._getSelectedItemText();
          PARA_NAME = oTable[i].getCells()[0].getText();
          PARA_DESC = oTable[i].getCells()[1].getText();

          if (oTable[i].getCells()[2].getSelectedKey() === "INTEGER") {
            DATATYPE = "INTEGER";
            if (oTable[i].getCells()[4].getValue() === "") {
              INTVAL = parseInt(oTable[i].getCells()[3].getText());
            } else {
              if (oTable[i].getCells()[4].getValue() == "No default value") {
                INTVAL = "0";
              } else {
                INTVAL = parseInt(oTable[i].getCells()[4].getValue());
              }
            }

            if (INTVAL.toString().includes("NaN")) {
              INTVAL = null;
            }
            jsonProfilePara = {
              PROFILE: PROFILE,
              METHOD: METHOD,
              PARA_NAME: PARA_NAME,
              PARA_DESC: PARA_DESC,
              DATATYPE: DATATYPE,
              INTVAL: INTVAL,
              DOUBLEVAL: null,
              STRVAL: null,
            };
          } else if (oTable[i].getCells()[2].getSelectedKey() === "DOUBLE") {
            DATATYPE = "DOUBLE";
            if (oTable[i].getCells()[4].getValue() === "") {
              DOUBLEVAL = parseFloat(oTable[i].getCells()[3].getText());
              if (DOUBLEVAL === "0") {
                DOUBLEVAL = "0.0";
              }
            } else {
              if (oTable[i].getCells()[4].getValue() === "No default value") {
                DOUBLEVAL = "0.0";
              } else {
                DOUBLEVAL = parseFloat(oTable[i].getCells()[4].getValue());
              }
            }
            if (DOUBLEVAL.toString().includes("NaN")) {
              DOUBLEVAL = null;
            }
            jsonProfilePara = {
              PROFILE: PROFILE,
              METHOD: METHOD,
              PARA_NAME: PARA_NAME,
              PARA_DESC: PARA_DESC,
              DATATYPE: DATATYPE,
              INTVAL: null,
              DOUBLEVAL: DOUBLEVAL,
              STRVAL: null,
            };
          } else if (oTable[i].getCells()[2].getSelectedKey() === "NVARCHAR") {
            DATATYPE = "NVARCHAR";
            if (oTable[i].getCells()[4].getValue() === "") {
              STRVAL = oTable[i].getCells()[3].getText();
            } else {
              if (oTable[i].getCells()[4].getValue() === "No default value") {
                STRVAL = "";
              } else {
                STRVAL = oTable[i].getCells()[4].getValue();
              }
            }
            if (STRVAL.includes("NaN")) {
              STRVAL = null;
            }
            jsonProfilePara = {
              PROFILE: PROFILE,
              METHOD: METHOD,
              PARA_NAME: PARA_NAME,
              PARA_DESC: PARA_DESC,
              DATATYPE: DATATYPE,
              INTVAL: null,
              DOUBLEVAL: null,
              STRVAL: STRVAL,
            };
          }
          aData.PROFILEPARA.push(jsonProfilePara);
          sap.ui.core.BusyIndicator.show();
          that.getModel("BModel").callFunction("/createProfilePara", {
            method: "GET",
            urlParameters: {
              FLAG: sOperationFlag,
              PROFILE: PROFILE,
              METHOD: METHOD,
              PARA_NAME: PARA_NAME,
              INTVAL: jsonProfilePara.INTVAL,
              DOUBLEVAL: jsonProfilePara.DOUBLEVAL,
              STRVAL: jsonProfilePara.STRVAL,
              PARA_DESC: PARA_DESC,
              // DATATYPE: jsonProfilePara.DATATYPE,
              PARA_DEP: "",
              CREATED_DATE: that.vDate,
              CREATED_BY: "",
            },
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();
              sap.m.MessageToast.show("Created profile parameters");
              // On successfull of cretion of Prediction profile and profile parameters navigating to Home view
              that.onBack();
            },
            error: function (error) {
              sap.ui.core.BusyIndicator.hide();
              sap.m.MessageToast.show("Failed to create profile parameters");
            },
          });
        }
      },
      onMLselect: function (oEvent) {
        if(that.oGModel.getProperty("/AUTOML") === "X"){
          var selected = true;
          that.oGModel.setProperty("/AUTOML","");
        }
        else{
          var selected = oEvent.getSource().getSelected();
        }
        if (selected === true) {
          that.byId("idCheckBoxPPM").setSelected(true);
          that.byId("idTabPPM").setVisible(false);
          that.byId("homeScrSplitter").setVisible(true);
          var oData = {
            results: [
              {
                'key': "N",
                'Algo': "No Data"
              },
              {
                'key': "M",
                'Algo': "MLR"
              },
              {
                'key': "H",
                'Algo': "HGBT"
              },
              {
                'key': "A",
                'Algo': "AUTOML"
              },
              {
                'key': "R",
                'Algo': "RDT"
              },
            ]
          };
          that.oProfileListModel.setData({
            Alogirthm: oData.results
          });
          that.byId("idAlgoPPM").setModel(that.oProfileListModel);

        } else {
          that.byId("idTab").setVisible(true);
          that.byId("homeScrSplitter").setVisible(false);
          that.getParameters();
        }
        sap.ui.core.BusyIndicator.hide();
      },
      handleSelection: function (oEvent) {
        var count = 0;
        var selectedItem = oEvent.getSource().getSelectedItem().getBindingContext().getProperty();
        selectedItem.SUBMETHOD = selectedItem.METHOD
        selectedItem.SUBMETHOD_PROFILE = selectedItem.PROFILE;
        that.ItemSelected = selectedItem;
        if (selectedItem.PROFILE !== "AUTOML") {
          if (that.shiftArray.length === 0) {
            that.shiftArray.push(selectedItem);
          }
          else {
            for (var i = 0; i < that.shiftArray.length; i++) {
              if (selectedItem.SUBMETHOD === that.shiftArray[i].SUBMETHOD) {
                var index = that.shiftArray.indexOf(that.shiftArray[i]);
                if (index !== -1) {
                  that.shiftArray[index] = selectedItem;
                }
                count++;
              }

            }
            if (count === 0) {
              that.shiftArray.push(selectedItem);
            }
          }
          that.secondarytableModel.setData({ items2: that.shiftArray });
          that.byId("SecondarytablePPM").setModel(that.secondarytableModel);
        }
        else if (selectedItem.PROFILE === "AUTOML") {
          that._onAUTOMLParameter.open();
        }
        that.byId("PrimarytablePPM").removeSelections();
      },
      onAutoClose: function () {
        that._onAUTOMLParameter.close();
        that.byId("PrimarytablePPM").removeSelections();
      },
      onSelectedIndex: function () {
        var tableItems = sap.ui.getCore().byId("idParam1").getItems();
        for (var k = 0; k < tableItems.length; k++) {
          if (tableItems[k].getCells()[0].getTitle() === "CONFIG_DICT" || tableItems[k].getCells()[0].getTitle() === "PIPELINE_TYPE") {
            tableItems[k].setSelected(true);
          }
        }
      },
      onSelectChange: function (oEvent) {
        var selectedRow = oEvent.getParameters().listItem.getCells()[0].getTitle();
        var tableItems = sap.ui.getCore().byId("idParam1").getItems();
        for (var s = 0; s < tableItems.length; s++) {
          if (selectedRow === tableItems[s].getCells()[0].getTitle() && selectedRow === "CONFIG_DICT"
            || selectedRow === tableItems[s].getCells()[0].getTitle() && selectedRow === "PIPELINE_TYPE") {
            tableItems[s].setSelected(true);
            sap.m.MessageToast.show("CONFIG_DICT & PIPELINE_TYPE are mandatory and Cannot be unSelected");
          }
        }
      },
      onSaveClicked: function () {
        var count=0;
        var ItemSelected = that.ItemSelected;
        if (that.shiftArray.length === 0) {
          that.shiftArray.push(ItemSelected);
        }
        else {
          for (var i = 0; i < that.shiftArray.length; i++) {
            if (ItemSelected.METHOD === that.shiftArray[i].SUBMETHOD) {
              var index = that.shiftArray.indexOf(that.shiftArray[i]);
              if (index !== -1) {
                that.shiftArray[index] = ItemSelected;
              }
              count++;
            }

          }
          if (count === 0) {
            that.shiftArray.push(ItemSelected);
          }
        }
        that.secondarytableModel.setData({ items2: that.shiftArray });
        that.byId("SecondarytablePPM").setModel(that.secondarytableModel);
        that.onAutoClose();
      },
      onDeletePress: function (oEvent) {
        var oIndex = oEvent.getParameters().id.split("SecondarytablePPM-")[1];
        var aData= that.byId("SecondarytablePPM").getModel().getData().items2;
        aData.splice(oIndex,1);
        that.byId("SecondarytablePPM").getModel().refresh();
      },
      paramSendBatch:function(){
        sap.ui.core.BusyIndicator.show();
        var count=0;
        var paramMethod={},
        paramEntry=[];
        var PROFILE = that.byId("idPnPPM").getValue();
        var METHOD = "AUTOML";
        var selectedAlgos = that.byId("SecondarytablePPM").getItems();
        var sSelOperation = that.oGModel.getProperty("/sId");
        if (sSelOperation === "Edit") {
          var Flag = "E";
        }
        else{
          var Flag = "C";
        }
        for(var k=0;k<selectedAlgos.length;k++){
          if(selectedAlgos[k].getCells()[0].getText() !=="AUTOML"){
            var ProfileNames = that.ProfileParameters.filter(function (aComp) {
              return aComp.PROFILE === selectedAlgos[k].getCells()[0].getText();
            });
            for(var s=0;s<ProfileNames.length;s++){
            paramMethod.PROFILE = PROFILE,
                paramMethod.METHOD = METHOD,
                paramMethod.SUBMETHOD = ProfileNames[s].METHOD,
                paramMethod.SUBMETHOD_PROFILE = ProfileNames[s].PROFILE,
                paramMethod.PARA_NAME = ProfileNames[s].PARA_NAME,
                paramMethod.INTVAL = ProfileNames[s].INTVAL,
                paramMethod.DOUBLEVAL = ProfileNames[s].DOUBLEVAL,
                paramMethod.STRVAL = ProfileNames[s].STRVAL,
                paramMethod.PARA_DESC = ProfileNames[s].PARA_DESC,
                paramMethod.PARA_DEP = ProfileNames[s].PARA_DEP
                paramEntry.push(paramMethod);
                paramMethod={};

            }
          }
          else if(selectedAlgos[k].getCells()[0].getText() ==="AUTOML"){
            count++;
              var selectedAUTOMLParams = sap.ui.getCore().byId("idParam1").getSelectedItems();
              for(var j=0;j<selectedAUTOMLParams.length;j++){
                if(selectedAUTOMLParams[j].getCells()[6].getValue()===""){
                  var STRVAL = selectedAUTOMLParams[j].getCells()[3].getText()
                }
                else{
                  var STRVAL = selectedAUTOMLParams[j].getCells()[6].getText()
                }
              paramMethod.PROFILE = PROFILE,
                paramMethod.METHOD = METHOD,
                paramMethod.SUBMETHOD = METHOD,
                paramMethod.SUBMETHOD_PROFILE = METHOD,
                paramMethod.PARA_NAME = selectedAUTOMLParams[j].getCells()[0].getTitle(),
                paramMethod.INTVAL = selectedAUTOMLParams[j].getCells()[4].getText(),
                paramMethod.DOUBLEVAL = selectedAUTOMLParams[j].getCells()[5].getText(),
                paramMethod.STRVAL = STRVAL,
                paramMethod.PARA_DESC = selectedAUTOMLParams[j].getCells()[1].getText(),
                paramMethod.PARA_DEP = selectedAUTOMLParams[j].getCells()[7].getText()

                if(paramMethod.INTVAL === ""){
                  paramMethod.INTVAL = null;
                }
                if(paramMethod.DOUBLEVAL === ""){
                  paramMethod.DOUBLEVAL = null;
                }
                if(paramMethod.STRVAL === ""){
                  paramMethod.STRVAL = null;
                }
                if(paramMethod.PARA_DESC === ""){
                  paramMethod.PARA_DESC = null;
                }
                if(paramMethod.PARA_DEP === ""){
                  paramMethod.PARA_DEP = null;
                }
                paramEntry.push(paramMethod);
                paramMethod={};
              }
          }
        }
        if(count ==0){
          this.getModel("PModel").read("/get_palparameters", {
            success: function (oData) {
            that.MLParams = oData.results;
            var AUTOMLProfileNames = that.MLParams.filter(function (aComp) {
              return aComp.PARA_NAME === "CONFIG_DICT" ||aComp.PARA_NAME === "PIPELINE_TYPE";
            });
            for(var d=0;d<AUTOMLProfileNames.length;d++){

              paramMethod.PROFILE = PROFILE,
                  paramMethod.METHOD = METHOD,
                  paramMethod.SUBMETHOD = METHOD,
                  paramMethod.SUBMETHOD_PROFILE = METHOD,
                  paramMethod.PARA_NAME = AUTOMLProfileNames[d].PARA_NAME,
                  paramMethod.INTVAL = AUTOMLProfileNames[d].INTVAL,
                  paramMethod.DOUBLEVAL = AUTOMLProfileNames[d].DOUBLEVAL,
                  paramMethod.STRVAL = AUTOMLProfileNames[d].DEFAULTVAL,
                  paramMethod.PARA_DESC = AUTOMLProfileNames[d].DESCRIPTION,
                  paramMethod.PARA_DEP = AUTOMLProfileNames[d].DEPENDENCY
                  paramEntry.push(paramMethod);
                  paramMethod={};
            }
            that.getModel("BModel").callFunction("/createParamProfiles", {
              method: "GET",
              urlParameters: {
                Flag: Flag,
                VARDATA:JSON.stringify(paramEntry)            
              },
              success: function (oData) {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("Created Prediction profile Parameters");
                that.onBack();
              },
              error: function (error) {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("Failed to created Prediction profile Parameters");
              },
            });
          
            },
            error: function () {
              MessageToast.show("Failed to get Paramters data");
            },
          });
        }
        else {
          that.getModel("BModel").callFunction("/createParamProfiles", {
            method: "GET",
            urlParameters: {
              Flag: Flag,
              VARDATA:JSON.stringify(paramEntry)            
            },
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();
              sap.m.MessageToast.show("Created Prediction profile Parameters");
              that.onBack();
            },
            error: function (error) {
              sap.ui.core.BusyIndicator.hide();
              sap.m.MessageToast.show("Failed to created Prediction profile Parameters");
            },
          });
        }
      },
      setSecondaryTable:function(){
        var Profile = that.oGModel.getProperty("/sProfile");
        var method = that.oGModel.getProperty("/sMethod");
        that.shiftArray = that.ProfileParameters.filter(function (aComp) {
          return aComp.PROFILE === Profile && aComp.METHOD === method;
        });
        function removeDuplicate(array, key) {
          var check = new Set();
          return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
        }
        that.shiftArray = removeDuplicate(that.shiftArray, 'SUBMETHOD_PROFILE');
        that.secondarytableModel.setData({items2:that.shiftArray});
        that.byId("SecondarytablePPM").setModel(that.secondarytableModel);
        sap.ui.core.BusyIndicator.hide();
      },
      handleParaSelection:function(oEvent){
        var profile = that.oGModel.getProperty("/sProfile");
        // if(profile !== "" || profile !== undefined){
          if(profile){
        var selected = oEvent.getParameters().listItem.getBindingContext().getObject();
        var profileParameters = that.ProfileParameters.filter(function (aComp) {
         return aComp.PROFILE === profile && aComp.SUBMETHOD_PROFILE === selected.SUBMETHOD_PROFILE;
        });
        that.SavedAUTOMLParams.setData({items4:profileParameters});
        sap.ui.getCore().byId("idParam2").setModel(that.SavedAUTOMLParams);
        that._onAUTOMLParameterProfile.open();
        that.byId("SecondarytablePPM").removeSelections();
      }
      else{
        that.byId("SecondarytablePPM").removeSelections();
      }
      },
      onAutoParaClose:function(){
        that._onAUTOMLParameterProfile.close();
      },
      onInputChange:function(oEvent){
        var source= oEvent.getParameter("value") || oEvent.getParameter("newValue");
        if(source !== "light" && source !== "default"){
          sap.ui.getCore().byId("idBtnSave").setEnabled(false);
        }
        else{
          sap.ui.getCore().byId("idBtnSave").setEnabled(true);
        }
      },
      onProfileName:function(oEvent){
        var sName= oEvent.getParameter("value") || oEvent.getParameter("newValue");
        var Items= that.oGModel.getProperty("/tableData");
      //   var uniqueName = Items.filter((obj, pos, arr) => {
      //     return (
      //         arr.map((mapObj) => mapObj.sName).indexOf(obj.sName) == pos
      //     );
          
      // });
      for(var i=0;i<Items.length;i++){
        if(sName === Items[i].PROFILE){
          var uniqueName = Items[i].PROFILE;
          break;
        }
      }
      if(sName === uniqueName){
        that.byId("idPnPPM").setValueState("Error");
        that.byId("idSavePPM").setEnabled(false);
      }
      else{
        that.byId("idPnPPM").setValueState("None");
        that.byId("idSavePPM").setEnabled(true);
      }
      }
    });
  }
);
