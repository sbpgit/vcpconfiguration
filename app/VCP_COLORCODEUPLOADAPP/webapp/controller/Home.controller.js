sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "sap/ui/Device",
    "sap/ui/core/dnd/DragInfo",
    "sap/ui/core/dnd/DropInfo"
], (Controller, JSONModel, MessageToast, Filter, MessageBox, FilterOperator, Utils, DragInfo, DropInfo, library) => {
    "use strict";
    var that;
    // var DropLayout = library.dnd.DropLayout;
    // var DropPosition = library.dnd.DropPosition;

    return Controller.extend("vcpapp.vcpcolorcodeuploadapp.controller.Home", {
        onInit() {
            that = this;
            that.getOwnerComponent().getModel("colorModel")
            that.oGModel = that.getOwnerComponent().getModel("oGModel");

        },
        // 1stCall after Init
        onAfterRendering: function () {
            sap.ui.core.BusyIndicator.show();
            that.getOwnerComponent().getModel("colorModel").read("/getColorCodeChar", {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    // removing duplicates
                    oData.results = that.removeDuplicatesByFields(oData.results, ["COLOR_CODE", "COLOR_NAME"]);
                    //  oData.results = new Set(oData.results.map(item => item.COLOR_CODE?.toUpperCase()));
                    that.oDat = JSON.parse(JSON.stringify(oData.results)); // deep clone
                    //  var Data = that.getOwnerComponent().getModel("oDataModel")
                    let oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData({
                        results: oData.results
                    })
                    that.getView().byId("classuploadCC").setModel(oModel);
                },
                error: function (err) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageToast.show("Error getting while fetching data");
                }
            });
        },

        /// removing duplicates
        removeDuplicatesByFields: function (dataArray, keyFields) {
            let seen = new Set();
            return dataArray.filter(item => {
                let key = keyFields.map(field => item[field] ?? '').join('|');
                if (seen.has(key)) {
                    return false;
                } else {
                    seen.add(key);
                    return true;
                }
            });
        },

        // drag and drop function
        onDropcolorcode: function (oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDroppedItem = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");

            if (!oDraggedItem || !oDroppedItem) return;

            var oTable = this.byId("classuploadCC");
            var oBinding = oTable.getBinding("items");

            var oModel = oBinding.getModel();
            var aItems = oModel.getProperty("/results");

            var oDraggedCtx = oDraggedItem.getBindingContext();
            var oDroppedCtx = oDroppedItem.getBindingContext();

            var iDraggedIndex = aItems.indexOf(oDraggedCtx.getObject());
            var iDroppedIndex = aItems.indexOf(oDroppedCtx.getObject());

            //  the first item cant drag & drop 
            if (iDraggedIndex === 0 || iDroppedIndex === 0) {
                sap.m.MessageToast.show("First row cannot be moved.");
                return;
            }

            // Adjust drop index if dropped after
            if (sDropPosition === "After") {
                iDroppedIndex++;
            }

            sap.m.MessageToast.show("Click 'Update' to continue updating the color code order.");

            // Move dragged item to new position
            var oDraggedData = aItems.splice(iDraggedIndex, 1)[0];
            aItems.splice(iDroppedIndex, 0, oDraggedData);

            // Recalculate ORDER field (keeping index 0 fixed)
            aItems.forEach(function (item, index) {
                item.ORDER = index;
            });

            oModel.setProperty("/results", aItems);
            that.oPvsData = JSON.parse(JSON.stringify(aItems));
        },

        /// order changing and update function
        onSeqUpdate: function () {
            const oInitialData = that.oDat;
            const allData = that.oPvsData;

            allData.forEach(item => {
                delete item.__metadata;
            });

            const commonObjects = oInitialData.filter(obj1 =>
                allData.some(obj2 =>
                    obj1.ORDER === obj2.ORDER && obj1.COLOR_CODE !== obj2.COLOR_CODE
                )
            );

            if (commonObjects.length > 0) {
                sap.m.MessageBox.confirm("Do you want to update the color code order?", {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: sap.m.MessageBox.Action.NO,
                    onClose: function (sAction) {
                        if (sAction === sap.m.MessageBox.Action.YES) {
                            that.getOwnerComponent().getModel("colorModel").callFunction("/maintainColorCodeChars", {
                                urlParameters: {
                                    FLAG: "E",
                                    CCR: JSON.stringify(allData)
                                },

                                success: function (oData) {
                                    sap.ui.core.BusyIndicator.hide();
                                    sap.m.MessageToast.show("Successfully updated..")
                                    that.onAfterRendering()

                                },
                                error: function (err) {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageToast.show("Error updating color code Data");
                                }
                            });

                            // Perform update logic
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                            that.onAfterRendering(); // revert data
                        }
                    },

                });
            }
        },

        // downloading data
        oDnload_codedata: function () {
            sap.ui.core.BusyIndicator.show();
            that.getOwnerComponent().getModel("colorModel").read("/getColorCodeMaster", {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    oData.results = that.removeDuplicatesByFields(oData.results, ["COLOR_CODE", "COLOR_NAME"]);
                    var oMasterData = oData.results //JSON.parse(JSON.stringify(oData.results));
                    var oReferenceData = that.oDat;

                    // Create a Set of COLOR_CODEs from oReferenceData (for fast comparison)
                    var colorCodeSet = new Set(oReferenceData.map(item => item.COLOR_CODE?.toUpperCase()));

                    // Loop through oMasterData and set UPLOAD flag
                    oMasterData.forEach(function (item) {
                        if (item.COLOR_CODE && colorCodeSet.has(item.COLOR_CODE.toUpperCase())) {
                            item.UPLOAD = "TRUE";  // if match found
                        } else {
                            item.UPLOAD = "FALSE";   // if no match
                        }
                    });


                    var exportToExcel = function () {
                        var aCols = [
                            { label: 'ORDER', property: 'ORDER', width: 10 },
                            { label: 'COLOR_CODE', property: 'COLOR_CODE', width: 20 },
                            { label: 'COLOR_NAME', property: 'COLOR_NAME', width: 20 },
                            { label: 'COLOR_FAMILY', property: 'COLOR_FAMILY', width: 20 },
                            { label: 'COLORBLIND_RATIONALE', property: 'COLORBLIND_RATIONALE', width: 80 },
                            { label: 'UPLOAD', property: 'UPLOAD', width: 15 },

                        ];
                        var oSettings = {
                            workbook: {
                                columns: aCols,
                            },

                            dataSource: oMasterData,
                            fileName: 'Colorcode.xlsx',
                            worker: true
                        };

                        var oSheet = new sap.ui.export.Spreadsheet(oSettings);
                        oSheet.build().then(function () {
                            sap.m.MessageToast.show('Succesfully download');
                        }).finally(function () {
                            oSheet.destroy();
                        });
                    };
                    // Call the export function to download the Excel file
                    exportToExcel();

                },
                error: function (err) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error getting while fetching data");
                }
            });


        },

        /* ///////////////////  Upload functionality starts ////////////////////////// */
        uploadData: function (oEvent) {
            //  sap.ui.core.BusyIndicator.show();
            sap.ui.core.BusyIndicator.show({
                text: "Processing data, please wait..."
            });
            var oFileUploader = oEvent.getSource();
            var oFile = oEvent.getParameter("files")[0];
            var oFileName = oFile.name

            // if (oFileName.includes("Class IBP Characteristics")) {

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
            // }
            else {
                MessageToast.show("Upload valid Color code file")
                sap.ui.core.BusyIndicator.hide();
                return false
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
            resultArray1.forEach(item => {
                if (item.COLOR_CODE) {
                    item.COLOR_CODE = item.COLOR_CODE.toUpperCase();
                }
            });

            that.oUploadcolordata = that.removeDuplicatesByFields(resultArray1, ["COLOR_CODE", "COLOR_NAME"]);
            that.getOwnerComponent().getModel("colorModel").read("/getColorCodeMaster", {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    oData.results = that.removeDuplicatesByFields(oData.results, ["COLOR_CODE", "COLOR_NAME"]);
                    var oMasterData = oData.results // master data //JSON.parse(JSON.stringify(oData.results));
                    var resultArray12 = that.oUploadcolordata; // your second dataset

                    // Step 1: Check if white color is present in oMasterData
                    var whiteEntry = oMasterData.find(item =>
                        item.COLOR_CODE.toUpperCase() === "WHITE" ||
                        item.COLOR_NAME.toUpperCase() === "WHITE"
                    );

                    if (whiteEntry) {
                        // Step 2: Check if the same COLOR_CODE and COLOR_NAME exists in resultArray12
                        var isWhiteUploaded = resultArray12.some(item =>
                            item.COLOR_CODE === whiteEntry.COLOR_CODE &&
                            item.COLOR_NAME === whiteEntry.COLOR_NAME
                        );

                        if (!isWhiteUploaded) {
                            sap.m.MessageBox.error("White color must be uploaded with COLOR_CODE and COLOR_NAME.");
                            return; // Stop further processing
                        }
                    }


                    var notFoundItems = [];
                    resultArray12.forEach(function (item) {
                        var match = oMasterData.find(function (masterItem) {
                            return masterItem.COLOR_CODE === item.COLOR_CODE &&
                                masterItem.COLOR_NAME === item.COLOR_NAME;
                        });

                        if (!match) {
                            notFoundItems.push(item.COLOR_CODE + " - " + item.COLOR_NAME);
                        }
                    });

                    if (notFoundItems.length > 0) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.error("The following COLOR_CODE - COLOR_NAME pairs were not found:\n" + notFoundItems.join("\n"));
                        return; // stop further processing
                    }

                    //Continue with processing here

                    that.oUploadcolordata = that.removeDuplicatesByFields(resultArray1, ["COLOR_CODE", "COLOR_NAME"]);
                    that.uploadColorcode();

                }, error: function (err) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageToast.show("Error");
                }
            })


        },

        uploadColorcode: function () {
            var oUploadData = that.oUploadcolordata;
            var oDat = that.oDat;

            // Step 1: Get all entries with UPLOAD === "TRUE"
            let filtered = oUploadData.filter(item => item.UPLOAD === "TRUE");

            if (filtered.length !== 25) {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("Please upload exactly 25 color codes for planning.");
                return;
            }


            var oMainData = [];
            var oNonMaindata = [];

            var datColorCodes = new Set(oDat.map(item => item.COLOR_CODE));

            filtered.forEach(item => {
                if (datColorCodes.has(item.COLOR_CODE)) {
                    oMainData.push(item);
                } else {
                    oNonMaindata.push(item);
                }
            });

            if (oMainData.length < 25) {
                var matchedUpload = oMainData.concat(oNonMaindata)
            }
            else {
                var matchedUpload = oMainData
            }

            // Step 6: Clean up unnecessary properties
            matchedUpload.forEach(item => {
                delete item.COLORBLIND_RATIONALE;
                delete item.UPLOAD;
                delete item.COLOR_FAMILY;
            });

            // Step 7: Ensur #FFFFFF is first
            const whiteCode = "#FFFFFF";
            const whiteIndex = matchedUpload.findIndex(item => item.COLOR_CODE?.toUpperCase() === whiteCode);

            if (whiteIndex === -1) {
                matchedUpload.unshift({
                    COLOR_CODE: whiteCode,
                    COLOR_NAME: "White"
                });
            } else if (whiteIndex > 0) {
                const [whiteItem] = matchedUpload.splice(whiteIndex, 1);
                matchedUpload.unshift(whiteItem);
            }

            // Step 8: Add ORDER field
            matchedUpload = matchedUpload.slice(0, 25); // Ensure still max 25

            matchedUpload.forEach((item, index) => {
                item.ORDER = index;
            });

            // Save final result
            that.finalUploadList = matchedUpload;

            // Continue with confirmation dialog and upload
            if (that.finalUploadList.length > 0) {
                sap.m.MessageBox.confirm("Are you sure you want to update?", {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            sap.ui.core.BusyIndicator.show();
                            that.getOwnerComponent().getModel("colorModel").callFunction("/maintainColorCodeChars", {
                                urlParameters: {
                                    FLAG: "C",
                                    CCR: JSON.stringify(that.finalUploadList)
                                },
                                success: function (oData) {
                                    sap.ui.core.BusyIndicator.hide();
                                    that.onAfterRendering();
                                    sap.m.MessageToast.show("Uploaded Successfully");
                                },
                                error: function (error) {
                                    sap.ui.core.BusyIndicator.hide();
                                    sap.m.MessageToast.show("Upload Failed");
                                }
                            });
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                            that.onAfterRendering();
                        }
                    }.bind(this)
                });
            } else {
                sap.m.MessageBox.alert("No valid data to upload.");
            }
        },

        /* ///////////////////  Upload functionality ends ////////////////////////// */
        oSrchbyclrname: function (oEvent) {
            var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue");
            sQuery = sQuery ? sQuery.trim() : "";

            var oFilters = [];
            if (sQuery !== "") {
                oFilters.push(
                    new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("COLOR_NAME", sap.ui.model.FilterOperator.Contains, sQuery)
                        ],
                        and: false
                    })
                );
            }

            var oList = that.byId("classuploadCC");
            if (sQuery.length > 0) {
                oList.getBinding("items").filter(oFilters);
            } else {
                oList.getBinding("items").filter([])
            }
        },

        /* Below function Called when Upload the excel sheet based on Id's */
        onPressBrowse: function (oEvent) {
            var sId = oEvent.getSource();
            if (sId.sId.includes("idColoruploadCC")) {
                that.byId("oColorcodeCC").openFilePicker(oEvent);
                that.byId("oColorcodeCC").oBrowse.firePress(oEvent);
            }

        },

        // uploadColorcode: function () {
        //     var oUploadData = that.oUploadcolordata;

        //     let filtered = oUploadData.filter(item => item.UPLOAD === "TRUE");

        //     let filteredColorCodes = new Set(filtered.map(item => item.COLOR_CODE));

        //     // Arrays to store results
        //     let matchedData = [];
        //     let unmatchedData = [];

        //     // Loop through that.oDat to categorize based on COLOR_CODE match
        //    filteredColorCodes.forEach(item => {
        //         if (that.oDat.has(item)) {
        //             matchedData.push(item);     // Match found
        //         } else {
        //             unmatchedData.push(item);   // No match
        //         }
        //     });

        //     // Step 2: Keep only unique COLOR_CODE entries
        //     let uniqueMap = new Map();
        //     filtered.forEach(item => {
        //         const code = item.COLOR_CODE?.toUpperCase(); // ensure case-insensitive
        //         if (code && !uniqueMap.has(code)) {
        //             uniqueMap.set(code, item);
        //         }
        //     });

        //     let uniquecolorcode = Array.from(uniqueMap.values());

        //     // Step 3: Remove properties
        //     uniquecolorcode.forEach(item => {
        //         delete item.COLORBLIND_RATIONALE;
        //         delete item.UPLOAD;
        //         delete item.COLOR_FAMILY;
        //     });

        //     // Step 4: Always  White color at index 0 (if not already there)
        //     const whiteCode = "#FFFFFF";
        //     const hasWhite = uniquecolorcode.some(item => item.COLOR_CODE?.toUpperCase() === whiteCode);

        //     if (!hasWhite) {
        //         uniquecolorcode.unshift({
        //             COLOR_CODE: whiteCode,
        //             COLOR_NAME: "White"
        //         });
        //     } else {
        //         // Ensure it is at index 0 (move to front)
        //         const whiteIndex = uniquecolorcode.findIndex(item => item.COLOR_CODE?.toUpperCase() === whiteCode);
        //         if (whiteIndex > 0) {
        //             const [whiteItem] = uniquecolorcode.splice(whiteIndex, 1);
        //             uniquecolorcode.unshift(whiteItem);
        //         }
        //     }

        //     // Step 5: Set ORDER field (0-based)
        //     uniquecolorcode = uniquecolorcode.slice(0, 25); // Ensure max 25 entries
        //     uniquecolorcode.forEach((item, index) => {
        //         item.ORDER = index;
        //     });

        //     that.finalUploadList = uniquecolorcode;

        //     if (that.finalUploadList.length > 0) {
        //         sap.m.MessageBox.confirm(confirmationMessage, {
        //             // "Are you sure you want to update ?", {
        //             actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
        //             onClose: function (oAction) {
        //                 if (oAction === sap.m.MessageBox.Action.YES) {
        //                     sap.ui.core.BusyIndicator.show();
        //                     that.getOwnerComponent().getModel("colorModel").callFunction("/maintainColorCodeChars", {
        //                         urlParameters: {
        //                             FLAG: "C",
        //                             CCR: JSON.stringify(that.finalUploadList)
        //                         },
        //                         success: function (oData) {
        //                             sap.ui.core.BusyIndicator.hide();
        //                             onAfterRendering();
        //                             sap.m.MessageToast.show("Uploaded Successfully");
        //                         },
        //                         error: function (error) {
        //                             sap.ui.core.BusyIndicator.hide();
        //                             sap.m.MessageToast.show("Uploaded Failed");
        //                         }
        //                     });
        //                 }
        //             }.bind(this) // Ensure the context is bound to 'this'
        //         });
        //     } else {
        //         MessageBox.alert(confirmationMessage)
        //     }
        // },
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
                oStorage.put("nodeId", 70);
                //Generate a  URL for the second application
                var url = window.location.href.split('#')[0] + hash;
                //Navigate to second app
                sap.m.URLHelper.redirect(url, true);
            }
        },


    });
});