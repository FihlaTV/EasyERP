define([
    "text!templates/Companies/thumbnails/ThumbnailsItemTemplate.html",
    "common"
],
    function (ThumbnailsItemTemplate, common) {
        var ThumbnailsItemView = Backbone.View.extend({
            tagName:"div",
            className: "thumbnail",

            initialize: function () {
                this.model.on('change', this.render, this);
                this.render();
            },

            events: {
                "click": "gotoForm",
                "click #delete": "deleteThumbnail",
                "click .dropDown > a": "openDropDown",
                "click .colorPicker a": "pickColor",
                "click #edit": "gotoEditForm"
            },

            gotoEditForm: function (e) {
                e.preventDefault();
                var itemIndex = this.$el.data("index") + 1;
                window.location.hash = "#home/action-Companies/Edit/" + itemIndex;
            },

            openDropDown: function (e) {
                e.preventDefault();
                this.$(".dropDown > a").toggleClass("selected").siblings(".dropDownOpened").fadeToggle("normal");
            },

            pickColor: function (e) {
                e.preventDefault();
                var mid = 39;
                var color = $(e.target).data("color");
                this.changeColor(color);
                this.model.set({ color: color });
                this.model.save({ color: color }, {
                    headers: {
                        mid: mid
                    }
                });
            },

            changeColor: function (color) {
                var rgbColor = common.hexToRgb(color);
                this.$el.css('background-color', 'rgba(' + rgbColor.r + ',' + rgbColor.g + ',' + rgbColor.b + ', 0.20)');
                this.$('p').css({ 'color': color, 'font-weight': 'bold', 'text-shadow': '0 1px 1px rgba(' + 255 + ',' + 255 + ',' + 255 + ', 0.5)' });
            },

            deleteThumbnail: function (e) {
                e.preventDefault();
                var mid = 39;
                var that = this;
                var model = this.model.collection.get(this.$el.attr("id"));
                this.$el.closest(".thumbnail").fadeToggle(300, function () {
                    model.destroy(
                        {
                            headers: {
                                mid: mid
                            }
                        },
                        { wait: true });
                    $(this).remove();
                });
            },

            gotoForm: function (e) {
                App.ownContentType = true;
                if ($(e.target).closest("div").attr("class") != "dropDown") {
                    var itemIndex = $(e.target).data("index") + 1;
                    window.location.hash = "#home/content-Companies/form/" + itemIndex;
                }
            },

            template: _.template(ThumbnailsItemTemplate),

            render: function () {
                var color = this.model.get('color');
                var index = this.model.collection.indexOf(this.model);
                this.$el.html(this.template(this.model.toJSON()));
                this.$el.attr("data-index", index);
                this.$el.attr("id", this.model.get('_id'));
                this.changeColor(color);
                return this;
            }
        });

        return ThumbnailsItemView;
    });