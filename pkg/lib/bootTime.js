/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2015 Red Hat, Inc.
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

import cockpit from "cockpit";
// import * as timeformat from "timeformat";

export const bootTime = { };

bootTime.getTime = function getTime() {
    cockpit.spawn("last -x | grep reboot".split(" "))
            .then((out) => {
                const lines = out.split('\n');
                for (const l of lines) {
                    console.log(l.replace(/ {2,}/g, ' ').split(" "));
                }
            })
            .catch(ex => console.error(ex));
};
