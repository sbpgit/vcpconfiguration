sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";
        var that;

        return Controller.extend("vcpapp.vcpplanningapps1.controller.NetworkDetail", {
            onInit: function () {
                this.getOwnerComponent().getRouter().getRoute("NetworkDetail").attachPatternMatched(this.route, this);
                that =this;
            },
            route:function(oEv){
                that.oGModel = that.getOwnerComponent().getModel("oGModel");
                var data = that.oGModel.getProperty("/NetworkData");
                var dModel = new JSONModel(data);
                that.getView().setModel(dModel);
            },
            //nav bck fun
            NavBack:function(){
             //  that.getOwnerComponent().getRouter().navTo("Network");

               var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
               oRouter.navTo("Home", { key: "network" }, true);
          
            }
        });
    });