/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/plugin',
    'helpers',
    'xmlEdit/editor',
    'tpl!xmlEditRp/qtiCreator/plugins/panel/tpl/trigger',
    'tpl!xmlEditRp/qtiCreator/plugins/panel/tpl/dialog',
    'tpl!xmlEditRp/qtiCreator/plugins/panel/tpl/notification',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'ui/validator/Validator',
    'css!xmlEditRpCss/editor'
], function($, _, __, pluginFactory, helpers, xmlEditor, buttonTpl, dialogTpl, notificationTpl, xmlRenderer, Validator) {
    'use strict';

    var _ns = '.customRpEditor';

    /**
     * Check if the variables used in the response processing xml exist in the item
     *
     * @param {Object} item
     * @param {String} rpXml
     * @returns {Object} the report object
     */
    function variablesExist(item, rpXml){
        var report = {
            itemVariables : [],
            rpVariables : [],
            missing : []
        };
        var $rp = $(rpXml);
        report.itemVariables = [].concat(_.map(item.responses, function(v){
            return v.id();
        }), _.map(item.outcomes, function(v){
            return v.id();
        }));


        $rp.find('variable,setOutcomeValue').each(function(){
            var id = $(this).attr('identifier');
            report.rpVariables.push(id);
            if(_.indexOf(report.itemVariables, id) === -1){
                report.missing.push(id);
            }
        });

        return report;
    }

    /**
     * Validate the rp xml against qti item model
     *
     * @param {Object} item
     * @param {String} xml
     * @param {Array} annotations
     * @param {Function} successCallback
     * @param {Function} failureCallback
     */
    function validateRpXml(item, xml, annotations, successCallback, failureCallback){

        var messages = [];
        var validator = new Validator([
            {
                name : 'annotations',
                message : __('wrong xml'),
                options : {
                    annotations : annotations
                },
                validate : function(value, callback){
                    var valid = (!annotations || !annotations.length);
                    if(!valid){
                        messages.push('The xml is not valid, please check annotations for errors.');
                    }
                    callback(valid);
                }
            },
            {
                name : 'variables',
                message : __('variable missing'),
                options : {
                    item : item
                },
                validate : function(value, callback){
                    var r = variablesExist(item, xml);
                    var valid = !r.missing.length;
                    if(!valid){
                        _.forEach(r.missing, function(m){
                            messages.push(__('The variable %s does not exist.', m));
                        });
                    }
                    callback(!r.missing.length);
                }
            },
            {
                name : 'xsd',
                message : __('invalid qti xml'),
                options : {
                    item : item
                },
                validate : function(value, callback){
                    $.ajax({
                        url : helpers._url('validate', 'CustomRpEditor', 'xmlEditRp'),
                        type : 'POST',
                        contentType : 'text/xml',
                        dataType : 'json',
                        data : xml
                    }).done(function(r){
                        var valid = r.success;
                        if(!valid){
                            _.forEach(r.errors, function(err){
                                messages.push(__('Invalid QTI xml %s', err.message || err));
                            });
                        }
                        callback(r.success);
                    });
                }
            }
        ]);

        validator.validate(xml, function(){
            if(messages.length){
                failureCallback(messages);
            }else{
                successCallback();
            }
        });
    }

    return pluginFactory({
        name : 'xmlResponseProcessing',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;
            var item = this.getHost().getItem();
            var $container = this.getAreaBroker().getContainer();

            $container.on('initResponseForm' + _ns, function(){
                if(item.responseProcessing.processingType === 'custom'){
                    var $button = $(buttonTpl()).click(function(){

                        var rpXml = xmlRenderer.render(item.responseProcessing);
                        var $modal = $(dialogTpl());
                        $container.append($modal);

                        //when we are sure that media is loaded:
                        $modal.on('opened.modal', function(){

                            var newRpXml;
                            var $notificationContainer = $modal.find('.custom-rp-notification');
                            var $editorContainer = $modal.find('.custom-rp-editor');
                            var $ok = $modal.find('button.done');
                            var editor = xmlEditor.init($editorContainer, {
                                hidden : true,
                                width : '100%',
                                height : 460,
                                zIndex : 301,
                                readonly : false
                            });

                            editor.setValue(rpXml);
                            editor.show();

                            $editorContainer.on('change.xml-editor', function(e, editedRpXml, annotations){

                                validateRpXml(item,  editedRpXml, annotations, function(){

                                    //clear messages
                                    $notificationContainer.empty();

                                    //save current xml to memory
                                    newRpXml = editedRpXml;

                                    //enable done
                                    $ok.removeClass('disabled');

                                }, function(messages){

                                    //clear messages
                                    $notificationContainer.empty();

                                    //show notification
                                    $notificationContainer.append(notificationTpl({messages : messages}));

                                    //disable done
                                    $ok.addClass('disabled');
                                });
                            });

                            $ok.on('click', function(){
                                if(!$ok.hasClass('disabled')){
                                    //save value
                                    item.responseProcessing.xml = newRpXml;

                                    //close modal
                                    $modal.modal('destroy');
                                }
                            });

                        }).modal({
                            startClosed : false,
                            width : 900
                        });

                    });

                    $container.find('#item-editor-response-property-bar').find('select[name=template]').parent('.panel').after($button);
                }
            });
        }
    });
});

