sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent"

], (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, UIComponent) => {
    "use strict";
    var oGModel, that;

    return Controller.extend("vcpapp.vcpprofileconfiguration.controller.PivotTable", {
        onInit() {
            that = this;
            this._myDelegate = {
                onmouseover: this._showPopover,
                onmouseout: this._clearPopover,
            };
            this.byId("targetPA").addEventDelegate(this._myDelegate, this);

            if (!that.primeFrag) {
                that.primeFrag = sap.ui.xmlfragment("vcpapp.vcpprofileconfiguration.view.primaryids", that);
                that.getView().addDependent(that.primeFrag);
            }

            that._tableSetting = sap.ui.xmlfragment(
                "vcpapp.vcpprofileconfiguration.view.PivotSettings",
                that
            );
            that._tableSort = sap.ui.xmlfragment(
                "vcpapp.vcpprofileconfiguration.view.PivotSort",
                that
            );

            that._prodFrag = sap.ui.xmlfragment(
                "vcpapp.vcpprofileconfiguration.view.Product",
                that
            );
        },
        _showPopover: function () {
            this._timeId = setTimeout(() => {
                this.byId("popoverPA").openBy(this.byId("targetPA"));
            }, 500);
        },
        _clearPopover: function () {
            clearTimeout(this._timeId);
            this.byId("popoverPA")?.close();
        },
        onAfterRendering: function () {
            oGModel = that.getOwnerComponent().getModel("oGModel");
            that.sortCols = [];
            that.settingDataSort = [];
            that.CharName = [];
            that.selCharName = [];
            that.settingData = undefined;
            // let obj = [{
            //     LOCATION_ID : 'PLUS',
            //     PRODUCT_ID : "000000000000000011"
            // }]
            // oGModel.setProperty("/PivotData", obj)
            var data = oGModel.getProperty("/PivotData");
            if (data !== undefined) {
                var weeks = oGModel.getProperty("/weeksData");
                that.byId("idPastPA").setValue(weeks[0].PAST_PERIODS);
                that.byId("idFuturePA").setValue(weeks[0].FUTURE_PERIODS);
                // that.byId("idPastPA").setValue(156);
                // that.byId("idFuturePA").setValue(0);
                that.getOwnerComponent().getModel("PModel").read("/palPrpidsPrimaryIds", {
                    success: function (oData) {
                        that.PrpidsPrimaryIds = oData.results
                        var data = oGModel.getProperty("/PivotData");
                        if(data.length <=0){
                            var excel = document.querySelector("[id*=mainDivPA]");
                            excel.innerHTML = " ";
                            MessageToast.show("No data For Selected fields");
                            return;
                        }
                        that.oSelProd = data[0].PRODUCT_ID;
                        that.selLoc = data[0].LOCATION_ID;
                        that.byId("idProdPA").setValue(that.oSelProd);
                        oGModel = that.getOwnerComponent().getModel("oGModel");
                        if (data === undefined) {
                            that.onBack();
                            return;
                        }
                        that.CharName = that.selCharName = [...new Set(data.map(o => o.CHAR_NAME))];
                        that.pivotData = data;
                        that.pivotTable(data);
                        var data = oGModel.getProperty("/PivotData")
                        var ProdData = oGModel.getProperty("/ProdData")
                        var aPrimeModel = new JSONModel();
                        var aProductModel = new JSONModel();
                        data = that.removeDuplicate(data, "PRIMARY_ID");
                        data = data.sort((a, b) => a.PRIMARY_ID - b.PRIMARY_ID);
                        that.byId("idPidcountPA").setText("Total PID's" + " - " + data.length);
                        aPrimeModel.setSizeLimit(data.length);
                        aPrimeModel.setData({
                            PrimeItems: data
                        })
                        sap.ui.getCore().byId("idPrimListPA").setModel(aPrimeModel)

                        aProductModel.setSizeLimit(ProdData.length);
                        aProductModel.setData({
                            results: ProdData
                        })
                        sap.ui.getCore().byId("idProdFragPA").setModel(aProductModel)
                       

                        
                    },
                    error: function (oData, error) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("error");
                    },
                });

            } else {
                that.onBack();
            }
        },
        jsonToPivotData: function (data) {
            const headers = [];
            const keys = Object.keys(data[0]);
            keys.forEach(key => {
                let label;
                switch (key) {
                    case "LOCATION_ID":
                        label = "Location";
                        break;
                    case "PRODUCT_ID":
                        label = "Product";
                        break;

                    case "CHARVAL_DESC":
                        label = "Char Desc";
                        break;
                    case "CHAR_NAME":
                        label = "Char Name";
                        break;

                    case "CHAR_VALUE":
                        label = "Char Val";
                        break;
                    case "PRIMARY_ID":
                        label = "Primary ID";
                        break;
                    case "QUANTITY":
                        label = "QUANTITY";
                        break;
                    case "GROUP_NAME":
                        label = "Group Name";
                        break;
                    case "WEIGHTAGE":
                        label = "WEIGHTAGE";
                        break;
                    default:
                        label = key;
                        break;
                }
                headers.push(label);
            });
            that.headers = headers;
            const data1 = data.map(item => Object.values(item));
            return [headers, ...data1];
        },
        onBack: function () {
            that.byId("idPastPA").setValue("");
            that.byId("idFuturePA").setValue("");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
            oRouter.navTo("Home", {}, true);
        },
        addScrollEvent: function () {
            var oPivotDiv = that.byId("mainDivPA").getDomRef();

            // Track previous scroll position
            var lastScrollTop = 0;
            var isEventTriggered = false;

            if (oPivotDiv) {
                oPivotDiv.addEventListener("scroll", function (e) {
                    var currentScrollTop = oPivotDiv.scrollTop;
                    var scrollHeight = oPivotDiv.scrollHeight;
                    var clientHeight = oPivotDiv.clientHeight;

                    // Check if the user has scrolled vertically (ignores horizontal scroll)
                    if (currentScrollTop > lastScrollTop) {
                        // User is scrolling vertically
                        // Check if scrolled to the bottom and the event hasn't already triggered
                        if (!isEventTriggered && that.hasMoreData && currentScrollTop + clientHeight >= scrollHeight - 1) {
                            // Trigger the event only once
                            isEventTriggered = true;

                            // Load more data
                            // that.skip += that.topCount;
                            // that.loadData(that.skip, that.topCount);

                            // Reset the flag after data loading is done (example: simulate data load completion)
                            setTimeout(function () {
                                isEventTriggered = false;
                            }, 1000); // Adjust the timeout according to data loading time
                        }
                    }

                    // Update last scroll position
                    lastScrollTop = currentScrollTop;
                });
            }
        },
        onSaveB: function () {
            if (that.PRIMARY_ID.length <= 0 && that.aUnSelected.length <= 0) {
                MessageToast.show("Please Select a Primary IDs")
            }
            else {
                if (that.PRIMARY_ID.length > 0) {
                    that.PRIMARY_ID.forEach(el => {
                        el.LOCATION_ID = that.selLoc;
                        el.PRODUCT_ID = that.selProd;
                        el.PRIMARY_ID = el.pid
                    });
                }

                if (that.aUnSelected.length > 0) {
                    that.aUnSelected.forEach(ele => {
                        ele.LOCATION_ID = that.selLoc;
                        ele.PRODUCT_ID = that.selProd;
                        ele.PRIMARY_ID = ele.pid
                    });

                }
                sap.ui.core.BusyIndicator.show();
                that.getOwnerComponent().getModel("BModel").callFunction("/maintainlocprodpid", {
                    method: "GET",
                    urlParameters: {
                        locPid: JSON.stringify(that.PRIMARY_ID),
                        DelData: JSON.stringify(that.aUnSelected)
                    },
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that.onAfterRendering();
                        MessageToast.show("Successfully Created");
                        // that.finalArray = [];
                    },
                    error: function (oData) {
                        MessageToast.show("Failed to create /update the product");
                        sap.ui.core.BusyIndicator.hide();
                    },
                });
                //         $.ajax({
                //                   url: "pal/assignPrimaryIds",
                //                   method: "POST",
                //                   headers: {
                //                     // "X-CSRF-Token": "Fetch",
                //                     "Authorization":"Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogInNadys5dmFmS3lwUmtnRUpaYW45bk5iK0ZoWUJUczFrU2hQdTZvTFIyMVE9In0.eyJqdGkiOiI1ODQ0YWI3NzAzNzU0ZTgxYWU4ODA4YmM1ODIwY2M2NSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzM0OTU2Njk5LCJleHAiOjE3MzQ5NjAyOTksImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.EHLbhh1LEDA3g6n8GhiRH4Np6Ch1FfM9OnYdyeSQ8ALHIKGWJ3kGXFGnTQNuXd_MxQf6h9ceGd5xiQD4tJoqmGDfSRZZIZJQTLrc78L_dhXNYra-NyKyxejS4uEMDFWk1s69nwUI0E2L6Zcasvw2t7yjlUq_og_ELsTH8Xt0CTXPz27E22Jru59QYfdOBlboCTJrHYpU9vxglA6ilDqbj56vX7NTHf9D-YItL1ilgt0Rhv1lU6FNuzcjl5JtZOqH-T-8r7o-dZbk3SLuI8hPQjB7QbErEjcJ6QibF3TKak_c-KHrWbODnoe6_bLMskq6zymMaAdaWHzHWyYqLzhMJA"
                //   // Include this header to request a CSRF token
                //                   },
                //                   contentType: "application/json",
                //                   data: JSON.stringify({
                //                     obj
                //                   }),
                //                   success: function (data) {
                //                     // Handle the success response
                //                     console.log("Action succeeded:", data);
                //                   },
                //                   error: function (error) {
                //                     // Handle the error response
                //                     console.error("Action failed:", error);
                //                   }
                //                 });
            }

        },
        onRestore: function () {
            that.byId("idPrimarysPA").removeAllTokens();
            that.byId("idPastPA").setValue("");
            that.byId("idFuturePA").setValue("");
            that.onAfterRendering();
        },
        pivotTable: function (data) {
            that.PData = data.map(item => item.PRIMARY_ID);
            that.PRIMARY_ID = [];
            that.aUnSelected = [];

            data = data.sort((a, b) => a.QUANTITY - b.QUANTITY);

            that.selLoc = data[0].LOCATION_ID;
            that.selProd = data[0].PRODUCT_ID;
            // if(that.selProd ==  that.byId("idProdPA").getValue()){
            //     that.byId("idProdPA").setValue("")
            // }else{
            //     that.byId("idProdPA").setValue(that.selProd)
            // }

            var existingDiv = document.querySelector(`[id*=mainDivPA]`);
            var newDiv = document.createElement("div");
            newDiv.id = `pivotGrid`;
            newDiv.textContent = "";
            var existingDiv = document.querySelector(`[id*='mainDivPA']`);

            existingDiv.appendChild(newDiv);
            var pivotDiv = document.querySelector(`[id*='pivotGrid']`);

            if (window.jQuery && window.jQuery.fn.pivot) {
                var pivotDiv = that.byId("mainDivPA").getDomRef();
                var pivotData = that.jsonToPivotData(data);
                // var pivotData = data;

                if (!rows) {
                    var rows = ["Location", "Product", "Primary ID", "QUANTITY"]; //common rows
                }
                that.curRows = rows;
                if (!cols) {
                    var cols = ["Group Name", "Char Name"];
                }
                if (!val) {
                    var val = ["Char Val"];
                }
                that.curVal = val;
                // var sum = $.pivotUtilities.aggregatorTemplates.sum;                
                // var numberFormat = $.pivotUtilities.numberFormat;
                // var intFormat = numberFormat({digitsAfterDecimal: 0});
                // $("#output").pivotUI(
                //     $.pivotUtilities.tipsData, {
                //       rows: ["sex", "smoker", "Age"],
                //       cols: ["day", "time"],
                //       vals: ["tip", "total_bill"],
                //       aggregatorName: "Sum over Sum",
                //       rendererName: "Table"
                //     });
                $(pivotDiv).pivot(pivotData, {
                    rows: rows,
                    cols: cols,
                    // aggregator: sum(intFormat)(["val"]),
                    // aggregator: $.pivotUtilities.aggregators["Sum"](val),
                    aggregator: $.pivotUtilities.aggregators["List Unique Values"](val),
                    renderer: $.pivotUtilities.renderers["Table"],
                    rendererOptions: {
                        // table: {
                        clickCallback: function (e, value, filters, pivotData) {
                            var names = [];
                            that.cellD = filters;
                            that.sPresVal = that.cellD["Primary ID"];



                            // $(pivotDiv).ready(function () {
                            //     $(pivotDiv).find("tr:last").hide();
                            //     $(pivotDiv).find('th[rowspan]').each(function (i) {
                            //     //     var temp =  that.PData.filter(el=> el === $(pivotDiv).find('th[rowspan]')[i].innerHTML);
                            //     //     if(temp.length > 0){
                            //     //     if($(pivotDiv).find('th[rowspan]')[i].innerHTML == that.sPresVal){
                            //     //         $(this).css('background', 'yellow')
                            //     //     }
                            //     // }
                            //     });
                            // }, 0);

                        }
                        // },

                    },

                    // sorters: {
                    //     "Primary ID": function (a, b) {
                    //         return 0;
                    //     },
                    //     Province: $.pivotUtilities.sortAs(),
                    //     "QUANTITY": function (a, b) { return b - a; }, //sort 
                    //     // "Primary ID": function(a,b){ return b-a; } //sort 
                    // }
                    sorters: {
                        "Primary ID": function (a, b) {
                            if (!that.sortCols || !that.sortCols.length) return 0;

                            const getCharValue = (id, col) =>
                                that.pivotData.find(o => o.PRIMARY_ID === id && o.CHAR_NAME === col)?.CHAR_VALUE;

                            const compareValues = (valA, valB) => {
                                if (typeof valA === "number" && typeof valB === "number") {
                                    return valA - valB;
                                } else {
                                    return String(valA).localeCompare(String(valB));
                                }
                            };

                            for (let i = 0; i < that.sortCols.length; i++) {
                                const col = that.sortCols[i];
                                const valA = getCharValue(a, col);
                                const valB = getCharValue(b, col);

                                if (valA !== undefined && valB !== undefined) {
                                    const result = compareValues(valA, valB);
                                    if (result !== 0) return result;
                                } else {
                                    return 0; // Stop comparison if any value is undefined
                                }
                            }

                            return 0; // All columns are equal
                        },


                        // Province: $.pivotUtilities.sortAs(),
                        "QUANTITY": function (a, b) {
                            if (that.sortCols && that.sortCols.length > 0) {
                                return 0;
                            } else {
                                return b - a;
                            }
                        },
                        // "Group Name": function (a, b) {
                        //     return b.localeCompare(a);
                        // },
                        "Group Name": function (a, b) {

                            const getCharValue = (id) =>
                                that.pivotData.find(o => o.GROUP_NAME === id)?.WEIGHTAGE;

                            const compareValues = (valA, valB) => {
                                if (typeof valA === "number" && typeof valB === "number") {
                                    return valB - valA;
                                } else {
                                    return String(valB).localeCompare(String(valA));
                                }
                            };
                            const valA = getCharValue(a);
                            const valB = getCharValue(b);
                            const result = compareValues(parseInt(valA), parseInt(valB));
                            return result
                        }
                        //     "WEIGHTAGE" :function (a, b) {
                        //         if (that.sortCols && that.sortCols.length > 0) {
                        //             return 0;
                        //         } else {
                        //             return b - a;
                        //         }
                        // }
                    }
                });
                $(pivotDiv).ready(function () {
                    $(pivotDiv).find('tbody th').each(function (i) {
                        that.index = i;
                        $(this).on('click', function (value, filters) {
                            let tr2 = $(pivotDiv).find('thead tr')[1];
                            let cellIn = $(this).index();

                            var temp = that.PData.filter(el => el == $(this).text());

                            // oPivotTable.getBinding("rows").sort([
                            //     new sap.ui.model.Sorter("EXTERIOR_ID_D", false),  // Ascending
                            //     // new sap.ui.model.Sorter("name", true)   // Descending
                            // ]);


                            if (temp.length > 0) {
                                if ($(this)[0].className.includes("colorGreen") === true) {
                                    $(this).removeClass("colorGreen");
                                    $(this).addClass("colorRed");
                                    var obj = { pid: $(this).text() };
                                    that.aUnSelected.push(obj);


                                } else if ($(this)[0].className.includes("colorYellow") === true) {
                                    $(this).removeClass("colorYellow");
                                    var index = that.PRIMARY_ID.findIndex(el => el.pid === $(this).text());
                                    that.PRIMARY_ID.splice(index, 1);
                                } else if ($(this)[0].className.includes("colorRed") === true) {
                                    $(this).removeClass("colorRed");
                                    $(this).addClass("colorGreen");
                                    var index = that.aUnSelected.findIndex(el => el.pid === $(this).text());
                                    that.aUnSelected.splice(index, 1);

                                } else {
                                    $(this).addClass('colorYellow');
                                    var obj = { pid: $(this).text() };
                                    that.PRIMARY_ID.push(obj);
                                }


                            }

                            // if($(this).rowspan <10 && cellIn >0){
                            //     cellIn +=2
                            // }
                            // let label = $(tr2).find('th')[cellIn].textContent

                            // // var clickedText = $(this).text(); // Get the text of the clicked <th>
                            // // var rowIndex = $(this).closest('tr').index()
                            // // that.sPivotText = clickedText
                            // // var rowHeader = $(pivotDiv).find('tbody .pvtRowLabel').eq(rowIndex).text().trim();
                            // // console.log(rowHeader)
                            // // alert("TH Clicked:\n" + clickedText);
                        })
                    })
                    // $(pivotDiv).find('thead th').each(function () {
                    //     $(this).on('click', function () {
                    //         var colHeader = $(this).text().trim();
                    //         alert("Column Header Clicked: " + colHeader);
                    //     });
                    // });
                    $(pivotDiv).find("tr:last").hide();
                    $(pivotDiv).find('thead:first tr:first th:last-child').hide();
                    $(pivotDiv).find('tbody tr').each(function () {
                        $(this).find('td:last-child').hide();
                    })
                }, 0);

                // $(pivotDiv).on('click', 'th', function(e) {
                //     var clickedColumnHeader = $(e.target).closest('th'); 
                //     var columnName = clickedColumnHeader.text();  
                //     // var columnHeader = $(pivotDiv).find('thead th').eq(-3).text()
                //     if(columnHeader == "Primary ID"){
                //         $(pivotDiv).ready(function () {
                //             $(pivotDiv).find("tr:last").hide();
                //             $(pivotDiv).find('th[rowspan]').each(function (i) {
                //                 if($(pivotDiv).find('th[rowspan]')[i].innerHTML == columnName){
                //                     $(this).css('background', 'yellow')
                //                 }
                //             });
                //         }, 0);
                //     }





                $(pivotDiv).ready(function () {
                    $(pivotDiv).find("tr:last").hide();
                    $(pivotDiv).find('th[rowspan]').each(function () {
                        if (parseInt($(this).attr('rowspan')) > 7) {
                            $(this).css('vertical-align', 'top');
                        }
                    });
                    let sSelPri = that.PrpidsPrimaryIds;

                    let aLoop = $(pivotDiv).find('tbody th')
                    for (var i = 2; i < aLoop.length; i++) {
                        for (var j = 0; j < sSelPri.length; j++) {
                            if (aLoop[i].innerHTML == sSelPri[j].PRIMARY_ID) {
                                $(aLoop[i]).addClass('colorGreen');
                            }
                        }
                    }
                    // var tr1 = $(pivotDiv).find('thead').find('tr')[0];
                    // var th1 = $(tr1).find('th')[0];
                    //         $(th1).attr("rowspan", 1);

                    // var tr2 = $(pivotDiv).find('thead').find('tr')[1];  
                    //     $(tr2).prepend('<th colspan="4" rowspan="1"></th>')  ;    



                    // var widthsHeadnew =[0];
                    // for (let i = 0; i < 2; i++) {
                    //     let w = $(pivotDiv).find('thead').find('tr:first').find(`th:eq(${i})`).outerWidth();
                    //     widthsHeadnew.push(widthsHeadnew[i] + w);
                    // }

                    // // let widthsHead21 = widthsHeadnew;
                    // // const secondTr1 = $(pivotDiv).find('thead').find('tr')[1]
                    // // let secondTrLength1 = $(secondTr1).find('th').length;
                    // // let widthsHead21 = [widthsHeadnew[1]];
                    // // // for (let i = 1; i < 2; i++) {
                    // //     // const secondTr1 = $(pivotDiv).find('thead').find('tr')[1]
                    // //     let w = $(secondTr1).find(`th:eq(${0})`).outerWidth();
                    // //     widthsHead21[0] = widthsHead21[0] + w
                    // //     // widthsHead21.push(widthsHead21[i] + w);
                    // // // }


                    // const thirTr1 = $(pivotDiv).find('thead').find('tr')[2]
                    // let ThirTrLength1 = $(thirTr1).find('th').length;
                    // let widthsHeadnew1 = [0];
                    // for (let i = 0; i < 4; i++) {
                    //     const thirTr1 = $(pivotDiv).find('thead').find('tr')[2]
                    //     let w = $(thirTr1).find(`th:eq(${i})`).outerWidth();
                    //     widthsHeadnew1.push(widthsHeadnew1[i] + w);
                    // }

                    // $(pivotDiv).find('thead').find('tr').each(function (e) {
                    //     if (e == 0) {
                    //         $(this).find('th').each(function (e) {
                    //             if (e == 0 || e === 1) {
                    //                 $(this).addClass('frezzThead');
                    //                 $(this).css('left', `${widthsHeadnew[e]}px`);
                    //                 // if()
                    //             }

                    //         });
                    //     }
                    //     if (e == 1) {
                    //         $(this).find('th').each(function (e) {
                    //             if (e == 0 || e === 1) {
                    //                 $(this).addClass('frezzThead');
                    //                 $(this).css('left', `${widthsHeadnew[e]}px`);
                    //                 // if()
                    //             }

                    //         });
                    //     }

                    //     if (e == 2) {
                    //         $(this).find('th').each(function (e) {
                    //             $(this).addClass('frezzThead');
                    //             $(this).css('left', `${widthsHeadnew1[e]}px`);

                    //         });
                    //     }

                    //     // if (e == 3) {
                    //     //     $(this).find('th').each(function (e) {
                    //     //         $(this).addClass('frezzThead');
                    //     //         $(this).css('left', `${widthsHead21[e]}px`);

                    //     //     });
                    //     // }
                    // });




















































                    // // $(pivotDiv).find('tbody th').each(function (){
                    // //     $(pivotDiv).find('tbody th')[2].innerHTML
                    // // })
                    // //For THead
                    // // let firstTrLength = $(pivotDiv).find('thead').find('tr:first').find('th').length;
                    // let widthsHead = [0];
                    // for (let i = 0; i < 2; i++) {
                    //     let w = $(pivotDiv).find('thead').find('tr:first').find(`th:eq(${i})`).outerWidth();
                    //     widthsHead.push(widthsHead[i] + w);
                    // }
                    // const secondTr = $(pivotDiv).find('thead').find('tr')[1]
                    // let secondTrLength = $(secondTr).find('th').length;
                    // let widthsHead2 = [0];
                    // for (let i = 0; i < secondTrLength; i++) {
                    //     const secondTr = $(pivotDiv).find('thead').find('tr')[1]
                    //     let w = $(secondTr).find(`th:eq(${i})`).outerWidth();
                    //     widthsHead2.push(widthsHead2[i] + w);
                    // }

                    // $(pivotDiv).find('thead').find('tr').each(function (e) {
                    //     if (e == 0) {
                    //         $(this).find('th').each(function (e) {
                    //             if (e == 0 || e === 1) {
                    //                 $(this).addClass('frezzThead');
                    //                 $(this).css('left', `${widthsHead[e]}px`);
                    //                 // if()
                    //             }

                    //         });
                    //     }
                    //     if (e == 1) {
                    //         $(this).find('th').each(function (e) {
                    //             $(this).addClass('frezzThead');
                    //             $(this).css('left', `${widthsHead2[e]}px`);

                    //         });
                    //     }
                    // });
                    var tr1 = $(pivotDiv).find('thead').find('tr')[0];
                    var th1 = $(tr1).find('th')[0];
                    $(th1).attr("rowspan", 1);

                    var tr2 = $(pivotDiv).find('thead').find('tr')[1];
                    $(tr2).prepend('<th colspan="4" rowspan="1"></th>');



                    var widthsHeadnew = [0];
                    for (let i = 0; i < 2; i++) {
                        let w = $(pivotDiv).find('thead').find('tr:first').find(`th:eq(${i})`).outerWidth();
                        widthsHeadnew.push(widthsHeadnew[i] + w);
                    }

                    // let widthsHead21 = widthsHeadnew;
                    // const secondTr1 = $(pivotDiv).find('thead').find('tr')[1]
                    // let secondTrLength1 = $(secondTr1).find('th').length;
                    // let widthsHead21 = [widthsHeadnew[1]];
                    // // for (let i = 1; i < 2; i++) {
                    //     // const secondTr1 = $(pivotDiv).find('thead').find('tr')[1]
                    //     let w = $(secondTr1).find(`th:eq(${0})`).outerWidth();
                    //     widthsHead21[0] = widthsHead21[0] + w
                    //     // widthsHead21.push(widthsHead21[i] + w);
                    // // }


                    const thirTr1 = $(pivotDiv).find('thead').find('tr')[2]
                    let ThirTrLength1 = $(thirTr1).find('th').length;
                    let widthsHeadnew1 = [0];
                    for (let i = 0; i < 4; i++) {
                        const thirTr1 = $(pivotDiv).find('thead').find('tr')[2]
                        let w = $(thirTr1).find(`th:eq(${i})`).outerWidth();
                        widthsHeadnew1.push(widthsHeadnew1[i] + w);
                    }

                    $(pivotDiv).find('thead').find('tr').each(function (e) {
                        if (e == 0) {
                            $(this).find('th').each(function (e) {
                                if (e == 0 || e === 1) {
                                    $(this).addClass('frezzThead1');
                                    $(this).css('left', `${widthsHeadnew[e]}px`);
                                    // if()
                                }

                            });
                        }
                        if (e == 1) {
                            $(this).find('th').each(function (e) {
                                if (e == 0 || e === 1) {
                                    $(this).addClass('frezzThead2');
                                    $(this).css('left', `${widthsHeadnew[e]}px`);
                                    // if()
                                }

                            });
                        }

                        if (e == 2) {
                            $(this).find('th').each(function (e) {
                                $(this).addClass('frezzThead3');
                                $(this).css('left', `${widthsHeadnew1[e]}px`);

                            });
                        }

                        // if (e == 3) {
                        //     $(this).find('th').each(function (e) {
                        //         $(this).addClass('frezzThead');
                        //         $(this).css('left', `${widthsHead21[e]}px`);

                        //     });
                        // }
                    });

                    // for TBody
                    let firstTrLength = $(pivotDiv).find('tbody').find('tr:first').find('th').length;
                    let widths = [0];
                    for (let i = 0; i < firstTrLength; i++) {
                        let w = $(pivotDiv).find('tbody').find('tr:first').find(`th:eq(${i})`).outerWidth();
                        widths.push(widths[i] + w);
                    }
                    $(pivotDiv).find('tbody').find('tr').each(function () {
                        let currentTrLength = $(this).find('th').length;
                        let diff = firstTrLength - currentTrLength;
                        if (diff < 0) {
                            firstTrLength = currentTrLength;
                        }
                        $(this).find('th').each(function (e) {
                            let diff = firstTrLength - currentTrLength;
                            if (diff > 0)
                                e += diff;
                            $(this).addClass('frezz');
                            $(this).css('left', `${widths[e]}px`);

                        });
                    });

                    $(pivotDiv).find('td').each(function () {
                        // Get the current cell text
                        let cellText = $(this).text();

                        // Check if there is a decimal and remove everything after it
                        if (cellText.includes('.')) {
                            $(this).text(cellText.split('.')[0]); // Keep only the part before the decimal
                        } else if (!cellText) {
                            $(this).text(0);
                        }
                    });
                }, 0);
                // that.byId('pivotPage').setBusy(false);
            } else {
                console.error("Pivot.js or jQuery is not loaded yet.");
                that.byId('pivotPage').setBusy(false);
            }

        },
        onHandleSelection: function (oEvent) {
            var oEv = oEvent.getSource().sId;
            if(oEv.includes("idPrimarysPA")){
                var aSelTokens = that.byId("idPrimarysPA").getTokens();
                var oPrimList = sap.ui.getCore().byId("idPrimListPA");
                oPrimList.removeSelections()
                var aAllTokens = oPrimList.getItems();
                for (var i = 0; i < aSelTokens.length; i++) {
                    for (var k = 0; k < aAllTokens.length; k++) {
                      if (aAllTokens[k].mAggregations.cells[0].mProperties.text === aSelTokens[i].getText()) {
                        aAllTokens[k].setSelected(true);
                        break;
                      }
                    }
                  }
                that.primeFrag.open();
            }else{
                sap.ui.getCore().byId("idProdFragPA").getBinding("items").filter([]);
                that._prodFrag.open();
            }

        },
        onProdSelection:function(oEvent){
            var oEv = oEvent.getParameters().selectedItems[0].mProperties.title
            that.oSelProd = oEv
            that.byId("idProdPA").setValue(oEv)
        },
        onSelPrimeIds: function (oEvent) {
            var aPrim = [];
            var sPrimaryids = that.byId("idPrimarysPA");
            var aSelectedItems = sap.ui.getCore().byId("idPrimListPA").getSelectedItems();
            if (aSelectedItems && aSelectedItems.length > 0) {
                sPrimaryids.removeAllTokens();
                that.byId("idPidcountPA").setText("Total PID's" + " - " + aSelectedItems.length);
                aSelectedItems.forEach(function (oItem) {
                    sPrimaryids.addToken(
                        new sap.m.Token({
                            key: oItem.getCells()[0].getText(),
                            text: oItem.getCells()[0].getText(),
                            editable: false
                        })
                    );
                });
            } else {
                sPrimaryids.removeAllTokens();
                that.onRestore();
                that.onPrimFragClose();
            }
            var sFilterItmes = sap.ui.getCore().byId("idPrimListPA").getSelectedItems();
            var data = oGModel.getProperty("/PivotData");
            // data = that.removeDuplicate(data, "PRIMARY_ID");
            for (let i = 0; i < sFilterItmes.length; i++) {
                if (aPrim.length > 0) {
                    aPrim = aPrim.concat((data.filter(el => el.PRIMARY_ID == (sFilterItmes[i].getCells()[0].getText()))));
                } else {
                    aPrim = (data.filter(el => el.PRIMARY_ID == (sFilterItmes[i].getCells()[0].getText())));
                }
            }
            that.pivotTable(aPrim);
            that.onPrimFragClose();
        },
        onPrimFragClose: function () {
            // sap.ui.getCore().byId("idPrimListPA").removeAllTokens()
            // sap.ui.getCore().byId("idPrimListPA").removeSelections()
            sap.ui.getCore().byId("idSearchPIdsPA").setValue("");
            var oFilters = [];
            var oPrimList = sap.ui.getCore().byId("idPrimListPA");
            oPrimList.getBinding("items").filter(oFilters);
          
        
            


            that.primeFrag.close();
        },
        removeDuplicate: function (array, key) {
            var check = new Set();
            return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
        },
        onPrimarySearch: function (oEvent) {
            var oPrimList = sap.ui.getCore().byId("idPrimListPA")
            var oProdList = sap.ui.getCore().byId("idProdFragPA")
            var sQuery =
                oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                sId = oEvent.getParameter("id"),
                oFilters = [];
            // Check if search filter is to be applied
            sQuery = sQuery ? sQuery.trim() : "";
            if (sId.includes("idSearchPIdsPA")) {
                if (sQuery !== "") {
                    oFilters.push(
                        new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("PRIMARY_ID", sap.ui.model.FilterOperator.EQ, sQuery),
                            ],
                            and: false
                        })
                    );
                    
                }
                oPrimList.getBinding("items").filter(oFilters);
            }
            else{
                if (sQuery !== "") {
                    oFilters.push(
                        new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("PRODUCT_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                                new sap.ui.model.Filter("PROD_DESC", sap.ui.model.FilterOperator.Contains, sQuery),
                            ],
                            and: false
                        })
                    );
                    oProdList.getBinding("items").filter(oFilters);
                    
                }else{
                    oProdList.getBinding("items").filter([]);
                }
                

            }
            
        },
        onGetData: function (oEvent) {
            var iFuture = parseInt(that.byId("idFuturePA").getValue());
            var iPast = parseInt(that.byId("idPastPA").getValue())
            if (iFuture > 0) {
                iFuture = parseInt(that.byId("idFuturePA").getValue())
            }
            else {
                iFuture = parseInt(0)
            }

            if (iPast > 0) {
                iPast = parseInt(that.byId("idPastPA").getValue())
            }
            else {
                iPast = parseInt(0)
            }
            // var loc = that.oSelLoc;
            // that.selProd = data[0].PRODUCT_ID;
            // var oSelProd = oEvent.getSource().getSelectedItem().getBindingContext().getObject().PRODUCT_ID;
            sap.ui.core.BusyIndicator.show();
            that.getOwnerComponent().getModel("BModel").callFunction("/getProductpidChars", {
                method: "GET",
                urlParameters: {
                    LOCATION_ID: that.selLoc,
                    PRODUCT_ID: that.oSelProd,
                    PAST_WEEKS: iPast,
                    FUTURE_WEEKS: iFuture
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    that.oPrimKeys = JSON.parse(oData.getProductpidChars);
                    oGModel = that.getOwnerComponent().getModel("oGModel");
                    oGModel.setProperty("/PivotData", that.oPrimKeys);
                    // if (that.oPrimKeys.length > 0) {
                    //     that.pivotTable(that.oPrimKeys);
                    // } else {
                    //     MessageToast.show("No Data");
                    // }
                    if (that.oPrimKeys.length > 0) {
                    that.onAfterRendering();
                    } else {
                        var excel = document.querySelector("[id*=mainDivPA]");
                        excel.innerHTML = "";
                    
                        MessageToast.show("No Data for Selected Fields");
                    }

                },
                error: function (oData, error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("error");
                },
            })

        },
        onSelectColumns: function () {
            that._tableSetting.open();
            const table = sap.ui.getCore().byId("idDataTablePA"),
                columns = that.CharName;
            if (!that.settingData) {
                that.settingData = columns.map(field => {
                    return {
                        field: field,
                        select: that.selCharName.includes(field)
                    }
                })
            }
            var oModel = new JSONModel({
                data: that.settingData
            });
            table.setModel(oModel);

        },
        onAddColumn: function (oEvent) {

            const columns = sap.ui.getCore().byId("idDataTablePA").getModel().getData().data.filter(o => o.select).map(o => o.field);
            that.selCharName = columns;
            const filteredData = that.pivotData.filter(obj => columns.includes(obj.CHAR_NAME));
            that.pivotTable(filteredData);
            that._tableSetting.close();
        },
        onCloseColumn: function (oEvent) {
            that._tableSetting.close();
        },
        onFragCharsearch: function (oEvent) {

            var ochar = sap.ui.getCore().byId("idDataTablePA")
            var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                sId = oEvent.getParameter("id"),
                oFilters = [];
            // Check if search filter is to be applied
            sQuery = sQuery ? sQuery.trim() : "";
            if (sId.includes("")) {
                if (sQuery !== "") {
                    oFilters.push(
                        new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("field", sap.ui.model.FilterOperator.Contains, sQuery),
                            ],
                            and: false
                        })
                    );
                }

            }
            ochar.getBinding("items").filter(oFilters);
        },

        //Sort Fragments

        onColumnSort: function () {
            that._tableSort.open();
            const table = sap.ui.getCore().byId("idDataTableSortPA"),
                columns = that.selCharName;
            if (!that.settingDataSort || !that.settingDataSort.length) {
                that.settingDataSort = columns.map(field => {
                    return {
                        field: field,
                        select: that.sortCols.includes(field)
                    }
                })
            }
            var oModel = new JSONModel({
                data: that.settingDataSort
            });
            table.setModel(oModel);
            that.sortIndex = -1;
            setTimeout(() => { that.checkSelect() }, 0)

        },
        onAddColumnSort: function (oEvent) {

            const columns = sap.ui.getCore().byId("idDataTableSortPA").getModel().getData().data.filter(o => o.select).map(o => o.field);
            that.sortCols = columns;
            // that.filteredData = that.pivotData.filter(obj => columns.includes(obj.CHAR_NAME));
            if (that.filteredData)
                that.pivotTable(that.filteredData);
            else
                that.pivotTable(that.pivotData);
            that._tableSort.close();
        },
        onCloseColumnSort: function (oEvent) {
            that._tableSort.close();
        },
        onSelectSort: function (oEvent) {
            // if (oEvent.mParameters.selected) {
            //     const f = oEvent.mParameters.listItem.getBindingContext().getObject().field;
            //     that.sortCols.push(f);
            // } else {
            //     const f = oEvent.mParameters.listItem.getBindingContext().getObject().field;
            //     that.sortCols = that.sortCols.filter(o => o !== f);
            // }
            let item = oEvent.mParameters.listItem,
                path = Number(item.getBindingContext().getPath().split("/")[2]),
                model, oModel, newData, newIndex;
            model = oEvent.getSource().getModel().getData()
            if (oEvent.mParameters.selected) {
                // that.sortIndex++;
                newIndex = oEvent.getSource().getSelectedItems().length - 1;
                newData = that.changeIndexPosition(model.data, path, newIndex);
            } else {
                // that.sortIndex--;
                newData = that.changeIndexPosition(model.data, path, model.data.length - 1);
            }
            that.settingDataSort = newData;
            oModel = new JSONModel({
                data: that.settingDataSort
            });
            sap.ui.getCore().byId("idDataTableSortPA").setModel(oModel);
            setTimeout(() => { that.checkSelect() }, 0)
        },
        changeIndexPosition: function (arr, oldIndex, newIndex) {
            // Check for valid indices
            if (newIndex >= arr.length) {
                let k = newIndex - arr.length + 1;
                while (k--) {
                    arr.push(undefined); // Add undefined values for out-of-bounds
                }
            }
            // Remove the item from the old index and store it
            const [movedItem] = arr.splice(oldIndex, 1);

            // Insert the item at the new index
            arr.splice(newIndex, 0, movedItem);
            return arr;
        },
        checkSelect: function () {
            const table = sap.ui.getCore().byId("idDataTableSortPA");
            table.getItems()
                .forEach((item, index) => {
                    const obj = item.getBindingContext().getObject();
                    if (obj.field === "Date Format") {
                        if (!obj.select) {
                            obj.select = true;
                            MessageToast.show("Selected field cannot be removed");
                        }
                    }
                    if (obj.select)
                        item.addStyleClass("selectItem")
                    else
                        item.removeStyleClass("selectItem")
                    const icons = item.getCells()[1].getItems();
                    if (index === 0) {
                        icons[0].setVisible(false);
                        // icons[2].setVisible(false);
                    }
                    else {
                        icons[0].setVisible(true);
                        // icons[2].setVisible(true);
                    }
                    if (index === that.settingDataSort.length - 1) {
                        icons[1].setVisible(false);
                        // icons[3].setVisible(false);
                    } else {
                        icons[1].setVisible(true);
                        // icons[3].setVisible(true);
                    }
                })
        },
        onIconPress: function (oEvent) {
            let item = oEvent.getSource().getParent().getParent(),
                path = Number(item.getBindingContext().getPath().split("/")[2]),
                icon = oEvent.getSource().getTooltip(),
                model, oModel, newData, newIndex;
            item.getDomRef().scrollIntoView();
            switch (icon) {
                case ("up"):
                    newIndex = path - 1;
                    break;
                case ("top"):
                    newIndex = 0;
                    break;
                case ("down"):
                    newIndex = path + 1;
                    break;
                case ("bottom"):
                    newIndex = that.settingDataSort.length - 1;
                    break;
                default:
                    console.log("Error")

            }
            model = oEvent.getSource().getModel().getData()
            newData = that.changeIndexPosition(model.data, path, newIndex);
            that.settingDataSort = newData;
            oModel = new JSONModel({
                data: that.settingDataSort
            });
            sap.ui.getCore().byId("idDataTableSortPA").setModel(oModel);
            that.checkSelect();
        },
        onAddColumn: function (oEvent) {
            const columns = sap.ui.getCore().byId("idDataTablePA").getModel().getData().data.filter(o => o.select).map(o => o.field);
            that.selCharName = columns;
            columns.forEach(item => {
                if (!that.settingDataSort.find(o => o.field === item)) {
                    that.settingDataSort.push({
                        field: item,
                        select: false
                    })
                }
            })
            // that.settingDataSort = temp;
            that.settingDataSort = that.settingDataSort.filter(o => columns.includes(o.field));
            that.filteredData = that.pivotData.filter(obj => columns.includes(obj.CHAR_NAME));
            that.pivotTable(that.filteredData);
            that._tableSetting.close();
        },
    });
});