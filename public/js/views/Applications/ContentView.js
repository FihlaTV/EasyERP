define([
    'jqueryui',
    'text!templates/Applications/list/ListTemplate.html',
    'text!templates/Applications/form/FormTemplate.html',
    'text!templates/Applications/kanban/KanbanTemplate.html',
    'collections/Applications/ApplicationsCollection',
    'collections/Workflows/WorkflowsCollection',
    'views/Applications/list/ListItemView',
    'views/Applications/kanban/KanbanItemView',
    'custom'
],

function (jqueryui, ApplicationsListTemplate, ApplicationsFormTemplate, ApplicationsKanbanTemplate, ApplicationsCollection, WorkflowsCollection, ApplicationsListItemView, ApplicationsKanbanItemView, Custom) {
    var ApplicationsView = Backbone.View.extend({
        el: '#content-holder',
        initialize: function (options) {
            console.log('Init Applications View');
            var that = this;
            this.workflowsCollection = new WorkflowsCollection({ id: 'application' });
            this.workflowsCollection.bind('reset', _.bind(this.render, this));
            this.collection = options.collection;
            this.collection.bind('reset', _.bind(this.render, this));
            this.render();

           

            $(window).resize(function () {
                that.$(".kanban").height($(window).height() - 119);
            });

        },

        events: {
            "click .checkbox": "checked",
            "click .foldUnfold": "openDropDown",
            "click .fold": "foldUnfoldColumn",
            "click .breadcrumb a, #refuse": "changeWorkflow",
            "click #hire": "isEmployee",
            "click #top-bar-deleteBtn": "deleteForm"
        },


        render: function () {
            var that = this;
            var workflows = this.workflowsCollection.models;
            Custom.setCurrentCL(this.collection.models.length);
            console.log('Render Applications View');
            var viewType = Custom.getCurrentVT();
            var mid = 39;
            switch (viewType) {
                case "kanban":
                    {
                        this.$el.html(_.template(ApplicationsKanbanTemplate));


                        _.each(workflows, function (workflow, index) {
                            $("<div class='column applicationColumn' data-index='" + index + "' data-status='" + workflow.get('status') + "' data-name='" + workflow.get('name') + "' data-id='" + workflow.get('_id') + "'><div class='columnNameDiv'><h2 class='columnName'>" + workflow.get('name') + "</h2></div></div>").appendTo(".kanban");
                        });

                        $(".column").last().addClass("lastColumn");

                        _.each(workflows, function (workflow, i) {
                            var counter = 0,
                                remaining = 0;
                            var column = this.$(".column").eq(i);
                            var kanbanItemView;
                            _.each(this.collection.models, function (model) {
                                if (model.get("workflow").name === column.data("name")) {
                                    kanbanItemView = new ApplicationsKanbanItemView({ model: model });
                                    kanbanItemView.bind('deleteEvent', this.deleteItems, kanbanItemView);
                                    column.append(kanbanItemView.render().el);
                                    counter++;
                                    remaining += model.get("estimated") - model.get("loged");
                                }
                            }, this);
                            column.find(".columnNameDiv").append("<p class='counter'>" + counter + "</p><a class='foldUnfold' href='#'><img hidden='hidden' src='./images/downCircleBlack.png'/></a><ul hidden='hidden' class='dropDownMenu'></ul>");
                        }, this);
                        break;
                    }
                case "list":
                    {
                        this.$el.html(_.template(ApplicationsListTemplate));
                        var table = this.$el.find('table > tbody');

                        _.each(this.collection.models, function (model) {
                            table.append(new ApplicationsListItemView({ model: model }).render().el);
                            console.log(model);
                        }, this);

                        $('#check_all').click(function () {
                            var c = this.checked;
                            $(':checkbox').prop('checked', c);
                        });

                        break;
                    }
                case "form":
                    {
                        var itemIndex = Custom.getCurrentII() - 1;
                        if (itemIndex > this.collection.models.length - 1) {
                            itemIndex = this.collection.models.length - 1;

                            var urlParts = window.location.hash.split('/');
                            if (urlParts[4]) {
                                urlParts[4] = this.collection.models.length;
                                window.location.hash = urlParts.join('/');
                            }
                            Custom.setCurrentII(this.collection.models.length);
                        }

                        if (itemIndex == -1) {
                            this.$el.html();
                        } else {
                            var currentModel = this.collection.models[itemIndex];
                            this.$el.html(_.template(ApplicationsFormTemplate, currentModel.toJSON()));

                            _.each(workflows, function (workflow, index) {
                                if (index < workflows.length - 1) {
                                    $(".breadcrumb").append("<li data-index='" + index + "' data-status='" + workflow.get('status') + "' data-name='" + workflow.get('name') + "' data-id='" + workflow.get('_id') + "'><a class='applicationWorkflowLabel'>" + workflow.get('name') + "</a></li>");
                                }
                            });

                            _.each(workflows, function (workflow, i) {
                                var breadcrumb = this.$(".breadcrumb li").eq(i);
                                if (currentModel.get("workflow").name === breadcrumb.data("name")) {
                                    breadcrumb.find("a").addClass("active");
                                }
                            }, this);
                        }

                        break;
                    }
            }
            this.$(".kanban").height($(window).height() - 119);
            this.$(".kanban").width((this.$(".column").width() + 1) * workflows.length);
            this.$(".column").sortable({
                connectWith: ".column",
                cancel: "h2",
                cursor: "move",
                items: ".application",
                opacity: 0.7,
                revert: true,
                helper: 'clone',
                start: function (event, ui) {
                    var column = ui.item.closest(".column");
                    column.find(".counter").html(parseInt(column.find(".counter").html()) - 1);
                },
                stop: function (event, ui) {
                    var model = that.collection.get(ui.item.attr("id"));
                    var column = ui.item.closest(".column");
                    var ob = {
                        workflow: {
                            name: column.data("name"),
                            status: column.data("status")
                        }
                    };

                    model.set(ob);
                    model.save({}, {
                        headers: {
                            mid: mid
                        }

                    });
                    column.find(".counter").html(parseInt(column.find(".counter").html()) + 1);
                }
            }).disableSelection();
            return this;
        },

        changeWorkflow: function (e) {
            var mid = 39;
            var model;
            var name = '', status = '';
            if ($(e.target).hasClass("applicationWorkflowLabel")) {
                var breadcrumb = $(e.target).closest('li');
                var a = breadcrumb.siblings().find("a");
                if (a.hasClass("active")) {
                    a.removeClass("active");
                }
                breadcrumb.find("a").addClass("active");
                name = breadcrumb.data("name");
                status = breadcrumb.data("status");
            }
            else {
                var workflow = this.workflowsCollection.models[this.workflowsCollection.models.length - 1];
                console.log(workflow);
                name = workflow.get('name');
                status = workflow.get('status');
            }
            model = this.collection.get($(e.target).closest(".formHeader").siblings().find("form").data("id"));
            var ob = {
                workflow: {
                    name: name,
                    status: status
                }
            };

            model.set(ob);
            model.save({}, {
                headers: {
                    mid: mid
                }

            });

        },

        isEmployee: function (e) {
            var mid = 39;
            var model = this.collection.get($(e.target).closest(".formHeader").siblings().find("form").data("id"));
            model.set({ isEmployee: true });
            model.save({}, {
                headers: {
                    mid: mid
                },
                success: function (model) {
                    Backbone.history.navigate("#home/content-Employees", { trigger: true });
                }
            });
        },

        openDropDown: function (e) {
            e.preventDefault();
            var foldUnfold = "Unfold";
            if (!$(e.target).closest(".column").hasClass("rotate")) {
                foldUnfold = "Fold";
                $(e.target).closest(".columnNameDiv").toggleClass("selected");
            }
            $(e.target).closest(".foldUnfold").siblings(".dropDownMenu").html("<li><a class='fold' href='#'>" + foldUnfold + "</a></li>").fadeToggle("normal");
        },

        foldUnfoldColumn: function (e) {
            e.preventDefault();
            var column = $(e.target).closest(".column");
            if (column.hasClass("rotate")) {
                column.attr('style', '');
                column.find(".application").show();
                column.find(".dropDownMenu").hide();
                column.find(".columnNameDiv");
                column.removeClass("rotate");
                column.find(".counter, .foldUnfold img").attr('style', '');;
            } else {
                column.css('max-width', '40px');
                column.find(".application, .dropDownMenu").hide();
                column.addClass("rotate");
                column.find(".columnNameDiv").removeClass("selected");
                column.find(".counter, .foldUnfold img").css({ 'position': 'relative', 'right': '6px', 'top': '-12px' });
            }

        },

        checked: function () {
            if ($("input:checked").length > 0)
                $("#top-bar-deleteBtn").show();
            else
                $("#top-bar-deleteBtn").hide();
        },

        deleteItems: function () {
            var that = this,
               mid = 39,
               model;
            var viewType = Custom.getCurrentVT();
            switch (viewType) {
                case "kanban":
                    {
                        model = that.collection.get(this.$el.attr("id"));
                        this.$("#delete").closest(".application").fadeToggle(300, function () {
                            model.destroy(
                                {
                                    headers: {
                                        mid: mid
                                   }
                                });
                            $(this).remove();
                        });
                        var column = this.$el.closest(".column");
                        column.find(".counter").html(parseInt(column.find(".counter").html()) - 1);
                        this.collection.trigger('reset');
                        break;
                    }
                case "list":
                    {
                        $.each($("tbody input:checked"), function (index, checkbox) {
                            var task = that.collection.get(checkbox.value);

                            task.destroy({
                                headers: {
                                    mid: mid
                                }
                            });
                        });
                        this.collection.trigger('reset');
                        break;
                    }
                case "form":
                    {
                        model = this.collection.get($(".form-holder form").data("id"));
                        model.on('change', this.render, this);
                        model.destroy({
                            headers: {
                                mid: mid
                            },
                            success: function () {
                                Backbone.history.navigate("#home/content-Applications", { trigger: true });
                            }
                        });
                        break;
                    }
            }
        }
    });

    return ApplicationsView;
});
