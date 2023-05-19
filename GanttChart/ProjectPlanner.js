

<script>

    function createGantt (data) {
    
        let tasks = data?.projectTask;
        let ganttdata = [];
        let ganttResources = data?.resources;
    
        for (var i = 0; i < tasks.length; i++) {
           
            tasks[i].Item.Resources = tasks[i]?.Extension?.resources;
            tasks[i].Item.ComponentName = tasks[i]?.Extension?.ComponentName;
            tasks[i].Item.baselineStartDate = null;
            tasks[i].Item.baselineEndDate = null;
            if (tasks[i].Item.LevelNo == null) {
                tasks[i].Item.LevelNo = "";
            }    
            ganttdata.push(tasks[i].Item);
        }
        let startDateFromGantt = Math.min(...ganttdata.map(x => new Date(x.StartDateTime)));
        let endDateFromGantt = Math.max(...ganttdata.map(x => new Date(x.EndDateTime)));
    
        let projectStartDate = new Date(new Date(startDateFromGantt).setDate(new Date(startDateFromGantt).getDate() - 10));
        let projectEndDate = new Date(new Date(endDateFromGantt).setDate(new Date(endDateFromGantt).getDate() + 10));
 
        gantt = new ej.gantt.Gantt({
    
            height: `${window.innerHeight}px`,
            load: load,
            dataSource: ganttdata,
            resources: ganttResources,
            renderBaseline: true,
            allowRowDragAndDrop: true,
            enableVirtualization: true, 
            allowResizing: true,
            taskFields: {
                id: "TaskID",
                name: "DisplayName",
                duration: "Duration",
                progress: "Progress",
                startDate: "StartDateTime",
                endDate: "EndDateTime",
                resourceInfo: 'Resources',
                parentID: 'ParentTask_ID',
                dependency: 'Predecessor',
                durationUnit: 'DurationUnit',
                baselineStartDate: 'BaselineStartDate',
                baselineEndDate: 'BaselineEndDate',
            },
            dateFormat: 'dd/MM/yyyy hh:mm a',
            enableCriticalPath: true,
            editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowTaskbarEditing: true,
                allowDeleting: true,
                showDeleteConfirmDialog: true,
                mode: "Dialog",
            },
            columns: [
                { field: "TaskID", width: "150" },
                { field: "UID", headerText: '@localizer["T-M-ProjectPlanner-Gantt-UID"]', width: "150", allowEditing: false },
                { field: "DisplayName", headerText: '@localizer["T-M-ProjectPlanner-Gantt-DisplayName"]', width: "250" },
                { field: "Health", headerText: '@localizer["T-M-ProjectPlanner-Gantt-Health"]', textAlign: 'center', template: '#template', width: "100", allowEditing: false ,allowFiltering: false},
                { field: "StartDateTime", headerText: '@localizer["T-M-ProjectPlanner-Gantt-StartDate"]', width: "250", editType: 'datetimepickeredit' ,type:"dateTime" , format: { type: 'dateTime', format: 'dd/MM/yyyy hh:mm a' } },
                { field: "EndDateTime", headerText: '@localizer["T-M-ProjectPlanner-Gantt-EndDate"]', width: "250", editType: 'datetimepickeredit', type: "dateTime", format: { type: 'dateTime', format: 'dd/MM/yyyy hh:mm a' } },
                { field: "Duration", width: "250" },
                { field: "Progress", width: "250" },
                { field: "LevelNo", headerText: '@localizer["T-M-ProjectPlanner-Gantt-LevelNo"]', width: "250"  , editType: 'dropdownedit', edit: {
                    params: {
                        query: new ej.data.Query(),
                        dataSource: @Json.Serialize(levelNo), 
                        fields: { text: 'text', value: 'value' },
                        allowFiltering: true
                    }
                } },
                { field: "RICSCostCode", headerText: '@localizer["T-M-ProjectPlanner-Gantt-RICSCostCode"]', width: "250" },
                { field: 'Resources', headerText: '@localizer["T-M-ProjectPlanner-Gantt-Resources"]', width: '160' },
                { field: "EstimatedQty", headerText: '@localizer["T-M-ProjectPlanner-Gantt-EstimatedQty"]', width: "250"},   
                { field: "PlannedQty", headerText: '@localizer["T-M-ProjectPlanner-Gantt-PlannedQty"]', width: "250" },
                { field: "ActualQty", headerText: '@localizer["T-M-ProjectPlanner-Gantt-ActualQty"]', width: "250"},
                { field: "EstimatedCost", headerText: '@localizer["T-M-ProjectPlanner-Gantt-EstimatedCost"]', width: "250" },
                { field: "PlannedCost", headerText: '@localizer["T-M-ProjectPlanner-Gantt-PlannedCost"]', width: "250"},
                { field: "ActualCost", headerText: '@localizer["T-M-ProjectPlanner-Gantt-ActualCost"]', width: "250" },
                { field: "ParentTask_ID", headerText: '@localizer["T-M-ProjectPlanner-Gantt-ParentTaskID"]', width: "250" , allowEditing: false  },
                { field: "Calendar_UID", headerText: '@localizer["T-M-ProjectPlanner-Gantt-CalendarUID"]', width: "250" },
                { field: "ComponentName", headerText: '@localizer["T-M-ProjectPlanner-Gantt-Component"]', width: "250" , editType: 'dropdownedit' , edit: {
                    params: {
                        query: new ej.data.Query(),
                        dataSource: srcofItem,   
                        fields: { text: 'text', value: 'value' },
                        allowFiltering: true
                    }
                } },
                { field: "PurchaseOrderLineID", headerText: '@localizer["T-M-ProjectPlanner-Gantt-PurchaseOrderLineID"]', width: "250"  },
                { field: "EarliestStartDateTime", headerText: '@localizer["T-M-ProjectPlanner-Gantt-EarliestStartDateTime"]',width: "250", editType: 'datetimepickeredit' ,type:"dateTime" ,format: { type: 'dateTime', format: 'dd/MM/yyyy hh:mm a' }},
                { field: "LatestEndDateTime", headerText: '@localizer["T-M-ProjectPlanner-Gantt-LatestEndDateTime"]', width: "250", editType: 'datetimepickeredit', type: "dateTime", format: { type: 'dateTime', format: 'dd/MM/yyyy hh:mm a' } },
                { field: "TaskType", headerText: '@localizer["T-M-ProjectPlanner-Gantt-TaskType"]', width: "250"  , editType: 'dropdownedit', edit: {
                    params: {
                        query: new ej.data.Query(),
                        dataSource: @Json.Serialize(taskType),                            
                        allowFiltering: true
                    }
                }},
                { field: "WholeDay", headerText: '@localizer["T-M-ProjectPlanner-Gantt-WholeDay"]', width: "250" , editType: 'dropdownedit', edit: {
                    params: {
                        query: new ej.data.Query(),
                        dataSource: @Json.Serialize(wholeDay),                            
                        allowFiltering: true
                    }
                } },
                { field: "Component_UID", headerText: '@localizer["T-M-ProjectPlanner-Gantt-Component_UID"]', width: "250" },
                { field: "TaskFunction", headerText: '@localizer["T-M-ProjectPlanner-Gantt-TaskFunction"]', width: "250" , editType: 'dropdownedit'},
                { field: "RecordModified", headerText: '@localizer["T-M-ProjectPlanner-Gantt-RecordModified"]', width: "250",type: "dateTime", format: { type: 'dateTime', format: 'dd/MM/yyyy hh:mm a' } , allowEditing: false },
            ],
            gridLines: 'Both',  
            resourceFields: {
                id: 'ID',
                name: 'DisplayName',
                unit: 'NumberOfUnits',
                group: 'ResourceType'
            },
             allowKeyboard: false,
            allowPdfExport: true,
            allowExcelExport: true,
            allowFiltering: true,
            toolbar: [
                'Add',
                'Edit',
                'Delete',
                'Cancel',
                'CollapseAll',
                'ExpandAll',
                'Indent',
                'Outdent',
                'Search',
                'Update',
                'ZoomIn',
                'ZoomOut',
                'ZoomToFit',
                'ExcelExport',
                'CsvExport',
                'PdfExport',
            ],
    
            
            editDialogFields: [
                { type: "General", headerText:  '@localizer["T-M-ProjectPlanner-Gantt-General"]'  },
                { type: "Dependency" },
                { type: "Resources" },
            ],
            labelSettings: {
                leftLabel: 'DisplayName',
                taskLabel: '${Progress}%'
            },
            addDialogFields: [
                { type: "General", headerText: '@localizer["T-M-ProjectPlanner-Gantt-General"]' },
                { type: "Dependency" },
                { type: "Resources" },
            ],
            enableContextMenu: true,
            splitterSettings: {
                position: "50%"
            },
            projectStartDate: projectStartDate,
            projectEndDate: projectEndDate,
           
            actionBegin: function (args) {
                
                if (args?.requestType === "beforeOpenEditDialog" || args?.requestType === "beforeOpenAddDialog") {
    
                    if (args?.requestType === "beforeOpenEditDialog") {                           
                        uid = args?.rowData?.UID;
                    }                       
                }
    
                if (args?.requestType === "beforeAdd" || args?.requestType === "beforeSave") {
                    beforeAddSave(args);
                }                                                    
   
            },
            
    
            actionComplete: function (args) {
               
                if (args?.requestType === "add") {
                    addNewTask(args);
                }
    
                if (args?.requestType === "save") {
                    saveEditedTask(args);
                }
                
    
                if (args?.requestType === "delete") {
                    if (args?.data?.length < 2) {
                        deleteTask(args);
                    } else {
                        deleteMultiTasks(args);
    
                    }
                }
            },
    
        });
        $("#Gantt").html("");
        gantt.appendTo("#Gantt");
      
    }
        $.ajax({
        method: "Post",
        url: '@url',
        data: { version: '@versionUID' },
        success: function (data) {   
            createGantt(data);
            ganttLoadPanel?.hide();        
        }
        });

    function beforeAddSave(args) {
        
        if (args?.requestType === "beforeAdd") {
            args.data.UID = guid;
            args.newTaskData.UID = args?.data?.UID;               
            
        }

    }

    function addNewTask(args) {
        
        // ******************   BELOW & ABOVE *****************
        var index = gantt?.ids?.indexOf(`${args.data.TaskID}`);

        if (gantt?.selectionModule?.getSelectedRecords()?.length == 0) {
            if(isNewTaskAdded){
                args.data.taskData.RowNumber = parseFloat(gantt?.updatedRecords[0]?.taskData?.RowNumber) + 10000;
            }else{
                args.data.taskData.RowNumber = parseFloat(gantt?.updatedRecords[gantt?.updatedRecords?.length - 1]?.taskData?.RowNumber) + 10000;
            }
        } else {
            if (index == gantt?.ids?.length - 1) {
                if (gantt?.selectionModule?.getSelectedRecords()[0]?.hasChildRecords) {
                    args.data.taskData.RowNumber = parseFloat(gantt?.selectionModule?.getSelectedRecords()[0]?.childRecords[gantt?.selectionModule?.getSelectedRecords()[0]?.childRecords?.length - 1].taskData?.RowNumber) + 10000;
                } else if(args.data.taskData.hasOwnProperty("RecordRowVersion")) {
                    args.data.taskData.RowNumber = parseFloat(gantt?.selectionModule?.getSelectedRecords()[0]?.taskData?.RowNumber) + 10000;
                }else{
                    args.data.taskData.RowNumber = parseFloat(gantt?.updatedRecords[gantt?.updatedRecords?.length - 1]?.taskData?.RowNumber) + 10000;
                }
            } else if (index == 0) {
                if (isAbove) {
                    args.data.taskData.RowNumber = parseFloat(gantt?.selectionModule?.getSelectedRecords()[0]?.taskData?.RowNumber) / 2;
                } else if(isNewTaskAdded){
                    args.data.taskData.RowNumber = parseFloat(gantt?.updatedRecords[0]?.taskData?.RowNumber) + 10000;
                } else {
                    args.data.taskData.RowNumber = parseFloat(gantt?.updatedRecords[gantt?.updatedRecords?.length - 1]?.taskData?.RowNumber) + 10000;
                }
            } else {
                var prevID = parseInt(gantt?.ids[index - 1]);
                var nextID = parseInt(gantt?.ids[index + 1]);
                var prevRowNo = parseFloat(gantt?.currentViewData?.find(x => x.TaskID == prevID)?.taskData?.RowNumber);
                var nextRowNo = parseFloat(gantt?.currentViewData?.find(x => x.TaskID == nextID)?.taskData?.RowNumber);
                args.data.taskData.RowNumber = (prevRowNo + nextRowNo) / 2;
            };
        };

        var startdatetime = args?.newTaskData?.StartDateTime;
        var enddatetime = args?.newTaskData?.EndDateTime;    
        var earlieststartdatetime = args?.newTaskData?.EarliestStartDateTime;
        var latestenddatetime = args?.newTaskData?.LatestEndDateTime;

        if (typeof (startdatetime) != "string" && startdatetime != null) {
            startdatetime = startdatetime.toISOString();
        } 

        if (typeof (enddatetime) != "string" && enddatetime != null) {
            enddatetime = enddatetime.toISOString();
        } 
                    
        if (typeof (earlieststartdatetime) != "string" && earlieststartdatetime != null) {
            earlieststartdatetime = earlieststartdatetime.toISOString();
        } 

        if (typeof (latestenddatetime) != "string" && latestenddatetime != null) {
            latestenddatetime = latestenddatetime.toISOString();
        } 

        var durationUnit = "";
        if (args?.data?.parentItem != null) {
            var parentId = args?.data?.parentItem?.taskId;
            durationUnit = gantt?.currentViewData?.find(o => o.TaskID == parentId).ganttProperties?.durationUnit;
        } else {
            durationUnit = args?.data?.ganttProperties?.durationUnit;
        }
        args.data.taskData.RowNumber = args?.data?.taskData?.RowNumber.toString();
        let versionUID = $("#version").val();
        var duration = args?.newTaskData?.Duration + " " + durationUnit;
        var header = {
            TaskID: args?.newTaskData?.TaskID,
            UID: args?.newTaskData?.UID,
            DisplayName: args?.newTaskData?.DisplayName,
            RICSCostCode: args?.newTaskData?.RICSCostCode,
            Progress: args?.newTaskData?.Progress,
            EstimatedQty: args?.newTaskData?.EstimatedQty,
            PlannedQty: args?.newTaskData?.PlannedQty,
            ActualQty: args?.newTaskData?.ActualQty,
            EstimatedCost: args?.newTaskData?.EstimatedCost,
            PlannedCost: args?.newTaskData?.PlannedCost,
            ActualCost: args?.newTaskData?.ActualCost,
            ParentTask_ID: args?.data?.ParentTask_ID,
            PurchaseOrderLineID: args?.newTaskData?.PurchaseOrderLineID,
            Calendar_UID: `@Model.Project_UID`,
            VersionUID: versionUID,
            Component_UID: args?.data?.Component_UID,
            TaskType: args?.newTaskData?.TaskType,
            TaskFunction: args?.newTaskData?.TaskFunction,
            Project_UID: `@Model.Project_UID`,
            Duration: duration,
            RowNumber: args?.data?.taskData?.RowNumber,
            LevelNo: args?.newTaskData?.LevelNo,
            Predecessor: args?.newTaskData?.Predecessor,
            StartDateTime: startdatetime,
            EndDateTime: enddatetime,
            EarliestStartDateTime: earlieststartdatetime,
            LatestEndDateTime: latestenddatetime,
            WholeDay: args?.newTaskData?.WholeDay,
            Health: args?.data?.taskData?.Health,
            HealthMessage: args?.data?.taskData?.HealthMessage,
        };
        args.cancel = true;
        let arrHeader = [];
        arrHeader.push(header);
        var resources = args?.newTaskData?.Resources.map(x=> x.ID);
               
        gantt.showSpinner();

        $.ajax({
            type: "Post",
            url: "@post",
            data: {
                header: arrHeader,
                resources: resources,
            },
            success: function (data) {
                guid = data?.guid;
                isAbove = false;
                isNewTaskAdded = true;              
                gantt.hideSpinner();
            },
            dataType: 'json'
        });
    }

    function saveEditedTask(args) {
     
        
        var startdatetime = args?.data?.StartDateTime;
        var enddatetime = args?.data?.EndDateTime;
        var earlieststartdatetime = args?.modifiedTaskData?.find(x=>x.TaskID == args?.data?.TaskID)?.EarliestStartDateTime;
        var latestenddatetime = args?.modifiedTaskData?.find(x=>x.TaskID == args?.data?.TaskID)?.LatestEndDateTime;

        if (typeof (startdatetime) != "string" && startdatetime != null) {
            startdatetime = startdatetime.toISOString();
        } 

        if (typeof (enddatetime) != "string" && enddatetime != null) {
            enddatetime = enddatetime.toISOString();
        } 

        if (typeof (earlieststartdatetime) != "string" && earlieststartdatetime != null) {
            earlieststartdatetime = earlieststartdatetime.toISOString();
        }

        if (typeof (latestenddatetime) != "string" && latestenddatetime != null) {
            latestenddatetime = latestenddatetime.toISOString();
        } 

                args.data.taskData.RowNumber = args?.data?.taskData?.RowNumber.toString();


        var duration = args?.data?.Duration + " " + args?.data?.ganttProperties?.durationUnit;
        let versionUID = $("#version").val();
        var header = {
            TaskID: args?.data?.TaskID,
            UID: args?.data?.UID,
            DisplayName: args?.data?.DisplayName,
            RICSCostCode: args?.data?.RICSCostCode,
            Progress: args?.data?.Progress,
            EstimatedQty: args?.data?.EstimatedQty,
            PlannedQty: args?.data?.PlannedQty,
            ActualQty: args?.data?.ActualQty,
            EstimatedCost: args?.data?.EstimatedCost,
            PlannedCost: args?.data?.PlannedCost,
            ActualCost: args?.data?.ActualCost,
            Predecessor: args?.data?.Predecessor,
            ParentTask_ID: args?.data?.ParentTask_ID,
            PurchaseOrderLineID: args?.data?.PurchaseOrderLineID,
            Calendar_UID: `@Model.Project_UID`,
            RowNumber: args?.data?.taskData?.RowNumber,
            Component_UID: args?.data?.Component_UID,
            TaskType: args?.data?.TaskType,
            TaskFunction: args?.data?.TaskFunction,
            Project_UID: `@Model.Project_UID`,
            VersionUID: versionUID,
            Duration: duration,
            LevelNo: args?.data?.LevelNo,
            StartDateTime: startdatetime,
            EndDateTime: enddatetime,
            EarliestStartDateTime: earlieststartdatetime,
            LatestEndDateTime: latestenddatetime,
            WholeDay: args?.data?.WholeDay,
            Health: args?.data?.taskData?.Health,
            HealthMessage: args?.data?.taskData?.HealthMessage,
        };
        let arrHeader = [];
        arrHeader.push(header);
        var resources = args?.data?.taskData?.Resources.map(x=> x.ID);

        $.ajax({
            type: "Post",
            url: "@post",
            data: {
                header: arrHeader,
                resources: resources,
            },
            success: function (data) {
                guid = data?.guid;
                isAbove = false;
            },
            dataType: 'json'
        });
    }
        
    function deleteTask(args) {
        var index = args?.data?.length - 1;
        var key = args?.data[index]?.UID;
        $.ajax({
            type: "Post",
            url: "@deleteTask",
            data: {
                key: key,
            },
            dataType: 'json'
        });
    }

    function deleteMultiTasks(args) {
        var uids = [];
        for (var i = 0; i < args?.data?.length; i++) {
            uids.push(args?.data[i]?.UID);
        }

        $.ajax({
            type: "Post",
            url: "@deleteMultiTasks",
            data: {
                uids: uids,
            },
            dataType: 'json'
        });
    }


    function load(args) {
       
        $.ajax({
            type: "GET",
            url: "@GetItems",
            dataType: 'json',
            success: function (data) {
                for (var i = 0; i < data?.length; i++) {
                    var a = {
                        value: data[i]?.Item?.UID,
                        text: data[i]?.Item?.DisplayName,
                    }
                    srcofItem.push(a);
                }
            }
        });
    };

</script>