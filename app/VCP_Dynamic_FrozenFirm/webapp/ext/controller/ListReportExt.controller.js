sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/core/date/UI5Date",
  "sap/ui/export/Spreadsheet",
  "sap/ui/export/library",
  "sap/m/Dialog",
  "sap/m/library",
  "sap/m/Button",
  "sap/m/Text"
],
  function (
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    UI5Date, Spreadsheet, exportLibrary,
    Dialog, mobileLibrary, Button, Text
  ) {
    "use strict";
    var that, oGModel, aResults ,oAllData, aModel;
    var EdmType = exportLibrary.EdmType;
    var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;
    // shortcut for sap.m.DialogType
    var DialogType = mobileLibrary.DialogType;
    function dateCheck(from, to, check) {
      var fDate, lDate, cDate;
      fDate = Date.parse(from);
      lDate = Date.parse(to);
      cDate = new Date(check).setHours(0, 0, 0);
      if ((cDate <= lDate && cDate >= fDate)) {
        return true;
      } else {
        return false;
      }
    }
    //createColumn
    function createColumnConfig() {

      var aCols = [];

      aCols.push({
        label: "Group_Id",
        property: "Group_Id",
        type: EdmType.String
      });

      aCols.push({
        label: "Group_Name",
        type: EdmType.String,
        property: "Group_Name"
      });

      aCols.push({
        label: "From_Date",
        type: EdmType.Date,
        property: "From_Date"
      });

      aCols.push({
        property: 'To_Date',
        type: EdmType.Date,
        property: "To_Date"
      });

      return aCols;
    }
    function isDateInRange(date, fromDate, toDate) {
      var fDate, lDate, cDate;
      fDate = Date.parse(fromDate);
      lDate = Date.parse(toDate);
      cDate = Date.parse(date);;
      if ((cDate <= lDate && cDate >= fDate)) {
        return true;
      } else {
        return false;
      }
    }

    function isAnyDateInRange(dateToCheck, dateRanges) {
      var count = [];
      for (let i = 0; i < dateRanges.length; i++) {
        const { FROMDATE, TODATE } = dateRanges[i];
        const result = isDateInRange(dateToCheck, new Date(FROMDATE), new Date(TODATE))
        if (result) {
          count.push(dateToCheck)
        } else {
          count.push(result);
        }
      }
      return count;
    }
    return {
      onInit: function () {
        that = this;
        that.oGModel = that.getOwnerComponent().getModel("oGModel");
        // that.getEnable();
        that.oTableRead();
        var jQueryScript = document.createElement('script');
        jQueryScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.8.0/jszip.js');
        document.head.appendChild(jQueryScript);
        var jQueryScript = document.createElement('script');
        jQueryScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.8.0/xlsx.js');
        document.head.appendChild(jQueryScript);
      },
     
      getUser: function () {
        var vUser;
        if (sap.ushell.Container) {
          let email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
          vUser = (email) ? email : "";
        }
        return vUser;

      },
      oTableRead: function () {
        that = this;
        // that.getEnable();
        if (!this.oUploadFragment) {
          this.oUploadFragment = sap.ui.xmlfragment(
            "vcpapp.vcpdynamicfrozenfirm.fragments.upload",
            this
          );
          this.getView().addDependent(that.oUploadFragment);
        }

        // if (!that.oUploadFragment) {
        //   that.oUploadFragment = sap.ui.xmlfragment(
        //     "vcpapp.vcpdynamicfrozenfirm.fragments.upload",
        //     this
        //   );
        //   that.oUploadFragment.open();
        // }

        var bModel = that.getOwnerComponent().getModel("oModel");
        bModel.read("/getDynHorizonGrpData", {
          method: "GET",
          success: function (oData) {
            that.tableDetails = oData.results;
            oAllData = oData.results
            that.oGModel.setProperty("/oTabDetails",oData.results)
          },
          error: function (e) {
            sap.m.MessageToast.show("Not able to get table items");
          }
        });
      },
      /**
     * On press of create button in table header
     */
      onCustomAction: function () {
        that = this;
        var oModel = this.getOwnerComponent().getModel("oModel");
        var vUser = that.getUser();
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
            //   var aResults = oData.results;
            aResults = [{
              "USER": "pavankumar@sbpcorp.in",
              "CREATE_CHK": "enabled",
              "UPDATE_CHK": "enabled",
              "DELETE_CHK": "enabled",
              "READ_CHK": "enabled"
            }]

            if (aResults.length > 0) {
              var isUserLoggedIn = true;
            }
            if (isUserLoggedIn) {
              if (aResults[0].CREATE_CHK === "disabled") {
                that.byId("idCreateButtonDFF").setEnabled(false);
                MessageToast.show("User not authorised for Create action");
              }
              else {
                if (!that.oDialogFragment) {
                  that.oDialogFragment = sap.ui.xmlfragment(
                    "vcpapp.vcpdynamicfrozenfirm.fragments.Ordercreate",
                    that
                  );
                  sap.ui.core.BusyIndicator.hide();
                  that.oDialogFragment.open();
                }
                else {
                  sap.ui.core.BusyIndicator.hide();
                  that.oDialogFragment.open();
                }
              }
            }
            else {
              that.byId("idCreateButtonDFF").setEnabled(false);
              MessageToast.show("User not authorised that Create action");
            }
          }
        })
      },


      /**
     * On close of create fragment.
     */
      closeBatchFragment: function () {
        if (this.oDialogFragment) {
          this.oDialogFragment.destroy();
          delete this.oDialogFragment;
        }
      },
      /**
    * On press of Save in create fragment
    */

      // create
      createOrder: function () {
        sap.ui.core.BusyIndicator.show();
        that = this
        var count = 0;
        var oGroupName = sap.ui.getCore().byId("idGrpNDFF").getValue();
        var oGroupID = sap.ui.getCore().byId("idGrpIdDFF").getValue();
        var oFromDate = sap.ui.getCore().byId("fromDateDFF").getValue();
        var oToDate = sap.ui.getCore().byId("toDate").getValue();
        var tableItems = that.byId("vcpapp.vcpdynamicfrozenfirm::sap.suite.ui.generic.template.ListReport.view.ListReport::getDynHorizonGrpData--responsiveTable").getSelectedItems();
        if (oGroupID === "" || oGroupName === "" || oFromDate === "" || oToDate === "") {
          MessageToast.show("Please fill all the required details")
        }
        else {
          for (var i = 0; i < tableItems.length; i++) {
            var from = tableItems[i].getCells()[2].getText();
            var to = tableItems[i].getCells()[3].getText();
            var checkFrom = oFromDate;
            var checkTo = oToDate;

            if (dateCheck(from, to, checkFrom)) {
              MessageToast.show("From Date already exists. Please choose any other date")
              break;
            }
            else if (dateCheck(from, to, checkTo)) {
              MessageToast.show("To Date already exists. Please choose any other date")
              break;
            }
            else {
              count++;
            }
          }
          if (count === tableItems.length) {
            var finalData = [], insertData = {};
            insertData = {
              GROUPNAME: oGroupName,
              GROUPID: oGroupID,
              FROMDATE: oFromDate,
              TODATE: oToDate
            }
            finalData.push(insertData);
            var bModel = that.getOwnerComponent().getModel("oModel");
            bModel.callFunction("/createDynamicFFG", {
              method: "GET",
              urlParameters: {
                Flag: "U",
                PRODATA: JSON.stringify(finalData)
              },
              success: function (oData) {
                MessageToast.show(oData.createDynamicFFG);
                if (that.oDialogFragment) {
                  that.oDialogFragment.destroy(true);
                  that.oDialogFragment = null;
                  delete that.oDialogFragment;
                }
                that.byId("vcpapp.vcpdynamicfrozenfirm::sap.suite.ui.generic.template.ListReport.view.ListReport::getDynHorizonGrpData--listReportFilter-btnGo").firePress();;
                sap.ui.core.BusyIndicator.hide();
              },
              error: function (error) {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show(error.createDynamicFFG);
              },
            });
          }
        }
      },
      handleDateChange: function (oEvent) {
        var sID = oEvent.getSource().getId();
        var sFromDate = sap.ui.getCore().byId("fromDateDFF").getValue();
        var sToDate = sap.ui.getCore().byId("toDate").getValue();
        if (sID === "fromDateDFF") {
          sap.ui.getCore().byId("toDate").setEnabled(true);
          sap.ui.getCore().byId("toDate").setMinDate(UI5Date.getInstance(sFromDate));
        }
      },
      /**Download of excel file */
      onDownload: function () {
        // var oModel = this.getOwnerComponent().getModel("oModel");
        // var vUser = this.getUser();
        // var oEntry = {
        //   USERDATA: []
        // };

        // let oParamVals = {
        //   USEREMAIL: vUser
        // };
        // oEntry.USERDATA.push(oParamVals);
        // oModel.callFunction("/genUserAppVisibility", {
        //   method: "GET",
        //   urlParameters: {
        //     FLAG: 'G',
        //     USERDATA: JSON.stringify(oEntry.USERDATA)
        //   },
        //   success: function (oData) {
        //     var aResults = oData.results;
        //     if (aResults.length > 0) {
        //       var isUserLoggedIn = true;
        //     }
        //     if (isUserLoggedIn) {
        //       if (aResults[0].CREATE_CHK == "disabled") {
        //         that.byId("iddownload").setEnabled(false)
        //         MessageToast.show("User is not authorised for  Download action");
        //         // that.byId("iduploadbtn").setEnabled(false);
        //         // that.byId("iddownload").setEnabled(false);
        //         // return false;
        //       }
        //       else {
        var aCols, oRowBinding, oSettings, oSheet, oTable;
    
         var data =      [{
          GROUP_ID: "",
          Group_Name: "",
          From_Date: "",
          To_Date: "",

        }]
        aCols = createColumnConfig();
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: data,
          fileName: "Template.xlsx",
          worker: false // We need to disable worker because we are using a MockServer as OData Service
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
        sap.ui.core.BusyIndicator.hide();



        // }
        // }
        //     else {
        //       that.byId("iddownload").setEnabled(false);
        //       MessageToast.show("User is not authorised for  Download action");

        //       // that.byId("iduploadbtn").setEnabled(false);
        //       // that.byId("iddownload").setEnabled(false);
        //       // that.byId("vcpapp.vcpdynamicfrozenfirm::sap.suite.ui.generic.template.ListReport.view.ListReport::getDynHorizonGrpData--deleteEntry").setEnabled(false);
        //     }
        //   },
        //   error: function (oData, error) {
        //     MessageToast.show("error");
        //   },
        // });
      },
      /** Click of upload button*/
      onupload: function () {
       that.oTableRead();
        var oModel = this.getOwnerComponent().getModel("oModel");
        aModel= oModel
        var vUser = this.getUser();
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

          //  var aResults = oData.results;
             var aResults = [ { "USER": "pavankumar@sbpcorp.in",
              "CREATE_CHK": "enabled",
              "UPDATE_CHK": "enabled",
              "DELETE_CHK": "enabled",
              "READ_CHK": "enabled" }]

            if (aResults.length > 0) {
              var isUserLoggedIn = true;
            }
            if (isUserLoggedIn) {
              if (aResults[0].CREATE_CHK == "disabled") {
                that.byId("iduploadbtnDFF").setEnabled(false)
                MessageToast.show("User is not authorised for  Upload action");

              }
              else {
                if (!that.oUploadFragment) {
                  that.oUploadFragment = sap.ui.xmlfragment(
                    "vcpapp.vcpdynamicfrozenfirm.fragments.upload",
                    that
                  );
                  that.getView().addDependent(that.oUploadFragment);
                }
                that.oUploadFragment.open();
                // if (!that.oUploadFragment) {
                //   that.oUploadFragment = sap.ui.xmlfragment(
                //     "vcpapp.vcpdynamicfrozenfirm.fragments.upload",
                //     this
                //   );
                //   that.oUploadFragment.open();
                // }

              }
            }
            else {
              that.byId("iduploadbtnDFF").setEnabled(false);
              MessageToast.show("User is not authorised for  upload action");

            }

          },
          error: function (oData, error) {
            MessageToast.show("error");
          },
        });

      },
      /**On close of upload fragment */
      onCloseUpload: function () {
        if (that.oUploadFragment) {
          that.oUploadFragment.destroy();
          delete this.oUploadFragment;
        }
      },
      /** On click of upload file button*/
      handleUploadPress: function () {
        that = this;
     //   that.oTableRead();
        sap.ui.core.BusyIndicator.show();
      
        var dateAll = [], dateFrmTo = {}, dateArray = [];
        that.oJSONData = [];
        var excelData = {};
        var file = sap.ui.getCore().byId("fileUploaderDFF").oFileUpload.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
          var data = e.target.result;
          var workbook = XLSX.read(data, {
            type: "binary"
          });
          workbook.SheetNames.forEach(function (sheetName) {
            excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            var array = excelData;
            if (array.length > 0) {
              that.JSONModel = new sap.ui.model.json.JSONModel();
              var count = 0, count1 = 0, obj = {};
              if (
                (array[0].Group_Id !== undefined &&
                  array[0].Group_Name !== undefined &&
                  array[0].From_Date !== undefined &&
                  array[0].To_Date !== undefined) && Object.keys(array[0]).length === 4) {
                for (var i = 0; i < array.length; i++) {
                  var FromNewDate = Date.parse(array[i].From_Date);
                  var ToNewDate = Date.parse(array[i].To_Date);
                //  if (isNaN(FromNewDate) && FromNewDate > 0 && isNaN(ToNewDate) && ToNewDate > 0) {
                  if(!isNaN(FromNewDate) && FromNewDate > 0 && !isNaN(ToNewDate) && ToNewDate > 0){
                    obj.GROUPID = array[i].Group_Id;
                    obj.GROUPNAME = array[i].Group_Name;
                    obj.FROMDATE = new Date(array[i].From_Date).toLocaleDateString('fr-CA');
                    obj.TODATE = new Date(array[i].To_Date).toLocaleDateString('fr-CA');
                    that.oJSONData.push(obj);
                    obj = {}
                    dateAll.push(new Date(array[i].From_Date).toLocaleDateString('fr-CA'));
                    dateAll.push(new Date(array[i].To_Date).toLocaleDateString('fr-CA'));
                    dateFrmTo = {
                      FROMDATE: new Date(array[i].From_Date).toLocaleDateString('fr-CA'),
                      TODATE: new Date(array[i].To_Date).toLocaleDateString('fr-CA')
                    }
                    dateArray.push(dateFrmTo);
                    dateFrmTo = {};
                  }
                  else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Invalid Dates in excel file at Group ID" + '-' + array[i].Group_Id + '\n' + "Group Name" + '-' + array[i].Group_Name);
                    return;
                  }
                }
              }
              else {
                count = count + 1;
                sap.m.MessageToast.show("Please use the given template");
                sap.ui.core.BusyIndicator.hide();
                return;
              }
              if (count === 0) {
                var resultArray = [];
                for (var s = 0; s < dateAll.length; s++) {
                  const dateToCheck = dateAll[s];
                  const dateRanges = dateArray;
                  const result = isAnyDateInRange(dateToCheck, dateRanges);
                  resultArray.push(result);
                }
                for (var ii = 0; ii < resultArray.length; ii++) {
                  var newCount = 0;
                  for (var kk = 0; kk < resultArray[ii].length; kk++) {
                    if (resultArray[ii][kk] === false) {
                      newCount++;
                    }
                  }
                  if (newCount < resultArray[ii].length - 1) {
                    var Flag = "G";
                    break;
                  }
                }
                if (Flag === "G") {
                  sap.ui.core.BusyIndicator.hide();
                  MessageToast.show("Date values conflict with in the excel. Please check dates in excel file");
                  return;
                }
                var tableItems = oAllData //that.oGModel.getProperty("/oTabDetails") //that.tableDetails;
                for (var i = 0; i < tableItems.length; i++) {
                  for (var k = 0; k < that.oJSONData.length; k++) {
                    var from = tableItems[i].FROM_DATE;
                    var to = tableItems[i].TO_DATE;
                    var checkFrom = that.oJSONData[k].FROMDATE;
                    var checkTo = that.oJSONData[k].TODATE;
                    if (dateCheck(from, to, checkFrom)) {
                      sap.ui.core.BusyIndicator.hide();
                      MessageToast.show("From Date already exists for Group ID" + '-' + that.oJSONData[k].GROUPID + '\n' + "Group Name" + '-' + that.oJSONData[k].GROUPNAME)
                      return;
                    }
                    else if (dateCheck(from, to, checkTo)) {
                      sap.ui.core.BusyIndicator.hide();
                      MessageToast.show("To Date already exists for Group ID" + '-' + that.oJSONData[k].GROUPID + '\n' + "Group Name" + '-' + that.oJSONData[k].GROUPNAME)
                      return;
                    }
                    else {
                      count1++;
                    }
                  }
                }
                if (count1 === (tableItems.length * that.oJSONData.length)) {
               //   console.log(that.oJSONData);
               
                //   var obModel = that.getOwnerComponent().getModel("oModel")
                //  var bModel = that.getOwnerComponent().getModel("oModel");
           //     var oModel = this.getOwnerComponent().getModel("oModel");
               aModel.read("/createDynamicFFG", {
                    method: "GET",
                    urlParameters: {
                      Flag: "U",
                      PRODATA: JSON.stringify(that.oJSONData)
                    },
                    success: function (oData) {
                      MessageToast.show(oData.createDynamicFFG);
                      if (that.oUploadFragment) {
                        that.oUploadFragment.destroy(true);
                        that.oUploadFragment = null;
                        delete that.oUploadFragment;
                      }
                      sap.ui.core.BusyIndicator.hide();
                      that.byId("vcpapp.vcpdynamicfrozenfirm::sap.suite.ui.generic.template.ListReport.view.ListReport::getDynHorizonGrpData--listReportFilter-btnGo").firePress();
                      that.byId("vcpapp.vcpdynamicfrozenfirm::sap.suite.ui.generic.template.ListReport.view.ListReport::getDynHorizonGrpData--responsiveTable").removeSelections();
                    },
                    error: function (error) {
                      sap.ui.core.BusyIndicator.hide();
                      MessageToast.show(error.createDynamicFFG);
                    },
                  });
                }
              }
            }
            else {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("Excel files doesn't contain any data to add");
              return;
            }
          });
        };
        reader.readAsBinaryString(file);
      },
      onDeletePress: function () {
        var oModel = this.getOwnerComponent().getModel("oModel");
        var vUser = this.getUser();
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

       //     var aResults = oData.results;
            aResults = [{
              "USER": "pavankumar@sbpcorp.in",
              "CREATE_CHK": "enabled",
              "UPDATE_CHK": "enabled",
              "DELETE_CHK": "enabled",
              "READ_CHK": "enabled"
            }]
            
            if (aResults.length > 0) {
              var isUserLoggedIn = true;
            }
            if (isUserLoggedIn) {
              if (aResults[0].DELETE_CHK == "disabled") {
                that.byId("idDeleteButtonDFF").setEnabled(false)
                MessageToast.show("User is not authorised for  Delete action");
              }
              else {

                var deleteItems = that.byId("vcpapp.vcpdynamicfrozenfirm::sap.suite.ui.generic.template.ListReport.view.ListReport::getDynHorizonGrpData--responsiveTable").getSelectedItems();
                var finalData = [], insertData = {};
                for (var i = 0; i < deleteItems.length; i++) {
                  insertData = {
                    GROUPNAME: deleteItems[i].getCells()[1].getText(),
                    GROUPID: deleteItems[i].getCells()[0].getText(),
                    FROMDATE: new Date(deleteItems[i].getCells()[2].getText()).toLocaleDateString('fr-CA'),
                    TODATE: new Date(deleteItems[i].getCells()[3].getText()).toLocaleDateString('fr-CA')
                  }
                  finalData.push(insertData);
                  insertData = {};
                }
                if (finalData.length === 1 || finalData.length > 1) {
                       var sText = "Do you want to delete the selected characteristic(s)?"
                   }
                //    if (finalData.length > 1) {
                //     var sText = "Do you want to delete the selected characteristic(s)?"
                // }
                 sap.m.MessageBox.warning(sText, {
                            title: "Delete",
                            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                            onClose: function (oAction) {
                                if (oAction === sap.m.MessageBox.Action.YES) {
                                   sap.ui.core.BusyIndicator.show();
                                    // Make the service call for deletion
                                     var oDelete = that.getOwnerComponent().getModel("oModel");
                                    oDelete.callFunction("/createDynamicFFG", {
                                        method: "GET",
                                        urlParameters: {
                                          Flag: "D",
                                          PRODATA: JSON.stringify(finalData)
                                        },
                                        success: function (oData) {
                                          sap.ui.core.BusyIndicator.hide();
                                               //  that.oApproveDialog.close();
                                                 MessageToast.show(oData.createDynamicFFG);
                                                 that.byId("vcpapp.vcpdynamicfrozenfirm::sap.suite.ui.generic.template.ListReport.view.ListReport::getDynHorizonGrpData--listReportFilter-btnGo").firePress();
                                                 that.byId("vcpapp.vcpdynamicfrozenfirm::sap.suite.ui.generic.template.ListReport.view.ListReport::getDynHorizonGrpData--responsiveTable").removeSelections();
                                            // that.byId("save").setText("Save");
                                            // var a = that.byId("mytable")
                                            // a.removeSelections()
                                            // sap.m.MessageToast.show("Bucket deleted successfully...!");

                                            // that.onAfterRendering();
                                            // that.onDropdownPress();
                                        },
                                        error: function (Error) {
                                            sap.m.MessageToast.show("Bucket deleted failed...!");
                                        }
                                    });
                                }
                            },
                        })
                // if (!that.oApproveDialog) {
                //   that.oApproveDialog = new Dialog({
                //     type: DialogType.Message,
                //     title: "Confirm",
                //     content: new Text({ text: "Do you want to delete the selected characteristic(s)?" }),
                //     beginButton: new Button({
                //       type: ButtonType.Emphasized,
                //       text: "Submit",
                //       press: function () {
                //         sap.ui.core.BusyIndicator.show();
                //         var bModel = that.getOwnerComponent().getModel("oModel");
                //         bModel.callFunction("/createDynamicFFG", {
                //           method: "GET",
                //           urlParameters: {
                //             Flag: "D",
                //             PRODATA: JSON.stringify(finalData)
                //           },
                //           success: function (oData) {
                //             sap.ui.core.BusyIndicator.hide();
                //             that.oApproveDialog.close();
                //             MessageToast.show(oData.createDynamicFFG);
                //             that.byId("vcpapp.vcpdynamicfrozenfirm::sap.suite.ui.generic.template.ListReport.view.ListReport::getDynHorizonGrpData--listReportFilter-btnGo").firePress();
                //             that.byId("vcpapp.vcpdynamicfrozenfirm::sap.suite.ui.generic.template.ListReport.view.ListReport::getDynHorizonGrpData--responsiveTable").removeSelections();
                //           },
                //           error: function (error) {
                //             sap.ui.core.BusyIndicator.hide();
                //             MessageToast.show(error.createDynamicFFG);
                //           },
                //         });
                //       }.bind(this)
                //     }),
                //     endButton: new Button({
                //       text: "Cancel",
                //       press: function () {
                //         this.oApproveDialog.close();
                //       }.bind(this)
                //     })
                //   });
                // }
                // that.oApproveDialog.open();

              }

            }
            else {
              that.byId("idDeleteButtonDFF").setEnabled(false);
              MessageToast.show("User is not authorised for  Delete action");

            }

          },
          error: function (oData, error) {
            MessageToast.show("error");
          },
        });

      },
      onHelp: function (oEvent) {
        if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
          jQuery.sap.storage(jQuery.sap.storage.Type.local).put("data", 20);
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
                    oStorage.put("nodeId",68);
          //Generate a  URL for the second application
          var url = window.location.href.split('#')[0] + hash;
          // //Navigate to second app
          sap.m.URLHelper.redirect(url, true);
        }
      }

    };
  });