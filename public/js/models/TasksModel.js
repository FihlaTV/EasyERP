define([
    'common',
    'Validation'
],
    function (common, Validation) {
    var TaskModel = Backbone.Model.extend({
        idAttribute: "_id",
        initialize: function () {
            this.on('invalid', function (model, errors) {
                if(errors.length > 0){
                    var msg = errors.join('\n');
                    alert(msg);
                }
            });
        },
        parse: true,

        parse: function (response) {
            if (response && response.extrainfo) {
                response.extrainfo.StartDate = common.utcDateToLocaleDate(response.extrainfo.StartDate);
                response.extrainfo.EndDate = common.utcDateToLocaleDate(response.extrainfo.EndDate);
                response.deadline = common.utcDateToLocaleDate(response.deadline);
            }
            if (response && response.attachments) {
                _.map(response.attachments, function (attachment) {
                    attachment.uploadDate = common.utcDateToLocaleDate(attachment.uploadDate);
                    return attachment;
                });
            }
            
            if (response &&  response.notes) {
                _.map(response.notes, function (notes) {
                	notes.date = common.utcDateToLocaleDate(notes.date);
                    return notes;
                });
            }
            return response;
        },

        validate: function (attrs) {
            var errors = [];

            Validation.checkNameField(errors, true, attrs.summary, "Summary");
            Validation.checkNameField(errors, true, attrs.project._id || attrs.project, "Project");
            if(attrs.deadline && attrs.extrainfo.StartDate)
                Validation.checkFirstDateIsGreater(errors, attrs.deadline, "deadline date",attrs.extrainfo.StartDate, "Start date");

            if (errors.length > 0)
                return errors;
        },
        
        defaults: {
            summary: '',
            taskCount: 0,
            type: '',
            project: '',
            assignedTo: '',
            deadline: null,
            tags: [],
            description: '',
            extrainfo: {
            	priority: 'P3',
                duration: null,
                sequence: 0,
                customer:'',
                StartDate: null,
                EndDate: null
            },

            color: '#4d5a75',
            estimated: 0,
            logged: 0,
            remaining: 0,
            progress: 0,
            notes:[]
        },

        urlRoot: function () {
            return "/Tasks";
        }
    });

    return TaskModel;
});