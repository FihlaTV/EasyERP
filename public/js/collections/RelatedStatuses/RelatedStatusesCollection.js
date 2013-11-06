define(function () {
    var WorkflowModel = Backbone.Model.extend({
        idAttribute: '_id'
    });

    var WorkflowsCollection = Backbone.Collection.extend({
        model: WorkflowModel,
        url: function () {
            var mid = 39,
                url = "/relatedStatus?mid=" + mid;
            return url;
        },

        initialize: function () {
            console.log("RelatedStatuses Collection Init");
            this.fetch({
                type: 'GET',
                reset: true,
                success: this.fetchSuccess,
                error: this.fetchError
            });
        },

        parse: true,

        parse: function (response) {
            return response.data;
        },

        fetchSuccess: function (collection, response) {
            console.log("RelatedStatuses fetchSuccess");
        },
        fetchError: function (error) {

        }

    });

    return WorkflowsCollection;
});