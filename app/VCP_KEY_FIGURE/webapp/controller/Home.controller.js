sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator) {
    "use strict";
    var that;
    return Controller.extend("vcpapp.vcpkeyfiguremaintenance.controller.Home", {
        onInit: function () {
            that = this;
            this.oModel = this.getOwnerComponent().getModel("oModel");
            that.gModel = this.getOwnerComponent().getModel("gModel");
            this.getView().setModel(this.oModel);
            this.smartFilterBar = this.byId("smartFilterBarKFM");
            this._loadFragments();
            that.gModel.setProperty("/key", "P");
        },
        onAfterRendering: function () {
            // that.ocore = sap.ui.getCore();
            // that.keyFigID = that.ocore.byId("Key_IDKFM");
            // that.keyFigDesc = that.ocore.byId("KeY_Fig_DescKFM");
            // that.keyPriority = that.ocore.byId("PriorityOrderKFM");
            // that.keyDisplay = that.ocore.byId("OrderByKFM");
        },
        onFilterBarInit: function (oEvent) {
            var oSmartFilterBar = this.smartFilterBar;

            // Get the control for KEY_FIG_ID field
            var oControl = oSmartFilterBar.getControlByKey("KEY_FIG_ID");

            if (oControl) {
                // For input fields with value help dialog
                if (oControl.attachValueHelpRequest) {
                    oControl.attachValueHelpRequest(function (oEvent) {
                        setTimeout(() => {
                            var oValueHelpDialog = sap.ui.getCore().byId(oControl.getId() + "-valueHelpDialog");

                            if (oValueHelpDialog) {
                                // Wait for the dialog to open fully
                                setTimeout(function () {
                                    // Get the table in the value help dialog
                                    var oTable = oValueHelpDialog.getTable();
                                    if (oTable && oTable.getBinding()) {
                                        // Apply filter to show only IDs below 1000
                                        var oFilter = new sap.ui.model.Filter("KEY_FIG_ID", sap.ui.model.FilterOperator.LE, "999");
                                        oTable.getBinding().filter([oFilter]);
                                    }
                                }, 500);
                            }
                        });
                    }, 500)
                }
            }
            const filter1 = [new Filter("KEY_DIFFERENCE", FilterOperator.EQ, "P")];
            const filter2 = [new Filter("KEY_DIFFERENCE", FilterOperator.EQ, "Q")];
            const filter3 = new Filter([
                new Filter("KEY_DIFFERENCE", FilterOperator.EQ, "C"),
                new Filter("KEY_FIG_ID", FilterOperator.LE, "999")
            ], true);
            let interval = setInterval(() => {
                if (that.getView().byId("smartTablePKFM").getTable().getBinding("rows")) {
                    clearInterval(interval);
                    that.getView().byId("smartTablePKFM").getTable().getBinding("rows").filter(filter1);
                    that.getView().byId("smartTableQKFM").getTable().getBinding("rows").filter(filter2);
                    that.getView().byId("smartTableCKFM").getTable().getBinding("rows").filter(filter3);
                }
            }, 100);
        },
        onClear() {
            that.onFilterBarInit();
        },
        _loadFragments: function () {
            if (!that.saveDialog) {
                that.saveDialog = sap.ui.xmlfragment("vcpapp.vcpkeyfiguremaintenance.fragments.Update", this);
                that.getView().addDependent(that.saveDialog);
            }
            if (!that.qtyCalDialog) {
                that.qtyCalDialog = sap.ui.xmlfragment("vcpapp.vcpkeyfiguremaintenance.fragments.QtyCal", this);
                that.getView().addDependent(that.qtyCalDialog);
            }
            that.gModel.setProperty("/tableP", false);
            that.gModel.setProperty("/tableQ", false);
            that.gModel.setProperty("/tableC", false);
        },
        onCreatOrUpdatePress: function (oEvent) {
            const isCreate = oEvent.getSource().getId().includes("btnMultiCreateKFM");
            const oDialogTitle = isCreate ? "Create" : "Update";
            const oButtonText = isCreate ? "Save" : "Update";
            that.gModel.setProperty("/isCreate", isCreate);


            this.saveDialog.open();
            sap.ui.getCore().byId("multipleEditingDialogKFM").setTitle(oDialogTitle);
            sap.ui.getCore().byId("iBtn").setText(oButtonText);

            if (isCreate) {
                this._resetFields();
            } else {
                const sObj = this._getSelectedRowData();
                if (sObj) {
                    this._populateFields(sObj);
                } else {
                    MessageToast.show("No row selected for update.");
                }
            }
        },
        _resetFields: function () {
            sap.ui.getCore().byId("Key_IDKFM").setValue("");
            sap.ui.getCore().byId("KeY_Fig_DescKFM").setValue("");
            sap.ui.getCore().byId("KeY_Fig_NameKFM").setValue("");
            sap.ui.getCore().byId("PriorityOrderKFM").setValue("");
            sap.ui.getCore().byId("OrderByKFM").setValue("");
        },
        _populateFields: function (oData) {
            const key = that.gModel.getProperty("/key");
            if (key === "P") {
                sap.ui.getCore().byId("Key_IDKFM").setValue(oData.KEY_FIG_ID || "");
                sap.ui.getCore().byId("KeY_Fig_DescKFM").setValue(oData.KEY_FIG_DESCRIPTION || "");
                sap.ui.getCore().byId("KeY_Fig_NameKFM").setValue(oData.KEY_FIG_DESC || "");
                sap.ui.getCore().byId("PriorityOrderKFM").setValue(oData.PRIORITY_ORDER || "");
                sap.ui.getCore().byId("OrderByKFM").setValue(oData.DISPLAY_ORDER || "");
            } else {
                sap.ui.getCore().byId("Key_ID_QKFM").setValue(oData.KEY_FIG_ID || "");
                sap.ui.getCore().byId("KeY_Fig_DeschKFM").setValue(oData.KEY_FIG_DESCRIPTION || "");
                sap.ui.getCore().byId("KeY_Fig_NameqKFM").setValue(oData.KEY_FIG_DESC || "");
            }
        },
        // old code upto 22-10-2025
        // _getSelectedRowData: function () {
        //     const key = that.gModel.getProperty("/key");

        //     let oTable;
        //     // const oTable = this.byId("smartTablePKFM").getTable();
        //     if (key === "P") {
        //         oTable = this.byId("smartTablePKFM").getTable();
        //     } else if (key === "Q") {
        //         oTable = this.byId("smartTableQKFM").getTable();
        //     } else if (key === "C") {
        //         oTable = this.byId("smartTableCKFM").getTable();
        //     }
        //     const aSelectedIndices = oTable.getSelectedIndices();
        //     if (aSelectedIndices.length === 0) return null;
        //     return oTable.getRows()[aSelectedIndices[0]].getBindingContext().getObject();
        // },

        _getSelectedRowData: function () {
            const key = that.gModel.getProperty("/key");

            let oTable;
            if (key === "P") {
                oTable = this.byId("smartTablePKFM").getTable();
            } else if (key === "Q") {
                oTable = this.byId("smartTableQKFM").getTable();
            } else if (key === "C") {
                oTable = this.byId("smartTableCKFM").getTable();
            }

            const aSelectedIndices = oTable.getSelectedIndices();
            if (aSelectedIndices.length === 0) {
                return null;
            }
            const oContext = oTable.getContextByIndex(aSelectedIndices[0]);
            if (!oContext) {
                return null;
            }

            return oContext.getObject();
        },

        onDialogSaveButton: function (oEvent) {
            // const sTitle = sap.ui.getCore().byId("multipleEditingDialogKFM").getTitle();
            const sTitle = oEvent.getSource().getParent().getTitle();
            if (sTitle === "Create") {
                this._saveKeyFigure(true);
            } else {
                this._saveKeyFigure(false);
            }
        },

        _saveKeyFigure: function (isCreate) {
            let oData;
            let key = that.gModel.getProperty("/key");
            oData = {
                KEY_FIG_ID: Number(sap.ui.getCore().byId("Key_IDKFM").getValue()),
                KEY_FIG_DESCRIPTION: sap.ui.getCore().byId("KeY_Fig_DescKFM").getValue(),
                KEY_FIG_DESC: sap.ui.getCore().byId("KeY_Fig_NameKFM").getValue(),
                DISPLAY_ORDER: Number(sap.ui.getCore().byId("OrderByKFM").getValue()),
                PRIORITY_ORDER: Number(sap.ui.getCore().byId("PriorityOrderKFM").getValue()),
                KEY_DIFFERENCE: key
            };
            if (oData.KEY_DIFFERENCE !== "P") {
                oData = {
                    KEY_FIG_ID: Number(sap.ui.getCore().byId("Key_ID_QKFM").getValue()),
                    KEY_FIG_DESCRIPTION: sap.ui.getCore().byId("KeY_Fig_DeschKFM").getValue(),
                    KEY_FIG_DESC: sap.ui.getCore().byId("KeY_Fig_NameqKFM").getValue(),
                    DISPLAY_ORDER: Number(sap.ui.getCore().byId("Key_ID_QKFM").getValue()),
                    PRIORITY_ORDER: Number(sap.ui.getCore().byId("Key_ID_QKFM").getValue()),
                    KEY_DIFFERENCE: key
                };
            }
            if (isCreate) {
                const idExsit = that.checkId(oData.KEY_FIG_ID);
                if (idExsit)
                    return MessageToast.show("Id Already Exist");
            }
            if (this._validateData(oData)) {
                const sUrlParameters = JSON.stringify([oData]);
                this.oModel.callFunction("/saveKeyFigMasterData", {
                    method: "GET",
                    urlParameters: {
                        keyFigData: sUrlParameters
                    },
                    success: () => {
                        key === "P" ? this.onCloseDialog() : this.onCloseQCDialog();
                        MessageToast.show(isCreate ? "Created successfully" : "Updated successfully");
                        this.smartFilterBar.search();
                        that.onFilterBarInit();
                        that.resetUpdate();
                    },
                    error: (er) => {
                        key === "P" ? this.onCloseDialog() : this.onCloseQCDialog();
                        MessageToast.show(`Failed to ${isCreate ? "create" : "update"} data`);
                    }
                });
            } else {
                MessageToast.show("Please fill all required fields.");
            }
        },
        checkId: function (sid) {
            const key = that.gModel.getProperty("/key");

            let oTable;
            if (key === "P") {
                oTable = this.byId("smartTablePKFM").getTable();
            } else if (key === "Q") {
                oTable = this.byId("smartTableQKFM").getTable();
            } else if (key === "C") {
                oTable = this.byId("smartTableCKFM").getTable();
            }
            const find = oTable.getRows().find(item => {
                const obj = item.getBindingContext()?.getObject();
                return obj?.KEY_DIFFERENCE === that.gModel.getProperty("/key") && obj?.KEY_FIG_ID == sid
            })
            if (find)
                return true;
            return false;
        },
        _validateData: function (oData) {
            return Object.values(oData).every((value) => value);
        },
        onCloseDialog: function () {
            this._resetFields();
            this.saveDialog.close();
        },
        onCloseQCDialog: function () {
            sap.ui.getCore().byId("Key_ID_QKFM").setValue("");
            sap.ui.getCore().byId("KeY_Fig_NameqKFM").setValue("");
            sap.ui.getCore().byId("KeY_Fig_DeschKFM").setValue("");
            that.qtyCalDialog.close();
        },
        resetUpdate: function () {
            const key = that.gModel.getProperty("/key");
            if (key === "P") {
                that.gModel.setProperty("/tableP", false);

            } else if (key === "Q") {
                that.gModel.setProperty("/tableQ", false);

            } else if (key === "C") {
                that.gModel.setProperty("/tableC", false);
            }
        },
        onTableSelection: function (oEvent) {
            // const aSelectedIndices = this.byId("smartTablePKFM").getTable().getSelectedIndices();
            // this.byId("btnMultiEditKFM").setEnabled(aSelectedIndices.length > 0);

            const sId = oEvent.getSource().sId;
            const aSelectedIndices = oEvent.getSource().getSelectedIndices();
            if (aSelectedIndices.length > 0) {
                if (sId.endsWith("idTableKFM")) {
                    that.gModel.setProperty("/tableP", true);

                } else if (sId.includes("idTableQKFM")) {
                    that.gModel.setProperty("/tableQ", true);

                } else if (sId.includes("idTableCKFM")) {
                    that.gModel.setProperty("/tableC", true);
                }
            } else {
                if (sId.endsWith("idTableKFM")) {
                    that.gModel.setProperty("/tableP", false);

                } else if (sId.includes("idTableQKFM")) {
                    that.gModel.setProperty("/tableQ", false);

                } else if (sId.includes("idTableCKFM")) {
                    that.gModel.setProperty("/tableC", false);
                }
            }
            that.gModel.refresh(true);
        },
        onCreatOrUpdateQC: function (oEvent) {
            const isCreate = oEvent.getSource().getId().includes("btnMultiCreate");
            const oDialogTitle = isCreate ? "Create" : "Update";
            const oButtonText = isCreate ? "Save" : "Update";
            that.gModel.setProperty("/isCreateQ", isCreate);


            this.qtyCalDialog.open();
            sap.ui.getCore().byId("qtyDialogKFM").setTitle(oDialogTitle);
            sap.ui.getCore().byId("idBtnQCKFM").setText(oButtonText);

            if (isCreate) {
                sap.ui.getCore().byId("Key_ID_QKFM").setValue("");
                sap.ui.getCore().byId("KeY_Fig_DeschKFM").setValue("");
            } else {
                const sObj = this._getSelectedRowData();
                if (sObj) {
                    this._populateFields(sObj);
                } else {
                    MessageToast.show("No row selected `for update.");
                }
            }
        },
        onChangeTable: function (oEvent) {
            const filter = oEvent.getSource().getSelectedKey();
            if (filter.endsWith(0)) {
                that.gModel.setProperty("/key", "P");
            } else if (filter.endsWith(1)) {
                that.gModel.setProperty("/key", "Q");
                that.byId("idTableQKFM").getColumns()[3].setVisible(false); // hide priority Order 
                that.byId("idTableQKFM").getColumns()[4].setVisible(false); // hide Display Order 
            } else if (filter.endsWith(2)) {
                that.gModel.setProperty("/key", "C");
                that.byId("idTableCKFM").getColumns()[3].setVisible(false); // hide priority Order 
                that.byId("idTableCKFM").getColumns()[4].setVisible(false); //hide Display Order 
            }
            that.gModel.refresh(true);
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
                oStorage.put("nodeId", 72);
                //Generate a  URL for the second application
                var url = window.location.href.split('#')[0] + hash;
                //Navigate to second app
                sap.m.URLHelper.redirect(url, true);
            }
        }

    });
});