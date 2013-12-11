define([
    'text!templates/Departments/form/FormTemplate.html',
    'views/Departments/EditView'
],

    function (FormTemplate, EditView) {
        var FormView = Backbone.View.extend({
            el: '#content-holder',
            initialize: function (options) {
                this.formModel = options.model;
            },

            events: {
                "click .breadcrumb a, #cancelCase, #reset": "changeWorkflow",
                "click #convertToOpportunity": "openDialog"
            },

            render: function () {
                var formModel = this.formModel.toJSON();
                this.$el.html(_.template(FormTemplate, formModel));
                var that = this;
                $("#dialog-form").dialog({
                    autoOpen: false,
                    height: 150,
                    width: 350,
                    modal: true,
                    title: "Convert to opportunity",
                    buttons: {
                        "Create opportunity": function () {
                            var self = this;
                            var id = $("form").data("id");
                            var createCustomer = ($("select#createCustomerOrNot option:selected").val()) ? true : false;
                            that.formModel.set({
                                isOpportunitie: true,
                                createCustomer: createCustomer
                            });
                            that.formModel.save({}, {
                                headers: {
                                    mid: mid
                                },
                                success: function (model) {
                                    $(self).dialog("close");
                                    that.opportunitiesCollection.add(model);
                                    Backbone.history.navigate("easyErp/Departments/form/" + model.id, { trigger: true });
                                }

                            });

                        },
                        Cancel: function () {
                            $(this).dialog('close');
                        }
                    },

                    close: function () {
                        $(this).dialog('close');
                    }
                }, this);
                return this;
            },

            editItem: function () {
                //create editView in dialog here
                new EditView({ model: this.formModel });
            },

            openDialog: function () {
                $("#dialog-form").dialog("open");
            },

            deleteItems: function () {
                var mid = 39;

                this.formModel.destroy({
                    headers: {
                        mid: mid
                    },
                    success: function () {
                        Backbone.history.navigate("easyErp/Departments/list", { trigger: true });
                    }
                });

            }
        });

        return FormView;
    });