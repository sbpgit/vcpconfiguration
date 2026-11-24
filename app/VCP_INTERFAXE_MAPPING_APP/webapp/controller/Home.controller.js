sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/m/ToolbarSpacer",
        "sap/m/ComboBox",
        "sap/m/StandardListItem",
        "sap/m/Button",
        "sap/m/Input",
        "sap/m/CheckBox",
        "sap/m/HBox",
        "sap/m/Text",
        "sap/ui/core/Item",
        "sap/ui/export/Spreadsheet",
], function (Controller, MessageToast, MessageBox, ToolbarSpacer, ComboBox,
        StandardListItem, Button, Input, CheckBox, HBox, Text, Item, Spreadsheet) {
        "use strict";
        var that;
        return Controller.extend("vcpibpapis.controller.Home", {

                onInit: function () {
                        that = this;
                        that._busyCount = 0;
                        if (!this.getView().getModel("viewModel")) {
                                const oViewModel = new sap.ui.model.json.JSONModel();
                                oViewModel.setSizeLimit(2000);
                                this.getView().setModel(oViewModel, "viewModel");
                        }
                        this.getView().getModel("viewModel").setProperty("/selectedPlanningAreas", []);
                        this.loadGlobalPlanningConfig();
                        this.initDropdowns();
                        that.sampleMasterData = {}

                },
                loadGlobalPlanningConfig: function () {
                        that.showBusy()
                        const oModel = this.getOwnerComponent().getModel("BModel")
                        oModel.read("/getGlobalPlanningConfig", {
                                success: function (oData) {
                                        const parsedData = JSON.parse(oData.getGlobalPlanningConfig);
                                        that.sPlanningKey = parsedData?.IBPPLANAREA;
                                        that.sPrefix = parsedData?.IBPPREFIX;
                                        that._loadPlanningAreas();
                                        that._loadMappings().then(function (groupedData) {
                                                that._groupedData = groupedData;
                                                that._currentGroupedData = JSON.parse(JSON.stringify(that._groupedData));
                                                that._tableDataMap = {};

                                        });
                                        that.hideBusy()

                                },
                                error: function (oError) {
                                        console.error("Error reading entity:", oError);
                                        sap.m.MessageToast.show("Error retrieving planning configuration.");
                                        that.hideBusy()
                                }
                        });
                },
                initDropdowns: function () {

                        this.loadDropdownData("/getLocation", {
                                entityKey: "Location",
                                staticFields: ['LOCATION_ID', 'LOCATION_DESC', 'LOCATION_TYPE', 'LATITUDE', 'LONGITUTE', 'RESERVE_FIELD1', 'RESERVE_FIELD2', 'RESERVE_FIELD3', 'RESERVE_FIELD4', 'RESERVE_FIELD5', 'AUTH_GROUP']
                        });

                        this.loadDropdownData("/getProducts", {
                                entityKey: "Product",
                                staticFields: ['PRODUCT_ID', 'PROD_DESC', 'PROD_FAMILY', 'PROD_GROUP', 'PROD_MODEL', 'PROD_MDLRANGE', 'PROD_SERIES', 'PROD_TYPE', 'RESERVE_FIELD1', 'RESERVE_FIELD2', 'RESERVE_FIELD3', 'RESERVE_FIELD4', 'RESERVE_FIELD5', 'AUTH_GROUP', 'NON_CONFIGURABLE']
                        });

                        this.loadDropdownData("/getLocProd", {
                                entityKey: "Location Product",
                                additionalFields: ['SOURCE_ID', "FACTORY_LOC"],
                                staticFields: ["FACTORY_LOC", 'PRODUCT_ID', 'LOCATION_ID', 'LOTSIZE_KEY', 'LOT_SIZE', 'PROCUREMENT_TYPE', 'PLANNING_STRATEGY', 'PROD_DESC', 'LOCATION_DESC', 'MRP_TYPE', 'MRP_GROUP', 'SOURCE_ID']
                        });
                        // this.loadDropdownData("/getLocProd", {
                        //         entityKey: "Assembly Header",
                        //         additionalFields: ["SOURCE_ID"],
                        //         staticFields: ['PRODUCT_ID', 'LOCATION_ID', 'LOTSIZE_KEY', 'LOT_SIZE', 'PROCUREMENT_TYPE', 'PLANNING_STRATEGY', 'PROD_DESC', 'LOCATION_DESC', 'MRP_TYPE', 'MRP_GROUP', 'SOURCE_ID']
                        // });

                        this.loadDropdownData("/getPVSBOM", {
                                entityKey: "Bill Of Material",
                                allowedFields: ["LOCATION_ID", "PRODUCT_ID", "COMPONENT", "SOURCE_ID"],
                                staticFields: ['LOCATION_ID', 'PRODUCT_ID', 'COMPONENT', 'SOURCE_ID']
                        });
                        this.loadDropdownData("/getCustgroup", {
                                entityKey: "Customer Group",
                                staticFields: ['CUSTOMER_GROUP', 'CUSTOMER_DESC', 'RESERVE_FIELD1', 'RESERVE_FIELD2', 'RESERVE_FIELD3', 'RESERVE_FIELD4', 'RESERVE_FIELD5', 'AUTH_GROUP']
                        });

                        this.loadDropdownData("/getAssemblyCompQty", {
                                entityKey: "Component Coefficient",
                                allowedFields: ["LOCATION_ID", "PRODUCT_ID", "REF_PRODID", "VERSION", "SCENARIO", "MODEL_VERSION", "COEFFICIENTS", "WEEK_DATE", "ASSEMBLY", "FACTORY_LOC", "SOURCE_ID"],
                                staticFields: ['LOCATION_ID', 'PRODUCT_ID', 'REF_PRODID', 'VERSION', 'SCENARIO', 'MODEL_VERSION', 'COEFFICIENTS', 'WEEK_DATE', 'ASSEMBLY', 'FACTORY_LOC', 'SOURCE_ID']
                        });

                        this.loadDropdownData("/getIbpSalesActDemand", {
                                entityKey: "Sales History",
                                staticFields: ['LOCATION_ID', 'FACTORY_LOC', 'PRODUCT_ID', 'REF_PRODID', 'CUSTOMER_GROUP', 'WEEK_DATE', 'ORD_QTY', 'ADJ_QTY']
                        });

                        this.loadDropdownData("/getRestrLikelihood_tel", {
                                entityKey: "Resource Capacity",
                                staticFields: ['LOCATION_ID', 'LINE_ID', 'RESTRICTION', 'WEEK_DATE', 'MODEL_VERSION', 'VERSION', 'SCENARIO', 'LOCATION_DESC', 'LINE_DESC', 'RTR_DESC', 'VERSION_NAME', 'SCENARIO_NAME', 'RTR_QTY', 'RESTRICTIONAVAIL_QTY', 'VALID_FROM', 'VALID_TO', 'CALENDAR_WEEK', 'TELESCOPIC_WEEK', 'WEEK_STARTDATE', 'WEEK_ENDDATE']
                        });

                        this.loadDropdownData("/getCapConsumption", {
                                entityKey: "Capacity Consumption",
                                staticFields: ['WEEK_DATE', 'LOCATION_ID', 'PRODUCT_ID', 'RESTRICTION', 'MODEL_VERSION', 'VERSION', 'SCENARIO', 'COMPONENT', 'LINE_ID', 'COMPCIR_QTY', 'QUANTITY', 'COEFFCIENT', "FACTORY_LOC"]
                        });

                        this.loadDropdownData("/getProdLocRtrLine", {
                                entityKey: "Location Line",
                                allowedFields: ["LOCATION_ID", "RESTRICTION", "RTR_DESC"],
                                staticFields: ['LOCATION_ID', 'RESTRICTION', 'RTR_DESC']
                        });

                        this.loadDropdownData("/getProdLocRtrLine", {
                                entityKey: "Line Master",
                                allowedFields: ["LOCATION_ID", "RESTRICTION", "RTR_DESC"],
                                staticFields: ['LOCATION_ID', 'RESTRICTION', 'RTR_DESC']

                        });

                        this.loadDropdownData("/getProdLocRtrLine", {
                                entityKey: "Line Capacity",
                                allowedFields: ["LOCATION_ID", "PRODUCT_ID", "RESTRICTION", "SOURCE_ID"],
                                staticFields: ["LOCATION_ID", "PRODUCT_ID", "RESTRICTION", "SOURCE_ID"]
                        });
                        this.loadDropdownData("/getIBPFdem", {
                                entityKey: "Product Demand",
                                additionalFields: ["CUSTOMER_GROUP"],
                                staticFields: ['LOCATION_ID', 'PRODUCT_ID', 'VERSION', 'SCENARIO', 'WEEK_DATE', 'QUANTITY', 'CUSTOMER_GROUP']

                        });

                },
                loadDropdownData: function (sEntitySet, oConfig) {
                        const that = this;
                        const oModel = this.getOwnerComponent().getModel("BModel");
                        const assignDropdownModels = function (aKeys) {
                                const aKeySet = aKeys.map(k => ({ key: k, Text: k }));

                                const aFullSet = [
                                        ...aKeySet,
                                        { key: "Default", Text: "Default" },
                                        { key: "Customize", Text: "Customize" }
                                ];

                                const aMasterData = {
                                        [oConfig.entityKey]: {
                                                BTPDropdownData: aFullSet,
                                                dropDown1: aKeySet,
                                                dropDown2: aKeySet
                                        }
                                };

                                that.getView().getModel("viewModel").setProperty("/" + oConfig.entityKey, aMasterData[oConfig.entityKey] || []);
                        };

                        const getFallbackFields = function () {
                                if (Array.isArray(oConfig.staticFields) && oConfig.staticFields.length > 0) {
                                        return oConfig.staticFields;
                                }
                        };

                        oModel.read(sEntitySet, {
                                urlParameters: { $top: 5 },
                                success: function (oData) {
                                        const aResults = oData?.results || [];
                                        let aKeys = [];
                                        const cleanedResults = aResults.map(item => {
                                                const { __metadata, VALID_FROM, VALID_TO, ...rest } = item;
                                                return rest;
                                        });
                                        if (aResults.length) {
                                                that.sampleMasterData[oConfig.entityKey] = cleanedResults;
                                                const oFirst = aResults[0];
                                                aKeys = oConfig.allowedFields
                                                        ? oConfig.allowedFields
                                                        : Object.keys(oFirst).slice(0, -1);
                                        } else {
                                                aKeys = getFallbackFields();
                                        }

                                        if (Array.isArray(oConfig.additionalFields)) {
                                                oConfig.additionalFields.forEach(field => {
                                                        if (!aKeys.includes(field)) {
                                                                aKeys.unshift(field);
                                                        }
                                                });
                                        }

                                        assignDropdownModels(aKeys);
                                },
                                error: function () {
                                        const aFallback = getFallbackFields();
                                        assignDropdownModels(aFallback);
                                        // MessageToast.show("Error loading data from " + sEntitySet);
                                }
                        });
                },

                _loadPlanningAreas: function () {
                        const that = this;
                        that.showBusy()
                        that.getOwnerComponent().getModel("IModel").callFunction("/getIBPPlanPrefixApi", {
                                success: function (oData) {
                                        var aApiData = JSON.parse(oData.getIBPPlanPrefixApi) || [];
                                        const aMasterData = aApiData[0].MASTER_DATA_API_SRV.map(k => {
                                                const displayText = k.startsWith(that.sPrefix) ? k.slice(that.sPrefix.length) : k;
                                                return {
                                                        key: displayText,
                                                        Text: displayText
                                                };
                                        });;
                                        const aTransData = [that.sPlanningKey].map(k => ({ key: k, Text: k }));
                                        that._groupPlanningAreaData(aApiData[1].MASTER_DATA_KEY_PROPERTIES,aApiData[3].PLANNING_DATA_KEY_PROPERTIES)
                                         that.getView().getModel("viewModel").setProperty("/planningAreasMaster", aMasterData || []);
                                        that.getView().getModel("viewModel").setProperty("/planningAreasTrans", aTransData || []);
                                        const oNavList = that.byId("navigationList");
                                        oNavList.setSelectedKey("Location");
                                        that._showNavigationTab("Location", "Master");
                                        that.hideBusy()
                                },
                                error: function () {
                                        MessageToast.show("Failed to load Planning Areas");
                                        that.hideBusy()

                                }
                        });
                },

                _loadMappings: function () {
                        const that = this;
                        return new Promise(function (resolve, reject) {
                                const oModel = that.getOwnerComponent().getModel("BModel");
                                oModel.read("/getMappings", {
                                        success: function (oData) {
                                                const mappings = oData.results || [];
                                                const grouped = that._groupByEntityAndPlanningArea(mappings);
                                                resolve(grouped);
                                        },
                                        error: function () {
                                                MessageToast.show("Failed to load mapping data.");
                                                reject();
                                        }
                                });
                        });
                },

                _groupByEntityAndPlanningArea: function (data) {
                        const grouped = {};


                        that.PRD_DMD = ["Product Demand"]

                        data.forEach(item => {
                                const entity = item.ENTITY_KEY;
                                let pa = item.PLANNING_AREA;

                                if (that.PRD_DMD.includes(entity)) {
                                        pa = that.sPlanningKey;
                                        item.PLANNING_AREA = pa;
                                }
                                if (!grouped[entity]) grouped[entity] = {};
                                if (!grouped[entity][pa]) grouped[entity][pa] = [];

                                let cust1 = "";
                                let cust2 = "";
                                let val = "";
                                let defCombo = false;
                                let typeVal = false;
                                let custVal = false;

                                if (item.Type === "C" && item.MAPPING_FIELD) {
                                        const parts = item.MAPPING_FIELD.split("_OPERATOR_");
                                        cust1 = parts[0] || "";
                                        cust2 = parts[1] || "";
                                        item.MAPPING_FIELD = item.BTP_FIELD;
                                        item.BTP_FIELD = "Customize";
                                        custVal = true
                                }
                                else if (item.Type === "D") {
                                        val = item.BTP_FIELD;
                                        item.BTP_FIELD = "Default";
                                        item.DATA_TYPE = item.DATA_TYPE || "String";
                                        typeVal = true;
                                }
                                else {
                                        defCombo = true;
                                }

                                let oNewRow = {
                                        key: item.BTP_FIELD,
                                        VALUE: val,
                                        CUSTOMIZE1: cust1 || "",
                                        column4: item.OPERATOR || "",
                                        CUSTOMIZE2: cust2 || "",
                                        CUSTOMIZE: custVal,
                                        column5: item.MAPPING_FIELD || "",
                                        column6: JSON.parse(item.REQUIRED) || false,
                                        flag: item.Type,
                                        isNew: defCombo,
                                        DTStatus: item.DATA_TYPE,
                                        isVal: typeVal,
                                        PRODUCT_TYPES: item.SELECTION?.split("/"),
                                        ENTITY_DESC: item.ENTITY_DESC || 0
                                };

                                grouped[entity][pa].push(oNewRow);
                        });

                        Object.keys(grouped).forEach(entity => {
                                const sortedKeys = Object.keys(grouped[entity]).sort((a, b) => {
                                        const minA = Math.min(...grouped[entity][a].map(r => parseInt(r.ENTITY_DESC, 10) || 0));
                                        const minB = Math.min(...grouped[entity][b].map(r => parseInt(r.ENTITY_DESC, 10) || 0));
                                        return minA - minB;
                                });

                                const sortedPAObj = {};
                                sortedKeys.forEach(key => sortedPAObj[key] = grouped[entity][key]);

                                grouped[entity] = sortedPAObj;
                        });


                        return grouped;
                },
                onNavigationSelect: function (oEvent) {
                        const item = oEvent.getParameter("item");
                        const sKey = item.getKey();

                        let selectedKey = null;
                        const parent = item.getParent();

                        if (parent && typeof parent.getKey === "function") {
                                selectedKey = parent.getKey();
                        }
                        else return
                        this._saveCurrentTabData();
                        this._showNavigationTab(sKey, selectedKey);
                },
                _showNavigationTab: function (entityKey, selectedKey) {
                        const oModel = this.getView().getModel("viewModel");
                        this.getView().getModel("viewModel").setProperty("/selectedEntity", selectedKey);
                        const planningAreasPath =
                                selectedKey === "Master"
                                        ? "/planningAreasMaster"
                                        : "/planningAreasTrans";

                        const aPlanningAreas = oModel.getProperty(planningAreasPath);
                        oModel.setProperty("/planningAreas", aPlanningAreas);

                        const oVBox = this.byId("dynamicTabBar");
                        oVBox.removeAllItems();
                        that._tableCounter = 0;
                        that._paCounter = 0;

                        const isMaster = selectedKey === "Master";
                        const dataForEntity = that._currentGroupedData[entityKey] || {};
                        // this.byId("btnPlay").setVisible(isMaster);
                        this.byId("btnInfo").setVisible(isMaster);

                        if (isMaster) {
                                const initialSelectedPA = Object.keys(dataForEntity);
                                oModel.setProperty("/selectedPlanningAreas", initialSelectedPA);
                        } else {
                                oModel.setProperty("/selectedPlanningAreas", []);
                        }

                        if (isMaster) {
                                Object.keys(dataForEntity).forEach(pa => {
                                        let ptypes = [];

                                        if (entityKey === "Product") {
                                                const rows = dataForEntity[pa];
                                                const firstRow = rows.find(r => r.PRODUCT_TYPES);
                                                if (firstRow && firstRow.PRODUCT_TYPES) {
                                                        ptypes = firstRow.PRODUCT_TYPES;
                                                }
                                        }

                                        this._addDynamicTable(entityKey, pa, dataForEntity[pa], ptypes, true);
                                });

                                this.byId("btnAdd").setVisible(true);
                                return;
                        }


                        const onlyPA = aPlanningAreas?.[0]?.key;

                        if (Object.keys(dataForEntity).length > 0) {
                                Object.keys(dataForEntity).forEach(pa => {
                                        if (entityKey === "Product Demand") {
                                                this.byId("btnAdd").setVisible(false);
                                                this._addDynamicTable(entityKey, onlyPA, dataForEntity[pa], [], false);
                                                return
                                        }
                                        this._addDynamicTable(entityKey, pa, dataForEntity[pa], [], false);
                                        this.byId("btnAdd").setVisible(true);
                                });
                                return;
                        }

                        this.byId("btnAdd").setVisible(true);
                },

                _addDynamicTable: function (entityKey, planningArea, tableData, PRODUCT_TYPES, isMaster) {

                        const oVBox = this.byId("dynamicTabBar");
                        const that = this;
                        that._tableCounter++;
                        const tableId = entityKey + "_" + that._tableCounter;
                        const planPrefix = isMaster ? planningArea : that.sPlanningKey;

                        const oToolbar = new sap.m.Toolbar({
                                content: [
                                        new sap.m.HBox({
                                                items: [
                                                        // new sap.m.Label({
                                                        //         visible: isMaster,
                                                        //         text: "Attributes",
                                                        //         required: true,
                                                        // }),

                                                        new ComboBox({
                                                                visible: isMaster,
                                                                width: "280px",
                                                                items: {
                                                                        path: "viewModel>/planningAreas",
                                                                        templateShareable: false,

                                                                        template: new Item({
                                                                                key: "{viewModel>key}",
                                                                                text: "{viewModel>Text}"
                                                                        })
                                                                },
                                                                selectedKey: planPrefix || "",
                                                                change: function (oEvent) {

                                                                        if (!isMaster) return;

                                                                        const table = that._tableDataMap[tableId];

                                                                        const oldPA = table._currentPlanningAreaBase || "";
                                                                        const newPA = oEvent.getSource().getSelectedKey();
                                                                        const entkey = table._entityKey || "";

                                                                        that._updateSelectedPlanningAreas(oldPA, newPA, entkey);

                                                                        table._currentPlanningAreaBase = newPA;
                                                                        table._currentPlanningArea = newPA;

                                                                        that._loadMappingDataForPlanningArea(
                                                                                oEvent,
                                                                                newPA,
                                                                                tableId
                                                                        );
                                                                }
                                                        }),

                                                        new sap.m.Text({
                                                                visible: !isMaster,
                                                                text: planPrefix
                                                        })
                                                ]
                                        }),

                                        new ToolbarSpacer(),
                                        new sap.m.MultiComboBox({
                                                width: "200px",
                                                placeholder: "Select Product Types",
                                                visible: entityKey === "Product",
                                                selectedKeys: PRODUCT_TYPES,
                                                items: [
                                                        new Item({ key: "CP", text: "Config Product" }),
                                                        new Item({ key: "PP", text: "Partial Product" }),
                                                        new Item({ key: "DP", text: "Dummy Product" }),
                                                        new Item({ key: "ASMB", text: "Assembly Product" })
                                                ],
                                                selectionChange: function (oEvent) {
                                                        const table = that._tableDataMap[tableId];
                                                        const selected = oEvent.getSource().getSelectedKeys();

                                                        let model = table.getModel();
                                                        let rows = model.getProperty("/rows") || [];

                                                        rows.forEach(r => {
                                                                r.PRODUCT_TYPES = selected;
                                                        });

                                                        model.updateBindings(true);
                                                }
                                        }),
                                        new Button({
                                                icon: "sap-icon://add",
                                                type: "Transparent",
                                                press: function (oEvent) { that.onAddRowPress(oEvent); }
                                        }),
                                        new Button({
                                                text: "Default",
                                                type: "Emphasized",
                                                press: function (oEvent) { that.onRowSelection(oEvent, "Default"); }
                                        }),
                                        new Button({
                                                text: "Customize",
                                                type: "Emphasized",
                                                press: function (oEvent) { that.onRowSelection(oEvent, "Customize"); }
                                        }),
                                        new Button({
                                                icon: "sap-icon://delete",
                                                type: "Transparent",
                                                text: "Delete Table",
                                                press: function () { that.onDeleteTable(tableId); }
                                        })
                                ]
                        });

                        const oTable = new sap.m.Table({
                                headerToolbar: oToolbar,
                                columns: [
                                        new sap.m.Column({ header: new sap.m.Text({ text: "BTP Fields" }), width: "220px" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "VALUE", visible: false }) }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "dataType", visible: false }) }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Customize1", visible: false }) }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "isConcat", visible: false }), width: "80px" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Customize2", visible: false }) }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Mapping Fields" }), width: "220px" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Required" }), width: "80px", hAlign: "Center" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Delete" }), width: "70px" })
                                ]
                        });

                        if (!isMaster) {
                                oTable._entityKey = entityKey;
                                oTable._currentPlanningAreaBase = planningArea.split("_")[0];;
                                oTable._currentPlanningArea = planningArea;
                        } else {
                                oTable._currentPlanningAreaBase = planningArea;
                                oTable._currentPlanningArea = planningArea;
                                oTable._entityKey = entityKey;

                        }

                        oTable.setModel(new sap.ui.model.json.JSONModel({ rows: tableData }));
                        oTable.bindItems({
                                path: "/rows",
                                template: new sap.m.ColumnListItem({
                                        cells: [
                                                new ComboBox({
                                                        items: {
                                                                path: "viewModel>/" + entityKey + "/BTPDropdownData",
                                                                templateShareable: false,
                                                                template: new Item({ key: "{viewModel>key}", text: "{= ${viewModel>key} === 'RESTRICTION' ? 'RESOURCE' : ${viewModel>Text} }", enabled: "{= ${viewModel>key} !== 'Customize' && ${viewModel>key} !== 'Default' }" })

                                                        }, selectedKey: "{key}", enabled: "{= ${key} !== 'Customize' && ${key} !== 'Default' }"
                                                }),
                                                new Input({ value: "{VALUE}", visible: "{isVal}", placeholder: "Enter Default Value" }),
                                                new sap.m.Select({
                                                        items: [
                                                                new Item({ key: "String", text: "String" }),
                                                                new Item({ key: "Integer", text: "Integer" }),
                                                                new Item({ key: "Float", text: "Float" })
                                                        ],
                                                        selectedKey: "{DTStatus}",
                                                        visible: "{isVal}"
                                                }),
                                                new ComboBox({
                                                        items: {
                                                                path: "viewModel>/" + entityKey + "/dropDown1",
                                                                templateShareable: false,
                                                                template: new Item({ key: "{viewModel>key}", text: "{= ${viewModel>key} === 'RESTRICTION' ? 'RESOURCE' : ${viewModel>Text} }" })

                                                        }, visible: "{CUSTOMIZE}", selectedKey: "{CUSTOMIZE1}"
                                                }),
                                                new ComboBox({
                                                        items: [
                                                                new Item({ key: "", text: "" }),
                                                                new Item({ key: "%", text: "%" }),
                                                                new Item({ key: "_", text: "_" }),
                                                                new Item({ key: "/", text: "/" })
                                                        ], visible: "{CUSTOMIZE}", selectedKey: "{column4}"
                                                }),
                                                new ComboBox({
                                                        items: {
                                                                path: "viewModel>/" + entityKey + "/dropDown2",
                                                                templateShareable: false,
                                                                template: new Item({ key: "{viewModel>key}", text: "{= ${viewModel>key} === 'RESTRICTION' ? 'RESOURCE' : ${viewModel>Text} }" })

                                                        }, visible: "{CUSTOMIZE}", selectedKey: "{CUSTOMIZE2}"
                                                }),
                                                new HBox({
                                                        items: [
                                                                new Input({
                                                                        value: "{column5}",
                                                                        visible: "{= !${isNew} }",
                                                                        width: "199px"
                                                                }),
                                                                new ComboBox({
                                                                        visible: "{isNew}",
                                                                        selectedKey: "{column5}",
                                                                        items: {
                                                                                path: "viewModel>/lockeyMapOptions/" + planPrefix,
                                                                                templateShareable: false,
                                                                                template: new Item({
                                                                                        key: "{viewModel>key}",
                                                                                        text: "{viewModel>Text}"
                                                                                })
                                                                        }
                                                                })
                                                        ]
                                                }),
                                                new CheckBox({ selected: "{column6}" }),
                                                new Button({ icon: "sap-icon://delete", type: "Transparent", press: function (oEvt) { that.onDeleteRow(oEvt); } })
                                        ]
                                })
                        });

                        const oTableContainer = new sap.m.VBox({
                                items: [oTable],
                                width: "100%"
                        });

                        oTableContainer.addStyleClass("customTableContainer");
                        this._tableDataMap[tableId] = oTable;
                        oVBox.addItem(oTableContainer);
                },

                _getNextPASuffix: function (entityKey) {
                        const paMap = this._currentGroupedData[entityKey] || {};
                        const keys = Object.keys(paMap);

                        if (keys.length === 0) return 1;

                        let max = 0;
                        keys.forEach(pa => {
                                const parts = pa.split("_");
                                const s = parseInt(parts[parts.length - 1], 10);
                                if (!isNaN(s)) max = Math.max(max, s);
                        });

                        return max + 1;
                },

                _saveCurrentTabData: function () {
                        const oVBox = this.byId("dynamicTabBar");
                        const aTables = oVBox.getItems();

                        if (!aTables || aTables.length === 0) return;

                        aTables.forEach(container => {

                                const table = container.getItems()[0];

                                if (!table || !table._entityKey || !table._currentPlanningArea) return;

                                const entity = table._entityKey;
                                const pa = table._currentPlanningArea;

                                const rows = table.getModel().getProperty(table.getBindingInfo("items").path) || [];

                                if (!this._currentGroupedData[entity]) {
                                        this._currentGroupedData[entity] = {};
                                }

                                if (!this._currentGroupedData[entity][pa]) {
                                        this._currentGroupedData[entity][pa] = JSON.parse(JSON.stringify(rows));
                                        return;
                                }

                                const existingRows = this._currentGroupedData[entity][pa];

                                rows.forEach(newRow => {
                                        const exists = existingRows.some(oldRow =>
                                                JSON.stringify(oldRow) === JSON.stringify(newRow)
                                        );

                                        if (!exists) {
                                                existingRows.push(JSON.parse(JSON.stringify(newRow)));
                                        }
                                });
                        });
                },


                _updateSelectedPlanningAreas: function (oldPA, newPA, entity) {
                        const oModel = this.getView().getModel("viewModel");
                        let selected = oModel.getProperty("/selectedPlanningAreas") || [];
                        const data = this._currentGroupedData[entity][oldPA];
                        delete this._currentGroupedData[entity][oldPA];

                        this._currentGroupedData[entity][newPA] = data;

                        selected = selected.filter(pa => pa !== oldPA);

                        if (!selected.includes(newPA)) {
                                selected.push(newPA);
                        }

                        oModel.setProperty("/selectedPlanningAreas", selected);
                        this._updateAvailablePlanningAreas();
                },
                _updateAvailablePlanningAreas: function () {
                        const oModel = this.getView().getModel("viewModel");

                        const allPAs = oModel.getProperty("/planningAreasMaster") || [];
                        const selected = oModel.getProperty("/selectedPlanningAreas") || [];

                        const filtered = allPAs.filter(pa => !selected.includes(pa.key));

                        oModel.setProperty("/planningAreas", filtered);

                        const oVBox = this.byId("dynamicTabBar");
                        const items = oVBox.getItems();

                        items.forEach(container => {
                                const table = container.getItems()[0];
                                const toolbar = table.getHeaderToolbar();
                                const comboBox = toolbar.getContent()[0].getItems()[0];

                                if (comboBox instanceof sap.m.ComboBox) {
                                        comboBox.bindItems({
                                                path: "viewModel>/planningAreas",
                                                templateShareable: false,
                                                template: new Item({
                                                        key: "{viewModel>key}",
                                                        text: "{viewModel>Text}"
                                                })
                                        });
                                }
                        });
                },
                onDeleteTable: function (tableId) {
                        const that = this;

                        sap.m.MessageBox.warning(
                                "Are you sure you want to delete this table?",
                                {
                                        title: "Confirm Delete",
                                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                                        onClose: function (oAction) {
                                                if (oAction !== sap.m.MessageBox.Action.OK) {
                                                        return;
                                                }

                                                const oVBox = that.byId("dynamicTabBar");
                                                const oTable = that._tableDataMap[tableId];

                                                if (!oTable) return;

                                                const oModel = that.getView().getModel("viewModel");
                                                const selectedKey = oModel.getProperty("/selectedEntity");
                                                const isMaster = selectedKey === "Master";
                                                const planningArea = oTable._currentPlanningArea || "";
                                                const entityKey = oTable._entityKey;
                                                const existsInInitial = that._groupedData?.[entityKey]?.hasOwnProperty(planningArea);
                                                if (existsInInitial) {
                                                        delete that._groupedData[entityKey][planningArea];
                                                        const bModel = that.getOwnerComponent().getModel("BModel");
                                                        bModel.callFunction("/DeleteMappings", {
                                                                urlParameters: {
                                                                        ENTITY_KEY: entityKey,
                                                                        PLANNING_AREA: planningArea
                                                                },
                                                                success: function (oData) {
                                                                        sap.m.MessageToast.show(`Mapping for ${entityKey} / ${planningArea} deleted successfully.`);
                                                                },
                                                                error: function (err) {
                                                                        sap.m.MessageToast.show(`Failed to delete mapping for ${entityKey} / ${planningArea}.`);
                                                                        console.error(err);
                                                                }
                                                        });
                                                }
                                                if (isMaster) {
                                                        let selected = oModel.getProperty("/selectedPlanningAreas") || [];

                                                        selected = selected.filter(pa => pa !== planningArea);

                                                        oModel.setProperty("/selectedPlanningAreas", selected);

                                                        that._updateAvailablePlanningAreas();
                                                }

                                                oVBox.removeItem(oTable.getParent());
                                                delete that._tableDataMap[tableId];
                                                if (that._currentGroupedData[entityKey] && that._currentGroupedData[entityKey][planningArea]) {
                                                        delete that._currentGroupedData[entityKey][planningArea];
                                                }
                                                if (!isMaster) {
                                                        const tID = tableId.split("_")[0];
                                                        if (tID === "Product Demand") {
                                                                const remainingTables = Object.keys(that._tableDataMap).some(key => key.startsWith(tID));

                                                                that.byId("btnAdd").setVisible(!remainingTables);
                                                        }
                                                }
                                        }
                                }
                        );
                },

                onAddPressed: function () {
                        const sSelectedKey = this.byId("navigationList").getSelectedKey();
                        const oModel = this.getView().getModel("viewModel");
                        const isMaster = oModel.getProperty("/selectedEntity") === "Master";

                        const aPlanningAreas = oModel.getProperty("/planningAreas");
                        let pa;
                        if (!isMaster) {
                                const suffix = this._getNextPASuffix(sSelectedKey);
                                pa = aPlanningAreas?.[0]?.key + "_" + suffix;
                        } else {
                                pa = "PA_" + that._paCounter;
                        }
                        that._paCounter++;

                        if (!that._currentGroupedData[sSelectedKey]) {
                                that._currentGroupedData[sSelectedKey] = {};
                        }

                        this._currentGroupedData[sSelectedKey][pa] = [];

                        this._addDynamicTable(sSelectedKey, pa, [], [], isMaster);

                        if (isMaster) {
                                this._updateAvailablePlanningAreas();
                        }
                        if (sSelectedKey === "Product Demand") {
                                const oVBox = this.byId("dynamicTabBar");
                                const tableCount = oVBox.getItems().length;
                                this.byId("btnAdd").setVisible(tableCount === 0);
                        }

                },

                onAddRowPress: function (oEvent) {
                        const oTable = this._getTableFromEvent(oEvent);
                        if (!oTable) return;
                        const selectedPA = oTable._currentPlanningAreaBase;
                        const path = "viewModel>/lockeyMapOptions/" + selectedPA;

                        const oModel = oTable.getModel();
                        const aRows = oModel.getProperty("/rows") || [];

                        aRows.push({
                                key: "",
                                VALUE: "",
                                CUSTOMIZE1: "",
                                CUSTOMIZE2: "",
                                CUSTOMIZE: false,
                                DTStatus: "",
                                isVal: false,
                                isConcat: "",
                                column5: "",
                                column6: false,
                                isNew: true,
                                PRODUCT_TYPES: []
                        });

                        oModel.setProperty("/rows", aRows);

                        setTimeout(() => {
                                const items = oTable.getItems();
                                const lastRow = items[items.length - 1];
                                if (lastRow) {
                                        const oComboBox = lastRow.getCells()[6].getItems()[1];
                                        if (oComboBox) {
                                                oComboBox.bindItems({
                                                        path,
                                                        templateShareable: false,
                                                        template: new Item({
                                                                key: "{viewModel>key}",
                                                                text: "{viewModel>Text}"
                                                        })
                                                });
                                        }
                                }
                        });

                },

                onRowSelection: function (oEvent, type) {
                        const oTable = this._getTableFromEvent(oEvent);
                        if (!oTable) return;

                        const oModel = oTable.getModel();
                        const aRows = oModel.getProperty("/rows") || [];
                        const isDefault = type === "Default";
                        const isCustomize = type === "Customize";

                        aRows.push({
                                key: isDefault ? "Default" : "Customize",
                                VALUE: "",
                                CUSTOMIZE1: "",
                                CUSTOMIZE2: "",
                                CUSTOMIZE: isCustomize,
                                DTStatus: isDefault ? "String" : "",
                                isVal: isDefault,
                                isConcat: "",
                                column5: "",
                                column6: false,
                                isNew: false,
                                PRODUCT_TYPES: []
                        });
                        oModel.setProperty("/rows", aRows);
                },

                onDeleteRow: function (oEvent) {
                        const oTable = this._getTableFromEvent(oEvent);
                        const oItem = oEvent.getSource().getParent();
                        if (!oTable) return;

                        const oModel = oTable.getModel();
                        const aRows = oModel.getProperty("/rows") || [];
                        const index = oTable.indexOfItem(oItem);
                        aRows.splice(index, 1);
                        oModel.setProperty("/rows", aRows);
                },

                _getTableFromEvent: function (oEvent) {
                        const oToolbar = oEvent.getSource().getParent();
                        return oToolbar.getParent();
                },
                hasEntityChanged: function (entityKey) {
                        const initial = that._groupedData[entityKey] || {};
                        const current = that._currentGroupedData[entityKey] || {};
                        return JSON.stringify(initial) !== JSON.stringify(current);
                },

                onSave: function () {
                        const that = this;
                        const mapping = [];
                        const sErrorMessage = [];
                        let hasAnyChanges = false;
                        const tableSequenceMap = {};
                        Object.keys(this._tableDataMap).forEach(entityKey => {
                                const oTable = that._tableDataMap[entityKey];
                                const eKey = entityKey.split("_")[0];

                                if (!that.hasEntityChanged(eKey)) return;

                                hasAnyChanges = true;

                                if (!tableSequenceMap[eKey]) tableSequenceMap[eKey] = 0;
                                const tableSequence = tableSequenceMap[eKey]++;

                                const oItems = oTable.getItems();
                                const oToolbar = oTable.getHeaderToolbar();
                                const cbPA = oToolbar.getContent()[0].getItems().find(ctrl => ctrl.isA("sap.m.ComboBox"));
                                const txtPA = oToolbar.getContent()[0].getItems().find(ctrl => ctrl.isA("sap.m.Text"));
                                const PlanningArea = (cbPA && cbPA.getSelectedKey()) || (txtPA && txtPA.getText()) || "";
                                const oViewModel = this.getView().getModel("viewModel");
                                const lockeyMapOptions = oViewModel.getProperty("/lockeyMapOptions") || {};

                                let plannedArea = lockeyMapOptions.hasOwnProperty(PlanningArea) ? PlanningArea : "";

                                if (!plannedArea) {
                                        sErrorMessage.push(`In ${eKey} Tab: Attribute is missing`);
                                        return;
                                }
                                if (oItems.length === 0) {
                                        sErrorMessage.push(`${eKey} - ${plannedArea}: No fields mapped for this table`);
                                        return;
                                }

                                const TRANSACTIONAL_ENTITIES = [
                                        "Component Coefficient",
                                        "Sales History",
                                        "Resource Capacity",
                                        "Capacity Consumption",
                                ];
                                const isTransactional = TRANSACTIONAL_ENTITIES.includes(eKey);
                                if (isTransactional) {
                                        const tableIndex = tableSequence;
                                        plannedArea = plannedArea + "_" + tableIndex;
                                }
                                let productTypes = "";
                                if (eKey == "Product") {
                                        const oMulti = oToolbar.getContent().find(c => c.isA("sap.m.MultiComboBox"));
                                        if (oMulti) {
                                                const selectedKeys = oMulti.getSelectedKeys();
                                                productTypes = selectedKeys.join("/");
                                        }
                                }
                                oItems.forEach((oItem, index) => {
                                        const aCells = oItem.getCells();
                                        const sBTPField = aCells[0]?.getSelectedKey() || "";
                                        const sValue = aCells[1]?.getValue() || "";
                                        const sMappingField = aCells[6]?.getItems()[0]?.getValue() || "";
                                        const bRequired = aCells[7]?.getSelected() || false;
                                        if (!sBTPField) {
                                                sErrorMessage.push(`${eKey} - ${plannedArea} - Row ${index + 1}: Missing BTP field`);
                                                return;
                                        }
                                        if (!sMappingField) {
                                                sErrorMessage.push(`${eKey} - ${plannedArea} - Row ${index + 1}: Missing Mapping field`);
                                                return;
                                        }

                                        if (sBTPField === "Default") {
                                                const sDataType = aCells[2]?.getSelectedKey() || "String";
                                                if (!sValue) {
                                                        sErrorMessage.push(`${eKey} - ${plannedArea} - Row ${index + 1}: Missing fields`);
                                                        return;
                                                }
                                                mapping.push({
                                                        ENTITY_KEY: eKey,
                                                        BTP_FIELD: sValue,
                                                        MAPPING_FIELD: sMappingField,
                                                        REQUIRED: bRequired,
                                                        PLANNING_AREA: plannedArea,
                                                        OPERATOR: "",
                                                        DATA_TYPE: sDataType,
                                                        Type: "D",
                                                        SELECTION: productTypes,
                                                        ENTITY_DESC: tableSequence.toString()

                                                });
                                        } else if (sBTPField === "Customize") {
                                                const sCustomize1 = aCells[3]?.getSelectedKey() || "";
                                                const sOperator = aCells[4]?.getSelectedKey() || "";
                                                const sCustomize2 = aCells[5]?.getSelectedKey() || "";
                                                let mField = `${sCustomize1}_OPERATOR_${sCustomize2}`;
                                                if (!sCustomize1 || !sOperator || !sCustomize2) {
                                                        sErrorMessage.push(`${eKey} - ${plannedArea} - Row ${index + 1}: Missing fields`);
                                                        return;
                                                }
                                                mapping.push({
                                                        ENTITY_KEY: eKey,
                                                        BTP_FIELD: sMappingField,
                                                        MAPPING_FIELD: mField,
                                                        REQUIRED: bRequired,
                                                        PLANNING_AREA: plannedArea,
                                                        OPERATOR: sOperator,
                                                        Type: "C",
                                                        SELECTION: productTypes,
                                                        DATA_TYPE: "",
                                                        ENTITY_DESC: tableSequence.toString()
                                                });
                                        } else {
                                                mapping.push({
                                                        ENTITY_KEY: eKey,
                                                        BTP_FIELD: sBTPField,
                                                        MAPPING_FIELD: sMappingField,
                                                        REQUIRED: bRequired,
                                                        PLANNING_AREA: plannedArea,
                                                        OPERATOR: "",
                                                        Type: "",
                                                        SELECTION: productTypes,
                                                        DATA_TYPE: "",
                                                        ENTITY_DESC: tableSequence.toString()
                                                });
                                        }
                                });
                        });
                        if (!hasAnyChanges) {
                                MessageToast.show("No changes to save.");
                                return;
                        }
                        if (sErrorMessage.length) {
                                MessageBox.warning(sErrorMessage.join("\n"));
                                return;
                        }

                        if (!mapping.length) {
                                MessageToast.show("No data to save.");
                                return;
                        }

                        const oModel = this.getOwnerComponent().getModel("BModel");
                        this.showBusy();
                        oModel.callFunction("/maintainMappings", {
                                urlParameters: { mappingData: JSON.stringify(mapping) },
                                success: function () {
                                        MessageToast.show("Mappings saved successfully!");
                                        that._groupedData = JSON.parse(JSON.stringify(that._currentGroupedData));
                                        that.hideBusy();
                                },
                                error: function () {
                                        MessageToast.show("Failed to save mappings.");
                                        that.hideBusy();
                                }
                        });
                },
                // onSave: function () {
                //         const that = this;
                //         const mapping = [];
                //         const sErrorMessage = [];
                //         let hasAnyChanges = false;

                //         if (this._isExcelUpload) {
                //                 // Save everything from _currentGroupedData
                //                 const grouped = this._currentGroupedData || {};

                //                 Object.keys(grouped).forEach(entityKey => {
                //                         const entityData = grouped[entityKey];
                //                         if (!entityData) return;

                //                         Object.keys(entityData).forEach(pa => {
                //                                 const rows = entityData[pa] || [];
                //                                 rows.forEach((row, index) => {
                //                                         const entry = that._convertRowToMapping(entityKey, pa, row, index, sErrorMessage);
                //                                         if (entry) {
                //                                                 mapping.push(entry);
                //                                                 hasAnyChanges = true;
                //                                         }
                //                                 });
                //                         });
                //                 });

                //         } else {
                //                 // Normal save → only changed tabs (existing logic)
                //                 Object.keys(this._tableDataMap).forEach(entityKey => {
                //                         const oTable = that._tableDataMap[entityKey];
                //                         const eKey = entityKey.split("_")[0];
                //                         if (!that.hasEntityChanged(eKey)) {
                //                                 return;
                //                         }

                //                         hasAnyChanges = true;

                //                         const oItems = oTable.getItems();
                //                         const oToolbar = oTable.getHeaderToolbar();
                //                         const cbPA = oToolbar.getContent()[0].getItems().find(ctrl => ctrl.isA("sap.m.ComboBox"));
                //                         const txtPA = oToolbar.getContent()[0].getItems().find(ctrl => ctrl.isA("sap.m.Text"));
                //                         const PlanningArea = (cbPA && cbPA.getSelectedKey()) || (txtPA && txtPA.getText()) || "";

                //                         oItems.forEach((oItem, index) => {
                //                                 const entry = that._convertUIItemToMapping(eKey, PlanningArea, oItem, index, sErrorMessage);
                //                                 if (entry) mapping.push(entry);
                //                         });
                //                 });
                //         }

                //         if (!hasAnyChanges) {
                //                 MessageToast.show("No changes to save.");
                //                 return;
                //         }

                //         if (sErrorMessage.length) {
                //                 MessageBox.error(sErrorMessage.join("\n"));
                //                 return;
                //         }

                //         if (!mapping.length) {
                //                 MessageToast.show("No data to save.");
                //                 return;
                //         }

                //         const oModel = this.getOwnerComponent().getModel("BModel");
                //         this.showBusy();
                //         oModel.callFunction("/maintainMappings", {
                //                 urlParameters: { mappingData: JSON.stringify(mapping) },
                //                 success: function () {
                //                         MessageToast.show("Mappings saved successfully!");
                //                         that.hideBusy();
                //                         that._isExcelUpload = false; // Reset after save
                //                 },
                //                 error: function () {
                //                         MessageToast.show("Failed to save mappings.");
                //                         that.hideBusy();
                //                 }
                //         });
                // },

                // _convertRowToMapping: function (entityKey, pa, row, index, sErrorMessage) {
                //         let entry = {
                //                 ENTITY_KEY: entityKey,
                //                 PLANNING_AREA: pa,
                //                 REQUIRED: row.column6 || false,
                //                 SELECTION: (row.PRODUCT_TYPES || []).join("/")
                //         };

                //         if (row.key === "Default") {
                //                 entry.Type = "D";
                //                 entry.BTP_FIELD = row.VALUE || "";
                //                 entry.MAPPING_FIELD = row.column5 || "";
                //                 entry.DATA_TYPE = row.DTStatus || "String";

                //                 if (!entry.BTP_FIELD || !entry.MAPPING_FIELD) {
                //                         sErrorMessage.push(`${entityKey} / ${pa} - Row ${index + 1}: Missing Default fields`);
                //                         return null;
                //                 }

                //         } else if (row.key === "Customize") {
                //                 entry.Type = "C";
                //                 entry.BTP_FIELD = row.column5 || "";
                //                 entry.OPERATOR = row.column4 || "";
                //                 entry.CUSTOMIZE1 = row.CUSTOMIZE1 || "";
                //                 entry.CUSTOMIZE2 = row.CUSTOMIZE2 || "";
                //                 entry.MAPPING_FIELD = `${row.CUSTOMIZE1 || ""}_OPERATOR_${row.CUSTOMIZE2 || ""}`;

                //                 if (!entry.BTP_FIELD || !entry.MAPPING_FIELD || !entry.OPERATOR) {
                //                         sErrorMessage.push(`${entityKey} / ${pa} - Row ${index + 1}: Missing Customize fields`);
                //                         return null;
                //                 }

                //         } else {
                //                 entry.Type = "";
                //                 entry.BTP_FIELD = row.key || "";
                //                 entry.MAPPING_FIELD = row.column5 || "";

                //                 if (!entry.BTP_FIELD || !entry.MAPPING_FIELD) {
                //                         sErrorMessage.push(`${entityKey} / ${pa} - Row ${index + 1}: Missing fields`);
                //                         return null;
                //                 }
                //         }

                //         return entry;
                // },

                showBusy: function () {
                        that._busyCount++;
                        if (that._busyCount === 1) {
                                sap.ui.core.BusyIndicator.show(0);
                        }
                },
                hideBusy: function () {
                        if (that._busyCount > 0) {
                                that._busyCount--;
                                if (that._busyCount === 0) {
                                        sap.ui.core.BusyIndicator.hide();
                                }
                        }
                },
                onCollapseExpandPress: function () {
                        var oNavigationList = this.byId("navigationList");
                        var bExpanded = oNavigationList.getExpanded();

                        oNavigationList.setExpanded(!bExpanded);
                },
                onDownload: function () {
                        this._saveCurrentTabData();
                        const grouped = this._currentGroupedData || {};
                        const allData = [];
                        const validationErrors = [];

                        Object.keys(grouped).forEach(entityKey => {
                                const entityData = grouped[entityKey];
                                if (!entityData) return;

                                Object.keys(entityData).forEach(pa => {
                                        const rows = entityData[pa] || [];

                                        rows.forEach((row, index) => {
                                                let entry = {
                                                        ENTITY_KEY: entityKey,
                                                        PLANNING_AREA: pa,
                                                        REQUIRED: row.column6 || false,
                                                        SELECTION: (row.PRODUCT_TYPES || []).join("/"),
                                                };

                                                if (row.key === "Default") {
                                                        entry.Type = "D";
                                                        entry.BTP_FIELD = row.VALUE || "";
                                                        entry.MAPPING_FIELD = row.column5 || "";
                                                        entry.DATA_TYPE = row.DTStatus || "String";

                                                        if (!entry.BTP_FIELD || !entry.MAPPING_FIELD) {
                                                                validationErrors.push(
                                                                        `${entityKey} / ${pa} - Row ${index + 1}: Missing Default fields`
                                                                );
                                                                return;
                                                        }

                                                        allData.push(entry);
                                                        return;
                                                }

                                                if (row.key === "Customize") {
                                                        entry.Type = "C";
                                                        entry.BTP_FIELD = row.column5 || "";
                                                        entry.OPERATOR = row.column4 || "";

                                                        entry.CUSTOMIZE1 = row.CUSTOMIZE1 || "";
                                                        entry.CUSTOMIZE2 = row.CUSTOMIZE2 || "";

                                                        entry.MAPPING_FIELD =
                                                                `${row.CUSTOMIZE1 || ""}_OPERATOR_${row.CUSTOMIZE2 || ""}`;

                                                        if (!entry.BTP_FIELD || !entry.MAPPING_FIELD || !entry.OPERATOR) {
                                                                validationErrors.push(
                                                                        `${entityKey} / ${pa} - Row ${index + 1}: Missing Customize fields`
                                                                );
                                                                return;
                                                        }

                                                        allData.push(entry);
                                                        return;
                                                }

                                                entry.Type = "";
                                                entry.BTP_FIELD = row.key || "";
                                                entry.MAPPING_FIELD = row.column5 || "";

                                                if (!entry.BTP_FIELD || !entry.MAPPING_FIELD) {
                                                        validationErrors.push(
                                                                `${entityKey} / ${pa} - Row ${index + 1}: Missing fields`
                                                        );
                                                        return;
                                                }

                                                allData.push(entry);
                                        });
                                });
                        });

                        if (validationErrors.length) {
                                sap.m.MessageBox.error(
                                        "Download failed due to incomplete fields:\n\n" +
                                        validationErrors.join("\n")
                                );
                                return;
                        }

                        if (!allData.length) {
                                sap.m.MessageToast.show("No data available for export.");
                                return;
                        }

                        const aCols = [
                                { label: "ENTITY_KEY", property: "ENTITY_KEY" },
                                { label: "PLANNING_AREA", property: "PLANNING_AREA" },
                                { label: "BTP_FIELD", property: "BTP_FIELD" },
                                { label: "MAPPING_FIELD", property: "MAPPING_FIELD" },
                                { label: "CUSTOMIZE1", property: "CUSTOMIZE1" },
                                { label: "CUSTOMIZE2", property: "CUSTOMIZE2" },
                                { label: "OPERATOR", property: "OPERATOR" },
                                { label: "REQUIRED", property: "REQUIRED" },
                                { label: "Type", property: "Type" },
                                { label: "SELECTION", property: "SELECTION" },
                                { label: "DATA_TYPE", property: "DATA_TYPE" }
                        ];

                        const oSettings = {
                                workbook: { columns: aCols },
                                dataSource: allData,
                                fileName: "Panel_Mapping_Export.xlsx",
                                sheetName: "All Mappings",
                                worker: true
                        };

                        const oSheet = new Spreadsheet(oSettings);
                        oSheet.build().finally(() => oSheet.destroy());
                },
                onUpload: function (e) {
                        this.importExcel(e.getParameter("files") && e.getParameter("files")[0]);
                },
                importExcel: function (file) {
                        that.showBusy()
                        that.oExcel = {
                                SEEDDATA: [],
                        };
                        if (file && window.FileReader) {
                                var reader = new FileReader();
                                reader.onload = function (e) {
                                        var data = e.target.result;
                                        var workbook = XLSX.read(data, {
                                                type: 'binary'
                                        });
                                        workbook.SheetNames.forEach(function (sheetName) {
                                                var excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

                                                if (excelData.length > 0) {
                                                        that._currentGroupedData = that._groupByEntityAndPlanningArea(excelData);
                                                        that._tableDataMap = {};
                                                        const oNavList = that.byId("navigationList");
                                                        oNavList.setSelectedKey("Location");
                                                        that._showNavigationTab("Location", "Master");
                                                        that.hideBusy()

                                                }
                                                else {
                                                        that.hideBusy()
                                                        return MessageToast.show("Wrong file uploaded")
                                                }
                                        });
                                }
                                reader.onerror = function (ex) {
                                        that.hideBusy()
                                        console.log(ex);

                                };
                                reader.readAsBinaryString(file);

                        }

                },
                onRefreshPressed: function () {
                        this.onInit();
                },

                 _groupPlanningAreaData: function (mEntityDetails,tEntityDetails) {
                        const that = this;
                        const lockeyMapOptions = {};

                        (mEntityDetails || []).forEach(ent => {
                                const rawName = ent.$.Name;
                                const planningArea = rawName.startsWith(that.sPrefix)
                                        ? rawName.slice(that.sPrefix.length)
                                        : rawName;
                                const mappingFields = ent.Property.map(item => ({
                                        key: item["$"].Name,
                                        Text: item["$"].Name,
                                }));

                                lockeyMapOptions[planningArea] = mappingFields;
                        });
                        (tEntityDetails || []).forEach(ent => {
                                const planningArea = ent.$.Name;
                                const mappingFields = ent.Property.map(item => ({
                                        key: item["$"].Name,
                                        Text: item["$"].Name,
                                }));

                                lockeyMapOptions[planningArea] = mappingFields;
                        });

                        that.getView().getModel("viewModel").setProperty("/lockeyMapOptions", lockeyMapOptions);
                },

                _loadMappingDataForPlanningArea: function (evt, selectedPlanningArea, tableId) {
                        const that = this;
                        const aTable = this._getTableFromEvent(evt);
                        if (!aTable) return;
                        const oModel = aTable.getModel();
                        const aRows = oModel.getProperty("/rows") || [];
                        const mappingFields = that.getView().getModel("viewModel").getProperty("/lockeyMapOptions/" + selectedPlanningArea);
                        if (mappingFields) {
                                const validMappingKeys = mappingFields.map(item => item.key);
                                aRows.forEach(function (row) {
                                        const column5Value = row.column5;
                                        if (!validMappingKeys.includes(column5Value)) {
                                                row.column5 = "";
                                        }
                                });

                                oModel.setProperty("/rows", aRows);
                                const oTable = that._tableDataMap[tableId];
                                oTable.getItems().forEach(function (oItem) {
                                        const oComboBox = oItem.getCells()[6].getItems()[1];
                                        if (oComboBox instanceof sap.m.ComboBox) {
                                                oComboBox.bindItems({
                                                        path: "viewModel>/lockeyMapOptions/" + selectedPlanningArea,
                                                        templateShareable: false,
                                                        template: new Item({
                                                                key: "{viewModel>key}",
                                                                text: "{viewModel>Text}"
                                                        })
                                                });
                                        }
                                });
                        } else {
                                console.error("No mapping fields found for planning area: " + selectedPlanningArea);
                        }
                },

                onInfoPressed: function () {
                        const oNavList = this.byId("navigationList");
                        const selectedEntity = oNavList.getSelectedKey();

                        if (!this.sampleMasterData || !this.sampleMasterData[selectedEntity]) {
                                sap.m.MessageToast.show("No sample data available");
                                return;
                        }
                        const aRecords = this.sampleMasterData[selectedEntity].slice(0, 5);
                        const displayKeyMap = {
                                "Location Line": "Resource",
                                "Line Capacity": "Production Source Resource"
                        };

                        const displayEntity = displayKeyMap[selectedEntity] || selectedEntity;


                        if (!aRecords.length) {
                                sap.m.MessageToast.show("No sample data available");
                                return;
                        }

                        let fields = Object.keys(aRecords[0])
                        if (selectedEntity === "Location Line" || selectedEntity === "Line Capacity") {
                                fields = fields.map(f => f === "RESTRICTION" ? "RESOURCE" : f);
                        }

                        const oTable = new sap.m.Table({
                                fixedLayout: false,
                                columns: fields.map(f => new sap.m.Column({
                                        header: new sap.m.Text({ text: f })
                                }))
                        });

                        aRecords.forEach(rec => {
                                oTable.addItem(
                                        new sap.m.ColumnListItem({
                                                cells: fields.map(f => {
                                                        let value = f;
                                                        if (f === "RESOURCE") {
                                                                value = rec["RESTRICTION"];
                                                        } else {
                                                                value = rec[f];
                                                        }
                                                        return new sap.m.Text({ text: value });
                                                })
                                        })
                                );
                        });

                        if (this._oSamplePopover) {
                                this._oSamplePopover.destroy();
                        }

                        this._oSamplePopover = new sap.m.Popover({
                                title: displayEntity + " - Sample Data",
                                placement: "Bottom",
                                content: [
                                        new sap.m.ScrollContainer({
                                                horizontal: true,
                                                vertical: true,
                                                content: [oTable]
                                        })
                                ],
                                showHeader: true
                        });

                        this.getView().addDependent(this._oSamplePopover);
                        this._oSamplePopover.openBy(this.byId("btnInfo"));
                },

                onPlayPressed: function () {

                        const selectedEntity = this.byId("navigationList").getSelectedKey();

                        if (!selectedEntity) {
                                sap.m.MessageToast.show("Select an entity first");
                                return;
                        }

                        sap.m.MessageBox.alert(
                                "Do you want to run the job for " + selectedEntity + "?",
                                {
                                        title: "Execute Job",
                                        actions: ["Yes", "No"],
                                        onClose: (action) => {
                                                if (action === "Yes") {
                                                        // this._executeJob(selectedEntity);
                                                }
                                        }
                                }
                        );
                },

                _executeJob: function (entityKey) {
                        this.showBusy();

                        const oModel = this.getOwnerComponent().getModel("BModel");

                        switch (entityKey) {
                                case "Master":
                                        this._executeMasterJob(oModel);
                                        break;
                                case "Location":
                                        this._executeLocationJob(oModel);
                                        break;
                                case "Customer Group":
                                        this._executeCustomerGroupJob(oModel);
                                        break;
                                case "Product":
                                        this._executeProductJob(oModel);
                                        break;
                                case "Location Product":
                                        this._executeLocationProductJob(oModel);
                                        break;
                                case "Bill Of Material":
                                        this._executeBOMJob(oModel);
                                        break;
                                case "Location Line":
                                        this._executeLocationLineJob(oModel);
                                        break;
                                case "Line Capacity":
                                        this._executeLineCapacityJob(oModel);
                                        break;
                                case "Component Coefficient":
                                        this._executeComponentCoefficientJob(oModel);
                                        break;
                                case "Sales History":
                                        this._executeSalesHistoryJob(oModel);
                                        break;
                                case "Resource Capacity":
                                        this._executeResourceCapacityJob(oModel);
                                        break;
                                case "Capacity Consumption":
                                        this._executeCapacityConsumptionJob(oModel);
                                        break;
                                case "Product Demand":
                                        this._executeProductDemandJob(oModel);
                                        break;
                                default:
                                        this.hideBusy();
                                        sap.m.MessageBox.error("No job defined for this entity: " + entityKey);
                                        break;
                        }
                },

                _executeLocationJob: function (oModel) {
                        oModel.callFunction("/runLocationJob", {
                                method: "POST",
                                success: this._onJobSuccess.bind(this, "Location"),
                                error: this._onJobError.bind(this, "Location")
                        });
                },

                _executeCustomerGroupJob: function (oModel) {
                        oModel.callFunction("/runCustomerGroupJob", {
                                method: "POST",
                                success: this._onJobSuccess.bind(this, "Customer Group"),
                                error: this._onJobError.bind(this, "Customer Group")
                        });
                },

                _onJobSuccess: function (entityKey, oData) {
                        this.hideBusy();
                        sap.m.MessageBox.success("Transformation job executed successfully for " + entityKey);
                },

                _onJobError: function (entityKey, err) {
                        this.hideBusy();
                        sap.m.MessageBox.error("Failed to execute job for " + entityKey);
                        console.error(err);
                }

        });
});

