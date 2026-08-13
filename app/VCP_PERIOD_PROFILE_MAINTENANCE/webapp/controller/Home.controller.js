sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "../model/formatter"
], (Controller,JSONModel, Filter, FilterOperator, MessageToast, MessageBox, UIComponent,formatter) => {
    "use strict";
    var oGModel, that;

    return Controller.extend("vcpapp.vcpperiodprofilemaintenance.controller.Home", {
        formatter: formatter,
        onInit() {
            that = this;

            if (!that.cretaeFrag) {
                that.cretaeFrag = sap.ui.xmlfragment("vcpapp.vcpperiodprofilemaintenance.fragments.createProfile", that);
                that.getView().addDependent(that.cretaeFrag);
            }
     
      

      
           
        },
        // prepareChartData: function () {
        //     var oModel = new JSONModel({
        //         chartData: [] 
        //     });

        //     this.getView().setModel(oModel);
        //     var data = [];

        //     // Add data for weekly input
        //     data.push({
        //         value: 30,
        //         color: "#FF0000", // Red for weekly
        //         label: "Weekly"
        //     });

        //     // Add data for monthly input
        //     data.push({
        //         value: 40,
        //         color: "#00FF00", // Green for monthly
        //         label: "Monthly"
        //     });

        //     // Add data for quarterly input
        //     data.push({
        //         value: 30,
        //         color: "#0000FF", // Blue for quarterly
        //         label: "Quarterly"
        //     });
        //     // that.oModel = new JSONModel();
        //     // that.oModel.setData({
        //     //     chartData:data
        //     // })
        //     // sap.ui.getCore().byId("smartchart").setModel(that.oModel)
        //     // var oView = this.getView();
        //     // var oModel = oView.getModel();
        //     // oModel.setProperty("/chartData",data )
        //     var oModel = this.getView().getModel();

        //     // Set the chartData property in the model with the prepared data
        //     oModel.setProperty("/chartData", data);

            
        // },
        onAfterRendering:function(){
            that.User = "";
            if (sap.ushell) {
                if (sap.ushell.Container) {
                    let email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                    that.User = (email) ? email : "";
                }
            }
            that.onInitialLoad()

        },
        onInitialLoad: function () {
            sap.ui.core.BusyIndicator.show();
            // that.byId("idLocSearch").setValue("")
            // Calling service to get the Location data
            that.getOwnerComponent().getModel("BModel").read("/getPeriodProfile", {
                success: function (oData) {
                    that.aProfData = oData.results;
                    sap.ui.core.BusyIndicator.hide();

                    that.LocModel = new JSONModel();
                    that.LocModel.setData({
                        results: oData.results
                    });
                    that.byId("ProfSection").setModel(that.LocModel);
                },
                error: function (oData, error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("error");
                },
            });
        },
        onCreate:function(){
            sap.ui.getCore().byId("idProfile").setValue();
            sap.ui.getCore().byId("idProfDesc").setValue();
            parseInt(sap.ui.getCore().byId("idWeek").setValue());
            parseInt(sap.ui.getCore().byId("idMonth").setValue());
            parseInt(sap.ui.getCore().byId("idQuarter").setValue())
            sap.ui.getCore().byId("idRestItem2").setTitle("Create")
            that.cretaeFrag.open()
        },
        onClose:function(){
            that.cretaeFrag.close() 
        },
        onSave:function(oEvent){
            var finalArray = []
            var obj ={
                PROFILE : sap.ui.getCore().byId("idProfile").getValue(),
                PROFILE_DESC : sap.ui.getCore().byId("idProfDesc").getValue(),
                WEEKLY : parseInt(sap.ui.getCore().byId("idWeek").getValue()),
                MONTHLY : parseInt(sap.ui.getCore().byId("idMonth").getValue()),
                QUARTERLY : parseInt(sap.ui.getCore().byId("idQuarter").getValue()),
                CREATED_BY:   "SBP", //that.User,
                // CREATED_DATE:'9999-12-31'

            }
            finalArray.push(obj);
            that.onCreation(finalArray);
            
        },
        onCreation:function(finalArray){
            sap.ui.core.BusyIndicator.show();
            if(finalArray[0].PROFILE.length <= 0 || finalArray[0].PROFILE_DESC.length <=0 || isNaN(finalArray[0].WEEKLY) === true || isNaN(finalArray[0].MONTHLY) === true || isNaN(finalArray[0].QUARTERLY) === true){
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("Please Maintain Required Fields");
                return false;
            }
            else{
                var sId = sap.ui.getCore().byId("idRestItem2").getTitle()
                if(sId == "Create"){
                    that.getOwnerComponent().getModel("BModel").callFunction("/genPeriodProfile", {
                        urlParameters: {
                            FLAG:"",
                            ProfileData: JSON.stringify(finalArray)
                        },
                        success: function (oData) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Successfully Created");
                            that.onInitialLoad();
                            that.onClose();
                           
                        },
                        error: function (oData) {
                            MessageToast.show("Failed to create /update the product");
                            sap.ui.core.BusyIndicator.hide();
                        },
                    });
                }else{
                    that.getOwnerComponent().getModel("BModel").callFunction("/genPeriodProfile", {
                        urlParameters: {
                            FLAG:"U",
                            ProfileData: JSON.stringify(finalArray)
                        },
                        success: function (oData) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Successfully Updated");
                            that.onInitialLoad();
                            that.onClose();
                           
                        },
                        error: function (oData) {
                            MessageToast.show("Failed to create /update the product");
                            sap.ui.core.BusyIndicator.hide();
                        },
                    }); 
                }
            }
           
            
        },
        onEdit:function(oEvent){
            var aEditItem = oEvent.getSource().getBindingContext().getObject();
            sap.ui.getCore().byId("idProfile").setValue(aEditItem.PROFILE);
            sap.ui.getCore().byId("idProfDesc").setValue(aEditItem.PROFILE_DESC);
            parseInt(sap.ui.getCore().byId("idWeek").setValue(aEditItem.WEEKLY));
            parseInt(sap.ui.getCore().byId("idMonth").setValue(aEditItem.MONTHLY));
            parseInt(sap.ui.getCore().byId("idQuarter").setValue(aEditItem.QUARTERLY));
            sap.ui.getCore().byId("idRestItem2").setTitle("Edit");
            that.cretaeFrag.open()

        },
        onDelete:function(oEvent){
            var deletedItems = [oEvent.getSource().getBindingContext().getObject()];
            var sMessage = "Are you sure you want to Delete Profile";
            var sTitle = "Confirmation";
    
            MessageBox.confirm(sMessage, {
              title: sTitle,
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.YES,
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.YES) {
                  // Action to take if "Yes" is pressed
                  that.getView().getModel("BModel").callFunction("/genPeriodProfile", {
                    urlParameters: {
                        FLAG: "D",
                        ProfileData: JSON.stringify(deletedItems)
                    },
                    success: function (oData) {
                        that.onInitialLoad();
                    },
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to delete variant");
                    },
                }); 
    
                } else {
                  // Action to take if "No" is pressed
                  sap.m.MessageToast.show("Action cancelled");
                }
              }
            });

          
        },
      
        onSelMonth:function(oEvent){

            var sId = oEvent.getParameters().id
            var value= parseInt(oEvent.getParameters().value);
            // var value = oEvent.getSource().getValue();
            if (value < 0) {
                oEvent.getSource().setValue(parseInt(0)); 
            }
            // var numericValue = value.replace(/[^\d.]/g, '');
            // // Update the input value with the cleaned numeric value
            // value.setValue(numericValue);
            var sWeek = parseInt(sap.ui.getCore().byId("idWeek").getValue());
            var sMonth = parseInt(sap.ui.getCore().byId("idMonth").getValue());
            var sQuart =parseInt(sap.ui.getCore().byId("idQuarter").getValue());
            if(isNaN(sWeek) === true){
                sWeek = parseInt(0)
            }
            if(isNaN(sMonth) === true){
                sMonth = parseInt(0)
            }
            if(isNaN(sQuart) === true){
                sQuart = parseInt(0)
            }
            sap.ui.getCore().byId("idQuarter").setValueState("Success");
                    sap.ui.getCore().byId("idWeek").setValueState("Success");
                    sap.ui.getCore().byId("idMonth").setValueState("Success");

            var totalCount = sWeek + sMonth + sQuart;


            if(sId == "idWeek"){
                if(value > 104 || totalCount > 104 ){
                    sap.ui.getCore().byId("idWeek").setValueState("Error");
                    sap.ui.getCore().byId("idWeek").setValueStateText("Total Weeks count cannot be greater than 104");
                    sap.ui.getCore().byId("idQuarter").setValueState("Error");
                    sap.ui.getCore().byId("idWeek").setValueState("Error");
                    sap.ui.getCore().byId("idMonth").setValueState("Error");

                }
                // else{
                //     sap.ui.getCore().byId("idQuarter").setValueState("Success");
                //     sap.ui.getCore().byId("idWeek").setValueState("Success");
                //     sap.ui.getCore().byId("idMonth").setValueState("Success");
                //         // if(value + sQuart + sMonth > parseInt(104)){
                //         //     sap.ui.getCore().byId("idWeek").setValueState("Error");
                //         //     sap.ui.getCore().byId("idWeek").setValueStateText("Total Weeks count cannot be greater than 104");
                //         // }
                //         // else if(value + sWeek + sQuart <= parseInt(104)){
                //         //     sap.ui.getCore().byId("idQuarter").setValueState("Success");
                //         //     sap.ui.getCore().byId("idWeek").setValueState("Success");
                //         //     sap.ui.getCore().byId("idMonth").setValueState("Success");
                //         // }
                // }
            
            }
            else if(sId == "idQuarter"){
                if(value >= 0){
                    if(value%12 == 0 && totalCount <= 104){
                        sap.ui.getCore().byId("idQuarter").setValueState("Success");
                        
                    }else{
                        if(totalCount <= 104){
                        sap.ui.getCore().byId("idQuarter").setValueState("Error");
                        sap.ui.getCore().byId("idQuarter").setValueStateText("Please maintain week value which is divisible by 12");
                        return 
                        } else {
                            sap.ui.getCore().byId("idQuarter").setValueStateText("Total Weeks count cannot be greater than 104");
                            sap.ui.getCore().byId("idQuarter").setValueState("Error");
                            sap.ui.getCore().byId("idWeek").setValueState("Error");
                            sap.ui.getCore().byId("idMonth").setValueState("Error");
                        }
                    }
                }
                // if(totalCount > 104){
                //     sap.ui.getCore().byId("idQuarter").setValueState("Error");
                //     sap.ui.getCore().byId("idQuarter").setValueStateText("Total Weeks count cannot be greater than 104");
                //     sap.ui.getCore().byId("idQuarter").setValueState("Error");
                //     sap.ui.getCore().byId("idWeek").setValueState("Error");
                //     sap.ui.getCore().byId("idMonth").setValueState("Error");
                // }
                // else{
                //     sap.ui.getCore().byId("idQuarter").setValueState("Success");
                //     sap.ui.getCore().byId("idWeek").setValueState("Success");
                //     sap.ui.getCore().byId("idMonth").setValueState("Success");
                //         // if(value + sWeek + sMonth > parseInt(104)){
                //         //     sap.ui.getCore().byId("idQuarter").setValueState("Error");
                //         //     sap.ui.getCore().byId("idQuarter").setValueStateText("Total Weeks count cannot be greater than 104");
                //         // }
                //         // else if(value + sWeek + sQuart <=  parseInt(104)){
                //         //     sap.ui.getCore().byId("idQuarter").setValueState("Success");
                //         //     sap.ui.getCore().byId("idWeek").setValueState("Success");
                //         //     sap.ui.getCore().byId("idMonth").setValueState("Success");
                //         // }
                // }
            }else {
                if(value >= 0){
                    if(value%4 == 0  && totalCount <= 104){
                        sap.ui.getCore().byId("idMonth").setValueState("Success");
                        
                    }else{
                        sap.ui.getCore().byId("idMonth").setValueState("Error");
                        if(totalCount <= 104){
                        sap.ui.getCore().byId("idMonth").setValueStateText("Please give a valid weeks which is divisible by 4");
                        return
                        } else {
                            sap.ui.getCore().byId("idWeek").setValueStateText("Weeks should contain only 104 Weeks");
                            sap.ui.getCore().byId("idQuarter").setValueState("Error");
                            sap.ui.getCore().byId("idWeek").setValueState("Error");
                            sap.ui.getCore().byId("idMonth").setValueState("Error");
                        }
                    }
                }
                // if(value > 104){
                //     sap.ui.getCore().byId("idWeek").setValueState("Error");
                //     sap.ui.getCore().byId("idWeek").setValueStateText("Weeks should contain only 104 Weeks");
                //     sap.ui.getCore().byId("idQuarter").setValueState("Error");
                //     sap.ui.getCore().byId("idWeek").setValueState("Error");
                //     sap.ui.getCore().byId("idMonth").setValueState("Error");
                // }
                // else{
                    
                //         // if(value + sWeek + sQuart > parseInt(104)){
                //         //     sap.ui.getCore().byId("idMonth").setValueState("Error");
                //         //     sap.ui.getCore().byId("idMonth").setValueStateText("Weeks should contain only 104 Weeks");
                //         // }
                //         // else if(value + sWeek + sQuart <=  parseInt(104)){
                //         //     sap.ui.getCore().byId("idQuarter").setValueState("Success");
                //         //     sap.ui.getCore().byId("idWeek").setValueState("Success");
                //         //     sap.ui.getCore().byId("idMonth").setValueState("Success");
                //         // }
                // }
            }






            // sap.ui.getCore().byId("idWeekly").setDisplayValue(sWeek + " " + "Weeks for Weekly");
            // sap.ui.getCore().byId("idMonthly").setDisplayValue(sMonth + " " + "Weeks for Monthly");
            // sap.ui.getCore().byId("QuarterID").setDisplayValue(sQuart + " " + "Weeks for Quarterly");
            sap.ui.getCore().byId("idWeekly").setValue(sWeek);
            sap.ui.getCore().byId("idMonthly").setValue(sMonth);
            sap.ui.getCore().byId("QuarterID").setValue(sQuart);

            sap.ui.getCore().byId("idWeekly").setDisplayValue(sWeek + " " + "Weekly");
            sap.ui.getCore().byId("idMonthly").setDisplayValue(sMonth + " " + "Monthly");
            sap.ui.getCore().byId("QuarterID").setDisplayValue(sQuart + " " + "Quarterly");

            sap.ui.getCore().byId("idTotal").setText(totalCount + " " + "Weeks")
    
           
        },
        onSearch: function (oEvent) {
            var oFilters = []
            var sQuery;
            if (oEvent) {
              sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue")
              sQuery = sQuery ? sQuery.trim() : "";
            }
            if (sQuery !== "") {
              oFilters.push(
                new Filter({
                  filters: [
                    new Filter("PROFILE", FilterOperator.Contains, sQuery),
                    new Filter("PROFILE_DESC", FilterOperator.Contains, sQuery),
                  ],
                  and: false,
                })
              );
              that.byId("ProfSection").getBinding("items").filter(oFilters)
            }
    
            else if (sQuery == "") {
                that.byId("ProfSection").getBinding("items").filter([])
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
                    oStorage.put("nodeId",73);
                    //Generate a  URL for the second application
                    var url = window.location.href.split('#')[0] + hash;
                    //Navigate to second app
                    sap.m.URLHelper.redirect(url, true);
                }
            },
    });
});