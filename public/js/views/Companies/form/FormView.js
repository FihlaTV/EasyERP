define([
    'text!templates/Companies/form/FormTemplate.html',
    'views/Companies/EditView',
    'views/Opportunities/compactContent',
    'views/Persons/compactContent',
    'custom',
    'common',
    "dataService",
    'views/Notes/NoteView',
    'text!templates/Notes/AddNote.html',
    'views/Opportunities/CreateView',
    'views/Persons/CreateView',
    'text!templates/Notes/AddAttachments.html'
],

    function (CompaniesFormTemplate, EditView, opportunitiesCompactContentView, personsCompactContentView, Custom, common, dataService, noteView, addNoteTemplate, CreateViewOpportunities,CreateViewPersons, addAttachTemplate) {
        var FormCompaniesView = Backbone.View.extend({
            el: '#content-holder',
            initialize: function (options) {
                _.bindAll(this, 'render');
                this.formModel = options.model;
				this.pageMini = 1;
				this.pageCount = 4;
				this.allMiniOpp =0;
				this.allPages =0;

				this.pageMiniPersons = 1;
				this.pageCountPersons = 4;
				this.allMiniPersons =0;
				this.allPagesPersons =0;

				var self = this;
				var formModel = this.formModel.toJSON();
				common.populateOpportunitiesForMiniView("/OpportunitiesForMiniView",formModel._id, formModel._id,this.pageMini,this.pageCount,true,function(count){
					self.allMiniOpp = count.listLength;
					self.allPages = Math.ceil(self.allMiniOpp/self.pageCount)
					if (self.allPages == self.pageMini){
						$(".miniPagination .next").addClass("not-active");
						$(".miniPagination .last").addClass("not-active");
					}
				});
				this.populatePersonsForMiniView("/getPersonsForMiniView",formModel._id, this.pageMiniPersons,this.pageCountPersons,true,function(count){
					self.allMiniPersons = count.listLength;
					self.allPagesPersons = Math.ceil(self.allMiniPersons/self.pageCountPersons);
					if (self.allPagesPersons == self.pageMiniPersons){
						$(".miniPagination .next").addClass("not-active");
						$(".miniPagination .last").addClass("not-active");
					}
				});


//                this.personsCollection.bind('reset', _.bind(this.render, this));
            },
            flag: true,
            events: {
                "click #tabList a": "switchTab",
                "click .details": "toggle",
                "mouseover .social a": "socialActive",
                "mouseout .social a": "socialNotActive",
                "change #inputAttach": "addAttach",
                "click .deleteAttach": "deleteAttach",
                "click #addNote": "addNote",
                "click .editDelNote": "editDelNote",
                "click #cancelNote": "cancelNote",
                "mouseenter .editable:not(.quickEdit)": "quickEdit",
                "mouseleave .editable": "removeEdit",
                "click #editSpan": "editClick",
                "click #cancelSpan": "cancelClick",
                "click #saveSpan": "saveClick",
                "click .btnHolder .add.opportunities": "addOpportunities",
                "click .btnHolder .add.persons": "addPersons",
                "change .person-info.company.long input": "saveCheckboxChange",
                "click .miniPagination .next:not(.not-active)": "nextMiniPage",
                "click .miniPagination .prev:not(.not-active)": "prevMiniPage",
                "click .miniPagination .first:not(.not-active)": "firstMiniPage",
                "click .miniPagination .last:not(.not-active)": "lastMiniPage",

                "click .miniPaginationPersons .nextPersons:not(.not-active)": "nextMiniPagePersons",
                "click .miniPaginationPersons .prevPersons:not(.not-active)": "prevMiniPagePersons",
                "click .miniPaginationPersons .firstPersons:not(.not-active)": "firstMiniPagePersons",
                "click .miniPaginationPersons .lastPersons:not(.not-active)": "lastMiniPagePersons"

            },
			nextMiniPagePersons:function(){
				this.pageMiniPersons +=1;
				this.renderMiniPersons();
			},
			prevMiniPagePersons:function(){
				this.pageMiniPersons -=1;
				this.renderMiniPersons();
			},
			firstMiniPagePersons:function(){
				this.pageMiniPersons=1;
				this.renderMiniPersons();
			},
			lastMiniPagePersons:function(){
				this.pageMiniPersons = this.allPagesPersons;
				this.renderMiniPersons();
			},

			nextMiniPage:function(){
				this.pageMini +=1;
				this.renderMiniOpp();
			},
			prevMiniPage:function(){
				this.pageMini -=1;
				this.renderMiniOpp();
			},
			firstMiniPage:function(){
				this.pageMini=1;
				this.renderMiniOpp();
			},
			lastMiniPage:function(){
				this.pageMini = this.allPages;
				this.renderMiniOpp();
			},
			populatePersonsForMiniView:function (url, companyId, page, count, onlyCount, callback) {
				var self = this;
				dataService.getData(url, {companyId:companyId, page:page,count:count,onlyCount:onlyCount }, function (response) {
					if (callback) callback(response);
				});
			},
			renderMiniPersons:function(){
				var self = this;
            	var formModel = this.formModel.toJSON();
				$("#persons").closest(".form").remove();
				this.populatePersonsForMiniView("/getPersonsForMiniView",formModel._id, this.pageMiniPersons,this.pageCountPersons,false,function(collection){
					var isLast = self.pageMiniPersons==self.allPagesPersons?true:false
					self.$el.find('.formRightColumn').append(
                        new personsCompactContentView({
                            collection: collection.data,
                        }).render({first:self.pageMiniPersons==1?true:false,last:isLast,all:self.allPagesPersons}).el
                    );
				});
			},           
			renderMiniOpp:function(){
				var self = this;
            	var formModel = this.formModel.toJSON();
				$("#opportunities").closest(".form").remove();
				common.populateOpportunitiesForMiniView("/OpportunitiesForMiniView",formModel._id, formModel._id,this.pageMini,this.pageCount,false,function(collection){
					var isLast = self.pageMini==self.allPages?true:false
					self.$el.find('.formRightColumn').prepend(
                        new opportunitiesCompactContentView({
                            collection: collection.data,
                        }).render({first:self.pageMini==1?true:false,last:isLast,all:self.allPages}).el
                    );
				});
			},            
            render: function () {
                var formModel = this.formModel.toJSON();
                this.$el.html(_.template(CompaniesFormTemplate, formModel));
				this.$el.find('.formRightColumn').empty();
				this.renderMiniOpp();
				this.renderMiniPersons();
/*                this.$el.find('.formRightColumn').append(
                                new opportunitiesCompactContentView({
                                    collection: this.opportunitiesCollection,
                                    companiesCollection: this.collection,
                                    personsCollection: this.personsCollection,
                                    model: this.formModel
                                }).render().el,
                            );*/
                this.$el.find('.formLeftColumn').append(
                        new noteView({
                            model: this.formModel
                        }).render().el
                    );
                return this;
            },
            
            editItem: function () {
                //create editView in dialog here
                new EditView({ model: this.formModel });
            },
            
            quickEdit: function (e) {
                // alert(e.target.id);
                $("#" + e.target.id).append('<span id="editSpan" class=""><a href="#">Edit</a></span>');
            },
            
            addOpportunities: function (e) {
            	e.preventDefault();
            	var model = this.formModel.toJSON();
            	new CreateViewOpportunities({model:model});
            },
            
            addPersons: function (e) {
            	e.preventDefault();
            	var model = this.formModel.toJSON();
            	new CreateViewPersons({model:model});
            },
            
            removeEdit: function (e) {
                $('#editSpan').remove();
            },
            
            cancelClick: function (e) {
                e.preventDefault();
                var parent = $(e.target).parent().parent();
                $("#" + parent[0].id).removeClass('quickEdit');
                $("#" + parent[0].id).text(this.text);
                $('#editInput').remove();
                $('#cancelSpan').remove();
                $('#saveSpan').remove();
                var currentModel = this.model;
                Backbone.history.navigate("#easyErp/Companies/form/" + currentModel.id, { trigger: true });
            },

            editClick: function (e) {
                e.preventDefault();

                $('.quickEdit #editInput').remove();
                $('.quickEdit #cancelSpan').remove();
                $('.quickEdit #saveSpan').remove();
                $('.quickEdit').text(this.text).removeClass('quickEdit');

                var parent = $(e.target).parent().parent();
                $("#" + parent[0].id).addClass('quickEdit');
                $('#editSpan').remove();
                this.text = $('#' + parent[0].id).text();
                $("#" + parent[0].id).text('');
                $("#" + parent[0].id).append('<input id="editInput" maxlength="20" type="text" class="left"/>');
                $('#editInput').val(this.text);
                $("#" + parent[0].id).append('<span id="cancelSpan" class="right"><a href="#">Cancel</a></span>');
                $("#" + parent[0].id).append('<span id="saveSpan" class="right"><a href="#">Save</a></span>');
            },
			saveCheckboxChange:function(e){
                var parent = $(e.target).parent();
                var objIndex = parent[0].id.split('_');
                var obj = {};
                var currentModel = this.model;

                if ((objIndex.length > 1) && $("#" + parent[0].id).hasClass('with-checkbox')){
                    obj = this.formModel.get(objIndex[0]);
                    obj[objIndex[1]] = ($("#" + parent[0].id + " input").prop("checked"));
					this.formModel.set(obj);
					this.formModel.save({}, {
						headers: {
							mid: 39
						},
						success: function () {
							Backbone.history.navigate("#easyErp/Companies/form/" + currentModel.id, { trigger: true });
						}
					});
				}
			},

            saveClick: function (e) {
                e.preventDefault();

                var parent = $(event.target).parent().parent();
                var objIndex = parent[0].id.split('_');
                var obj = {};
                var currentModel = this.model;
                if (objIndex.length > 1) {
                    obj = this.formModel.get(objIndex[0]);
                    obj[objIndex[1]] = $('#editInput').val();
                } else if (objIndex.length == 1) {
                    obj[objIndex[0]] = $('#editInput').val();
                }
                this.text = $('#editInput').val();
                $("#" + parent[0].id).text(this.text);
                $("#" + parent[0].id).removeClass('quickEdit');
                $('#editInput').remove();
                $('#cancelSpan').remove();
                $('#saveSpan').remove();
                this.formModel.set(obj);

                this.formModel.save({}, {
                    headers: {
                        mid: 39
                    },
                    success: function () {
                        Backbone.history.navigate("#easyErp/Companies/form/" + currentModel.id, { trigger: true });
                    }
                });
            },


            cancelNote: function (e) {
                $('#noteArea').val('');
                $('#noteTitleArea').val('');
                $('#getNoteKey').attr("value", '');
            },
            editDelNote: function (e) {
                var id = e.target.id;
                var k = id.indexOf('_');
                var type = id.substr(0, k);
                var id_int = id.substr(k + 1);

                var currentModel = this.formModel;
                var notes = currentModel.get('notes');

                switch (type) {
                    case "edit": {
                        $('#noteArea').val($('#' + id_int).find('.noteText').text());
                        $('#noteTitleArea').val($('#' + id_int).find('.noteTitle').text());
                        $('#getNoteKey').attr("value", id_int);
                        break;
                    }
                    case "del": {

                        var new_notes = _.filter(notes, function (note) {
                            if (note._id != id_int) {
                                return note;
                            }
                        });
                        currentModel.set('notes', new_notes);
                        currentModel.save({},
                                {
                                    headers: {
                                        mid: 39,
                                        remove: true
                                    },
                                    success: function (model, response, options) {
                                        $('#' + id_int).remove();
                                    }
                                });
                        break;
                    }
                }
            },

            addNote: function (e) {
                var val = $('#noteArea').val().replace(/</g,"&#60;").replace(/>/g,"&#62;");
                var title = $('#noteTitleArea').val().replace(/</g,"&#60;").replace(/>/g,"&#62;");
                if (val || title) {
                    var currentModel = this.formModel;
                    var notes = currentModel.get('notes');
                    var arr_key_str = $('#getNoteKey').attr("value");
                    var note_obj = {
                        note: '',
                        title: ''
                    };
                    if (arr_key_str) {
                        var edit_notes = _.filter(notes, function (note) {
                            if (note._id == arr_key_str) {
                                note.note = val;
                                note.title = title;
                                return note;
                            }
                        });
                        currentModel.save({},
                                   {
                                       headers: {
                                           mid: 39
                                       },
                                       success: function (model, response, options) {
                                           $('#noteBody').val($('#' + arr_key_str).find('.noteText').html(val));
                                           $('#noteBody').val($('#' + arr_key_str).find('.noteTitle').html(title));
                                           $('#getNoteKey').attr("value", '');
                                       }
                                   });
                    } else {

                        note_obj.note = val;
                        note_obj.title = title;
                        notes.push(note_obj);
                        currentModel.set('notes', notes);
                        currentModel.save({},
                                    {
                                        headers: {
                                            mid: 39
                                        },
                                        success: function (model, response, options) {
                                            var key = notes.length - 1;
                                            var notes_data = response.notes;
                                            var date = common.utcDateToLocaleDate(response.notes[key].date);
                                            var author = currentModel.get('name').first;
                                            var id = response.notes[key]._id;
                                            $('#noteBody').prepend(_.template(addNoteTemplate, { val: val, title: title, author: author, data: notes_data, date: date, id: id }));

                                        }
                                    });

                    }
                    $('#noteArea').val('');
                    $('#noteTitleArea').val('');
                }
            },
            
            addAttach: function (event) {
                event.preventDefault();
                var currentModel = this.formModel;
                var currentModelID = currentModel["id"];
                var addFrmAttach = $("#addAttachments");
                var addInptAttach = $("#inputAttach")[0].files[0];
                if(!this.fileSizeIsAcceptable(addInptAttach)){
                    alert('File you are trying to attach is too big. MaxFileSize: ' + App.File.MaxFileSizeDisplay);
                    return;
                }
                addFrmAttach.submit(function (e) {
                    var bar = $('.bar');
                    var status = $('.status');
                    
                    var formURL = "http://" + window.location.host + "/uploadFiles";
                    e.preventDefault();
                    addFrmAttach.ajaxSubmit({
                        url: formURL,
                        type: "POST",
                        processData: false,
                        contentType: false,
                        data: [addInptAttach],

                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("id", currentModelID);
                            status.show();
                            var statusVal = '0%';
                            bar.width(statusVal);
                            status.html(statusVal);
                        },
                        
                        uploadProgress: function(event, position, total, statusComplete) {
                            var statusVal = statusComplete + '%';
                            bar.width(statusVal);
                            status.html(statusVal);
                        },
                         
                        success: function (data) {
                            var attachments = currentModel.get('attachments');
                            var date = common.utcDateToLocaleDate(data.uploadDate);
                            attachments.push(data);
                            $('.attachContainer').prepend(_.template(addAttachTemplate, { data: data, date: date }));
                            console.log('Attach file');
                            addFrmAttach[0].reset();
                            status.hide();
                        },

                        error: function () {
                            console.log("Attach file error");
                        }
                    });
                });
                addFrmAttach.submit();
                addFrmAttach.off('submit');
            },

            fileSizeIsAcceptable: function(file){
                if(!file){return false;}
                return file.size < App.File.MAXSIZE;
            },
            deleteAttach: function (e) {
                var id = e.target.id;
                var currentModel = this.formModel;
                var attachments = currentModel.get('attachments');
                var new_attachments = _.filter(attachments, function (attach) {
                    if (attach._id != id) {
                        return attach;
                    }
                });
                currentModel.set('attachments', new_attachments);
                currentModel.save({},
                        {
                            headers: {
                                mid: 39
                            },

                            success: function (model, response, options) {
                                $('.attachFile_' + id).remove();
                            }
                        });
            },

            toggle: function () {
                this.$('#details').animate({
                    height: "toggle"
                }, 250, function () {

                });
            },
            socialActive: function (e) {
                e.preventDefault();
                $(e.target).stop().animate({
                    'background-position-y': '-38px'

                }, 300, function () { });
            },
            socialNotActive: function (e) {
                e.preventDefault();
                $(e.target).stop().animate({
                    'background-position-y': '0px'

                }, 300, function () { });
            },
            switchTab: function (e) {
                e.preventDefault();
                var link = this.$("#tabList a");
                if (link.hasClass("selected")) {
                    link.removeClass("selected");
                }
                var index = link.index($(e.target).addClass("selected"));
                this.$(".tab").hide().eq(index).show();
            },

            deleteItems: function () {
                var mid = 39;
                   
                this.formModel.destroy({
                    headers: {
                        mid: mid
                    },
                    success: function () {
                        Backbone.history.navigate("#easyErp/Companies/list", { trigger: true });
                    }
                });

            }
        });

        return FormCompaniesView;
    });
