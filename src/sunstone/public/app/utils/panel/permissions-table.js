define(function(require) {
  /*
    This module insert a row with the name of the resource.
    The row can be edited and a rename action will be sent
   */
  
  var TemplatePermissionsTable = require('hbs!./permissions-table/html');
  var TemplatePermissions = require('hbs!./permissions-table/permissions');
  var TemplateOwner = require('hbs!./permissions-table/owner');
  var TemplateGroup = require('hbs!./permissions-table/group');
  var ResourceSelect = require('utils/resource-select');
  var Sunstone = require('sunstone');
  var Config = require('sunstone-config');

  /*
    Generate the tr HTML with the name of the resource and an edit icon
    @param {String} tabName
    @param {String} resourceType Resource type (i.e: Zone, Host, Image...)
    @param {Object} element OpenNebula object (i.e: element.ID, element.GNAME)
    @returns {String} HTML row
   */
  var _html = function(tabName, resourceType, element) {
    var permissionsHTML = '';
    if (Config.isTabActionEnabled(tabName, resourceType + '.chmod')) {
      permissionsHTML = TemplatePermissions({'element': element})
    }

    var ownerHTML = '';
    if (Config.isTabActionEnabled(tabName, resourceType + '.chown')) {
      ownerHTML = TemplateOwner({'element': element});
    }

    var groupHTML = '';
    if (Config.isTabActionEnabled(tabName, resourceType + '.chgrp')) {
      groupHTML = TemplateGroup({'element': element})
    }

    var permissionsTableHTML = TemplatePermissionsTable({
      'resourceType': resourceType.toLowerCase(),
      'permissionsHTML': permissionsHTML,
      'ownerHTML': ownerHTML,
      'groupHTML': groupHTML
    })

    return permissionsTableHTML;
  };

  /*
    Initialize the row, clicking the edit icon will add an input to edit the name
    @param {String} tabName
    @param {String} resourceType Resource type (i.e: Zone, Host, Image...)
    @param {Object} element OpenNebula object (i.e: element.ID, element.GNAME)
    @param {jQuery Object} context Selector including the tr
   */
  var _setup = function(tabName, resourceType, element, context) {
    var resourceId = element.ID
    if (Config.isTabActionEnabled(tabName, resourceType + '.chmod')) {
      context.off('change', ".permission_check");
      context.on('change', ".permission_check", function() {
        var permissionsOctet = {octet : buildOctet(context)};
        Sunstone.runAction(resourceType + ".chmod", resourceId, permissionsOctet);
      });
    }

    if (Config.isTabActionEnabled(tabName, resourceType + '.chown')) {
        context.off("click", "#div_edit_chg_owner_link");
        context.on("click", "#div_edit_chg_owner_link", function() {
          var tr_context = $(this).parents("tr");
          ResourceSelect.insert("#value_td_owner", context, "User", element.UID, false);
        });

        context.off("change", "#value_td_owner .resource_list_select");
        context.on("change", "#value_td_owner .resource_list_select", function() {
          var newOwnerId = $(this).val();
          if (newOwnerId != "") {
            Sunstone.runAction(resourceType + ".chown", [resourceId], newOwnerId);
          }
        });
    }

    if (Config.isTabActionEnabled(tabName, resourceType + '.chgrp')) {
        context.off("click", "#div_edit_chg_group_link");
        context.on("click", "#div_edit_chg_group_link", function() {
          ResourceSelect.insert("#value_td_group", context, "Group", element.GID, false);
        });

        context.off("change", "#value_td_group .resource_list_select");
        context.on("change", "#value_td_group .resource_list_select", function() {
          var newGroupId = $(this).val();
          if (newGroupId != "") {
            Sunstone.runAction(resourceType + ".chgrp", [resourceId], newGroupId);
          }
        });
    }

    return false;
  }

  //Returns an octet given a permission table with checkboxes
  var _buildOctet = function(context) {
    var owner = 0;
    var group = 0;
    var other = 0;

    if ($('.owner_u', context).is(':checked'))
        owner += 4;
    if ($('.owner_m', context).is(':checked'))
        owner += 2;
    if ($('.owner_a', context).is(':checked'))
        owner += 1;

    if ($('.group_u', context).is(':checked'))
        group += 4;
    if ($('.group_m', context).is(':checked'))
        group += 2;
    if ($('.group_a', context).is(':checked'))
        group += 1;

    if ($('.other_u', context).is(':checked'))
        other += 4;
    if ($('.other_m', context).is(':checked'))
        other += 2;
    if ($('.other_a', context).is(':checked'))
        other += 1;

    return "" + owner + group + other;
  };

  return {
    'html': _html,
    'setup': _setup
  }
});