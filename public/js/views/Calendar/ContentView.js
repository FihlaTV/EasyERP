define([
    "text!templates/Calendar/CalendarTemplate.html",
    "Calendar",
    "collections/Events/EventsCollection",
    "collections/Employees/EmployeesCollection",
    "common"
],
function (CalendarTemplate, Calendar, EventsCollection, EmployeesCollection, common) {
    var ContentView = Backbone.View.extend({
        el: '#content-holder',
        template: _.template(CalendarTemplate),
        initialize: function (options) {
            this.eventsCollection = new EventsCollection();
            //this.employeesCollection  = new EmployeesCollection();
            this.eventsCollection.bind('reset', _.bind(this.render, this));
            //this.employeesCollection.bind('reset', _.bind(this.render, this));
            this.render();
        },

        events: {

        },

        render: function () {
            this.$el.html(this.template());
            Calendar.initCalendar("schedulerDiv", this.eventsCollection);
            Calendar.initMiniCalendar("miniCalendar");
            common.contentHolderHeightFixer();
            return this;
        }
    });

    return ContentView;
});
