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
import { superuser } from "superuser";
import React from 'react';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import { apply_modal_dialog, show_modal_dialog } from "cockpit-components-dialog.jsx";

const _ = cockpit.gettext;

function RenameGroupDialogBody({ state, change }) {
    const { name } = state;

    return (
        <Form isHorizontal onSubmit={apply_modal_dialog}>
            <FormGroup fieldId="group-name" hasNoPaddingTop={!superuser.allowed} label={_("Name")}>
                <TextInput id="group-name" onChange={val => change("name", val)} value={name} />
            </FormGroup>
        </Form>
    );
}

export function rename_group_dialog(group) {
    let dlg = null;

    const state = {
        name: group
    };

    function change(field, value) {
        state[field] = value;
        update();
    }

    function update() {
        const props = {
            id: "group-confirm-rename-dialog",
            title: cockpit.format(_("Rename $0"), group),
            body: <RenameGroupDialogBody state={state} change={change} />,
        };

        const footer = {
            actions: [
                {
                    caption: _("Rename"),
                    style: "primary",
                    clicked: () => {
                        return cockpit.spawn(["/usr/sbin/groupmod", group, "--new-name", state.name], { superuser: "try", err: "message" })
                                .then(() => {
                                    cockpit.location.go("#/group/" + state.name);
                                });
                    }
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
