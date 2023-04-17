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
import parseISO from 'date-fns/parseISO';

const INTERVAL = 5000;
export const bootTime = { };

bootTime.getRebootTime = function getRebootTime() {
    const time = new Set();
    return cockpit.spawn(["last", "--time-format=iso", "reboot"])
            .then((out) => {
                const lines = out.split('\n');
                for (let l of lines) {
                    l = l.replace(/ {2,}/g, " ");
                    const startTime = parseISO(l.split(" ")[4]);
                    const startTime_hour = new Date(startTime.getTime());

                    if (!(startTime_hour instanceof Date && isFinite(startTime_hour)))
                        continue;

                    const startHour = startTime_hour;
                    startHour.setMinutes(0);
                    startHour.setSeconds(0);
                    const startTime_hour_index = Math.floor((startTime.getTime() - startHour.getTime()) / INTERVAL);

                    time.add({
                        startTime,
                        startHour,
                        current_hour: startHour.getTime(),
                        hour_index: startTime_hour_index
                    });
                }
                return time;
            })
            .catch(ex => console.error(ex));
};
