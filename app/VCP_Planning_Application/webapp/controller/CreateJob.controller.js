sap.ui.define([
    "vcpapp/vcpplanningapps1/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "vcpapp/vcpplanningapps1/model/formatter",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",

    "sap/ui/core/library",
    "sap/ui/model/Sorter",
    "sap/m/Dialog",
    "sap/m/library",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/MessageBox",
    'sap/ui/export/Spreadsheet'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, formatter, MessageToast, Spreadsheet, Filter, FilterOperator, library, Sorter, Dialog, Text, Button, MessageBox) {
        "use strict";
        var that, oGModel;
        var prodSel = [];
        var SprodSel = [];

        return BaseController.extend("vcpapp.vcpplanningapps1.controller.CreateJob", {
            formatter: formatter,
            onInit: function () {
                that = this; //new chnages
                this.selectedProductsArray = []; // Array to store selected products
                // Declaring JSON Model and size limit
                that.oModel = new JSONModel();
                that.TemplateModel = new JSONModel();
                that.stepsModel = new JSONModel();
                that.TemplateModelSel = new JSONModel();
                this.MFlocModel = new JSONModel();
                this.locModel = new JSONModel();
                this.prodModel = new JSONModel();
                this.ppfModel = new JSONModel();
                this.verModel = new JSONModel();
                this.scenModel = new JSONModel();
                this.classModel = new JSONModel();

                this.custGroupModel = new JSONModel();

                that.oGModel = that.getOwnerComponent().getModel("oGModel");

                that.oModel.setSizeLimit(10000);
                that.TemplateModel.setSizeLimit(10000);
                that.stepsModel.setSizeLimit(10000);
                that.TemplateModelSel.setSizeLimit(10000);
                that.locModel.setSizeLimit(10000);
                that.prodModel.setSizeLimit(10000);
                that.ppfModel.setSizeLimit(10000);
                that.classModel.setSizeLimit(10000);

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

                if (!that.successerrorDialog) {
                    that.successerrorDialog = sap.ui.xmlfragment("vcpapp.vcpplanningapps1.view.successerrorDialog", that);
                    that.getView().addDependent(that.successerrorDialog);
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
                that.successerrorList = sap.ui.getCore().byId(
                    that.successerrorDialog.getId() + "-list"
                );
                that.oModel = that.getOwnerComponent().getModel("PCModel");
                if (that.prevSelect == "Config") {
                    // that.onResetData();
                }
                else {

                }

            },

            onAfterRendering: function () {
                that.skip = 0
                that.byId("idMenu")._getButtonControl()._getArrowButton().setIcon("sap-icon://slim-arrow-up");
                that.oModel = that.getOwnerComponent().getModel("PCModel");
                if (!that.crtplanDialog) {
                    that.crtplanDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpplanningapps1.view.createplanDialog",
                        that
                    );
                    that.getView().addDependent(that.createplanDialog);
                }
                if (!that.crtfactoryDialog) {
                    that.crtfactoryDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpplanningapps1.view.createfactoryDialog",
                        that
                    );
                    that.getView().addDependent(that.crtfactoryDialog);
                }

                if (!that.createdmdDialog) {
                    that.createdmdDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpplanningapps1.view.createdmdDialog",
                        this
                    );
                    that.getView().addDependent(that.createdmdDialog);
                }
                if (!that.successerrorDialog) {
                    that.successerrorDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpplanningapps1.view.successerrorDialog",
                        this
                    );
                    that.getView().addDependent(that.successerrorDialog);
                }

                that.ocrtfactList = sap.ui.getCore().byId(
                    that.crtfactoryDialog.getId() + "-list"
                );
                that.ocrtprodList = sap.ui.getCore().byId(
                    that.crtplanDialog.getId() + "-list"
                );
                that.ocrtdemList = sap.ui.getCore().byId(
                    that.createdmdDialog.getId() + "-list"
                );
                that.successerrorList = sap.ui.getCore().byId(
                    that.successerrorDialog.getId() + "-list"
                );

                that.onReset();
                sap.ui.core.BusyIndicator.show();
                that.oModel.read("/getLocation", {
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that.gLocdata = oData.results;
                        that.oDemandLocs = Array.from(new Set(oData.results.map(item => item.LOCATION_ID)))
                            .map(LOCATION_ID => oData.results.find(item => item.LOCATION_ID === LOCATION_ID));

                    },
                    error: function (e) {
                    }
                })

                that.oModel.callFunction("/getPartialProdbyLocation", {
                    method: "GET",
                    urlParameters: {
                        Flag: "",
                        LOCATION_ID: ""
                    },
                    success: function (oData) {
                        that.CompData = []
                        that.CompData = JSON.parse(oData.getPartialProdbyLocation)

                    },
                    error: function (e) {
                    }
                })

                that.oTableService()
            },

            oTableService: function (filters, tokens) {
                that.oTableData = [];
                var aFilters = filters;
                that.tokens = tokens;
                var topCount = "30000" //that.oGModel.getProperty("/MaxCount");
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
                            that.oTableData = that.oTableData.concat(oData.results);
                            that.oTableService();
                        } else {
                            that.skip = 0;
                            that.oTableData = that.oTableData.concat(oData.results);

                            var oTabData = that.oTableData
                            that.oGModel.setProperty("/oAllData", oTabData)

                        }
                    },
                    error: function (e) {
                        sap.ui.core.BusyIndicator.hide();
                    }
                })
            },

            //   oTableService: function (filters, tokens) {
            //     that.oTableData = [];
            //     var aFilters = filters;
            //     that.tokens = tokens;
            //     var topCount = "30000";
            //     sap.ui.core.BusyIndicator.show();

            //     that.getOwnerComponent().getModel("PCModel").read("/getfactorylocdesc", {
            //         filters: aFilters,
            //         urlParameters: {
            //             "$skip": that.skip,
            //             "$top": topCount
            //         },
            //         success: function (oData) {
            //             sap.ui.core.BusyIndicator.hide();
            //             if (topCount == oData.results.length) {
            //                 that.skip += parseInt(topCount);
            //                 that.oTableData = that.oTableData.concat(oData.results);
            //                 that.oTableService(); // Recursive call
            //             } else {
            //                 that.skip = 0;
            //                 that.oTableData = that.oTableData.concat(oData.results);

            //                 that.oGModel.setProperty("/oAllData", that.oTableData);
            //             }
            //         },
            //         error: function (e) {
            //             sap.ui.core.BusyIndicator.hide();
            //         }
            //     });
            // },


            onBack: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Home", { key: "network" }, true);
            },

            destroy: function () {
                that._demandDialog = null;
                that._factoryDialog = null;
                that._productDialog = null;
                that._planDialog = null;

            },

            getSelectedItems: function () {
                // Access the data from the model
                let oModel = that.byId("prodt").getModel();
                let aGroupedItems = oModel.getProperty("/groupedItems"); // Get the grouped product data

                let aSelectedItems = [];

                // Iterate through each group of products
                aGroupedItems.forEach(function (aItems) {
                    // Check each item in the group
                    aItems.forEach(function (oItem) {
                        if (oItem.PRODUCT_SELECTED) {
                            // Add selected items to the array
                            aSelectedItems.push(oItem);
                        }
                    });
                });

                return aSelectedItems; // Return the array of selected items
            },

            handleSearch1: function (oEvent) {
                // Get the search query and trim it
                var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue");
                var sId = oEvent.getParameter("id");
                var oFilters = [];
                sQuery = sQuery ? sQuery.trim() : "";

                // Check if the search field is related to "oCreatePlan"
                if (sId.includes("oCreatePlan")) {
                    // Apply filters if there's a search query
                    if (sQuery !== "") {
                        oFilters.push(
                            // Create a filter array using sap.ui.model.Filter
                            new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("LOCATION_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("PLANLOC_DESC", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("LOCATION_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("LOCATION_DESC", sap.ui.model.FilterOperator.Contains, sQuery)
                                ],
                                and: false
                            })
                        );

                    }
                    // Apply the filters to the items binding in oCreatePlan
                    sap.ui.getCore().byId("oCreatePlan").getBinding("items").filter(oFilters);
                }
                else if (sId.includes("oCreateFactory")) {
                    // Apply filters if there's a search query
                    if (sQuery !== "") {
                        oFilters.push(
                            // Create a filter array using sap.ui.model.Filter
                            new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("LOCATION_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("LOCATION_DESC", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("LOCATION_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("LOCATION_DESC", sap.ui.model.FilterOperator.Contains, sQuery)
                                ],
                                and: false
                            })
                        );

                    }
                    // Apply the filters to the items binding in oCreatePlan
                    sap.ui.getCore().byId("oCreateFactory").getBinding("items").filter(oFilters);
                }
                else if (sId.includes("searchField")) {
                    // Apply filters if there's a search query
                    if (sQuery !== "") {
                        oFilters.push(
                            // Create a filter array using sap.ui.model.Filter
                            new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("LOCATION_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("DEMAND_DESC", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("LOCATION_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("LOCATION_DESC", sap.ui.model.FilterOperator.Contains, sQuery)
                                ],
                                and: false
                            })
                        );

                    }
                    // Apply the filters to the items binding in oCreatePlan
                    //   sap.ui.getCore().byId("createdmd").getBinding("items").filter(oFilters);
                    sap.ui.getCore().byId("itemList").getBinding("items").filter(oFilters)
                }
            },

            handleValueHelp: function (oEv) {
                var oFilters = [];
                // that.createdmdDialog.open();

                that.PlanningLoc = that.byId("pln").getValue() //that.byId("pln").getTokens();
                that.FactoryLoc = that.byId("fct").getValue() //that.byId("fct").getTokens();
                that.DemandLoc = that.byId("dem").getTokens()
                //   that.prodcuct = that.byId("prod").getTokens();
                var select = oEv.oSource.getLabels()[0].getText();
                //    that.oDemandLocs
                if (select == "Planning Location") {
                    that.byId("fct").setValue("")
                    that.byId("dem").removeAllTokens();
                    var dModel = new JSONModel();
                    dModel.setData({
                        groupedItems: []
                    });
                    that.byId("availableProductsTable").setModel(dModel);

                    sap.ui.getCore().byId("searchField").setValue("")
                    that.oGModel.setProperty("/TabSelect", select);
                    // let oPlanLocs = Array.from(new Set(that.oDemandLocs.map(item => item.LOCATION_ID)))
                    //     .map(LOCATION_ID => that.oDemandLocs.find(item => item.LOCATION_ID === LOCATION_ID));

                    let oPlanLocs = Array.from(new Set(that.oDemandLocs.map(item => item.LOCATION_ID)))
                        .map(LOCATION_ID => that.oDemandLocs.find(item => item.LOCATION_ID === LOCATION_ID));

                    var dModel = new JSONModel();
                    dModel.setData({
                        aItems: oPlanLocs
                    });
                    sap.ui.getCore().byId("oCreatePlan").setModel(dModel);
                    that.crtplanDialog.open()
                }
                else if (select == "Factory Location") {
                    that.byId("dem").removeAllTokens();
                    var dModel = new JSONModel();
                    dModel.setData({
                        groupedItems: []
                    });
                    that.byId("availableProductsTable").setModel(dModel);

                    sap.ui.getCore().byId("searchField").setValue("")
                    if (that.PlanningLoc == "") {
                        sap.m.MessageToast.show("Select planning location")
                        return false
                    }
                    that.oGModel.setProperty("/TabSelect", select);

                    let oFacLocs = Array.from(new Set(that.oDemandLocs.map(item => item.LOCATION_ID)))
                        .map(LOCATION_ID => that.oDemandLocs.find(item => item.LOCATION_ID === LOCATION_ID));

                    var dModel = new JSONModel();
                    dModel.setData({
                        aItems: oFacLocs
                    });
                    sap.ui.getCore().byId("oCreateFactory").setModel(dModel);
                    that.crtfactoryDialog.open()

                }

                if (select == "Demand Location") {
                    var dModel = new JSONModel();
                    dModel.setData({
                        groupedItems: []
                    });
                    that.byId("availableProductsTable").setModel(dModel);

                    sap.ui.getCore().byId("selectAllCheckbox").setSelected(false)
                    sap.ui.getCore().byId("searchField").setValue("")
                    if (that.PlanningLoc == "" && that.FactoryLoc == "") {
                        sap.m.MessageToast.show("Select planning & factory location")
                        return false
                    }
                    that.oGModel.setProperty("/TabSelect", select);

                    var selected = [];
                    // Get the List by ID
                    var oList = sap.ui.getCore().byId("itemList"); // Adjust the ID if needed
                    var fItems = oList.getItems(); // Get items from the List

                    fItems.forEach(x => {
                        if (x.getSelected() == true) {
                            selected.push(x);
                        }
                    });

                    if (selected.length == 0) {
                        var dModel = new JSONModel();
                        dModel.setData({
                            aItems: that.oDemandLocs
                        });
                        sap.ui.getCore().byId("createdmd").setModel(dModel);
                        that.createdmdDialog.open();
                    } else {
                        var tok = that.byId("dem").getTokens();
                        var tokenNames = [];
                        tok.forEach(x => {
                            tokenNames.push(x.getText());
                        });

                        var dModel = new JSONModel();
                        dModel.setData({
                            aItems: that.oDemandLocs
                        });
                        sap.ui.getCore().byId("createdmd").setModel(dModel);


                        // Reset selections in the List
                        oList.removeSelections();
                        fItems.forEach(y => {
                            if (tokenNames.includes(y.getTitle())) {
                                y.setSelected(true);
                            } else {
                                y.setSelected(false);
                            }
                        });

                        that.createdmdDialog.open();
                    }
                }

            },

            onDemandDialogClose: function () {
                that.createdmdDialog.close();
            },

            onItemPress: function (oEvent) {
                var oTable = that.byId("availableProductsTable");
                var oSelectedItem = oEvent.getSource(); // Get the pressed item (row)
                var iIndex = oTable.indexOfItem(oSelectedItem); // Get the index of the item in the table

                // Check if the row is already selected
                var bSelected = oTable.isSelectedIndex(iIndex);

                // Select or deselect the row based on its current state
                if (!bSelected) {
                    oTable.addSelectionInterval(iIndex, iIndex); // Select the row
                } else {
                    oTable.removeSelectionInterval(iIndex, iIndex); // Deselect the row
                }
            },




            onSelectionChange: function (oEvent) {
                var selectedItems = oEvent.getParameter("listItems"); // Get the currently selected items
                var that = this;

                // Initialize selectedProductIDs array if it doesn't exist
                if (!that.selectedProductIDs) {
                    that.selectedProductIDs = [];
                }

                // Clear the current selection array to avoid duplicates
                var currentSelectedIDs = that.selectedProductIDs.slice();

                // Loop through selected items to update selectedProductIDs array
                selectedItems.forEach(function (item) {
                    var productData = item.getBindingContext() ? item.getBindingContext().getObject() : null;

                    // Check if productData and PRODUCT_ID exist
                    if (productData && productData.PRODUCT_ID) {
                        var productID = productData.PRODUCT_ID; // Store PRODUCT_ID for easier reference
                        var productIndex = currentSelectedIDs.indexOf(productID);

                        if (item.isSelected()) {
                            // If it's selected and not already in the list, add it
                            if (productIndex === -1) {
                                that.selectedProductIDs.push(productID);
                            }
                        } else {
                            // If it's deselected, remove it from the list
                            if (productIndex > -1) {
                                currentSelectedIDs.splice(productIndex, 1);
                                // Update the selectedProductIDs to reflect the deselection
                                that.selectedProductIDs = currentSelectedIDs;
                            }
                        }
                    }
                });

                console.log("Selected Products: ", this.selectedProductIDs); // Debugging
            },

            _reapplySelection: function () {
                var table = this.byId("availableProductsTable");

                // Clear current selections before reapplying
                table.removeSelections(true);

                // Ensure selectedProductIDs is initialized
                if (!this.selectedProductIDs) {
                    this.selectedProductIDs = [];
                }

                // Reapply the selections using the persistent selectedProductIDs array
                table.getItems().forEach(function (item) {
                    var productData = item.getBindingContext() ? item.getBindingContext().getObject() : null;

                    // Check if the PRODUCT_ID exists and if it's in the selectedProductIDs array
                    if (productData && productData.PRODUCT_ID && this.selectedProductIDs.includes(productData.PRODUCT_ID)) {
                        item.setSelected(true); // Select the item if it was previously selected
                    }
                }.bind(this)); // Ensure `this` refers to the correct context
            },

            onSearch: function (oEvent) {
                var that = this;
                //  that._originalProducts =[];

                var availableProductsModel = that.byId("availableProductsTable").getModel();
                var query = oEvent.getParameter("value"); // Get the search query
                var table = that.byId("availableProductsTable"); // Reference to the table

                // Get the currently selected items' product IDs
                var selectedItems = table.getSelectedItems().map(function (item) {
                    var productData = item.getBindingContext() ? item.getBindingContext().getObject() : null;
                    return productData ? productData.PRODUCT_ID : null;
                }).filter(function (id) {
                    return id !== null; // Filter out null values to avoid issues with undefined IDs
                });

                // Check if the original unfiltered data is stored, if not, store it
                //   that._originalProducts = []
                if (!that._originalProducts) {
                    that._originalProducts = availableProductsModel.getData().products.slice(); // Store a copy of original data
                }

                if (query === "") {
                    sap.ui.core.BusyIndicator.show();
                    // If the search query is cleared, restore the original data
                    availableProductsModel.setData({ products: that._originalProducts });

                    // Reapply selections after restoring original data
                    that._reapplySelection();
                    sap.ui.core.BusyIndicator.hide();
                } else {
                    var products = that._originalProducts; // Use original data for filtering

                    // Filter products based on the search query
                    var filteredProducts = products.filter(function (product) {
                        return product.PROD_DESC.toLowerCase().includes(query.toLowerCase()) ||
                            product.PRODUCT_ID.toLowerCase().includes(query.toLowerCase());
                    });

                    // Update the model with the filtered data
                    availableProductsModel.setData({ products: filteredProducts });

                    // Reapply selections on filtered data
                    that._reapplySelection();
                }
            },

            handleShowSelect: function (oEvent) {
                var toolbar = oEvent.getSource();
                if (toolbar.getText() === "Show Selected") {
                    manageTableData(toolbar, toolbar.getText());
                    toolbar.setText("Show All");
                } else {
                    manageTableData(toolbar, toolbar.getText());
                    toolbar.setText("Show Selected");
                }

                function manageTableData(params, key) {
                    var table = params.getParent().getParent();
                    var items = table.getItems(); // Get all items in the table
                    if (key === "Show Selected") {
                        // Filter items to show only selected
                        items.forEach(function (item) {
                            if (!item.isSelected()) {
                                item.setVisible(false); // Hide unselected items
                            } else {
                                item.setVisible(true); // Show selected items
                            }
                        });
                    } else {
                        // Show all items
                        items.forEach(function (item) {
                            item.setVisible(true); // Show all items
                        });
                    }
                }
            },

            // onSelectionChange: function (oEvent) {
            //     var table = that.byId("availableProductsTable"); // Reference to the table
            //     var selectedItems = table.getSelectedItems(); // Get all currently selected items
            //     var selectedProducts = [];

            //     // Loop through each selected item to extract the product details
            //     selectedItems.forEach(function (item) {
            //         var context = item.getBindingContext(); // Get the context for each item
            //         var productData = context.getObject(); // Get the product data from the context
            //         selectedProducts.push(productData); // Add to the selected products array
            //     });

            //     // Store the selected products in the array
            //     that.selectedProductsArray = selectedProducts;

            // },

            // onSelectionChange: function (oEvent) {
            //     var selectedItems = oEvent.getParameter("listItems"); // Get the currently selected items
            //     var that = this;

            //     selectedItems.forEach(function (item) {
            //         var productData = item.getBindingContext().getObject();

            //         // Check if the product is already in the selected list
            //         var productIndex = that.selectedProductIDs.indexOf(productData.PRODUCT_ID);

            //         if (item.isSelected()) {
            //             // If it's selected and not already in the list, add it
            //             if (productIndex === -1) {
            //                 that.selectedProductIDs.push(productData.PRODUCT_ID);
            //             }
            //         } else {
            //             // If it's deselected, remove it from the list
            //             if (productIndex > -1) {
            //                 that.selectedProductIDs.splice(productIndex, 1);
            //             }
            //         }
            //         that.selectedProductsArray = that.selectedProductIDs;
            //     });

            //  //   console.log("Selected Products: ", this.selectedProductIDs); // Debugging
            // },



            onSelectAll: function (oEvent) {
                var that = this;
                var selected = oEvent.getParameter("selected");
                var availableProductsModel = that.byId("availableProductsTable").getModel();
                var selectedModel = that.byId("selectedProductsTable").getModel();

                var products = availableProductsModel.getData().products;
                var selectedProducts = selectedModel.getData().selectedProducts || [];

                if (selected) {
                    // Select all products
                    products.forEach(function (product) {
                        product.PRODUCT_SELECTED = true;
                        // Add to selected products if not already added
                        if (!selectedProducts.some(item => item.PRODUCT_ID === product.PRODUCT_ID)) {
                            selectedProducts.push(product);
                        }
                    });
                } else {
                    // Deselect all products
                    products.forEach(function (product) {
                        product.PRODUCT_SELECTED = false;
                    });
                    selectedProducts = []; // Clear selected products
                }

                // Update models
                availableProductsModel.setData({ products: products });
                selectedModel.setData({ selectedProducts: selectedProducts });
                var oCrt = selectedModel.getData().selectedProducts
                that.oCreate = that.removeDuplicates(oCrt, 'PRODUCT_ID');
            },

            forProduct: function () {
                var that = this;
                var dModel = new sap.ui.model.json.JSONModel(); // Model for available products
                var selectedModel = new sap.ui.model.json.JSONModel(); // Model for selected products

                var sPlanningLocation = that.byId("pln").getValue();
                var sFactoryLocation = that.byId("fct").getValue();
                var sDemandLocation = that.byId("dem").getTokens();

                // Check if no demand locations are provided
                if (sDemandLocation.length === 0 || !sPlanningLocation || !sFactoryLocation) {
                    dModel.setData({ products: [] });
                    selectedModel.setData({ selectedProducts: [] });
                    return;
                }

                // Prepare array of demand locations
                var demandLocations = sDemandLocation.map(function (token) {
                    return token.getText();
                });

                var data = [];
                // data.push(demandLocations);
                data.push(sPlanningLocation);
                data.push(sFactoryLocation);

                demandLocations.forEach(el => {
                    data.push(el);

                });

                // Fetch previously selected products from the model
                var existingSelectedProducts = selectedModel.getData().selectedProducts || [];
                sap.ui.core.BusyIndicator.show();
                // Step 1: Fetch products for demand locations
                that.oModel.callFunction("/getPartialProdbyLocation", {
                    urlParameters: {
                        Flag: "X",

                        LOCATION_ID: JSON.stringify(data)
                    },
                    success: function (oDemandData) {
                        var demandData = JSON.parse(oDemandData.getPartialProdbyLocation);
                        that.totalProd = demandData;
                        sap.ui.core.BusyIndicator.hide();

                        // If no products from demand, clear the models
                        if (demandData.length === 0) {
                            dModel.setData({ products: [] });
                            selectedModel.setData({ selectedProducts: [] });
                            return;
                        } else {
                            var DemdLoc = [];
                            demandLocations.forEach(ele => {
                                var temp = that.totalProd.filter(el => el.LOCATION_ID === ele);
                                DemdLoc = DemdLoc.concat(temp);
                            });

                            var ProdData = [];
                            DemdLoc.forEach(e => {
                                var planIndex = that.totalProd.findIndex(obj => obj.LOCATION_ID === sPlanningLocation &&
                                    obj.PRODUCT_ID === e.PRODUCT_ID);

                                var factIndex = that.totalProd.findIndex(obj => obj.LOCATION_ID === sFactoryLocation &&
                                    obj.PRODUCT_ID === e.PRODUCT_ID);

                                if (planIndex !== -1 && factIndex !== -1) {
                                    ProdData.push(e);
                                }
                            });

                            // DemdLoc.forEach(e => {
                            //     var planIndex = that.totalProd.findIndex(obj => obj.PRODUCT_ID === e.PRODUCT_ID);

                            //     var factIndex = that.totalProd.findIndex(obj => obj.PRODUCT_ID === e.PRODUCT_ID);

                            //     if (planIndex !== -1 && factIndex !== -1) {
                            //         ProdData.push(e);
                            //     }
                            // });

                            // var oExistingProds = that.oGModel.getProperty("/oAllData")

                            var oExistingProds = that.oGModel.getProperty("/oAllData");

                            // Create Set of existing IDs
                            var oExistingIds = new Set(
                                oExistingProds.map(function (oItem) {
                                    return oItem.PRODUCT_ID;
                                })
                            );

                            // Filter efficiently
                            var aFilteredProducts = ProdData.filter(function (oProd) {
                                return !oExistingIds.has(oProd.PRODUCT_ID);
                            });

                            // Set data
                            dModel.setData({
                                products: aFilteredProducts
                            });

                            // Set data for available products table
                            // dModel.setData({
                            //     products: ProdData
                            // });

                            // Set the models on the table
                            that.byId("availableProductsTable").setModel(dModel);

                        }


                    },
                    error: function (oError) {
                        console.error("Error fetching demand location products", oError);
                    }
                });
            },


            onProductSelect: function (oEvent) {
                var that = this;
                var selected = oEvent.getSource().getSelected();
                var productData = oEvent.getSource().getBindingContext().getObject();
                var availableProductsModel = that.byId("availableProductsTable").getModel();
                var selectedModel = that.byId("selectedProductsTable").getModel();

                if (selected) {
                    that._addToSelectedProducts(productData, selectedModel);
                } else {
                    that._removeFromSelectedProducts(productData, selectedModel);
                }

                // Check if all products are selected
                var products = availableProductsModel.getData().products;
                var allSelected = products.every(function (product) {
                    return product.PRODUCT_SELECTED === true;
                });

                // Set the "Select All" checkbox state based on whether all items are selected
                that.byId("selectAllCheckbox1").setSelected(allSelected);
            },

            removeDuplicates: function (array, propertyName) {
                return Array.from(new Set(array.map(obj => obj[propertyName]))).map(value => {
                    return array.find(obj => obj[propertyName] === value);
                });
            },


            handleSelection: function (oEv) {
                var tSelect = oEv.getParameters().selectedItems
                var prev = that.oGModel.getProperty("/TabSelect")
                var flag = that.oGModel.getProperty("/Flag");
                var oFilters = []
                var tSelect1 = []; // Initialize the array to hold selected items

                // Get the List of items
                var oList = sap.ui.getCore().byId("itemList"); // Adjust ID as needed
                var fItems = oList.getItems();

                // Collect selected items
                fItems.forEach((item) => {
                    if (item.getSelected()) {
                        tSelect1.push(item); // Push selected items to tSelect
                    }
                });


                if (prev == "Planning Location") {
                    // if (flag === "M") {
                    //     //  that.byId("floc").removeAllTokens()
                    //     tSelect.forEach((ele) => {
                    //         that.byId("pln").addToken(
                    //             new sap.m.Token({
                    //                 text: ele.getTitle(),
                    //                 key: ele.getTitle(),
                    //                 editable: false
                    //             })
                    //         );
                    //     });
                    //     //    that.byId("prod").removeAllTokens();
                    //     sap.ui.getCore().byId("oCreatePlan").setValue(ele.getTitle())
                    //  //   sap.ui.getCore().byId("oCreatePlan").setSelected(tSelect.getTilte())
                    //     that.crtfactoryDialog
                    //         .getAggregation("_dialog")
                    //         .getContent()[1]
                    //         .removeSelections();
                    //     //    prodSel = [];
                    // }
                    //     else {
                    //    sap.ui.getCore().byId("fct").removeAllTokens()
                    tSelect.forEach((ele) => {
                        that.byId("pln").setValue(ele.getTitle())
                        //  sap.ui.getCore().byId("oCreatePlan").setRememberSelections(true)
                        //   sap.ui.getCore().byId("oCreatePlan").setValue(ele.getTitle())
                    });
                    that.crtfactoryDialog
                        .getAggregation("_dialog")
                        .getContent()[1]
                        .removeSelections();
                    //    }
                    // that.onInputChange();
                }
                else if (prev == "Factory Location") {
                    // if (flag === "M") {
                    //     //    that.byId("floc").removeAllTokens()
                    //     tSelect.forEach((ele) => {
                    //         that.byId("fct").addToken(
                    //             new sap.m.Token({
                    //                 text: ele.getTitle(),
                    //                 key: ele.getTitle(),
                    //                 editable: false
                    //             })
                    //         );
                    //     });

                    // }
                    // else {
                    //  sap.ui.getCore().byId("fct").removeAllTokens()
                    tSelect.forEach((ele) => {
                        that.byId("fct").setValue(ele.getTitle())
                    });
                    that.onInputChange();

                    //    }

                }
                if (prev === "Demand Location") {
                    that.byId("dem").removeAllTokens(); // Clear tokens initially
                    if (tSelect1.length === 0) {
                        that.onDemandDialogClose();
                        that.onReset();
                        //  sap.m.MessageToast.show("Select Demand Location");

                        // // Hide the product table and wizard step when no demand locations are selected
                        // that.byId("prodt").setVisible(false);
                        // that.byId("idParameters").setVisible(false);

                        // // Clear model data
                        // var onModel = new sap.ui.model.json.JSONModel();
                        // onModel.setData({
                        //     groupedItems: []
                        // });
                        // that.byId("prodt").setModel(onModel);
                        return;
                    } else {
                        var SprodSel = [];
                        tSelect1.forEach((ele) => {
                            that.byId("dem").addToken(
                                new sap.m.Token({
                                    text: ele.getTitle(),
                                    key: ele.getTitle(),
                                    editable: false,
                                })
                            );
                            SprodSel.push(ele.getTitle());
                        });

                        // Show the product table and wizard step when demand locations are selected
                        that.byId("availableProductsTable").setVisible(true);
                        that.byId("idParameters").setVisible(true);

                        // Trigger fetching the relevant products
                        that.onInputChange();
                        that.forProduct();
                        that.onDemandDialogClose();
                    }
                }


            },

            onSelectAllToggle: function (oEvent) {
                var oCheckBox = oEvent.getSource();
                var oList = sap.ui.getCore().byId("itemList");
                var aItems = oList.getItems();
                var bSelected = oCheckBox.getSelected();

                // Toggle selection for all items based on the Select All checkbox state
                aItems.forEach(function (oItem) {
                    oItem.setSelected(bSelected);
                });
            },

            onItemSelectionChange: function (oEvent) {
                var oList = sap.ui.getCore().byId("itemList");
                var aItems = oList.getItems();
                var oSelectAllCheckbox = sap.ui.getCore().byId("selectAllCheckbox");

                // Check if any item is deselected
                var allSelected = aItems.every(function (oItem) {
                    return oItem.getSelected();
                });

                // If not all items are selected, uncheck the "Select All" checkbox
                oSelectAllCheckbox.setSelected(allSelected);
            },

            onReset: function () {

                var that = this;

                var oPlnInput = that.byId("pln");
                var oFctInput = that.byId("fct");
                that.byId("dem").removeAllTokens();


                if (oPlnInput) {
                    oPlnInput.setValue("");
                }
                if (oFctInput) {
                    oFctInput.setValue("");
                }


                var oWizard = that.byId("CreateWizard");
                var oFirstStep = that.byId("TempTypeStep");
                oWizard.goToStep(oFirstStep);
                oFirstStep.setValidated(false);


                oWizard.discardProgress(oFirstStep);


                var oSecondStep = that.byId("scheduleStep");
                oSecondStep.setValidated(false);


                // var oThirdStep = that.byId("idParameters");
                // //oThirdStep.setVisible(false);   // Optionally hide further steps

                var dModel = new JSONModel();
                dModel.setData({
                    groupedItems: []
                });
                that.byId("availableProductsTable").setModel(dModel);

            },

            onReset1: function () {
                var that = this;
                var oDemInput = that.byId("dem"); // Demand Location MultiInput


                if (oDemInput) {
                    oDemInput.removeAllTokens();  // Clear Demand Location tokens but keep the input visible
                }

                // Reset the wizard to the first step
                var oWizard = that.byId("CreateWizard");
                var oFirstStep = that.byId("TempTypeStep");
                var oSecondStep = that.byId("scheduleStep");
                var oThirdStep = that.byId("idParameters"); // The third step

                // Ensure the first and second steps are visible, and hide the third step
                oFirstStep.setVisible(true);
                oSecondStep.setVisible(true);
                oThirdStep.setVisible(false); // Hide the third step

                // Go to the first step of the wizard
                oWizard.goToStep(oFirstStep);
                oFirstStep.setValidated(false); // Reset validation for the first step
                oSecondStep.setValidated(false); // Reset validation for the second step
                oWizard.discardProgress(oFirstStep);
                oWizard.discardProgress(oSecondStep);

                // Ensure the wizard state reflects the current step
                oWizard.setCurrentStep(oFirstStep); // Set the current step to the first step
                oWizard.setCurrentStep(oSecondStep); // Set the current step to the first step


            },

            // onReset1: function () {
            //     var that = this;

            //     // Get references to the MultiInputs or Token components
            //     var oPlnInput = that.byId("pln"); // Planning Location
            //     var oFctInput = that.byId("fct"); // Factory Location
            //     var oDemInput = that.byId("dem"); // Demand Location (Tokens)

            //     // Clear the values of Planning Location, Factory Location, and Demand Location tokens
            //     if (oPlnInput) {
            //         oPlnInput.setValue("");  // Clear Planning Location
            //     }
            //     if (oFctInput) {
            //         oFctInput.setValue("");  // Clear Factory Location
            //     }
            //     if (oDemInput) {
            //         oDemInput.removeAllTokens();  // Clear Demand Location tokens
            //     }

            //     // Reset the wizard to the first step but prevent moving forward
            //     var oWizard = that.byId("CreateWizard");
            //     var oFirstStep = that.byId("TempTypeStep");
            //     if (oWizard && oFirstStep) {
            //         oWizard.goToStep(oFirstStep);  // Navigate to the first step
            //         oFirstStep.setValidated(false); // Reset validation for the first step
            //       //  oWizard.discardProgress(oFirstStep);  // Discard any progress made
            //     }

            //     // Prevent moving to Step 2 (scheduleStep) and hide or disable its button
            //     var oSecondStep = that.byId("scheduleStep");
            //     if (oSecondStep) {
            //         oSecondStep.setValidated(true); // Prevent navigation to Step 2
            //         // Hide the Step 2 button or disable it
            //         // var oStep2Button = that.byId("idStep2Button"); // Assuming there's a button with this ID
            //         // if (oStep2Button) {
            //         //     oStep2Button.setVisible(false); // Option 1: Hide the button
            //         //     // oStep2Button.setEnabled(false); // Option 2: Disable the button instead of hiding
            //         // }
            //     }

            //     // Reset the 'prodt' table with an empty model
            //     var dModel = new JSONModel({
            //         groupedItems: []
            //     });
            //     that.byId("prodt").setModel(dModel);  // Ensure empty data is shown

            //  //   sap.m.MessageToast.show("Filters have been reset, and Step 2 is disabled");
            // },

            onTokenUpdate: function () {
                that.onReset1();
                // this.forProduct();
            },


            onInputChange: function (oEvent) {
                var oWizard = that.byId("CreateWizard")
                var oStep = that.byId("TempTypeStep")
                var oStep1 = that.byId("scheduleStep")

                var sPlanningLocation = that.byId("pln").getValue()
                var sFactoryLocation = that.byId("fct").getValue()
                var sDemandLocation = that.byId("dem").getTokens()

                if (sPlanningLocation && sFactoryLocation) {
                    oStep.setValidated(true);
                    oStep.mAggregations._nextButton.setText("Demand Locations");
                    if (sDemandLocation.length === 0) {

                        oStep1.setValidated(false);
                        //    

                    }
                    else {
                        oStep1.setValidated(true);
                        oStep1.mAggregations._nextButton.setText("Products");
                        //  that.forProduct()
                    }
                }

            },

            onSave: function (oEv) {
                var updatedDetails = {};
                var updatedArray = [];
                var newDetails = {};
                var newArray = [];
                var pLocation = that.byId("pln").getValue();
                var fLocation = that.byId("fct").getValue();
                var oDmdLocation = []
                var sProduct = [];
                var dLocation = that.byId("dem").getTokens();
                var sPlanningLocation = that.byId("pln").getValue();
                var sFactoryLocation = that.byId("fct").getValue();

                for (var i = 0; i < dLocation.length; i++) {
                    oDmdLocation.push(dLocation[i].getText())
                }

                var sProduct = that.selectedProductIDs;
                var Array = [];

                // Usage
                if (dLocation && pLocation && fLocation && sProduct != undefined) {
                    for (var p = 0; p < sProduct.length; p++) {
                        for (var i = 0; i < dLocation.length; i++) {
                            // oDmdLocation.push(dLocation[i].getText());
                            var data = that.totalProd.filter(item => item.LOCATION_ID === dLocation[i].getText() &&
                                item.PRODUCT_ID === sProduct[p]);
                            var planIndex = that.totalProd.findIndex(obj => obj.LOCATION_ID === sPlanningLocation &&
                                obj.PRODUCT_ID === sProduct[p]);
                            var factIndex = that.totalProd.findIndex(obj => obj.LOCATION_ID === sFactoryLocation &&
                                obj.PRODUCT_ID === sProduct[p]);

                            if (data.length > 0 && planIndex !== -1 && factIndex !== -1) {
                                var obj = {
                                    LOCATION_ID: dLocation[i].getText(),
                                    PRODUCT_ID: sProduct[p],
                                    PLAN_LOC: sPlanningLocation,
                                    FACTORY_LOC: sFactoryLocation
                                }
                                Array.push(obj);
                            }
                        }
                    }
                    var oGetData = that.oGModel.getProperty("/oAllData")
                    var isDuplicateFound = false;

                    for (var i = 0; i < Array.length; i++) {
                        var newItem = Array[i];

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
                    sap.ui.core.BusyIndicator.show();
                    that.oModel.callFunction("/createProductBatch", {
                        method: "GET",
                        urlParameters: {
                            Flag: "C",
                            PRODATA: JSON.stringify(Array)
                        },
                        success: function (oData) {
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageToast.show(oData.createProductBatch);
                            if (oData.createProductBatch.includes("exists")) {

                            } else {
                                sap.ui.core.BusyIndicator.hide();
                                that.onBack();
                            }

                        },
                        error: function (error) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Failed to create data");
                        },
                    });
                    // }
                }
                else {
                    MessageToast.show("Please fill in all details");
                }
                //  }
            },

            // onSave1 name changes to onExcelSave
            onExcelSave: function (oEv) {
                that.oModel.callFunction("/createProductBatch", {
                    method: "GET",
                    urlParameters: {
                        Flag: "C",
                        PRODATA: JSON.stringify(that.ExcelData)
                    },
                    success: function (oData) {
                        sap.m.MessageToast.show(oData.createProductBatch);
                        that.closeErrorlogs();
                        that.onBack();
                    },
                    error: function (error) {
                        MessageToast.show("Failed to create data");
                    },
                });
                //     } 
                //     else {
                //         if (oDmdLocation && pLocation && fLocation && sProduct.length > 0) {
                //             //   var table = that.byId("orderList")
                //             //   var tableItems = table.getItems();
                //             for (var d = 0; d < oDmdLocation.length; d++) {
                //                 for (var k = 0; k < sProduct.length; k++) {
                //                     newDetails = {
                //                         LOCATION_ID: dLocation[d].getText(),
                //                         PRODUCT_ID: sProduct[k].PRODUCT_ID,
                //                         LOCATION_ID: pLocation,
                //                         LOCATION_ID: fLocation
                //                     }
                //                     newArray.push(newDetails);
                //                 }
                //             }

                //             if (newArray.length === 0) {
                //                 if (that._createDialog) {
                //                     that._createDialog.close();
                //                     that._createDialog.destroy(true);
                //                     that._createDialog = null;
                //                 }
                //                 sap.m.MessageToast.show("Selected Locations and Product already exists.");
                //             }
                //             else {
                //                 that.oModel.callFunction("/createProductBatch", {
                //                     method: "GET",
                //                     urlParameters: {
                //                         Flag: "C",
                //                         PRODATA: JSON.stringify(newArray)
                //                     },
                //                     success: function (oData) {
                //                         sap.m.MessageToast.show(oData.createProductBatch);
                //                         //     that.onCancel();
                //                         //  that.onGetData();
                //                         // that.onclear();
                //                         // that.onResetData();

                //                     },
                //                     error: function (error) {
                //                         MessageToast.show("Failed to create data");
                //                     },
                //                 });
                //             }
                //         }
                //         else {
                //             MessageToast.show("Please fill in all details");
                //         }
                // }
            },

            // onSave1: function (oEv) {
            //     var that = this;
            //     var batchSize = 1000; // Set a manageable batch size
            //     var dataChunks = [];

            //     // Function to chunk the data into batches
            //     function chunkArray(array, size) {
            //         for (let i = 0; i < array.length; i += size) {
            //             dataChunks.push(array.slice(i, i + size));
            //         }
            //     }

            //     // Call the chunking function with the large data
            //     chunkArray(that.oSuccess, batchSize);

            //     // Recursive function to process each chunk
            //     function processBatch(batchIndex) {
            //         if (batchIndex < dataChunks.length) {
            //             that.oModel.callFunction("/createProductBatch", {
            //                 method: "GET",
            //                 urlParameters: {
            //                     Flag: "C",
            //                     PRODATA: JSON.stringify(dataChunks[batchIndex]) // Send the current batch
            //                 },
            //                 success: function (oData) {
            //                     sap.m.MessageToast.show("Batch " + (batchIndex + 1) + " processed successfully");
            //                     // Process the next batch
            //                     processBatch(batchIndex + 1);
            //                 },
            //                 error: function (error) {
            //                     sap.m.MessageToast.show("Failed to process batch " + (batchIndex + 1));
            //                 }
            //             });
            //         } else {
            //             // All batches are processed
            //             sap.m.MessageToast.show("All data processed successfully");
            //             that.closeErrorlogs();
            //         //    that.onBack();
            //         }
            //     }

            //     // Start processing the first batch
            //     processBatch(0);
            // },


            downloadTemplate: function () {
                var aCols, oSettings, oSheet, ofileName = 'Planning Configuration.xlsx';

                aCols = that.createStaticColumns(); // Creating static columns

                // Creating empty row in Excel for dataSource or SAP will throw a warning for empty DataSource
                var aRowData = [{
                    "PLAN_LOC": '',
                    "FACTORY_LOC": '',
                    "DEMAND_LOC": '',
                    "PRODUCT_ID": ''
                }];

                oSettings = {
                    workbook: {
                        columns: aCols,
                        context: {
                            sheetName: 'Sheet1'
                        }
                    },
                    dataSource: aRowData,
                    fileName: ofileName
                };

                // Create an instance of Spreadsheet and export data
                if (oSettings.dataSource.length > 0) {
                    oSheet = new sap.ui.export.Spreadsheet(oSettings);

                    // Use the 'download' method to trigger the download
                    oSheet.build().finally(function () {
                        that.closeTemplate();
                    });
                }
            },

            createStaticColumns: function () {
                return [{
                    label: 'PLAN_LOC',
                    property: 'PLAN_LOC',
                    width: 12
                },
                {
                    label: 'FACTORY_LOC',
                    property: 'FACTORY_LOC',
                    textAlign: 'right',
                    width: 12
                },
                {
                    label: 'DEMAND_LOC',
                    property: 'DEMAND_LOC',
                    width: 12
                },
                {
                    label: 'PRODUCT_ID',
                    property: 'PRODUCT_ID',
                    textAlign: 'right',
                    type: "number",
                    width: 12
                },
                ]
            },

            uploadData: function (oEvent) {
                var oFileUploader = oEvent.getSource();
                var oFile = oEvent.getParameter("files")[0];

                if (oFile) {
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        var data = e.target.result;
                        var workbook = XLSX.read(data, { type: 'binary' });
                        var firstSheetName = workbook.SheetNames[0];
                        var worksheet = workbook.Sheets[firstSheetName];
                        var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                        // Process the JSON data
                        that.processExcelData(jsonData);
                    };

                    reader.readAsBinaryString(oFile);
                }
                // sap.ui.getCore().byId("valid").setSelected(true)
                sap.ui.getCore().byId("iconTabBar").setSelectedKey("validTab")
                sap.ui.getCore().byId("iconTabBar").setSelectedKey("invalidTab")


            },

            onTabSelect: function () {
                if (sap.ui.getCore().byId("iconTabBar").getSelectedKey() === "invalidTab") {
                    sap.ui.getCore().byId("oExcelSave").setVisible(false) // Show the button for 'Valid' tab
                } else {
                    sap.ui.getCore().byId("oExcelSave").setVisible(true) // Hide the button for other tabs
                }
            },

            processExcelData: function (aData) {

                var aHeaders = aData[0];
                var aRows = aData.slice(1);

                var resultArray1 = aRows.map(function (aRow) {
                    var oObject = {};
                    aHeaders.forEach(function (sHeader, i) {
                        oObject[sHeader] = aRow[i];
                    });
                    return oObject;
                }).filter(function (oObject) {
                    // Keep rows that have at least one non-empty value
                    return Object.values(oObject).some(function (value) {
                        return value !== null && value !== undefined && value !== ''; // If any value is not empty, keep the row
                    });
                });

                that.oResults = resultArray1;
                that.Opendialog();
            },

            Opendialog: function () {

                // Set the "Valid" tab as selected
                var oIconTabBar = sap.ui.getCore().byId("iconTabBar");
                oIconTabBar.setSelectedKey("validTab");

                var existingData = that.oTableData || []; // Ensure existingData is initialized
                //  that.ExcelData = that.oResults;
                that.ExcelData = [];

                for (var i = 0; i < that.oResults.length; i++) {
                    var item = {
                        PLAN_LOC: that.oResults[i].PLAN_LOC.toUpperCase(),
                        FACTORY_LOC: that.oResults[i].FACTORY_LOC.toUpperCase(),
                        LOCATION_ID: that.oResults[i].DEMAND_LOC.toUpperCase(), // Assign DEMAND_LOC to LOCATION_ID
                        PRODUCT_ID: that.oResults[i].PRODUCT_ID.toUpperCase()
                    };
                    that.ExcelData.push(item); // Push the modified object to that.ExcelData
                }

                that.Valid = [];
                that.InValid = [];

                // Iterate through ExcelData and filter valid/invalid entries
                for (var e = 0; e < that.ExcelData.length; e++) {
                    var PlanL = that.ExcelData[e].PLAN_LOC;
                    var FactL = that.ExcelData[e].FACTORY_LOC;
                    var DemadL = that.ExcelData[e].LOCATION_ID;
                    var Prod = that.ExcelData[e].PRODUCT_ID;

                    // Check in CompData for valid entries
                    var aData1 = that.CompData.filter(el => el.LOCATION_ID === PlanL && el.PRODUCT_ID === Prod);
                    var aData2 = that.CompData.filter(el => el.LOCATION_ID === FactL && el.PRODUCT_ID === Prod);
                    var aData3 = that.CompData.filter(el => el.LOCATION_ID === DemadL && el.PRODUCT_ID === Prod);

                    // Check for valid combinations
                    if (aData1.length > 0 && aData2.length > 0 && aData3.length > 0) {
                        that.Valid.push(that.ExcelData[e]);
                    } else {
                        that.InValid.push(that.ExcelData[e]); // Add to invalid
                    }
                }
                var oSuccess = [];
                var oFail = []
                for (var i = 0; i < that.Valid.length; i++) {
                    var item = {
                        PLAN_LOC: that.Valid[i].PLAN_LOC,
                        FACTORY_LOC: that.Valid[i].FACTORY_LOC,
                        DEMAND_LOC: that.Valid[i].LOCATION_ID, // Assign DEMAND_LOC to LOCATION_ID
                        PRODUCT_ID: that.Valid[i].PRODUCT_ID
                    };
                    oSuccess.push(item); // Push the modified object to that.ExcelData
                }
                for (var i = 0; i < that.InValid.length; i++) {
                    var item = {
                        PLAN_LOC: that.InValid[i].PLAN_LOC,
                        FACTORY_LOC: that.InValid[i].FACTORY_LOC,
                        DEMAND_LOC: that.InValid[i].LOCATION_ID, // Assign DEMAND_LOC to LOCATION_ID
                        PRODUCT_ID: that.InValid[i].PRODUCT_ID
                    };
                    oFail.push(item); // Push the modified object to that.ExcelData
                }

                var newData = []
                var oAllSuccess = [];

                oSuccess.forEach(function (newItem) {
                    // Check if an entry with the same properties already exists in the existingData
                    var isDuplicate = existingData.some(function (existingItem) {
                        return (
                            existingItem.PLAN_LOC === newItem.PLAN_LOC &&
                            existingItem.FACTORY_LOC === newItem.FACTORY_LOC &&
                            existingItem.DEMAND_LOC === newItem.DEMAND_LOC &&
                            existingItem.PRODUCT_ID === newItem.PRODUCT_ID
                        );
                    });

                    // If it is a duplicate, push to `failData` only
                    if (isDuplicate) {
                        oFail.push(newItem);
                    } else {
                        // If not a duplicate, push to `newData`
                        oAllSuccess.push(newItem);
                    }
                });
                var oItemSucess = [];
                for (var i = 0; i < oAllSuccess.length; i++) {
                    var item = {
                        PLAN_LOC: oAllSuccess[i].PLAN_LOC,
                        FACTORY_LOC: oAllSuccess[i].FACTORY_LOC,
                        DEMAND_LOC: oAllSuccess[i].DEMAND_LOC, // Assign DEMAND_LOC to LOCATION_ID
                        PRODUCT_ID: oAllSuccess[i].PRODUCT_ID
                    };
                    oItemSucess.push(item); // Push the modified object to that.ExcelData
                }

                // Set models for unique and duplicate data tables
                var oTabModel = new sap.ui.model.json.JSONModel({ uniqueArray: oItemSucess });

                var oFinalsucess = []
                for (var i = 0; i < oItemSucess.length; i++) {
                    var item = {
                        PLAN_LOC: oItemSucess[i].PLAN_LOC,
                        FACTORY_LOC: oItemSucess[i].FACTORY_LOC,
                        LOCATION_ID: oItemSucess[i].DEMAND_LOC, // Assign DEMAND_LOC to LOCATION_ID
                        PRODUCT_ID: oItemSucess[i].PRODUCT_ID
                    };
                    oFinalsucess.push(item); // Push the modified object to that.ExcelData
                }
                that.uploadData = oFinalsucess
                var oTabModel1 = new sap.ui.model.json.JSONModel({ duplicatesArray: oFail });

                if (oItemSucess.length > 0) {
                    that.onTabSelect();
                } else {
                    sap.ui.getCore().byId("oExcelSave").setVisible(false)
                }

                if (!that.successerrorDialog) {
                    that.successerrorDialog = sap.ui.xmlfragment("vcpapp.vcpplanningapps1.view.successerrorDialog", this);
                    that.getView().addDependent(that.successerrorDialog);
                }

                // Set models for the success and error tables
                sap.ui.getCore().byId("uniqueSuccessTable").setModel(oTabModel);
                sap.ui.getCore().byId("uniqueSuccessTable").setGrowing(true); // Enable growing
                sap.ui.getCore().byId("uniqueSuccessTable").setGrowingThreshold(1000); // Load 1000 rows at a time

                sap.ui.getCore().byId("uniqueErrorTable").setModel(oTabModel1);
                sap.ui.getCore().byId("uniqueErrorTable").setGrowing(true); // Enable growing
                sap.ui.getCore().byId("uniqueErrorTable").setGrowingThreshold(1000); // Load 1000 rows at a time

                if (this.successerrorDialog) {
                    //    console.log("Opening dialog...");
                    this.successerrorDialog.open();
                } else {
                    console.log("Dialog is not initialized.");
                }
            },

            onHelpPress: function () {
                that.help = new JSONModel();
                that.help.setData({ results: that.CronValueTypes });
                sap.ui.getCore().byId("idCronValues").setModel(that.help);
                that._valueHelpDialog.open();

            },

            closeErrorlogs: function () {
                var oTabModel = new sap.ui.model.json.JSONModel({ uniqueArray: [] });
                var oTabModel1 = new sap.ui.model.json.JSONModel({ duplicatesArray: [] });

                sap.ui.getCore().byId("uniqueSuccessTable").setModel(oTabModel);
                sap.ui.getCore().byId("uniqueErrorTable").setModel(oTabModel1);
                this.successerrorDialog.close();
            },

            onCloseHelp: function () {
                that._valueHelpDialog.close();
            },

            /**
             * Called when 'Close/Cancel' button in any dialog is pressed.
             * Dialogs will be closed based on sId.
             * @param {object} oEvent -the event information.
             */
            handleClose: function (oEvent) {
                var sId = oEvent.getParameter("id");
                // Location Dialog
                // Location Dialog
                if (sId.includes("MFL")) {
                    that._oCore
                        .byId(this._valueHelpDialogMFL.getId() + "-searchField")
                        .setValue("");
                    if (that.oMFLocList.getBinding("items")) {
                        that.oMFLocList.getBinding("items").filter([]);
                    }
                    // Location Dialog
                } else if (sId.includes("Loc")) {
                    that._oCore
                        .byId(this._valueHelpDialogLoc.getId() + "-searchField")
                        .setValue("");
                    if (that.oLocList.getBinding("items")) {
                        that.oLocList.getBinding("items").filter([]);
                    }
                    // Product Dialog
                } else if (sId.includes("prod")) {
                    that._oCore
                        .byId(this._valueHelpDialogProd.getId() + "-searchField")
                        .setValue("");
                    if (that.oProdList.getBinding("items")) {
                        that.oProdList.getBinding("items").filter([]);
                    }
                    // Version Dialog
                } else if (sId.includes("Ver")) {
                    that._oCore
                        .byId(this._valueHelpDialogVer.getId() + "-searchField")
                        .setValue("");
                    if (that.oVerList.getBinding("items")) {
                        that.oVerList.getBinding("items").filter([]);
                    }
                    // Scenario Dalog
                } else if (sId.includes("scen")) {
                    that._oCore
                        .byId(this._valueHelpDialogScen.getId() + "-searchField")
                        .setValue("");
                    if (that.oScenList.getBinding("items")) {
                        that.oScenList.getBinding("items").filter([]);
                    }
                    // Prediction Profile Dalog
                } else if (sId.includes("ppfSlctList")) {
                    that._oCore
                        .byId(this._valueHelpDialogPPF.getId() + "-searchField")
                        .setValue("");
                    if (that.oPPFList.getBinding("items")) {
                        that.oPPFList.getBinding("items").filter([]);
                    }
                } else if (sId.includes("TempSlctList")) {
                    that._oCore
                        .byId(this._templateDialog.getId() + "-searchField")
                        .setValue("");
                    if (sap.ui.getCore().byId("TempSlctListJSS").getBinding("items")) {
                        sap.ui.getCore().byId("TempSlctListJSS").getBinding("items").filter([]);
                    }
                } else if (sId.includes("ClassSlctList")) {
                    that._oCore
                        .byId(this._valueHelpDialogClassDetails.getId() + "-searchField")
                        .setValue("");
                    if (that.oClassList.getBinding("items")) {
                        that.oClassList.getBinding("items").filter([]);
                    }
                } else if (sId.includes("CustGroupSlctList")) {
                    that._oCore
                        .byId(this._valueHelpDialogCustGroup.getId() + "-searchField")
                        .setValue("");
                    if (that.oCustGroupList.getBinding("items")) {
                        that.oCustGroupList.getBinding("items").filter([]);
                    }
                }
            },
            onPressBrowse: function (oEvent) {
                that.byId("FileUploaderId").openFilePicker(oEvent);
                that.byId("FileUploaderId").oBrowse.firePress(oEvent);

            }

            //working good
            // onProductSelect: function (oEvent) {
            //     var that = this;
            //     var selected = oEvent.getSource().getSelected();
            //     var productData = oEvent.getSource().getBindingContext().getObject();
            //     var selectedModel = that.byId("selectedProductsTable").getModel();

            //     if (selected) {
            //         that._addToSelectedProducts(productData, selectedModel);
            //     } else {
            //         that._removeFromSelectedProducts(productData, selectedModel);
            //     }
            // },


            // onProductSelect: function (oEvent) {
            //     var that = this;
            //     var selected = oEvent.getSource().getSelected();
            //     var productData = oEvent.getSource().getBindingContext().getObject();
            //     var selectedModel = that.byId("selectedProductsTable").getModel();

            //     if (selected) {
            //         // Add the selected product to the selected products model
            //         that._addToSelectedProducts(productData, selectedModel);
            //     } else {
            //         // Remove the product from the selected products model
            //         that._removeFromSelectedProducts(productData, selectedModel);
            //     }
            // },

            // _addToSelectedProducts: function (productData, selectedModel) {
            //     that.oCreate = [];
            //     var selectedProducts = selectedModel.getData().selectedProducts || [];

            //     if (!selectedProducts.some(item => item.PRODUCT_ID === productData.PRODUCT_ID)) {
            //         selectedProducts.push(productData);
            //     }

            //     selectedModel.setData({ selectedProducts: selectedProducts });
            //     that.oCreate = selectedModel.getData().selectedProducts
            //     //that.oCreate = that.removeDuplicates(oCrt, 'PRODUCT_ID');
            // },

            // _removeFromSelectedProducts: function (productData, selectedModel) {
            //     var selectedProducts = selectedModel.getData().selectedProducts || [];

            //     selectedProducts = selectedProducts.filter(function (item) {
            //         return item.PRODUCT_ID !== productData.PRODUCT_ID;
            //     });

            //     selectedModel.setData({ selectedProducts: selectedProducts });
            // },



            // _addToSelectedProducts: function (productData, selectedModel) {
            //     var selectedProducts = selectedModel.getData().selectedProducts || [];
            //     selectedProducts.push(productData);
            //     selectedModel.setData({ selectedProducts: selectedProducts });
            // },

            // _removeFromSelectedProducts: function (productData, selectedModel) {
            //     var selectedProducts = selectedModel.getData().selectedProducts || [];
            //     selectedProducts = selectedProducts.filter(function (item) {
            //         return item.PRODUCT_ID !== productData.PRODUCT_ID;
            //     });
            //     selectedModel.setData({ selectedProducts: selectedProducts });
            // },



            // forProduct: function () {
            //     var that = this;
            //     var dModel = new sap.ui.model.json.JSONModel(); // Model for first table
            //     var selectedModel = new sap.ui.model.json.JSONModel(); // Model for second table (selected items)
            //     var oFilters = []; // Add your filters here, if needed

            //     var sPlanningLocation = that.byId("pln").getValue();
            //     var sFactoryLocation = that.byId("fct").getValue();
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     if (sDemandLocation.length === 0) {
            //         dModel.setData({ products: [] });
            //         selectedModel.setData({ selectedProducts: [] }); // Clear selected products if no demand location
            //         that.byId("prodt").removeAllItems(); // Clear any existing items
            //         return;
            //     }

            //     var Locations = [];
            //     for (var i = 0; i < sDemandLocation.length; i++) {
            //         Locations.push(sDemandLocation[i].getText());
            //     }

            //  //   var LOCATION_ID = '["MFCN","1510","1520"]'; // Update this with dynamic data

            //     that.oModel.callFunction("/getPartialProdbyLocation", {
            //         urlParameters: {
            //             LOCATION_ID: JSON.stringify(Locations) // Send correct location IDs to backend
            //         },
            //         success: function (oData) {
            //           //  console.log("Fetched Data: ", oData);
            //             var parsedData = JSON.parse(oData.getPartialProdbyLocation);

            //             var productsData = parsedData.map(function (item) {
            //                 return {
            //                     PRODUCT_ID: item.PRODUCT_ID,
            //                     PROD_DESC: item.PROD_DESC,
            //                     PRODUCT_SELECTED: false
            //                 };
            //             });

            //             // Set data for first table
            //             dModel.setData({
            //                 products: productsData
            //             });


            //             selectedModel.setData({
            //                 selectedProducts: []
            //             });

            //             // First table for products
            //             var oTable1 = new sap.m.Table({
            //                 width: "100%",
            //                 growing: true,
            //                 columns: [
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Select" }),
            //                         width: "10%"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product Description" }),
            //                         width: "30%"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product ID" }),
            //                         width: "35%"
            //                     })
            //                 ]
            //             });

            //             oTable1.bindItems({
            //                 path: "/products",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.CheckBox({
            //                             selected: "{PRODUCT_SELECTED}",
            //                             select: function (oEvent) {
            //                                 // Handle selection logic
            //                                 var selected = oEvent.getSource().getSelected();
            //                                 var productData = oEvent.getSource().getBindingContext().getObject();

            //                                 if (selected) {
            //                                     that._addToSelectedProducts(productData, selectedModel);
            //                                 } else {
            //                                     that._removeFromSelectedProducts(productData, selectedModel);
            //                                 }
            //                             }
            //                         }),
            //                         new sap.m.Text({ text: "{PROD_DESC}" }),
            //                         new sap.m.Text({ text: "{PRODUCT_ID}" })
            //                     ]
            //                 })
            //             });

            //             // Second table for selected products
            //             var oTable2 = new sap.m.Table({
            //                 width: "100%",
            //                 growing: true,
            //                 columns: [
            //                     new sap.m.Column({ header: new sap.m.Text({ text: " Product Description" }) }),
            //                     new sap.m.Column({ header: new sap.m.Text({ text: " Product ID" }) })
            //                 ]
            //             });

            //             oTable2.bindItems({
            //                 path: "/selectedProducts",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.Text({ text: "{PROD_DESC}" }),
            //                         new sap.m.Text({ text: "{PRODUCT_ID}" })
            //                     ]
            //                 })
            //             });

            //             // Remove existing items in the VBox and add the two tables side by side (HBox)
            //             var oContainer = that.byId("prodt");
            //             oContainer.removeAllItems(); // Clear previous data if any

            //             var oHBox = new sap.m.HBox({
            //                 items: [oTable1, oTable2] // Add both tables to the HBox
            //             });

            //             oContainer.addItem(oHBox); // Add the HBox to the VBox

            //             // Bind the models to respective tables
            //             that.byId("prodt").setModel(dModel); // First table data model
            //             oTable2.setModel(selectedModel);     // Second table selected data model

            //         },
            //         error: function (oError) {
            //             console.error("Error fetching product data", oError);
            //         }
            //     });
            // },


            // forProduct: function () {
            //     var that = this;
            //     var dModel = new sap.ui.model.json.JSONModel(); // Model for first table
            //     var selectedModel = new sap.ui.model.json.JSONModel(); // Model for second table (selected items)

            //     var itemsPerPage = 500; // Number of items per page
            //     var currentPage = 1;    // Current page for pagination
            //     var allProducts = [];   // Will store all fetched products

            //     // Add necessary filters for callFunction (similar to earlier code)

            //     that.oModel.callFunction("/getPartialProdbyLocation", {
            //         urlParameters: {
            //             LOCATION_ID: '["MFCN","1510","1520"]' // Example location ID
            //         },
            //         success: function (oData) {
            //             console.log("Fetched Data: ", oData);
            //             var parsedData = JSON.parse(oData.getPartialProdbyLocation);
            //             allProducts = parsedData.map(function (item) {
            //                 return {
            //                     PRODUCT_ID: item.PRODUCT_ID,
            //                     PROD_DESC: item.PROD_DESC,
            //                     PRODUCT_SELECTED: false
            //                 };
            //             });

            //             // Load the first page (500 items)
            //             that._loadNextPage(dModel, currentPage, itemsPerPage, allProducts);

            //             // Initialize empty model for selected products
            //             selectedModel.setData({ selectedProducts: [] });

            //             // First table for products
            //             var oTable1 = new sap.m.Table({
            //                 width: "50%",
            //                 growing: true,
            //                 growingThreshold: itemsPerPage,
            //                 growingScrollToLoad: true, // Enable scroll-to-load for lazy loading
            //                 columns: [
            //                     new sap.m.Column({ header: new sap.m.Text({ text: "Select" }) }),
            //                     new sap.m.Column({ header: new sap.m.Text({ text: "Product Description" }) }),
            //                     new sap.m.Column({ header: new sap.m.Text({ text: "Product ID" }) })
            //                 ]
            //             });

            //             oTable1.bindItems({
            //                 path: "/products",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.CheckBox({
            //                             selected: "{PRODUCT_SELECTED}",
            //                             select: function (oEvent) {
            //                                 var selected = oEvent.getSource().getSelected();
            //                                 var productData = oEvent.getSource().getBindingContext().getObject();

            //                                 if (selected) {
            //                                     that._addToSelectedProducts(productData, selectedModel);
            //                                 } else {
            //                                     that._removeFromSelectedProducts(productData, selectedModel);
            //                                 }
            //                             }
            //                         }),
            //                         new sap.m.Text({ text: "{PROD_DESC}" }),
            //                         new sap.m.Text({ text: "{PRODUCT_ID}" })
            //                     ]
            //                 })
            //             });

            //             // Second table for selected products
            //             var oTable2 = new sap.m.Table({
            //                 width: "50%",
            //                 growing: true,
            //                 growingThreshold: itemsPerPage,
            //                 columns: [
            //                     new sap.m.Column({ header: new sap.m.Text({ text: "Selected Product Description" }) }),
            //                     new sap.m.Column({ header: new sap.m.Text({ text: "Selected Product ID" }) })
            //                 ]
            //             });

            //             oTable2.bindItems({
            //                 path: "/selectedProducts",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.Text({ text: "{PROD_DESC}" }),
            //                         new sap.m.Text({ text: "{PRODUCT_ID}" })
            //                     ]
            //                 })
            //             });

            //             // Add tables to the VBox (side by side)
            //             var oContainer = that.byId("prodt");
            //             oContainer.removeAllItems();

            //             var oHBox = new sap.m.HBox({
            //                 items: [oTable1, oTable2]
            //             });

            //             oContainer.addItem(oHBox);

            //             // Bind the models
            //             that.byId("prodt").setModel(dModel);  // First table data model
            //             oTable2.setModel(selectedModel);      // Second table selected data model

            //             // Load more items on scroll or dot-click
            //             oTable1.attachGrowingStarted(function () {
            //                 currentPage++;
            //                 that._loadNextPage(dModel, currentPage, itemsPerPage, allProducts);
            //             });

            //         },
            //         error: function (oError) {
            //             console.error("Error fetching product data", oError);
            //         }
            //     });
            // },

            // _loadNextPage: function (dModel, currentPage, itemsPerPage, allProducts) {
            //     var startIndex = (currentPage - 1) * itemsPerPage;
            //     var endIndex = startIndex + itemsPerPage;
            //     var currentPageData = allProducts.slice(startIndex, endIndex);

            //     var existingData = dModel.getData().products || [];
            //     var newData = existingData.concat(currentPageData);

            //     dModel.setData({
            //         products: newData
            //     });
            // },

            // _addToSelectedProducts: function (product, selectedModel) {
            //     var selectedData = selectedModel.getData().selectedProducts;
            //     if (!selectedData.some(function (item) { return item.PRODUCT_ID === product.PRODUCT_ID; })) {
            //         selectedData.push(product); // Add selected product if not already present
            //         selectedModel.setData({ selectedProducts: selectedData });
            //     }
            // },

            // _removeFromSelectedProducts: function (product, selectedModel) {
            //     var selectedData = selectedModel.getData().selectedProducts;
            //     selectedData = selectedData.filter(function (item) {
            //         return item.PRODUCT_ID !== product.PRODUCT_ID; // Remove deselected product
            //     });
            //     selectedModel.setData({ selectedProducts: selectedData });
            // },


            // forProduct: function () {
            //     var that = this;
            //     var dModel = new sap.ui.model.json.JSONModel(); // JSON model to hold product data
            //     var oFilters = []; // Add your filters here, if needed

            //     // Get the selected values from inputs
            //     var sPlanningLocation = that.byId("pln").getValue();
            //     var sFactoryLocation = that.byId("fct").getValue();
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     if (sDemandLocation.length === 0) {
            //         dModel.setData({ products: [] });
            //         that.byId("prodt").removeAllItems(); // Clear any existing items
            //         return;
            //     }

            //     var Locations = [];
            //     for (var i = 0; i < sDemandLocation.length; i++) {
            //         Locations.push(sDemandLocation[i].getText());
            //     }

            //     var LOCATION_ID = '["MFCN","1510","1520"]'; // Update this with dynamic data, for example, from Locations array

            //     // Call your OData function
            //     that.oModel.callFunction("/getPartialProdbyLocation", {
            //         urlParameters: {
            //             LOCATION_ID: LOCATION_ID // Send the correct location IDs to the backend
            //         },
            //         success: function (oData) {
            //             console.log("Fetched Data: ", oData);
            //             var parsedData = JSON.parse(oData.getPartialProdbyLocation); // Parse the response data

            //             // Map your data to the required structure for display
            //             var productsData = parsedData.map(function (item) {
            //                 return {
            //                     PRODUCT_ID: item.PRODUCT_ID,
            //                     PROD_DESC: item.PROD_DESC,
            //                     PRODUCT_SELECTED: false // You can set default selected state if needed
            //                 };
            //             });

            //             // Set data to the model
            //             dModel.setData({
            //                 products: productsData
            //             });

            //             // Bind the model to the VBox (or HBox)
            //             that.byId("prodt").setModel(dModel);

            //             // Create the table to display the products
            //             var oTable = new sap.m.Table({
            //                 width: "50%",
            //                 outerHeight: "200px",
            //                 growing: true, // Enable growing if needed
            //                 growingScrollToLoad: false,
            //                 columns: [
            //                     new sap.m.Column({ header: new sap.m.Text({ text: "Select" }) }),
            //                     new sap.m.Column({ header: new sap.m.Text({ text: "Product Description" }) }),
            //                     new sap.m.Column({ header: new sap.m.Text({ text: "Product ID" }) })
            //                 ]
            //             });

            //             // Bind the items in the table to the products
            //             oTable.bindItems({
            //                 path: "/products", // Path to the products in the model
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.CheckBox({ selected: "{PRODUCT_SELECTED}" }), // CheckBox for selecting products
            //                         new sap.m.Text({ text: "{PROD_DESC}" }), // Product description
            //                         new sap.m.Text({ text: "{PRODUCT_ID}" }) // Product ID
            //                     ]
            //                 })
            //             });

            //             // Remove existing items in the VBox and add the table
            //             var oContainer = that.byId("prodt");
            //             oContainer.removeAllItems(); // Clear previous data if any
            //             oContainer.addItem(oTable);  // Add the new table

            //         },
            //         error: function (oError) {
            //             console.error("Error fetching product data", oError);
            //         }
            //     });
            // },


            // forProduct: function () {
            //     var that = this;
            //     var dModel = new sap.ui.model.json.JSONModel();   // Model for the first table (all products)
            //     var sModel = new sap.ui.model.json.JSONModel();   // Model for the second table (selected products)
            //     that.byId("prodt").setModel(dModel);             // Set the model for the first table
            //     that.byId("selectedProdt").setModel(sModel);     // Set the model for the second table

            //     var oFilters = [];
            //     var sPlanningLocation = that.byId("pln").getValue();
            //     var sFactoryLocation = that.byId("fct").getValue();
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     // Manage pagination parameters
            //     var iSkip = 0;  // Start with the first batch
            //     var iTop = 30;  // Number of records to load per request

            //     // If there's no demand location, reset and return
            //     if (sDemandLocation.length === 0) {
            //         dModel.setData({ products: [] });
            //         that.byId("prodt").removeAllItems();
            //         return;
            //     }

            //     var Locations = [];
            //     for (var i = 0; i < sDemandLocation.length; i++) {
            //         Locations.push(sDemandLocation[i].getText());
            //     }

            //     function isDuplicate(productId, currentProducts) {
            //         return currentProducts.some(function (product) {
            //             return product.PRODUCT_ID === productId;
            //         });
            //     }

            //     var LOCATION_ID = '["MFCN","1510","1520"]';

            //     function fetchData(iSkip, iTop, append) {
            //         that.oModel.callFunction("/getPartialProdbyLocation", {
            //             urlParameters: { LOCATION_ID: LOCATION_ID },
            //             success: function (oData) {
            //                 var oData = JSON.parse(oData.getPartialProdbyLocation);
            //                 let uProduct = oData.map(item => {
            //                     return {
            //                         PRODUCT_ID: item.PRODUCT_ID,
            //                         PROD_DESC: item.PROD_DESC,
            //                         PRODUCT_SELECTED: false
            //                     };
            //                 });

            //                 var oCurrentData = dModel.getData().products || [];
            //                 let uniqueProducts = uProduct.filter(function (newProduct) {
            //                     return !isDuplicate(newProduct.PRODUCT_ID, oCurrentData);
            //                 });

            //                 if (append) {
            //                     dModel.setData({
            //                         products: oCurrentData.concat(uniqueProducts)
            //                     });
            //                 } else {
            //                     dModel.setData({
            //                         products: uniqueProducts
            //                     });
            //                 }

            //                 iSkip += iTop;
            //             },
            //             error: function (e) {
            //                 console.error("Error fetching data", e);
            //             }
            //         });
            //     }

            //     // First Table (All Products)
            //     var oTable1 = new sap.m.Table({
            //         width: "50%",
            //         growing: true,
            //         growingThreshold: iTop,
            //         growingScrollToLoad: true,
            //         columns: [
            //             new sap.m.Column({ header: new sap.m.Text({ text: "Select" }) }),
            //             new sap.m.Column({ header: new sap.m.Text({ text: "Product Description" }) }),
            //             new sap.m.Column({ header: new sap.m.Text({ text: "Product ID" }) })
            //         ]
            //     });

            //     // Bind the items to the first table
            //     oTable1.bindItems({
            //         path: "/products",
            //         template: new sap.m.ColumnListItem({
            //             cells: [
            //                 new sap.m.CheckBox({
            //                     selected: "{PRODUCT_SELECTED}",
            //                     select: function (oEvent) {
            //                         var oContext = oEvent.getSource().getBindingContext();
            //                         var oItem = oContext.getObject();
            //                         oItem.PRODUCT_SELECTED = oEvent.getParameter("selected");

            //                         // Update the selected products table
            //                         that.updateSelectedProducts(dModel, sModel);
            //                     }
            //                 }),
            //                 new sap.m.Text({ text: "{PROD_DESC}" }),
            //                 new sap.m.Text({ text: "{PRODUCT_ID}" })
            //             ]
            //         })
            //     });

            //     // Second Table (Selected Products)
            //     var oTable2 = new sap.m.Table({
            //         width: "50%",
            //         growing: true,
            //         growingThreshold: iTop,
            //         growingScrollToLoad: true,
            //         columns: [
            //             new sap.m.Column({ header: new sap.m.Text({ text: "Selected Product Description" }) }),
            //             new sap.m.Column({ header: new sap.m.Text({ text: "Selected Product ID" }) })
            //         ]
            //     });

            //     // Bind the items to the second table (for selected products)
            //     oTable2.bindItems({
            //         path: "/selectedProducts",
            //         template: new sap.m.ColumnListItem({
            //             cells: [
            //                 new sap.m.Text({ text: "{PROD_DESC}" }),
            //                 new sap.m.Text({ text: "{PRODUCT_ID}" })
            //             ]
            //         })
            //     });

            //     // Attach the growing event to the first table
            //     oTable1.attachGrowingStarted(function () {
            //         fetchData(iSkip, iTop, true);  // Append new data when scrolling
            //     });

            //     // Set up the layout with the two tables side by side
            //     var oHBox = new sap.m.HBox({
            //         items: [oTable1, oTable2]
            //     });

            //     // Set the model and add the HBox (containing both tables) to the container
            //     var oContainer = that.byId("prodt");
            //     oContainer.removeAllItems();  // Clear existing items
            //     oHBox.setModel(dModel);       // Set model to the first table
            //     oHBox.setModel(sModel);       // Set model to the second table
            //     oContainer.addItem(oHBox);    // Add the HBox (with both tables) to the container

            //     // Fetch the initial batch of data for the first table
            //     fetchData(iSkip, iTop, false);
            // },

            // // Function to update the selected products
            // updateSelectedProducts: function (dModel, sModel) {
            //     var allProducts = dModel.getData().products;
            //     var selectedProducts = allProducts.filter(function (product) {
            //         return product.PRODUCT_SELECTED === true;
            //     });

            //     // Set the selected products in the second table's model
            //     sModel.setData({ selectedProducts: selectedProducts });
            // },


            // forProduct: function () {
            //     var that = this;
            //     var dModel = new sap.ui.model.json.JSONModel();
            //     that.byId("prodt").setModel(dModel);
            //     var oFilters = [];
            //     var sPlanningLocation = that.byId("pln").getValue();
            //     var sFactoryLocation = that.byId("fct").getValue();
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     // Manage pagination parameters
            //     var iSkip = 0;      // Start with the first batch
            //     var iTop = 30;      // Number of records to load per request

            //     // If there's no demand location, reset and return
            //     if (sDemandLocation.length === 0) {
            //         dModel.setData({ products: [] });
            //         that.byId("prodt").removeAllItems();
            //         return;
            //     }
            // var Locations = [];
            //     // Create filters for demand location
            //     for (var i = 0; i < sDemandLocation.length; i++) {
            //         Locations.push(sDemandLocation[i].getText())
            //     }

            //     // Function to check for duplicates
            //     function isDuplicate(productId, currentProducts) {
            //         return currentProducts.some(function (product) {
            //             return product.PRODUCT_ID === productId;
            //         });
            //     }
            // //   var LOCATION_ID = Locations
            //   var LOCATION_ID='["MFCN","1510","1520"]'

            //     // Fetch initial data
            //     function fetchData(iSkip, iTop, append) {
            //         that.oModel.callFunction("/getPartialProdbyLocation", {
            //             // filters: oFilters,
            //              urlParameters: {
            //                  LOCATION_ID : LOCATION_ID
            //               },
            //             success: function (oData) {
            //                 var oData = JSON.parse(oData.getPartialProdbyLocation)
            //                 let uProduct = oData.map(item => {
            //                     return {
            //                         PRODUCT_ID: item.PRODUCT_ID,
            //                         PROD_DESC: item.PROD_DESC,
            //                         PRODUCT_SELECTED: false
            //                     };
            //                 });

            //                 // Get the current products from the model
            //                 var oCurrentData = dModel.getData().products || [];

            //                 // Filter out duplicates
            //                 let uniqueProducts = uProduct.filter(function (newProduct) {
            //                     return !isDuplicate(newProduct.PRODUCT_ID, oCurrentData);
            //                 });

            //                 // Append or replace model data with unique products only
            //                 if (append) {
            //                     dModel.setData({
            //                         products: oCurrentData.concat(uniqueProducts)
            //                     });
            //                 } else {
            //                     dModel.setData({
            //                         products: uniqueProducts
            //                     });
            //                 }

            //                 // Update skip value for the next fetch
            //                 iSkip += iTop;
            //             },
            //             error: function (e) {
            //                 console.error("Error fetching data", e);
            //             }
            //         });
            //     }

            //     // Initialize the table
            //     var oTable = new sap.m.Table({
            //         width:"50%",
            //         outerHeight:"200px",
            //         growing: true,                  // Enable growing feature
            //         growingThreshold: iTop,         // Load 100 records at a time
            //         growingScrollToLoad: true,      // Automatically load more on scroll
            //         columns: [
            //             new sap.m.Column({
            //                 header: new sap.m.Text({ text: "Select" })
            //                 // width: "2px"
            //             }),
            //             new sap.m.Column({
            //                 header: new sap.m.Text({ text: "Product Description" })
            //                 // width: "30px"
            //             }),
            //             new sap.m.Column({
            //                 header: new sap.m.Text({ text: "Product ID" })
            //                 // width: "150px"
            //             })
            //         ]
            //     });

            //     // Bind the items to the table
            //     oTable.bindItems({
            //         path: "/products",
            //         template: new sap.m.ColumnListItem({
            //             cells: [
            //                 new sap.m.CheckBox({
            //                     selected: "{PRODUCT_SELECTED}",
            //                     select: function (oEvent) {
            //                         var oContext = oEvent.getSource().getBindingContext();
            //                         var oItem = oContext.getObject();
            //                         oItem.PRODUCT_SELECTED = oEvent.getParameter("selected");
            //                     }
            //                 }),
            //                 new sap.m.Text({ text: "{PROD_DESC}" }),
            //                 new sap.m.Text({ text: "{PRODUCT_ID}" })
            //             ]
            //         })
            //     });

            //     // Attach the growing event to trigger data loading on scroll
            //     oTable.attachGrowingStarted(function () {
            //         // Fetch more data when the growing feature is triggered (i.e., scroll down)
            //         fetchData(iSkip, iTop, true);  // Append new data
            //     });

            //     // Set the model and add the table to the container
            //     var oContainer = that.byId("prodt");
            //     oContainer.removeAllItems(); // Clear existing items
            //     oTable.setModel(dModel);     // Set model to the table
            //     oContainer.addItem(oTable);  // Add the table to the container

            //     // Fetch the initial batch of data
            //     fetchData(iSkip, iTop, false);
            // },


            // forProduct: function () {
            //     var dModel = new sap.ui.model.json.JSONModel();
            //     that.byId("prodt").setModel(dModel);
            //     var oFilters = [];
            //     var sPlanningLocation = that.byId("pln").getValue();
            //     var sFactoryLocation = that.byId("fct").getValue();
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     // Manage pagination parameters
            //     var iSkip = 0;      // Start with the first batch
            //     var iTop = 100;      // Number of records to load per request

            //     // If there's no demand location, reset and return
            //     if (sDemandLocation.length === 0) {
            //         dModel.setData({ products: [] });
            //         that.byId("prodt").removeAllItems();
            //         return;
            //     }

            //     // Create filters for demand location
            //     for (var i = 0; i < sDemandLocation.length; i++) {
            //         var sFilter = new sap.ui.model.Filter({
            //             path: "LOCATION_ID",
            //             operator: sap.ui.model.FilterOperator.EQ,
            //             value1: sDemandLocation[i].getText(),
            //         });
            //         oFilters.push(sFilter);
            //     }

            //     // Fetch initial data
            //     function fetchData(iSkip, iTop) {
            //         that.oModel.read("/genPartialProd", {
            //             filters: oFilters,
            //             urlParameters: {
            //                 "$skip": iSkip.toString(),
            //                 "$top": iTop.toString()
            //             },
            //             success: function (oData) {
            //                 let uProduct = oData.results.map(item => {
            //                     return {
            //                         PRODUCT_ID: item.PRODUCT_ID,
            //                         PROD_DESC: item.PROD_DESC,
            //                         PRODUCT_SELECTED: false
            //                     };
            //                 });

            //                 // Append new products to the model data
            //                 var oCurrentData = dModel.getData().products || [];
            //                 dModel.setData({
            //                     products: oCurrentData.concat(uProduct)
            //                 });

            //                 // Update skip value for the next fetch
            //                 iSkip += iTop;
            //             },
            //             error: function (e) {
            //                 console.error("Error fetching data", e);
            //             }
            //         });
            //     }

            //     // Initialize the table
            //     var oTable = new sap.m.Table({
            //         growing: true,                  // Enable growing feature
            //         growingThreshold: iTop,         // Load 50 records at a time
            //         growingScrollToLoad: true,      // Automatically load more on scroll
            //         columns: [
            //             new sap.m.Column({
            //                 header: new sap.m.Text({ text: "Select" }),
            //                 width: "2px"
            //             }),
            //             new sap.m.Column({
            //                 header: new sap.m.Text({ text: "Product Description" }),
            //                 width: "30px"
            //             }),
            //             new sap.m.Column({
            //                 header: new sap.m.Text({ text: "Product ID" }),
            //                 width: "150px"
            //             })
            //         ]
            //     });

            //     // Bind the items to the table
            //     oTable.bindItems({
            //         path: "/products",
            //         template: new sap.m.ColumnListItem({
            //             cells: [
            //                 new sap.m.CheckBox({
            //                     selected: "{PRODUCT_SELECTED}",
            //                     select: function (oEvent) {
            //                         var oContext = oEvent.getSource().getBindingContext();
            //                         var oItem = oContext.getObject();
            //                         oItem.PRODUCT_SELECTED = oEvent.getParameter("selected");
            //                     }
            //                 }),
            //                 new sap.m.Text({ text: "{PROD_DESC}" }),
            //                 new sap.m.Text({ text: "{PRODUCT_ID}" })
            //             ]
            //         })
            //     });

            //     // Set the model and add the table to the container
            //     var oContainer = that.byId("prodt");
            //     oContainer.removeAllItems(); // Clear existing items
            //     oTable.setModel(dModel);     // Set model to the table
            //     oContainer.addItem(oTable);  // Add the table to the container

            //     // Fetch the initial batch of data
            //     fetchData(iSkip, iTop);
            // },

            //// working ////////////

            // forProduct: function () {
            //     var dModel = new sap.ui.model.json.JSONModel();
            //     that.byId("prodt").setModel(dModel);
            //     var oFilters = [];
            //     var sPlanningLocation = that.byId("pln").getValue();
            //     var sFactoryLocation = that.byId("fct").getValue();
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     // if (sPlanningLocation.length > 0) {

            //     //     var sFilter = new sap.ui.model.Filter({
            //     //         path: "LOCATION_ID",
            //     //         operator: sap.ui.model.FilterOperator.EQ,
            //     //         value1: sPlanningLocation,
            //     //     });
            //     //     oFilters.push(sFilter);
            //     // }
            //     // if (sFactoryLocation.length > 0) {

            //     //     var sFilter = new sap.ui.model.Filter({
            //     //         path: "LOCATION_ID",
            //     //         operator: sap.ui.model.FilterOperator.EQ,
            //     //         value1: sFactoryLocation,
            //     //     });
            //     //     oFilters.push(sFilter);
            //     // }
            //     if (sDemandLocation.length > 0) {
            //         for (var i = 0; i < sDemandLocation.length; i++) {
            //             var sFilter = new sap.ui.model.Filter({
            //                 path: "LOCATION_ID",
            //                 operator: sap.ui.model.FilterOperator.EQ,
            //                 value1: sDemandLocation[i].getText(),
            //             });
            //             oFilters.push(sFilter);
            //         }
            //     } else {

            //         dModel.setData({ products: [] });
            //         that.byId("prodt").removeAllItems();
            //         return;
            //     }

            //     that.oModel.read("/genPartialProd", {
            //         filters: oFilters,
            //         success: function (oData) {
            //             that.data = oData.results;
            //             let uProduct = oData.results.map(item => {
            //                 return {
            //                     PRODUCT_ID: item.PRODUCT_ID,
            //                     PROD_DESC: item.PROD_DESC,
            //                     PRODUCT_SELECTED: false
            //                 };
            //             });

            //             // Set the data to the model
            //             dModel.setData({
            //                 products: uProduct
            //             });

            //             var oContainer = that.byId("prodt");

            //             oContainer.removeAllItems();

            //             var oTable = new sap.m.Table({
            //                 columns: [
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Select" }),
            //                         width: "2px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product Description" }),
            //                         width: "30px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product ID" }),
            //                         width: "150px"
            //                     })
            //                 ]
            //             });

            //             oTable.bindItems({
            //                 path: "/products",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.CheckBox({
            //                             selected: "{PRODUCT_SELECTED}",
            //                             select: function (oEvent) {
            //                                 var oContext = oEvent.getSource().getBindingContext();
            //                                 var oItem = oContext.getObject();
            //                                 oItem.PRODUCT_SELECTED = oEvent.getParameter("selected");
            //                             }
            //                         }),
            //                         new sap.m.Text({ text: "{PROD_DESC}" }),
            //                         new sap.m.Text({ text: "{PRODUCT_ID}" })
            //                     ]
            //                 })
            //             });

            //             oTable.setModel(dModel);
            //             oContainer.addItem(oTable);
            //         },
            //         error: function (e) {
            //             console.error("Error fetching data", e);
            //         }
            //     });
            // },

            // forProduct: function () {
            //     var dModel = new sap.ui.model.json.JSONModel();
            //     that.byId("prodt").setModel(dModel); // Set the model for the VBox container

            //     var oFilters = [];
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     // Create filters only if there are selected demand locations
            //     if (sDemandLocation.length > 0) {
            //         for (var i = 0; i < sDemandLocation.length; i++) {
            //             var sFilter = new sap.ui.model.Filter({
            //                 path: "LOCATION_ID",
            //                 operator: sap.ui.model.FilterOperator.EQ,
            //                 value1: sDemandLocation[i].getText(),
            //             });
            //             oFilters.push(sFilter);
            //         }
            //     }

            //     // Perform the OData read request with or without filters
            //     that.oModel.read("/genPartialProd", {
            //         filters: oFilters.length > 0 ? oFilters : undefined, // Apply filters only if they exist
            //         success: function (oData) {
            //             that.data = oData.results;

            //             // Map products with their descriptions and IDs
            //             let uProduct = oData.results.map(item => {
            //                 return {
            //                     PRODUCT_ID: item.PRODUCT_ID,
            //                     PROD_DESC: item.PROD_DESC,
            //                     PRODUCT_SELECTED: false // Initially not selected
            //                 };
            //             });

            //             // Set the data to the model
            //             dModel.setData({
            //                 products: uProduct
            //             });

            //             // Get the VBox container where the table will be added (from the 3rd wizard step)
            //             var oContainer = that.byId("prodt");

            //             // Remove the old table if it exists
            //             oContainer.removeAllItems();

            //             // Create the table
            //             var oTable = new sap.m.Table({
            //                 columns: [
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Select" }),
            //                         width: "2px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product Description" }),
            //                         width: "30px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product ID" }),
            //                         width: "150px"
            //                     })
            //                 ],
            //                 // height: "400px", // Adjust the height as per your requirement
            //                 // fixedLayout: true, // Ensures fixed column width for better control
            //                 // growing: true, // Enable growing feature to display a subset of items
            //                 // growingThreshold: 10, // Set the number of rows to display before loading more
            //                 // growingScrollToLoad: true // Enable scrolling to load more items
            //             });

            //             // Bind items to the table
            //             oTable.bindItems({
            //                 path: "/products",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.CheckBox({
            //                             selected: "{PRODUCT_SELECTED}",
            //                             select: function (oEvent) {
            //                                 var oContext = oEvent.getSource().getBindingContext();
            //                                 var oItem = oContext.getObject();

            //                                 // Toggle selection state
            //                                 oItem.PRODUCT_SELECTED = oEvent.getParameter("selected");
            //                             }
            //                         }),
            //                         new sap.m.Text({
            //                             text: "{PROD_DESC}" // Product description
            //                         }),
            //                         new sap.m.Text({
            //                             text: "{PRODUCT_ID}" // Product ID
            //                         })
            //                     ]
            //                 })
            //             });

            //             // Set the model for the table
            //             oTable.setModel(dModel);

            //             // Add the new table to the VBox container in the 3rd wizard step
            //             oContainer.addItem(oTable);
            //         },
            //         error: function (e) {
            //             console.error("Error fetching data", e);
            //         }
            //     });
            // },


            // forProduct: function () {
            //     var oFilters = [];
            //     var oStep1 = that.byId("scheduleStep")
            //     //  if(oStep1.getValidated() == true){}
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     // Create filters for each selected demand location
            //     for (var i = 0; i < sDemandLocation.length; i++) {
            //         var sFilter = new sap.ui.model.Filter({
            //             path: "LOCATION_ID",
            //             operator: sap.ui.model.FilterOperator.EQ,
            //             value1: sDemandLocation[i].getText(),
            //         });
            //         oFilters.push(sFilter);
            //     }

            //     // Perform the OData read request
            //     that.oModel.read("/genPartialProd", {
            //         filters: oFilters,
            //         success: function (oData) {
            //             that.data = oData.results;

            //             // Map products with their descriptions and IDs
            //             let uProduct = oData.results.map(item => {
            //                 return {
            //                     PRODUCT_ID: item.PRODUCT_ID,
            //                     PROD_DESC: item.PROD_DESC,
            //                     PRODUCT_SELECTED: false // Initially not selected
            //                 };
            //             });

            //             // Set the data to the model
            //             var dModel = new sap.ui.model.json.JSONModel();
            //             dModel.setData({
            //                 products: uProduct
            //             });

            //             // Get the container where the table should be placed
            //             var oContainer = that.byId("prodt");

            //             // Check if the table already exists
            //             var oExistingTable = oContainer.getItems().find(item => item instanceof sap.m.Table);

            //             if (oExistingTable) {
            //                 // Remove the existing table before adding a new one
            //                 oContainer.removeItem(oExistingTable);
            //             }

            //             // Create the table
            //             var oTable = new sap.m.Table({
            //                 columns: [
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Select" }),
            //                         width: "2px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product Description" }),
            //                         width: "30px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product ID" }),
            //                         width: "150px"
            //                     })
            //                 ],
            //                 height: "400px", // Adjust the height as per your requirement
            //                 fixedLayout: true, // Ensures fixed column width for better control
            //                 growing: true, // Enable growing feature to display a subset of items
            //                 growingThreshold: 10, // Set the number of rows to display before loading more
            //                 growingScrollToLoad: true // Enable scrolling to load more items
            //             });

            //             // Bind items to the table
            //             oTable.bindItems({
            //                 path: "/products",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.CheckBox({
            //                             selected: "{PRODUCT_SELECTED}",
            //                             select: function (oEvent) {
            //                                 var oContext = oEvent.getSource().getBindingContext();
            //                                 var oItem = oContext.getObject();

            //                                 // Toggle selection state
            //                                 oItem.PRODUCT_SELECTED = oEvent.getParameter("selected");
            //                             }
            //                         }),
            //                         new sap.m.Text({
            //                             text: "{PROD_DESC}" // Product description
            //                         }),
            //                         new sap.m.Text({
            //                             text: "{PRODUCT_ID}" // Product ID
            //                         })
            //                     ]
            //                 })
            //             });

            //             // Set the model for the table
            //             oTable.setModel(dModel);

            //             // Add the new table to the container
            //             oContainer.addItem(oTable);
            //         },
            //         error: function (e) {
            //             console.error("Error fetching data", e);
            //         }
            //     });
            // },


            // forProduct: function () {
            //     var oFilters = [];
            //     var oStep1 = that.byId("scheduleStep")
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     // Create filters for each selected demand location
            //     for (var i = 0; i < sDemandLocation.length; i++) {
            //         var sFilter = new sap.ui.model.Filter({
            //             path: "LOCATION_ID",
            //             operator: sap.ui.model.FilterOperator.EQ,
            //             value1: sDemandLocation[i].getText(),
            //         });
            //         oFilters.push(sFilter);
            //     }

            //     // Perform the OData read request
            //     that.oModel.read("/genPartialProd", {
            //         filters: oFilters,
            //         success: function (oData) {
            //             that.data = oData.results;

            //             // Map products with their descriptions and IDs
            //             let uProduct = oData.results.map(item => {
            //                 return {
            //                     PRODUCT_ID: item.PRODUCT_ID,
            //                     PROD_DESC: item.PROD_DESC,
            //                     PRODUCT_SELECTED: false // Initially not selected
            //                 };
            //             });

            //             // Set the data to the model
            //             var dModel = new sap.ui.model.json.JSONModel();
            //             dModel.setData({
            //                 products: uProduct
            //             });

            //             // Get the container where the table should be placed
            //             var oContainer = that.byId("prodt");

            //             // Check if the table already exists
            //             var oExistingTable = oContainer.getItems().find(item => item instanceof sap.m.Table);

            //             if (oExistingTable) {
            //                 // Remove the existing table before adding a new one
            //                 oContainer.removeItem(oExistingTable);
            //             }

            //             // Create the table
            //             var oTable = new sap.m.Table({
            //                 columns: [
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Select" }),
            //                         width: "2px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product Description" }),
            //                         width: "30px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product ID" }),
            //                         width: "150px"
            //                     })
            //                 ],
            //                 height: "400px", // Adjust the height as per your requirement
            //                 fixedLayout: true, // Ensures fixed column width for better control
            //                 growing: true, // Enable growing feature to display a subset of items
            //                 growingThreshold: 10, // Set the number of rows to display before loading more
            //                 growingScrollToLoad: true // Enable scrolling to load more items
            //             });

            //             // Bind items to the table
            //             oTable.bindItems({
            //                 path: "/products",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.CheckBox({
            //                             selected: "{PRODUCT_SELECTED}",
            //                             select: function (oEvent) {
            //                                 var oContext = oEvent.getSource().getBindingContext();
            //                                 var oItem = oContext.getObject();

            //                                 // Toggle selection state
            //                                 oItem.PRODUCT_SELECTED = oEvent.getParameter("selected");
            //                             }
            //                         }),
            //                         new sap.m.Text({
            //                             text: "{PROD_DESC}" // Product description
            //                         }),
            //                         new sap.m.Text({
            //                             text: "{PRODUCT_ID}" // Product ID
            //                         })
            //                     ]
            //                 })
            //             });

            //             // Set the model for the table
            //             oTable.setModel(dModel);

            //             // Add the new table to the container
            //             oContainer.addItem(oTable);
            //         },
            //         error: function (e) {
            //             console.error("Error fetching data", e);

            //             // In case of error, clear the model by setting an empty array
            //             var dModel = new sap.ui.model.json.JSONModel();
            //             dModel.setData({
            //                 products: [] // Empty array
            //             });

            //             // Clear the container if necessary
            //             var oContainer = that.byId("prodt");
            //             oContainer.removeAllItems(); // Remove any existing items

            //             // Set the empty model to the table (if needed)
            //             var oTable = new sap.m.Table(); // Create an empty table if required
            //             oTable.setModel(dModel); // Set the empty model to the table
            //             oContainer.addItem(oTable); // Add the empty table to the container
            //         }
            //     });
            // },

            // forProduct: function () {
            //     var dModel = new sap.ui.model.json.JSONModel();
            //     that.byId("prodt").setModel(dModel);
            //     var oFilters = [];
            //     var oStep1 = that.byId("scheduleStep");
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     // Create filters only if there are selected demand locations
            //     if (sDemandLocation.length > 0) {
            //         for (var i = 0; i < sDemandLocation.length; i++) {
            //             var sFilter = new sap.ui.model.Filter({
            //                 path: "LOCATION_ID",
            //                 operator: sap.ui.model.FilterOperator.EQ,
            //                 value1: sDemandLocation[i].getText(),
            //             });
            //             oFilters.push(sFilter);
            //         }
            //     }

            //     // Perform the OData read request with or without filters
            //     that.oModel.read("/genPartialProd", {
            //         filters: oFilters.length > 0 ? oFilters : undefined, // Apply filters only if they exist
            //         success: function (oData) {
            //             that.data = oData.results;

            //             // Map products with their descriptions and IDs
            //             let uProduct = oData.results.map(item => {
            //                 return {
            //                     PRODUCT_ID: item.PRODUCT_ID,
            //                     PROD_DESC: item.PROD_DESC,
            //                     PRODUCT_SELECTED: false // Initially not selected
            //                 };
            //             });

            //             // Set the data to the model
            //             var dModel = new sap.ui.model.json.JSONModel();
            //             dModel.setData({
            //                 products: uProduct
            //             });

            //             // Get the container where the table should be placed
            //             var oContainer = that.byId("prodt");

            //             // Check if the table already exists
            //             var oExistingTable = oContainer.getItems().find(item => item instanceof sap.m.Table);

            //             if (oExistingTable) {
            //                 // Remove the existing table before adding a new one
            //                 oContainer.removeItem(oExistingTable);
            //             }

            //             // Create the table
            //             var oTable = new sap.m.Table({
            //                 columns: [
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Select" }),
            //                         width: "2px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product Description" }),
            //                         width: "30px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product ID" }),
            //                         width: "150px"
            //                     })
            //                 ],
            //                 height: "400px", // Adjust the height as per your requirement
            //                 fixedLayout: true, // Ensures fixed column width for better control
            //                 growing: true, // Enable growing feature to display a subset of items
            //                 growingThreshold: 10, // Set the number of rows to display before loading more
            //                 growingScrollToLoad: true // Enable scrolling to load more items
            //             });

            //             // Bind items to the table
            //             oTable.bindItems({
            //                 path: "/products",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.CheckBox({
            //                             selected: "{PRODUCT_SELECTED}",
            //                             select: function (oEvent) {
            //                                 var oContext = oEvent.getSource().getBindingContext();
            //                                 var oItem = oContext.getObject();

            //                                 // Toggle selection state
            //                                 oItem.PRODUCT_SELECTED = oEvent.getParameter("selected");
            //                             }
            //                         }),
            //                         new sap.m.Text({
            //                             text: "{PROD_DESC}" // Product description
            //                         }),
            //                         new sap.m.Text({
            //                             text: "{PRODUCT_ID}" // Product ID
            //                         })
            //                     ]
            //                 })
            //             });

            //             // Set the model for the table
            //             oTable.setModel(dModel);

            //             // Add the new table to the container
            //             oContainer.addItem(oTable);
            //         },
            //         error: function (e) {
            //             console.error("Error fetching data", e);
            //         }
            //     });
            // },

            // forProduct: function () {
            //     var dModel = new sap.ui.model.json.JSONModel();
            //     that.byId("prodt").setModel(dModel);
            //     var oFilters = [];
            //     var sDemandLocation = that.byId("dem").getTokens();

            //     // Create filters only if there are selected demand locations
            //     if (sDemandLocation.length > 0) {
            //         for (var i = 0; i < sDemandLocation.length; i++) {
            //             var sFilter = new sap.ui.model.Filter({
            //                 path: "LOCATION_ID",
            //                 operator: sap.ui.model.FilterOperator.EQ,
            //                 value1: sDemandLocation[i].getText(),
            //             });
            //             oFilters.push(sFilter);
            //         }
            //     }

            //     // Perform the OData read request with or without filters
            //     that.oModel.read("/genPartialProd", {
            //         filters: oFilters.length > 0 ? oFilters : undefined, // Apply filters only if they exist
            //         success: function (oData) {
            //             that.data = oData.results;

            //             // Map products with their descriptions and IDs
            //             let uProduct = oData.results.map(item => {
            //                 return {
            //                     PRODUCT_ID: item.PRODUCT_ID,
            //                     PROD_DESC: item.PROD_DESC,
            //                     PRODUCT_SELECTED: false // Initially not selected
            //                 };
            //             });

            //             // Set the data to the model
            //             dModel.setData({
            //                 products: uProduct
            //             });

            //             // Get the container where the table should be placed
            //             var oContainer = that.byId("prodt");

            //             // Remove the old table if it exists
            //             oContainer.removeAllItems();

            //             // Create the table
            //             var oTable = new sap.m.Table({
            //                 columns: [
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Select" }),
            //                         width: "2px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product Description" }),
            //                         width: "30px"
            //                     }),
            //                     new sap.m.Column({
            //                         header: new sap.m.Text({ text: "Product ID" }),
            //                         width: "150px"
            //                     })
            //                 ],
            //                 height: "400px", // Adjust the height as per your requirement
            //                 fixedLayout: true, // Ensures fixed column width for better control
            //                 growing: true, // Enable growing feature to display a subset of items
            //                 growingThreshold: 10, // Set the number of rows to display before loading more
            //                 growingScrollToLoad: true // Enable scrolling to load more items
            //             });

            //             // Bind items to the table
            //             oTable.bindItems({
            //                 path: "/products",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.CheckBox({
            //                             selected: "{PRODUCT_SELECTED}",
            //                             select: function (oEvent) {
            //                                 var oContext = oEvent.getSource().getBindingContext();
            //                                 var oItem = oContext.getObject();

            //                                 // Toggle selection state
            //                                 oItem.PRODUCT_SELECTED = oEvent.getParameter("selected");
            //                             }
            //                         }),
            //                         new sap.m.Text({
            //                             text: "{PROD_DESC}" // Product description
            //                         }),
            //                         new sap.m.Text({
            //                             text: "{PRODUCT_ID}" // Product ID
            //                         })
            //                     ]
            //                 })
            //             });

            //             // Set the model for the table
            //             oTable.setModel(dModel);

            //             // Add the new table to the container
            //             oContainer.addItem(oTable);
            //         },
            //         error: function (e) {
            //             console.error("Error fetching data", e);
            //         }
            //     });
            // },


            // onSelectionChange: function (oEvent) {
            //     var selectedItems = oEvent.getParameter("listItems"); // Get the currently selected items
            //     var that = this;

            //     // Initialize selectedProductIDs array if it doesn't exist
            //     if (!that.selectedProductIDs) {
            //         that.selectedProductIDs = [];
            //     }

            //     // Loop through selected items to update selectedProductIDs array
            //     selectedItems.forEach(function (item) {
            //         var productData = item.getBindingContext() ? item.getBindingContext().getObject() : null;

            //         // Check if productData and PRODUCT_ID exist
            //         if (productData && productData.PRODUCT_ID) {
            //             var productIndex = that.selectedProductIDs.indexOf(productData.PRODUCT_ID);

            //             if (item.isSelected()) {
            //                 // If it's selected and not already in the list, add it
            //                 if (productIndex === -1) {
            //                     that.selectedProductIDs.push(productData.PRODUCT_ID);
            //                 }
            //             } else {
            //                 // If it's deselected, remove it from the list
            //                 if (productIndex > -1) {
            //                     that.selectedProductIDs.splice(productIndex, 1);
            //                 }
            //             }
            //         }
            //     });

            //     console.log("Selected Products: ", this.selectedProductIDs); // Debugging
            // },

            // onItemPress: function (oEvent) {
            //     var oTable = that.byId("availableProductsTable");
            //     var oSelectedItem = oEvent.getSource(); // Get the pressed item
            //     var oBindingContext = oSelectedItem.getBindingContext(); // Get the binding context of the pressed row

            //     // Toggle the selection of the row
            //     var bSelected = oTable.isSelectedIndex(oTable.indexOfItem(oSelectedItem));
            //     if (!bSelected) {
            //         oTable.addSelectionInterval(oTable.indexOfItem(oSelectedItem), oTable.indexOfItem(oSelectedItem));
            //     } else {
            //         oTable.removeSelectionInterval(oTable.indexOfItem(oSelectedItem), oTable.indexOfItem(oSelectedItem));
            //     }
            // },

        });
    });