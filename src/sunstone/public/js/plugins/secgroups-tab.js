/* -------------------------------------------------------------------------- */
/* Copyright 2002-2014, OpenNebula Project (OpenNebula.org), C12G Labs        */
/*                                                                            */
/* Licensed under the Apache License, Version 2.0 (the "License"); you may    */
/* not use this file except in compliance with the License. You may obtain    */
/* a copy of the License at                                                   */
/*                                                                            */
/* http://www.apache.org/licenses/LICENSE-2.0                                 */
/*                                                                            */
/* Unless required by applicable law or agreed to in writing, software        */
/* distributed under the License is distributed on an "AS IS" BASIS,          */
/* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   */
/* See the License for the specific language governing permissions and        */
/* limitations under the License.                                             */
/* -------------------------------------------------------------------------- */

/* ---------------- SecurityGroup tab plugin ---------------- */


//Prepares the dialog to create
function initialize_create_security_group_dialog(dialog){
    setupTips(dialog);

    dialog.on("change", '.security_group_rule_network_sel', function(){
        switch ($(this).val()) {
        case "ANY":
            $('.security_group_rule_network',dialog).hide();
            $('.vnet_select',dialog).hide();
            break;
        case "NETWORK":
            $('.security_group_rule_network',dialog).show();
            $('.vnet_select',dialog).hide();
            break;
        case "VNET":
            $('.security_group_rule_network',dialog).hide();
            $('.vnet_select',dialog).show();

            refreshVNetTableSelect(dialog, "new_sg_rule");

            break;
        };
    });

    dialog.on("change", '.security_group_rule_range_sel', function(){
        switch ($(this).val()) {
        case "ALL":
            $('.security_group_rule_range', dialog).hide();
            break;
        case "RANGE":
            $('.security_group_rule_range', dialog).show();
            break;
        };
    });

    $(".add_security_group_rule", dialog).on("click", function(){
        var rule = {};

        rule["PROTOCOL"] = $(".security_group_rule_protocol", dialog).val();
        rule["RULE_TYPE"] = $(".security_group_rule_type", dialog).val();

        switch ($('.security_group_rule_range_sel', dialog).val()) {
        case "ALL":
            // TODO
            break;
        case "RANGE":
            rule["RANGE"] = $(".security_group_rule_range input", dialog).val();
            break;
        }

        switch ($('.security_group_rule_network_sel', dialog).val()) {
        case "ANY":
            // TODO
            break;
        case "NETWORK":
            rule["IP"] = $('#security_group_rule_first_ip', dialog).val();
            rule["SIZE"] = $('#security_group_rule_size', dialog).val();
            break;
        case "VNET":
            rule["NETWORK_ID"] = retrieveVNetTableSelect(dialog, "new_sg_rule");
            break;
        }

        rule["ICMP_TYPE"] = $(".security_group_rule_icmp_type", dialog).val();


        // TODO: create generic method to show rules table

        function td(attr){
            return '<td>'+ (attr ? attr : '') +'</td>';
        }

        var text = rule_to_st(rule);

        $(".security_group_rules tbody").append(
            '<tr>\
              <td>'+text.PROTOCOL+'</td>\
              <td>'+text.RULE_TYPE+'</td>\
              <td>'+text.RANGE+'</td>\
              <td>'+text.NETWORK+'</td>\
              <td>'+text.ICMP_TYPE+'</td>\
              <td>\
                  <a href="#"><i class="fa fa-times-circle remove-tab"></i></a>\
              </td>\
            </tr>');

        // Add data to tr element
        $(".security_group_rules tbody").children("tr").last().data("rule", rule);

        // Reset new rule fields
        $('#new_rule_wizard select option', dialog).prop('selected', function() {
            return this.defaultSelected;
        });

        $('#new_rule_wizard select', dialog).trigger("change");

        $('#new_rule_wizard input', dialog).val("");

        resetResourceTableSelect(dialog, "new_sg_rule");
    });

    dialog.on("click", ".security_group_rules i.remove-tab", function(){
        var tr = $(this).closest('tr');
        tr.remove();
    });

    setupVNetTableSelect(dialog, "new_sg_rule");

    dialog.foundation();

    $('#new_rule_wizard select', dialog).trigger("change");

    $('#create_security_group_form_wizard',dialog).on('invalid', function () {
        notifyError(tr("One or more required fields are missing or malformed."));
        popFormDialog("create_security_group_form", $("#secgroup-tab"));
    }).on('valid', function() {
        if ($('#create_security_group_form_wizard',dialog).attr("action") == "create") {
            security_group_json = generate_json_security_group_from_form(this);
            Sunstone.runAction("SecurityGroup.create",security_group_json);
            return false;
        }
    });
}

function generate_json_security_group_from_form(dialog) {
    var name = $('#security_group_name', dialog).val();
    var description = $('#security_group_description', dialog).val();

    var rules =  [];

    $(".security_group_rules tbody tr").each(function(){
        rules.push($(this).data("rule"));
    });

    var security_group_json =
    { 
        "security_group" :
        {
            "name" : name,
            "description": description,
            "rule" : rules
        }
    };

    return security_group_json;
}

function icmp_to_st(icmp_type){
    switch( parseInt(icmp_type) ){
        case 0:   return "0: Echo Reply";
        case 3:   return "3: Destination Unreachable";
        case 4:   return "4: Source Quench";
        case 5:   return "5: Redirect";
        case 6:   return "6: Alternate Host Address";
        case 8:   return "8: Echo";
        case 9:   return "9: Router Advertisement";
        case 10:  return "10: Router Solicitation";
        case 11:  return "11: Time Exceeded";
        case 12:  return "12: Parameter Problem";
        case 13:  return "13: Timestamp";
        case 14:  return "14: Timestamp Reply";
        case 15:  return "15: Information Request";
        case 16:  return "16: Information Reply";
        case 17:  return "17: Address Mask Request";
        case 18:  return "18: Address Mask Reply";
        case 30:  return "30: Traceroute";
        case 31:  return "31: Datagram Conversion Error";
        case 32:  return "32: Mobile Host Redirect";
        case 33:  return "33: IPv6 Where-Are-You";
        case 34:  return "34: IPv6 I-Am-Here";
        case 35:  return "35: Mobile Registration Request";
        case 36:  return "36: Mobile Registration Reply";
        case 37:  return "37: Domain Name Request";
        case 38:  return "38: Domain Name Reply";
        case 39:  return "39: SKIP";
        case 40:  return "40: Photuris";
        case 41:  return "41: ICMP messages utilized by experimental mobility protocols such as Seamoby";
        case 253: return "253: RFC3692-style Experiment 1";
        case 254: return "254: RFC3692-style Experiment 2";
        default:  return "" + icmp_type;
    }
}

/*
Returns an object with the human readable attributes of the rule. List of attributes:
PROTOCOL
RULE_TYPE
ICMP_TYPE
RANGE
NETWORK
*/
function rule_to_st(rule){
    var text = {};

    if(rule.PROTOCOL != undefined){
        switch(rule.PROTOCOL.toUpperCase()){
        case "TCP":
            text["PROTOCOL"] = tr("TCP");
            break;
        case "UDP":
            text["PROTOCOL"] = tr("UDP");
            break;
        case "ICMP":
            text["PROTOCOL"] = tr("ICMP");
            break;
        case "IPSEC":
            text["PROTOCOL"] = tr("IPsec");
            break;
        default:
            text["PROTOCOL"] = "";
        }
    } else {
        text["PROTOCOL"] = "";
    }

    if(rule.RULE_TYPE != undefined){
        switch(rule.RULE_TYPE.toUpperCase()){
        case "OUTBOUND":
            text["RULE_TYPE"] = tr("Outbound");
            break;
        case "INBOUND":
            text["RULE_TYPE"] = tr("Inbound");
            break;
        default:
            text["RULE_TYPE"] = "";
        }
    } else {
        text["RULE_TYPE"] = "";
    }

    if(rule.ICMP_TYPE != undefined){
        text["ICMP_TYPE"] = icmp_to_st(rule.ICMP_TYPE);
    } else {
        text["ICMP_TYPE"] = "";
    }

    if(rule.RANGE != undefined && rule.RANGE != ""){
        text["RANGE"] = rule.RANGE;
    } else {
        text["RANGE"] = tr("All");
    } 

    var network = "";

    if(rule.NETWORK_ID != undefined && rule.NETWORK_ID != ""){
        network += (tr("Virtual Network") + " " + rule.NETWORK_ID);
    }

    if(rule.SIZE != undefined && rule.SIZE != ""){
        if(network != ""){
            network += ":<br>";
        }
 
        if(rule.IP != undefined && rule.IP != ""){
            network += tr("Start") + ": " + rule.IP + ", ";
        } else if(rule.MAC != undefined && rule.MAC != ""){
            network += tr("Start") + ": " + rule.MAC + ", ";
        }

        network += tr("Size") + ": " + rule.SIZE;
    }

    if(network == ""){
        network = tr("Any");
    }

    text["NETWORK"] = network;

    return text;
}

// Security Group clone dialog
function setupSecurityGroupCloneDialog(){
    //Append to DOM
    dialogs_context.append('<div id="security_group_clone_dialog""></div>');
    var dialog = $('#security_group_clone_dialog',dialogs_context);

    //Put HTML in place

    var html = '<div class="row">\
        <h3 class="subheader">'+tr("Clone Security Group")+'</h3>\
      </div>\
      <form>\
      <div class="row">\
        <div class="large-12 columns">\
          <div class="clone_one"></div>\
          <div class="clone_several">'+tr("Several security groups are selected, please choose a prefix to name the new copies")+'<br></div>\
        </div>\
      </div>\
      <div class="row">\
        <div class="large-12 columns">\
          <label class="clone_one">'+tr("Name")+'</label>\
          <label class="clone_several">'+tr("Prefix")+'</label>\
          <input type="text" name="name"></input>\
        </div>\
      </div>\
      <div class="form_buttons row">\
        <button class="button radius right" id="security_group_clone_button" value="SecurityGroup.clone">\
      '+tr("Clone")+'\
        </button>\
              </div>\
      <a class="close-reveal-modal">&#215;</a>\
      </form>\
      ';


    dialog.html(html);
    dialog.addClass("reveal-modal").attr("data-reveal", "");

    $('form',dialog).submit(function(){
        var name = $('input', this).val();
        var sel_elems = securityGroupElements();
        if (!name || !sel_elems.length)
            notifyError('A name or prefix is needed!');
        if (sel_elems.length > 1){
            for (var i=0; i< sel_elems.length; i++)
                //use name as prefix if several items selected
                Sunstone.runAction('SecurityGroup.clone',
                                   sel_elems[i],
                                   name+getSecurityGroupName(sel_elems[i]));
        } else {
            Sunstone.runAction('SecurityGroup.clone',sel_elems[0],name)
        };
        $(this).parents('#security_group_clone_dialog').foundation('reveal', 'close')
        setTimeout(function(){
            Sunstone.runAction('SecurityGroup.refresh');
        }, 1500);
        return false;
    });
}

function popUpSecurityGroupCloneDialog(){
    var dialog = $('#security_group_clone_dialog');
    var sel_elems = securityGroupElements();
    //show different text depending on how many elements are selected
    if (sel_elems.length > 1){
        $('.clone_one',dialog).hide();
        $('.clone_several',dialog).show();
        $('input',dialog).val('Copy of ');
    }
    else {
        $('.clone_one',dialog).show();
        $('.clone_several',dialog).hide();
        $('input',dialog).val('Copy of '+getSecurityGroupName(sel_elems[0]));
    };

    $(dialog).foundation().foundation('reveal', 'open');
    $("input[name='name']",dialog).focus();
}


var create_security_group_wizard_html =
'<form data-abide="ajax" id="create_security_group_form_wizard" action="">\
  <div class="row">\
    <div class="medium-4 columns">\
      <label for="security_group_name">'+tr("Security Group Name")+':</label>\
      <input type="text" name="security_group_name" id="security_group_name" />\
    </div>\
    <div class="medium-8 columns">\
      <label for="security_group_description">'+tr("Description")+'\
        <span class="tip">'+tr("Description for the Security Group")+'</span>\
      </label>\
      <textarea type="text" id="security_group_description" name="security_group_description" style="height: 70px;"/>\
    </div>\
  </div>\
  <hr/>\
  <div class="row" id="new_rule_wizard">\
    <div class="medium-4 columns">\
      <label>'+tr("Protocol")+'\
        <span class="tip">'+tr("TODO")+'</span>\
      </label>\
      <select class="security_group_rule_protocol">\
        <option value="TCP" selected="selected">'+tr("TCP")+'</option>\
        <option value="UDP">'+tr("UDP")+'</option>\
        <option value="ICMP">'+tr("ICMP")+'</option>\
        <option value="IPSEC">'+tr("IPsec")+'</option>\
      </select>\
      <label>'+tr("Type")+'\
        <span class="tip">'+tr("TODO")+'</span>\
      </label>\
      <select class="security_group_rule_type">\
        <option value="inbound" selected="selected">'+tr("Inbound")+'</option>\
        <option value="outbound">'+tr("Outbound")+'</option>\
      </select>\
      <label>'+tr("ICMP Type")+'\
        <span class="tip">'+tr("TODO")+'</span>\
      </label>\
      <input class="security_group_rule_icmp_type" type="text"/>\
    </div>\
    <div class="medium-8 columns">\
      <div class="row">\
        <div class="small-6 columns">\
          <label>'+tr("Range")+'\
            <span class="tip">'+tr("TODO")+'</span>\
          </label>\
          <select class="security_group_rule_range_sel">\
            <option value="ALL" selected="selected">'+tr("All")+'</option>\
            <option value="RANGE">'+tr("Range")+'</option>\
          </select>\
        </div>\
        <div class="small-6 columns security_group_rule_range">\
          <label>'+tr("Iptables range")+'\
            <span class="tip">'+tr("TODO")+'</span>\
          </label>\
          <input type="text"/>\
        </div>\
      </div>\
      <div class="row">\
        <div class="small-6 columns">\
          <label>'+tr("Network")+'\
            <span class="tip">'+tr("TODO")+'</span>\
          </label>\
          <select class="security_group_rule_network_sel">\
            <option value="ANY" selected="selected">'+tr("Any")+'</option>\
            <option value="NETWORK">'+tr("Network")+'</option>\
            <option value="VNET">'+tr("Virtual Network")+'</option>\
          </select>\
        </div>\
      </div>\
      <div class="row security_group_rule_network">\
        <div class="small-6 columns">\
          <label for="security_group_rule_first_ip">'+tr("IP Start")+':\
            <span class="tip">'+tr("First IP address")+'</span>\
          </label>\
          <input id="security_group_rule_first_ip" type="text"/>\
        </div>\
        <div class="small-6 columns">\
          <label for="security_group_rule_size">'+tr("Size")+':\
            <span class="tip">'+tr("Number of addresses in the range")+'</span>\
          </label>\
          <input id="security_group_rule_size" type="text"/>\
        </div>\
      </div>\
      <div class="row vnet_select">\
        '+generateVNetTableSelect("new_sg_rule")+'\
        </br>\
      </div>\
    </div>\
  </div>\
  <div class="row">\
    <div class="medium-8 small-centered columns">\
      <a type="button" class="add_security_group_rule button small small-12 secondary radius"><i class="fa fa-angle-double-down"></i> '+tr("Add Rule")+'</a>\
    </div>\
  </div>\
  <div class="row">\
    <div class="large-12 columns">\
      <table class="security_group_rules policies_table dataTable">\
        <thead>\
          <tr>\
            <th>'+tr("Protocol")+'</th>\
            <th>'+tr("Type")+'</th>\
            <th>'+tr("Range")+'</th>\
            <th>'+tr("Network")+'</th>\
            <th>'+tr("ICMP Type")+'</th>\
            <th style="width:3%"></th>\
          </tr>\
        </thead>\
        <tbody>\
        </tbody>\
      </table>\
    </div>\
  </div>\
</form>';

var dataTable_security_groups;
var $create_security_group_dialog;

//Setup actions
var security_group_actions = {

    "SecurityGroup.create" : {
        type: "create",
        call: OpenNebula.SecurityGroup.create,
        callback: function(request, response){
            $("a[href=back]", $("#secgroups-tab")).trigger("click");
            popFormDialog("create_security_group_form", $("#secgroups-tab"));

            addSecurityGroupElement(request, response);
            notifyCustom(tr("Security Group created"), " ID: " + response.SECURITY_GROUP.ID, false);
        },
        error: function(request, response){
            popFormDialog("create_security_group_form", $("#secgroups-tab"));
            onError(request, response);
        }
    },

    "SecurityGroup.create_dialog" : {
        type: "custom",
        call: function(){
          Sunstone.popUpFormPanel("create_security_group_form", "secgroups-tab", "create", true);
        }
    },

    "SecurityGroup.list" : {
        type: "list",
        call: OpenNebula.SecurityGroup.list,
        callback: updateSecurityGroupsView,
        error: onError
    },

    "SecurityGroup.show" : {
        type: "single",
        call: OpenNebula.SecurityGroup.show,
        callback: function(request, response){
            var tab = dataTable_security_groups.parents(".tab");

            if (Sunstone.rightInfoVisible(tab)) {
                // individual view
                updateSecurityGroupInfo(request, response);
            }

            // datatable row
            updateSecurityGroupElement(request, response);
        },
        error: onError
    },

    "SecurityGroup.refresh" : {
        type: "custom",
        call: function(){
          var tab = dataTable_security_groups.parents(".tab");
          if (Sunstone.rightInfoVisible(tab)) {
            Sunstone.runAction("SecurityGroup.show", Sunstone.rightInfoResourceId(tab))
          } else {
            waitingNodes(dataTable_security_groups);
            Sunstone.runAction("SecurityGroup.list", {force: true});
          }
        },
        error: onError
    },

    "SecurityGroup.delete" : {
        type: "multiple",
        call : OpenNebula.SecurityGroup.del,
        callback : deleteSecurityGroupElement,
        elements: securityGroupElements,
        error : onError,
        notify:true
    },

    "SecurityGroup.update_template" : {  // Update template
        type: "single",
        call: OpenNebula.SecurityGroup.update,
        callback: function(request,response){
           Sunstone.runAction('SecurityGroup.show',request.request.data[0][0]);
        },
        error: onError
    },

    "SecurityGroup.chown" : {
        type: "multiple",
        call: OpenNebula.SecurityGroup.chown,
        callback: function(req) {
          Sunstone.runAction("SecurityGroup.show",req.request.data[0]);
        },
        elements: securityGroupElements,
        error:onError
    },

    "SecurityGroup.chgrp" : {
        type: "multiple",
        call: OpenNebula.SecurityGroup.chgrp,
        callback: function(req) {
          Sunstone.runAction("SecurityGroup.show",req.request.data[0]);
        },
        elements: securityGroupElements,
        error:onError
    },

    "SecurityGroup.chmod" : {
        type: "single",
        call: OpenNebula.SecurityGroup.chmod,
        callback: function(req) {
          Sunstone.runAction("SecurityGroup.show",req.request.data[0][0]);
        },
        error: onError
    },

    "SecurityGroup.clone_dialog" : {
        type: "custom",
        call: popUpSecurityGroupCloneDialog
    },

    "SecurityGroup.clone" : {
        type: "single",
        call: OpenNebula.SecurityGroup.clone,
        error: onError,
        notify: true
    },

    "SecurityGroup.rename" : {
        type: "single",
        call: OpenNebula.SecurityGroup.rename,
        callback: function(request) {
            notifyMessage(tr("Security Group renamed correctly"));
            Sunstone.runAction('SecurityGroup.show',request.request.data[0][0]);
        },
        error: onError,
        notify: true
    }
};

var security_group_buttons = {
    "SecurityGroup.refresh" : {
        type: "action",
        layout: "refresh",
        alwaysActive: true
    },
    "SecurityGroup.create_dialog" : {
        type: "create_dialog",
        layout: "create"
    },

    "SecurityGroup.chown" : {
        type: "confirm_with_select",
        text: tr("Change owner"),
        layout: "user_select",
        select: "User",
        tip: tr("Select the new owner")+":",
        condition: mustBeAdmin
    },
    "SecurityGroup.chgrp" : {
        type: "confirm_with_select",
        text: tr("Change group"),
        layout: "user_select",
        select: "Group",
        tip: tr("Select the new group")+":",
        condition: mustBeAdmin
    },
    "SecurityGroup.clone_dialog" : {
        type: "action",
        layout: "main",
        text: tr("Clone")
    },
    "SecurityGroup.delete" : {
        type: "confirm",
        layout: "del",
        text: tr("Delete")
    }
};

var security_groups_tab = {
    title: tr("Security Groups"),
    resource: 'SecurityGroup',
    buttons: security_group_buttons,
    tabClass: "subTab",
    parentTab: "infra-tab",
    search_input: '<input id="security_group_search" type="text" placeholder="'+tr("Search")+'" />',
    list_header: '<i class="fa fa-fw fa-shield"></i>&emsp;'+tr("Security Groups"),
    info_header: '<i class="fa fa-fw fa-shield"></i>&emsp;'+tr("Security Group"),
    subheader: '<span/> <small></small>&emsp;',
    table: '<table id="datatable_security_groups" class="datatable twelve">\
      <thead>\
        <tr>\
          <th class="check"><input type="checkbox" class="check_all" value=""></input></th>\
          <th>' + tr("ID")   + '</th>\
          <th>' + tr("Owner")+ '</th>\
          <th>' + tr("Group")+ '</th>\
          <th>' + tr("Name") + '</th>\
        </tr>\
      </thead>\
      <tbody id="tbodysecurity_groups">\
      </tbody>\
    </table>',
    forms: {
      "create_security_group_form": {
        actions: {
          create: {
            title: tr("Create Security Group"),
            submit_text: tr("Create")
          }
        },
        wizard_html: create_security_group_wizard_html,
//        advanced_html: create_security_group_advanced_html,
        setup: initialize_create_security_group_dialog
      }
    }
};

var security_group_info_panel = {
    "security_group_info_tab" : {
        title: tr("Security Group information"),
        content:""
    }
};

Sunstone.addActions(security_group_actions);
Sunstone.addMainTab('secgroups-tab',security_groups_tab);
Sunstone.addInfoPanel("security_group_info_panel",security_group_info_panel);

//return lists of selected elements in security_group list
function securityGroupElements(){
    return getSelectedNodes(dataTable_security_groups);
}

function securityGroupElementArray(element_json){

    var element = element_json.SECURITY_GROUP;

    return [
        '<input class="check_item" type="checkbox" id="security_group_'+element.ID+'" name="selected_items" value="'+element.ID+'"/>',
        element.ID,
        element.UNAME,
        element.GNAME,
        element.NAME
    ];
}

//callback for an action affecting a security_group element
function updateSecurityGroupElement(request, element_json){
    var id = element_json.SECURITY_GROUP.ID;
    var element = securityGroupElementArray(element_json);
    updateSingleElement(element,dataTable_security_groups,'#security_group_'+id);
}

//callback for actions deleting a security_group element
function deleteSecurityGroupElement(req){
    deleteElement(dataTable_security_groups,'#security_group_'+req.request.data);
    $('div#security_group_tab_'+req.request.data,main_tabs_context).remove();
}

//call back for actions creating a security_group element
function addSecurityGroupElement(request,element_json){
    var id = element_json.SECURITY_GROUP.ID;
    var element = securityGroupElementArray(element_json);
    addElement(element,dataTable_security_groups);
}

//callback to update the list of security_groups.
function updateSecurityGroupsView (request,list){
    var list_array = [];

    $.each(list,function(){
        //Grab table data from the list
        list_array.push(securityGroupElementArray(this));
    });

    updateView(list_array,dataTable_security_groups);
};


// Updates the security_group info panel tab content and pops it up
function updateSecurityGroupInfo(request,security_group){
    security_group_info     = security_group.SECURITY_GROUP;
    security_group_template = security_group_info.TEMPLATE;

    stripped_security_group_template = $.extend({}, security_group_info.TEMPLATE);
    delete stripped_security_group_template["RULE"];

    var hidden_values = {RULE: security_group_info.TEMPLATE.RULE};

    //Information tab
    var info_tab = {
        title : tr("Info"),
        icon: "fa-info-circle",
        content :
        '<div class="row">\
        <div class="large-6 columns">\
        <table id="info_security_group_table" class="dataTable extended_table">\
            <thead>\
               <tr><th colspan="3">' + tr("Information") +'</th></tr>\
            </thead>\
            <tbody>\
            <tr>\
                <td class="key_td">' + tr("ID") + '</td>\
                <td class="value_td" colspan="2">'+security_group_info.ID+'</td>\
            </tr>'+
            insert_rename_tr(
                'secgroups-tab',
                "SecurityGroup",
                security_group_info.ID,
                security_group_info.NAME)+
            '</tbody>\
         </table>\
        </div>\
        <div class="large-6 columns">' +
            insert_permissions_table('secgroups-tab',
                                       "SecurityGroup",
                                       security_group_info.ID,
                                       security_group_info.UNAME,
                                       security_group_info.GNAME,
                                       security_group_info.UID,
                                       security_group_info.GID) +
        '</div>\
        </div>\
        <div class="row">\
          <div class="large-9 columns">\
            <table class="dataTable extended_table">\
              <thead>\
                <tr>\
                  <th>'+tr("Rules")+'</th>\
                </tr>\
              </thead>\
            </table>'
            + insert_sg_rules_table(security_group_info) +
         '</div>\
        <div class="row">\
          <div class="large-9 columns">'
                  + insert_extended_template_table(stripped_security_group_template,
                                           "SecurityGroup",
                                           security_group_info.ID,
                                           tr("Attributes"),
                                           hidden_values) +
         '</div>\
        </div>'
    }

    //Sunstone.updateInfoPanelTab(info_panel_name,tab_name, new tab object);
    Sunstone.updateInfoPanelTab("security_group_info_panel","security_group_info_tab",info_tab);

    Sunstone.popUpInfoPanel("security_group_info_panel", "secgroups-tab");

    setPermissionsTable(security_group_info,'');
}

function insert_sg_rules_table(sg){
    var html = 
      '<table class="policies_table dataTable">\
        <thead>\
          <tr>\
            <th>'+tr("Protocol")+'</th>\
            <th>'+tr("Type")+'</th>\
            <th>'+tr("Range")+'</th>\
            <th>'+tr("Network")+'</th>\
            <th>'+tr("ICMP Type")+'</th>\
          </tr>\
        </thead>\
        <tbody>';

    var rules = sg.TEMPLATE.RULE;

    if (!rules) //empty
    {
        rules = [];
    }
    else if (rules.constructor != Array) //>1 lease
    {
        rules = [rules];
    }

    $.each(rules, function(){
        var text = rule_to_st(this);
        html +=
          '<tr>\
            <td>'+text.PROTOCOL+'</td>\
            <td>'+text.RULE_TYPE+'</td>\
            <td>'+text.RANGE+'</td>\
            <td>'+text.NETWORK+'</td>\
            <td>'+text.ICMP_TYPE+'</td>\
          </tr>'
    });


    html +=
        '</tbody>\
      </table>';

    return html;
}

//This is executed after the sunstone.js ready() is run.
//Here we can basicly init the security_group datatable, preload it
//and add specific listeners
$(document).ready(function(){
    var tab_name = "secgroups-tab"

    if (Config.isTabEnabled(tab_name)) {
      //prepare security_group datatable
      dataTable_security_groups = $("#datatable_security_groups",main_tabs_context).dataTable({
          "bSortClasses": false,
          "bDeferRender": true,
          "aoColumnDefs": [
              { "bSortable": false, "aTargets": ["check"] },
              { "sWidth": "35px", "aTargets": [0] },
              { "bVisible": true, "aTargets": Config.tabTableColumns(tab_name)},
              { "bVisible": false, "aTargets": ['_all']}
          ]
      });

      $('#security_group_search').keyup(function(){
        dataTable_security_groups.fnFilter( $(this).val() );
      })

      dataTable_security_groups.on('draw', function(){
        recountCheckboxes(dataTable_security_groups);
      })

      Sunstone.runAction("SecurityGroup.list");

      setupSecurityGroupCloneDialog();

      dialogs_context.append('<div id="create_security_group_dialog"></div>');

      initCheckAllBoxes(dataTable_security_groups);
      tableCheckboxesListener(dataTable_security_groups);
      infoListener(dataTable_security_groups, "SecurityGroup.show");
      dataTable_security_groups.fnSort( [ [1,config['user_config']['table_order']] ] );
    }
});