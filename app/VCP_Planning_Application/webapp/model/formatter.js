sap.ui.define([], function () {
    "use strict";

    return {


        formatBooleanValue: function (value, paramId) {
            if (paramId === 14 || paramId === 19 || paramId === 25) {
                if (value === true || value === "true" || value === "True") {
                    return "True";
                } else {
                    return "False";
                }
            }
            return value;
        },


        showInfoIcon: function (paramId) {
            const aParams = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 25, 26]; // your IDs
            return aParams.includes(paramId); //  returns true/false
        },

        getInfoTooltip: function (paramId) {

            const oMessages = {
                1: "This horizon defines a period during which planning is fully frozen, with no manual changes or system calculations allowed.", //Frozen Horizon
                2: "This horizon defines the time period in the future over which the forecast is generated.",  //Forecast Order Horizon
                3: "This horizon defines the time period in the future over which assembly requirements are generated.", //Assembly Requirements Horizon
                4: "This horizon defines the past time period considered for sales history.", //History Consideration 
                5: "This defines the processing logic used for planning.", //Execution
                6: "The base series number used for generating seed orders.", //Seed Order Series
                7: "Prefix applied to seed order identifiers, helping distinguish them from other order types.", //Seed Order Prefix
                8: "Specifies the planning area within IBP where data will be processed.", //IBP Planning Area
                9: "This horizon defines a period during which planning is executed, while allowing users to adjust the mix without changing the plan", //Firm Horizon
                10: "Prefix used for IBP-related identifiers.", //IBP Prefix 
                11: "This horizon defines the past time period considered while exporting sales history to IBP.", //IBP History
                12: "The behaviour depends on the execution mode defined in the processing logic.If the execution mode is M2, the changes in the fully configured horizon will be applied to the future periods defined in the forecast horizon. If the execution mode is M1, the fully configured horizon will be treated as 0.", //Fully Configured Horizon
                13: "The behaviour depends on the execution mode defined in the processing logic.  If the execution mode is M1, the changes in the Components Horizon will be applied to the future periods defined in the forecast horizon.If the execution mode is M2, the Components Horizon will be treated as 0.", //Components Horizon 
                14: "The system will not validate unique IDs using predefined rules.", //Generate Unique ID Validity by Rules ( )
                // 15: "15",
                16: "Based on the Dynamic Frozen and Firm Group Tab application the periodic buckets will be frozen.", //Dynamic Frozen Horizon
                17: "Based on the Dynamic Frozen and Firm Group Tab application the periodic buckets will be firm.", //Dynamic Firm Horizon
                // 18: "Firm Horizon",
                19: "PVS node configuration is disabled.", //PVS Node Configuration
                20: "The VC Planner software allows users to create different planning versions. This feature enables users to compare and analyze various planning scenarios, considering factors such as different demand forecasts, available capacity. It helps in making informed decisions and evaluating the impact of different planning approaches", //"The given version will be displayed in all the applications", //IBP Default Version
                21: "The VC Planner software allows users to create different planning scenarios. This feature enables users to compare and analyze various planning scenarios, considering factors such as different demand forecasts, available capacity. It helps in making informed decisions and evaluating the impact of different planning approaches",//"The given Scenario will be displayed in all the applications", //IBP Default Scenario
                25: "True – Intermediate assembly processing is enabled, possibly allowing multi-level BOM handling.", //Intermediate Assembly 
                26: "Pir Plan Request number." //PIRPLAN 
            };

            return oMessages[paramId] || "";
        },





        // formatter method contains the formatting logic
        // parameter iValue gets passed from the view ...
        // ... that uses the formatter


        getInputEnabled: function (iValue) {

            var bEnabled = true;

            switch (iValue) {
                case 6:
                case 7:
                case 8:
                case 10:
                case 14:
                case 18:
                case 19:
                case 22:
                case 23:
                case 24:
                case 25:
                case 26:
                    bEnabled = false;
                    break;

                default:
                    bEnabled = true;
                    break;
            }

            return bEnabled;
        },

        formatWeeksTextWithParam: function (unit, paramId) {

            // Hide text for 16,17,18 but keep space
            if (paramId === 12 || paramId === 13 || paramId === 16 || paramId === 17 || paramId === 18) {
                return "";
            }

            return unit === "Weeks" ? "Weeks" : "";
        },

        handleParameterVisibility: function (iValue) {
            var bVisibile = true;
            if (iValue == 18 || iValue == 12 || iValue == 13) {//Snapshots
                bVisibile = false;
            };
            return bVisibile;
        },

        handleVisibility: function (iValue) {
            switch (iValue) {
                case 12:
                case 13:
                    return false; // hide
                default:
                    return true;  // show
            }
        }


        // formatter method contains the formatting logic
        // parameter iValue gets passed from the view ...
        // ... that uses the formatter
        // handleUnitVisibility: function (iValue) {

        //     var bEnabled = true;

        //     switch (iValue) {
        //         case 16:
        //         case 17:
        //         case 18://Snapshots
        //             bEnabled = false;
        //             break;
        //         default:
        //             bEnabled = true;
        //             break;
        //     }
        //     return bEnabled;
        // },


        //Temporary function to hide Paramters with ID 18


    };

});