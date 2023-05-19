

using Comment.Model.Service;
using DMS.Model.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Localization;
using mvc.Site.Areas.ManProject.ViewModel;
using siteComponent.SiteControllers;
using Note.Model.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using UrlLink.Model.Service;
using siteComponent.SiteModels;
using ManProject.Model.Service;
using DevProject.Model.Service;
using mvc.Site.Areas.MMCDefinition.Extensions;
using ManProject.Model.Data;
using System.Text.RegularExpressions;
using NuGet.Protocol.Core.Types;
using NUglify.Helpers;
using MMCDefinition.Model.Service;
using DevProject.Business.Service;
using DevProject.Model.Data;
using mvc.Site.Areas.MMCDefinition.ViewModel;
using mvc.Site.ModulesIntegration;
using siteComponent.Areas.RBACDefinition.PermissionGroups;
using siteComponent.Areas.Utils;
using siteComponent.ViewComponents.TabControl;
using Microsoft.CodeAnalysis.Differencing;
using Microsoft.CodeAnalysis;
using ManProject.Business.Service;
using Microsoft.OData.ModelBuilder;
using DevExpress.Utils;
using System.ComponentModel.DataAnnotations;
using MvcSite.Configuration.AspNetCore;
using ManProject.Persistence.SQLServer.DapperDataAccess;
using DMS.Business.Service;
using DMS.Model.Data;
using Microsoft.AspNetCore.WebUtilities;
using Newtonsoft.Json;
using System.IO;
using Utility.WEB.Http;
using Microsoft.Net.Http.Headers;
using siteComponent.Areas.Dms.ModelExtension.EnumExtension;
using System.Net.Mime;
using static mvc.Site.Areas.MMCDefinition.ViewModel.pwmChartDatasource;
using static mvc.Site.Areas.MMCDefinition.ViewModel.pwmChartTypes;
using MMCDefinition.Model.Data.SharedEnum;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using System.Diagnostics;
using DocumentFormat.OpenXml.Bibliography;

namespace mvc.Site.Areas.ManProject.Controllers;

[Area(ManProjectArea.Name)]
public class ProjectPlannerController : EntityController
{

    #region Properties
    public IProjectTaskService _ProjectTaskService { get; }
    public IProjectPlannerVersionService _ProjectPlannerVersionService { get; }
    public IBaselineService _BaselineService { get; }
    public IBaselineDetailService _BaselineDetailService { get; }
    public IResourceService _ResourceService { get; }
    public IResourceAssignmentService _ResourceAssignmentService { get; }
    public IComponentService _ComponentService { get; }
    public IProjectService _ProjectService { get; }
    public IProfileService _ProfileService { get; }
    public IDmsService _dmsService { get; }
    #endregion

    #region Initialization
    public ProjectPlannerController(
        IProjectTaskService projecttaskService,
        IProjectPlannerVersionService projectPlannerVersionService,
        IDmsService dmsService,
        IBaselineService baselineService,
        IBaselineDetailService baselineDetailService,
        IProfileService profileService,
        IProjectService projectService,
        IResourceService resourceService,
        IComponentService componentService,
        IResourceAssignmentService resourceAssignmentService,
        IDmsService dmsFileContract,
        INoteService noteService,
        IUrlLinkService urlLinkService,
        ICommentService commentService,
        IHtmlLocalizerFactory localizerFactory
        ) : base(dmsFileContract, noteService, urlLinkService, commentService, localizerFactory)
    {
        _ProjectTaskService = projecttaskService;
        _ProjectPlannerVersionService = projectPlannerVersionService;
        _dmsService= dmsService;
        _BaselineService = baselineService;
        _BaselineDetailService = baselineDetailService;
        _ProfileService = profileService;
        _ProjectService = projectService;
        _ResourceService = resourceService;
        _ComponentService = componentService;
        _ResourceAssignmentService = resourceAssignmentService;
    }
    #endregion

    #region Json/Data Modification Methods

    #region Task
    
    public async Task<JsonResult> GetProjectTasks(string projectUID, string version, CancellationToken cancellationToken)
    {            
        var lstProjectTask = (await _ProjectTaskService.GetProjectTaskAllByProjectUIDAndVersionUIDAsync(projectUID, version, cancellationToken)).OrderBy(x => Convert.ToDecimal(x.RowNumber)).ToList();    

        ProjectTask projectTask = new ProjectTask();
        ProjectPlannerVersion versionData = new ProjectPlannerVersion();
        List<Baseline> allBaselines = new List<Baseline>();
        allBaselines = (await _BaselineService.GetBaselineAllByProjectUIDAndVersionUIDAsync(projectUID, version)).ToList();

        if (lstProjectTask.Count == 0)
        {
            var allversions = (await _ProjectPlannerVersionService.GetProjectPlannerVersionAllByTenantUIDAsync(projectUID)).ToList();

            if (allversions.Count == 0)
            {
                versionData.UID = Guid.NewGuid().ToString();
                versionData.Description = "First version of this project";
                versionData.ProjectUID = projectUID;
                versionData.DisplayName = "version1";
                await _ProjectPlannerVersionService.MergeProjectPlannerVersionAsync(new List<ProjectPlannerVersion> { versionData });
            }
            else
            {
                versionData.UID = version;
            }

            var project = await _ProjectService.GetProjectByUIDAsync(projectUID, cancellationToken);
            projectTask.DisplayName = project.DisplayName;
            projectTask.Project_UID = project.UID;
            projectTask.Tenant_UID = project.Tenant_UID;
            projectTask.StartDateTime = DateTime.Now;
            projectTask.EndDateTime = projectTask.StartDateTime.AddMonths(4);
            var WorkingDays = projectTask.StartDateTime.BusinessDaysUntil(projectTask.EndDateTime);
            projectTask.Duration = WorkingDays + " day";
            projectTask.UID = Guid.NewGuid().ToString();
            projectTask.LevelNo = "";
            projectTask.RowNumber = "10000";
            projectTask.TaskID = 1;
            projectTask.VersionUID = versionData.UID;

            await _ProjectTaskService.MergeProjectTaskAsync(new List<ProjectTask> { projectTask });
            lstProjectTask = (await _ProjectTaskService.GetProjectTaskAllByProjectUIDAndVersionUIDAsync(projectUID, versionData.UID, cancellationToken)).OrderBy(x => Convert.ToDecimal(x.RowNumber)).ToList();
        }

        var tenantUID = TenantContext?.Tenant?.UID;
        var lstAllResource = (await _ResourceService.GetResourceAllByTenantUIDAsync(tenantUID, cancellationToken));
        var lstResources = await _ResourceAssignmentService.GetResourceAssignmentAllAsync();

        IEnumerable<ResourceAssignment> taskResource = null;
        IEnumerable<Component> components = null;

        var allComponents = await _ComponentService.GetComponentAllByTenantUIDAsync(tenantUID, cancellationToken);

        var res = lstProjectTask.Select(x =>
        {
            taskResource = lstResources.Where(y => y.Task_UID == x.UID);
            components = allComponents.Where(y => y.UID == x.Component_UID);
            var newProjectTask = x.GetGridRawItem(taskResource, components);
            return newProjectTask;
        }).ToList();
      
        return Json(new { projectTask = res, resources = lstAllResource, versionData = versionData , allBaselines = allBaselines });
    }

    public async Task<GridRawItem<ProjectTask>> GetProjectTask(string uid, CancellationToken cancellationToken)
    {
        IEnumerable<Component> components = null;

        var projectTask = await _ProjectTaskService.GetProjectTaskByUIDAsync(uid, cancellationToken);
        var taskResource = await _ResourceAssignmentService.GetResourceAssignmentByTaskUIDAsync(uid, cancellationToken);
        var tenantUID = TenantContext?.Tenant?.UID;
        var allComponents = await _ComponentService.GetComponentAllByTenantUIDAsync(tenantUID, cancellationToken);

        components = allComponents;

        var newProjectTask = projectTask.GetGridRawItem(taskResource, components);

        return newProjectTask;
    }

    public async Task<IActionResult> DeleteProjectTask(string key)
    {
        return await DeleteProjectTasks(new List<string> { key });
    }

    public async Task<IActionResult> DeleteProjectTasks(List<string> uids)
    {
        IActionResult res = null;

        if (uids?.Count > 0)
        {
            await _ProjectTaskService.DeleteProjectTaskAsync(uids);
        }
        res = res ?? Ok();

        return res;
    }

    public async Task<IActionResult> PostProjectTask(List<ProjectTask> header, List<int> resources)
    {
        IActionResult res = null;
        if (header != null)
        {
            if (header[0].UID == null)
            {
                Func<string> srvcGetUID = () => Guid.NewGuid().ToString();
                header[0].UID = srvcGetUID();
            }

            header.ForEach(x => x.Tenant_UID = TenantContext?.Tenant?.UID);

            await _ProjectTaskService.MergeProjectTaskAsync(header);
            List<ResourceAssignment> lstResources = new List<ResourceAssignment>();

            for (int i = 0; i < resources.Count; i++)
            {
                ResourceAssignment resource = new ResourceAssignment();
                Func<string> srvcGetUID = () => Guid.NewGuid().ToString();
                resource.UID = srvcGetUID();
                resource.Resource_ID = resources[i];
                resource.Task_UID = header[0].UID;
                lstResources.Add(resource);
            }

            var resourceAssignmentsUID = (await _ResourceAssignmentService.GetResourceAssignmentByTaskUIDAsync(header[0].UID)).ToList();

            List<string> UIDs = new List<string>();
            resourceAssignmentsUID.ForEach(x => UIDs.Add(x.UID));

            await _ResourceAssignmentService.DeleteResourceAssignmentAsync(UIDs);
            await _ResourceAssignmentService.MergeResourceAssignmentAsync(lstResources);
        }
        res = Json(new { guid = Guid.NewGuid().ToString() });
        res = res ?? Ok();

        return res;
    }

    #endregion

    #endregion

    #region Views
    public async Task<IActionResult> vProjectPlanner(string versionUID = null)
    {
        var defaultProjectUID = HttpContext.Request.Cookies[MMCConst.C_MMC_Cookie_DefaultProject_Cookie_UID_Name];
        var isDefaultProjectSet = HttpContext.Request.Cookies[MMCConst.C_MMC_Cookie_ProjectSwitch_Cookie_Name];

        if (string.IsNullOrWhiteSpace(versionUID))
        {
            versionUID = HttpContext.Request.Cookies[MMCConst.C_MMC_Cookie_Use_DefaultProject_Version_Cookie_Name];
        }

        if (!string.IsNullOrWhiteSpace(defaultProjectUID) && isDefaultProjectSet == "true")
        {
            return View(new vmProjectPlanner() { DicPermissions = UserPermissionContext.DicPermissions, VersionUID = versionUID });
        }

        return RedirectToAction("vProjects", "Project", new { Area = "MMCDefinition" });
    }
    #endregion

    #region Partial Views
    public async Task<IActionResult> pwProjectPlannerMain(string versionUID = null)
    {
        OverlayModel overlayModel = Request.GetProvidedOverlay();
        WidgetModel widgetModel = Request.GetProvidedWidget();

        var defaultProjectUID = HttpContext.Request.Cookies[MMCConst.C_MMC_Cookie_DefaultProject_Cookie_UID_Name];
        var isDefaultProjectSet = HttpContext.Request.Cookies[MMCConst.C_MMC_Cookie_ProjectSwitch_Cookie_Name];

        if (!string.IsNullOrWhiteSpace(defaultProjectUID) && isDefaultProjectSet == "true")
        {
            var allversions = (await _ProjectPlannerVersionService.GetProjectPlannerVersionAllByTenantUIDAsync(defaultProjectUID)).ToList();
            var allbaselines = (await _BaselineService.GetBaselineAllByProjectUIDAndVersionUIDAsync(defaultProjectUID, allversions?[0].UID)).ToList();
           
            if (allversions != null && allversions.Any() && string.IsNullOrWhiteSpace(versionUID))
            {               
                versionUID = allversions.FirstOrDefault().UID;
            }

            IEnumerable<DmsUploadFileKey> keys = new List<DmsUploadFileKey>();

            pwmProjectPlannerMain model = new(widgetModel, overlayModel,keys) { Project_UID = defaultProjectUID, Version_UID = versionUID, RuntimeModel = new PlatformRuntimeModel() { DicPermissions = UserPermissionContext.DicPermissions }, AllVersions = allversions, AllBaselines = allbaselines, };

            model.OperatorAction = new() { Area = ManProjectArea.Name, Controller = ProjectPlannerController.GetControllerName(), Action = nameof(ProjectPlannerController.pwProjectPlannerEntity) };

            return PartialView(model);
        }

        return RedirectToAction("vProjects", "Project", new { Area = "MMCDefinition" });
    }
   
    #endregion

    #region Static Methods
    public static string GetControllerName()
    {
        string controllerName = nameof(ProjectPlannerController);
        return controllerName.Remove(
          controllerName.LastIndexOf(
              nameof(Controller),
              StringComparison.Ordinal));
    }
    #endregion

}

public static class ProjectTaskControllerExtensions
{
    public static GridRawItem<ProjectTask> GetGridRawItem(this ProjectTask x, IEnumerable<ResourceAssignment> resourceAssignments, IEnumerable<Component> component, IEnumerable<BaselineDetail> baselineDetail = null)
    {
        var newItem = new GridRawItem<ProjectTask>() { Item = x };
        newItem.Extension.resources = resourceAssignments.Select(x => x.Resource_ID).ToList();
        newItem.Extension.ComponentName = component.Select(x => x.DisplayName).ToList();
        newItem.Extension.baselineStartDate = baselineDetail?.Select(x => x.BaselineStartDate).ToList();
        newItem.Extension.baselineEndDate = baselineDetail?.Select(x => x.BaselineEndDate).ToList();

        return newItem;
    }



    public static int BusinessDaysUntil(this DateTime firstDay, DateTime lastDay)
    {
        firstDay = firstDay.Date;
        lastDay = lastDay.Date;
        if (firstDay > lastDay)
            throw new ArgumentException("Incorrect last day " + lastDay);

        TimeSpan span = lastDay - firstDay;
        int businessDays = span.Days + 1;
        int fullWeekCount = businessDays / 7;

        if (businessDays > fullWeekCount * 7)
        {
            int firstDayOfWeek = firstDay.DayOfWeek == DayOfWeek.Sunday
                ? 7 : (int)firstDay.DayOfWeek;
            int lastDayOfWeek = lastDay.DayOfWeek == DayOfWeek.Sunday
                ? 7 : (int)lastDay.DayOfWeek;
            if (lastDayOfWeek < firstDayOfWeek)
                lastDayOfWeek += 7;
            if (firstDayOfWeek <= 6)
            {
                if (lastDayOfWeek >= 7)
                    businessDays -= 2;
                else if (lastDayOfWeek >= 6)
                    businessDays -= 1;
            }
            else if (firstDayOfWeek <= 7 && lastDayOfWeek >= 7)
                businessDays -= 1;
        }

        businessDays -= fullWeekCount + fullWeekCount;

        return businessDays;
    }


}

