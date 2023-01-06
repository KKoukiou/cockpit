/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import React from 'react';

import { Checkbox, Flex, FlexItem, Form, FormGroup, Popover, TextInput } from '@patternfly/react-core';
import { show_modal_dialog, apply_modal_dialog } from "cockpit-components-dialog.jsx";
import { HelpIcon } from '@patternfly/react-icons';

import { has_errors } from "./dialog-utils.js";

const _ = cockpit.gettext;

function GroupCreateBody({ state, errors, change }) {
    const {
        name, id, user_specified_id_enabled,
    } = state;

    return (
        <Form isHorizontal onSubmit={apply_modal_dialog}>
            <FormGroup label={_("Name")}
                       helperTextInvalid={errors && errors.name}
                       validated={(errors && errors.name) ? "error" : "default"}
                       fieldId="groups-create-name">
                <TextInput id="groups-create-name"
                           validated={(errors && errors.name) ? "error" : "default"}
                           value={name} onChange={value => change("name", value)} />
            </FormGroup>

            <FormGroup label={_("ID")}
                       hasNoPaddingTop
                       helperTextInvalid={errors && errors.id}
                       validated={(errors && errors.id) ? "error" : "default"}
                       isStack
                       fieldId="groups-create-id">
                <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <Checkbox id="new-group-use-custom-id"
                              label={_("Use specific ID")}
                              isChecked={user_specified_id_enabled} onChange={checked => change("user_specified_id_enabled", checked)} />
                    <FlexItem spacer={{ default: 'spacerLg' }}>
                        <Popover bodyContent={_("When not specifying the ID the default is to use the smallest ID value greater than or equal to GID_MIN and greater than every other group.")}
                                 showClose={false}>
                            <HelpIcon />
                        </Popover>
                    </FlexItem>
                </Flex>
                {user_specified_id_enabled && <TextInput id="groups-create-id"
                           validated={(errors && errors.id) ? "error" : "default"}
                           value={id} onChange={value => change("id", value)} />}
            </FormGroup>
        </Form>
    );
}

function is_valid_char_name(c) {
    return (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c >= '0' && c <= '9') ||
        c == '.' || c == '_' || c == '-';
}

function validate_name(name, groups) {
    if (!name)
        return _("No group name specified");

    for (let i = 0; i < name.length; i++) {
        if (!is_valid_char_name(name[i]))
            return _("The group name can only consist of letters from a-z, digits, dots, dashes and underscores.");
    }

    for (let k = 0; k < groups.length; k++) {
        if (groups[k].name == name)
            return _("A group with this name already exists");
    }

    return null;
}

function validate_id(id) {
    if (!id || isNaN(id))
        return _("No valid id specified");
}

export function group_create_dialog(groups, setGroupsCardExpanded) {
    let dlg = null;
    const state = {
        name: "",
        id: "",
    };
    let errors = { };

    function change(field, value) {
        state[field] = value;
        errors = { };

        update();
    }

    function validate(name, id, user_specified_id_enabled) {
        const errs = { };

        errs.name = validate_name(name, groups);
        if (user_specified_id_enabled)
            errs.id = validate_id(id);
        errors = errs;

        return !has_errors(errs);
    }

    function create(name, id, user_specified_id_enabled) {
        const valid = validate(name, id, user_specified_id_enabled);
        if (valid) {
            let group_add_cmd = ["/usr/sbin/groupadd", name];

            if (user_specified_id_enabled)
                group_add_cmd = [...group_add_cmd, "-g", id];

            return cockpit.spawn(group_add_cmd, { superuser: "require" });
        } else {
            update();
            return Promise.reject();
        }
    }

    function update() {
        const props = {
            id: "groups-create-dialog",
            title: _("Create new group"),
            body: <GroupCreateBody state={state} errors={errors} change={change} />
        };

        const footer = {
            actions: [
                {
                    caption: _("Create"),
                    style: "primary",
                    clicked: () => {
                        return create(state.name, state.id, state.user_specified_id_enabled).then(() => setGroupsCardExpanded(true));
                    },
                }
            ]
        };

        if (!dlg)
            dlg = show_modal_dialog(props, footer);
        else {
            dlg.setProps(props);
            dlg.setFooterProps(footer);
        }
    }

    update();
}
