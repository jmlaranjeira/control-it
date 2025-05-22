var ConfigTreeOption = function(e) {
    var a = this
      , t = ConfigTreeOption.prototype;
    $.extend(t, e),
    a.Id = t.Id,
    a.TreeId = t.TreeId,
    a.Value = t.Value,
    a.ParentId = t.ParentId,
    a.Parent = t.Parent,
    a.Level = t.Level,
    a.LevelOrder = t.LevelOrder,
    e.Children && e.Children.forEach(function(e, t) {
        a.Children.push(new ConfigTreeOption(e))
    })
};
ConfigTreeOption.prototype = {
    Id: "",
    TreeId: "",
    Value: "",
    ParentId: "",
    Parent: !1,
    Level: 100,
    LevelOrder: 1,
    Children: [],
    GetCloneObject: function() {
        var a = this
          , n = {};
        return Object.keys(a).forEach(function(e, t) {
            n[e] = a[e]
        }),
        n
    },
    GetTreeFromOptionsList: function(a, n, o) {
        var i = [];
        return o = o || 1,
        a.forEach(function(e, t) {
            e.ParentId === n && i.push(new ConfigTreeOption(e))
        }),
        o++,
        i.forEach(function(e, t) {
            e.Children = ConfigTreeOption.prototype.GetTreeFromOptionsList(a, e.Id, o)
        }),
        i
    }
};
var ConfigTree = function(e) {
    var t = this
      , a = ClockIn.prototype;
    $.extend(a, e),
    t.Id = a.Id,
    t.ConfigurationId = a.ConfigurationId,
    t.Title = a.Title,
    t.ShowOptionsOrderType = a.ShowOptionsOrderType,
    t.Nodes = ConfigTreeOption.prototype.GetTreeFromOptionsList(a.Options, null)
};
ConfigTree.prototype = {
    Id: "",
    ConfigurationId: "",
    Title: "",
    ShowOptionsOrderType: "",
    Nodes: [],
    GetCloneObject: function() {
        var a = this
          , n = {};
        return Object.keys(a).forEach(function(e, t) {
            n[e] = a[e]
        }),
        n
    }
};
var ClockIn = function(e) {
    var t = this
      , a = ClockIn.prototype;
    $.extend(a, e),
    t.Id = a.Id,
    t.EmployeeId = a.EmployeeId,
    t.StartDate = a.StartDate,
    t.EndDate = a.EndDate,
    t.ConfigurationOptionId = a.ConfigurationOptionId,
    t.ConfigurationOptionText = a.ConfigurationOptionText
};
ClockIn.prototype = {
    Id: "",
    EmployeeId: "",
    StartDate: "",
    EndDate: "",
    ConfigurationOptionId: "",
    ConfigurationOptionText: "",
    RenderLine: function() {},
    GetCloneObject: function() {
        var a = this
          , n = {};
        return Object.keys(a).forEach(function(e, t) {
            n[e] = a[e]
        }),
        n
    }
};
var ClockInTimesheet = function(e) {
    var t = this
      , a = ClockInTimesheet.prototype;
    $.extend(a, e),
    t.Id = a.Id,
    t.EmployeeId = a.EmployeeId,
    t.Title = a.Title,
    t.TimesheetDate = a.TimesheetDate,
    t.SortOrder = a.SortOrder,
    t.Tree = a.Tree,
    "" === t.Id && (t.Id = create_UUID()),
    t.State = "CREATED"
};
ClockInTimesheet.prototype = {
    Id: "",
    EmployeeId: "",
    Title: "",
    TimesheetDate: (new Date).toLocaleDateString(),
    SortOrder: 1,
    ClocksIn: [],
    Tree: null,
    DomContainer: "",
    State: "",
    Render: function(e) {
        var n = this
          , t = null
          , a = document.createElement("div");
        a.setAttribute("class", "card-header");
        function o(e) {
            var t, a = window.confirm("Estás seguro/a de querer borrar este parte?");
            !0 === a && "CREATED" === n.State ? (t = n.DomContainer).parentNode.removeChild(t) : !0 === a && n.State
        }
        e && !n.DomContainer ? (t = document.createElement("div")).setAttribute("class", "card mt-2") : (t = n.DomContainer).innerHTML = "";
        var i, s, r, d, c, l, p, u, m, h, g, f, v, y, b, k, C = "ts-" + n.Id.toLocaleUpperCase();
        "SAVED" === n.State ? ((i = document.createElement("h3")).setAttribute("class", "col-12 col-sm-9 order-sm-1 col-lg-10 mb-0 mt-2 mt-sm-0 align-self-center"),
        (s = document.createElement("button")).setAttribute("type", "button"),
        s.setAttribute("class", "btn btn-block font-weight-bold text-left p-0 collapsed"),
        s.setAttribute("data-toggle", "collapse"),
        s.setAttribute("data-target", "#" + C),
        s.innerText = n.Title,
        i.appendChild(s),
        (v = document.createElement("div")).setAttribute("class", "col-12 col-sm-3 order-sm-2 col-lg-2 text-right align-self-center"),
        (r = document.createElement("span")).setAttribute("class", "fas fa-2x fa-edit text-dark ml-2"),
        r.setAttribute("style", "cursor: pointer;"),
        r.setAttribute("title", "Modificar parte"),
        r.addEventListener("click", function(e) {
            n.State = "EDITED",
            n.Render()
        }, !1),
        (d = document.createElement("span")).setAttribute("class", "fa fa-2x fa-clipboard-check text-dark ml-2"),
        d.setAttribute("style", "cursor: pointer;"),
        d.setAttribute("title", "Cerrar/Confirmar parte"),
        d.addEventListener("click", function(e) {
            n.State = "CLOSED",
            n.Render()
        }, !1),
        (k = document.createElement("span")).setAttribute("class", "fa fa-2x fa-trash-alt text-danger ml-2"),
        k.setAttribute("style", "cursor: pointer;"),
        k.setAttribute("title", "Borrar parte"),
        k.addEventListener("click", o, !1),
        v.appendChild(r),
        v.appendChild(d),
        v.appendChild(k),
        (c = document.createElement("div")).setAttribute("class", "row no-gutters"),
        c.appendChild(v),
        c.appendChild(i),
        a.appendChild(c),
        t.appendChild(a)) : "CREATED" === n.State || "EDITED" === n.State ? ((l = document.createElement("div")).setAttribute("class", "mb-0"),
        p = document.createElement("form"),
        (u = document.createElement("div")).setAttribute("class", "form-row"),
        (m = document.createElement("div")).setAttribute("class", "col-12 col-sm-10 order-sm-1 col-md-5 mt-2 mt-md-0"),
        (h = document.createElement("input")).setAttribute("type", "text"),
        h.setAttribute("class", "form-control"),
        n.Title ? h.value = n.Title : h.setAttribute("placeholder", "Parte del día " + (new Date).toLocaleDateString("es")),
        h.addEventListener("blur", function(e) {
            n.SetTitle(this.value)
        }, !1),
        h.focus(),
        (g = n.GetCalendarElement()).setAttribute("class", "col-12 col-sm-10 order-sm-2 col-md-3 mt-2 mt-md-0"),
        f = g.getElementsByClassName("date"),
        n.InitializeCalendar(f),
        (v = document.createElement("div")).setAttribute("class", "col-12 col-sm-2 order-sm-3 col-md text-right align-self-center mt-2 mt-md-0"),
        (y = document.createElement("span")).setAttribute("class", "fa fa-2x fa-save text-dark ml-2"),
        y.setAttribute("style", "cursor: pointer;"),
        y.setAttribute("title", "Guardar parte"),
        y.addEventListener("click", function(e) {
            if (!Date.parse(n.TimesheetDate))
                return $.displayMessage("El campo de fecha es obligatorio", "danger"),
                !1;
            var t = {
                Title: n.Title,
                TimesheetDate: n.TimesheetDate,
                SortOrder: n.SortOrder,
                ClockInTimesheetStatus: 1
            };
            return "CREATED" === n.State ? $.ajax({
                url: api_url + "api/clock-in/create-clock-in-timesheet",
                method: "POST",
                headers: {
                    Authorization: "Bearer " + $.getToken()
                },
                data: {
                    timesheet: t
                },
                success: function(e) {
                    e.Success ? (n.SetProperties(e.Timesheet),
                    n.State = "SAVED",
                    n.Render()) : $.displayMessage(e.Message, "danger")
                }
            }) : (t.Id = n.Id,
            $.ajax({
                url: api_url + "api/clock-in/update-clock-in-timesheet",
                method: "POST",
                headers: {
                    Authorization: "Bearer " + $.getToken()
                },
                data: {
                    timesheet: t
                },
                success: function(e) {
                    e.Success ? (n.SetProperties(e.Timesheet),
                    n.State = "SAVED",
                    n.Render()) : $.displayMessage(e.Message, "danger")
                }
            }))
        }, !1),
        v.appendChild(y),
        "CREATED" !== n.State && ((b = document.createElement("span")).setAttribute("class", "fa fa-2x fa-times-circle text-dark ml-2"),
        b.setAttribute("style", "cursor: pointer;"),
        b.setAttribute("title", "Cerrar edición de parte"),
        b.addEventListener("click", function(e) {
            n.State = "SAVED",
            n.Render()
        }, !1),
        v.appendChild(b)),
        (k = document.createElement("span")).setAttribute("class", "fa fa-2x fa-trash-alt text-danger ml-2"),
        k.setAttribute("style", "cursor: pointer;"),
        k.setAttribute("title", "Borrar parte"),
        k.addEventListener("click", o, !1),
        v.appendChild(k),
        m.appendChild(h),
        u.appendChild(v),
        u.appendChild(m),
        u.appendChild(g),
        p.appendChild(u),
        l.appendChild(p),
        a.appendChild(l),
        t.appendChild(a)) : n.State;
        var T = document.createElement("div");
        T.setAttribute("class", "card-body");
        var D = document.createElement("div");
        D.setAttribute("class", "collapse"),
        D.setAttribute("id", C),
        D.setAttribute("data-parent", ""),
        D.appendChild(T),
        n.RenderClocksIn(T),
        t.appendChild(D),
        e && !n.DomContainer && (n.DomContainer = t,
        document.getElementById(e).appendChild(t))
    },
    RenderClocksIn: function(e) {
        this.ClocksIn.forEach(function(e, t) {
            e.Render()
        })
    },
    GetCalendarElement: function() {
        var e = "dtPicker" + this.Id
          , t = '<div class="input-group date" id="' + e + '" data-target-input="nearest">                        <input type="text" class="form-control datetimepicker-input" data-target="#' + e + '" readonly="readonly" />                        <div class="input-group-append" data-target="#' + e + '" data-toggle="datetimepicker">                            <div class="input-group-text"><i class="fa fa-calendar"></i></div>                        </div>                    </div>'
          , a = document.createElement("div");
        return a.innerHTML = t,
        a
    },
    InitializeCalendar: function(e) {
        try {
            return $(e).datetimepicker({
                maxDate: Date.now(),
                ignoreReadonly: !0,
                locale: "es",
                format: "L"
            }),
            !0
        } catch (e) {
            return !1
        }
    },
    SetTitle: function(e) {
        this.Title = e
    },
    SetProperties: function(e) {
        this.Id = e.Id,
        this.EmployeeId = e.EmployeeId,
        this.TimesheetDate = e.TimesheetDate,
        this.Title = e.Title,
        this.SortOrder = e.SortOrder
    },
    SaveTimesheet: function() {
        $.ajax({
            url: api_url
        })
    },
    GetCloneObject: function() {
        var a = this
          , n = {};
        return Object.keys(a).forEach(function(e, t) {
            a[e]instanceof jQuery || a[e]instanceof HTMLElement || (n[e] = a[e])
        }),
        n
    }
};
var VacationRange = function(e) {
    var t = this
      , a = VacationRange.prototype;
    $.extend(a, e),
    t.Id = a.Id,
    t.EmployeeId = a.EmployeeId,
    t.StartDate = a.StartDate,
    t.EndDate = a.EndDate,
    t.WorkDays = a.WorkDays,
    t.YearOfApplication = a.YearOfApplication,
    "" === t.Id && (t.Id = create_UUID()),
    t.State ? t.State = a.State : t.State = "CREATED"
};
VacationRange.prototype = {
    Id: "",
    EmployeeId: "",
    StartDate: (new Date).toLocaleDateString(),
    EndDate: (new Date).toLocaleDateString(),
    WorkDays: 0,
    YearOfApplication: (new Date).getFullYear(),
    State: "",
    Modal: "",
    Render: function(e) {},
    RenderModal: function() {
        var s = this
          , r = this.GetModalElement()
          , d = r.querySelector("#datepicker");
        r.querySelector("#accept-partial-cancel-request").addEventListener("click", function(e) {
            var a = [];
            d._flatpickr.selectedDates.forEach(function(e, t) {
                a.push(e.toLocaleString())
            });
            var t = $.ajax({
                url: api_url + "api/vacations/request-partial-cancel-of-vacations",
                method: "POST",
                headers: {
                    Authorization: "Bearer " + $.getToken()
                },
                data: {
                    vacsDays: {
                        VacationId: s.Id,
                        Days: a
                    },
                    WholeRange: r.querySelector("#select-whole-vacation-range").checked
                },
                success: function(e) {}
            });
            $.showLoading(r.querySelector(".modal-body")),
            t.done(function(e) {
                e.Success ? ($.displayMessage(e.Message, "success"),
                location.reload()) : $.displayMessage(e.Message, "danger"),
                $(r).modal("hide"),
                $.hideLoading()
            }).fail(function(e) {
                $.displayMessage(e.Message, "danger"),
                $.hideLoading()
            })
        }, !1);
        r.querySelector("#select-whole-vacation-range").addEventListener("click", function(e) {
            if (e.target.checked) {
                for (var t = s.GetMinDateForCalendar(), a = moment(s.EndDate, "DD/MM/YYYY").endOf("day").toDate(), n = new Date(t); n <= a; n.setDate(n.getDate() + 1))
                    d._flatpickr.selectedDates.push(new Date(n));
                d._flatpickr.redraw()
            } else
                d._flatpickr.selectedDates = [],
                d._flatpickr.redraw()
        }, !1),
        $(r).on("show.bs.modal", function() {
            var o = s.GetMinDateForCalendar().toDate()
              , i = moment(s.EndDate, "DD/MM/YYYY").endOf("day").toDate();
            d.flatpickr({
                minDate: o,
                maxDate: i,
                locale: "es",
                dateFormat: "U",
                inline: !0,
                mode: "multiple",
                onChange: function(e, t, a) {
                    var n = i.getTime() - o.getTime();
                    Math.ceil(n / 864e5) === e.length ? r.querySelector("#select-whole-vacation-range").checked = !0 : r.querySelector("#select-whole-vacation-range").checked = !1
                }
            })
        }),
        $(r).modal("show")
    },
    GetModalElement: function() {
        var e = document.createElement("div");
        e.setAttribute("class", "modal"),
        e.setAttribute("tabindex", "-1");
        return e.innerHTML = '<div class="modal-dialog">                        <div class="modal-content">                            <div class="modal-header">                                <h5 class="modal-title">Cancelar vacaciones</h5>                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">                                    <span aria-hidden="true">&times;</span>                                </button>                            </div>                            <div class="modal-body">                                  <div class="form-group form-check">                                    <input type="checkbox" class="form-check-input" id="select-whole-vacation-range">                                    <label class="form-check-label" for="select-whole-vacation-range">Marcar/Desmarcar todos los días</label>                                  </div>                                <div id="datepicker"></div>                            </div>                            <div class="modal-footer">                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>                                <button type="button" class="btn btn-primary" id="accept-partial-cancel-request">Aceptar</button>                            </div>                        </div>                    </div>',
        e
    },
    SetProperties: function(e) {
        this.Id = e.Id,
        this.EmployeeId = e.EmployeeId,
        this.TimesheetDate = e.TimesheetDate,
        this.Title = e.Title,
        this.SortOrder = e.SortOrder
    },
    GetMinDateForCalendar: function() {
        var e = moment(this.StartDate, "DD/MM/YYYY")
          , t = moment().add(1, "days");
        return e.isBefore(t) && (e = t),
        e
    },
    GetCloneObject: function() {
        var a = this
          , n = {};
        return Object.keys(a).forEach(function(e, t) {
            a[e]instanceof jQuery || a[e]instanceof HTMLElement || (n[e] = a[e])
        }),
        n
    }
};
var LeaveDayRange = function(e) {
    this.Properties = extend(!0, new _LeaveDayRangeProps, e),
    "" === this.Properties.Id && (this.Properties.Id = create_UUID()),
    this.Properties.State || (this.Properties.State = "CREATED")
};
_LeaveDayRangeProps = function() {
    return {
        Id: "",
        StartDate: (new Date).toLocaleDateString(),
        EndDate: (new Date).toLocaleDateString(),
        State: ""
    }
}
,
LeaveDayRange.prototype = {
    Properties: new _LeaveDayRangeProps,
    Modal: "",
    requestCancel: function(e, t) {
        var a = this.Properties;
        return $.ajax({
            url: api_url + "api/leave-days/request-partial-cancel-of-leave-days",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                LeaveDays: {
                    LeaveDayId: a.Id,
                    Days: e
                },
                WholeRange: t
            }
        })
    },
    render: function() {
        var s = this
          , r = s.Properties
          , d = s.getModalElement()
          , c = d.querySelector("#datepicker");
        d.querySelector("#accept-partial-cancel-request").addEventListener("click", function(e) {
            var a = [];
            c._flatpickr.selectedDates.forEach(function(e, t) {
                a.push(e.toLocaleString())
            });
            var t = d.querySelector("#select-whole-leave-day-range").checked;
            $.showLoading(d.querySelector(".modal-body")),
            s.requestCancel(a, t).done(function(e) {
                e.Success ? ($.displayMessage(e.Message, "success"),
                location.reload()) : $.displayMessage(e.Message, "danger"),
                $(d).modal("hide"),
                $.hideLoading()
            }).fail(function(e) {
                $.displayMessage(e.Message, "danger"),
                $.hideLoading()
            })
        }, !1);
        d.querySelector("#select-whole-leave-day-range").addEventListener("click", function(e) {
            if (e.target.checked) {
                for (var t = s.getMinDateForCalendar(), a = new Date(r.EndDate), n = new Date(t); n <= a; n.setDate(n.getDate() + 1))
                    c._flatpickr.selectedDates.push(new Date(n));
                c._flatpickr.redraw()
            } else
                c._flatpickr.selectedDates = [],
                c._flatpickr.redraw()
        }, !1),
        $(d).on("show.bs.modal", function() {
            var o = s.getMinDateForCalendar()
              , i = new Date(r.EndDate);
            c.flatpickr({
                minDate: o,
                maxDate: i,
                locale: "es",
                dateFormat: "U",
                inline: !0,
                mode: "multiple",
                onChange: function(e, t, a) {
                    var n = i.getTime() - o.getTime();
                    Math.ceil(n / 864e5) === e.length ? d.querySelector("#select-whole-leave-day-range").checked = !0 : d.querySelector("#select-whole-leave-day-range").checked = !1
                }
            })
        }),
        $(d).modal("show")
    },
    getModalElement: function() {
        var e = document.createElement("div");
        e.setAttribute("class", "modal"),
        e.setAttribute("tabindex", "-1");
        return e.innerHTML = '<div class="modal-dialog">                        <div class="modal-content">                            <div class="modal-header">                                <h5 class="modal-title">Cancelar días de Ausencia aprobados</h5>                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">                                    <span aria-hidden="true">&times;</span>                                </button>                            </div>                            <div class="modal-body">                                  <div class="form-group form-check">                                    <input type="checkbox" class="form-check-input" id="select-whole-leave-day-range">                                    <label class="form-check-label" for="select-whole-leave-day-range">Marcar/Desmarcar todos los días</label>                                  </div>                                <div id="datepicker"></div>                            </div>                            <div class="modal-footer">                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>                                <button type="button" class="btn btn-primary" id="accept-partial-cancel-request">Aceptar</button>                            </div>                        </div>                    </div>',
        e
    },
    getMinDateForCalendar: function() {
        var e = new Date(this.Properties.StartDate)
          , t = new Date
          , a = new Date(t);
        return a.setDate(a.getDate() + 1),
        e.getTime() > a.getTime() && (e = a),
        e
    }
};
var PendingTask = function(e) {
    var t, a, n = this, o = new _PendingTaskDefaultProps;
    $.extend(o, e),
    n.Actions = o.Actions,
    n.Seleccionar = o.Seleccionar,
    n.EmployeeName = o.EmployeeName,
    n.RequestDate = o.RequestDate,
    n.StartDate = o.StartDate,
    n.EndDate = o.EndDate,
    (n.DateRange = "") != n.StartDate && (t = new Date(n.StartDate),
    isNaN(t) || (n.DateRange = t.toEuropeanString(),
    "" != n.EndDate && (a = new Date(n.EndDate),
    isNaN(a) || (n.DateRange += " a " + a.toEuropeanString())))),
    n.RequestType = o.RequestType,
    n.Center = o.Center,
    n.Department = o.Department,
    n.LeaveDayType = o.LeaveDayType,
    n.YearOfApplication = o.YearOfApplication,
    n.PreviousComments = o.PreviousComments,
    n.Comments = o.Comments,
    n.Notes = o.Notes,
    n.TaskId = o.TaskId
}
  , _PendingTaskDefaultProps = function() {
    return {
        Actions: "",
        Seleccionar: "",
        EmployeeName: "",
        RequestType: "",
        DateRange: "",
        StartDate: "",
        EndDate: "",
        RequestDate: "",
        Center: "",
        Department: "",
        LeaveDayType: "",
        PreviousComments: "",
        Comments: "",
        Notes: "",
        YearOfApplication: "",
        TaskId: ""
    }
}
  , Login = {
    username: !(PendingTask.prototype = {
        Actions: "",
        Seleccionar: "",
        EmployeeName: "",
        RequestType: "",
        DateRange: "",
        StartDate: "",
        EndDate: "",
        RequestDate: "",
        Center: "",
        Department: "",
        LeaveDayType: "",
        PreviousComments: "",
        Comments: "",
        Notes: "",
        YearOfApplication: "",
        TaskId: "",
        GetCloneObject: function() {
            var a = this
              , n = {};
            return Object.keys(a).forEach(function(e, t) {
                n[e] = a[e]
            }),
            n
        },
        GetColModelForJExcelGrid: function() {
            var e = [{
                title: "Acciones",
                name: "Actions",
                type: "text",
                align: "center",
                width: 100,
                readOnly: !0,
                wordWrap: !1
            }, {
                title: "Seleccionar",
                name: "Seleccionar",
                type: "checkbox",
                align: "center",
                width: 80
            }, {
                title: "Tipo de aprobación",
                name: "RequestType",
                type: "text",
                align: "left",
                width: 200,
                readOnly: !0
            }, {
                title: "Empleado",
                name: "EmployeeName",
                type: "text",
                align: "left",
                width: 200,
                readOnly: !0
            }, {
                title: "Fecha de solicitud",
                name: "RequestDate",
                type: "text",
                align: "center",
                width: 130,
                readOnly: !0
            }, {
                title: "Rango de ausencia",
                name: "DateRange",
                type: "text",
                align: "center",
                width: 190,
                readOnly: !0
            }, {
                title: "Centro",
                name: "Center",
                type: "text",
                align: "left",
                width: 200,
                readOnly: !0
            }, {
                title: "Departamento",
                name: "Department",
                type: "text",
                align: "left",
                width: 200,
                readOnly: !0
            }, {
                title: "Tipo ausencia",
                name: "LeaveDayType",
                type: "text",
                align: "left",
                width: 200,
                readOnly: !0
            }, {
                title: "Vacaciones del año",
                name: "YearOfApplication",
                type: "text",
                align: "center",
                width: 120,
                readOnly: !0
            }, {
                title: "Notas del empleado",
                name: "Notes",
                type: "text",
                align: "left",
                width: 400,
                readOnly: !0
            }, {
                title: "Comentarios previos",
                name: "PreviousComments",
                type: "text",
                align: "left",
                width: 400,
                readOnly: !0
            }, {
                title: "Comentarios (siguiente aprobador/solicitante)",
                name: "Comments",
                type: "text",
                align: "left",
                verticalalign: "top",
                width: 400,
                readOnly: !1
            }, {
                title: "TaskId",
                name: "TaskId",
                type: "hidden"
            }];
            return this.ColModel = e
        },
        GetColIndexPendingTasksGrid: function(a) {
            var n = -1;
            return PendingTask.prototype.GetColModelForJExcelGrid().forEach(function(e, t) {
                e.name.toLowerCase() === a.toLowerCase() && (n = t)
            }),
            n
        }
    }),
    password: !1,
    api_url: !1,
    loaded: !1,
    Init: function(e) {
        var t = this;
        t.loaded || ($.deleteToken(),
        t.api_url = e,
        t.InitEvents(),
        t.loaded = !0),
        t.GetView()
    },
    InitEvents: function() {
        var o = this;
        $("body").on("submit", "#login-container form", function() {
            var e = $("#login-container")
              , t = $.getLoadingSpinner();
            $(e).hide(),
            $(e).parent().append(t);
            var a = $(e).find("form")
              , n = $(a).serializeFormJSON();
            return $.deleteToken(),
            $.ajax({
                url: o.api_url + "api/authenticate",
                contentType: "application/json",
                method: "POST",
                data: JSON.stringify(n),
                dataType: "json",
                success: function(e, t, a) {
                    var n;
                    e.Success ? (n = e.User,
                    $("#RememberMe").is(":checked") && $.setToken(n.AccessToken, n.ExpiresIn),
                    sessionStorage.setItem("token", n.AccessToken),
                    Control.Init(o.api_url, e.User, e.EventTypes, e.LastEvent, e.Configuration, e.Environment),
                    $.hideLoading()) : ($.alertError("Error: Nombre de usuario o contraseña erróneos."),
                    $(window).scrollTop(0),
                    $.hideLoading(),
                    o.GetView())
                },
                error: function(e) {
                    $.alertError("Error: Nombre de usuario o contraseña erróneos."),
                    $(window).scrollTop(0),
                    $.hideLoading(),
                    o.GetView()
                }
            }),
            !1
        })
    },
    InitEventEnterKey: function() {
        var t = document.getElementById("Password")
          , a = document.getElementById("Username")
          , e = document.getElementById("RememberMe");
        function n(e) {
            13 === e.keyCode && t.value && a.value && (e.preventDefault(),
            document.getElementById("btn-log-in").click())
        }
        t && a && (t.addEventListener("keyup", n),
        a.addEventListener("keyup", n),
        null != e && e.addEventListener("change", n))
    },
    GetView: function() {
        var t = this;
        $.ajax({
            url: "/login",
            method: "GET",
            dataType: "html",
            success: function(e) {
                window.location.hash = "",
                $("main").empty(),
                $("main").append(e),
                t.InitEventEnterKey()
            }
        })
    }
};
$(document).ready(function() {
    0 === $.getToken().length ? Login.Init(api_url) : Control.Init(api_url);
    var t = /INPUT|SELECT|TEXTAREA/i;
    $(document).bind("keydown keypress", function(e) {
        8 == e.which && (t.test(e.target.tagName) && !e.target.disabled && !e.target.readOnly || e.preventDefault())
    }),
    document.onmouseover = function() {
        window.innerDocClick = !0
    }
    ,
    $(document).mouseleave(function() {
        window.innerDocClick = !1
    }),
    window.onhashchange = function(e) {
        var t;
        window.innerDocClick || (e.oldURL.substring(e.oldURL.indexOf("#")),
        t = e.newURL.substring(e.newURL.indexOf("#")),
        !1 === Control.loaded && Control.Init(api_url),
        Control.ProcessHash(t))
    }
    ,
    $('[data-toggle="tooltip"]').tooltip()
});
var HelpBrowser = {
    isLoaded: !1,
    Properties: {
        ContainerId: "main",
        TreeIdClean: "documents-tree",
        TreeId: "#documents-tree"
    },
    init: function() {
        this.isLoaded || (this.initEvents(),
        this.isLoaded = !0)
    },
    initEvents: function() {},
    getHelpBrowser: function() {
        return $.ajax({
            url: api_url + "api/Users/get-help-browser",
            method: "GET",
            headers: {
                Authorization: "Bearer " + getToken()
            }
        })
    },
    downloadSharpointFileCallback: function(e, t) {
        var a = {
            fileName: e,
            id: t
        };
        return $.ajax({
            url: api_url + "api/ldr-sharepoint/request-help-tutorials-doc-from-sharepoint",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: a
        })
    },
    getFancyTreeExtensions: function(e) {
        switch (e) {
        case "png":
        case "jpg":
        case "jpeg":
        case "tiff":
        case "bmp":
        case "gif":
            return "far fa-file-image";
        case "zip":
        case "gz":
        case "rar":
            return "far fa-file-archive";
        case "doc":
        case "docx":
        case "odt":
            return "far fa-file-word";
        case "xlsx":
        case "xls":
            return "far fa-file-excel";
        case "html":
        case "xml":
            return "far fa-file-code";
        case "pdf":
            return "far fa-file-pdf";
        case "csv":
            return "far fa-file-csv";
        case "pptx":
        case "pptm":
        case "ppt":
            return "far fa-file-powerpoint";
        case "mp4":
        case "avi":
        case "mkv":
            return "far fa-file-video";
        case "txt":
        case "json":
            return "far fa-file-alt";
        default:
            return "far fa-file"
        }
    },
    getFancyTreeFileSize: function(e) {
        var t = (parseInt(e) / 1024).toFixed(2);
        if (1024 < t) {
            var a = (parseInt(e) / 1024 / 1024).toFixed(2);
            return 1024 < a ? (parseInt(e) / 1024 / 1024).toFixed(2) + " GB" : a + " MB"
        }
        return t < 1 ? t + " KB" : parseInt(t) + " KB"
    },
    downloadFile: function(e, t) {
        return showCompleteLoading(),
        this.downloadSharpointFileCallback(e, t).then(function(e) {
            e.Success ? window.location = api_url + "api/FileHandler/download-sharepoint?token=" + e.Token : displayMessage(e.Message, "danger"),
            hideCompleteLoading()
        }).catch(function(e) {
            displayMessage("Se ha producido un error al intentar descargar el fichero. Puede deberse a una desconexi&oacute;n con el sharepoint. " + e, "danger"),
            hideCompleteLoading()
        }),
        !1
    },
    renderBrowser: function() {
        var o = this
          , a = o.Properties;
        $(a.Container).empty();
        var e = '<div class="container" id="tree-container">                <h4 class="text-dark">Tutoriales</h4>                <p>Tanto para desplegar/comprimir una carpeta como para descargar un video basta con hacer doble click con el ratón sobre dicha carpeta/vídeo</p>                <div class="row mt-3">                    <div class="col-md-6 col-lg-4 col-xl-3">                        <div class="input-group mb-3">                              <input type="text" id="fancytree-filter-input" class="form-control" placeholder="Filtro" aria-label="Filtro" aria-describedby="button-addon2">                              <div class="input-group-append">                                    <button class="btn btn-outline-secondary" type="button" id="clear-fancytree-filter-input" >Limpiar</button>                              </div>                        </div>                    </div>                </div>                <div class="table-responsive">                    <table id="' + a.TreeIdClean + '" class="table table-sm table-hover border border-warning">                        \x3c!-- <caption>Loading&hellip;</caption> --\x3e                        <colgroup>                            <col width="15px"></col>                            <col width="*"></col>                            <col width="60px"></col>                            <col width="40px"></col>                        </colgroup>                        <thead class="thead-dark">                            <tr>                                <th></th>                                <th class="parent-path">Nombre</th>                                <th>Tama&ntilde;o</th>                                <th>Ext</th>                            </tr>                        </thead>                    </table>                </div>            </div>';
        $(a.ContainerId).append(e),
        $(a.TreeId).fancytree({
            extensions: ["table", "glyph", "filter"],
            table: {
                indentation: 25,
                nodeColumnIdx: 1,
                checkboxColumnIdx: 0
            },
            filter: {
                autoApply: !0,
                autoExpand: !1,
                counter: !0,
                fuzzy: !1,
                hideExpandedCounter: !1,
                hideExpanders: !1,
                highlight: !0,
                leavesOnly: !1,
                nodata: !0,
                mode: "dimm"
            },
            quicksearch: !0,
            autoScroll: !0,
            selectMode: 1,
            source: [{
                title: "Ayuda",
                key: "",
                folder: !0,
                lazy: !0,
                data: {
                    id: -1
                }
            }],
            glyph: {
                preset: "awesome5",
                map: {}
            },
            createNode: function(e, t) {
                t.node.setExpanded(!0)
            },
            lazyLoad: function(e, t) {
                t.result = o.getHelpBrowser().then(function(e) {
                    return a.Tree = e
                }).catch(function(e) {
                    displayMessage(e, "danger")
                })
            },
            init: function(e, t) {},
            renderColumns: function(e, t) {
                var a = t.node
                  , n = $(a.tr).find(">td");
                a.folder ? (n.addClass("text-warning"),
                n.eq(2).text(""),
                n.eq(3).text("")) : (n.eq(2).text(o.getFancyTreeFileSize(a.data.order)).addClass("text-right"),
                n.eq(3).text(a.data.text).addClass("text-right"))
            },
            renderNode: function(e, t) {},
            icon: function(e, t) {
                var a = t.node;
                if (!a.isFolder() && a.data.text)
                    return o.getFancyTreeExtensions(a.data.text.toLowerCase())
            },
            dblclick: function(e, t) {
                var a = t.node;
                a.isFolder() || o.downloadFile(a.title, a.data.id)
            },
            activate: function(e, t) {
                t.node
            }
        }),
        $("#fancytree-filter-input").on("keyup", function(e) {
            var t = $.ui.fancytree.getTree()
              , a = t.options.filter
              , n = $(this).val();
            e && e.which === $.ui.keyCode.ESCAPE || "" === $.trim(n) ? $("button#clear-fancytree-filter-input").click() : (t.filterNodes.call(t, n, a),
            $("button#clear-fancytree-filter-input").attr("disabled", !1),
            $("span#matches").text("(undefined matches)"))
        }).focus(),
        $("button#clear-fancytree-filter-input").click(function(e) {
            var t = $.ui.fancytree.getTree();
            $("#fancytree-filter-input").val(""),
            $("span#matches").text(""),
            t.clearFilter()
        }).attr("disabled", !0)
    },
    render: function() {
        $(this.Properties.ContainerId).empty(),
        this.renderBrowser()
    }
}
  , Control = {
    api_url: !1,
    loaded: !1,
    jwt: "",
    EventTypes: [],
    User: !1,
    LastEvent: !1,
    LastIncidenceEventId: !1,
    HisEventCount: 0,
    HisEventTake: 10,
    LastInitDateReport: !1,
    LastEndDateReport: !1,
    MaxInputFile: 105e4,
    Vacations: !1,
    ConfigOptionsTree: [],
    Configurations: [],
    Environment: "",
    TreeId: !1,
    PillTab: !1,
    CORRECTING_CLOCKING_IN_EVENT_TYPE_GUID: "CFC13A62-70AB-4D39-ACDA-9DE40255FD06",
    Init: function(e, t, a, n, o, i) {
        var s = this;
        s.api_url = e,
        s.jwt = $.getToken(),
        s.jwt ? (!1 === s.loaded && (s.InitEvents(),
        Vacations.Init(),
        Calendars.Init(s),
        CompensationHours.Init(s),
        Configurations.Init(s),
        ManualRegister.Init(s),
        LeaveDays.init(),
        ClockInNotBindPage.Init(s),
        Reports.Init(s),
        HelpBrowser.init(),
        s.loaded = !0),
        i ? sessionStorage.Environment = i : Control.GetEnvironment(),
        t && a && n && o ? (s.User = t,
        s.EventTypes = a,
        s.LastEvent = n,
        s.SetConfigurations(o),
        s.GetMenuPrincipal(),
        s.GetView()) : 1 < window.location.hash.length ? (s.GetMenuPrincipal(),
        s.ProcessHash(window.location.hash)) : s.GetDatos(),
        $.removeLoading()) : Login.Init()
    },
    InitEvents: function() {
        var r = this;
        $("body").on("click", "a", function() {
            $("body").find(".tooltip.show").remove()
        }),
        $("body").on("click", "header a.navbar-brand", function() {
            r.GetView()
        }),
        $("body").on("click", "a.btn-volver-home", function() {
            return r.GetView(),
            !1
        }),
        $("body").on("click", "a#logout", function() {
            return r.DoLogOut(),
            !1
        }),
        $("body").on("click", "a.event-register-link", function() {
            var e, t, a, n, o = $(this).data("eventtypeid"), i = $(this).data("isinit"), s = r.CheckConfigIPGeolocation();
            return r.CheckAllowedDevices("web") ? s ? (e = {
                enableHighAccuracy: !0,
                maximumAge: 3e4,
                timeout: 15e3
            },
            t = "",
            a = function(e) {
                var t = Math.round(e.coords.accuracy);
                r.RegisterEvent(o, i, e.coords.latitude, e.coords.longitude, t)
            }
            ,
            n = function() {
                r.RegisterEvent(o, i, null, null, null, t)
            }
            ,
            $.ajax({
                url: "https://api.ipify.org?format=json"
            }).then(function(e) {
                t = e.ip
            }).always(function() {
                navigator.geolocation.getCurrentPosition(a, n, e)
            })) : r.RegisterEvent(o, i) : displayMessage("Tu usuario no tiene habilitada la opción de registrar jornada desde la plataforma web.", "warning"),
            !1
        }),
        $("body").on("click", ".pause-event-modal button.list-group-item", function() {
            r.PauseEventClick(this)
        }),
        $("body").on("click", "a.pause-event-register-link", function() {
            r.CheckAllowedDevices("web") ? r.ListPauseEventList(this) : displayMessage("Tu usuario no tiene habilitada la opción de registrar jornada desde la plataforma web.", "warning")
        }),
        $("body").on("click", "a.pause-event-close-register-link", function() {
            var e, t, a, n, o = $(this).data("eventtypeid"), i = $(this).data("isinit");
            r.CheckConfigIPGeolocation() ? (e = {
                enableHighAccuracy: !0,
                maximumAge: 3e4,
                timeout: 15e3
            },
            t = "",
            a = function(e) {
                var t = Math.round(e.coords.accuracy);
                r.RegisterPauseEvent(o, i, e.coords.latitude, e.coords.longitude, t)
            }
            ,
            n = function() {
                r.RegisterPauseEvent(o, i, null, null, null, t)
            }
            ,
            $.ajax({
                url: "https://api.ipify.org?format=json"
            }).then(function(e) {
                t = e.ip
            }).always(function() {
                navigator.geolocation.getCurrentPosition(a, n, e)
            })) : r.RegisterPauseEvent(o, i)
        }),
        $("body").on("click", "a.his-events-link", function() {
            r.HisEventCount = 0,
            r.ListHisEvents(this)
        }),
        $("body").on("click", "a.incidence-events-link", function() {
            r.HisEventCount = 0,
            r.ListCorrectingClockingInIncidendeEvents(this)
        }),
        $("body").on("click", "a.btn-more-his-events", function() {
            return r.ListHisEventsMore(this),
            !1
        }),
        $("body").on("click", "#menu-change-password", function() {
            r.GetChangePasswordView()
        }),
        $("body").on("click", "#btnChangePassword", function() {
            var e = {
                Password: $("input#Password").val(),
                ConfirmPassword: $("input#ConfirmPassword").val(),
                PreviousPassword: $("input#PreviousPassword").val()
            };
            r.ChangePassword(e)
        }),
        $("body").on("click", "a.report-incidence", function() {
            $(this).hasClass("his-event-disabled") || ($(this).data("iscorrectingclockinginincidence") ? r.GetCorrectingClockingInIncidenceView($(this).data("id")) : r.GetIncidenceView($(this).data("id")))
        }),
        $("body").on("click", "button#incidenceApprove", function() {
            var e = $("form#report-incidence").find("input#incidenceId").val()
              , t = $("form#report-incidence").find("textarea#Message").val();
            r.UpdateCorrectingClockingInIncidence(e, t, -1)
        }),
        $("body").on("click", "button#incidenceReject", function() {
            var e = $("form#report-incidence").find("input#incidenceId").val()
              , t = $("form#report-incidence").find("textarea#Message").val();
            "" != t ? r.UpdateCorrectingClockingInIncidence(e, t, 2) : alert("Es obligatorio anotar el motivo del rechazo de la corrección del fichaje.")
        }),
        $("body").on("submit", "form#report-incidence", function() {
            var e = $(this).find("input#eventId").val()
              , t = $(this).find("textarea#Message").val();
            return r.ReportIncidence(e, t),
            !1
        }),
        $("body").on("reset", "form#report-incidence", function() {
            $(this).find("input#eventTypeId").val().toUpperCase() != r.CORRECTING_CLOCKING_IN_EVENT_TYPE_GUID ? r.ListHisEvents() : r.ListCorrectingClockingInIncidendeEvents()
        }),
        $("body").popover({
            trigger: "focus",
            selector: ".principal-event .fa-check, .pause-events .fa-check, .principal-event .fa-exclamation-triangle, .principal-event .fa-user-clock, .pause-events .fa-user-clock,  .pause-events .fa-exclamation-triangle",
            html: !0,
            title: function() {
                return "principal" === $(this).parent().data("type") ? $(this).closest(".principal-event").find(".popover-html .popover-header").html() : "pause" === $(this).parent().data("type") ? $(this).closest("li").find(".popover-html .popover-header").html() : void 0
            },
            content: function() {
                return console.log($(this).parent().data("type")),
                "principal" === $(this).parent().data("type") ? $(this).closest(".principal-event").find(".popover-html .popover-body").html() : "pause" === $(this).parent().data("type") ? $(this).closest("li").find(".popover-html .popover-body").html() : void 0
            }
        }),
        $("body").on("click", "#menu-temp-disabilities", function() {
            r.GetTempDisabilityView()
        }),
        $("body").on("click", ".add-temp-disability", function() {
            return r.ManageTempDisability($(this).closest("form")),
            !1
        }),
        $("body").on("click", ".modify-temp-disability", function() {
            return r.ManageTempDisability($(this).closest("form")),
            !1
        }),
        $("body").on("change", ".custom-file-input", function() {
            var e = $(this).val().split("\\").pop();
            $(this).siblings(".custom-file-label").addClass("selected").html(e)
        }),
        $("body").on("click", "a#menu-help-browser", function(e) {
            HelpBrowser.render()
        })
    },
    GetDatos: function() {
        var t = this;
        $.getToken() ? $.ajax({
            url: t.api_url + "api/eventtypes/get-event-types-from-user",
            method: "GET",
            cache: !1,
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "json",
            success: function(e) {
                e.Success ? (t.GetMenuPrincipal(),
                t.User = e.User,
                t.EventTypes = e.EventTypes,
                t.LastEvent = e.LastEvent,
                t.SetConfigurations(e.Configuration),
                t.GetView()) : $.displayMessage(e.Message, "danger")
            },
            error: function(e) {
                $("body").find(".spinner-border").parent().remove(),
                t.DoLogOut(),
                $.displayMessage("Error: no se ha podido obtener los datos del usuario, probablemente porque la API no esté funcionando.", "danger")
            }
        }) : Login.Init()
    },
    GetPendingTasksView: function(t) {
        showCompleteLoading(),
        $.ajax({
            url: "/get-pending-tasks-view",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                "" !== e ? ($("main").empty(),
                $("main").append(e),
                Control.GetMenuPrincipal(),
                t && document.getElementById(t) && document.getElementById(t).click()) : displayMessage(e.Message, "danger"),
                hideCompleteLoading()
            },
            error: function(e) {
                displayMessage(e, "danger"),
                hideCompleteLoading()
            }
        })
    },
    GetCurrentEnvironment: function() {
        return $.ajax({
            url: this.api_url + "api/Authenticate/get-environment",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            }
        })
    },
    GetView: function() {
        this.HisEventCount = 0,
        $.ajax({
            url: "/control",
            method: "POST",
            cache: !1,
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                $("main").empty(),
                $("main").append(e)
            },
            error: function(e) {},
            complete: function() {
                $.hideLoading()
            }
        })
    },
    GetLoginStatus: function() {
        var t = this;
        $.ajax({
            url: "/get-login-status",
            method: "GET",
            cache: !1,
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                "" != e ? ($("body").find(".login-status-container").empty(),
                $("body").find(".login-status-container").append(e)) : ($.displayMessage(e.Message, "danger"),
                t.DoLogOut())
            }
        })
    },
    GetEnvironment: function() {
        if (this.Environment)
            return this.Environment;
        this.GetCurrentEnvironment().then(function(e) {
            sessionStorage.Environment = e.Environment
        })
    },
    DoLogOut: function() {
        $.deleteToken(),
        sessionStorage.clear(),
        $("#menu-principal").empty(),
        Login.Init(api_url)
    },
    GetMenuPrincipal: function() {
        return !$("#menu-principal nav").length && $.ajax({
            url: "/menu-principal",
            method: "GET",
            cache: !1,
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                "" != e && ($("body").find("#menu-principal").empty(),
                $("body").find("#menu-principal").append(e))
            }
        })
    },
    GetEventTypeById: function(a) {
        var n = !1;
        return this.EventTypes.forEach(function(e, t) {
            e.EventTypeId === a && (n = e)
        }),
        n
    },
    GetPausedEvent: function() {
        var a = !1;
        return this.EventTypes.forEach(function(e, t) {
            !e.IsPrincipal && e.IsInit && (a = e)
        }),
        a
    },
    LoadHtmlInMain: function(e) {
        $.removeLoading(),
        $("main").empty(),
        $("main").append(e),
        $("main").fadeIn("slow")
    },
    RegisterEvent: function(e, t, a, n, o, i) {
        var s = this;
        $.showLoading(),
        a = a || null,
        n = n || null,
        $.ajax({
            url: s.api_url + "api/events/register",
            method: "POST",
            cache: !1,
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            data: JSON.stringify({
                EventTypeId: e,
                IsInit: t,
                Latitude: a,
                Longitude: n,
                Accuracy: o,
                IPAddress: i
            }),
            success: function(e) {
                e.Success ? 0 === e.ShowOptionsOrderType ? e.IsInit ? displayMessage("Evento de inicio de jornada registrado correctamente.", "success") : displayMessage("Evento de fin de jornada registrado correctamente.", "success") : (Configurations.SetShowOptionsOrderType(e.ShowOptionsOrderType),
                Configurations.SetTreeId(e.TreeId),
                e.IsInit ? (displayMessage("Evento de inicio de jornada registrado correctamente.", "success"),
                1 === e.ShowOptionsOrderType && Configurations.ShowClockInModal("start-workday")) : (displayMessage("Evento de fin de jornada registrado correctamente.", "success"),
                2 === e.ShowOptionsOrderType ? Configurations.ShowClockInModal("end-workday") : Configurations.CloseOpenedClockInRegister(e.InsertedId))) : $.displayMessage(e.Message, "danger"),
                s.GetView()
            },
            error: function(e) {
                $.hideLoading()
            }
        })
    },
    ListPauseEventList: function(e) {
        var t, a, n, o, i = this, s = $(e).data("eventtypeid"), r = $(e).data("isInit");
        s && r ? i.CheckConfigIPGeolocation() ? (t = {
            enableHighAccuracy: !0,
            maximumAge: 3e4,
            timeout: 15e3
        },
        a = "",
        n = function(e) {
            var t = Math.round(e.coords.accuracy);
            i.RegisterPauseEvent(s, r, e.coords.latitude, e.coords.longitude, t)
        }
        ,
        o = function() {
            i.RegisterPauseEvent(s, r, null, null, null, a)
        }
        ,
        $.ajax({
            url: "https://api.ipify.org?format=json"
        }).then(function(e) {
            a = e.ip
        }).always(function() {
            navigator.geolocation.getCurrentPosition(n, o, t)
        })) : i.RegisterPauseEvent(s, r) : $(".modal.pause-event-modal").modal("show")
    },
    PauseEventClick: function(e) {
        var t, a, n, o, i = this, s = $(e).data("id"), r = $(e).data("isinit");
        i.CheckConfigIPGeolocation() ? (t = {
            enableHighAccuracy: !0,
            maximumAge: 3e4,
            timeout: 15e3
        },
        a = "",
        n = function(e) {
            var t = Math.round(e.coords.accuracy);
            i.RegisterPauseEvent(s, r, e.coords.latitude, e.coords.longitude, t)
        }
        ,
        o = function() {
            i.RegisterPauseEvent(s, r, null, null, null, a)
        }
        ,
        $.ajax({
            url: "https://api.ipify.org?format=json"
        }).then(function(e) {
            a = e.ip
        }).always(function() {
            navigator.geolocation.getCurrentPosition(n, o, t)
        })) : i.RegisterPauseEvent(s, r)
    },
    RegisterPauseEvent: function(e, t, a, n, o, i) {
        var s = this;
        a = a || null,
        n = n || null,
        $.showLoading(),
        $.ajax({
            url: s.api_url + "api/events/register",
            method: "POST",
            cache: !1,
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            data: JSON.stringify({
                EventTypeId: e,
                IsInit: t,
                Latitude: a,
                Longitude: n,
                Accuracy: o,
                IpAddress: i
            }),
            success: function(e) {
                $(".modal.pause-event-modal").modal("hide"),
                $(".modal-backdrop").remove(),
                $("body").removeClass("modal-open").css("padding-right", "0"),
                e.Success ? (Configurations.SetShowOptionsOrderType(e.ShowOptionsOrderType),
                Configurations.SetTreeId(e.TreeId),
                e.IsInit ? ($.displayMessage("Evento de inicio de pausa registrado correctamente.", "success"),
                2 === e.ShowOptionsOrderType ? Configurations.ShowClockInModal("start-pause") : Configurations.CloseOpenedClockInRegister(e.InsertedId)) : (displayMessage("Evento de fin de pausa registrado correctamente.", "success"),
                1 === e.ShowOptionsOrderType && Configurations.ShowClockInModal("end-pause"))) : displayMessage(e.Message, "danger"),
                $.hideLoading(),
                s.GetView()
            },
            error: function(e) {
                $(".modal.pause-event-modal").modal("hide"),
                $(".modal-backdrop").remove(),
                $("body").removeClass("modal-open").css("padding-right", "0"),
                $.hideLoading()
            }
        })
    },
    ListCorrectingClockingInIncidendeEvents: function() {
        var t = this;
        $.ajax({
            url: "/latestCorrectingClockingInIncidences",
            method: "GET",
            cache: !1,
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                count: t.HisEventTake,
                skip: t.HisEventCount
            },
            success: function(e) {
                "" === $.trim(e) ? $.displayMessage("No hemos encontrado el listado de eventos de corrección de fichaje.") : (t.HisEventCount = t.HisEventTake,
                t.MakePopover(e),
                $("main").empty(),
                $("main").append(e)),
                $.hideLoading()
            },
            error: function() {
                $.hideLoading()
            }
        })
    },
    ListHisEvents: function() {
        var t = this;
        $.ajax({
            url: "/latest",
            method: "GET",
            cache: !1,
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                count: t.HisEventTake,
                skip: t.HisEventCount
            },
            success: function(e) {
                "" === $.trim(e) ? $.displayMessage("No hemos encontrado el listado de eventos.") : (t.HisEventCount = t.HisEventTake,
                t.MakePopover(e),
                $("main").empty(),
                $("main").append(e)),
                $.hideLoading()
            },
            error: function() {
                $.hideLoading()
            }
        })
    },
    ListHisEventsMore: function() {
        var a = this
          , n = $("body").find(".his-event-list-content");
        $(n).append($.getLoadingSpinner()),
        $.ajax({
            url: "/latest-more",
            method: "GET",
            cache: !1,
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                count: a.HisEventTake,
                skip: a.HisEventCount
            },
            success: function(e) {
                var t;
                "" === $.trim(e) ? ($.displayMessage("No hemos encontrado el listado de eventos.", "danger"),
                $.hideLoading()) : (a.HisEventCount += a.HisEventTake,
                t = $.parseHTML(e),
                $(t).hide(),
                $(n).before(t),
                $(t).fadeIn("slow", function() {
                    $.hideLoading()
                }),
                a.MakePopover(e))
            },
            error: function() {}
        })
    },
    GetChangePasswordView: function() {
        $.ajax({
            url: "/user/change-password",
            method: "GET",
            cache: !1,
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            success: function(e) {
                "" === $.trim(e) ? $.displayMessage("Error al cargar el formulario.", "danger") : ($("main").empty(),
                $("main").append(e))
            },
            error: function() {}
        })
    },
    ChangePassword: function(e) {
        var t = this;
        $.ajax({
            url: t.api_url + "api/users/change-password",
            method: "POST",
            contentType: "application/json",
            cache: !1,
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: JSON.stringify(e),
            success: function(e) {
                e.Success ? (t.GetView(),
                $.displayMessage(e.Message, "success")) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    GetIncidenceView: function(e) {
        var t = this;
        t.HisEventCount = 0,
        $.showLoading(),
        $.ajax({
            url: "/report-incidence",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            data: {
                EventId: e
            },
            success: function(e) {
                "" !== e ? t.LoadHtmlInMain(e) : $.displayMessage("No se ha podido cargar la página para generar una incidencia.", "danger"),
                $.hideLoading()
            },
            error: function() {
                $.hideLoading()
            }
        })
    },
    GetCorrectingClockingInIncidenceView: function(e) {
        var t = this;
        t.HisEventCount = 0,
        t.LastIncidenceEventId = e,
        $.showLoading(),
        $.ajax({
            url: "/report-correctingclockingin-incidence",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            data: {
                correctingClockingInId: e
            },
            success: function(e) {
                "" !== e ? t.LoadHtmlInMain(e) : $.displayMessage("No se ha podido cargar la página de la incidencia.", "danger"),
                $.hideLoading()
            },
            error: function() {
                $.hideLoading()
            }
        })
    },
    GetCalendarSettingView: function() {
        $.showLoading(),
        $.ajax({
            url: "/calendar-setting",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                "" !== e ? ($("main").empty(),
                $("main").append(e),
                $("main").fadeIn("slow", function() {
                    $.hideLoading()
                })) : $.displayMessage("No se ha podido cargar la página para generar una incidencia.", "danger")
            },
            error: function() {
                $.hideLoading()
            }
        })
    },
    SetCompanyToken: function(e) {
        return $.ajax({
            url: this.api_url + "api/authenticate/change-nav-company",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                hash: e
            }
        })
    },
    ProcessHash: function(e) {
        var t = this
          , a = document.getElementsByTagName("main");
        null != a && (a.innerHTML = "");
        try {
            switch (e) {
            case "#historic":
                t.ListHisEvents();
                break;
            case "#incidence":
                t.ListCorrectingClockingInIncidendeEvents();
                break;
            case "#settings":
                Configurations.GetSettingsView();
                break;
            case "#manual-register":
                ManualRegister.LoadRegisterManualView();
                break;
            case "#manual-clock-in":
                ManualRegister.LoadClockInManualView();
                break;
            case "#manual-clock-in-not-bind":
                ClockInNotBindPage.LoadClockInManualView();
                break;
            case "#calendar":
                Calendars.GetEmployeeCalendarView();
                break;
            case "#glpi-internal-incidences":
                t.showGLPIInternalIncidencePage();
                break;
            case "#help-browser":
                HelpBrowser.render();
                break;
            case "#report-incidence":
                !1 !== t.LastIncidenceEventId ? t.GetIncidenceView(t.LastIncidenceEventId) : t.ListHisEvents();
                break;
            case "#change-password":
                t.GetChangePasswordView();
                break;
            case "#reports":
                Reports.GetReportView();
                break;
            case "#reports-clock-in":
                Reports.GetReportClockInView();
                break;
            case "#show-simple-report":
                t.LastInitDateReport && t.LastEndDateReport ? t.GetReportUser(t.LastInitDateReport, t.LastEndDateReport) : $.displayMessage("Fechas no rellenadas", "info");
                break;
            case "#show-detailed-report":
                t.LastInitDateReport && t.LastEndDateReport ? t.GetReportUserDetailed(t.LastInitDateReport, t.LastEndDateReport) : $.displayMessage("Fechas no rellenadas", "info");
                break;
            case "#vacations":
                Vacations.isLoaded || Vacations.Init(),
                Vacations.GetVacationsView();
                break;
            case "#ondutycalendars":
                Calendars.isLoaded || Calendars.Init(),
                Calendars.GetOnDutyCalendarsView();
                break;
            case "#leave-days":
                LeaveDays.isLoaded || LeaveDays.Init(),
                LeaveDays.render();
                break;
            case "#vacations-managed":
                Vacations.isLoaded || Vacations.Init(),
                Vacations.RenderVacationsManagedPage();
                break;
            case "#temporary-disabilities":
                t.GetTempDisabilityView();
                break;
            case "#compensation-hours":
                CompensationHours && CompensationHours.GetCompensationHoursView();
                break;
            case "#pending-tasks":
                t.GetPendingTasksView();
                break;
            default:
                "" === e || "#" === e || displayMessage("La página solicitada no se ha encontrado.", "danger"),
                t.GetDatos()
            }
        } catch (e) {
            displayMessage(e, "danger"),
            t.GetDatos()
        }
    },
    ReportIncidence: function(e, t) {
        var a = this;
        $.showLoading(),
        $.ajax({
            url: "/report-incidence",
            method: "post",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "json",
            data: {
                eventId: e,
                message: t
            },
            success: function(e) {
                e.Success ? $.displayMessage("Incidencia reportada correctamente.", "success") : $.displayMessage(e.Message, "danger"),
                $.hideLoading(),
                a.ListHisEvents()
            },
            error: function(e) {
                $.hideLoading(),
                $.displayMessage(e, "danger"),
                a.ListHisEvents()
            }
        })
    },
    UpdateCorrectingClockingInIncidence: function(e, t, a) {
        var n = this;
        $.showLoading(),
        $.ajax({
            url: "/update-correctingclockingin-incidence",
            method: "post",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "json",
            data: {
                incidenceId: e,
                message: t,
                incidenceState: a
            },
            success: function(e) {
                e.Success ? $.displayMessage("Respuesta enviada correctamente.", "success") : $.displayMessage(e.Message, "danger"),
                $.hideLoading(),
                n.ListCorrectingClockingInIncidendeEvents()
            },
            error: function(e) {
                $.hideLoading(),
                $.displayMessage(e, "danger"),
                n.ListCorrectingClockingInIncidendeEvents()
            }
        })
    },
    MakePopover: function(e) {},
    GetTempDisabilityView: function() {
        $.showLoading(),
        $.ajax({
            url: "/get-it-view",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                var t;
                $.hideLoading(),
                "" !== e ? ($("main").empty(),
                $("main").append(e),
                $(".datepicker").datetimepicker({
                    format: "L",
                    locale: "es",
                    defaultDate: !1,
                    ignoreReadonly: !0,
                    icons: {
                        time: "fa fa-clock"
                    }
                }),
                t = moment().subtract(3, "days").startOf("day"),
                $("#datepickerStart").datetimepicker("minDate", t),
                $("#datepickerExpectedEnd").datetimepicker("minDate", t),
                $("#datepickerNextRevision").datetimepicker("minDate", t),
                $("#datepickerStart").on("change.datetimepicker", function(e) {
                    $("#datepickerExpectedEnd").datetimepicker("minDate", e.date),
                    $("#datepickerNextRevision").datetimepicker("minDate", e.date),
                    $("#datepickerStart").datetimepicker("hide")
                }),
                $("#datepickerExpectedEnd").on("change.datetimepicker", function(e) {
                    $("#datepickerExpectedEnd").datetimepicker("hide")
                }),
                $('[data-toggle="tooltip"]').tooltip()) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    ManageTempDisability: function(e) {
        var t = this
          , a = t.GetFormDataFromTempDisability(e);
        $.showLoading(),
        $.ajax({
            url: "/manage-it",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "json",
            processData: !1,
            contentType: !1,
            data: a,
            success: function(e) {
                e.Success ? $.displayMessage("La IT ha sido registrada con éxito.", "success") : $.displayMessage(e.Message, "danger"),
                t.GetTempDisabilityView(),
                $.hideLoading()
            },
            error: function(e) {
                $.hideLoading()
            }
        })
    },
    GetFormDataFromTempDisability: function(e) {
        var t = new FormData;
        if ($("#document").length && $("#document")[0].files.length) {
            var a = $("#document")[0].files[0];
            if (a.size > this.MaxInputFile)
                return $.displayMessage("El tamaño de archivo máximo permitido es de 1MB.", "danger"),
                !1;
            t.append("file", a)
        }
        var n = $(e).find("#Id").val();
        t.append("id", n);
        var o = $(e).find("#Start").val();
        t.append("start", moment(o, "DD/MM/YYYY").format());
        var i = $(e).find("#ExpectedEnd").val();
        t.append("expected", moment(i, "DD/MM/YYYY").format());
        var s, r = $(e).find("#Observations").val();
        return t.append("observations", r),
        $("#NextRevision").length && (s = $("#NextRevision").val(),
        t.append("NextRevision", moment(s, "DD/MM/YYYY").format())),
        t
    },
    GetGeolocation: function(t, a, n) {
        var o, i = this;
        navigator.geolocation ? (o = $.Deferred(),
        navigator.geolocation.watchPosition(function(e) {
            o.resolve(e)
        }, function(e) {
            i.RegisterEvent(t, a)
        }),
        o.promise().done(function(e) {
            n ? i.RegisterEvent(t, a, e.coords.latitude, e.coords.longitude) : i.RegisterPauseEvent(t, a, e.coords.latitude, e.coords.longitude)
        }).catch(function(e) {
            n ? i.RegisterEvent(t, a) : i.RegisterPauseEvent(t, a)
        }).fail(function(e) {
            n ? i.RegisterEvent(t, a) : i.RegisterPauseEvent(t, a)
        })) : $.displayMessage("info", "La geolocalización no está soportada por este servidor.")
    },
    SetConfigurations: function(e) {
        var n = this;
        return e && e.length && e.forEach(function(e, t) {
            var a = n.FindConfigurationIndexByKey(e.Key);
            !1 === a ? n.Configurations.push({
                Key: e.Key,
                Value: e.Value
            }) : n.Configurations[a].Value = e.Value
        }),
        n.Configurations
    },
    FindConfigurationIndexByKey: function(a) {
        var n = !1;
        return this.Configurations.forEach(function(e, t) {
            e.Key === a && (n = t)
        }),
        n
    },
    CheckAllowedDevices: function(e) {
        var t = this;
        if (!t.Configurations || t.Configurations) {
            var a = t.FindConfigurationIndexByKey("AllowedDevices");
            return !1 === a ? !0 : "None" !== t.Configurations[a].Value && ("All" === t.Configurations[a].Value || !!t.Configurations[a].Value.toLowerCase().split("|").includes(e))
        }
    },
    CheckConfigIPGeolocation: function() {
        var e = this;
        if (!e.Configurations || e.Configurations) {
            var t = e.FindConfigurationIndexByKey("IpGeolocationEnabled");
            if (!1 === t)
                return !1;
            if ("false" === e.Configurations[t].Value)
                return !1;
            if ("true" === e.Configurations[t].Value)
                return !0
        }
    },
    GetActivePillsTab: function() {
        return this.SetTasksTab("pills-vacaciones-tab") ? "pills-vacaciones-tab" : this.SetTasksTab("pills-ausencias-tab") ? "pills-ausencias-tab" : this.SetTasksTab("pills-cancelacion-de-vacaciones-tab") ? "pills-cancelacion-de-vacaciones-tab" : !!this.SetTasksTab("pills-cancelacion-de-ausencias-tab") && "pills-cancelacion-de-ausencias-tab"
    },
    SetTasksTab: function(e) {
        var t = document.getElementById(e);
        return !(!t || !t.className.includes("active")) && (self.PillTab = e,
        !0)
    },
    RenderField: function(a) {
        var e, t = "";
        switch (a.Class && (t = a.Class),
        a.Type) {
        case "info":
            e = '<label class="control-label col-md-4 col-lg-3">' + a.Label + '</label><p id="' + a.Name + '" class="col-md-8 col-lg-9 text-info ' + t + '">' + a.Value + "</p>";
            break;
        case "link":
            e = '<label class="control-label col-md-4 col-lg-3">' + a.Label + '</label>                    <div class="col-md-8 col-lg-9"><a class="d-block mb-0 ' + t + '" id="' + a.Name + '" href="#' + encodeURI(a.Name + "-" + a.Href) + '">' + a.Value + "</a></div>";
            break;
        case "text":
            e = '<label class="control-label col-md-4 col-lg-3" for="' + a.Name + '">' + a.Label + '</label>                                    <div class="col-md-8 col-lg-9"><input type="text" id="' + a.Name + '" class="form-control ' + t + '" value="' + a.Value + '"/></div>';
            break;
        case "num":
            e = '<label class="control-label col-md-4 col-lg-3" for="' + a.Name + '">' + a.Label + '</label>                                    <div class="col-md-8 col-lg-9"><input type="number" id="' + a.Name + '" class="form-control font-calibri text-right ' + t + '" value="' + parseFloat(a.Value).toFixed(2) + '" min="0" step="0.25" /></div>';
            break;
        case "textarea":
            e = '<label class="control-label col-md-4 col-lg-3" for="' + a.Name + '">' + a.Label + '</label>                                    <div class="col-md-8 col-lg-9"><textarea type="text" id="' + a.Name + '" class="form-control ' + t + '">' + a.Value + "</textarea></div>";
            break;
        case "select":
            e = '<label class="control-label col-md-4 col-lg-3" for="' + a.Name + '">' + a.Label + '</label>                                       <div class="col-md-8 col-lg-9"><select id="' + a.Name + '" class="form-control ' + t + '"></select></div>';
            break;
        case "date":
            e = '<label class="control-label col-md-4 col-lg-3" for="' + a.Name + '">' + a.Label + '</label>                                    <div class="col-md-8 col-lg-9">                                        <div class="input-group date ' + t + '" id="' + a.Name + '" data-target-input="nearest">                                            <input type="text" class="form-control datetimepicker-input" data-target="#' + a.Name + '" value="' + a.Value + '"/>                                            <div class="input-group-append" data-target="#' + a.Name + '" data-toggle="datetimepicker">                                                <div class="input-group-text"><i class="fa fa-calendar"></i></div>                                            </div>                                        </div>                                    </div>';
            break;
        case "date-block":
            e = '<label class="control-label" for="' + a.Name + '">' + a.Label + '</label>                                        <div class="input-group date ' + t + '" id="' + a.Name + '" data-target-input="nearest">                                            <input type="text" class="form-control datetimepicker-input" data-target="#' + a.Name + '" value="' + a.Value + '"/>                                            <div class="input-group-append" data-target="#' + a.Name + '" data-toggle="datetimepicker">                                                <div class="input-group-text"><i class="fa fa-calendar"></i></div>                                            </div>                                        </div>';
            break;
        case "checkbox":
            e = '<div class="custom-control custom-checkbox ' + t + '">',
            a.Value ? e += '<input type="checkbox" class="custom-control-input" id="' + a.Name + '" value="1" checked="true">' : e += '<input type="checkbox" class="custom-control-input" id="' + a.Name + '" value="1">',
            e += '<label class="custom-control-label" for="' + a.Name + '">' + a.Label + "</label></div>";
            break;
        case "info-checkbox":
            e = !0 === a.Value ? '<span class="far fa-check-square"></span><span class="control-label ml-2">' + a.Label + "</span>" : '<span class="far fa-square"></span><span class="control-label ml-2">' + a.Label + "</span>";
            break;
        case "autocomplete":
            e = '<label class="control-label col-md-4 col-lg-3" for="' + a.Name + '">' + a.Label + '</label>                                        <div class="col-md-8 col-lg-9">                                            <div class="input-group ' + t + '">                                                <input type="text" id="' + a.Name + '" class="form-control has-autocomplete" value="' + a.Value + '"/>                                                <div class="input-group-append"><button class="btn btn-outline-secondary" type="button" id="show-all-autocomplete"><span class="fa fa-chevron-down"></span></button></div>                                            </div>                                        </div>'
        }
        if ("text" === a.Type && !0 === a.ReadOnly) {
            var n = jQuery.parseHTML(e);
            return (r = $("<div>").append(n)).find("input").prop("readonly", !0),
            r.html()
        }
        if ("select" === a.Type && a.Options && a.Options.length) {
            var n = jQuery.parseHTML(e)
              , o = (r = $("<div>").append(n)).find("select");
            o.empty();
            var i, s = !1;
            return a.Options.forEach(function(e, t) {
                e.Value === a.Value ? ($("<option>", {
                    value: e.Value,
                    text: e.Text,
                    selected: "selected"
                }).appendTo(o),
                s = !0) : $("<option>", {
                    value: e.Value,
                    text: e.Text
                }).appendTo(o)
            }),
            !1 === s && (i = o.find("option:first").val(),
            o.val(i)),
            r.html()
        }
        if ("date" !== a.Type && "date-block" !== a.Type || !0 !== a.ReadOnly) {
            if ("checkbox" === a.Type && !0 === a.ReadOnly) {
                n = jQuery.parseHTML(e);
                return (r = $("<div>").append(n)).find("input").prop("disabled", !0),
                r.html()
            }
            if ("textarea" !== a.Type)
                return e;
            n = jQuery.parseHTML(e),
            r = $("<div>").append(n);
            return !0 === a.ReadOnly && r.find("textarea").prop("readonly", !0),
            r.html()
        }
        var r, n = jQuery.parseHTML(e);
        return (r = $("<div>").append(n)).find("input").prop("readonly", !0),
        r.html()
    }
}
  , Calendars = {
    isLoaded: !1,
    Control: !1,
    VacationsRanges: [],
    InternalId: !1,
    EmployeeCalendar: [],
    EmployeesCalendars: [],
    CalendarObject: null,
    Deferred: null,
    Init: function(n) {
        var o = this;
        o.isLoaded || $.cachedGetScript("/lib/js-year-calendar/js/js-year-calendar.min.js", function(e, t, a) {
            $.cachedGetScript("/lib/js-year-calendar/js/languages/js-year-calendar.es.js", function(e, t, a) {
                o.Control = n,
                o.InitEvents(),
                o.isLoaded = !0
            })
        })
    },
    InitEvents: function() {
        var e = this;
        $("body").on("click", "#menu-calendars", function() {
            e.CalendarObject = null,
            e.GetEmployeeCalendarView()
        }),
        $("body").on("click", "#menu-onduty-calendars-of-department", function() {
            e.CalendarObject = null,
            e.GetOnDutyCalendarsView()
        })
    },
    GetEmployeeCalendarView: function() {
        var e = this;
        e.CalendarObject ? (e.CalendarObject = null,
        e.LoadYearCalendar()) : ($.showLoading(),
        $("<div>", {
            id: "calendar-year",
            class: "font-calibri container"
        }).appendTo("main"),
        e.GetCalendarAjaxCall().done(function() {
            e.LoadYearCalendar(),
            $.hideLoading()
        }))
    },
    GetCalendarAjaxCall: function(e) {
        var t = this;
        return t.Deferred = $.Deferred(),
        e = e || (new Date).getFullYear(),
        $.ajax({
            url: api_url + "api/calendars/get-employee-calendar",
            contentType: "application/json",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                year: e
            },
            dataType: "json",
            success: function(e) {
                e.Success ? (t.Employees = e.Employees,
                t.EmployeeCalendar = e.Calendar,
                t.Deferred.resolve()) : $.displayMessage(e.Message, "danger")
            }
        }),
        t.Deferred.promise()
    },
    GetOnDutyCalendarsView: function() {
        var e, t = this;
        t.CalendarObject ? (t.CalendarObject = null,
        t.LoadYearCalendars()) : (e = e || $("body").find("main"),
        $(e).empty(),
        $("<h3>", {
            class: "container",
            text: "CALENDARIOS DE GUARDIA"
        }).appendTo("main"),
        $("<div>", {
            id: "loading-container"
        }).appendTo("main"),
        $("<div>", {
            id: "calendar-year",
            class: "font-calibri container"
        }).appendTo("main"),
        t.GetOnDutyCalendarsOfDepartmentAjaxCall().done(function() {
            t.LoadYearCalendars(),
            $.hideLoading()
        }))
    },
    GetOnDutyCalendarsOfDepartmentAjaxCall: function(e) {
        var t = this
          , a = $("main").find("#loading-container")
          , n = $.getLoadingSpinner();
        return $(a).empty(),
        $(a).append(n),
        $(a).fadeIn("fast"),
        t.Deferred = $.Deferred(),
        e = e || (new Date).getFullYear(),
        $.ajax({
            url: api_url + "api/calendars/get-onduty-calendars-of-several-employees",
            contentType: "application/json",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                year: e
            },
            dataType: "json",
            success: function(e) {
                e.Success ? (t.EmployeesCalendars = e.EmployeesCalendars,
                a ? $(a).children("#spinner-container").remove() : $("body").find("#spinner-container").remove(),
                t.Deferred.resolve()) : $.displayMessage(e.Message, "danger")
            }
        }),
        t.Deferred.promise()
    },
    LoadYearCalendar: function(e) {
        var t = this
          , a = [];
        t.EmployeeCalendar.forEach(function(e, t) {
            "" !== e.Text && a.push({
                id: e.Id,
                color: "#" + e.Color,
                startDate: new Date(e.StartDate),
                endDate: new Date(e.EndDate),
                text: e.Text
            })
        }),
        null !== t.CalendarObject && e ? t.CalendarObject.setDataSource(a) : t.CalendarObject = new Calendar("#calendar-year",{
            language: "es",
            yearChanged: function(e) {
                null !== t.CalendarObject && t.GetCalendarAjaxCall(e.currentYear).done(function() {
                    t.LoadYearCalendar(e.currentYear),
                    $.hideLoading()
                })
            },
            mouseOnDay: function(e) {
                if (0 < e.events.length) {
                    var t = "";
                    for (var a in e.events)
                        t += '<div class="event-tooltip-content"><div class="event-name" style="color:' + e.events[a].color + '">' + e.events[a].text + "</div></div>";
                    $(e.element).popover({
                        sanitize: !1,
                        trigger: "manual",
                        container: "body",
                        html: !0,
                        content: t
                    }),
                    $(e.element).popover("show")
                }
            },
            mouseOutDay: function(e) {
                0 < e.events.length && $(e.element).popover("hide")
            },
            dataSource: a
        })
    },
    LoadYearCalendars: function(e) {
        var t = this
          , n = [];
        t.EmployeesCalendars.forEach(function(a, e) {
            a.CalendarRanges.forEach(function(e, t) {
                "" !== e.Text && n.push({
                    id: e.Id,
                    color: "#" + e.Color,
                    startDate: new Date(e.StartDate),
                    endDate: new Date(e.EndDate),
                    text: a.EmployeeName
                })
            })
        }),
        null !== t.CalendarObject && e ? t.CalendarObject.setDataSource(n) : t.CalendarObject = new Calendar("#calendar-year",{
            language: "es",
            yearChanged: function(e) {
                null !== t.CalendarObject && t.GetOnDutyCalendarsOfDepartmentAjaxCall(e.currentYear).done(function() {
                    t.LoadYearCalendars(e.currentYear),
                    $.hideLoading()
                })
            },
            mouseOnDay: function(e) {
                if (0 < e.events.length) {
                    var t = "";
                    for (var a in e.events)
                        t += '<div class="event-tooltip-content"><div class="event-name" style="color:' + e.events[a].color + '">' + e.events[a].text + "</div></div>";
                    $(e.element).popover({
                        sanitize: !1,
                        trigger: "manual",
                        container: "body",
                        html: !0,
                        content: t
                    }),
                    $(e.element).popover("show")
                }
            },
            mouseOutDay: function(e) {
                0 < e.events.length && $(e.element).popover("hide")
            },
            dataSource: n
        })
    }
}
  , CompensationHours = {
    isLoaded: !1,
    Control: !1,
    InternalId: 1,
    TimeRanges: [],
    PillTab: !1,
    Init: function(e) {
        this.isLoaded || (this.InitEvents(),
        this.Control = e,
        this.isLoaded = !0)
    },
    InitEvents: function() {
        var n = this;
        $("body").on("click", "#menu-compensation-days", function() {
            n.GetCompensationHoursView()
        }),
        $("body").on("change", "input#checkAllDay", function() {
            $(this).is(":checked") ? $("#col-times-select").find(".form-group").fadeOut(function() {
                $("input#input-timepicker-start").val(""),
                $("input#input-timepicker-end").val("")
            }) : $("#col-times-select").find(".form-group").fadeIn()
        }),
        $("body").on("click", "#btn-add-compensation-hours", function() {
            var e = moment($("#compensation-hours").val(), "DD/MM/YYYY");
            e.isValid() || alert("No has seleccionado una fecha para la solicitud.");
            var t = {
                Id: n.InternalId++,
                Day: e.format("YYYY-MM-DD"),
                AllDay: $("input#checkAllDay").is(":checked"),
                TimeStart: $("input#input-timepicker-start").val(),
                TimeEnd: $("input#input-timepicker-end").val()
            };
            return t.AllDay || "" != t.TimeStart && "" != t.TimeEnd ? n.AddTimeRange(t) : alert('Tienes que seleccionar hora de inicio y hora de fin si no marcas la opción "Día completo"'),
            !1
        }),
        $("body").on("click", "#remove-compensation-hours", function() {
            var e = $(this).data();
            return n.DeleteCompensationDay(e.range.Id),
            $(this).parent("p").remove(),
            !1
        }),
        $("body").on("click", "#btn-request-compensation-hours", function() {
            return n.RequestCompensationHours(),
            !1
        }),
        $("body").on("click", "a#approve-compensation-hours", function() {
            var e = $(this).closest(".compensation-hours-request")
              , t = $(e).find(".idTask").val()
              , a = $(e).find(".comments").val();
            return n.PillTab = Control.GetActivePillsTab(),
            n.ApproveCompensationHoursTask(t, a, e),
            n.PillTab && document.getElementById(n.PillTab) && document.getElementById(n.PillTab).click(),
            !1
        }),
        $("body").on("click", "a#reject-compensation-hours", function() {
            var e = $(this).closest(".compensation-hours-request")
              , t = $(e).find(".idTask").val()
              , a = $(e).find(".comments").val();
            return n.PillTab = Control.GetActivePillsTab(),
            n.RejectCompensationHoursTask(t, a, e),
            n.PillTab && document.getElementById(n.PillTab) && document.getElementById(n.PillTab).click(),
            !1
        }),
        $("body").on("click", ".remove-compensation-hours-request", function() {
            return !0 === confirm("Estas seguro/a de anular esta solicitud de compensación de horas?") && n.RemoveCompensationHoursRequest(this),
            !1
        }),
        $("body").on("click", ".request-compensation-hours-cancellation", function() {
            return !0 === confirm("Seguro que quieres pedir la cancelación de esta compensación de horas?") && n.RequestCompensationHoursCancellation(this),
            !1
        })
    },
    GetCompensationHoursView: function() {
        var t = this;
        t.DeleteCompensationHours(),
        $.showLoading(),
        $.ajax({
            url: "/compensation-hours",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                $.hideLoading(),
                "" !== e && ($("main").empty(),
                $("main").append(e),
                $("#btn-request-compensation-hours").hide(),
                t.LoadTimeRangePicker(),
                t.LoadDatePicker())
            },
            error: function(e) {
                $.hideLoading()
            }
        })
    },
    AddTimeRange: function(e) {
        this.TimeRanges.push(e),
        this.PrintRanges(),
        $("#btn-request-compensation-hours").fadeIn()
    },
    DeleteCompensationDay: function(a) {
        var n = [];
        this.TimeRanges.forEach(function(e, t) {
            e.Id !== a && n.push(e)
        }),
        0 === (this.TimeRanges = n).length && $("#btn-request-compensation-hours").fadeOut()
    },
    DeleteCompensationHours: function() {
        this.TimeRanges = [],
        $("#btn-request-compensation-hours").fadeOut()
    },
    RequestCompensationHours: function() {
        var t = this;
        $.showLoading(),
        console.log(t.TimeRanges),
        $.ajax({
            url: "/compensation-hours/request",
            method: "POST",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: JSON.stringify(t.TimeRanges),
            success: function(e) {
                e.Success ? $.displayMessage(e.Message, "success") : $.alertError(e.Message),
                $.hideLoading(),
                t.GetCompensationHoursView()
            },
            error: function(e) {
                $.hideLoading(),
                t.GetCompensationHoursView()
            }
        })
    },
    ApproveCompensationHoursTask: function(e, t, a) {
        var n = $.getLoadingSpinner();
        $("body").find("section#messages").append(n),
        $.ajax({
            url: "compensation-hours/approve-task",
            method: "POST",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            data: {
                id: e,
                comments: t
            },
            dataType: "json",
            success: function(e) {
                $(n).remove(),
                Control.GetMenuPrincipal(),
                !0 === e.Success ? (displayMessage(e.Message, "success"),
                $(a).fadeOut("slow", function() {
                    $(this).remove(),
                    $("body").find(".vacation-request").length || $("body").find(".compensation-hours-request").length || $("body").find(".leave-days-request").length ? Control.GetPendingTasksView() : ($("header").find(".menu-chief-of-department-container").length && $("header").find(".menu-chief-of-department-container").closest("li").fadeOut(),
                    Control.GetView())
                })) : displayMessage(e.Message, "danger")
            },
            error: function(e) {
                $(n).remove()
            }
        })
    },
    RejectCompensationHoursTask: function(e, t, a) {
        var n = $.getLoadingSpinner();
        $("body").find("section#messages").append(n),
        $.ajax({
            url: "compensation-hours/reject-task",
            method: "POST",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            data: {
                id: e,
                comments: t
            },
            dataType: "json",
            success: function(e) {
                $(n).remove(),
                Control.GetMenuPrincipal(),
                !0 === e.Success ? (displayMessage(e.Message, "success"),
                $(a).fadeOut("slow", function() {
                    $(this).remove(),
                    $("body").find(".vacation-request").length || $("body").find(".compensation-hours-request").length || $("body").find(".leave-days-request").length ? Control.GetPendingTasksView() : ($("header").find(".menu-chief-of-department-container").length && $("header").find(".menu-chief-of-department-container").closest("li").fadeOut(),
                    Control.GetView())
                })) : displayMessage(e.Message, "danger")
            },
            error: function(e) {
                $(n).remove()
            }
        })
    },
    RemoveCompensationHoursRequest: function(t) {
        var a = this
          , e = $(t).data("id");
        $.ajax({
            url: "compensation-hours/remove-compensation-hours-request",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                requestId: e
            },
            dataType: "json",
            success: function(e) {
                e.Success ? ($(t).closest("tr").remove(),
                a.GetCompensationHoursView()) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    RequestCompensationHoursCancellation: function(t) {
        var a = this
          , e = {
            CompensationHourId: $(t).data("id")
        };
        $.ajax({
            url: a.Control.api_url + "api/compensation-hours/request-cancel",
            method: "POST",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: JSON.stringify(e),
            dataType: "json",
            success: function(e) {
                e.Success ? ($(t).closest("tr").remove(),
                a.GetCompensationHoursView()) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    ClearInputs: function() {
        $("#compensation-hours").val(""),
        $("input#checkAllDay").prop("checked", !1),
        $("input#timeStart").val(),
        $("input#timeEnd").val(),
        $("#col-times-select").find(".form-group").fadeIn()
    },
    PrintRanges: function() {
        var i = $("body").find("#date-ranges-selected");
        $(i).empty(),
        this.TimeRanges.forEach(function(e, t) {
            var a = moment(e.Day, "YYYY-MM-DD").format("DD/MM/YYYY");
            e.AllDay ? a += " (Día completo)" : a += " (" + e.TimeStart + " - " + e.TimeEnd + ")";
            var n = $("<p>").addClass(" p-2 border").text(a)
              , o = $("<span>", {
                id: "remove-compensation-hours",
                class: "fa fa-times text-danger float-right m-1 cursor-pointer"
            }).data("range", e);
            $(n).append(o).appendTo(i)
        })
    },
    LoadDatePicker: function() {
        $(".datepicker").datetimepicker({
            format: "L",
            minDate: moment(),
            locale: "es",
            ignoreReadonly: !0,
            defaultDate: !1
        })
    },
    LoadTimeRangePicker: function() {
        var e = {
            format: "LT",
            locale: "es",
            defaultDate: !1,
            ignoreReadonly: !0,
            debug: !1
        };
        $("#timepicker-start").datetimepicker(e),
        $("#timepicker-end").datetimepicker(e),
        $("#timepicker-start").on("change.datetimepicker", function(e) {
            $("#timepicker-end").datetimepicker("minDate", e.date)
        }),
        $("#timepicker-end").on("change.datetimepicker", function(e) {
            $("#timepicker-start").datetimepicker("maxDate", e.date)
        })
    }
}
  , Configurations = {
    loaded: !1,
    Control: !1,
    ConfigOptionsTree: [],
    ClockInsIntoWorkday: [],
    ClockInModal: !1,
    ModalId: "#modal-clockin",
    ModalChangeId: "#modal-clockin-change",
    TreeId: !1,
    ShowOptionsOrderType: !1,
    SelectedClockInId: !1,
    SelectedOptions: [],
    SelectedOptionPath: [],
    IsPauseOpened: !1,
    DeferredCloseModal: !1,
    DeferredCloseModalChange: !1,
    DeferredGetClockInConfiguration: !1,
    DeferredGetClockInList: !1,
    ModalChangeData: !1,
    Init: function(e) {
        var t = this;
        t.loaded || (t.LoadModalDom(),
        t.LoadModalChangeDom(),
        t.DeferredCloseModal = $.Deferred(),
        t.DeferredCloseModalChange = $.Deferred(),
        t.DeferredGetClockInConfiguration = $.Deferred(),
        t.DeferredGetClockInList = $.Deferred(),
        t.Control = e,
        t.InitEvents())
    },
    InitEvents: function() {
        var a = this;
        $("body").on("click", "#menu-settings", function() {
            a.GetSettingsView()
        }),
        $("body").on("click", "button.btn-save-settings", function() {
            var o = [];
            return $(this).closest("form").find(".form-group .input-settings").each(function(e, t) {
                var a, n;
                "checkbox" === $(t).attr("type") && (a = 0,
                $(t).is(":checked") && (a = 1),
                n = {
                    configurationId: $(t).data("id"),
                    confValue: a
                },
                o.push(n))
            }),
            a.SaveSettings(o),
            !1
        }),
        $("body").on("show.bs.modal", a.ModalId, function(e) {
            $(a.ModalId).find("textarea").empty(),
            $.ajax({
                url: a.Control.api_url + "api/configurations/get-tree-options",
                method: "GET",
                headers: {
                    Authorization: "Bearer " + $.getToken()
                },
                data: {
                    treeId: a.TreeId
                },
                dataType: "json",
                success: function(e) {
                    var t;
                    $(a.ModalId).find("select").remove(),
                    e.Success ? (a.ConfigOptionsTree = e.Tree,
                    a.LoadModalTitle(e.TreeTitle),
                    t = $.Deferred(),
                    a.GetClockInListFromWorkday(t),
                    t.done(function(e) {
                        e.Success ? (e.ClockInsIntoWorkday.length && (a.SetClockInsIntoWorkday(e.ClockInsIntoWorkday),
                        a.SetSelectedOptions(a.ClockInsIntoWorkday[0].Options)),
                        a.LoadInicialSelectsFromTree(a.ModalId)) : $.displayMessage(e.Message, "danger")
                    })) : $.displayMessage(e.Message, "danger")
                },
                error: function(e) {
                    $.displayMessage("Error. Se ha producido un error en la llamada ajax a cargar el conjunto de campos libres.", "danger")
                }
            })
        }),
        $("body").on("click", "button.btn-clock-in-accept", function() {
            var e = [];
            $(this).closest(".modal").find("select.optionsId").each(function() {
                $(this).val() && e.push({
                    OptionId: $(this).val()
                })
            });
            var t = {
                Options: e,
                Notes: $(this).closest(".modal").find("textarea").val(),
                State: $(this).closest(".modal").data("state")
            };
            t.State || $.displayMessage("No se ha cargado el estado del registro de opción.", "danger"),
            a.DeferredCloseModal.done(function(e) {
                $(a.ModalId).modal("hide"),
                $(a.ModalId).find("textarea").val(""),
                e.Success && a.Control.GetView()
            }),
            "start-workday" === t.State || "end-workday" === t.State ? a.RegisterClockInOnWorkday(t) : "start-pause" === t.State || "end-pause" === t.State ? a.RegisterClockInOnPause(t) : $(a.ModalId).modal("hide")
        }),
        $("body").on("click", "a.clock-in-register-link", function() {
            a.ClickOnChangeClockInButton()
        }),
        $("body").on("show.bs.modal", a.ModalChangeId, function(e) {
            a.IsPauseOpened || ($(this).find("textarea").empty(),
            $.ajax({
                url: a.Control.api_url + "api/configurations/get-tree-options",
                method: "GET",
                headers: {
                    Authorization: "Bearer " + $.getToken()
                },
                data: {
                    treeId: a.TreeId
                },
                dataType: "json",
                success: function(e) {
                    $(this).find("select").remove(),
                    e.Success ? (a.SetShowOptionsOrderType(e.ShowOption),
                    a.ConfigOptionsTree = e.Tree,
                    a.LoadModalChangeTitle(e.TreeTitle),
                    a.LoadInicialSelectsFromTree(a.ModalChangeId),
                    $table = $(a.ModalChangeId).find("#table-options-workday"),
                    $table.empty(),
                    a.ClockInsIntoWorkday.length && a.LoadClockInConfigurationsTable($table)) : $.displayMessage(e.Message, "danger")
                },
                error: function(e) {
                    $.displayMessage("Error. Se ha producido un error en la llamada ajax a cargar el conjunto de campos libres.", "danger")
                }
            }))
        }),
        $("body").on("shown.bs.modal", a.ModalChangeId, function(e) {
            a.SetIsPauseOpened(!1)
        }),
        $("body").on("click", "button.btn-clock-in-change-accept", function() {
            var e, t = [];
            $(this).closest(".modal").find("select.optionsId").each(function() {
                $(this).val() && t.push({
                    OptionId: $(this).val()
                })
            }),
            0 !== t.length ? (e = {
                Options: t,
                Notes: $(this).closest(".modal").find("textarea").val()
            },
            a.DeferredCloseModalChange.done(function(e) {
                $(a.ModalChangeId).modal("hide"),
                $(a.ModalChangeId).find("textarea").val(""),
                a.Control.GetView()
            }),
            a.RegisterClockInOnChangeOptionButton(e)) : $.displayMessage("No has seleccionado ningún campo para poder imputar tiempos. Debes seleccionar al menos uno de los que tengas disponibles.", "danger")
        }),
        $("body").on("click", "span.btn-stop-current-clock-in", function() {
            var t = $(this).closest("tr");
            $.ajax({
                url: a.Control.api_url + "api/clockIn/stop-current-clock-in",
                method: "GET",
                headers: {
                    Authorization: "Bearer " + $.getToken()
                },
                contentType: "application/json",
                success: function(e) {
                    e.Success ? ($.displayMessage(e.Message, "success"),
                    a.UpdateClockInTableAfterStop(e, t)) : $.displayMessage(e.Message, "danger")
                }
            })
        })
    },
    GetSettingsView: function() {
        $.showLoading(),
        $.ajax({
            url: "/configuration/",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                "" !== e ? ($("main").empty(),
                $("main").append(e)) : $.alertError(e.Message),
                $.removeLoading()
            },
            error: function() {
                $.removeLoading()
            }
        })
    },
    SaveSettings: function(e) {
        $.ajax({
            url: this.Control.api_url + "api/configurations/save-user-settings",
            method: "POST",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: JSON.stringify(e),
            dataType: "json",
            success: function(e) {
                e.Success ? $.displayMessage("La configuración ha sido modificada con éxito.", "success") : $.displayMessage(e.Message, "danger")
            }
        })
    },
    RegisterClockInOnWorkday: function(t) {
        var a = this;
        $.ajax({
            url: a.Control.api_url + "api/clockIn/register-clock-in-config-option-on-workday",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            contentType: "application/json",
            data: JSON.stringify({
                Options: t.Options,
                Notes: t.Notes,
                State: t.State,
                StartDate: moment(),
                EndDate: moment()
            }),
            success: function(e) {
                e.Success ? (a.SetSelectedOptions(t.Options),
                $.displayMessage(e.Message, "success")) : $.displayMessage(e.Message, "danger"),
                e.ClockIn = t,
                a.DeferredCloseModal.resolve(e)
            }
        }),
        a.DeferredCloseModal.promise()
    },
    RegisterClockInOnPause: function(t) {
        var a = this;
        $.ajax({
            url: a.Control.api_url + "api/clockIn/register-clock-in-config-option-on-pause",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            contentType: "application/json",
            data: JSON.stringify({
                Options: t.Options,
                Notes: t.Notes,
                State: t.State
            }),
            success: function(e) {
                e.Success ? (a.SetSelectedOptions(t.Options),
                $.displayMessage(e.Message, "success")) : $.displayMessage(e.Message, "danger"),
                a.Control.GetView(),
                a.DeferredCloseModal.resolve(e)
            }
        }),
        a.DeferredCloseModal.promise()
    },
    RegisterClockInOnChangeOptionButton: function(t) {
        var a = this;
        $.ajax({
            url: a.Control.api_url + "api/clockIn/register-clock-in-config-option-on-change-button",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            contentType: "application/json",
            data: JSON.stringify({
                Options: t.Options,
                Notes: t.Notes,
                StartDate: moment(),
                EndDate: moment()
            }),
            success: function(e) {
                e.Success ? (a.SetSelectedOptions(t.Options),
                $.displayMessage(e.Message, "success")) : $.displayMessage(e.Message, "danger"),
                e.ClockIn = t,
                a.DeferredCloseModalChange.resolve(e)
            }
        }),
        a.DeferredCloseModalChange.promise()
    },
    CloseOpenedClockInRegister: function(e) {
        var t = this;
        $.ajax({
            url: t.Control.api_url + "api/clockIn/close-clock-in-register",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                eventId: e
            },
            success: function(e) {
                e.Success && "" !== e.Message ? $.displayMessage(e.Message, "success") : !1 === e.Success && $.displayMessage(e.Message, "danger"),
                t.DeferredCloseModal && t.DeferredCloseModal.resolve(e),
                t.Control.GetView()
            }
        })
    },
    GetClockInConfigurationById: function(e) {
        var t = this;
        $.ajax({
            url: t.Control.api_url + "api/clockIn/get-clock-in-configuration",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                id: e
            },
            success: function(e) {
                e.Success ? t.DeferredGetClockInConfiguration.resolve(e.ClockInConfiguration) : ($.displayMessage(e.Message, "danger"),
                t.DeferredGetClockInConfiguration.resolve(""))
            }
        }),
        t.DeferredGetClockInConfiguration.promise()
    },
    GetClockInListFromWorkday: function(t) {
        $.ajax({
            url: this.Control.api_url + "api/clockIn/get-clock-in-options-list-into-workday",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            success: function(e) {
                t.resolve(e)
            }
        }),
        t.promise()
    },
    GetTreeOfOptions: function(t) {
        var a = this;
        $.ajax({
            url: a.Control.api_url + "api/configurations/get-tree-options",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                treeId: a.TreeId
            },
            dataType: "json",
            success: function(e) {
                e.Success ? a.ConfigOptionsTree = e.Tree : $.displayMessage(e.Message, "danger"),
                t && t.resolve()
            }
        }),
        t && t.promise()
    },
    ClickOnChangeClockInButton: function() {
        var t = this;
        $.ajax({
            url: t.Control.api_url + "api/clockIn/change-clock-in-option",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            success: function(e) {
                e.Success ? (t.ModalChangeData = e,
                t.SetTreeId(e.TreeOptionId),
                t.SetShowOptionsOrderType(e.ShowTreeOption),
                t.SetClockInsIntoWorkday(e.ClockInsIntoWorkday),
                $(t.ModalChangeId).modal("show")) : (t.ModalChangeData = !1,
                t.SetTreeId(e.TreeOptionId),
                t.SetClockInsIntoWorkday(e.ClockInsIntoWorkday),
                !0 === e.IsPauseOpened && (t.SetIsPauseOpened(!0),
                t.ShowModalChangeOnlyInfo(e.TreeOptionTitle)),
                $.displayMessage(e.Message, "info", 1e4))
            }
        })
    },
    ShowModalChangeOnlyInfo: function(e) {
        var t, a = this;
        $table = $(a.ModalChangeId).find("#table-options-workday"),
        $table.empty(),
        a.ClockInsIntoWorkday.length ? a.ConfigOptionsTree && a.ConfigOptionsTree.length ? (a.LoadClockInConfigurationsTable($table, !0),
        a.LoadModalChangeTitle(e),
        $(a.ModalChangeId).modal("show")) : (t = $.Deferred(),
        a.GetTreeOfOptions(t),
        t.done(function() {
            a.LoadClockInConfigurationsTable($table, !0),
            a.LoadModalChangeTitle(e),
            $(a.ModalChangeId).modal("show")
        })) : $.displayMessage("No hay registros de fichaje imputados en esta jornada.")
    },
    CloseOpenedClockInRegisterById: function() {
        var t = this;
        $.ajax({
            url: t.Control.api_url + "api/clockIn/close-clock-in-option-by-id",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                id: t.SelectedOptionId
            },
            success: function(e) {
                e.Success ? t.DeferredGetClockInConfiguration.resolve(e.Notes) : ($.displayMessage(e.Message, "danger"),
                t.DeferredGetClockInConfiguration.resolve(""))
            }
        })
    },
    SetTreeId: function(e) {
        this.TreeId = e
    },
    SetShowOptionsOrderType: function(e) {
        return e && (this.ShowOptionsOrderType = e),
        this.ShowOptionsOrderType
    },
    SetSelectedOptions: function(e) {
        return e && (this.SelectedOptions = e),
        this.SelectedOptions
    },
    SetClockInsIntoWorkday: function(e) {
        return e && (this.ClockInsIntoWorkday = e),
        this.ClockInsIntoWorkday
    },
    SetIsPauseOpened: function(e) {
        return !0 !== e && !1 !== e || (this.IsPauseOpened = e),
        this.SetIsPauseOpened
    },
    LoadInicialSelectsFromTree: function(n, i) {
        $(n).find(".select-container").empty(),
        this.ConfigOptionsTree.forEach(function(e, t) {
            var a = $("<select>", {
                class: "form-control mb-3 optionsId",
                name: "optionsId[]"
            });
            a.append($("<option>", {
                value: "",
                text: e.title,
                disabled: "true",
                hidden: "true"
            })),
            a.on("change", function() {
                "" === $(this).val() ? $(this).addClass("border border-warning") : $(this).addClass("border border-success")
            });
            var o = function(a, e) {
                var n, t;
                1 === e.data.level ? e.children && e.children.length && e.children.forEach(function(e, t) {
                    return o(a, e)
                }) : e.children && e.children.length ? (n = $("<optgroup>", {
                    label: e.title
                }),
                a.append(n),
                e.children.forEach(function(e, t) {
                    return o(n, e)
                })) : (t = $("<option>", {
                    value: e.key.toUpperCase(),
                    text: e.title
                }),
                a.append(t))
            };
            o(a, e),
            a.val(i),
            $(n).find(".modal-body .select-container").append(a)
        })
    },
    CreateSelectFromField: function(e) {},
    LoadClockInConfigurationsTable: function(e) {
        var d = this;
        e.append('<thead>                            <th class="text-center border-top-0">Inicio</th>                            <th class="text-center border-top-0">Fin</th>                            <th class="text-center border-top-0">Intervalo</th>                            <th class="border-top-0">Opción/es</th>                            <th class="border-top-0">Notas</th>                            <th class="border-top-0"></th>                        </thead>                        <tbody></tbody>'),
        $tbody = e.find("tbody");
        var c = !1;
        d.ClockInsIntoWorkday.forEach(function(e, t) {
            var a, n, o, i = moment(e.StartDate), s = moment(e.EndDate), r = $("<tr>");
            null === e.EndDate ? (c = !0,
            n = moment().diff(i, "seconds"),
            $("<td>", {
                text: i.format("DD-MM HH:mm"),
                class: "text-right"
            }).appendTo(r),
            $("<td>", {
                text: "... Abierto...",
                class: "text-right"
            }).appendTo(r),
            $("<td>", {
                text: d.FormatSeconds(n),
                class: "text-right"
            }).appendTo(r),
            o = $("<td>"),
            e.Options.forEach(function(e, t) {
                var a = d.GetOptionsPathIntoTreeById(e.OptionId);
                $("<span>", {
                    class: "badge badge-dark mr-2",
                    text: a
                }).appendTo(o)
            }),
            $(o).appendTo(r),
            $("<td>", {
                text: e.Notes
            }).appendTo(r),
            $(d.ModalChangeId).find(".configuration-options-list").hide(),
            a = $("<span>", {
                class: "btn-stop-current-clock-in p-0 float-right fa fa-stop-circle fa-2x text-danger",
                style: "line-height:1;cursor:pointer;",
                title: "Parar imputación actual de tiempo."
            }),
            $("<td>").append(a).appendTo(r)) : (n = s.diff(i, "seconds"),
            $("<td>", {
                text: i.format("DD-MM HH:mm"),
                class: "text-right"
            }).appendTo(r),
            $("<td>", {
                text: s.format("DD-MM HH:mm"),
                class: "text-right"
            }).appendTo(r),
            $("<td>", {
                text: d.FormatSeconds(n),
                class: "text-right"
            }).appendTo(r),
            o = $("<td>"),
            e.Options.forEach(function(e, t) {
                var a = d.GetOptionsPathIntoTreeById(e.OptionId);
                $("<span>", {
                    class: "badge badge-dark mr-2",
                    text: a
                }).appendTo(o)
            }),
            $(o).appendTo(r),
            $("<td>", {
                text: e.Notes
            }).appendTo(r),
            $("<td>").appendTo(r)),
            $tbody.append(r)
        }),
        c || $(d.ModalChangeId).find(".configuration-options-list").fadeIn("slow"),
        d.IsPauseOpened && $(d.ModalChangeId).find(".configuration-options-list").hide()
    },
    UpdateClockInTableAfterStop: function(e, t) {
        var a = $("body").find(".clock-in-register-link");
        a.removeClass("started"),
        a.closest(".event-content").find("strong").remove(),
        $(".configuration-options-list").fadeIn("slow");
        var n = e.ClockInModified
          , o = moment(n.EndDate);
        t.find("td:eq(1)").addClass("text-right").text(o.format("DD-MM HH:mm"));
        var i = o.diff(moment(n.StartDate), "seconds");
        t.find("td:eq(2)").text(this.FormatSeconds(i)),
        t.find("td:eq(5)").remove()
    },
    GetChildrenOptionsByKey: function(e, a) {
        var n = this
          , o = !1;
        return e && e.forEach(function(e, t) {
            e.key.toUpperCase() === a.toUpperCase() ? o = e : e.children && !1 === o && (o = n.GetChildrenOptionsByKey(e.children, a))
        }),
        o
    },
    CreateSelectWithOptions: function(e, t) {
        var n, a = this;
        !a.SelectedOptionId && a.ClockInsIntoWorkday && a.ClockInsIntoWorkday.length && a.SetSelectedOptions(a.ClockInsIntoWorkday[0].Options),
        e && e.length && (n = $("<select>", {
            class: "form-control mb-3 config-option"
        }),
        e.forEach(function(e, t) {
            0 === t && n.data("level", e.data.level);
            var a = $("<option>", {
                value: e.key.toUpperCase(),
                text: e.title
            });
            n.append(a)
        }),
        $(t).find(".modal-body .select-container").append(n))
    },
    GetOptionsPathIntoTreeById: function(a) {
        var n = this;
        if (n.ConfigOptionsTree && n.ConfigOptionsTree.length) {
            a = a || n.SelectedOptions[0].OptionId;
            var e = [];
            !n.SetSelectedOptions.length && n.ClockInsIntoWorkday.length && n.ClockInsIntoWorkday[0].Options.length && n.SetSelectedOptions(n.ClockInsIntoWorkday[0].Options);
            var o = !1;
            if (n.ConfigOptionsTree.forEach(function(e, t) {
                o = n.GetNodeFromTreeById(a)
            }),
            o)
                for (e.push(o); o && o.data.parentId; )
                    (o = n.GetNodeFromTreeById(o.data.parentId)) && e.push(o);
            var t = "";
            if (e.length) {
                for (var i = e.length - 1; 0 <= i; i--)
                    t += e[i].title + " / ";
                return t.substring(0, t.length - 3)
            }
            return t
        }
    },
    GetNodeFromTreeById: function(a) {
        var t = []
          , n = function(e, a) {
            e.key.toUpperCase() === a.toUpperCase() ? t.push(e) : e.children && e.children.length && e.children.forEach(function(e, t) {
                return n(e, a)
            })
        };
        return this.ConfigOptionsTree.forEach(function(e, t) {
            n(e, a)
        }),
        !!t.length && t.pop()
    },
    LoadModalTitle: function(e) {
        $(this.ModalId).find(".modal-title").text(e)
    },
    LoadModalDom: function() {
        $("body").append('<div class="modal fade" id="modal-clockin" tabindex="-1" role="dialog" aria-labelledby="modal-clockinTitle" aria-hidden="true">                          <div class="modal-dialog modal-dialog-centered" role="document">                            <div class="modal-content">                              <div class="modal-header">                                <h5 class="modal-title" id="exampleModalCenterTitle">Modal title</h5>                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">                                  <span aria-hidden="true">&times;</span>                                </button>                              </div>                              <div class="modal-body">                                <div class="row">                                    <div class="col-12 select-container">                                    </div>                                </div>                                <div class="row">                                    <div class="col-12 mt-3">                                        <textarea id="notes" class="form-control" placeholder="Notas (máx 500 caracteres)"></textarea>                                    </div>                                </div>                                <div class="row mt-3">                                    <div class="col-12 text-right">                                        <button type="button" class="btn btn-danger" data-dismiss="modal">Cancelar</button>                                        <button type="button" class="btn btn-success btn-clock-in-accept">Aceptar</button>                                    </div>                                </div>                              </div>                            </div>                          </div>                        </div>')
    },
    LoadModalChangeTitle: function(e) {
        $(this.ModalChangeId).find(".modal-title").text(e)
    },
    LoadModalChangeDom: function() {
        $("body").append('<div class="modal fade" id="modal-clockin-change" tabindex="-1" role="dialog" aria-labelledby="modal-clockinTitle" aria-hidden="true">                          <div class="modal-dialog modal-dialog-centered modal-lg" role="document">                            <div class="modal-content">                              <div class="modal-header">                                <h5 class="modal-title" id="exampleModalCenterTitle">Modal title</h5>                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">                                  <span aria-hidden="true">&times;</span>                                </button>                              </div>                              <div class="modal-body">                                <div class="row">                                    <div class="col-12">                                        <div class="table-responsive">                                            <table class="table table-sm font-calibri" id="table-options-workday">                                            </table>                                        </div>                                    </div>                                </div>                                <div class="configuration-options-list">                                    <div class="row">                                        <div class="col-12 col-md-5">                                            <label class="mb-1 text-dark form-label">Campos/opciones a imputar</label>                                            <div class="select-container">                                            </div>                                        </div>                                        <div class="col-12 col-md-7">                                            <label class="text-dark">Notas (Máx. 500 caracteres)</label>                                            <textarea id="notes" class="form-control"></textarea>                                        </div>                                    </div>                                    <div class="row mt-2">                                        <div class="col-12 text-right">                                            <button type="button" class="btn btn-danger" data-dismiss="modal">Cancelar</button>                                            <button type="button" class="btn btn-success btn-clock-in-change-accept">Guardar</button>                                        </div>                                    </div>                                </div>                              </div>                            </div>                          </div>                        </div>')
    },
    FormatSeconds: function(e) {
        var t = ""
          , a = Math.ceil(e / 60)
          , n = Math.ceil(a % 60)
          , o = Math.floor(a / 60)
          , i = Math.floor(o % 60)
          , s = Math.floor(o / 24);
        return 0 < s ? t += s + "d " : (t += 24 <= o ? i < 10 ? "0" + i + ":" : i + ":" : o < 10 ? "0" + o + ":" : o + ":",
        t += 60 <= a ? n < 10 ? "0" + n + "h" : n + "h" : a < 10 ? "0" + a + "h" : a + "h"),
        t
    },
    ShowClockInModal: function(e) {
        e ? $(this.ModalId).data("state", e) : $(this.ModalId).data("state", ""),
        $(this.ModalId).modal("show")
    }
}
  , ManualRegister = {
    isLoaded: !1,
    Control: !1,
    Init: function(e) {
        this.isLoaded || (this.Control = e,
        this.InitEvents(),
        this.isLoaded = !0)
    },
    InitEvents: function() {
        var o = this;
        $("body").on("click", "a.manual-event-register-link", function() {
            o.LoadRegisterManualView()
        }),
        $("body").on("click", "#menu-manual-clock-in", function() {
            o.LoadClockInManualView()
        }),
        $("body").on("click", "button.btn-manual-register-event", function() {
            var e = $(".manual-register-container").find(".list-group-item-action.active").data("value")
              , t = $(".date.startDate").datetimepicker("date")
              , a = $(".date.endDate").datetimepicker("date");
            if (null === t || null === a)
                return $.alertError("Es necesario seleccionar las dos fechas del evento, inicio y fin."),
                !1;
            o.ManualEventRegister(e, t, a)
        }),
        $("body").on("click", "button.boton-manual-register-back", function() {
            o.Control.GetView()
        }),
        $("body").on("change", "#clockin-tree select.config-option", function(e) {
            var t = $(this).val()
              , a = $(this).data("level")
              , n = o.GetChildrenOptionsByKey(o.ConfigOptionsTree, t);
            $("#clockin-tree select:eq(" + a + ")").remove(),
            n.children && n.children.length && o.LoadSelectsFromTree(n)
        }),
        $("body").on("click", "button.btn-option-clockin-register", function() {
            var e, t, a, n = [];
            $("#clockin-tree select").each(function() {
                $(this).val() && n.push({
                    OptionId: $(this).val()
                })
            }),
            0 !== n.length ? (e = $("textarea#notes").val(),
            t = $("#datePickerOptionStart").datetimepicker("date"),
            a = $("#datePickerOptionEnd").datetimepicker("date"),
            o.RegisterManualClockInOption(n, e, t, a)) : $.displayMessage("No has seleccionado ningún campo para poder imputar tiempos. Debes seleccionar al menos uno de los que tengas disponibles.", "danger")
        })
    },
    LoadRegisterManualView: function() {
        var t = this;
        $.ajax({
            url: "/events/manual-register",
            method: "GET",
            cache: !1,
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                "" != e ? ($("main").empty(),
                $("main").append(e),
                t.InitManualRegisterDatePickers(),
                t.InitManualRegisterClockinDatepicker(),
                $("main").find("#clockin-tree").length && (t.TreeId = $("body").find("#clockin-tree").data("treeid"),
                t.InitClockInOptionsRegisterDatePickers(),
                t.LoadConfigurationOptionsTree()),
                t.GetDayEvents(moment().format("DD-MM-YYYY"))) : $.alertError(e.Message)
            }
        })
    },
    ManualEventRegister: function(e, t, a) {
        var n = this;
        $.showLoading();
        var o = {
            EventTypeId: e,
            StartDate: t.format(),
            EndDate: a.format()
        };
        $.ajax({
            url: n.Control.api_url + "api/events/manual-register",
            method: "POST",
            cache: !1,
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: JSON.stringify(o),
            success: function(e) {
                e.Success ? $.displayMessage("Evento registrado correctamente.", "success") : $.displayMessage(e.Message, "danger"),
                n.LoadRegisterManualView(),
                $.hideLoading()
            },
            error: function() {
                $.hideLoading()
            }
        })
    },
    LoadClockInManualView: function() {
        var t = this;
        $.ajax({
            url: "/clock-in/manual-register",
            method: "GET",
            cache: !1,
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                "" != e ? ($("main").empty(),
                $("main").append(e),
                t.InitManualRegisterClockinDatepicker(),
                $("main").find("#clockin-tree").length && (t.TreeId = $("body").find("#clockin-tree").data("treeid"),
                t.InitClockInOptionsRegisterDatePickers(),
                t.LoadConfigurationOptionsTree()),
                t.GetDayEvents(moment().format("DD-MM-YYYY"))) : $.alertError(e.Message)
            }
        })
    },
    InitManualRegisterDatePickers: function() {
        $(".date.startDate").datetimepicker({
            locale: "es",
            format: "DD-MM-YYYY HH:mm",
            maxDate: moment(),
            sideBySide: !0,
            ignoreReadonly: !0,
            buttons: {
                showClose: !0
            },
            icons: {
                time: "fa fa-clock"
            }
        }),
        $(".date.endDate").datetimepicker({
            locale: "es",
            format: "DD-MM-YYYY HH:mm",
            maxDate: moment().endOf("day"),
            sideBySide: !0,
            useCurrent: !1,
            ignoreReadonly: !0,
            buttons: {
                showClose: !0
            },
            icons: {
                time: "fa fa-clock"
            }
        }),
        $(".date.startDate").on("change.datetimepicker", function(e) {
            var t = moment(e.date);
            $(".date.endDate").datetimepicker("minDate", t),
            $(".date.endDate").datetimepicker("date") || (t.endOf("day"),
            $(".date.endDate").datetimepicker("date", t))
        }),
        $(".date.endDate").on("change.datetimepicker", function(e) {
            var t = moment(e.date);
            moment().isBefore(t) && (t = moment()),
            $(".date.startDate").datetimepicker("maxDate", t),
            $(".date.startDate").datetimepicker("date") || $(".date.startDate").datetimepicker("date", t)
        })
    },
    InitManualRegisterClockinDatepicker: function() {
        var t = this
          , e = moment().add(-15, "days");
        $("#events-calendar").datetimepicker({
            inline: !0,
            sideBySide: !0,
            minDate: e,
            locale: "es",
            format: "L"
        }),
        $("#events-calendar").on("change.datetimepicker", function(e) {
            t.GetDayEvents(e.date.format("DD-MM-YYYY"))
        })
    },
    InitClockInOptionsRegisterDatePickers: function() {
        var a = this;
        $("#datePickerOptionStart").datetimepicker({
            locale: "es",
            format: "DD-MM-YYYY HH:mm",
            sideBySide: !0,
            useCurrent: !1,
            ignoreReadonly: !0,
            buttons: {
                showClose: !0
            },
            icons: {
                time: "fa fa-clock"
            }
        }),
        $("#datePickerOptionEnd").datetimepicker({
            locale: "es",
            format: "DD-MM-YYYY HH:mm",
            sideBySide: !0,
            ignoreReadonly: !0,
            buttons: {
                showClose: !0
            },
            icons: {
                time: "fa fa-clock"
            }
        }),
        $("#datePickerOptionStart").on("change.datetimepicker", function(e) {
            var t = moment(e.date);
            $("#datePickerOptionEnd").datetimepicker("minDate", t),
            a.GetPreviousClocksIn(t.format("YYYY-MM-DD"))
        }),
        $("#datePickerOptionEnd").on("change.datetimepicker", function(e) {
            var t = moment(e.date);
            $("#datePickerOptionStart").datetimepicker("maxDate", t)
        })
    },
    GetPreviousClocksIn: function(t) {
        var a = this;
        $.ajax({
            url: a.Control.api_url + "api/clock-in/get-clocks-in-from-day",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                day: t
            },
            success: function(e) {
                e.Success ? a.PrintClockInTable(e.ClockInsIntoWorkday, t) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    GetDayEvents: function(t) {
        var a = this;
        $.ajax({
            url: a.Control.api_url + "api/events/get-events-from-day",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                day: t
            },
            success: function(e) {
                e.Success ? a.ShowEventsFromDay(e.Events, t) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    RegisterManualClockInOption: function(e, t, a, n) {
        var o = this
          , i = moment(a).format("YYYY-MM-DD HH:mm")
          , s = moment(n).format("YYYY-MM-DD HH:mm");
        $.ajax({
            url: o.Control.api_url + "api/clockin/register-manual-clock-in-config-option",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            contentType: "application/json",
            data: JSON.stringify({
                Options: e,
                Notes: t,
                StartDate: i,
                EndDate: s
            }),
            success: function(e) {
                e.Success ? ($.displayMessage(e.Message, "success"),
                o.GetPreviousClocksIn(i)) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    LoadConfigurationOptionsTree: function() {
        var t = this;
        $.ajax({
            url: t.Control.api_url + "api/configurations/get-tree-options",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                treeId: t.TreeId
            },
            dataType: "json",
            success: function(e) {
                $(t.ModalId).find("select").remove(),
                e.Success ? (t.ConfigOptionsTree = e.Tree,
                t.LoadInicialSelectsFromTree(e.TreeTitle)) : $.displayMessage(e.Message, "danger")
            },
            error: function(e) {
                $.displayMessage("Error. Se ha producido un error en la llamada ajax a cargar el conjunto de campos libres.", "danger")
            }
        })
    },
    LoadInicialSelectsFromTree: function(e) {
        $("#clockin-tree").empty(),
        $("#clockin-tree").append($("<h5>", {
            class: "text-primary",
            text: e
        })),
        this.ConfigOptionsTree.forEach(function(e, t) {
            var a = $("<select>", {
                class: "form-control mb-3 optionsId",
                name: "optionsId[]"
            });
            a.append($("<option>", {
                value: "",
                text: e.title,
                disabled: "true",
                hidden: "true"
            })),
            a.on("change", function() {
                "" === $(this).val() ? $(this).addClass("border border-warning") : $(this).addClass("border border-success")
            });
            var o = function(a, e) {
                var n, t;
                1 === e.data.level ? e.children && e.children.length && e.children.forEach(function(e, t) {
                    return o(a, e)
                }) : e.children && e.children.length ? (n = $("<optgroup>", {
                    label: e.title
                }),
                a.append(n),
                e.children.forEach(function(e, t) {
                    return o(n, e)
                })) : (t = $("<option>", {
                    value: e.key.toUpperCase(),
                    text: e.title
                }),
                a.append(t))
            };
            o(a, e),
            a.val(""),
            $("#clockin-tree").append(a)
        })
    },
    LoadSelectsFromTree: function(e) {
        var t, a = [];
        e.children && (e.children.forEach(function(e, t) {
            a.push(e)
        }),
        this.CreateSelectWithOptions(a),
        (t = a[0]) && t.children && this.LoadSelectsFromTree(t))
    },
    GetChildrenOptionsByKey: function(e, a) {
        var n = this
          , o = !1;
        return e && e.forEach(function(e, t) {
            e.key.toUpperCase() === a.toUpperCase() ? o = e : e.children && !1 === o && (o = n.GetChildrenOptionsByKey(e.children, a))
        }),
        o
    },
    CreateSelectWithOptions: function(e) {
        var n;
        e && e.length && (n = $("<select>", {
            class: "form-control mt-3 config-option"
        }),
        e.forEach(function(e, t) {
            0 === t && n.data("level", e.data.level);
            var a = $("<option>", {
                value: e.key.toUpperCase(),
                text: e.title
            });
            n.append(a)
        }),
        $("#clockin-tree").append(n))
    },
    ShowEventsFromDay: function(e, t) {
        var a = this
          , n = $(".events-container");
        n.empty(),
        n.append($("<h5>", {
            class: "pb-1 border-bottom border-dark mb-3 text-center",
            text: t
        })),
        $eventList = $("<div>", {
            id: "event-list-content"
        }).appendTo(n),
        e.forEach(function(e, t) {
            $eventList.append(a.PrintWorkDayEvent(e.Principal)),
            e.Events.forEach(function(e, t) {
                $eventList.append(a.PrintPauseEvent(e))
            })
        })
    },
    PrintWorkDayEvent: function(e) {
        var t = "(pendiente)";
        e.EndDate && (t = moment(e.EndDate).format("HH:mm"));
        var a = '<div class="row mt-2">                        <div class="col-2"><span class="far fa-play-circle fa-2x align-self-center m-auto"></span></div>                        <div class="col-10 pl-1">                            <h5>                                <p class="mb-1">' + e.Name + ' <small class="badge badge-dark float-right">' + e.DurationString + '</small></p>                                <small class="d-block mt-1">' + moment(e.StartDate).format("HH:mm") + " a " + t + "</small>                            </h5>                        </div>                    </div>";
        return $.parseHTML(a)
    },
    PrintPauseEvent: function(e) {
        var t = "(pendiente)";
        e.EndDate && (t = moment(e.EndDate).format("HH:mm"));
        var a = '<div class="row mt-2 pl-4">                        <div class="col-2"><span class="far fa-pause-circle fa-2x align-self-center m-auto"></span></div>                        <div class="col-10 pl-1">                            <h5>                                <p class="mb-1">' + e.Name + ' <small class="badge badge-dark float-right">' + e.DurationString + '</small></p>                                <small class="d-block mt-1">' + moment(e.StartDate).format("HH:mm") + " a " + t + "</small>                            </h5>                        </div>                    </div>";
        return $.parseHTML(a)
    },
    PrintClockInTable: function(e, t) {
        var a, r, d = this;
        $("#previous-clocks-in-list .card-header").empty(),
        $("#previous-clocks-in-list .card-body").empty(),
        $("<h4>", {
            text: t,
            class: "mb-0"
        }).appendTo("#previous-clocks-in-list .card-header"),
        0 === e.length ? $("<p>", {
            text: "No hay registrada ninguna imputación de tiempos en este día.",
            class: "mb-0"
        }).appendTo("#previous-clocks-in-list .card-body") : (a = $('<table class="table table-sm mb-0 font-calibri"><thead>                            <th class="text-center border-top-0">Inicio</th>                            <th class="text-center border-top-0">Fin</th>                            <th class="text-center border-top-0">Intervalo</th>                            <th class="border-top-0">Opción/es</th>                            <th class="border-top-0">Notas</th>                            <th class="border-top-0"></th>                        </thead>                        </table>'),
        r = $("<tbody>").appendTo(a),
        e.forEach(function(e, t) {
            var a, n = moment(e.StartDate), o = moment(e.EndDate), i = $("<tr>");
            $("<td>", {
                text: n.format("DD-MM HH:mm"),
                class: "text-right"
            }).appendTo(i),
            moment.isMoment(o) ? (a = o.diff(n, "seconds"),
            $("<td>", {
                text: o.format("DD-MM HH:mm"),
                class: "text-right"
            }).appendTo(i)) : (a = moment().diff(n, "seconds"),
            $("<td>", {
                text: "... Abierto...",
                class: "text-right"
            }).appendTo(i)),
            $("<td>", {
                text: d.FormatSeconds(a),
                class: "text-right"
            }).appendTo(i);
            var s = $("<td>");
            e.Options.forEach(function(e, t) {
                $("<span>", {
                    class: "badge badge-dark mr-2",
                    text: e.Value
                }).appendTo(s)
            }),
            $(s).appendTo(i),
            $("<td>", {
                text: e.Notes
            }).appendTo(i),
            $("<td>").appendTo(i),
            r.append(i)
        }),
        a.appendTo("#previous-clocks-in-list .card-body")),
        $("#previous-clocks-in-list").fadeIn("slow")
    },
    FormatSeconds: function(e) {
        var t = ""
          , a = Math.ceil(e / 60)
          , n = Math.ceil(a % 60)
          , o = Math.floor(a / 60)
          , i = Math.floor(o % 60)
          , s = Math.floor(o / 24);
        return 0 < s ? t += s + "d " : (t += 24 <= o ? i < 10 ? "0" + i + ":" : i + ":" : o < 10 ? "0" + o + ":" : o + ":",
        t += 60 <= a ? n < 10 ? "0" + n + "h" : n + "h" : a < 10 ? "0" + a + "h" : a + "h"),
        t
    }
}
  , Reports = {
    isLoaded: !1,
    Control: !1,
    Init: function(e) {
        this.isLoaded || (this.Control = e,
        this.InitEvents(),
        this.isLoaded = !0)
    },
    InitEvents: function() {
        var t = this;
        $("body").on("click", "#menu-reports", function() {
            t.GetReportView()
        }),
        $("body").on("click", "#menu-reports-clock-in", function() {
            t.GetReportClockInView()
        }),
        $("body").on("click", "a.btn-get-report", function() {
            t.LastInitDateReport = $(".date-report.startDate").datetimepicker("date"),
            t.LastEndDateReport = $(".date-report.endDate").datetimepicker("date"),
            t.LastInitDateReport && t.LastEndDateReport ? t.GetReportUser(t.LastInitDateReport, t.LastEndDateReport) : $.displayMessage("Debes seleccionar una fecha de inicio y de Fin para poder ver el informe.", "info")
        }),
        $("body").on("click", "a.btn-get-report-detailed", function() {
            t.LastInitDateReport = $(".date-report.startDate").datetimepicker("date"),
            t.LastEndDateReport = $(".date-report.endDate").datetimepicker("date"),
            t.LastInitDateReport && t.LastEndDateReport ? t.GetReportUserDetailed(t.LastInitDateReport, t.LastEndDateReport) : $.displayMessage("Debes seleccionar una fecha de inicio y de Fin para poder ver el informe.", "info")
        }),
        $("body").on("click", "a#btn-get-report-clock-in", function() {
            t.LastInitDateReport = $(".date-report.startDate").datetimepicker("date");
            var e = $(".date-report.endDate").datetimepicker("date");
            t.LastEndDateReport = e.endOf("day"),
            t.LastInitDateReport && t.LastEndDateReport ? t.GetReportClockInUser(t.LastInitDateReport, t.LastEndDateReport) : $.displayMessage("Debes seleccionar una fecha de inicio y de Fin para poder ver el informe.", "info")
        }),
        $("body").on("click", "a.btn-volver-report-view", function() {
            return Reports.GetReportView(),
            !1
        }),
        $("body").on("click", "a.btn-back-report-clock-in-view", function() {
            return Reports.GetReportClockInView(),
            !1
        })
    },
    GetReportView: function() {
        var t = this;
        $.ajax({
            url: "/reports/get-report-view",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                "" !== e ? ($("main").empty(),
                $("main").append(e),
                t.InitUserReportDatePickers()) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    GetReportClockInView: function() {
        var t = this;
        $.ajax({
            url: "/reports/get-report-clock-in-view",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(e) {
                "" !== e ? ($("main").empty(),
                $("main").append(e),
                t.InitUserReportDatePickers()) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    InitUserReportDatePickers: function() {
        var e = {
            locale: "es",
            format: "DD-MM-YYYY",
            ignoreReadonly: !0,
            buttons: {
                showClose: !0
            }
        };
        !1 !== this.LastInitDateReport && (e.defaultDate = this.LastInitDateReport),
        $(".date-report.startDate").datetimepicker(e);
        var t = {
            locale: "es",
            format: "DD-MM-YYYY",
            useCurrent: !1,
            ignoreReadonly: !0,
            buttons: {
                showClose: !0
            }
        };
        !1 !== this.LastEndDateReport && (t.defaultDate = this.LastEndDateReport),
        $(".date-report.endDate").datetimepicker(t),
        $(".date-report.startDate").on("change.datetimepicker", function(e) {
            var t = moment(e.date);
            $(".date-report.endDate").datetimepicker("minDate", t)
        }),
        $(".date-report.endDate").on("change.datetimepicker", function(e) {
            var t = moment(e.date);
            $(".date-report.startDate").datetimepicker("maxDate", t)
        })
    },
    GetReportUser: function(e, t) {
        $.showLoading(),
        $.ajax({
            url: "/reports/get-simple-report",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                startDate: e.format("DD-MM-YYYY"),
                endDate: t.format("DD-MM-YYYY")
            },
            dataType: "html",
            success: function(e) {
                $.hideLoading(),
                "" !== e ? ($("main").empty(),
                $("main").append(e)) : $.displayMessage(e.Message, "danger")
            },
            error: function(e) {
                $.hideLoading()
            }
        })
    },
    GetReportUserDetailed: function(e, t) {
        $.showLoading(),
        $.ajax({
            url: "/reports/get-detailed-report",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                startDate: e.format("DD-MM-YYYY"),
                endDate: t.format("DD-MM-YYYY")
            },
            dataType: "html",
            success: function(e) {
                $.hideLoading(),
                "" !== e ? ($("main").empty(),
                $("main").append(e)) : $.displayMessage(e.Message, "danger")
            },
            error: function(e) {
                $.hideLoading()
            }
        })
    },
    GetReportClockInUser: function(e, t) {
        $.showLoading(),
        $.ajax({
            url: "/reports/get-report-clock-in",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                startDate: e.format("DD-MM-YYYY"),
                endDate: t.format()
            },
            dataType: "html",
            success: function(e) {
                $.hideLoading(),
                "" !== e ? ($("main").empty(),
                $("main").append(e)) : $.displayMessage(e.Message, "danger")
            },
            error: function(e) {
                $.hideLoading()
            }
        })
    }
}
  , ClockInNotBindPage = {
    isLoaded: !1,
    Tree: !1,
    Container: "clock-in-register-container",
    TimesheetContainer: "timesheet-container",
    TimesheetContainerId: "#",
    Timesheets: [],
    Init: function() {
        var e = this;
        e.isLoaded || (e.TimesheetContainerId += e.TimesheetContainer,
        e.InitEvents(),
        e.isLoaded = !0)
    },
    InitEvents: function() {
        var t = this;
        $("body").on("click", "a#menu-clock-in-not-bind", function() {
            t.LoadClockInManualView()
        }),
        $("body").on("click", "button#add-new-timesheet", function(e) {
            e.stopPropagation(),
            t.CreateClockInTimesheet().Render(t.TimesheetContainer)
        })
    },
    LoadClockInManualView: function() {
        var t = this;
        $.ajax({
            url: api_url + "api/clock-in/get-clock-in-tree",
            method: "GET",
            cache: !1,
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "json",
            success: function(e) {}
        }).done(function(e) {
            e.Success ? (t.Tree = new ConfigTree(e.Tree),
            t.Render()) : $.displayMessage(e.Message, "danger")
        })
    },
    GetDayTimesheets: function(e) {
        return $.ajax({
            url: api_url + "api/clock-in/get-timesheets-from-day",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "json",
            error: function() {
                $.displayMessage("Se ha producido un error en la llamada a la api.", "danger")
            }
        })
    },
    CreateClockInTimesheet: function() {
        return new ClockInTimesheet({
            TimesheetDate: moment().format("DD/MM/YYYY"),
            Tree: this.Tree
        })
    },
    InitCalendarInline: function() {
        var t = this
          , e = moment().add(-15, "days");
        $("#calendar-inline-clockin").datetimepicker({
            inline: !0,
            sideBySide: !0,
            minDate: e,
            locale: "es",
            format: "L"
        }),
        $("#calendar-inline-clockin").on("change.datetimepicker", function(e) {
            t.GetDayTimesheets(e.date.format("DD-MM-YYYY"))
        })
    },
    Render: function() {
        $.showLoading();
        var e = '<div id="clock-in-register-container" class="container mt-4 mb-4">                        <div class="row">                            <div class="col-12">                                <h3 class="pb-1 mb-3 ">Registro manual de asignaciones de tiempos a campos/opciones libres</h3>                            </div>                        </div>                        <div class="row">                            <div class="col-12 col-sm col-md-4 mb-4">                                <div id="calendar-inline-clockin" class="border"></div>                            </div>                            <div class="col-12 col-sm col-md-8 text-right mt-3">                                <button type="button" id="add-new-timesheet" class="btn btn-primary"><span class="fa fa-plus"></span> Nuevo parte</button>                            </div>                        </div>                        <div class="row">                            <div class="col">                                <div id="' + this.TimesheetContainer + '"></div>                            </div>                        </div>                    </div>';
        $("main").empty(),
        $("main").append(e),
        this.InitCalendarInline(),
        $.hideLoading()
    }
}
  , _PendingTasksListDefaultProps = function() {
    return {
        ButtonsContainerId: "buttons-container",
        ColsIndex: !1,
        Container: "ldrNav-container",
        GridContainerId: "jexcel-pending-tasks-grid",
        IsChecked: !1,
        TaskGrid: !1,
        Tasks: []
    }
}
  , Vacations = {
    isLoaded: !1,
    VacationsRanges: [],
    InternalId: !1,
    EmployeeVacations: [],
    Employees: [],
    LegendColors: !1,
    Filters: !1,
    CalendarObject: null,
    CalVacationsContainerId: "calendar-year-vacations-container",
    CalVacationsObj: null,
    Deferred: null,
    VacationsTable: "vacations-manage-table",
    PillTab: !1,
    Tasks: [],
    Properties: new _PendingTasksListDefaultProps,
    Init: function() {
        var e = this;
        e.isLoaded || (e.InitEvents(),
        e.InternalId = 1,
        e.isLoaded = !0,
        $.cachedGetScript("/lib/js-year-calendar/js/js-year-calendar.min.js", function(e, t, a) {
            $.cachedGetScript("/lib/js-year-calendar/js/languages/js-year-calendar.es.js", function(e, t, a) {})
        }),
        e.LegendColors = {
            approvedVacs: {
                title: "Vacaciones aprobadas",
                color: "#090"
            },
            requestedVacs: {
                title: "Vacaciones solicitadas",
                color: "#FFD700"
            },
            cancellingVacs: {
                title: "Solicitada cancelacion de vacaciones",
                color: "#FFA500"
            },
            noActive: {
                title: "No activo",
                color: "#B0C4DE"
            },
            tempDisability: {
                title: "Incapacidad temporal",
                color: "#555"
            },
            noWorkedDay: {
                title: "No laborable",
                color: "#FAEBD7"
            },
            leaveDays: {
                title: "Ausencia",
                color: "#90EE90"
            },
            holiday: {
                title: "Festivo",
                color: "#F00"
            },
            ondutycalendar: {
                title: "Calendario de guardia",
                color: "#A6A6A6"
            }
        });
        var t = new PendingTask({});
        e.Properties.ColsIndex = {
            Actions: t.GetColIndexPendingTasksGrid("Actions"),
            Seleccionar: t.GetColIndexPendingTasksGrid("Seleccionar"),
            EmployeeName: t.GetColIndexPendingTasksGrid("EmployeeName"),
            RequestType: t.GetColIndexPendingTasksGrid("RequestType"),
            DateRange: t.GetColIndexPendingTasksGrid("DateRange"),
            RequestDate: t.GetColIndexPendingTasksGrid("RequestDate"),
            Center: t.GetColIndexPendingTasksGrid("Center"),
            Department: t.GetColIndexPendingTasksGrid("Department"),
            LeaveDayType: t.GetColIndexPendingTasksGrid("LeaveDayType"),
            Notes: t.GetColIndexPendingTasksGrid("Notes"),
            PreviousComments: t.GetColIndexPendingTasksGrid("PreviousComments"),
            Comments: t.GetColIndexPendingTasksGrid("Comments"),
            YearOfApplication: t.GetColIndexPendingTasksGrid("YearOfApplication")
        }
    },
    InitEvents: function() {
        var s = this;
        $("body").on("click", "#menu-vacations", function() {
            s.GetVacationsView()
        }),
        $("body").on("click", ".btn-solicitar-vacaciones", function() {
            return $.showLoading(),
            s.RequestVacations().done(function(e) {
                e.Success ? $.displayMessage(e.Message, "success") : $.displayMessage(e.Message, "danger"),
                $.hideLoading(),
                s.GetVacationsView()
            }).fail(function(e, t, a) {
                $.hideLoading(),
                s.GetVacationsView()
            }),
            !1
        }),
        $("body").on("click", "button#add-vacations-range", function() {
            var e = $("#btn-date-range-picker").data("daterangepicker")
              , t = e.startDate
              , a = e.endDate
              , n = ($("body").find("select#vacation-year").val(),
            t.format("DD/MM/YYYY") + " a " + a.format("DD/MM/YYYY"))
              , o = document.getElementById("vacations-observations");
            null != o && (n = o.value);
            var i = {
                Id: s.InternalId++,
                Start: t.format(),
                End: a.format(),
                Text: n
            };
            s.SetVacationsRanges(i),
            document.getElementById("rangedateText").textContent = "",
            o.value = ""
        }),
        $("body").on("click", "#menu-vacations-of-department", function() {
            s.CalendarObject = null,
            s.GetVacationsOfDepartmentView()
        }),
        $("body").on("click", "#menu-vacations-of-several-employees", function() {
            s.CalendarObject = null,
            s.GetVacationsOfSeveralEmployeesView()
        }),
        $("body").on("click", "#menu-vacations-managed", function() {
            s.RenderVacationsManagedPage()
        }),
        $("body").on("click", "#menu-pending-tasks", function() {
            Control.GetPendingTasksView()
        }),
        $("body").on("click", "#menu-pending-tasks-grid", function() {
            s.GetPendingTasksGridView()
        }),
        $("body").on("click", "a.approve-vacations", function(e) {
            e.stopPropagation(),
            $(this).prop("disabled", !0);
            var t = $(this).closest(".vacation-request")
              , a = $(t).find(".idTask").val()
              , n = $(t).find(".comments").val();
            return s.PillTab = Control.GetActivePillsTab(),
            s.ApproveVacationsTask(a, n, t, this, s.PillTab),
            !1
        }),
        $("body").on("click", "a.reject-vacations", function(e) {
            e.stopPropagation(),
            $(this).prop("disabled", !0);
            var t = $(this).closest(".vacation-request")
              , a = $(t).find(".idTask").val()
              , n = $(t).find(".comments").val();
            return s.PillTab = Control.GetActivePillsTab(),
            s.RejectVacationsTask(a, n, t, this, s.PillTab),
            !1
        }),
        $("body").on("click", "a.approve-task", function(e) {
            e.stopPropagation(),
            $(this).prop("disabled", !0);
            var t = $(this).closest("tr")
              , a = $(t).data("y")
              , n = s.Properties.TaskGrid.getJsonRow(a);
            return s.ApprovePendingTask(n.TaskId, n.Comments, a),
            !1
        }),
        $("body").on("click", "a.reject-task", function(e) {
            e.stopPropagation(),
            $(this).prop("disabled", !0);
            var t = $(this).closest("tr")
              , a = $(t).data("y")
              , n = s.Properties.TaskGrid.getJsonRow(a);
            return s.RejectPendingTask(n.TaskId, n.Comments, a),
            !1
        }),
        $("body").on("click", ".remove-vacation-request", function() {
            return !0 === confirm("Seguro que quieres anular estas vacaciones?") && s.RemoveVacationRequest(this),
            !1
        }),
        $("body").on("click", ".request-vacation-cancellation", function() {
            return !0 === confirm("Seguro que quieres solicitar la cancelación de estas vacaciones?") && s.RequestVacationCancellation(this),
            !1
        }),
        $("body").on("click", "a#btn-get-managed-vacations", function() {
            return 0 === $("select#employeesFilter").multipleSelect("getSelects").length ? $.displayMessage("No has seleccionado ningún empleado del cual ver su calendario de vacaciones.") : ($.hideLoading($("#vacations-manage-view")),
            s.GetManagedVacationsAjaxCall(),
            $("#employeesFilter").multipleSelect("close")),
            !1
        }),
        $("body").on("click", ".request-partial-vacation-cancellation", function() {
            var e = $(this).data()
              , t = {
                Id: e.id,
                EmployeeId: e.employeeId,
                StartDate: e.start,
                EndDate: e.end,
                YearOfApplication: e.year,
                WorkDays: e.WorkDays,
                State: e.state
            };
            new VacationRange(t).RenderModal()
        })
    },
    GetVacationsView: function() {
        var a = this;
        a.DeleteVacationsRanges(),
        $.showLoading(),
        $.ajax({
            url: "/get-vacations-view",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html",
            success: function(t) {
                $.hideLoading();
                try {
                    var e = JSON.parse(t);
                    e && !1 === e.Success && displayMessage(e.Message, "danger")
                } catch (e) {
                    $("main").empty(),
                    $("main").append(t),
                    $(".btn-solicitar-vacaciones").css("display", "none"),
                    a.LoadDateRangePicker(),
                    a.LoadUserVacationsYearCalendar()
                }
            },
            fail: function(e) {
                $.hideLoading()
            }
        })
    },
    RequestVacations: function() {
        var e = {
            Ranges: this.VacationsRanges
        };
        return $.ajax({
            url: api_url + "api/vacations/request",
            method: "POST",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: JSON.stringify(e)
        })
    },
    SetVacationsRanges: function(e) {
        this.VacationsRanges.push(e),
        this.PrintVacationsRanges(),
        $(".btn-solicitar-vacaciones").fadeIn("slow")
    },
    DeleteVacationsRanges: function() {
        this.VacationsRanges = [],
        $(".btn-solicitar-vacaciones").fadeOut()
    },
    DeleteVacationsRange: function(a) {
        var n = [];
        this.VacationsRanges.forEach(function(e, t) {
            e.Id !== a && n.push(e)
        }),
        0 === (this.VacationsRanges = n).length && $(".btn-solicitar-vacaciones").fadeOut()
    },
    GetVacationsOfDepartmentView: function() {
        var e = this;
        e.CalendarObject ? (e.CalendarObject = null,
        e.LoadYearCalendar()) : ($.showLoading(),
        $("<h3>", {
            class: "container",
            text: "VACACIONES DE DEPARTAMENTO"
        }).appendTo("main"),
        $("<div>", {
            id: "calendar-year",
            class: "font-calibri container"
        }).appendTo("main"),
        e.GetVacationsOfDepartmentAjaxCall().done(function() {
            e.LoadYearCalendar(),
            $.hideLoading()
        }))
    },
    GetVacationsOfDepartmentAjaxCall: function(e) {
        var t = this;
        return t.Deferred = $.Deferred(),
        e = e || (new Date).getFullYear(),
        $.ajax({
            url: api_url + "api/vacations/get-vacations-of-department",
            contentType: "application/json",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                year: e
            },
            dataType: "json",
            success: function(e) {
                e.Success ? (t.EmployeeVacations = e.EmployeeVacations,
                t.Deferred.resolve()) : $.displayMessage(e.Message, "danger")
            }
        }),
        t.Deferred.promise()
    },
    GetVacationsOfSeveralEmployeesView: function() {
        var e = this;
        e.CalendarObject ? (e.CalendarObject = null,
        e.LoadYearCalendar()) : ($.showLoading(),
        $("<h3>", {
            class: "container",
            text: "VACACIONES DE EMPLEADOS"
        }).appendTo("main"),
        $("<div>", {
            id: "calendar-year",
            class: "font-calibri container"
        }).appendTo("main"),
        e.GetVacationsOfSeveralEmployeesAjaxCall().done(function() {
            e.LoadYearCalendar(),
            $.hideLoading()
        }))
    },
    GetVacationsOfSeveralEmployeesAjaxCall: function(e) {
        var t = this;
        return t.Deferred = $.Deferred(),
        e = e || (new Date).getFullYear(),
        $.ajax({
            url: api_url + "api/vacations/get-vacations-of-several-employees",
            contentType: "application/json",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                year: e
            },
            dataType: "json",
            success: function(e) {
                e.Success ? (t.EmployeeVacations = e.EmployeeVacations,
                t.Deferred.resolve()) : $.displayMessage(e.Message, "danger")
            }
        }),
        t.Deferred.promise()
    },
    GetManagedVacationsAjaxCall: function() {
        var t = this
          , e = $("body").find("#vacations-manage-view")
          , a = '<div class="row"><div class="col-12 mb-4 mt-4">                <div class="table-responsive">                    <table id="' + t.VacationsTable + '" class="table table-bordered table-hover table-sm"><thead></thead><tbody></tbody></table>                </div>            </div></div>';
        e.append(a),
        $.showLoading(e);
        var n = $(".date#startDate").datetimepicker("date")
          , o = $(".date#endDate").datetimepicker("date")
          , i = {
            EmployeesIds: $("select#employeesFilter").multipleSelect("getSelects"),
            StartDate: n.format(),
            EndDate: o.format()
        };
        return $.ajax({
            url: api_url + "api/vacations/get-vacations-managed",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            contentType: "application/json",
            data: JSON.stringify(i),
            dataType: "json",
            success: function(e) {
                e.Success ? t.RenderVacationsTable(e.EmployeesVacations) : $.displayMessage(e.Message, "danger")
            },
            error: function() {},
            complete: function() {
                $.hideLoading()
            }
        })
    },
    PrintVacationsRanges: function() {
        var d = this
          , c = document.getElementById("date-ranges-vacations-selected");
        c.innerHTML = "",
        d.VacationsRanges.forEach(function(e, t) {
            var a = document.createElement("div");
            a.className = "p-2 mb-1 border position-relative";
            var n = document.createElement("span");
            n.className = "fa fa-times text-danger position-absolute m-1",
            n.style.top = "-2px",
            n.style.right = "0",
            n.style.cursor = "pointer",
            n.rangeId = e.Id,
            n.addEventListener("click", function(e) {
                d.DeleteVacationsRange(e.target.rangeId),
                e.target.parentElement.remove()
            }),
            a.append(n);
            var o = document.createElement("span");
            o.textContent = new Date(e.Start).toLocaleDateString() + " a " + new Date(e.End).toLocaleDateString(),
            a.append(o);
            var i, s, r = document.getElementById("vacations-observations");
            e.Text.length && null != r && ((i = document.createElement("span")).className = "d-block",
            (s = document.createElement("strong")).textContent = "Observaciones: ",
            i.append(s),
            i.append(e.Text),
            a.append(i)),
            c.append(a)
        })
    },
    RenderVacationsManagedPage: function() {
        this.GetEmployeesVacationsManaged().done(function(e) {})
    },
    GetEmployeesVacationsManaged: function() {
        var t = this;
        return $.ajax({
            url: api_url + "api/vacations/get-employees-vacations-managed",
            contentType: "application/json",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "json",
            success: function(e) {
                e.Success ? (t.Employees = e.Employees,
                t.RenderFilters()) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    GetPendingTasksGridView: function() {
        var h = this
          , g = h.Properties
          , f = $.Deferred();
        return showCompleteLoading(),
        $.ajax({
            url: api_url + "api/vacations/get-pending-tasks-grid-view",
            method: "GET",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            dataType: "json",
            success: function(e) {
                var t, a, n, o, i, s, r, d, c, l, p, u, m;
                e.Success ? (g.Tasks = [],
                e.Tasks.forEach(function(e, t) {
                    g.Tasks.push(new PendingTask(e))
                }),
                (t = $("body").find("main")).empty(),
                t.append('<div class="container-fluid"><div class="row"><div class="col-12">                                                    <div id="ldrNav-container"></div>                                            </div></div></div>'),
                a = document.getElementById(g.Container),
                (n = createJSElement("div", {
                    id: g.ButtonsContainerId
                })).classList.add("row"),
                (o = createJSElement("div", {
                    id: "buttons-left-container"
                })).classList.add("col-md-6"),
                o.classList.add("text-md-left"),
                o.classList.add("my-2"),
                o.classList.add("align-self-center"),
                (i = createJSElement("div", {
                    id: "buttons-right-container"
                })).classList.add("col-md-6"),
                i.classList.add("text-md-right"),
                i.classList.add("my-2"),
                i.classList.add("align-self-center"),
                (s = createJSElement("button", {
                    type: "button",
                    id: "btn-select-all",
                    className: "btn btn-primary text-left",
                    innerHTML: '<span class="fas fa-check-double"></span> Seleccionar/Deseleccionar todo'
                })).addEventListener("click", function(e) {
                    return h.CheckUncheckAll(),
                    !1
                }),
                o.append(s),
                (r = createJSElement("button", {
                    type: "button",
                    id: "btn-select-all",
                    className: "btn btn-primary text-left mr-2",
                    innerHTML: '<span class="fas fa-thumbs-up"></span> Aprobar seleccionados'
                })).addEventListener("click", function(e) {
                    return h.ApproveSelectedPendingTasks(),
                    !1
                }),
                (d = createJSElement("button", {
                    type: "button",
                    id: "btn-select-all",
                    className: "btn btn-primary text-right",
                    innerHTML: '<span class="fas fa-thumbs-down"></span> Rechazar seleccionados'
                })).addEventListener("click", function(e) {
                    return h.RejectSelectedPendingTasks(),
                    !1
                }),
                i.append(r),
                i.append(d),
                n.append(o),
                n.append(i),
                a.appendChild(n),
                (c = createJSElement("div", {
                    id: g.GridContainerId
                })).setAttribute("style", "width: 100%;"),
                (l = h.createTableHtml(PendingTask.prototype.GetColModelForJExcelGrid())).style.width = a.offsetWidth - 62 + "px",
                c.appendChild(l),
                a.appendChild(c),
                p = h.getColModelForJExcelGrid(l, PendingTask.prototype.GetColModelForJExcelGrid()),
                (u = h.getPendingTasksGridOptions()).columns = p,
                g.Tasks.length,
                (m = document.getElementById(g.GridContainerId)).classList.add("table-responsive"),
                g.TaskGrid = jexcel(m, u),
                g.TaskGrid.setData(g.Tasks),
                g.TaskGrid.orderBy(g.ColsIndex.RequestType, 1)) : (displayMessage(e.Message, "danger"),
                f.resolve()),
                hideCompleteLoading()
            },
            error: function(e) {
                displayMessage(e, "danger"),
                hideCompleteLoading()
            }
        }),
        f.promise()
    },
    createTableHtml: function(e) {
        var t = document.createElement("table")
          , a = document.createElement("thead")
          , n = document.createElement("tr");
        return e.forEach(function(e, t) {
            var a = document.createElement("td");
            a.innerHTML = e.title,
            "hidden" !== e.type ? e.width && (a.setAttribute("style", "min-width: " + e.width + "px;"),
            a.setAttribute("style", "width: " + e.width + "px;")) : a.setAttribute("style", "display:none"),
            n.appendChild(a)
        }),
        a.appendChild(n),
        t.appendChild(a),
        t
    },
    getColModelForJExcelGrid: function(e, n) {
        var o = n
          , n = [];
        return e.querySelector("thead > tr").cells.forEach(function(e, t) {
            var a = o[t];
            o[t].width ? o[t].width > e.offsetWidth && (a.width = o[t].width) : a.width = e.offsetWidth,
            n.push(a)
        }),
        e.remove(),
        n
    },
    getPendingTasksGridOptions: function(e) {
        var p = this.Properties;
        return {
            allowComments: !0,
            allowManualInsertRow: !1,
            columnDrag: !0,
            columnResize: !0,
            columns: e,
            contextMenu: function() {
                return !1
            },
            defaultColWidth: 100,
            filters: !0,
            lazyLoad: !0,
            pagination: 10,
            paginationOptions: [10, 25, 50, 100],
            parseTableAutoCellType: !0,
            rowResize: !0,
            search: !0,
            fullscreen: !0,
            tableOverflow: !0,
            text: jQuery.getJExcelTranslation(),
            wordWrap: !0,
            onlazyloading: function(e, t, a) {
                console.log(t)
            },
            onchange: function(e, t, a, n, o) {
                "0" === a && p.TaskGrid.getColumnData(a).forEach(function(e, t) {
                    0
                })
            },
            onchangepage: function(e, t, a) {},
            onload: function(e) {
                hideCompleteLoading()
            },
            oneditionstart: function(e, t, a, n, o) {},
            updateTable: function(e, t, a, n, o, i, s) {
                var r = jexcel.current;
                null == jexcel.current && (r = p.TaskGrid);
                var d = r.getJsonRow(n);
                switch (a) {
                case p.ColsIndex.Actions:
                    t.innerHTML = '<div class="col mt-1 mb">                                            <a href="#approve-task" class="text-success approve-task" data-taskId="' + d.TaskId + '" title="Aprobar"><span class="far fa-2x fa-thumbs-up"></span></a>                                            <a href="#reject-task" class="text-danger ml-2 reject-task" data-taskId="' + d.TaskId + '" title="Rechazar"><span class="far fa-2x fa-thumbs-down"></span></a>                                        </div>';
                    break;
                case p.ColsIndex.RequestType:
                    var c = String(d.RequestType);
                    $(t).css("font-weight", "bold"),
                    c.includes("Cancelación") && $(t).css("background-color", "#FBBABA");
                    break;
                case p.ColsIndex.RequestDate:
                    var l = new Date(d.RequestDate);
                    isNaN(l) ? t.innerHTML = "-" : t.innerHTML = l.toEuropeanString(!0)
                }
            }
        }
    },
    CheckUncheckAll: function() {
        var t = this.Properties
          , e = document.getElementsByName("c1");
        t.IsChecked = !t.IsChecked,
        e.forEach(function(e) {
            $(e).prop("checked", t.IsChecked)
        })
    },
    ApprovePendingTask: function(e, t, a) {
        var n = this;
        showCompleteLoading(),
        $.ajax({
            url: "/approve-task",
            method: "POST",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            data: {
                id: e,
                comments: t
            },
            dataType: "json",
            success: function(e) {
                var t;
                Control.GetMenuPrincipal(),
                !0 === e.Success ? (displayMessage(e.Message, "success"),
                t = document.getElementById(n.Properties.GridContainerId),
                $(t).jexcel("deleteRow", a),
                n.GetPendingTasksGridView()) : displayMessage(e.Message, "danger"),
                hideCompleteLoading()
            },
            error: function(e) {
                Control.GetMenuPrincipal(),
                hideCompleteLoading()
            }
        })
    },
    ApproveSelectedPendingTasks: function() {
        var i = this
          , s = [];
        showCompleteLoading(),
        document.getElementsByName("c1").forEach(function(e, t) {
            var a, n, o;
            $(e).is(":checked") && (a = $(e).closest("tr"),
            n = $(a).data("y"),
            o = i.Properties.TaskGrid.getJsonRow(n),
            s.push({
                RowNumber: n,
                TaskId: o.TaskId,
                Comments: o.Comments
            }))
        }),
        0 < s.length ? $.ajax({
            url: "/bulk-approve-task",
            method: "POST",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            data: {
                selectedPendingTasks: s
            },
            dataType: "json",
            success: function(e) {
                Control.GetMenuPrincipal(),
                !0 === e.Success ? (i.GetPendingTasksGridView(),
                displayMessage(e.Message, "success")) : displayMessage(e.Message, "danger"),
                hideCompleteLoading()
            },
            error: function(e) {
                Control.GetMenuPrincipal(),
                hideCompleteLoading()
            }
        }) : hideCompleteLoading()
    },
    RejectPendingTask: function(e, t, a, n) {
        var o = this;
        showCompleteLoading(),
        $.ajax({
            url: "/reject-task",
            method: "POST",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            data: {
                id: e,
                comments: t
            },
            dataType: "json",
            success: function(e) {
                var t;
                Control.GetMenuPrincipal(),
                !0 === e.Success ? (displayMessage(e.Message, "success"),
                t = document.getElementById(o.Properties.GridContainerId),
                $(t).jexcel("deleteRow", a),
                o.GetPendingTasksGridView()) : displayMessage(e.Message, "danger"),
                hideCompleteLoading()
            },
            error: function(e) {
                Control.GetMenuPrincipal(),
                hideCompleteLoading()
            }
        })
    },
    RejectSelectedPendingTasks: function() {
        var i = this
          , s = [];
        showCompleteLoading(),
        document.getElementsByName("c1").forEach(function(e, t) {
            var a, n, o;
            $(e).is(":checked") && (a = $(e).closest("tr"),
            n = $(a).data("y"),
            o = i.Properties.TaskGrid.getJsonRow(n),
            s.push({
                RowNumber: n,
                TaskId: o.TaskId,
                Comments: o.Comments
            }))
        }),
        0 < s.length ? $.ajax({
            url: "/bulk-reject-task",
            method: "POST",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            data: {
                selectedPendingTasks: s
            },
            dataType: "json",
            success: function(e) {
                Control.GetMenuPrincipal(),
                !0 === e.Success ? (i.GetPendingTasksGridView(),
                displayMessage(e.Message, "success")) : displayMessage(e.Message, "danger"),
                hideCompleteLoading()
            },
            error: function(e) {
                Control.GetMenuPrincipal(),
                hideCompleteLoading()
            }
        }) : hideCompleteLoading()
    },
    ApproveVacationsTask: function(e, t, a, n, o) {
        showCompleteLoading(),
        $.ajax({
            url: "/approve-task",
            method: "POST",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            data: {
                id: e,
                comments: t
            },
            dataType: "json",
            success: function(e) {
                Control.GetMenuPrincipal(),
                !0 === e.Success ? (displayMessage(e.Message, "success"),
                $(a).fadeOut("slow", function() {
                    $(this).remove(),
                    $("body").find(".vacation-request").length || $("body").find(".compensation-hours-request").length || $("body").find(".leave-days-request").length ? Control.GetPendingTasksView(o) : ($("header").find(".menu-chief-of-department-container").length && $("header").find(".menu-chief-of-department-container").closest("li").fadeOut(),
                    Control.GetView())
                })) : displayMessage(e.Message, "danger"),
                $(n).prop("disabled", !0),
                hideCompleteLoading()
            },
            error: function(e) {
                Control.GetMenuPrincipal(),
                $(n).prop("disabled", !0),
                hideCompleteLoading()
            }
        })
    },
    RejectVacationsTask: function(e, t, a, n, o) {
        showCompleteLoading(),
        $.ajax({
            url: "/reject-task",
            method: "POST",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            data: {
                id: e,
                comments: t
            },
            dataType: "json",
            success: function(e) {
                Control.GetMenuPrincipal(),
                !0 === e.Success ? (displayMessage(e.Message, "success"),
                $(a).fadeOut("slow", function() {
                    $(this).remove(),
                    $("body").find(".vacation-request").length || $("body").find(".compensation-hours-request").length || $("body").find(".leave-days-request").length ? Control.GetPendingTasksView(o) : ($("header").find(".menu-chief-of-department-container").length && $("header").find(".menu-chief-of-department-container").closest("li").fadeOut(),
                    Control.GetView())
                })) : displayMessage(e.Message, "danger"),
                $(n).prop("disabled", !0),
                hideCompleteLoading()
            },
            error: function(e) {
                Control.GetMenuPrincipal(),
                $(n).prop("disabled", !0),
                hideCompleteLoading()
            }
        })
    },
    RemoveVacationRequest: function(t) {
        var a = this
          , e = $(t).data("id");
        $.ajax({
            url: "/remove-vacations-request",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                requestId: e
            },
            dataType: "json",
            success: function(e) {
                e.Success ? ($(t).closest("tr").remove(),
                a.GetVacationsView()) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    RequestVacationCancellation: function(t) {
        var a = this
          , e = {
            VacationId: $(t).data("id")
        };
        $.ajax({
            url: api_url + "api/vacations/request-cancel",
            method: "POST",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: JSON.stringify(e),
            dataType: "json",
            success: function(e) {
                e.Success ? ($(t).closest("tr").remove(),
                a.GetVacationsView()) : $.displayMessage(e.Message, "danger")
            }
        })
    },
    LoadDateRangePicker: function() {
        $.cachedGetScript("/lib/momentjs/moment-with-locales.min.js", function(e, t, a) {
            $.cachedGetScript("/lib/daterangepicker/daterangepicker.min.js", function(e, t, a) {
                var n = {
                    ranges: {
                        "Mañana": [moment().add(1, "days"), moment().add(1, "days")],
                        "Sig 7 días": [moment().add(1, "days"), moment().add(8, "days")],
                        "Próx semana": [moment().add(1, "week").startOf("week").add(1, "days"), moment().add(1, "week").endOf("week").add(1, "days")],
                        "Próx 2 semanas": [moment().add(1, "week").startOf("week").add(1, "days"), moment().add(2, "week").endOf("week").add(1, "days")]
                    },
                    locale: {
                        format: "DD/MM/YYYY",
                        separator: " - ",
                        applyLabel: "Aceptar",
                        cancelLabel: "Limpiar y Cerrar",
                        fromLabel: "De",
                        toLabel: "a",
                        customRangeLabel: "Personalizado",
                        weekLabel: "W",
                        daysOfWeek: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
                        monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
                        firstDay: 1
                    },
                    startDate: moment().add(1, "weeks").startOf("week").add(1, "days"),
                    endDate: moment().add(1, "weeks").endOf("week").add(1, "days"),
                    minDate: moment(),
                    opens: "left",
                    alwaysShowCalendars: !0
                };
                $("#btn-date-range-picker").daterangepicker(n, function(e, t, a) {
                    $("#rangedateText").text(e.format("DD/MM/YYYY") + " a " + t.format("DD/MM/YYYY")),
                    $("input#inputStartDate").val(e.format()),
                    $("input#inputEndDate").val(t.format())
                }),
                $("#btn-date-range-picker").on("apply.daterangepicker", function(e, t) {
                    $("#rangedateText").text(t.startDate.format("DD/MM/YYYY") + " a " + t.endDate.format("DD/MM/YYYY"))
                }),
                $("#btn-date-range-picker").on("cancel.daterangepicker", function(e, t) {
                    $("#rangedateText").text("")
                })
            })
        })
    },
    GetVacationRangesFromEmployee: function() {
        return $.ajax({
            url: api_url + "api/vacations/get-vacations-and-onduty-ranges-from-employee",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            }
        })
    },
    LoadUserVacationsYearCalendar: function() {
        function n(e) {
            var t = {
                id: i,
                startDate: new Date(e.Day),
                endDate: new Date(e.Day),
                text: "Año de consumo " + e.YearOfApplication
            };
            switch (e.State) {
            case 0:
            case 1:
            case 2:
                t.color = a.LegendColors.requestedVacs.color,
                t.state = a.LegendColors.requestedVacs.title;
                break;
            case 3:
                t.color = a.LegendColors.approvedVacs.color,
                t.state = a.LegendColors.approvedVacs.title;
                break;
            case 6:
            case 7:
                t.color = a.LegendColors.cancellingVacs.color,
                t.state = a.LegendColors.cancellingVacs.title
            }
            return e.IsHoliday ? (t.color = a.LegendColors.holiday.color,
            t.state = "",
            t.text = a.LegendColors.holiday.title) : e.IsLeaveDay ? (t.color = a.LegendColors.leaveDays.color,
            t.state = "",
            t.text = a.LegendColors.leaveDays.title) : e.IsOnDutyCalendarDay && (t.color = a.LegendColors.ondutycalendar.color,
            t.state = "",
            t.text = a.LegendColors.ondutycalendar.title),
            t
        }
        var a = this
          , o = []
          , t = document.getElementById(a.CalVacationsContainerId);
        $.showLoading(t),
        a.GetVacationRangesFromEmployee().done(function(e) {
            e.Success ? (e.VacationsAnOnDutyCalendarDays.forEach(function(e, t) {
                var a;
                (1 === e.DayType && e.IsWorkedDay || 2 === e.DayType || null === e.DayType || !0 === e.IsHoliday || !0 === e.IsLeaveDay) && (a = n(e),
                o.push(a))
            }),
            a.CalVacationsObj = new Calendar(t,{
                language: "es",
                mouseOnDay: function(e) {
                    if (0 < e.events.length) {
                        var t = "";
                        for (var a in e.events)
                            t += '<div class="event-tooltip-content"><div class="event-name">' + e.events[a].state + '<span class="d-block">' + e.events[a].text + "</span></div></div>";
                        $(e.element).popover({
                            sanitize: !1,
                            trigger: "manual",
                            container: "body",
                            html: !0,
                            content: t
                        }),
                        $(e.element).popover("show")
                    }
                },
                mouseOutDay: function(e) {
                    0 < e.events.length && $(e.element).popover("hide")
                },
                dataSource: o
            })) : displayMessage(e.Message, "danger")
        }).fail(function(e) {
            $.hideLoading(),
            displayMessage("Error al intentar obtener las vacaciones de tu usuario.", "danger")
        })
    },
    LoadYearCalendar: function(e) {
        var t = this
          , n = [];
        t.EmployeeVacations.forEach(function(a, e) {
            a.CalendarVacations.forEach(function(e, t) {
                n.push({
                    id: e.Id,
                    color: "#" + a.Color,
                    startDate: new Date(e.StartDate),
                    endDate: new Date(e.EndDate),
                    text: a.EmployeeName
                })
            })
        }),
        null !== t.CalendarObject && e ? t.CalendarObject.setDataSource(n) : t.CalendarObject = new Calendar("#calendar-year",{
            language: "es",
            yearChanged: function(e) {
                null !== t.CalendarObject && t.GetCalendarAjaxCall(e.currentYear).done(function() {
                    t.LoadYearCalendar(e.currentYear),
                    $.hideLoading()
                })
            },
            mouseOnDay: function(e) {
                if (0 < e.events.length) {
                    var t = "";
                    for (var a in e.events)
                        t += '<div class="event-tooltip-content"><div class="event-name" style="color:' + e.events[a].color + '">' + e.events[a].text + "</div></div>";
                    $(e.element).popover({
                        sanitize: !1,
                        trigger: "manual",
                        container: "body",
                        html: !0,
                        content: t
                    }),
                    $(e.element).popover("show")
                }
            },
            mouseOutDay: function(e) {
                0 < e.events.length && $(e.element).popover("hide")
            },
            dataSource: n
        })
    },
    RenderFilters: function() {
        var t = this
          , e = $("body").find("main");
        if (!t.Employees || 0 === t.Employees.length)
            return "";
        $.showLoading();
        var a = '<div class="vacations-manage-filter container">                <div class="row">                    <div class="col companies-container">                        <label class="control-label">Empresas</label>                    </div>                    <div class="col centers-container">                        <label class="control-label">Centros</label>                    </div>                    <div class="col departments-container">                        <label class="control-label">Departamentos</label>                    </div>                </div>                <div class="row"></p></div>                <div class="row">                    <div class="col-sm-4 employees-container">                        <label class="control-label">Empleados gestionados</label>                    </div>                    <div class="col-sm-4 startDate-container">' + Control.RenderField({
            Type: "date-block",
            Name: "startDate",
            Value: "",
            Label: "Fecha inicio",
            ReadOnly: !0
        }) + '</div>                    <div class="col-sm-4 endDate-container">' + Control.RenderField({
            Type: "date-block",
            Name: "endDate",
            Value: "",
            Label: "Fecha fin",
            ReadOnly: !0
        }) + '</div>                </div>                <div class="row">                    <div class="col-12 text-right"><a class="btn btn-primary text-white mt-3" id="btn-get-managed-vacations" href="#">Consultar</a></div>                </div>            </div>            <div id="vacations-manage-view" class="container-fluid">            </div>';
        e.append(a);
        var n, o = $("<select>", {
            class: "multiple-select",
            id: "companiesFilter",
            multiple: "multiple"
        }), i = o[0], s = !1, r = !1;
        t.Employees.forEach(function(e, t) {
            (n = e.CompanyName) !== s && ((r = document.createElement("option")).text = n,
            r.value = e.CompanyName,
            s = n,
            i.appendChild(r))
        }),
        e.find(".companies-container").append(o),
        o.multipleSelect({
            filter: !0,
            locale: "es-ES",
            displayDelimiter: "; ",
            selectAll: !0,
            width: "100%",
            placeholder: "Selecciona las Empresas",
            styler: function(e) {
                if ("optgroup" !== e.type)
                    return "display:block;"
            },
            onOptgroupClick: function(e) {
                console.log(e)
            },
            onClick: function(e) {
                console.log(e.instance),
                t.MultipleSelectClick("companies")
            },
            onCheckAll: function(e) {
                t.MultipleSelectClick("companies")
            },
            onUncheckAll: function(e) {
                $("select#centersFilter").multipleSelect("setSelects", []),
                $("select#departmentsFilter").multipleSelect("setSelects", []),
                $("select#employeesFilter").multipleSelect("setSelects", [])
            }
        });
        var d, c = $("<select>", {
            class: "multiple-select",
            id: "centersFilter",
            multiple: "multiple"
        }), l = c[0], p = !1, u = !1;
        t.Employees.forEach(function(e, t) {
            (d = e.CenterName + " (" + e.CompanyName + ")") !== p && ((u = document.createElement("option")).text = d,
            u.value = d,
            p = d,
            l.appendChild(u))
        }),
        e.find(".centers-container").append(c),
        c.multipleSelect({
            filter: !0,
            locale: "es-ES",
            displayDelimiter: "; ",
            selectAll: !0,
            width: "100%",
            placeholder: "Selecciona los Centros",
            styler: function(e) {
                if ("optgroup" !== e.type)
                    return "display:block;"
            },
            onOptgroupClick: function(e) {
                console.log(e)
            },
            onClick: function(e) {
                console.log(e.instance),
                t.MultipleSelectClick("centers")
            },
            onCheckAll: function(e) {
                t.MultipleSelectClick("centers")
            },
            onUncheckAll: function(e) {
                $("select#companiesFilter").multipleSelect("setSelects", []),
                $("select#departmentsFilter").multipleSelect("setSelects", []),
                $("select#employeesFilter").multipleSelect("setSelects", [])
            }
        });
        var m, h = $("<select>", {
            class: "multiple-select",
            id: "departmentsFilter",
            multiple: "multiple"
        }), g = h[0], f = !1, v = !1;
        t.Employees.forEach(function(e, t) {
            (m = e.DepartmentName + " (" + e.CenterName + " - " + e.CompanyName + ")") !== f && ((v = document.createElement("option")).text = m,
            v.value = m,
            f = m,
            g.appendChild(v))
        }),
        e.find(".departments-container").append(h),
        h.multipleSelect({
            filter: !0,
            locale: "es-ES",
            displayDelimiter: "; ",
            selectAll: !0,
            width: "100%",
            placeholder: "Selecciona los Departamentos",
            styler: function(e) {
                if ("optgroup" !== e.type)
                    return "display:block;"
            },
            onOptgroupClick: function(e) {
                console.log(e)
            },
            onClick: function(e) {
                console.log(e.instance),
                t.MultipleSelectClick("departments")
            },
            onCheckAll: function(e) {
                t.MultipleSelectClick("departments")
            },
            onUncheckAll: function(e) {
                $("select#companiesFilter").multipleSelect("setSelects", []),
                $("select#centersFilter").multipleSelect("setSelects", []),
                $("select#employeesFilter").multipleSelect("setSelects", [])
            }
        });
        var y, b = $("<select>", {
            class: "multiple-select",
            id: "employeesFilter",
            multiple: "multiple"
        }), k = b[0], C = !1, T = !1, D = !0;
        t.Employees.forEach(function(e, t) {
            y = e.DepartmentName + " (" + e.CenterName + " - " + e.CompanyName + ")",
            D ? ((T = document.createElement("optgroup")).label = y,
            D = !1,
            C = y) : y !== C && (k.appendChild(T),
            (T = document.createElement("optgroup")).label = y,
            C = y);
            var a = document.createElement("option");
            a.text = e.Name,
            a.value = e.Id,
            T.appendChild(a)
        }),
        T.children.length && k.appendChild(T),
        e.find(".employees-container").append(b),
        b.multipleSelect({
            filter: !0,
            locale: "es-ES",
            displayDelimiter: "; ",
            selectAll: !0,
            width: "100%",
            placeholder: "Selecciona los empleados cuyas vacaciones quieras ver",
            styler: function(e) {
                if ("optgroup" !== e.type)
                    return "padding-left: 1.5rem; display:block;"
            },
            onOptgroupClick: function(e) {
                console.log(e)
            },
            onClick: function(e) {
                console.log(e.instance)
            },
            onUncheckAll: function(e) {
                $("select#companiesFilter").multipleSelect("setSelects", []),
                $("select#centersFilter").multipleSelect("setSelects", []),
                $("select#departmentsFilter").multipleSelect("setSelects", [])
            }
        }),
        $(".date#startDate").datetimepicker({
            locale: "es",
            format: "DD-MM-YYYY",
            sideBySide: !0,
            ignoreReadonly: !0,
            defaultDate: moment().startOf("year"),
            maxDate: moment().endOf("year"),
            buttons: {
                showClose: !0
            },
            icons: {
                time: "fa fa-clock"
            }
        }),
        $(".date#endDate").datetimepicker({
            locale: "es",
            format: "DD-MM-YYYY",
            defaultDate: moment().endOf("year"),
            minDate: moment().startOf("year"),
            sideBySide: !0,
            useCurrent: !1,
            ignoreReadonly: !0,
            buttons: {
                showClose: !0
            },
            icons: {
                time: "fa fa-clock"
            }
        }),
        $(".date#startDate").on("change.datetimepicker", function(e) {
            var t = moment(e.date);
            $(".date#endDate").datetimepicker("minDate", t)
        }),
        $(".date#endDate").on("change.datetimepicker", function(e) {
            var t = moment(e.date);
            $(".date#startDate").datetimepicker("maxDate", t)
        }),
        $.hideLoading()
    },
    MultipleSelectClick: function(e) {
        var a = []
          , n = []
          , o = []
          , i = [];
        switch (e) {
        case "companies":
            i = $("select#companiesFilter").multipleSelect("getSelects");
            break;
        case "centers":
            i = $("select#centersFilter").multipleSelect("getSelects");
            break;
        case "departments":
            i = $("select#departmentsFilter").multipleSelect("getSelects")
        }
        if (0 < i.length)
            for (var s = 0; s < i.length; s++)
                this.Employees.forEach(function(e, t) {
                    switch (i[s]) {
                    case e.CompanyName:
                    case e.CenterName + " (" + e.CompanyName + ")":
                        n.push(e.CenterName + " (" + e.CompanyName + ")"),
                        o.push(e.DepartmentName + " (" + e.CenterName + " - " + e.CompanyName + ")"),
                        a.push(e.Id);
                        break;
                    case e.DepartmentName + " (" + e.CenterName + " - " + e.CompanyName + ")":
                        o.push(e.DepartmentName + " (" + e.CenterName + " - " + e.CompanyName + ")"),
                        a.push(e.Id)
                    }
                });
        "companies" != e && "centers" != e || $("select#centersFilter").multipleSelect("setSelects", n),
        $("select#departmentsFilter").multipleSelect("setSelects", o),
        $("select#employeesFilter").multipleSelect("setSelects", a)
    },
    RenderVacationsTable: function(e) {
        var u = this
          , t = $("body").find("#vacations-manage-view")
          , a = '<div class="row"><div class="col-12 mb-4 mt-4 text-center">            <div id="table-legend" class="text-left"></div>            </div></div>            <div class="row"><div class="col-12">                <div class="table-responsive">                    <table id="' + u.VacationsTable + '" class="table table-bordered table-hover table-sm"><thead></thead><tbody></tbody></table>                </div>            </div></div>';
        t.append(a);
        var n = $("#" + u.VacationsTable)
          , m = n.find("thead");
        m.empty();
        var h = n.find("tbody");
        h.empty(),
        e.forEach(function(e, t) {
            var d, a, n, o, c, l;
            0 === t && (d = document.createElement("tr"),
            (a = createJSElement("th", {
                innerHTML: "Nombre",
                rowSpan: 3
            })).setAttribute("style", "position: absolute;min-width: 18rem;height: 155px;background: white;z-index: 3;"),
            d.appendChild(a),
            n = createJSElement("th", {
                className: "d-none",
                rowSpan: 3,
                innerText: "Departamento"
            }),
            d.appendChild(n),
            o = createJSElement("th", {
                className: "d-none",
                rowSpan: 3,
                innerText: "Centro"
            }),
            d.appendChild(o),
            c = createJSElement("tr"),
            l = createJSElement("tr", {
                className: "day-row"
            }),
            e.Years.forEach(function(e, t) {
                var a;
                0 === t && ((a = createJSElement("th", {
                    rowSpan: 2,
                    className: "border-left-0"
                })).setAttribute("style", "padding:0 0 0 18rem;"),
                c.appendChild(a));
                var n = createJSElement("th", {
                    rowSpan: 2,
                    innerHTML: "<span>Dias asignados</span>"
                });
                n.setAttribute("style", "height: 125px;"),
                c.appendChild(n);
                var o = createJSElement("th", {
                    rowSpan: 2,
                    innerHTML: "<span>Dias solicitados</span>"
                });
                o.setAttribute("style", "height: 125px"),
                c.appendChild(o);
                var i = createJSElement("th", {
                    rowSpan: 2,
                    innerHTML: "<span>Dias disponibles</span>"
                });
                i.setAttribute("style", "height: 125px"),
                c.appendChild(i);
                var s = 3
                  , r = document.createElement("th");
                r.innerHTML = "<strong>" + e.Year + "</strong>",
                e.Months.forEach(function(e, t) {
                    var a = createJSElement("th", {
                        className: "text-capitalize",
                        colSpan: e.Days.length,
                        innerHTML: moment(e.Month, "MM").lang("es").format("MMMM")
                    });
                    e.Days.forEach(function(e, t) {
                        var a = createJSElement("th", {
                            innerHTML: moment(e.Day, "DD-MM-YYYY").format("DD")
                        });
                        a.setAttribute("style", "padding:4px 2px;"),
                        l.appendChild(a)
                    }),
                    c.appendChild(a),
                    s += e.Days.length
                }),
                r.setAttribute("colspan", s),
                d.appendChild(r)
            }),
            m[0].appendChild(d),
            m[0].appendChild(c),
            m[0].appendChild(l));
            var i = document.createElement("tr")
              , s = createJSElement("td", {
                className: "font-bold",
                innerHTML: e.Name
            });
            s.setAttribute("style", "position: absolute; width: 18rem; background: white; margin-top:-1px; overflow:hidden; font-size:1rem;"),
            i.appendChild(s);
            var r = createJSElement("td", {
                className: "d-none",
                innerHTML: e.Department
            });
            i.appendChild(r);
            var p = createJSElement("td", {
                className: "d-none",
                innerHTML: e.Center
            });
            i.appendChild(p),
            i.setAttribute("data-id", e.Id),
            e.Years.forEach(function(e, t) {
                var a = createJSElement("td", {
                    className: "text-right",
                    innerHTML: e.NumberOfDays
                });
                i.appendChild(a);
                var n = createJSElement("td", {
                    className: "text-right",
                    innerHTML: e.RequestedVacs + e.ApprovedVacs
                });
                i.appendChild(n);
                var o = createJSElement("td", {
                    className: "text-right",
                    innerHTML: e.NumberOfDays - e.ApprovedVacs - e.RequestedVacs
                });
                i.appendChild(o),
                e.Months.forEach(function(e, t) {
                    e.Days.forEach(function(e, t) {
                        var a = document.createElement("td");
                        if (a.setAttribute("class", "pd-1"),
                        e.Active)
                            if (e.IsHol)
                                a.setAttribute("style", "background-color: " + u.LegendColors.holiday.color + ";");
                            else if (e.IsWD) {
                                if (e.IsTD)
                                    a.setAttribute("style", "background-color: " + u.LegendColors.tempDisability.color + ";");
                                else if (e.IsLD)
                                    a.setAttribute("style", "background-color: " + u.LegendColors.leaveDays.color + ";");
                                else if (null !== e.State)
                                    switch (e.State) {
                                    case 0:
                                    case 1:
                                    case 2:
                                        a.setAttribute("style", "background-color: " + u.LegendColors.requestedVacs.color + ";");
                                        break;
                                    case 3:
                                    case 6:
                                    case 7:
                                        a.setAttribute("style", "background-color: " + u.LegendColors.approvedVacs.color + ";")
                                    }
                            } else
                                a.setAttribute("style", "background-color: " + u.LegendColors.noWorkedDay.color + ";");
                        else
                            a.setAttribute("style", "background-color:" + u.LegendColors.noActive.color + ";");
                        i.appendChild(a)
                    })
                })
            }),
            h[0].appendChild(i)
        }),
        u.RenderLegend()
    },
    RenderLegend: function() {
        var e, i, s = this, t = document.getElementById("table-legend");
        t && ((e = document.createElement("h4")).setAttribute("class", "pb-1 mb-2"),
        e.innerHTML = "Leyenda",
        (i = document.createElement("ul")).setAttribute("class", " d-inline-block border border-dark pr-3 pl-1 pt-2 pb-2 text-dark"),
        Object.keys(s.LegendColors).forEach(function(e, t) {
            var a = document.createElement("li");
            a.setAttribute("class", "d-block d-sm-inline-block font-bold");
            var n = document.createElement("span");
            n.setAttribute("class", "fas fa-square mr-1 ml-3"),
            n.setAttribute("style", "color: " + s.LegendColors[e].color + ";"),
            a.appendChild(n);
            var o = document.createTextNode(s.LegendColors[e].title);
            a.appendChild(o),
            i.appendChild(a)
        }),
        t.appendChild(e),
        t.appendChild(i))
    }
}
  , LeaveDays = {
    isLoaded: !1,
    LeaveDays: [],
    PillTab: !1,
    init: function() {
        this.isLoaded || (this.initEvents(),
        this.isLoaded = !0,
        this.LeaveDays = [])
    },
    initEvents: function() {
        var o = this;
        $("body").on("click", "#menu-leave-days", function() {
            o.render()
        }),
        $("body").on("click", "#request-leave-day", function() {
            showCompleteLoading();
            var e = $(this).closest("form");
            return e.length ? ((e = e[0]).classList.remove("needs-validation"),
            FormValidationBootstrap(e) ? o.sendRequest(e) : hideCompleteLoading(),
            e.classList.add("was-validated")) : (displayMessage("No se ha encontrado el elemento del dom formulario", "danger"),
            hideCompleteLoading()),
            !1
        }),
        $("body").on("click", "a#approve-leave-days", function(e) {
            e.stopPropagation(),
            $(this).prop("disabled", !0);
            var t = $(this).closest(".leave-days-request")
              , a = $(t).find(".idTask").val()
              , n = $(t).find(".comments").val();
            return o.PillTab = Control.GetActivePillsTab(),
            o.approveLeaveDayTask(a, n, t, o.PillTab),
            !1
        }),
        $("body").on("click", "a#reject-leave-days", function(e) {
            e.stopPropagation(),
            $(this).prop("disabled", !0);
            var t = $(this).closest(".leave-days-request")
              , a = $(t).find(".idTask").val()
              , n = $(t).find(".comments").val();
            return o.PillTab = Control.GetActivePillsTab(),
            o.rejectLeaveDayTask(a, n, t, o.PillTab),
            !1
        })
    },
    getLeaveDaysView: function() {
        return $.ajax({
            url: "leave-days/list",
            method: "GET",
            cache: !1,
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            dataType: "html"
        })
    },
    getLeaveDaysFromEmployee: function() {
        return $.ajax({
            url: api_url + "api/leave-days/list-all",
            method: "GET",
            headers: {
                Authorization: "Bearer " + $.getToken()
            }
        })
    },
    sendRequest: function(e) {
        var t = this
          , a = t.getFormDataFromTempDisability(e);
        $.ajax({
            url: api_url + "api/leave-days/request",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            processData: !1,
            contentType: !1,
            data: a,
            success: function(e) {
                e.Success ? $.displayMessage("La Ausencia/Permiso ha sido registrada con éxito.", "success") : $.displayMessage(e.Message, "danger"),
                t.render(),
                hideCompleteLoading()
            },
            error: function(e) {
                hideCompleteLoading()
            }
        })
    },
    getFormDataFromTempDisability: function(e) {
        var t = new FormData;
        if ($("#document").length && $("#document")[0].files.length) {
            var a = $("#document")[0].files[0];
            if (a.size > this.MaxInputFile)
                return $.displayMessage("El tamaño de archivo máximo permitido es de 1MB.", "danger"),
                !1;
            t.append("document", a)
        }
        return t.append("newLeaveDay.Id", $(e).find("#Id").val()),
        t.append("newLeaveDay.StartDate", $(e).find("#StartDate").val()),
        t.append("newLeaveDay.LeaveDayType", $(e).find("#LeaveDayType").val()),
        t.append("newLeaveDay.Notes", $(e).find("#Notes").val()),
        t
    },
    attachDocumentToRequest: function(e, t) {
        var a = new FormData;
        return a.append("id", e),
        a.append("document", t),
        $.ajax({
            url: api_url + "api/leave-days/attach-document",
            method: "POST",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            processData: !1,
            contentType: !1,
            data: a
        })
    },
    initTempusDominus: function() {
        $("#datepickerStartDate").datetimepicker({
            minDate: Date.now(),
            locale: "es",
            format: "DD-MM-YYYY",
            ignoreReadonly: !0,
            buttons: {
                showClose: !0
            }
        }),
        $("#datepickerStartDate").on("change.datetimepicker", function(e) {
            moment(e.date)
        })
    },
    approveLeaveDayTaskCallback: function(e, t) {
        return $.ajax({
            url: "/approve-task",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                id: e,
                comments: t
            },
            dataType: "json"
        })
    },
    approveLeaveDayTask: function(e, t, a, n) {
        showCompleteLoading(),
        this.approveLeaveDayTaskCallback(e, t).then(function(e) {
            hideCompleteLoading(),
            Control.GetMenuPrincipal(),
            !0 === e.Success ? (displayMessage(e.Message, "success"),
            $(a).fadeOut("slow", function() {
                $(this).remove(),
                $("body").find(".vacation-request").length || $("body").find(".compensation-hours-request").length || $("body").find(".leave-days-request").length ? Control.GetPendingTasksView(n) : ($("header").find(".menu-chief-of-department-container").length && $("header").find(".menu-chief-of-department-container").closest("li").fadeOut(),
                Control.GetView())
            })) : displayMessage(e.Message, "danger")
        }).catch(function(e) {
            Control.GetMenuPrincipal(),
            hideCompleteLoading()
        })
    },
    rejectLeaveDayTaskCallback: function(e, t) {
        return $.ajax({
            url: "/reject-task",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: {
                id: e,
                comments: t
            },
            dataType: "json"
        })
    },
    rejectLeaveDayTask: function(e, t, a, n) {
        showCompleteLoading(),
        this.rejectLeaveDayTaskCallback(e, t).then(function(e) {
            hideCompleteLoading(),
            Control.GetMenuPrincipal(),
            !0 === e.Success ? (displayMessage(e.Message, "success"),
            $(a).fadeOut("slow", function() {
                $(this).remove(),
                $("body").find(".vacation-request").length || $("body").find(".compensation-hours-request").length || $("body").find(".leave-days-request").length ? Control.GetPendingTasksView(n) : ($("header").find(".menu-chief-of-department-container").length && $("header").find(".menu-chief-of-department-container").closest("li").fadeOut(),
                Control.GetView())
            })) : displayMessage(e.Message, "danger")
        }).catch(function(e) {
            hideCompleteLoading(),
            Control.GetMenuPrincipal()
        })
    },
    removeLeaveDayRequest: function(e) {
        var t = {
            Id: e
        };
        return $.ajax({
            url: api_url + "api/leave-days/remove-request",
            method: "POST",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            contentType: "application/json",
            data: JSON.stringify(t),
            dataType: "json"
        })
    },
    requestLeaveDayCancellation: function(e) {
        return $.ajax({
            url: api_url + "api/leave-days/request-cancel",
            method: "POST",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + $.getToken()
            },
            data: JSON.stringify({
                Id: e
            }),
            dataType: "json"
        })
    },
    createModal: function() {
        var e = createJSElement("div", {
            id: "uploadLeaveDayRequestModal",
            className: "modal fade"
        });
        return e.innerHTML = '<div class="modal-dialog">                        <div class="modal-content">                            <div class="modal-header">                                <h5 class="modal-title">Adjuntar documentación a solicitud</h5>                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">                                    <span aria-hidden="true">&times;</span>                                </button>                            </div>                            <div class="modal-body">                                <div class="custom-file">                                    <input type="file" class="custom-file-input" id="document" name="document" lang="es">                                    <label class="custom-file-label" for="document">Adjuntar documento</label>                                </div>                            </div>                            <div class="modal-footer">                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>                                <button type="button" class="btn btn-primary" id="upload-file">Adjuntar documento</button>                            </div>                        </div>                    </div>',
        document.body.append(e),
        new Modal(e,{})
    },
    renderLeaveDaysTable: function() {
        var i = this
          , e = document.getElementById("previous-leave-days-table");
        if (null == e)
            return displayMessage("No se ha encontrado el panel del listado de días de ausencia en esta página", "danger"),
            "";
        e.innerHTML = "";
        var t = createJSElement("table", {
            className: "table table-sm border-bottom",
            id: "table-employee-leave-days"
        });
        e.append(t);
        function a(e, t) {
            var a = new Date(e)
              , n = new Date(t);
            return a.getTime() - n.getTime()
        }
        window.operateEventsLeaveDays = {
            "click .btn-request-leave-day-cancellation": function(e, t, a, n) {
                var o = {
                    Id: a.id,
                    StartDate: a.start,
                    EndDate: a.end
                };
                new LeaveDayRange(o).render();
                return !1
            },
            "click .btn-reject-leave-day-request": function(e, t, a, n) {
                return showCompleteLoading(),
                i.removeLeaveDayRequest(a.id).then(function(e) {
                    e.Success ? displayMessage("La solicitud de días de ausencia ha sido anulada.", "success") : displayMessage(e.Message, "danger"),
                    i.renderPreviousLeaveDays(),
                    hideCompleteLoading()
                }).catch(function(e) {
                    displayMessage("El rechazo ha generado una excepción: " + e, "danger"),
                    hideCompleteLoading()
                }),
                !1
            },
            "click .btn-append-file-leave-day": function(e, t, a, n) {
                var o = i.createModal();
                o.el.querySelector("#upload-file").addEventListener("click", function(e) {
                    showCompleteLoading();
                    var t = o.el.querySelector("input.custom-file-input");
                    i.attachDocumentToRequest(a.id, t.files[0]).then(function(e) {
                        e.Success ? (displayMessage("El documento se ha adjuntado correctamente.", "success"),
                        o.hide(),
                        i.render()) : displayMessage(e.Message, "danger"),
                        hideCompleteLoading()
                    }).catch(function(e) {
                        displayMessage(e, "danger"),
                        hideCompleteLoading()
                    })
                }),
                o.show()
            }
        },
        $(t).bootstrapTable({
            columns: [{
                field: "id",
                visible: !1,
                sortable: !1
            }, {
                title: "Fecha Inicio",
                field: "start",
                class: "text-nowrap",
                sortable: !0,
                sorter: a,
                formatter: function(e, t) {
                    return new Date(e).toLocaleDateString(!0)
                }
            }, {
                title: "Fecha Fin",
                field: "end",
                class: "text-nowrap",
                sortable: !0,
                sorter: a,
                formatter: function(e, t) {
                    return new Date(e).toLocaleDateString(!0)
                }
            }, {
                title: "Causa",
                field: "type",
                class: "text-wrap",
                sortable: !0
            }, {
                title: "Notas",
                field: "notes",
                class: "text-wrap",
                sortable: !1
            }, {
                title: "Estado",
                field: "descstate",
                sortable: !1
            }, {
                title: "Adjuntos",
                field: "attached",
                sortable: !1,
                formatter: function(e, t) {
                    var a = document.createElement("div");
                    return Array.isArray(e) && e.length && e.forEach(function(e, t) {
                        a.append(createJSElement("a", {
                            className: "badge badge-light m-1",
                            href: api_url + e.Token,
                            innerText: e.Text
                        }))
                    }),
                    a.innerHTML
                }
            }, {
                title: "",
                field: "actions",
                class: "text-nowrap text-right",
                events: window.operateEventsLeaveDays,
                formatter: function(e, t) {
                    var a = document.createElement("div")
                      , n = createJSElement("a", {
                        href: "javascript:void(0)",
                        className: "btn-reject-leave-day-request text-danger ml-1",
                        title: "Anular solicitud",
                        innerHTML: '<span class="fa fa-times"></span>'
                    })
                      , o = createJSElement("a", {
                        href: "javascript:void(0)",
                        className: "btn-request-leave-day-cancellation text-dark ml-1",
                        title: "Solicitar cancelación",
                        innerHTML: '<span class="fa fa-trash-alt"></span>'
                    })
                      , i = createJSElement("a", {
                        href: "javascript:void(0)",
                        className: "btn-append-file-leave-day text-dark ml-1",
                        title: "Adjuntar documento",
                        innerHTML: '<span class="fa fa-file-upload"></span>'
                    });
                    switch (Array.isArray(t.attached) && 3 <= t.attached.length && (i = ""),
                    t.state) {
                    case 0:
                    case 1:
                        a.append(i),
                        a.append(n);
                        break;
                    case 2:
                        a.append(i);
                        break;
                    case 3:
                        a.append(i);
                        var s = new Date(t.end);
                        Date.now(),
                        s.getTime(),
                        a.append(o)
                    }
                    return a.innerHTML
                }
            }],
            data: i.LeaveDays,
            pageSize: 15,
            pagination: !0,
            rowStyle: function(e, t) {
                var a = "";
                switch (e.state) {
                case 3:
                    a = "table-success";
                    break;
                case 4:
                case 5:
                case 8:
                    a = "table-danger";
                    break;
                case 2:
                case 6:
                case 7:
                    a = "table-warning";
                    break;
                default:
                    a = ""
                }
                return {
                    classes: a
                }
            },
            search: !0,
            sortName: "end",
            sortOrder: "desc",
            showSearchClearButton: !0
        })
    },
    renderPreviousLeaveDays: function() {
        var a = this;
        if (!Array.isArray(a.LeaveDays))
            return "";
        a.getLeaveDaysFromEmployee().then(function(e) {
            !0 === e.Success ? (a.LeaveDays = [],
            e.LeaveDays.forEach(function(e, t) {
                a.LeaveDays.push({
                    id: e.Id,
                    notes: e.Notes,
                    start: e.Start,
                    end: e.End,
                    state: e.State,
                    descstate: e.LeaveDayState,
                    type: e.Type,
                    notes: e.Notes,
                    attached: e.DocumentsURL
                })
            }),
            a.renderLeaveDaysTable()) : displayMessage(e.Message, "danger")
        }).catch(function(e) {})
    },
    render: function() {
        var t = this;
        showCompleteLoading(),
        t.getLeaveDaysView().then(function(e) {
            hideCompleteLoading(),
            $("main").empty(),
            $("main").append(e),
            t.initTempusDominus(),
            t.renderPreviousLeaveDays()
        }).catch(function(e) {
            hideCompleteLoading()
        })
    }
};
